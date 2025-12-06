import React from 'react';
import { GlassCard } from './ui/GlassCard';
import { StudySession, UploadedFile, AnalyticsData } from '../types';
import { 
  Calendar, Clock, AlertCircle, Zap, Target, Activity, 
  Cpu, Database, ShieldCheck, ChevronRight, Play, MoreHorizontal 
} from 'lucide-react';

interface DashboardProps {
  sessions: StudySession[];
  analytics: AnalyticsData[];
  recentUploads: UploadedFile[];
  examName: string;
  daysUntilExam: number;
  username?: string;
}

export const Dashboard: React.FC<DashboardProps> = ({ sessions, analytics, recentUploads, examName, daysUntilExam, username = 'Alex_Dev' }) => {
  const nextSession = sessions.find(s => s.status === 'PENDING');
  
  const overallMastery = analytics.length > 0 
    ? Math.round(analytics.reduce((acc, curr) => acc + curr.mastery, 0) / analytics.length)
    : 0;

  return (
    <div className="max-w-[1600px] mx-auto pt-4 pb-12 animate-fade-in space-y-8">
      
      {/* Header Section */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end px-2 mb-2 gap-4">
        <div>
           <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60 tracking-tight mb-2">
             Dashboard
           </h1>
           <div className="flex items-center gap-2">
             <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md flex items-center gap-2">
               <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)] animate-pulse"></div>
               <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest">Online</span>
             </div>
             <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
               <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest">Student</span>
             </div>
           </div>
        </div>
        
        {/* Date/Time Widget */}
        <div className="hidden md:flex flex-col items-end">
           <div className="px-5 py-2 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md text-right">
              <div className="text-2xl font-bold text-white tracking-tight leading-none">
                {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </div>
              <div className="text-[10px] text-white/40 font-bold uppercase tracking-widest mt-0.5">
                {new Date().toLocaleDateString(undefined, {weekday: 'short', month: 'short', day: 'numeric'})}
              </div>
           </div>
        </div>
      </header>

      {/* BENTO GRID LAYOUT */}
      <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-6 h-auto lg:h-[580px]">
        
        {/* 1. HERO GAUGE (Large Square) */}
        <div className="md:col-span-3 lg:col-span-4 h-full">
            <GlassCard className="h-full flex flex-col items-center justify-center relative group overflow-hidden min-h-[400px] md:min-h-0">
                {/* Background Ambient Glow */}
                <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-gradient-to-b from-brand-indigo/10 to-transparent rounded-full blur-[80px] opacity-50 group-hover:opacity-80 transition-opacity duration-1000"></div>

                <div className="absolute top-6 left-6 right-6 flex justify-between items-start z-10">
                    <div className="flex flex-col">
                        <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Knowledge Mastery</span>
                        <span className="text-lg font-bold text-white">Overall Score</span>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                        <Activity size={14} className="text-brand-indigo" />
                    </div>
                </div>
                
                {/* Modern Gauge */}
                <div className="relative w-64 h-64 mt-4">
                    <svg className="w-full h-full transform -rotate-90">
                        {/* Track */}
                        <circle cx="50%" cy="50%" r="42%" stroke="rgba(255,255,255,0.05)" strokeWidth="16" fill="none" strokeLinecap="round" />
                        {/* Fill */}
                        <circle 
                          cx="50%" cy="50%" r="42%" 
                          stroke="url(#gradient-gauge)" 
                          strokeWidth="16" 
                          fill="none" 
                          strokeDasharray={`${overallMastery * 2.64} 1000`} 
                          strokeLinecap="round"
                          className="filter drop-shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all duration-1000 ease-out"
                        />
                        <defs>
                            <linearGradient id="gradient-gauge" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#3b82f6" />
                                <stop offset="100%" stopColor="#06b6d4" />
                            </linearGradient>
                        </defs>
                    </svg>
                    
                    {/* Inner Text Content */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-white to-white/50 tracking-tighter tabular-nums">
                           {overallMastery}
                        </span>
                        <span className="text-xs text-brand-indigo font-bold uppercase tracking-widest mt-1 bg-brand-indigo/10 px-2 py-0.5 rounded-md border border-brand-indigo/20">On Track</span>
                    </div>
                </div>

                <div className="absolute bottom-6 w-full px-8 flex justify-between text-[10px] font-bold text-white/30 uppercase tracking-widest">
                    <span>Low</span>
                    <span>High</span>
                </div>
            </GlassCard>
        </div>

        {/* 2. CENTER STACK */}
        <div className="md:col-span-3 lg:col-span-5 flex flex-col gap-6 h-full">
            {/* Countdown Pill */}
            <GlassCard className="flex-none py-5 px-6 flex items-center justify-between bg-gradient-to-r from-brand-rose/10 to-transparent border-brand-rose/20" tiltEnabled={false}>
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-brand-rose/10 flex items-center justify-center border border-brand-rose/20 shadow-[0_0_15px_rgba(244,63,94,0.2)]">
                        <AlertCircle className="text-brand-rose" size={20} />
                    </div>
                    <div>
                        <div className="text-[10px] font-bold text-brand-rose uppercase tracking-widest mb-0.5">Next Exam</div>
                        <div className="text-sm font-semibold text-white">{examName}</div>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-3xl font-bold text-white tabular-nums leading-none">{daysUntilExam}</div>
                    <div className="text-[9px] text-white/40 uppercase tracking-widest font-bold mt-1">Days Left</div>
                </div>
            </GlassCard>

            {/* Current Task Widget */}
            <GlassCard className="flex-1 flex flex-col relative group min-h-[250px] md:min-h-0">
                 {/* Decorative background blob */}
                 <div className="absolute top-0 right-0 w-64 h-64 bg-brand-emerald/10 rounded-full blur-[80px] pointer-events-none opacity-50"></div>

                 <div className="relative z-10 flex flex-col h-full justify-between">
                     <div>
                        <div className="flex justify-between items-start mb-6">
                             <div className="flex items-center gap-2 bg-brand-emerald/10 border border-brand-emerald/20 rounded-lg px-2 py-1 w-fit">
                                <div className="w-1.5 h-1.5 rounded-full bg-brand-emerald animate-pulse"></div>
                                <span className="text-[9px] font-bold text-brand-emerald uppercase tracking-widest">Current Task</span>
                            </div>
                            <button className="text-white/40 hover:text-white transition-colors">
                                <MoreHorizontal size={20} />
                            </button>
                        </div>
                        
                        <h2 className="text-2xl md:text-3xl font-bold text-white leading-tight max-w-sm mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-brand-emerald transition-all duration-300">
                            {nextSession ? nextSession.title : 'All Caught Up'}
                        </h2>
                        <p className="text-sm text-white/50">{nextSession?.description || 'No active study sessions scheduled.'}</p>
                     </div>

                     <div className="flex items-end justify-between mt-4">
                         <div className="flex gap-6">
                             <div>
                                 <p className="text-[9px] text-white/30 uppercase tracking-widest font-bold mb-1">Duration</p>
                                 <p className="text-lg font-mono text-white/90">{nextSession?.durationMinutes || 0}m</p>
                             </div>
                             <div>
                                 <p className="text-[9px] text-white/30 uppercase tracking-widest font-bold mb-1">Topic</p>
                                 <p className="text-lg font-mono text-white/90">{nextSession?.topic || 'N/A'}</p>
                             </div>
                         </div>
                         <button className="w-14 h-14 rounded-full bg-white text-black flex items-center justify-center hover:scale-110 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] transition-all active:scale-95">
                             <Play size={24} fill="currentColor" className="ml-1" />
                         </button>
                     </div>
                 </div>
            </GlassCard>
        </div>

        {/* 3. METRIC STACK (Vertical Widgets) */}
        <div className="md:col-span-6 lg:col-span-3 flex flex-col md:flex-row lg:flex-col gap-6 h-full">
            
            {/* Metric 1 - XP */}
            <GlassCard className="flex-1 flex flex-col justify-between p-5 relative overflow-hidden bg-gradient-to-br from-white/[0.03] to-white/[0.01] min-h-[140px] md:min-h-0">
                <div className="flex justify-between items-start">
                    <div className="w-8 h-8 rounded-lg bg-brand-violet/10 flex items-center justify-center text-brand-violet border border-brand-violet/20">
                        <Cpu size={16} />
                    </div>
                    <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest">Focus Score</span>
                </div>
                <div>
                    <div className="text-3xl font-bold text-white mb-1 tracking-tight">850</div>
                    <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
                         <div className="bg-brand-violet h-full w-[70%] shadow-[0_0_10px_rgba(6,182,212,0.5)]"></div>
                    </div>
                </div>
            </GlassCard>

            {/* Metric 2 - Retention */}
            <GlassCard className="flex-1 flex flex-col justify-between p-5 relative overflow-hidden bg-gradient-to-br from-white/[0.03] to-white/[0.01] min-h-[140px] md:min-h-0">
                <div className="flex justify-between items-start">
                    <div className="w-8 h-8 rounded-lg bg-brand-emerald/10 flex items-center justify-center text-brand-emerald border border-brand-emerald/20">
                        <ShieldCheck size={16} />
                    </div>
                    <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest">Retention</span>
                </div>
                <div>
                    <div className="text-3xl font-bold text-white mb-1 tracking-tight">98%</div>
                    <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
                         <div className="bg-brand-emerald h-full w-[98%] shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                    </div>
                </div>
            </GlassCard>

            {/* Metric 3 - Nodes */}
            <GlassCard className="flex-1 flex flex-col justify-between p-5 relative overflow-hidden bg-gradient-to-br from-white/[0.03] to-white/[0.01] min-h-[140px] md:min-h-0">
                <div className="flex justify-between items-start">
                    <div className="w-8 h-8 rounded-lg bg-brand-indigo/10 flex items-center justify-center text-brand-indigo border border-brand-indigo/20">
                        <Database size={16} />
                    </div>
                    <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest">Resources</span>
                </div>
                <div>
                    <div className="text-3xl font-bold text-white mb-1 tracking-tight">{recentUploads.length}</div>
                    <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
                         <div className="bg-brand-indigo h-full w-[40%] shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                    </div>
                </div>
            </GlassCard>

        </div>

      </div>

      {/* SECONDARY ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
           {/* Timeline - Styled like Notifications */}
           <GlassCard className="col-span-2 min-h-[240px] flex flex-col" noPadding>
               <div className="flex justify-between items-center p-6 border-b border-white/[0.05]">
                   <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
                       <Activity size={16} className="text-brand-indigo" /> 
                       Upcoming Sessions
                   </h3>
                   <button className="text-[10px] bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-full text-white/70 font-bold transition-colors border border-white/10">View All</button>
               </div>
               
               <div className="flex-1 overflow-hidden p-2">
                   {sessions.slice(0,3).map((session, i) => (
                       <div key={session.id} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-white/[0.03] transition-colors group cursor-pointer border border-transparent hover:border-white/[0.05]">
                           <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex flex-col items-center justify-center text-center shadow-inner">
                               <div className="text-[9px] text-white/40 font-bold uppercase">{new Date(session.date).toLocaleString('default', {month:'short'})}</div>
                               <div className="text-lg font-bold text-white leading-none">{new Date(session.date).getDate()}</div>
                           </div>
                           
                           <div className="flex-1 min-w-0">
                               <div className="text-sm font-bold text-white truncate">{session.title}</div>
                               <div className="text-[11px] text-white/40 font-medium flex gap-2 items-center mt-0.5">
                                   <Clock size={10} />
                                   <span>{session.durationMinutes} min</span>
                                   <span className="w-0.5 h-0.5 rounded-full bg-white/30"></span>
                                   <span>{session.topic}</span>
                               </div>
                           </div>
                           
                           <div className={`
                                px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider shadow-sm
                                ${session.type === 'MOCK_TEST' ? 'bg-brand-rose/20 text-brand-rose border border-brand-rose/20' : 'bg-brand-indigo/20 text-brand-indigo border border-brand-indigo/20'}
                           `}>
                               {session.type}
                           </div>
                       </div>
                   ))}
               </div>
           </GlassCard>

           {/* Quick Action - Large Control Center Button */}
           <GlassCard className="relative overflow-hidden group flex flex-col items-center justify-center text-center p-8 cursor-pointer hover:border-white/20 transition-all">
               <div className="absolute inset-0 bg-gradient-to-t from-brand-indigo/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
               
               <div className="w-20 h-20 rounded-[28px] bg-gradient-to-br from-white/10 to-white/5 border border-white/20 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:shadow-[0_0_40px_rgba(255,255,255,0.15)] transition-all duration-500 shadow-2xl relative">
                   <Zap size={36} className="text-white relative z-10" fill="currentColor" />
                   <div className="absolute inset-0 bg-white/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
               </div>
               
               <h3 className="text-xl font-bold text-white mb-2">Instant Flashcards</h3>
               <p className="text-sm text-white/50 mb-6 max-w-[200px] leading-relaxed">Create a quick study set from your recent uploads.</p>
               
               <button className="w-full py-3.5 rounded-xl bg-white text-black font-bold text-xs uppercase tracking-widest hover:bg-gray-200 transition-colors shadow-lg active:scale-[0.98]">
                   Create Set
               </button>
           </GlassCard>
      </div>
    </div>
  );
};