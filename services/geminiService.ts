import { GoogleGenAI, Type, Schema } from "@google/genai";
import { Quiz, StudySession, GeneratedItem, GeneratorMode, DocumentAnalysis } from "../types";
import * as mammoth from "mammoth";  // DELETE THIS
const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

const modelId = "gemini-2.5-flash";

// Helper to clean JSON string from Markdown fences
const cleanJson = (text: string) => {
  return text.replace(/```json/g, '').replace(/```/g, '').trim();
};

// Helper to convert File to Base64
const fileToGenerativePart = async (file: File): Promise<{inlineData: {data: string, mimeType: string}}> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = (reader.result as string).split(',')[1];
      resolve({
        inlineData: {
          data: base64String,
          mimeType: file.type
        }
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const extractTextFromDocx = async (file: File): Promise<string> => {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value;
};

export const analyzeDocument = async (file: File): Promise<{ text: string, topics: string[], analysis: DocumentAnalysis } | { error: string } | null> => {
    if (!apiKey) return { error: "API Key is missing." };

    if (file.size > 50 * 1024 * 1024) {
        return { error: "Document size exceeds the 50MB limit." };
    }

    try {
        let textContent = "";
        let useTextMode = false;

        // Handle Word documents
        if (file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || 
            file.name.endsWith('.docx')) {
            textContent = await extractTextFromDocx(file);
            useTextMode = true;
        }
        // Handle plain text
        else if (file.type === "text/plain") {
            textContent = await file.text();
            useTextMode = true;
        }

        const prompt = `
            You are a strict Academic Content Filter and Analysis Engine.
            
            STEP 1: VALIDATION
            Determine if the ${useTextMode ? 'text' : 'document'} is valid educational study material.
            
            STRICTLY REJECT: menus, fiction, invoices, receipts, casual chat, random images.
            
            STEP 2: ANALYSIS (Only if Valid)
            If valid:
            1. ANALYZE the content
            2. IDENTIFY key concepts, definitions, formulas
            3. GENERATE summary and topics
        `;

        const schema: Schema = {
            type: Type.OBJECT,
            properties: {
                isStudyMaterial: { type: Type.BOOLEAN },
                rejectionReason: { type: Type.STRING },
                summary: { type: Type.STRING },
                topics: { type: Type.ARRAY, items: { type: Type.STRING } },
                keyConcepts: { type: Type.ARRAY, items: { type: Type.STRING } },
                definitions: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            term: { type: Type.STRING },
                            definition: { type: Type.STRING }
                        }
                    }
                },
                formulas: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["isStudyMaterial"]
        };

        let response;

        if (useTextMode) {
            // For Word/Text: Send text directly
            response = await ai.models.generateContent({
                model: modelId,
                contents: `${prompt}\n\nCONTENT:\n${textContent.substring(0, 50000)}`,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: schema
                }
            });
        } else {
            // For PDF/Images: Send file
            const filePart = await fileToGenerativePart(file);
            response = await ai.models.generateContent({
                model: modelId,
                contents: {
                    parts: [filePart, { text: prompt }]
                },
                config: {
                    responseMimeType: "application/json",
                    responseSchema: schema
                }
            });
        }

        const text = response.text;
        if (!text) return { error: "No response from AI service." };

        const data = JSON.parse(cleanJson(text));

        if (data.isStudyMaterial === false) {
            return { 
                error: data.rejectionReason || "Content detected as non-educational." 
            };
        }

        return {
            text: useTextMode ? textContent : (data.fullText || ""),
            topics: data.topics || [],
            analysis: {
                summary: data.summary || "No summary available.",
                keyConcepts: data.keyConcepts || [],
                definitions: data.definitions || [],
                formulas: data.formulas || []
            }
        };

    } catch (error: any) {
        console.error("Document Analysis Error:", error);
        return { error: "Failed to analyze document. Please try again." };
    }
};

export const generateQuizFromContent = async (content: string, title: string): Promise<Quiz | null> => {
  if (!apiKey) {
    console.error("API Key missing");
    return null;
  }

  const prompt = `
    You are an expert tutor. Create a personalized multiple-choice quiz based ONLY on the following study notes.
    Adapt the difficulty.
    Generate 5 high-quality questions.
    Notes: "${content.substring(0, 15000)}..."
  `;

  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      questions: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING },
            options: { type: Type.ARRAY, items: { type: Type.STRING } },
            correctAnswer: { type: Type.INTEGER, description: "Index of the correct option (0-3)" },
            explanation: { type: Type.STRING }
          },
          required: ["question", "options", "correctAnswer", "explanation"]
        }
      }
    },
    required: ["questions"]
  };

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
        temperature: 0.7,
      }
    });

    const text = response.text;
    if (!text) return null;

    const data = JSON.parse(cleanJson(text));
    
    return {
      id: crypto.randomUUID(),
      title: `Quiz: ${title}`,
      sourceFileId: 'generated',
      questions: data.questions.map((q: any, idx: number) => ({
        ...q,
        id: `q-${idx}`
      })),
      completed: false,
      createdAt: new Date().toISOString()
    };

  } catch (error) {
    console.error("Gemini Quiz Generation Error:", error);
    return null;
  }
};

