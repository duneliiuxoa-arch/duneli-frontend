import { Search, Loader, AlertCircle, CalendarPlus, Plus, Radio, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Theme, Discussion, Language } from '../types';
import { themes } from '../config/themes';
import { motion, AnimatePresence } from 'motion/react';

interface SearchBarProps {
  currentTheme: Theme;
  allDiscussions: Discussion[];
  selectedLanguage: Language | 'All';
  isLoggedIn: boolean;
  onScheduleDiscussion: (title: string) => void;
  onLoginPrompt: () => void;
}

export function SearchBar({ 
  currentTheme, 
  allDiscussions, 
  selectedLanguage,
  isLoggedIn,
  onScheduleDiscussion,
  onLoginPrompt
}: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [similarDiscussions, setSimilarDiscussions] = useState<{
    live: Discussion[];
    upcoming: Discussion[];
  }>({ live: [], upcoming: [] });
  const [showResults, setShowResults] = useState(false);
  const theme = themes[currentTheme];

  useEffect(() => {
    if (searchQuery.length >= 2) {
      setIsSearching(true);
      
      const timer = setTimeout(() => {
        let discussionsToSearch = allDiscussions;
        if (selectedLanguage !== 'All') {
          discussionsToSearch = allDiscussions.filter(d => d.language === selectedLanguage);
        }
        
        const similar = discussionsToSearch.filter(d =>
          d.title.toLowerCase().includes(searchQuery.toLowerCase())
        );
        
        const live = similar.filter(d => d.status === 'live');
        const upcoming = similar.filter(d => d.status === 'upcoming');
        
        setSimilarDiscussions({ live, upcoming });
        setIsSearching(false);
        setShowResults(true);
      }, 200);

      return () => clearTimeout(timer);
    } else {
      setSimilarDiscussions({ live: [], upcoming: [] });
      setShowResults(false);
      setIsSearching(false);
    }
  }, [searchQuery, allDiscussions, selectedLanguage]);

  const handleScheduleDiscussion = () => {
    if (!isLoggedIn) {
      onLoginPrompt();
      return;
    }
    
    if (searchQuery.trim()) {
      onScheduleDiscussion(searchQuery);
      setSearchQuery('');
      setShowResults(false);

      // Scroll smoothly to upcoming sessions so user sees their new scheduled meeting
      setTimeout(() => {
        const el = document.getElementById('upcoming');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }, 150);
    }
  };

  const totalResults = similarDiscussions.live.length + similarDiscussions.upcoming.length;
  const hasResults = totalResults > 0;

  return (
    <div id="search-bar-container" className="w-full max-w-3xl mx-auto relative">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl px-6 py-4 flex items-center gap-4 bg-white border-2 border-blue-200/90 shadow-[0_10px_30px_rgba(59,91,246,0.12)] text-[#1A1A2E] relative z-50 cursor-text pointer-events-auto"
      >
        <Search className="w-5 h-5 text-[#3B5BF6] shrink-0" />
        <input
          id="search-bar-input"
          type="text"
          placeholder="Search meeting by name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 bg-transparent outline-none text-base font-semibold text-[#1A1A2E] placeholder:text-[#1A1A2E]/65 placeholder:font-medium select-text cursor-text relative z-50 pointer-events-auto"
          style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
        />
        {isSearching && <Loader className="w-5 h-5 animate-spin text-[#3B5BF6]" />}
      </motion.div>

      <AnimatePresence>
        {showResults && searchQuery.length >= 2 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full mt-2 w-full rounded-2xl overflow-hidden z-[100] max-h-[500px] overflow-y-auto bg-white border-2 border-blue-200/90 shadow-2xl text-[#1A1A2E]"
          >
            {isSearching ? (
              <div className="px-6 py-6 text-center">
                <Loader className="w-6 h-6 animate-spin mx-auto mb-2 text-[#3B5BF6]" />
                <p className="text-sm font-semibold text-[#1A1A2E]/70">
                  Searching meeting database...
                </p>
              </div>
            ) : hasResults ? (
              <div className="divide-y divide-slate-100">
                <div className="px-6 py-3 bg-blue-50/60 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-extrabold text-[#3B5BF6] uppercase tracking-wider">
                    <AlertCircle className="w-4 h-4" />
                    <span>Matching Meetings Found ({totalResults})</span>
                  </div>
                </div>

                {/* Live Discussions */}
                {similarDiscussions.live.length > 0 && (
                  <div>
                    <div className="px-6 py-2 bg-slate-50 text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <Radio className="w-3.5 h-3.5 text-red-500 animate-pulse" /> Live Now
                    </div>
                    {similarDiscussions.live.map((discussion) => (
                      <div
                        key={discussion.id}
                        className="px-6 py-3.5 hover:bg-blue-50/40 text-left transition-colors flex items-center justify-between gap-4"
                      >
                        <div className="flex-1 min-w-0">
                          <h4 className="font-extrabold text-sm text-[#1A1A2E] truncate">
                            {discussion.title}
                          </h4>
                          <p className="text-xs text-[#1A1A2E]/60 mt-0.5">
                            {discussion.listenerCount} listening · {discussion.category}
                          </p>
                        </div>
                        <span className="shrink-0 px-2.5 py-1 rounded-full bg-red-500 text-white text-[10px] font-black">
                          LIVE
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Upcoming Discussions */}
                {similarDiscussions.upcoming.length > 0 && (
                  <div>
                    <div className="px-6 py-2 bg-slate-50 text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-amber-500" /> Upcoming Meetings
                    </div>
                    {similarDiscussions.upcoming.map((discussion) => (
                      <div
                        key={discussion.id}
                        className="px-6 py-3.5 hover:bg-purple-50/40 text-left transition-colors flex items-center justify-between gap-4"
                      >
                        <div className="flex-1 min-w-0">
                          <h4 className="font-extrabold text-sm text-[#1A1A2E] truncate">
                            {discussion.title}
                          </h4>
                          <p className="text-xs text-[#1A1A2E]/60 mt-0.5">
                            {discussion.interestCount} interested · {discussion.category}
                          </p>
                        </div>
                        <span className="shrink-0 px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                          UPCOMING
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Bottom schedule CTA even if results exist */}
                <div className="p-3 bg-slate-50 border-t border-slate-200/80">
                  <button
                    onClick={handleScheduleDiscussion}
                    className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-[#1A1A2E] text-white text-xs font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Or schedule new meeting: "{searchQuery}"</span>
                  </button>
                </div>
              </div>
            ) : (
              /* When NO meeting is available matching query */
              <div className="p-6 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center mx-auto text-[#3B5BF6]">
                  <CalendarPlus className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-extrabold text-base text-[#1A1A2E]">
                    No meeting available for "{searchQuery}"
                  </h4>
                  <p className="text-xs text-[#1A1A2E]/65 max-w-md mx-auto mt-1 leading-relaxed">
                    This meeting topic isn't available yet. Schedule it now and it will be added directly into <strong>Upcoming Sessions</strong>!
                  </p>
                </div>

                <button
                  onClick={handleScheduleDiscussion}
                  className="w-full mt-2 py-3 px-5 rounded-xl bg-gradient-to-r from-[#3B5BF6] to-[#7C3AED] text-white text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Schedule "{searchQuery}" in Upcoming Sessions</span>
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
