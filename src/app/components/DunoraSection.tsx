import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, Sparkles, ExternalLink, Search, Bookmark, Share2, Clock, ThumbsUp, ArrowRight, MessageSquare, ShieldCheck, Flame, Filter, CheckCircle2 } from 'lucide-react';
import { Theme } from '../types';

interface DunoraSectionProps {
  currentTheme: Theme;
}

interface Article {
  id: string;
  title: string;
  category: string;
  readTime: string;
  publishedDate: string;
  speakersCount: number;
  likesCount: number;
  excerpt: string;
  keyTakeaways: string[];
  notableQuote: string;
  quoteAuthor: string;
  fullContent: string;
  isPopular?: boolean;
}

const mockArticles: Article[] = [
  {
    id: 'dunora-1',
    title: 'Is Anonymity essential for Genuine Intellectual Discourse?',
    category: 'Privacy & Ethics',
    readTime: '4 min read',
    publishedDate: '2 hours ago',
    speakersCount: 14,
    likesCount: 342,
    isPopular: true,
    excerpt: 'A deep-dive synthesis of Duneli Session #142 exploring how digital identity pressure causes self-censorship and how anonymous spaces unlock unfiltered truth.',
    keyTakeaways: [
      'Anonymity shifts focus from creator clout to argument strength.',
      'Participants reported 80% less hesitation when sharing unconventional views.',
      'Civility is maintained through community moderation rather than real-name threats.',
    ],
    notableQuote: '"When you strip away status symbols and profile pictures, only the pure clarity of the idea remains."',
    quoteAuthor: 'Anonymous Speaker #4',
    fullContent: 'In this recorded session, 14 speakers joined over a 2-hour window to examine the psychological impact of public identity on online discourse. The consensus revealed that real-name requirements often incentivize performative conformity rather than genuine honesty...',
  },
  {
    id: 'dunora-2',
    title: 'Quiet Leadership: Introverts Reclaiming the Workplace Stage',
    category: 'Psychology',
    readTime: '6 min read',
    publishedDate: 'Yesterday',
    speakersCount: 22,
    likesCount: 512,
    isPopular: true,
    excerpt: 'Key takeaways from Duneli Session #189 discussing how introverted leaders leverage active listening and asynchronous communication to outperform loud spaces.',
    keyTakeaways: [
      'Introverted leaders excel at synthesizing complex team inputs.',
      'Audio-only meetings reduce cognitive fatigue compared to forced video streams.',
      'Turn-based queues give thoughtful speakers equal room to contribute.',
    ],
    notableQuote: '"Leadership isn’t about being the loudest room in the house; it’s about creating room for the best solution."',
    quoteAuthor: 'Anonymous Speaker #9',
    fullContent: 'During this discussion, debaters analyzed empirical studies on corporate leadership performance. The findings strongly indicated that introvert-led teams are 20% more productive when managing proactive employees...',
  },
  {
    id: 'dunora-3',
    title: 'The Future of AI Autonomy vs Human Sovereignty',
    category: 'Technology',
    readTime: '5 min read',
    publishedDate: '3 days ago',
    speakersCount: 18,
    likesCount: 289,
    excerpt: 'An article summarizing the heated debate in Session #205 regarding autonomous AI decision-making in high-stakes fields.',
    keyTakeaways: [
      'Human oversight must remain mandatory in critical decision loops.',
      'AI models must remain transparent and auditable by open-source standards.',
      'Ethical frameworks must prioritize human dignity over speed.',
    ],
    notableQuote: '"Delegating moral responsibility to an algorithm is the ultimate abdication of human ethics."',
    quoteAuthor: 'Anonymous Speaker #12',
    fullContent: 'Session #205 brought together engineers, philosophers, and ethics researchers. The debate centered around whether AI agents should possess autonomous decision-making power in medical and legal domains...',
  },
];

