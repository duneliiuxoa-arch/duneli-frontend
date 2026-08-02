import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Search, Mic, Shield, Headphones, HelpCircle, ChevronRight } from 'lucide-react';

interface HelpCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HelpCenterModal({ isOpen, onClose }: HelpCenterModalProps) {
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const helpTopics = [
    {
      icon: Mic,
      title: 'Microphone & Audio Permissions',
      desc: 'Troubleshoot browser mic access, clear device mute, and select input sources.',
    },
    {
      icon: Shield,
      title: 'Understanding Anonymous Modes',
      desc: 'How Duneli keeps your identity, voice pitch, and profile 100% private.',
    },
    {
      icon: Headphones,
      title: 'Role Permissions & Queues',
      desc: 'Differences between Listener, Speaker, and Debater participation modes.',
    },
    {
      icon: HelpCircle,
      title: 'Dunora Integration Support',
      desc: 'Linking your audio room thoughts to Dunora async discourse trees.',
    },
  ];

  const filteredTopics = helpTopics.filter(t =>
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.desc.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          <div className="relative p-6 sm:p-7 bg-gradient-to-r from-[#3B5BF6] to-[#7C3AED] text-white shrink-0">
            <button
              onClick={onClose}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md flex items-center justify-center text-white transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <h2 className="text-xl sm:text-3xl font-black mb-1.5">Duneli Help Center</h2>
            <p className="text-white/85 text-xs sm:text-sm mb-4">Find guides, troubleshooting steps, and audio room tutorials.</p>

            {/* Search Input */}
            <div className="relative max-w-lg">
              <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search audio issues, roles, or Dunora..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 rounded-2xl bg-white text-[#1A1A2E] placeholder:text-slate-400 text-xs sm:text-sm font-semibold shadow-lg outline-none border border-transparent focus:border-white"
              />
            </div>
          </div>

          {/* Help Topics */}
          <div className="p-5 sm:p-6 space-y-3 flex-1 overflow-y-auto">
            {filteredTopics.map((topic, i) => (
              <div
                key={i}
                className="p-4 rounded-2xl bg-slate-50 hover:bg-blue-50/60 border border-slate-200/80 transition-all flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-2xl bg-[#3B5BF6]/10 text-[#3B5BF6] flex items-center justify-center font-bold shrink-0">
                    <topic.icon className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-[#1A1A2E] group-hover:text-[#3B5BF6] transition-colors">
                      {topic.title}
                    </h4>
                    <p className="text-xs text-[#1A1A2E]/70 mt-0.5">{topic.desc}</p>
                  </div>
                </div>
                <ChevronRight className="w-4.5 h-4.5 text-slate-400 group-hover:text-[#3B5BF6] group-hover:translate-x-1 transition-all shrink-0" />
              </div>
            ))}
          </div>

          <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200/80 flex items-center justify-between shrink-0">
            <span className="text-xs text-[#1A1A2E]/60 font-semibold flex items-center gap-1">
              <span>Duneli Support Desk:</span>
              <a href="mailto:Iuxoa.officail@gmail.com" className="text-[#3B5BF6] font-bold hover:underline select-all">Iuxoa.officail@gmail.com</a>
            </span>
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
