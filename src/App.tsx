import React, { useState } from 'react';
import { Header } from './components/Header';
import { ImageEnhancerStudio } from './components/ImageEnhancerStudio';
import { PrivacyPolicyModal } from './components/PrivacyPolicyModal';
import { ShieldCheck, Lock } from 'lucide-react';

export default function App() {
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState<boolean>(false);

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

        {/* Clickable Privacy Policy Heading Line & Security Footer */}
        <footer className="mt-8 border-t border-neutral-900/80 pt-5 pb-6 px-4 text-center space-y-3">
          {/* Dedicated Clickable Privacy Policy Heading Line */}
          <div 
            onClick={() => setIsPrivacyModalOpen(true)}
            className="group inline-flex items-center justify-center gap-2 px-4 py-2 bg-neutral-900/90 hover:bg-neutral-850 border border-neutral-800 hover:border-emerald-500/40 rounded-full cursor-pointer transition-all shadow-sm active:scale-95 mx-auto"
            title="Click to view full Privacy Policy & End-to-End Encryption Security Guidelines"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-neutral-200 group-hover:text-white transition-colors">
              End-to-End Encrypted • 100% On-Device & Zero Data Storage
            </span>
            <span className="text-[10px] text-emerald-400 underline font-medium ml-1">
              Read Guidelines
            </span>
          </div>

          <div className="flex items-center justify-center gap-4 text-[10px] text-neutral-500">
            <span className="flex items-center gap-1">
              <Lock className="w-3 h-3 text-emerald-400" />
              <span>256-Bit E2EE</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <span>Sandbox Isolation</span>
            </span>
            <span>•</span>
            <span>Zero Server Logging</span>
          </div>

          <p className="text-[11px] text-neutral-500">
            EnhanceAI • 8K Remini Photo & Video Studio • 100% Free & Private
          </p>
        </footer>
      </div>

      {/* Privacy Policy Modal */}
      <PrivacyPolicyModal 
        isOpen={isPrivacyModalOpen} 
        onClose={() => setIsPrivacyModalOpen(false)} 
      />
    </div>
  );
}
