import React, { useRef, useState } from 'react';
import React, { useRef, useState, useMemo } from 'react';
import { GlassCard } from './ui/GlassCard';
import { StudySession, UploadedFile, AnalyticsData } from '../types';
import { 
Calendar, Clock, AlertCircle, Zap, Target, Activity, 
  Cpu, Database, ShieldCheck, Play, MoreHorizontal, Upload, FileText, Loader2
  Cpu, Database, ShieldCheck, Play, MoreHorizontal, Upload, FileText, Loader2, Check, X
} from 'lucide-react';

interface DashboardProps {
@@ -32,11 +32,31 @@ export const Dashboard: React.FC<DashboardProps> = ({
const nextSession = sessions.find(s => s.status === 'PENDING');
const fileInputRef = useRef<HTMLInputElement>(null);
const [uploading, setUploading] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

const overallMastery = analytics.length > 0 
? Math.round(analytics.reduce((acc, curr) => acc + curr.mastery, 0) / analytics.length)
: 0;

  // Categorize files by subject using AI-detected topics
  const categorizedFiles = useMemo(() => {
    const categories: { [key: string]: UploadedFile[] } = {};
    
    recentUploads.forEach(file => {
      if (file.status === 'ready' && file.topics && file.topics.length > 0) {
        const mainTopic = file.topics[0];
        if (!categories[mainTopic]) {
          categories[mainTopic] = [];
        }
        categories[mainTopic].push(file);
      }
    });
    
    return categories;
  }, [recentUploads]);

const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
const file = e.target.files?.[0];
if (!file) return;
@@ -62,7 +82,10 @@ export const Dashboard: React.FC<DashboardProps> = ({
};

onUpload(newFile);
        alert(`✅ ${file.name} uploaded successfully!`);
        setToastMessage(`${file.name} uploaded successfully!`);
        setToastType('success');
        setShowSuccessToast(true);
        setTimeout(() => setShowSuccessToast(false), 3000);
} else {
const errorMsg = (result && 'error' in result) ? result.error : 'Upload failed';

@@ -83,20 +106,70 @@ export const Dashboard: React.FC<DashboardProps> = ({
};

onUpload(errorFile);
        alert(`❌ ${errorMsg}`);
        setToastMessage(errorMsg);
        setToastType('error');
        setShowSuccessToast(true);
        setTimeout(() => setShowSuccessToast(false), 3000);
}
} catch (error) {
console.error('Upload error:', error);
      alert('An error occurred during upload. Please try again.');
      setToastMessage('An error occurred during upload. Please try again.');
      setToastType('error');
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 3000);
}

setUploading(false);
if (fileInputRef.current) fileInputRef.current.value = '';
};