export const generateSmartRoadmap = async (
  topics: string[], 
  examName: string,
  examDate: string, 
  currentDate: string,
  weakAreas: string[] = []
): Promise<StudySession[]> => {
  if (!apiKey) return [];

  const prompt = `
    I have an exam "${examName}" on ${examDate}. Today is ${currentDate}.
    My available study material covers these topics: ${topics.join(", ")}.
    My weak areas that need extra focus are: ${weakAreas.join(", ")}.
    
    Create a detailed, personalized study schedule (Roadmap) leading up to the exam.
    
    Rules:
    1. Break down topics into sessions.
    2. Include 'REVISION' sessions for weak areas (spaced repetition).
    3. Include 'MOCK_TEST' sessions on weekends.
    4. Prioritize weak areas early in the schedule.
    5. Ensure the day before the exam is 'REVISION' only.
    6. Return a JSON array of sessions.
    7. Provide a helpful description for each session.
  `;

  const schema: Schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING },
        topic: { type: Type.STRING },
        dayOffset: { type: Type.INTEGER, description: "Day number starting from 0 (today)" },
        durationMinutes: { type: Type.INTEGER },
        type: { type: Type.STRING, enum: ["STUDY", "PRACTICE", "QUIZ", "REVISION", "MOCK_TEST"] },
        description: { type: Type.STRING }
      },
      required: ["title", "topic", "dayOffset", "durationMinutes", "type", "description"]
    }
  };

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema
      }
    });

    const text = response.text;
    if (!text) return [];

    const data = JSON.parse(cleanJson(text));
    const today = new Date(currentDate);

    return data.map((session: any) => {
        const sessionDate = new Date(today);
        sessionDate.setDate(today.getDate() + session.dayOffset);
        sessionDate.setHours(18, 0, 0, 0); 

        return {
            id: crypto.randomUUID(),
            title: session.title,
            topic: session.topic,
            date: sessionDate.toISOString(),
            durationMinutes: session.durationMinutes,
            type: session.type,
            status: 'PENDING',
            description: session.description
        };
    });

  } catch (error) {
    console.error("Gemini Roadmap Generation Error:", error);
    return [];
  }
};

export const generateQuestionBank = async (
    content: string, 
    mode: GeneratorMode, 
    shortCount: number = 0, 
    longCount: number = 0
): Promise<GeneratedItem[]> => {
    if (!apiKey) {
        console.error("API Key missing");
        return [];
    }

    let prompt = "";
    // Customize prompt based on mode to ensure the model understands the content source
    const baseInstruction = `You are a strict exam generator. Use the provided CONTENT text to generate questions. Do not use outside knowledge.`;

    if (mode === 'MCQ') {
        prompt = `${baseInstruction} Generate 10 multiple choice questions. Include 4 options (A,B,C,D) and the correct answer/explanation. CONTENT: ${content.substring(0, 12000)}`;
    } else if (mode === 'FLASHCARD') {
        prompt = `${baseInstruction} Generate 10 high-quality flashcards. 'Question' is the front, 'Answer' is the back. CONTENT: ${content.substring(0, 12000)}`;
    } else if (mode === 'FILL_BLANK') {
        prompt = `${baseInstruction} Generate 10 fill-in-the-blank sentences. The 'question' is the sentence with a missing term (____). The 'answer' is the missing term. CONTENT: ${content.substring(0, 12000)}`;
    } else if (mode === 'QUESTION_BANK') {
        prompt = `${baseInstruction} Generate a formal exam paper. 
        Create exactly ${shortCount} Short Answer Questions (worth 3 marks) and ${longCount} Long Answer Questions (worth 6 marks).
        For Short Answers, provide a concise model answer.
        For Long Answers, provide a detailed step-by-step model answer.
        CONTENT: ${content.substring(0, 12000)}`;
    }

    const schema: Schema = {
        type: Type.OBJECT,
        properties: {
            items: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        question: { type: Type.STRING },
                        options: { type: Type.ARRAY, items: { type: Type.STRING } },
                        answer: { type: Type.STRING },
                        marks: { type: Type.INTEGER },
                        type: { type: Type.STRING }
                    },
                    required: ["question", "answer", "type"]
                }
            }
        }
    };

    try {
        const response = await ai.models.generateContent({
            model: modelId,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: schema,
                temperature: 0.5, // Lower temperature for more factual extraction
            }
        });
        
        const text = response.text || '{"items": []}';
        const data = JSON.parse(cleanJson(text));
        
        return data.items.map((item: any, idx: number) => ({
            ...item,
            id: `gen-${idx}-${Date.now()}`,
            // Normalize types
            type: mode === 'QUESTION_BANK' ? (item.marks === 3 ? 'SHORT_ANSWER' : 'LONG_ANSWER') : mode 
        }));
    } catch (e) {
        console.error("Question Bank Generation Error", e);
        return [];
    }
}

export const askDocumentQuestion = async (content: string, question: string): Promise<string> => {
    if (!apiKey) return "API Key missing.";

    const prompt = `
        You are an expert tutor. Answer the following question based ONLY on the provided study notes context.
        If the answer cannot be found in the notes, strictly state "I cannot find the answer in the provided document."
        Keep your explanation clear, concise, and academic.

        STUDY NOTES:
        "${content.substring(0, 30000)}..."

        USER QUESTION: "${question}"
    `;

    try {
        const response = await ai.models.generateContent({
            model: modelId,
            contents: prompt,
            config: {
                temperature: 0.7,
            }
        });

        return response.text || "I couldn't generate a response.";
    } catch (error) {
        console.error("Ask Document Error:", error);
        return "Sorry, I encountered an error analyzing your question.";
    }
}
