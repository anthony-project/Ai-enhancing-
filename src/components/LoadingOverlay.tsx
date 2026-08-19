import React, { useEffect, useState } from 'react';
import { Film, Clapperboard, Sparkles, Wand2 } from 'lucide-react';
import { SupportedLanguage } from '../types';

interface LoadingOverlayProps {
  language: SupportedLanguage;
}

const STAGES = [
  'Analyzing prompt & reference image with Neural AI...',
  'Generating video story flow & camera movements...',
  'Synthesizing HD male/female narration script...',
  'Enhancing 4K frame interpolation & 60 FPS motion...',
  'Removing watermarks & rendering full HD video cut...',
];

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ language }) => {
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [progress, setProgress] = useState(10);

  useEffect(() => {
    const stageInterval = setInterval(() => {
      setCurrentStageIndex((prev) => (prev < STAGES.length - 1 ? prev + 1 : prev));
    }, 2800);

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 98) return 99;
        if (prev >= 85) return prev + 1;
        return prev + Math.floor(Math.random() * 6) + 3;
      });
    }, 280);

    return () => {
      clearInterval(stageInterval);
      clearInterval(progressInterval);
    };
  }, []);

  return (
    <div id="loading-overlay" className="fixed inset-0 z-50 bg-neutral-950/95 backdrop-blur-2xl flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6">
        {/* Animated Reels Icon */}
        <div className="relative inline-flex items-center justify-center w-24 h-24 mx-auto">
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-500 via-rose-600 to-purple-600 animate-spin blur-xl opacity-40" />
          <div className="relative w-20 h-20 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center shadow-2xl">
            <Film className="w-10 h-10 text-amber-400 animate-pulse" />
          </div>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <h2 className="text-2xl font-bold font-serif text-white tracking-tight">
            Generating AI Video
          </h2>
          <p className="text-xs text-amber-400 font-mono uppercase tracking-widest">
            Language: {language} • Free No Credit Mode
          </p>
        </div>

        {/* Dynamic Stage text */}
        <div className="h-10 flex items-center justify-center">
          <p className="text-sm text-neutral-300 font-medium flex items-center gap-2 animate-fadeIn">
            <Wand2 className="w-4 h-4 text-purple-400 shrink-0 animate-bounce" />
            <span>{STAGES[currentStageIndex]}</span>
          </p>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="w-full bg-neutral-900 rounded-full h-2 overflow-hidden border border-neutral-800 p-0.5">
            <div
              className="bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 h-full rounded-full transition-all duration-300 shadow-sm shadow-amber-500/50"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-neutral-500 font-mono">
            <span>AI VIDEO ENGINE</span>
            <span>{progress}%</span>
          </div>
        </div>

        <div className="pt-4 border-t border-neutral-900">
          <p className="text-xs text-emerald-400/80 font-medium">
            ⚡ 100% Free Unlimited Generations (No Watermark)
          </p>
        </div>
      </div>
    </div>
  );
};
