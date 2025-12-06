import { useAuth } from '../contexts/AuthContext';

// At the top of component:
const { user: authUser, logout: authLogout } = useAuth();

// In the User Profile Section, replace the User icon with:
<div className="relative group">
  <button className="w-9 h-9 rounded-full bg-gradient-to-tr from-gray-800 to-gray-700 border border-white/10 flex items-center justify-center text-gray-300 hover:text-white hover:border-brand-primary/50 transition-all shadow-lg overflow-hidden">
    {authUser?.picture ? (
      <img src={authUser.picture} alt={authUser.name} className="w-full h-full object-cover" />
    ) : (
      <User size={16} />
    )}
  </button>
  
  {/* Dropdown */}
  {onLogout && (
    <div className="absolute top-full right-0 mt-2 w-48 py-2 bg-black/90 backdrop-blur-xl border border-white/10 rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-2 group-hover:translate-y-0">
      {authUser && (
        <div className="px-4 py-2 border-b border-white/10 mb-1">
          <div className="text-xs text-white font-medium truncate">{authUser.name}</div>
          <div className="text-[10px] text-white/40 truncate">{authUser.email}</div>
        </div>
      )}
      <button 
        onClick={() => {
          authLogout();
          onLogout();
        }}
        className="w-full px-4 py-2 text-left text-xs text-red-400 hover:bg-white/5 flex items-center gap-2"
      >
        <LogOut size={12} />
        SIGN OUT
      </button>
    </div>
  )}
</div>
