import React from 'react';
import { Sparkles, ShieldCheck, Zap, Camera, Wand2 } from 'lucide-react';

interface HeaderProps {
  onReset?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onReset }) => {
  return (
    <header id="app-header" className="sticky top-0 z-40 bg-neutral-950/95 backdrop-blur-md border-b border-neutral-850 px-3 py-2.5 transition-all w-full">
      <div className="flex items-center justify-between gap-2">
        {/* Logo & Brand */}
        <div 
          onClick={onReset}
          className="flex items-center gap-2.5 cursor-pointer group select-none min-w-0"
          title="EnhanceAI Photo Studio"
        >
          <div id="logo-icon" className="relative flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-rose-500 via-amber-500 to-red-600 p-0.5 shadow-md shadow-rose-500/20 group-hover:shadow-rose-500/30 transition-all overflow-hidden shrink-0">
            <img 
              src="/logo.jpg" 
              alt="EnhanceAI Logo" 
              className="w-full h-full object-cover rounded-[9px]" 
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-base sm:text-lg tracking-tight text-white font-serif">
                Enhance<span className="text-amber-400">AI</span>
              </span>
              <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-emerald-400 text-neutral-950 flex items-center gap-0.5 shadow-sm">
                <Sparkles className="w-2.5 h-2.5 fill-neutral-950 text-neutral-950" />
                8K
              </span>
            </div>
          </div>
        </div>

        {/* Right Action Tools: Zero Storage Badge */}
        <div className="flex items-center gap-1.5 bg-emerald-950/70 border border-emerald-500/30 px-2.5 py-1 rounded-full text-[11px] text-emerald-300 font-semibold shadow-inner shrink-0">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>RAM Only</span>
        </div>
      </div>
    </header>
  );
};

