import React from 'react';
import { FileText, Shield, CheckCircle2, X } from 'lucide-react';

interface TermsConditionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TermsConditionsModal: React.FC<TermsConditionsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      id="terms-conditions-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div
        id="terms-conditions-modal"
        className="bg-neutral-900 border border-neutral-800 w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-800 bg-neutral-950/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-white flex items-center gap-2">
                Terms and Conditions
              </h2>
              <p className="text-[11px] text-neutral-400">
                ai-enhancing.vercel.app • Last Updated: August 19, 2026
              </p>
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

        {/* Modal Body - Full 13 Sections */}
        <div className="px-5 py-4 space-y-4 overflow-y-auto text-xs text-neutral-300 leading-relaxed custom-scrollbar">
          {/* Section 1 */}
          <div className="bg-neutral-950/70 p-3.5 rounded-xl border border-neutral-800/80 space-y-1">
            <h4 className="font-bold text-amber-400 text-xs flex items-center gap-1.5">
              <span>1. Acceptance of Terms</span>
            </h4>
            <p className="text-[11px] text-neutral-300">
              By accessing or using this website (&ldquo;Service&rdquo;), which provides AI-powered photo enhancement, upscaling (8K Ultra HD), face restoration, and object removal features, you agree to be bound by these Terms and Conditions. If you do not agree, please discontinue use of the Service immediately.
            </p>
          </div>

          {/* Section 2 */}
          <div className="bg-neutral-950/70 p-3.5 rounded-xl border border-neutral-800/80 space-y-1">
            <h4 className="font-bold text-amber-400 text-xs">2. Description of Service</h4>
            <p className="text-[11px] text-neutral-300">
              The Service allows users to upload photos and apply AI-based enhancements including but not limited to:
            </p>
            <ul className="list-disc list-inside text-[11px] text-neutral-400 space-y-0.5 ml-1">
              <li>Resolution upscaling (up to 8K Ultra HD)</li>
              <li>Face restoration</li>
              <li>Object removal</li>
              <li>Frame size preservation</li>
            </ul>
            <p className="text-[11px] text-neutral-400 italic">
              Results are generated using automated AI models and may vary in quality depending on the input image.
            </p>
          </div>

          {/* Section 3 */}
          <div className="bg-neutral-950/70 p-3.5 rounded-xl border border-neutral-800/80 space-y-1">
            <h4 className="font-bold text-amber-400 text-xs">3. User Content and Uploads</h4>
            <ul className="list-disc list-inside text-[11px] text-neutral-300 space-y-1 ml-1">
              <li>You retain ownership of any photo/image you upload (&ldquo;User Content&rdquo;).</li>
              <li>By uploading content, you grant the Service a limited, non-exclusive, revocable license to process, store temporarily, and enhance the image solely for the purpose of providing the requested service.</li>
              <li>You confirm that you own the rights to the image or have permission to upload and process it.</li>
              <li>You must <strong className="text-rose-400">not</strong> upload content that is illegal, infringes on third-party rights, contains child exploitation material, non-consensual intimate imagery, or violates any applicable law. Violation will result in immediate termination of access and may be reported to relevant authorities.</li>
            </ul>
          </div>

          {/* Section 4 */}
          <div className="bg-neutral-950/70 p-3.5 rounded-xl border border-neutral-800/80 space-y-1">
            <h4 className="font-bold text-amber-400 text-xs">4. Data Retention and Privacy</h4>
            <ul className="list-disc list-inside text-[11px] text-neutral-300 space-y-1 ml-1">
              <li>Uploaded images are processed for the sole purpose of enhancement and are automatically deleted from our servers or memory immediately after processing.</li>
              <li>We do not sell or share your uploaded images with third parties, except AI processing infrastructure providers strictly necessary to deliver the Service.</li>
              <li>See our Privacy Policy for full details on data handling.</li>
            </ul>
          </div>

          {/* Section 5 */}
          <div className="bg-neutral-950/70 p-3.5 rounded-xl border border-neutral-800/80 space-y-1">
            <h4 className="font-bold text-amber-400 text-xs">5. No Guarantee of Output Quality</h4>
            <ul className="list-disc list-inside text-[11px] text-neutral-300 space-y-1 ml-1">
              <li>AI enhancement results are generated automatically and may not always meet user expectations.</li>
              <li>The Service is provided &ldquo;as is&rdquo; without warranty of accuracy, quality, or fitness for a particular purpose.</li>
              <li>We do not guarantee that enhanced images will be free of artifacts, distortions, or errors.</li>
            </ul>
          </div>

          {/* Section 6 */}
          <div className="bg-neutral-950/70 p-3.5 rounded-xl border border-neutral-800/80 space-y-1">
            <h4 className="font-bold text-amber-400 text-xs">6. Prohibited Uses</h4>
            <p className="text-[11px] text-neutral-300">You agree not to:</p>
            <ul className="list-disc list-inside text-[11px] text-neutral-400 space-y-0.5 ml-1">
              <li>Use the Service for any unlawful purpose.</li>
              <li>Upload images depicting minors in any inappropriate context.</li>
              <li>Attempt to reverse-engineer, scrape, or overload the Service via automated bots.</li>
              <li>Use enhanced outputs to create misleading, defamatory, or fraudulent content (e.g., deepfakes without consent).</li>
            </ul>
          </div>

          {/* Section 7 */}
          <div className="bg-neutral-950/70 p-3.5 rounded-xl border border-neutral-800/80 space-y-1">
            <h4 className="font-bold text-amber-400 text-xs">7. Intellectual Property</h4>
            <p className="text-[11px] text-neutral-300">
              The Service&apos;s underlying software, branding, and design are the property of the Service owner. Enhanced output images are provided to the user for personal/commercial use as applicable, subject to Section 3.
            </p>
          </div>

          {/* Section 8 */}
          <div className="bg-neutral-950/70 p-3.5 rounded-xl border border-neutral-800/80 space-y-1">
            <h4 className="font-bold text-amber-400 text-xs">8. Limitation of Liability</h4>
            <p className="text-[11px] text-neutral-300">
              To the maximum extent permitted by law, the Service and its operators shall not be liable for any indirect, incidental, or consequential damages arising from use of the Service, including loss of data, loss of image content, or reliance on AI-generated output.
            </p>
          </div>

          {/* Section 9 */}
          <div className="bg-neutral-950/70 p-3.5 rounded-xl border border-neutral-800/80 space-y-1">
            <h4 className="font-bold text-amber-400 text-xs">9. Service Availability</h4>
            <p className="text-[11px] text-neutral-300">
              We do not guarantee uninterrupted or error-free access to the Service and may suspend, modify, or discontinue features at any time without prior notice.
            </p>
          </div>

          {/* Section 10 */}
          <div className="bg-neutral-950/70 p-3.5 rounded-xl border border-neutral-800/80 space-y-1">
            <h4 className="font-bold text-amber-400 text-xs">10. Third-Party Services</h4>
            <p className="text-[11px] text-neutral-300">
              The Service may rely on third-party AI infrastructure or cloud providers to process images. We are not responsible for outages or failures caused by such third parties.
            </p>
          </div>

          {/* Section 11 */}
          <div className="bg-neutral-950/70 p-3.5 rounded-xl border border-neutral-800/80 space-y-1">
            <h4 className="font-bold text-amber-400 text-xs">11. Changes to Terms</h4>
            <p className="text-[11px] text-neutral-300">
              We reserve the right to update these Terms at any time. Continued use of the Service after changes constitutes acceptance of the revised Terms.
            </p>
          </div>

          {/* Section 12 */}
          <div className="bg-neutral-950/70 p-3.5 rounded-xl border border-neutral-800/80 space-y-1">
            <h4 className="font-bold text-amber-400 text-xs">12. Governing Law</h4>
            <p className="text-[11px] text-neutral-300">
              These Terms shall be governed by applicable laws without regard to conflict of law principles.
            </p>
          </div>

          {/* Section 13 */}
          <div className="bg-neutral-950/70 p-3.5 rounded-xl border border-neutral-800/80 space-y-1">
            <h4 className="font-bold text-amber-400 text-xs">13. Contact</h4>
            <p className="text-[11px] text-neutral-300">
              For questions regarding these Terms, contact support at the official service portal or email.
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3.5 border-t border-neutral-800 bg-neutral-950/80 flex items-center justify-between">
          <span className="text-[10px] text-neutral-500 font-medium">ai-enhancing.vercel.app</span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-black text-xs rounded-xl shadow-md transition-all cursor-pointer active:scale-95"
          >
            I Accept Terms
          </button>
        </div>
      </div>
    </div>
  );
};
