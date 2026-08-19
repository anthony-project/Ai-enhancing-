import React, { useState } from 'react';
import { Header } from './components/Header';
import { ImageEnhancerStudio } from './components/ImageEnhancerStudio';
import { PrivacyPolicyModal } from './components/PrivacyPolicyModal';
import { TermsConditionsModal } from './components/TermsConditionsModal';
import { ShieldCheck, Lock, FileText } from 'lucide-react';

export default function App() {
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState<boolean>(false);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState<boolean>(false);

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex justify-center selection:bg-amber-500 selection:text-black overflow-x-hidden w-full">
      {/* Phone Format App Container */}
      <div 
        id="enhance-ai-app" 
        className="w-full max-w-lg min-h-screen bg-neutral-950 border-x border-neutral-900/60 shadow-2xl flex flex-col relative overflow-x-hidden pb-12"
      >
        {/* Mobile App Header with Security status link */}
        <Header onOpenPrivacy={() => setIsPrivacyModalOpen(true)} />

        {/* Main Content Area */}
        <main className="flex-1 w-full overflow-x-hidden transition-all">
          <ImageEnhancerStudio onOpenPrivacy={() => setIsPrivacyModalOpen(true)} />
        </main>

        {/* Clickable Privacy Policy & Terms and Conditions Bottom Footer */}
        <footer className="mt-8 border-t border-neutral-900/80 pt-5 pb-6 px-4 text-center space-y-3">
          {/* Dedicated Clickable Action Links */}
          <div className="flex flex-wrap items-center justify-center gap-2 max-w-md mx-auto">
            {/* Privacy Policy Button */}
            <button 
              type="button"
              onClick={() => setIsPrivacyModalOpen(true)}
              className="group inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-neutral-900/90 hover:bg-neutral-850 border border-neutral-800 hover:border-emerald-500/40 rounded-full cursor-pointer transition-all shadow-sm active:scale-95 text-xs font-bold text-neutral-200 hover:text-white"
              title="Click to view Privacy Policy & Data Security"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
              <span>Privacy Policy</span>
            </button>

            {/* Terms & Conditions Button */}
            <button 
              type="button"
              onClick={() => setIsTermsModalOpen(true)}
              className="group inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-neutral-900/90 hover:bg-neutral-850 border border-neutral-800 hover:border-amber-500/40 rounded-full cursor-pointer transition-all shadow-sm active:scale-95 text-xs font-bold text-neutral-200 hover:text-white"
              title="Click to view Terms & Conditions"
            >
              <FileText className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
              <span>Terms & Conditions</span>
            </button>
          </div>

          <div className="flex items-center justify-center gap-3 text-[10px] text-neutral-500">
            <span className="flex items-center gap-1">
              <Lock className="w-3 h-3 text-emerald-400" />
              <span>TLS 1.3 256-Bit</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <span>Zero Retention</span>
            </span>
            <span>•</span>
            <span>ai-enhancing.vercel.app</span>
          </div>

          <p className="text-[11px] text-neutral-500">
            EnhanceAI • 8K Remini Photo & Video Studio • 100% Free
          </p>
        </footer>
      </div>

      {/* Privacy Policy Modal */}
      <PrivacyPolicyModal 
        isOpen={isPrivacyModalOpen} 
        onClose={() => setIsPrivacyModalOpen(false)} 
      />

      {/* Terms and Conditions Modal */}
      <TermsConditionsModal 
        isOpen={isTermsModalOpen} 
        onClose={() => setIsTermsModalOpen(false)} 
      />
    </div>
  );
}
