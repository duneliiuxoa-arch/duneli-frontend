import { motion, AnimatePresence } from 'motion/react';
import { X, ShieldCheck, Heart, Volume2, Users, AlertTriangle } from 'lucide-react';

interface CommunityGuidelinesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CommunityGuidelinesModal({ isOpen, onClose }: CommunityGuidelinesModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-hidden">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-[#0F0F3D]/75 backdrop-blur-md"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="relative w-full max-w-2xl max-h-[88vh] bg-white border border-blue-100 shadow-2xl rounded-3xl overflow-hidden z-10 flex flex-col text-[#1A1A2E]"
          style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
        >
          {/* Header */}
          <div className="relative p-6 sm:p-7 bg-gradient-to-r from-[#F97316] to-[#ef4444] text-white shrink-0">
            <button
              onClick={onClose}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md flex items-center justify-center text-white transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 text-white/90 text-xs font-bold uppercase tracking-wider mb-1.5">
              <ShieldCheck className="w-3.5 h-3.5" /> Safety & Conduct Framework
            </div>
            <h2 className="text-xl sm:text-3xl font-black">Community Guidelines</h2>
            <p className="text-white/85 text-xs sm:text-sm mt-0.5">Creating a welcoming, zero-judgment space for deep voices.</p>
          </div>

          {/* Guidelines Body */}
          <div className="p-5 sm:p-6 space-y-5 flex-1 overflow-y-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="p-4 rounded-2xl bg-orange-50/60 border border-orange-100 space-y-1.5">
                <div className="w-8 h-8 rounded-xl bg-[#F97316] text-white flex items-center justify-center font-bold">
                  <Heart className="w-4 h-4" />
                </div>
                <h4 className="font-extrabold text-sm text-[#1A1A2E]">Respect Introvert Space</h4>
                <p className="text-xs text-[#1A1A2E]/70 leading-relaxed">
                  Never force anyone to turn on their microphone. Listeners have 0% expectation to speak and are valued equally.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100 space-y-1.5">
                <div className="w-8 h-8 rounded-xl bg-[#3B5BF6] text-white flex items-center justify-center font-bold">
                  <Volume2 className="w-4 h-4" />
                </div>
                <h4 className="font-extrabold text-sm text-[#1A1A2E]">Orderly Speaker Queue</h4>
                <p className="text-xs text-[#1A1A2E]/70 leading-relaxed">
                  In Speaker mode, wait for your allocated turn. Avoid interrupting or shouting over active speakers.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-100 space-y-1.5">
                <div className="w-8 h-8 rounded-xl bg-[#7C3AED] text-white flex items-center justify-center font-bold">
                  <Users className="w-4 h-4" />
                </div>
                <h4 className="font-extrabold text-sm text-[#1A1A2E]">Protect Anonymity</h4>
                <p className="text-xs text-[#1A1A2E]/70 leading-relaxed">
                  Do not request personal identities, locations, or social media handles from room participants.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-red-50/60 border border-red-100 space-y-1.5">
                <div className="w-8 h-8 rounded-xl bg-red-500 text-white flex items-center justify-center font-bold">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <h4 className="font-extrabold text-sm text-[#1A1A2E]">Zero Tolerance Harassment</h4>
                <p className="text-xs text-[#1A1A2E]/70 leading-relaxed">
                  Hate speech, discrimination, and toxic hostility result in immediate room removal and account suspension.
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200/80 flex items-center justify-between shrink-0">
            <span className="text-xs text-[#1A1A2E]/60 font-semibold">Duneli Safety Council</span>
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-full bg-[#1A1A2E] text-white text-xs font-extrabold hover:bg-[#2d2d4e] transition-all cursor-pointer"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
