import React, { useState } from 'react';
import { Shield, ShieldCheck, Lock, EyeOff, ServerOff, Trash2, CheckCircle2, X } from 'lucide-react';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div 
      id="privacy-policy-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div 
        id="privacy-policy-modal"
        className="bg-neutral-900 border border-neutral-800 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-800 bg-neutral-950/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-white flex items-center gap-2">
                Privacy Policy & Data Security
              </h2>
              <p className="text-[11px] text-neutral-400">100% Private, On-Device & Zero Data Storage</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="px-5 py-4 space-y-4 overflow-y-auto text-xs text-neutral-300 leading-relaxed">
          {/* Key Guarantee Banner */}
          <div className="bg-emerald-950/50 border border-emerald-500/30 rounded-xl p-3 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-emerald-300 text-xs">Zero Server Storage Guarantee</h4>
              <p className="text-[11px] text-emerald-200/80 mt-0.5">
                Neither this app, Google AI Studio, nor any remote server ever saves, stores, or transmits your uploaded photos or videos. All processing happens entirely inside your own browser.
              </p>
            </div>
          </div>

          {/* Privacy Points */}
          <div className="space-y-3">
            <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800/80 flex items-start gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 shrink-0">
                <ServerOff className="w-4 h-4" />
              </div>
              <div>
                <h5 className="font-bold text-white text-xs">1. 100% Client-Side Local Processing</h5>
                <p className="text-[11px] text-neutral-400 mt-0.5">
                  All 8K image reconstruction, high-pass filtering, HDR tone curves, and video rendering algorithms run strictly locally using your device&apos;s GPU/CPU via WebGL and HTML5 Canvas.
                </p>
              </div>
            </div>

            <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800/80 flex items-start gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 shrink-0">
                <EyeOff className="w-4 h-4" />
              </div>
              <div>
                <h5 className="font-bold text-white text-xs">2. No Data Sharing or Third-Party Tracking</h5>
                <p className="text-[11px] text-neutral-400 mt-0.5">
                  Your files are never shared with third parties, advertising networks, or used to train public AI models. Your media remains strictly your own.
                </p>
              </div>
            </div>

            <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800/80 flex items-start gap-3">
              <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400 shrink-0">
                <Trash2 className="w-4 h-4" />
              </div>
              <div>
                <h5 className="font-bold text-white text-xs">3. Automatic Instant Memory Wipe</h5>
                <p className="text-[11px] text-neutral-400 mt-0.5">
                  When you download your media, clear the queue, or close your browser tab, all temporary memory references, video blobs, and canvas buffers are immediately purged from RAM.
                </p>
              </div>
            </div>

            <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800/80 flex items-start gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <h5 className="font-bold text-white text-xs">4. End-to-End Secure Environment</h5>
                <p className="text-[11px] text-neutral-400 mt-0.5">
                  All connections are protected under TLS 1.3 encryption with active FireCloud anti-tamper security verification.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3.5 border-t border-neutral-800 bg-neutral-950/80 flex items-center justify-between">
          <span className="text-[10px] text-neutral-500 font-medium">Last updated: August 2026</span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-neutral-950 font-black text-xs rounded-xl shadow-md transition-all cursor-pointer active:scale-95"
          >
            I Understand & Agree
          </button>
        </div>
      </div>
    </div>
  );
};
