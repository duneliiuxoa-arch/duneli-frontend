import { Search, Loader, AlertCircle } from 'lucide-react';
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
    if (searchQuery.length >= 3) {
      setIsSearching(true);
      
      // Simulate AI search with delay
      const timer = setTimeout(() => {
        // Filter by language first, then search
        let discussionsToSearch = allDiscussions;
        if (selectedLanguage !== 'All') {
          discussionsToSearch = allDiscussions.filter(d => d.language === selectedLanguage);
        }
        
        const similar = discussionsToSearch.filter(d =>
          d.title.toLowerCase().includes(searchQuery.toLowerCase())
        ).slice(0, 5);
        
        const live = similar.filter(d => d.status === 'live');
        const upcoming = similar.filter(d => d.status === 'upcoming');
        
        setSimilarDiscussions({ live, upcoming });
        setIsSearching(false);
        setShowResults(true);
      }, 300);

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
    }
  };

  const totalResults = similarDiscussions.live.length + similarDiscussions.upcoming.length;
  const hasResults = totalResults > 0;

  return (
    <div className="w-full max-w-3xl mx-auto relative">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${theme.cardStyle} rounded-2xl px-6 py-4 flex items-center gap-4`}
      >
        <Search className="w-5 h-5 opacity-60" />
        <input
          type="text"
          placeholder="Search discussions by topic..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={`flex-1 bg-transparent outline-none placeholder:opacity-50 ${theme.textColor}`}
          style={{ fontFamily: 'var(--font-body)' }}
        />
        {isSearching && <Loader className="w-5 h-5 animate-spin opacity-60" />}
      </motion.div>

      <AnimatePresence>
        {showResults && searchQuery.length >= 3 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`absolute top-full mt-2 w-full ${theme.cardStyle} rounded-2xl overflow-hidden z-50 max-h-[500px] overflow-y-auto`}
          >
            {isSearching ? (
              <div className="px-6 py-6 text-center">
                <Loader className="w-6 h-6 animate-spin mx-auto mb-2 opacity-60" />
                <p className={`text-sm ${theme.textColor} opacity-60`}>
                  Checking similar topics...
                </p>
              </div>
            ) : hasResults ? (
              <>
                <div className={`px-6 py-3 border-b ${theme.textColor === 'text-white' ? 'border-white/10' : 'border-gray-200'} flex items-center gap-2 opacity-70`}>
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm">Similar discussions found</span>
                </div>

                {/* Live Discussions */}
                {similarDiscussions.live.length > 0 && (
                  <>
                    <div className={`px-6 py-2 ${theme.textColor} opacity-50 text-xs uppercase tracking-wider`}>
                      Live Discussions
                    </div>
                    {similarDiscussions.live.map((discussion) => (
                      <button
                        key={discussion.id}
                        className={`w-full px-6 py-4 hover:bg-white/10 text-left transition-colors border-b ${theme.textColor === 'text-white' ? 'border-white/5' : 'border-gray-100'}`}
                        onClick={() => {
                          setSearchQuery('');
                          setShowResults(false);
                        }}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className={`font-medium line-clamp-2 mb-1 ${theme.textColor}`}>
                              {discussion.title}
                            </div>
                            <div className={`text-sm ${theme.textColor} opacity-60`}>
                              {discussion.listenerCount} listening · {discussion.category}
                            </div>
                          </div>
                          <span className="flex-shrink-0 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                            LIVE
                          </span>
                        </div>
                      </button>
                    ))}
                  </>
                )}

                {/* Upcoming Discussions */}
                {similarDiscussions.upcoming.length > 0 && (
                  <>
                    <div className={`px-6 py-2 ${theme.textColor} opacity-50 text-xs uppercase tracking-wider mt-2`}>
                      Upcoming Discussions
                    </div>
                    {similarDiscussions.upcoming.map((discussion) => (
                      <button
                        key={discussion.id}
                        className={`w-full px-6 py-4 hover:bg-white/10 text-left transition-colors border-b ${theme.textColor === 'text-white' ? 'border-white/5' : 'border-gray-100'} last:border-b-0`}
                        onClick={() => {
                          setSearchQuery('');
                          setShowResults(false);
                        }}
                      >
                        <div className={`font-medium line-clamp-2 mb-1 ${theme.textColor}`}>
                          {discussion.title}
                        </div>
                        <div className={`text-sm ${theme.textColor} opacity-60`}>
                          {discussion.interestCount} interested · {discussion.category}
                        </div>
                      </button>
                    ))}
                  </>
                )}

                <div className={`border-t ${theme.textColor === 'text-white' ? 'border-white/10' : 'border-gray-200'}`} />
              </>
            ) : (
              <div className="px-6 py-4">
                <p className={`${theme.textColor} opacity-70 text-sm mb-2`}>
                  This topic doesn't exist yet.
                </p>
                <p className={`${theme.textColor} opacity-50 text-sm`}>
                  Schedule a discussion?
                </p>
              </div>
            )}
            
            <button
              onClick={handleScheduleDiscussion}
              className={`w-full px-6 py-4 ${theme.buttonClass} transition-colors font-medium`}
            >
              {hasResults ? 'Schedule new discussion anyway' : `Schedule discussion: "${searchQuery}"`}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
