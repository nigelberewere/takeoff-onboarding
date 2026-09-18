import React from 'react';
import { Truck, ShieldCheck, LogOut, RefreshCw, UserCheck } from 'lucide-react';
import { useOnboarding } from '../context/OnboardingContext';

export const Header: React.FC = () => {
  const { state, signOut, syncFromDatabase } = useOnboarding();

  return (
    <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center space-x-3 cursor-pointer select-none">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-amber-500 flex items-center justify-center shadow-glow text-white">
            <Truck className="w-6 h-6 transform -scale-x-100" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-display font-bold text-xl tracking-tight text-white">Take<span className="text-brand-500">OFF</span></span>
              <span className="bg-brand-500/10 text-brand-400 border border-brand-500/20 text-[10px] font-semibold px-1.5 py-0.5 rounded tracking-wider uppercase">Driver Ops</span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Fast-Track Courier Onboarding</p>
          </div>
        </div>

        {/* Right Session / Actions */}
        <div className="flex items-center space-x-3">
          {state.auth.sessionActive ? (
            <div className="flex items-center space-x-3 bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-full">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs text-slate-300 font-medium max-w-[120px] sm:max-w-[180px] truncate">
                  {state.auth.fullName || state.auth.email}
                </span>
              </div>
              <button
                type="button"
                onClick={() => syncFromDatabase()}
                title="Sync application state"
                className="text-slate-400 hover:text-white transition-colors p-1"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
              <div className="h-3.5 w-px bg-slate-700" />
              <button
                type="button"
                onClick={signOut}
                title="Sign out"
                className="text-slate-400 hover:text-rose-400 transition-colors p-1 flex items-center space-x-1"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline text-xs">Exit</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-1.5 text-xs text-slate-400 bg-slate-900/60 border border-slate-800 px-3 py-1.5 rounded-full">
              <ShieldCheck className="w-4 h-4 text-brand-500" />
              <span className="hidden sm:inline">256-Bit Encrypted Portal</span>
              <span className="sm:hidden">Secure</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
