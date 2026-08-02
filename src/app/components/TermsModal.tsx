import { motion, AnimatePresence } from 'motion/react';
import { X, FileText, ShieldAlert, Lock, CheckCircle2 } from 'lucide-react';

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TermsModal({ isOpen, onClose }: TermsModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-hidden">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-[#0F0F3D]/75 backdrop-blur-md"
        />

        {/* Modal Window (Fits 100% cleanly inside screen height) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="relative w-full max-w-2xl max-h-[88vh] bg-white border border-blue-100 shadow-2xl rounded-3xl overflow-hidden z-10 flex flex-col text-[#1A1A2E]"
          style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
        >
          {/* Header */}
          <div className="relative p-6 sm:p-7 bg-[#1A1A2E] text-white shrink-0">
            <button
              onClick={onClose}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md flex items-center justify-center text-white transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-1.5">
              <FileText className="w-3.5 h-3.5" /> Legal & Regulatory Agreement
            </div>
            <h2 className="text-xl sm:text-3xl font-black">Terms of Service</h2>
            <p className="text-white/70 text-xs sm:text-sm mt-0.5">Effective Date: January 1, 2026</p>
          </div>

          {/* Content */}
          <div className="p-5 sm:p-6 space-y-5 flex-1 overflow-y-auto text-sm leading-relaxed text-[#1A1A2E]/80">
            <section className="space-y-1.5">
              <h3 className="text-sm sm:text-base font-extrabold text-[#1A1A2E] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#3B5BF6]" /> 1. Acceptance of Terms
              </h3>
              <p className="text-xs sm:text-sm">
                By accessing or using Duneli (operated by IUXOA), you agree to be bound by these Terms of Service. If you do not agree to these terms, you may not access or use our live audio platform or associated ecosystem (including Dunora).
              </p>
            </section>

            <section className="space-y-1.5">
              <h3 className="text-sm sm:text-base font-extrabold text-[#1A1A2E] flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#7C3AED]" /> 2. Anonymity & User Conduct
              </h3>
              <p className="text-xs sm:text-sm">
                Duneli is designed as an anonymous audio space for thoughtful discussions. While we protect user identity, users are strictly prohibited from engaging in hate speech, harassment, dox-ing, illegal activities, or explicit content broadcast in public rooms.
              </p>
            </section>

            <section className="space-y-1.5">
              <h3 className="text-sm sm:text-base font-extrabold text-[#1A1A2E] flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-[#F97316]" /> 3. Audio Streaming & Participation Roles
              </h3>
              <p className="text-xs sm:text-sm">
                Participants must respect room role permissions (Listener, Speaker queue, and Debater). Room hosts reserve the right to mute or remove participants violating topic boundaries.
              </p>
            </section>

            <section className="space-y-1.5">
              <h3 className="text-sm sm:text-base font-extrabold text-[#1A1A2E] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#3B5BF6]" /> 4. Intellectual Property & Dunora Integration
              </h3>
              <p className="text-xs sm:text-sm">
                Duneli, Dunora, and IUXOA logos, custom audio components, and brand assets are owned exclusively by IUXOA. User-submitted thoughts in public rooms remain the intellectual property of their creators under a non-exclusive license for platform display.
              </p>
            </section>

            <section className="space-y-1.5">
              <h3 className="text-sm sm:text-base font-extrabold text-[#1A1A2E] flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#7C3AED]" /> 5. Limitation of Liability
              </h3>
              <p className="text-xs sm:text-sm">
                Duneli services are provided "AS IS" without warranties of any kind. IUXOA is not liable for indirect damages, user statements in live rooms, or temporary service interruptions.
              </p>
            </section>
          </div>

          {/* Footer Bar */}
          <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200/80 flex items-center justify-between shrink-0">
            <span className="text-xs text-[#1A1A2E]/60 font-semibold">IUXOA Legal Compliance</span>
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-full bg-[#1A1A2E] text-white text-xs font-extrabold hover:bg-[#2d2d4e] transition-all cursor-pointer"
            >
              I Understand
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
