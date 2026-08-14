import React from 'react';
import { Header } from './components/Header';
import { ImageEnhancerStudio } from './components/ImageEnhancerStudio';

export default function App() {
  return (
    <div id="enhance-ai-app" className="min-h-screen bg-neutral-950 text-neutral-100 font-sans selection:bg-amber-500 selection:text-black pb-16">
      {/* App Header */}
      <Header />

      {/* Main Enhancer Studio */}
      <main className="transition-all">
        <ImageEnhancerStudio />
      </main>

      {/* Footer */}
      <footer className="mt-12 border-t border-neutral-850 py-6 text-center text-xs text-neutral-500">
        <p>EnhanceAI • DSLR Master 8K Super Resolution & Remini AI Photo Studio • 100% Free & Unlimited</p>
      </footer>
    </div>
  );
}