  const handleDeleteFile = (fileId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updatedFiles = recentUploads.filter(f => f.id !== fileId);
    localStorage.setItem('eduhub_uploads', JSON.stringify(updatedFiles));
    setToastMessage('Resource deleted successfully');
    setToastType('success');
    setShowSuccessToast(true);
    setTimeout(() => {
      setShowSuccessToast(false);
      window.location.reload();
    }, 2000);
  };

return (
<div className="max-w-[1600px] mx-auto pt-4 pb-12 animate-fade-in space-y-8">

      {/* Animated Toast Notification - Center of Screen */}
      {showSuccessToast && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center pointer-events-none">
          <div className="animate-scale-in pointer-events-auto">
            <div className="bg-black/90 backdrop-blur-2xl border border-white/20 rounded-3xl px-10 py-6 shadow-[0_0_60px_rgba(59,130,246,0.4)] min-w-[400px]">
              <div className="flex items-center gap-5">
                <div className={`w-14 h-14 rounded-full ${toastType === 'success' ? 'bg-brand-primary/20 border-brand-primary/40' : 'bg-red-500/20 border-red-500/40'} border-2 flex items-center justify-center animate-pulse`}>
                  {toastType === 'success' ? (
                    <Check size={28} className="text-brand-primary" strokeWidth={3} />
                  ) : (
                    <X size={28} className="text-red-400" strokeWidth={3} />
                  )}
                </div>
                <div className="flex-1">
                  <p className={`text-lg font-bold mb-2 ${toastType === 'success' ? 'text-white' : 'text-red-300'}`}>
                    {toastType === 'success' ? '✨ Success!' : '⚠️ Error'}
                  </p>
                  <p className="text-white/80 text-sm font-medium">{toastMessage}</p>
                  <div className="mt-3 h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${toastType === 'success' ? 'bg-gradient-to-r from-brand-primary to-brand-accent' : 'bg-gradient-to-r from-red-500 to-red-600'} animate-[shrink_3s_linear] shadow-[0_0_10px_rgba(59,130,246,0.5)]`}
                      style={{width: '100%'}}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
<header className="flex flex-col md:flex-row justify-between items-start md:items-end px-2 mb-2 gap-4">
<div>
<h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60 tracking-tight mb-2">
@@ -127,6 +200,7 @@ export const Dashboard: React.FC<DashboardProps> = ({

<div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-6 h-auto lg:h-[580px]">

        {/* Mastery Gauge */}
<div className="md:col-span-3 lg:col-span-4 h-full">
<GlassCard className="h-full flex flex-col items-center justify-center relative group overflow-hidden min-h-[400px] md:min-h-0">
<div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-gradient-to-b from-brand-indigo/10 to-transparent rounded-full blur-[80px] opacity-50 group-hover:opacity-80 transition-opacity duration-1000"></div>
@@ -176,6 +250,7 @@ export const Dashboard: React.FC<DashboardProps> = ({
</GlassCard>
</div>

        {/* Exam + Current Task */}
<div className="md:col-span-3 lg:col-span-5 flex flex-col gap-6 h-full">
<GlassCard className="flex-none py-5 px-6 flex items-center justify-between bg-gradient-to-r from-brand-rose/10 to-transparent border-brand-rose/20" tiltEnabled={false}>
<div className="flex items-center gap-4">
@@ -233,6 +308,7 @@ export const Dashboard: React.FC<DashboardProps> = ({
</GlassCard>
</div>

        {/* Stat Cards */}
<div className="md:col-span-6 lg:col-span-3 flex flex-col md:flex-row lg:flex-col gap-6 h-full">

<GlassCard className="flex-1 flex flex-col justify-between p-5 relative overflow-hidden bg-gradient-to-br from-white/[0.03] to-white/[0.01] min-h-[140px] md:min-h-0">
@@ -273,7 +349,7 @@ export const Dashboard: React.FC<DashboardProps> = ({
<span className="text-[9px] font-bold text-white/30 uppercase tracking-widest">Resources</span>
</div>
<div>
                    <div className="text-3xl font-bold text-white mb-1 tracking-tight">{recentUploads.length}</div>
                    <div className="text-3xl font-bold text-white mb-1 tracking-tight">{recentUploads.filter(f => f.status === 'ready').length}</div>
<div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
<div className="bg-brand-indigo h-full w-[40%] shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
</div>
@@ -284,7 +360,9 @@ export const Dashboard: React.FC<DashboardProps> = ({

</div>

      {/* Sessions + AI-Categorized Resources */}
<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
           {/* Sessions List */}
<GlassCard className="col-span-2 min-h-[240px] flex flex-col" noPadding>
<div className="flex justify-between items-center p-6 border-b border-white/[0.05]">
<h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
@@ -323,33 +401,78 @@ export const Dashboard: React.FC<DashboardProps> = ({
</div>
</GlassCard>

           <div onClick={() => !uploading && fileInputRef.current?.click()} className="relative overflow-hidden rounded-[32px] bg-black/20 backdrop-blur-3xl border border-white/[0.08] p-8 cursor-pointer hover:border-white/20 transition-all flex flex-col items-center justify-center text-center">
               <input 
                 ref={fileInputRef}
                 type="file"
                 className="hidden"
                 accept=".pdf,.txt,.doc,.docx,.jpg,.png,.pptx"
                 onChange={handleFileSelect}
                 disabled={uploading}
               />
           {/* AI-Categorized Study Resources Panel */}
           <GlassCard className="flex flex-col overflow-hidden" noPadding>
               <div className="flex justify-between items-center p-6 border-b border-white/[0.05]">
                   <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
                       <Database size={16} className="text-brand-indigo" /> 
                       Study Resources
                   </h3>
                   <span className="text-xs font-mono text-brand-indigo">{recentUploads.filter(f => f.status === 'ready').length}</span>
               </div>

               <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/20 flex items-center justify-center mb-6 transition-all duration-500 shadow-2xl">
                   {uploading ? (
                     <Loader2 size={28} className="text-white animate-spin" />
               <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4 max-h-[400px]">
                   {Object.keys(categorizedFiles).length === 0 ? (
                       <div className="flex flex-col items-center justify-center h-full text-center p-6">
                           <FileText size={32} className="text-white/20 mb-3" />
                           <p className="text-white/40 text-xs">No resources uploaded yet</p>
                           <p className="text-white/30 text-[10px] mt-1">Upload study materials to get started</p>
                           <button 
                             onClick={() => fileInputRef.current?.click()}
                             className="mt-4 px-4 py-2 bg-brand-primary/20 hover:bg-brand-primary/30 text-brand-primary border border-brand-primary/30 rounded-lg text-xs font-bold uppercase tracking-widest transition-all"
                           >
                             Upload Now
                           </button>
                           <input 
                             ref={fileInputRef}
                             type="file"
                             className="hidden"
                             accept=".pdf,.txt,.doc,.docx,.jpg,.png,.pptx"
                             onChange={handleFileSelect}
                             disabled={uploading}
                           />
                       </div>
) : (
                     <Upload size={28} className="text-white" />
                       Object.entries(categorizedFiles).map(([category, categoryFiles]) => (
                           <div key={category} className="space-y-2">
                               <div className="flex items-center justify-between px-2">
                                   <div className="text-[9px] font-bold text-brand-primary uppercase tracking-widest">
                                       {category}
                                   </div>
                                   <div className="text-[9px] text-white/30 font-mono">
                                       {categoryFiles.length} file{categoryFiles.length !== 1 ? 's' : ''}
                                   </div>
                               </div>
                               {categoryFiles.map(file => (
                                   <div 
                                       key={file.id}
                                       className="group relative p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.05] hover:border-brand-primary/30 transition-all cursor-pointer"
                                   >
                                       <div className="flex items-start gap-3">
                                           <div className="w-8 h-8 rounded-lg bg-brand-indigo/10 flex items-center justify-center shrink-0">
                                               <FileText size={14} className="text-brand-indigo" />
                                           </div>
                                           <div className="flex-1 min-w-0">
                                               <div className="text-xs font-bold text-white truncate">{file.name}</div>
                                               <div className="text-[9px] text-white/40 mt-0.5">{new Date(file.date).toLocaleDateString()}</div>
                                           </div>
                                       </div>
                                       
                                       {/* Delete Button on Hover */}
                                       <button 
                                           onClick={(e) => handleDeleteFile(file.id, e)}
                                           className="absolute top-2 right-2 w-7 h-7 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500/20 active:scale-95"
                                           title="Delete resource"
                                       >
                                           <X size={12} className="text-red-400" />
                                       </button>
                                   </div>
                               ))}
                           </div>
                       ))
)}
</div>
               
               <h3 className="text-lg font-bold text-white mb-2">Upload Study Material</h3>
               <p className="text-xs text-white/50 mb-6 max-w-[200px] leading-relaxed">
                 PDF, DOCX, PPTX, TXT or images
               </p>
               
               <div className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-xs uppercase tracking-widest hover:bg-white/10 transition-colors">
                 {uploading ? 'Uploading...' : 'Select File'}
               </div>
           </div>
           </GlassCard>
</div>
</div>
);
