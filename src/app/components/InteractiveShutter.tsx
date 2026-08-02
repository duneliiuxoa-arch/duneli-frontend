import { useState, useRef } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'motion/react';
import { ChevronUp, Radio, Users, Sparkles, Volume2, ArrowRight, Headphones, Mic, Scale, X } from 'lucide-react';
import duneliLogo from '../../assets/logo.png';
import { Discussion, Theme } from '../types';

interface InteractiveShutterProps {
  discussions: Discussion[];
  currentTheme: Theme;
  onJoinDiscussion: (id: string) => void;
}

export function InteractiveShutter({ discussions, currentTheme, onJoinDiscussion }: InteractiveShutterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const y = useMotionValue(0); // 0 = Closed, 1 = Fully Open (0px to 100vh)

  const liveDiscussions = discussions.filter((d) => d.status === 'live');

  // Motion transforms
  // yValue goes from -window.innerHeight (hidden) to 0 (fully open)
  // We use drag on the bottom handle!

  const handleDragEnd = (_: any, info: { offset: { y: number }; velocity: { y: number } }) => {
    // If dragging down from top (closed)
    if (!isOpen) {
      if (info.offset.y > 80 || info.velocity.y > 150) {
        setIsOpen(true);
      }
    } else {
      // If dragging up from open state
      if (info.offset.y < -80 || info.velocity.y < -150) {
        setIsOpen(false);
      }
    }
  };

  return (
    <>
      {/* Real-time Draggable Shutter Panel */}
      <motion.div
        animate={{ y: isOpen ? '0%' : '-100%' }}
        transition={{ type: 'spring', stiffness: 200, damping: 26 }}
        className="fixed top-0 left-0 right-0 z-50 bg-[#0F0F3D] text-white shadow-2xl flex flex-col justify-between max-h-screen overflow-hidden"
        style={{ height: '88vh' }}
      >
        {/* Shutter Main Content */}
        <div className="max-w-7xl w-full mx-auto px-6 py-8 flex-1 overflow-y-auto space-y-8">
          
          {/* Header Bar Inside Shutter */}
          <div className="flex items-center justify-between pb-6 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-300 border border-blue-400/30 flex items-center justify-center font-black">
                D
              </div>
              <span className="text-xl font-extrabold text-white">Duneli Live Command Hub</span>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="px-4 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-xs font-bold flex items-center gap-1.5 text-white transition-all cursor-pointer"
            >
              <span>Close Shutter</span>
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick 3 Roles Bar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-400/30 flex items-center justify-center">
                <Headphones className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-extrabold text-white">Listener 🎧</h4>
                <p className="text-[11px] text-white/60">Only able to listen — Mic OFF</p>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-300 border border-blue-400/30 flex items-center justify-center">
                <Mic className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-extrabold text-white">Speaker 🎙️</h4>
                <p className="text-[11px] text-white/60">Speaks on turn — Queue system</p>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-300 border border-orange-400/30 flex items-center justify-center">
                <Scale className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-extrabold text-white">Debater ⚡</h4>
                <p className="text-[11px] text-white/60">Speaks anytime — Open mic access</p>
              </div>
            </div>
          </div>

          {/* Live Audio Rooms */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Radio className="w-4 h-4 text-red-400 animate-pulse" />
              <h3 className="text-lg font-extrabold text-white">Happening Now (Live Rooms)</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {liveDiscussions.map((d) => (
                <div key={d.id} className="bg-white/10 border border-white/15 rounded-2xl p-5 flex flex-col justify-between hover:bg-white/15 transition-all">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-300 text-[10px] font-black uppercase flex items-center gap-1 border border-red-400/30">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                        <span>LIVE</span>
                      </span>
                      <span className="text-xs text-white/60">{d.category}</span>
                    </div>

                    <h4 className="text-base font-extrabold text-white mb-1">{d.title}</h4>
                    <p className="text-xs text-white/60 mb-3">Hosted by {d.hostName} · {d.listenerCount} listening</p>
                  </div>

                  <button
                    onClick={() => {
                      setIsOpen(false);
                      onJoinDiscussion(d.id);
                    }}
                    className="w-full py-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-extrabold text-xs shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Join Room Now</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* BOTTOM DRAGGABLE SHUTTER HANDLE & DARK BLUE BAR */}
        <motion.div
          drag="y"
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={0.4}
          onDragEnd={handleDragEnd}
          onClick={() => setIsOpen(!isOpen)}
          className="w-full bg-[#0F0F3D] border-t border-white/10 py-3 flex flex-col items-center justify-center cursor-grab active:cursor-grabbing select-none hover:bg-[#151552] transition-colors relative z-50"
        >
          {/* Pull Handle Indicator Line */}
          <div className="w-12 h-1 rounded-full bg-white/40 mb-1" />

          <div className="flex items-center gap-2 text-xs font-black text-blue-200 tracking-wide uppercase">
            <ChevronUp className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-0' : 'rotate-180'}`} />
            <span>{isOpen ? 'Drag up to close shutter' : 'Drag down or click to pull shutter'}</span>
          </div>
        </motion.div>
      </motion.div>

      {/* BACKDROP DIM OVERLAY WHEN OPEN */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40"
        />
      )}
    </>
  );
}
