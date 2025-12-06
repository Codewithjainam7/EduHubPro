import React, { useState } from 'react';
import { Layers, ArrowRight, Shield, Mail, Lock, Github, Building2, ScanFace } from 'lucide-react';

interface LoginViewProps {
  onLogin: (username: string) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
  const [mode, setMode] = useState<'GUEST' | 'PORTAL'>('GUEST');
  const [codename, setCodename] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGuestLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (codename.trim()) {
      onLogin(codename);
    }
  };

  const handlePortalLogin = async (provider: string) => {
    setLoading(true);
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    let userIdentity = '';
    if (provider === 'EMAIL') userIdentity = email.split('@')[0] || 'Student_User';
    else if (provider === 'GOOGLE') userIdentity = 'Google_Student';
    else if (provider === 'GITHUB') userIdentity = 'Dev_Cadet';
    else if (provider === 'MICROSOFT') userIdentity = 'Office_User';
    else if (provider === 'SSO') userIdentity = 'Uni_Member';
    
    onLogin(userIdentity);
  };

  return (
    <div className="h-screen w-full flex items-center justify-center p-4 relative z-50 overflow-hidden">
       
       {/* iOS 26 Style Glass Modal */}
       <div className="w-full max-w-[380px] relative">
            {/* Glow behind modal */}
            <div className="absolute inset-0 bg-brand-primary/20 blur-[60px] rounded-full scale-110 opacity-50 pointer-events-none"></div>

            <div className="relative bg-black/40 backdrop-blur-3xl border border-white/10 rounded-[44px] overflow-hidden shadow-2xl ring-1 ring-white/5 p-8 flex flex-col gap-6 animate-slide-up">
                
                {/* Header / Logo */}
                <div className="flex flex-col items-center gap-4 pt-2">
                    {/* Glass Icon Box */}
                    <div className="w-20 h-20 rounded-[24px] bg-gradient-to-br from-white/10 to-white/5 border border-white/20 flex items-center justify-center shadow-lg relative group overflow-hidden">
                         <div className="absolute inset-0 bg-gradient-to-tr from-brand-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                         <Layers size={32} className="text-white relative z-10 drop-shadow-md" />
                         {/* Shine */}
                         <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/10 to-transparent"></div>
                    </div>
                    
                    <div className="text-center">
                         <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60 tracking-tight">
                            EduHub<span className="text-brand-primary font-normal">Pro</span>
                         </h1>
                         <p className="text-[10px] text-white/40 font-medium uppercase tracking-[0.3em] mt-1">Student Portal</p>
                    </div>
                </div>

                {/* Segmented Control */}
                <div className="bg-black/30 p-1 rounded-full flex relative h-10">
                     <div 
                        className={`absolute top-1 bottom-1 rounded-full bg-white/10 border border-white/5 shadow-sm transition-all duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)]`}
                        style={{
                            left: mode === 'GUEST' ? '0.25rem' : '50%',
                            width: 'calc(50% - 0.25rem)'
                        }}
                     ></div>
                     <button 
                        onClick={() => setMode('GUEST')}
                        className={`flex-1 text-[10px] font-bold uppercase tracking-wider relative z-10 transition-colors ${mode === 'GUEST' ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
                     >
                        Guest
                     </button>
                     <button 
                        onClick={() => setMode('PORTAL')}
                        className={`flex-1 text-[10px] font-bold uppercase tracking-wider relative z-10 transition-colors ${mode === 'PORTAL' ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
                     >
                        Student ID
                     </button>
                </div>

                {/* Content */}
                <div className="min-h-[220px] flex flex-col justify-center">
                    {mode === 'GUEST' ? (
                        <div className="space-y-6 animate-fade-in">
                            <div className="space-y-4">
                                <div className="relative group">
                                     <div className="absolute inset-y-0 left-4 flex items-center text-gray-500 group-focus-within:text-brand-primary transition-colors pointer-events-none">
                                        <ScanFace size={20} />
                                     </div>
                                     <input 
                                        type="text" 
                                        value={codename}
                                        onChange={(e) => setCodename(e.target.value)}
                                        placeholder="ENTER NAME"
                                        className="w-full bg-white/5 border border-white/10 focus:border-brand-primary/50 rounded-2xl py-4 pl-12 pr-4 text-center text-white text-sm placeholder-gray-600 font-mono tracking-widest uppercase focus:outline-none focus:bg-brand-primary/5 transition-all shadow-inner"
                                        autoFocus
                                     />
                                </div>
                                <p className="text-center text-[10px] text-gray-500 leading-relaxed px-4">
                                    Guest Mode: Data is stored locally and clears upon exit.
                                </p>
                            </div>
                            
                            <button 
                                onClick={handleGuestLogin}
                                disabled={!codename.trim()}
                                className="w-full bg-gradient-to-r from-brand-indigo to-brand-violet hover:brightness-110 text-white font-bold py-4 rounded-2xl transition-all shadow-[0_0_20px_rgba(99,102,241,0.4)] disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2 text-xs uppercase tracking-widest active:scale-[0.98]"
                            >
                                <span>Start Session</span>
                                <ArrowRight size={14} />
                            </button>
                        </div>
                    ) : (
                         <div className="space-y-4 animate-fade-in">
                             {/* Inputs */}
                             <div className="space-y-3">
                                <div className="relative group">
                                    <input 
                                        type="email" 
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Student Email"
                                        className="w-full bg-white/5 border border-white/10 focus:border-brand-primary/50 rounded-2xl py-3.5 px-4 text-white text-sm placeholder-gray-600 focus:outline-none focus:bg-brand-primary/5 transition-all shadow-inner pl-10"
                                    />
                                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
                                        <Mail size={16} />
                                    </div>
                                </div>
                                <div className="relative group">
                                    <input 
                                        type="password" 
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Password"
                                        className="w-full bg-white/5 border border-white/10 focus:border-brand-primary/50 rounded-2xl py-3.5 px-4 text-white text-sm placeholder-gray-600 focus:outline-none focus:bg-brand-primary/5 transition-all shadow-inner pl-10"
                                    />
                                     <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
                                        <Lock size={16} />
                                    </div>
                                </div>
                             </div>

                             {/* Action */}
                             <button 
                                onClick={() => handlePortalLogin('EMAIL')}
                                disabled={!email || !password || loading}
                                className="w-full bg-white text-black hover:bg-gray-100 font-bold py-3.5 rounded-2xl transition-all shadow-[0_0_20px_rgba(255,255,255,0.15)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-xs uppercase tracking-widest active:scale-[0.98]"
                             >
                                {loading ? 'Verifying...' : 'Login'}
                             </button>

                             {/* Divider */}
                             <div className="flex items-center gap-4 py-1">
                                <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent flex-1"></div>
                                <span className="text-[9px] uppercase tracking-widest text-white/30">Or Connect</span>
                                <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent flex-1"></div>
                             </div>

                             {/* Social Row */}
                             <div className="flex gap-3 justify-center">
                                 <SocialButton onClick={() => handlePortalLogin('GOOGLE')}>
                                    <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#fff" d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"/></svg>
                                 </SocialButton>
                                 <SocialButton onClick={() => handlePortalLogin('GITHUB')}>
                                     <Github className="w-5 h-5 text-white" />
                                 </SocialButton>
                                 <SocialButton onClick={() => handlePortalLogin('SSO')}>
                                     <Building2 className="w-5 h-5 text-white" />
                                 </SocialButton>
                             </div>
                         </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between text-[10px] text-white/20 font-medium uppercase tracking-widest pt-1 px-1">
                    <span className="flex items-center gap-1.5"><Shield size={10} /> Encrypted Session</span>
                    <span>v2.5.0</span>
                </div>
            </div>
       </div>
    </div>
  );
};

const SocialButton: React.FC<{onClick: () => void, children: React.ReactNode}> = ({onClick, children}) => (
    <button onClick={onClick} className="w-12 h-12 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 flex items-center justify-center transition-all hover:scale-105 active:scale-95 group">
        <div className="opacity-70 group-hover:opacity-100 transition-opacity">
            {children}
        </div>
    </button>
)