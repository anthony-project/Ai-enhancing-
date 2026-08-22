import React, { useState } from 'react';
import { Header } from './components/Header';
import { ImageEnhancerStudio } from './components/ImageEnhancerStudio';
import { PrivacyPolicyModal } from './components/PrivacyPolicyModal';
import { TermsConditionsModal } from './components/TermsConditionsModal';
import { AnimatedGridBackground } from './components/ui/AnimatedGridBackground';
import { ShieldCheck, Lock, FileText, Sparkles } from 'lucide-react';

export default function App() {
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState<boolean>(false);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState<boolean>(false);

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex justify-center selection:bg-amber-400 selection:text-neutral-950 overflow-x-hidden w-full relative">
      {/* High-performance lightweight background */}
      <AnimatedGridBackground />

      {/* Main App Container */}
      <div
        id="enhance-ai-app"
        className="w-full max-w-lg sm:max-w-xl min-h-screen bg-neutral-950/95 border-x border-neutral-900 flex flex-col relative overflow-x-hidden pb-10 z-10"
      >
        {/* Compact App Header */}
        <Header onOpenPrivacy={() => setIsPrivacyModalOpen(true)} />

        {/* Main Content Area */}
        <main className="flex-1 w-full overflow-x-hidden transition-all">
          <ImageEnhancerStudio onOpenPrivacy={() => setIsPrivacyModalOpen(true)} />
        </main>

        {/* Compact Footer */}
        <footer className="mt-6 border-t border-neutral-900 pt-4 pb-5 px-3 text-center space-y-2">
          <div className="flex flex-wrap items-center justify-center gap-2 max-w-md mx-auto">
            <button
              type="button"
              onClick={() => setIsPrivacyModalOpen(true)}
              className="group inline-flex items-center justify-center gap-1.5 px-2.5 py-1 bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 hover:border-emerald-500/40 rounded-full cursor-pointer transition-all active:scale-95 text-[11px] font-bold text-neutral-300 hover:text-white"
            >
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <span>Privacy Policy</span>
            </button>

            <button
              type="button"
              onClick={() => setIsTermsModalOpen(true)}
              className="group inline-flex items-center justify-center gap-1.5 px-2.5 py-1 bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 hover:border-amber-500/40 rounded-full cursor-pointer transition-all active:scale-95 text-[11px] font-bold text-neutral-300 hover:text-white"
            >
              <FileText className="w-3 h-3 text-amber-400" />
              <span>Terms & Conditions</span>
            </button>
          </div>

          <div className="flex items-center justify-center gap-2 text-[10px] text-neutral-500">
            <span className="flex items-center gap-1">
              <Lock className="w-2.5 h-2.5 text-emerald-400" />
              <span>TLS 1.3</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-2.5 h-2.5 text-emerald-400" />
              <span>Zero Retention</span>
            </span>
          </div>

          <p className="text-[10px] text-neutral-500 flex items-center justify-center gap-1">
            <Sparkles className="w-2.5 h-2.5 text-amber-400" />
            <span>EnhanceAI • 8K Photo & Video Studio • 100% Free</span>
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
