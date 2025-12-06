import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { UploadView } from './components/UploadView';
import { RoadmapView } from './components/RoadmapView';
import { QuizView } from './components/QuizView';
import { AnalyticsView } from './components/AnalyticsView';
import { LoginView } from './components/LoginView';
import { BootSequence } from './components/BootSequence';
import { ViewState, UploadedFile, StudySession, Quiz, AnalyticsData, ExamDetails, GeneratedSet } from './types';
import { generateQuizFromContent, generateSmartRoadmap } from './services/geminiService';

type AppPhase = 'LOGIN' | 'BOOTING' | 'APP';

const App: React.FC = () => {
  const [phase, setPhase] = useState<AppPhase>('LOGIN');
  const [user, setUser] = useState<string>('');
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.DASHBOARD);
  const [loading, setLoading] = useState(false);

  // --- MOCK STATE ---
  const [examInfo, setExamInfo] = useState<ExamDetails>({
    id: 'exam-1',
    name: 'Calculus Final',
    date: '2025-01-15', 
    targetScore: 90,
    totalMarks: 100
  });

  const [uploads, setUploads] = useState<UploadedFile[]>([
    { id: '1', name: 'Calculus_Ch1_Limits.pdf', type: 'application/pdf', content: '...', date: new Date().toISOString(), status: 'ready', topics: ['Limits', 'Continuity'] },
    { id: '2', name: 'Differentiation_Rules.docx', type: 'application/vnd', content: '...', date: new Date(Date.now() - 86400000).toISOString(), status: 'ready', topics: ['Power Rule', 'Chain Rule'] },
    { id: '3', name: 'Integration_Techniques.pdf', type: 'application/pdf', content: '...', date: new Date(Date.now() - 172800000).toISOString(), status: 'ready', topics: ['Integration by Parts'] }
  ]);
  
  // History of generated items
  const [generatedHistory, setGeneratedHistory] = useState<GeneratedSet[]>([]);

  const [sessions, setSessions] = useState<StudySession[]>([
    { id: '1', title: 'Limits & Continuity Deep Dive', topic: 'Calculus', date: new Date().toISOString(), durationMinutes: 45, type: 'STUDY', status: 'PENDING', description: 'Review Chapter 1 notes and solve 5 basic problems.' },
    { id: '2', title: 'Differentiation Practice', topic: 'Calculus', date: new Date(Date.now() + 86400000).toISOString(), durationMinutes: 60, type: 'PRACTICE', status: 'PENDING', description: 'Focus on Chain rule application problems.' },
    { id: '3', title: 'Weekend Mock Test #1', topic: 'Calculus', date: new Date(Date.now() + 172800000).toISOString(), durationMinutes: 90, type: 'MOCK_TEST', status: 'PENDING', description: 'Simulate exam conditions. No formula sheets.' }
  ]);

  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  
  const [analytics] = useState<AnalyticsData[]>([
    { topic: 'Limits', mastery: 92, hoursStudied: 12 },
    { topic: 'Differentiation', mastery: 78, hoursStudied: 15 },
    { topic: 'Integration', mastery: 45, hoursStudied: 4 }, 
    { topic: 'Applications', mastery: 60, hoursStudied: 6 },
  ]);

  // --- HANDLERS ---
 const handleLogin = (username: string, userData?: any) => {
  setUser(username);
  if (userData) {
    // Store Google user data
    localStorage.setItem('eduhub_user', JSON.stringify(userData));
  }
  setPhase('BOOTING');
};
  const handleInstantFlashcards = async () => {
    if (uploads.length === 0) {
      alert('Please upload study materials first!');
      return;
    }
    
    setLoading(true);
    const latestUpload = uploads[0];
    
    if (latestUpload.status === 'error') {
      alert('Cannot generate flashcards from invalid study material.');
      setLoading(false);
      return;
    }
    
    // Generate flashcards using the FLASHCARD mode
    const flashcards = await generateQuestionBank(latestUpload.content, 'FLASHCARD');
    
    if (flashcards.length > 0) {
      const newSet: GeneratedSet = {
        id: crypto.randomUUID(),
        type: 'FLASHCARD',
        title: 'Instant Flashcard Set',
        date: new Date().toISOString(),
        items: flashcards,
        sourceFileName: latestUpload.name
      };
      
      handleAddToHistory(newSet);
      
      // Switch to uploads view to see the result
      setCurrentView(ViewState.UPLOADS);
      alert(`✨ Created ${flashcards.length} flashcards! Check the History tab in Question Forge.`);
    } else {
      alert('Failed to generate flashcards. Please try again.');
    }
    
    setLoading(false);
  };

  const handleBootComplete = () => {
    setPhase('APP');
  };

  const handleLogout = () => {
    setPhase('LOGIN');
    setUser('');
    setCurrentView(ViewState.DASHBOARD);
  };

  const handleUpload = (file: UploadedFile) => {
    setUploads([file, ...uploads]);
  };
  
  const handleAddToHistory = (set: GeneratedSet) => {
      setGeneratedHistory([set, ...generatedHistory]);
  };

  const handleGenerateQuiz = async () => {
    if (uploads.length === 0) {
      alert('Please upload some study material first!');
      return;
    }
    setLoading(true);
    
    // Use the most recent upload
    const latestUpload = uploads[0];
    
    if (latestUpload.status === 'error') {
      alert('Cannot generate quiz from invalid study material.');
      setLoading(false);
      return;
    }
    
    const quiz = await generateQuizFromContent(latestUpload.content, latestUpload.name);
    if (quiz) {
        setQuizzes([quiz, ...quizzes]);
        // Auto-switch to quiz view
        setCurrentView(ViewState.QUIZ);
    } else {
      alert('Failed to generate quiz. Please try again.');
    }
    setLoading(false);
  };
  const updateAnalyticsFromUploads = () => {
    // Generate analytics based on uploaded files
    const allTopics = uploads.flatMap(u => u.topics).filter(Boolean);
    const uniqueTopics = [...new Set(allTopics)];
    
    // Create mock analytics for demonstration
    const newAnalytics = uniqueTopics.slice(0, 6).map(topic => ({
      topic,
      mastery: Math.floor(Math.random() * 40) + 40, // Random between 40-80
      hoursStudied: Math.floor(Math.random() * 10) + 2
    }));
    
    if (newAnalytics.length > 0) {
      // Note: In a real app, you'd update state here
      // For now, we'll keep the existing analytics
      console.log('Analytics would be updated with:', newAnalytics);
    }
  };


  const handleGenerateRoadmap = async () => {
    if (uploads.length === 0) {
      alert('Please upload study materials first!');
      return;
    }
    
    setLoading(true);
    const topics = uploads.flatMap(u => u.topics).filter(Boolean);
    const weakAreas = analytics.filter(a => a.mastery < 60).map(a => a.topic);
    
    if (topics.length === 0) {
      alert('No valid topics found in uploaded materials.');
      setLoading(false);
      return;
    }
    
    const newSessions = await generateSmartRoadmap(
        topics, 
        examInfo.name, 
        examInfo.date, 
        new Date().toISOString().split('T')[0],
        weakAreas
    );

    if (newSessions.length > 0) {
        setSessions(newSessions);
        // Update analytics based on uploaded topics
        updateAnalyticsFromUploads();
    }
    setLoading(false);
  };

  const daysUntilExam = Math.ceil((new Date(examInfo.date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

  const renderContent = () => {
    switch (currentView) {
      case ViewState.DASHBOARD:
        return <Dashboard sessions={sessions} analytics={analytics} recentUploads={uploads} examName={examInfo.name} daysUntilExam={daysUntilExam} username={user} onInstantFlashcards={handleInstantFlashcards} loading={loading} />;
      case ViewState.UPLOADS:
        return <UploadView files={uploads} onUpload={handleUpload} history={generatedHistory} onAddToHistory={handleAddToHistory} />;
      case ViewState.ROADMAP:
        return <RoadmapView sessions={sessions} generatePlan={handleGenerateRoadmap} loading={loading} />;
      case ViewState.QUIZ:
        return <QuizView quizzes={quizzes} onCreateQuiz={handleGenerateQuiz} loading={loading} />;
      case ViewState.ANALYTICS:
        return <AnalyticsView data={analytics} />;
      default:
        return <Dashboard sessions={sessions} analytics={analytics} recentUploads={uploads} examName={examInfo.name} daysUntilExam={daysUntilExam} username={user} />;
    }
  };

  // Generate random stars for background
  const [stars, setStars] = useState<{id: number, top: string, left: string, delay: string, duration: string}[]>([]);
  useEffect(() => {
    const newStars = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 5}s`,
      duration: `${3 + Math.random() * 4}s`,
      size: `${1 + Math.random() * 2}px`
    }));
    setStars(newStars as any);
  }, []);

  return (
    <div className="min-h-screen relative overflow-x-hidden bg-void selection:bg-brand-indigo/30">
      
      {/* --- BACKGROUND ANIMATIONS (PERSISTENT) --- */}
      <div className="bg-grid-container">
        <div className="bg-grid"></div>
      </div>

      {stars.map(star => (
        <div 
          key={star.id} 
          className="star animate-twinkle"
          style={{
            top: star.top, 
            left: star.left, 
            width: (star as any).size,
            height: (star as any).size,
            animationDelay: star.delay,
            animationDuration: star.duration
          }}
        ></div>
      ))}
      
      <div className="aurora-blob w-[500px] h-[500px] bg-brand-violet/20 top-[-100px] left-[10%] animate-pulse-slow"></div>
      <div className="aurora-blob w-[400px] h-[400px] bg-brand-indigo/20 bottom-[-100px] right-[10%] animate-float" style={{animationDelay: '-2s'}}></div>
      
      {/* --- PHASE RENDERING --- */}

      {phase === 'LOGIN' && (
         <LoginView onLogin={handleLogin} />
      )}

      {phase === 'BOOTING' && (
         <BootSequence onComplete={handleBootComplete} />
      )}

      {phase === 'APP' && (
        <>
            <Sidebar currentView={currentView} setView={setCurrentView} user={user} onLogout={handleLogout} />
            <main className="pt-24 px-4 md:px-8 pb-8 transition-all duration-300 relative z-10">
                {renderContent()}
            </main>
        </>
      )}

    </div>
  );
};

export default App;