export function DunoraSection({ currentTheme }: DunoraSectionProps) {
  const [activeTab, setActiveTab] = useState<'FOR YOU' | 'DUNELI SESSIONS' | 'SAVED COLLECTION'>('FOR YOU');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [savedArticleIds, setSavedArticleIds] = useState<string[]>(['dunora-1']);

  const toggleSaveArticle = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSavedArticleIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const filteredArticles = useMemo(() => {
    let list = mockArticles;
    if (activeTab === 'SAVED COLLECTION') {
      list = list.filter((a) => savedArticleIds.includes(a.id));
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.category.toLowerCase().includes(q) ||
          a.excerpt.toLowerCase().includes(q)
      );
    }
    return list;
  }, [activeTab, searchQuery, savedArticleIds]);

  return (
    <section className="py-24 px-4 sm:px-8 relative overflow-hidden my-12">
      {/* Background Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full blur-[180px] opacity-15 pointer-events-none z-0 bg-gradient-to-r from-[#7C3AED] via-[#3B5BF6] to-[#F97316]" />

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl sm:text-6xl font-black text-[#1A1A2E] leading-tight tracking-tight mb-4"
            style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
          >
            Published on <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#1A1A2E] via-[#7C3AED] to-[#3B5BF6]">DUNORA</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-base sm:text-xl text-[#1A1A2E]/75 leading-relaxed"
          >
            Every live Duneli audio discussion is synthesized into curated, high-value articles on our publication platform <strong className="text-[#1A1A2E] font-black">DUNORA</strong>. Read key takeaways, quotes, and consensus anytime.
          </motion.p>
        </div>

        {/* MOCK DUNORA INTERACTIVE APP FRAME */}
        <div className="bg-white/90 backdrop-blur-2xl border border-white/90 shadow-[0_30px_90px_rgba(15,15,61,0.14)] rounded-3xl overflow-hidden relative">
          
          {/* DUNORA APP HEADER BAR (MATCHING SCREENSHOT) */}
          <div className="px-6 py-4 border-b border-slate-200/80 bg-white/95 flex items-center justify-between flex-wrap gap-4">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#1A1A2E] text-white flex items-center justify-center font-black text-lg shadow-md">
                D
              </div>
              <span className="text-2xl font-serif font-black tracking-tight text-[#1A1A2E]">
                Dunora
              </span>
            </div>

            {/* Navigation Tab */}
            <div className="flex items-center gap-6 text-xs font-bold uppercase tracking-wider">
              <span className="pb-1 relative text-[#1A1A2E] font-black border-b-2 border-[#1A1A2E]">
                FOR YOU
              </span>
            </div>

            {/* Search Input + Action Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
              }}
              className="flex items-center gap-2.5"
            >
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-1.5 rounded-full bg-slate-100/80 border border-slate-200 text-xs font-semibold text-[#1A1A2E] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30 w-44 sm:w-56"
                />
              </div>

              <button
                type="submit"
                className="inline-flex items-center justify-center px-5 py-1.5 rounded-full bg-[#1A1A2E] hover:bg-[#2d2d4e] active:scale-95 text-white text-xs font-extrabold shadow-sm transition-all cursor-pointer shrink-0"
              >
                <span>Search</span>
              </button>
            </form>
          </div>

          {/* DUNORA ARTICLES LIST BODY */}
          <div className="p-6 sm:p-10 min-h-[460px]">
            {filteredArticles.length === 0 ? (
              <div className="text-center py-20 text-slate-400 font-serif italic text-lg">
                No articles found in this collection. Check back soon.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredArticles.map((article) => {
                  const isSaved = savedArticleIds.includes(article.id);
                  return (
                    <motion.div
                      key={article.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      onClick={() => setSelectedArticle(article)}
                      className="bg-white rounded-2xl border border-slate-200/80 p-6 flex flex-col justify-between shadow-sm hover:shadow-xl hover:border-blue-200 transition-all duration-300 group cursor-pointer relative overflow-hidden"
                    >
                      <div>
                        {/* Top Category Tag + Save Bookmark */}
                        <div className="flex items-center justify-between mb-4">
                          <span className="px-3 py-1 rounded-full bg-blue-50 text-[#3B5BF6] border border-blue-100 text-[11px] font-extrabold uppercase tracking-wider">
                            {article.category}
                          </span>

                          <button
                            onClick={(e) => toggleSaveArticle(article.id, e)}
                            className="text-slate-400 hover:text-[#7C3AED] transition-colors p-1"
                            title={isSaved ? 'Remove from Saved' : 'Save Collection'}
                          >
                            <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-[#7C3AED] text-[#7C3AED]' : ''}`} />
                          </button>
                        </div>

                        {/* Article Title */}
                        <h3 className="text-lg sm:text-xl font-bold font-serif text-[#1A1A2E] leading-snug mb-3 group-hover:text-[#3B5BF6] transition-colors">
                          {article.title}
                        </h3>

                        {/* Excerpt */}
                        <p className="text-xs sm:text-sm text-[#1A1A2E]/70 font-sans leading-relaxed mb-6 line-clamp-3">
                          {article.excerpt}
                        </p>
                      </div>

                      {/* Footer Meta */}
                      <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-400">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{article.readTime}</span>
                          </span>
                          <span>·</span>
                          <span>{article.speakersCount} speakers</span>
                        </div>

                        <span className="text-[#3B5BF6] font-bold group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                          <span>Read</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          {/* MOCK DUNORA FOOTER */}
          <div className="px-8 py-4 bg-slate-50 border-t border-slate-200/80 flex items-center justify-between flex-wrap gap-4 text-xs font-semibold text-slate-500">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#3B5BF6]" />
              <span>All articles are automatically generated & peer-verified from live Duneli audio discussions.</span>
            </div>

            <a
              href="https://dunora-next.vercel.app"
              target="_blank"
              rel="noreferrer"
              className="text-[#3B5BF6] font-bold hover:underline flex items-center gap-1"
            >
              <span>DUNORA</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

        </div>

      </div>

      {/* ARTICLE READER MODAL PREVIEW */}
      <AnimatePresence>
        {selectedArticle && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/60 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 sm:p-10 shadow-2xl relative border border-slate-200"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedArticle(null)}
                className="absolute top-6 right-6 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 font-bold transition-colors"
              >
                ✕
              </button>

              {/* Category */}
              <span className="inline-block px-3.5 py-1 rounded-full bg-blue-50 text-[#3B5BF6] border border-blue-100 text-xs font-black uppercase tracking-wider mb-4">
                {selectedArticle.category}
              </span>

              {/* Title */}
              <h2 className="text-2xl sm:text-3xl font-black font-serif text-[#1A1A2E] leading-snug mb-4">
                {selectedArticle.title}
              </h2>

              {/* Meta info */}
              <div className="flex items-center gap-4 text-xs font-bold text-slate-500 mb-6 pb-6 border-b border-slate-100">
                <span>Published {selectedArticle.publishedDate}</span>
                <span>·</span>
                <span>{selectedArticle.readTime}</span>
                <span>·</span>
                <span>{selectedArticle.speakersCount} Duneli Speakers</span>
              </div>

              {/* Key Takeaways Box */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 mb-6">
                <h4 className="text-xs font-black uppercase tracking-wider text-[#7C3AED] mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Key Discussion Takeaways</span>
                </h4>
                <ul className="space-y-2">
                  {selectedArticle.keyTakeaways.map((takeaway, tIdx) => (
                    <li key={tIdx} className="text-xs sm:text-sm font-semibold text-slate-800 flex items-start gap-2.5">
                      <span className="text-[#3B5BF6] font-bold">▪</span>
                      <span>{takeaway}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Quote Highlight */}
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 border-l-4 border-[#7C3AED] p-5 rounded-r-2xl mb-6 italic text-sm text-[#1A1A2E]/90 font-serif">
                {selectedArticle.notableQuote}
                <div className="not-italic text-xs font-extrabold text-[#7C3AED] mt-2">
                  — {selectedArticle.quoteAuthor}
                </div>
              </div>

              {/* Article Content */}
              <p className="text-sm text-slate-700 leading-relaxed font-sans mb-8">
                {selectedArticle.fullContent}
              </p>

              {/* Action Footer */}
              <div className="pt-6 border-t border-slate-100 flex items-center justify-between flex-wrap gap-4">
                <a
                  href="https://dunora-next.vercel.app"
                  target="_blank"
                  rel="noreferrer"
                  className="px-6 py-2.5 rounded-xl bg-[#1A1A2E] hover:bg-[#2d2d4e] text-white text-xs font-extrabold shadow-md flex items-center gap-2"
                >
                  <span>Read Full Article on DUNORA</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <button
                  onClick={() => setSelectedArticle(null)}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
                >
                  Close Reader
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
