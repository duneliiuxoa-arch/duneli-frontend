import { ArrowLeft, Bookmark, ExternalLink, Sparkles, BookOpen, Clock } from 'lucide-react';
import { motion } from 'motion/react';
import { Theme } from '../types';

interface SavedTopicsPageProps {
  currentTheme: Theme;
  onBack: () => void;
  onOpenShutter: () => void;
}

export function SavedTopicsPage({ onBack, onOpenShutter }: SavedTopicsPageProps) {
  const savedTopics = [
    { title: 'Designing Zero-Anxiety Interfaces for Introverts', category: 'Technology', savedOn: 'Jul 30, 2026', type: 'Audio Room', notes: 'Key insight: Decoupling profile picture from voice increases speaking willingness by 84%.' },
    { title: 'The Ethics of Ephemeral Speech', category: 'Politics', savedOn: 'Jul 26, 2026', type: 'Dunora Article', notes: 'Synthesized synthesis of 3 live discussions regarding digital memory retention.' },
    { title: 'Why Ideas Outperform Clout in Silent Forums', category: 'Philosophy', savedOn: 'Jul 21, 2026', type: 'Audio Room Takeaway', notes: 'Automated speaking timers prevent loud monopolization.' },
  ];

  return (
    <div className="min-h-screen bg-[#F4F6FB] text-[#1A1A2E]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-[#1A1A2E] font-extrabold text-sm hover:text-[#3B5BF6] transition-colors cursor-pointer group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </button>
          <span className="text-xs font-black uppercase tracking-widest text-slate-400">Saved Topics</span>
          <button
            onClick={onOpenShutter}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#3B5BF6] to-[#7C3AED] text-white text-xs font-extrabold shadow-md hover:scale-105 transition-all cursor-pointer"
          >
            Explore Rooms
          </button>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
        {/* Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl p-8 bg-gradient-to-r from-[#3B5BF6] via-[#7C3AED] to-[#10b981] text-white shadow-xl"
        >
          <div className="flex items-center gap-2 mb-2">
            <Bookmark className="w-5 h-5 text-yellow-300" />
            <span className="text-xs font-black uppercase tracking-wider bg-white/20 px-3 py-1 rounded-full">Personal Vault</span>
          </div>
          <h1 className="text-3xl font-black mb-2">Saved Topics & Takeaways</h1>
          <p className="text-white/85 text-sm max-w-lg">Your bookmarked discussions, key takeaways, and synthesized articles.</p>
        </motion.div>

        {/* Saved List */}
        <div className="space-y-4">
          {savedTopics.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * idx }}
              className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-0.5 rounded-full text-xs font-black uppercase text-white bg-[#3B5BF6]">
                    {item.category}
                  </span>
                  <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-600">
                    {item.type}
                  </span>
                </div>
                <span className="text-xs font-bold text-slate-400">Saved {item.savedOn}</span>
              </div>

              <h2 className="text-lg font-extrabold text-[#1A1A2E]">{item.title}</h2>
              
              <div className="p-3.5 rounded-2xl bg-blue-50/60 border border-blue-100 text-xs font-medium text-[#1A1A2E]/80 leading-relaxed">
                <strong>Saved Takeaway:</strong> {item.notes}
              </div>

              <div className="flex items-center justify-between pt-2">
                <a
                  href="https://dunora-next.vercel.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-black text-[#3B5BF6] hover:underline"
                >
                  <span>Open in DUNORA</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <button
                  onClick={onOpenShutter}
                  className="px-4 py-1.5 rounded-xl bg-slate-100 hover:bg-[#1A1A2E] hover:text-white text-xs font-extrabold transition-all cursor-pointer"
                >
                  View Discussion
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
