import React from 'react';
import { Sparkles, ShieldCheck, Camera, Film } from 'lucide-react';

interface HeaderProps {
  onReset?: () => void;
  activeTab?: 'photo' | 'video';
  onTabChange?: (tab: 'photo' | 'video') => void;
  savedMoviesCount?: number;
  onOpenSavedMovies?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onReset,
  activeTab = 'photo',
  onTabChange,
  savedMoviesCount = 0,
  onOpenSavedMovies,
}) => {
  return (
    <header id="app-header" className="sticky top-0 z-40 bg-neutral-950/90 backdrop-blur-md border-b border-neutral-800/80 px-4 lg:px-8 py-3 transition-all">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Logo & Brand */}
        <div 
          onClick={onReset}
          className="flex items-center gap-3 cursor-pointer group select-none"
          title="EnhanceAI Studio"
        >
          <div id="logo-icon" className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 via-rose-600 to-purple-700 p-0.5 shadow-lg shadow-amber-500/10 group-hover:shadow-amber-500/20 transition-all">
            <div className="w-full h-full bg-neutral-950 rounded-[10px] flex items-center justify-center">
              <Camera className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg md:text-xl tracking-tight text-white font-serif">
                Enhance<span className="text-amber-400">AI</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-emerald-500 text-neutral-950 flex items-center gap-1 shadow-sm">
                <Sparkles className="w-2.5 h-2.5 fill-neutral-950 text-neutral-950" />
                8K Studio
              </span>
            </div>
            <p className="text-xs text-neutral-400 hidden sm:block">
              Remini Ultra HD 8K Image Enhancer & AI Video Studio
            </p>
          </div>
        </div>

        {/* Tab Selector Navigation */}
        {onTabChange && (
          <div className="flex items-center gap-1 bg-neutral-900/90 p-1 rounded-xl border border-neutral-800">
            <button
              type="button"
              onClick={() => onTabChange('photo')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'photo'
                  ? 'bg-gradient-to-r from-amber-500 to-emerald-500 text-neutral-950 shadow-md font-black'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              <span>📸 8K Photo Studio</span>
            </button>
            <button
              type="button"
              onClick={() => onTabChange('video')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'video'
                  ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-neutral-950 shadow-md font-black'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Film className="w-3.5 h-3.5" />
              <span>🎬 AI Video Studio</span>
            </button>
          </div>
        )}

        {/* Right Action Tools */}
        <div className="flex items-center gap-2 sm:gap-3">
          {onOpenSavedMovies && savedMoviesCount > 0 && (
            <button
              type="button"
              onClick={onOpenSavedMovies}
              className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-xs font-semibold text-amber-300 rounded-full flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Film className="w-3.5 h-3.5 text-amber-400" />
              <span>Saved Videos ({savedMoviesCount})</span>
            </button>
          )}

          {/* Free Unlimited Badge */}
          <div className="flex items-center gap-1.5 bg-emerald-950/80 border border-emerald-500/30 px-3 py-1.5 rounded-full text-xs text-emerald-300 font-semibold shadow-inner">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="hidden sm:inline">100% Free & Unlimited</span>
            <span className="sm:hidden">Free</span>
            <span className="text-neutral-500 hidden md:inline">•</span>
            <span className="hidden md:inline text-neutral-300">No Watermark</span>
          </div>
        </div>
      </div>
    </header>
  );
};

