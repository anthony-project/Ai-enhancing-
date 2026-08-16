import React from 'react';
import { Header } from './components/Header';
import { ImageEnhancerStudio } from './components/ImageEnhancerStudio';

export default function App() {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex justify-center selection:bg-amber-500 selection:text-black overflow-x-hidden w-full">
      {/* Phone Format App Container (Locked against horizontal shake/scroll) */}
      <div 
        id="enhance-ai-app" 
        className="w-full max-w-lg min-h-screen bg-neutral-950 border-x border-neutral-900/60 shadow-2xl flex flex-col relative overflow-x-hidden pb-12"
      >
        {/* Mobile App Header */}
        <Header />

        {/* Main Content Area (Strict Vertical Scrolling Only) */}
        <main className="flex-1 w-full overflow-x-hidden transition-all">
          <ImageEnhancerStudio />
        </main>

        {/* Mobile App Footer */}
        <footer className="mt-8 border-t border-neutral-900 py-4 px-4 text-center text-[11px] text-neutral-500">
          <p>EnhanceAI • 8K Remini Photo Studio • 100% Free</p>
        </footer>
      </div>
    </div>
  );
}


