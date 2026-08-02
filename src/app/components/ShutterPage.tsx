import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronUp, Radio, Users, Sparkles, BookOpen, Volume2, ShieldCheck, ArrowRight, Lock, Headphones, Mic, Scale } from 'lucide-react';
import { Discussion, Theme } from '../types';
import duneliLogo from '../../assets/logo.png';

interface ShutterPageProps {
  isOpen: boolean;
  onClose: () => void;
  discussions: Discussion[];
  currentTheme: Theme;
  onJoinDiscussion: (id: string) => void;
}

export function ShutterPage({ isOpen, onClose, discussions, currentTheme, onJoinDiscussion }: ShutterPageProps) {
  const liveDiscussions = discussions.filter((d) => d.status === 'live');
  const upcomingDiscussions = discussions.filter((d) => d.status === 'upcoming');

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ y: '-100%' }}
          animate={{ y: 0 }}
          exit={{ y: '-100%' }}
          transition={{ type: 'spring', stiffness: 180, damping: 24 }}
          className="fixed inset-0 z-50 bg-[#0F0F3D] text-white flex flex-col justify-between overflow-y-auto shadow-2xl"
          style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
        >
          {/* Top Bar inside Shutter */}
          <div className="max-w-7xl w-full mx-auto px-6 py-6 flex items-center justify-between border-b border-white/10">
            <div className="flex items-center gap-4">
              <img src={duneliLogo} alt="Duneli" className="h-9 w-auto object-contain scale-[3]" />
              <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-black uppercase tracking-wider">
                Interactive Shutter Command Center
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="px-5 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer border border-white/20"
              >
                <span>Pull Up Shutter</span>
                <ChevronUp className="w-4 h-4" />
              </button>

              <button
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Main Shutter Content */}
          <div className="max-w-7xl w-full mx-auto px-6 py-10 flex-1 space-y-12">
            
            {/* Shutter Headline */}
            <div className="text-center max-w-2xl mx-auto">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-bold text-blue-300 mb-3">
                <Sparkles className="w-3.5 h-3.5 text-[#F97316]" />
                <span>Pull-Down Shutter Quick Stage</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-black text-white leading-tight mb-3">
                Duneli Live Command Hub
              </h1>
              <p className="text-sm sm:text-base text-white/70">
                Quick-access portal for active audio rooms, discussion roles, and Dunora summaries.
              </p>
            </div>

            {/* Quick 3 Roles Bar */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-400/30 flex items-center justify-center">
                  <Headphones className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-white">Listener 🎧</h4>
                  <p className="text-xs text-white/60">Only able to listen — Mic locked OFF</p>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 text-blue-300 border border-blue-400/30 flex items-center justify-center">
                  <Mic className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-white">Speaker 🎙️</h4>
                  <p className="text-xs text-white/60">Speaks on turn — Orderly queue</p>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-orange-500/20 text-orange-300 border border-orange-400/30 flex items-center justify-center">
                  <Scale className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-white">Debater ⚡</h4>
                  <p className="text-xs text-white/60">Speaks anytime — Open mic access</p>
                </div>
              </div>
            </div>

            {/* Live Rooms Feed inside Shutter */}
            <div>
              <div className="flex items-center gap-2 mb-6">
                <Radio className="w-5 h-5 text-red-400 animate-pulse" />
                <h3 className="text-xl font-extrabold text-white">Happening Now (Live Audio Rooms)</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {liveDiscussions.map((d) => (
                  <div key={d.id} className="bg-white/10 border border-white/15 rounded-3xl p-6 flex flex-col justify-between hover:bg-white/15 transition-all">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="px-3 py-0.5 rounded-full bg-red-500/20 text-red-300 text-[11px] font-black uppercase tracking-wider border border-red-400/30 flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                          <span>LIVE</span>
                        </span>
                        <span className="text-xs text-white/60">{d.category}</span>
                      </div>

                      <h4 className="text-lg font-extrabold text-white mb-2">{d.title}</h4>
                      <p className="text-xs text-white/60 mb-4">Hosted by {d.hostName} · {d.listenerCount} listening</p>
                    </div>

                    <button
                      onClick={() => {
                        onClose();
                        onJoinDiscussion(d.id);
                      }}
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-extrabold text-xs shadow-lg flex items-center justify-center gap-2 transition-transform hover:scale-105 cursor-pointer"
                    >
                      <span>Join Room Now</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Shutter Pull-Up Handle Bar + Dark Blue Line & Logo at Bottom */}
          <motion.div
            drag="y"
            dragConstraints={{ top: -250, bottom: 0 }}
            dragElastic={0.3}
            onDragEnd={(_, info) => {
              if (info.offset.y < -30 || info.velocity.y < -80) {
                onClose();
              }
            }}
            onClick={onClose}
            className="w-full relative z-50 cursor-grab active:cursor-grabbing select-none flex flex-col items-center justify-center pt-2 bg-[#090928] border-t border-white/10"
            title="Drag Up or Click to Close Shutter"
          >
            {/* Pull Up Indicator Pill */}
            <div className="px-5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-black flex items-center gap-2 mb-2 border border-white/20">
              <ChevronUp className="w-4 h-4 text-blue-300 animate-bounce" />
              <span>Drag Up or Click Dark Blue Line to Close</span>
            </div>

            {/* Bottom dark blue line & logo tab attached */}
            <div className="w-full relative">
              <div className="w-full h-3 bg-[#0F0F3D]" />
              <div className="absolute left-1/2 -translate-x-1/2 bottom-0 flex items-center justify-center pointer-events-none">
                <svg width="360" height="48" viewBox="0 0 360 48" fill="none">
                  <path d="M 0 0 H 360 V 8 H 270 C 240 8, 240 48, 210 48 H 150 C 120 48, 120 8, 90 8 H 0 Z" fill="#0F0F3D" />
                </svg>
                <img src={duneliLogo} alt="Duneli" draggable={false} onDragStart={(e) => e.preventDefault()} className="h-8 w-auto object-contain scale-[3.2] origin-center absolute z-20 top-2.5 pointer-events-none select-none" />
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
