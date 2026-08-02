import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, Building2, ExternalLink, ShieldCheck, Heart, Radio, Code2 } from 'lucide-react';
import duneliLogo from '../assets/logo.png';

interface AboutUsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AboutUsModal({ isOpen, onClose }: AboutUsModalProps) {
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
          {/* Header Banner */}
          <div className="relative p-6 sm:p-7 bg-gradient-to-r from-[#3B5BF6] via-[#7C3AED] to-[#F97316] text-white shrink-0">
            <button
              onClick={onClose}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md flex items-center justify-center text-white transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[10px] sm:text-xs font-black tracking-wider uppercase flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" /> Powered by IUXOA
              </span>
            </div>

            <h2 className="text-xl sm:text-3xl font-black tracking-tight mb-1">
              Ideas Compete, Not People.
            </h2>
            <p className="text-white/85 text-xs sm:text-sm max-w-lg leading-relaxed font-medium">
              Duneli is a safe, anonymous audio space built for introverts who want to express their deepest thoughts without clout or social anxiety.
            </p>
          </div>

          {/* Modal Body (Smooth internal scroll) */}
          <div className="p-5 sm:p-6 space-y-5 overflow-y-auto flex-1 text-sm">
            {/* IUXOA Section */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-100/80 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[#7C3AED] font-extrabold text-xs uppercase tracking-wider">
                  <Code2 className="w-4 h-4" /> About IUXOA
                </div>
                <span className="text-[10px] font-bold text-purple-600 bg-purple-100 px-2.5 py-0.5 rounded-full">Official Creator</span>
              </div>
              <h3 className="text-base font-black text-[#1A1A2E]">
                Crafting Next-Gen Apps, Websites & Interactive Games
              </h3>
              <p className="text-xs sm:text-sm text-[#1A1A2E]/75 leading-relaxed">
                <strong className="text-[#7C3AED]">IUXOA</strong> is a modern software technology & digital experience studio specializing in high-performance web applications, mobile platforms, and immersive interactive games. Duneli is designed and engineered by the IUXOA team to solve social friction in digital communication.
              </p>
            </div>

            {/* Duneli Mission Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                <div className="w-9 h-9 rounded-xl bg-[#3B5BF6] text-white flex items-center justify-center font-bold">
                  <ShieldCheck className="w-4.5 h-4.5" />
                </div>
                <h4 className="font-extrabold text-sm text-[#1A1A2E]">100% Anonymous</h4>
                <p className="text-xs text-[#1A1A2E]/70 leading-relaxed">
                  No profile photos, no follower counts, no clout metrics. Express your genuine ideas without fear of social judgment.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                <div className="w-9 h-9 rounded-xl bg-[#F97316] text-white flex items-center justify-center font-bold">
                  <Heart className="w-4.5 h-4.5" />
                </div>
                <h4 className="font-extrabold text-sm text-[#1A1A2E]">Zero Pressure Audio</h4>
                <p className="text-xs text-[#1A1A2E]/70 leading-relaxed">
                  Choose your comfort level: Listen silently as a <strong>Listener</strong>, queue orderly as a <strong>Speaker</strong>, or engage in open <strong>Debate</strong>.
                </p>
              </div>
            </div>

            {/* Dunora Ecosystem Module */}
            <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-3 shadow-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-cyan-400 font-extrabold text-xs uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" /> Duneli Core Ecosystem
                </div>
                <a
                  href="https://dunora.vercel.app"
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1 rounded-full bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-xs font-bold flex items-center gap-1.5 transition-all"
                >
                  <span>Visit Dunora</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              <h3 className="text-lg font-black">Dunora — Deep Asynchronous Discourse Engine</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Dunora is Duneli’s dedicated async thought engine, hosted at <strong className="text-cyan-400">dunora.vercel.app</strong>. While Duneli provides live real-time audio rooms, Dunora allows deep thinkers to post structured, long-form anonymous thought trees and node discussions.
              </p>
            </div>
          </div>

          {/* Footer Bar */}
          <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200/80 flex items-center justify-between shrink-0">
            <span className="text-xs text-[#1A1A2E]/60 font-semibold">© {new Date().getFullYear()} IUXOA & Duneli Team</span>
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
