import { useState, useEffect, useMemo } from 'react';
import { motion, useMotionValue, animate } from 'motion/react';
import { Radio, Users, Sparkles, Headphones, Mic, Scale, ChevronUp, ArrowRight, X, Volume2, ShieldCheck, Clock, Calendar, ThumbsUp } from 'lucide-react';
import duneliLogo from '../../assets/logo.png';
import logo3 from '../../assets/3.png';
import { Discussion, Theme, DiscoveryMode, Category, Language, SortOption } from '../types';
import { SearchBar } from './SearchBar';
import { DiscoveryControls } from './DiscoveryControls';

interface ShutterDrawerProps {
  discussions: Discussion[];
  currentTheme: Theme;
  isLoggedIn: boolean;
  onJoinDiscussion: (id: string) => void;
  onShowInterest: (id: string) => void;
  onScheduleDiscussion: (title: string) => void;
  onLoginPrompt: () => void;
  externalIsOpen?: boolean;
}

export function ShutterDrawer({ discussions, currentTheme, isLoggedIn, onJoinDiscussion, onShowInterest, onScheduleDiscussion, onLoginPrompt, externalIsOpen }: ShutterDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [windowHeight, setWindowHeight] = useState(800);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (typeof externalIsOpen === 'boolean') {
      setIsOpen(externalIsOpen);
      if (externalIsOpen) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }, [externalIsOpen]);

  useEffect(() => {
    const handleOpenDrawerEvent = () => {
      setIsOpen(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    window.addEventListener('open-shutter-drawer', handleOpenDrawerEvent);
    return () => window.removeEventListener('open-shutter-drawer', handleOpenDrawerEvent);
  }, []);

  useEffect(() => {
    setWindowHeight(window.innerHeight);
    const handleResize = () => setWindowHeight(window.innerHeight);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const drawerHeight = windowHeight - 120; // Raised further so ABCD 10k+ badge sits comfortably above bottom edge

  useEffect(() => {
    if (isDragging) {
      document.documentElement.style.userSelect = 'none';
      document.documentElement.style.webkitUserSelect = 'none';
      document.body.style.userSelect = 'none';
      document.body.style.webkitUserSelect = 'none';
      document.body.style.cursor = 'grabbing';

      const preventSelection = (e: Event) => e.preventDefault();
      window.addEventListener('selectstart', preventSelection);
      window.addEventListener('dragstart', preventSelection);
      window.addEventListener('selectionchange', preventSelection);

      return () => {
        document.documentElement.style.userSelect = '';
        document.documentElement.style.webkitUserSelect = '';
        document.body.style.userSelect = '';
        document.body.style.webkitUserSelect = '';
        document.body.style.cursor = '';
        window.removeEventListener('selectstart', preventSelection);
        window.removeEventListener('dragstart', preventSelection);
        window.removeEventListener('selectionchange', preventSelection);
      };
    }
  }, [isDragging]);

  useEffect(() => {
    if (isOpen) {
      window.scrollTo(0, 0);
      document.body.scrollTop = 0;
      document.documentElement.scrollTop = 0;
    }
  }, [isOpen]);

  const toggleShutter = () => {
    if (!isOpen) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    setIsOpen(!isOpen);
  };

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDragEnd = (_: any, info: { offset: { y: number }; velocity: { y: number } }) => {
    setIsDragging(false);
    if (!isOpen) {
      if (info.offset.y > 60 || info.velocity.y > 140) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setIsOpen(true);
      }
    } else {
      if (info.offset.y < -60 || info.velocity.y < -140) {
        setIsOpen(false);
      }
    }
  };

  const liveDiscussions = discussions.filter((d) => d.status === 'live');

  // Discovery state for Upcoming Scheduled Discussions inside the shutter
  const [discoveryMode, setDiscoveryMode] = useState<DiscoveryMode>('interest');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'All'>('All');
  const [selectedLanguage, setSelectedLanguage] = useState<Language | 'All'>('All');
  const [sortBy, setSortBy] = useState<SortOption>('trending');

  const filteredUpcoming = useMemo(() => {
    let filtered = discussions.filter((d) => d.status === 'upcoming');

    if (selectedLanguage !== 'All') {
      filtered = filtered.filter((d) => d.language === selectedLanguage);
    }
    if (discoveryMode === 'categories' && selectedCategory !== 'All') {
      filtered = filtered.filter((d) => d.category === selectedCategory);
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest': {
          const aTime = a.scheduledTime || new Date(0);
          const bTime = b.scheduledTime || new Date(0);
          return bTime.getTime() - aTime.getTime();
        }
        case 'trending':
        case 'mostInterested':
        default:
          return b.interestCount - a.interestCount;
      }
    });

    return filtered;
  }, [discussions, discoveryMode, selectedCategory, selectedLanguage, sortBy]);

  const formatScheduledTime = (scheduledTime: Date) => {
    const now = new Date();
    const diff = scheduledTime.getTime() - now.getTime();
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(hours / 24);
    if (hours < 1) return 'Starting soon';
    if (hours < 24) return `In ${hours}h`;
    if (days === 1) return 'Tomorrow';
    return `In ${days} days`;
  };

  const formatFullTime = (date: Date) => {
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const handleInterestClick = (discussionId: string) => {
    if (!isLoggedIn) {
      onLoginPrompt();
      return;
    }
    onShowInterest(discussionId);
  };

  const formatElapsedTime = (startedTime: Date) => {
    const now = new Date();
    const diff = now.getTime() - startedTime.getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ${minutes % 60}m ago`;
  };

  return (
    <>
      {/* Dim Backdrop Overlay */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={toggleShutter}
          className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-40 transition-opacity"
        />
      )}

      {/* SINGLE UNIFIED DRAGGABLE CONTAINER (PANEL + BOTTOM HANDLE ATTACHED AS 1 NODE) */}
      <motion.div
        initial={false}
        drag="y"
        dragConstraints={isOpen ? { top: -drawerHeight, bottom: 0 } : { top: 0, bottom: drawerHeight }}
        dragElastic={0.12}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        animate={{ y: isOpen ? 0 : -drawerHeight }}
        transition={{ type: 'spring', stiffness: 220, damping: 26 }}
        className="fixed top-0 left-0 right-0 z-50 flex flex-col items-center select-none"
      >
        {/* 1. White Shutter Body Panel */}
        <div
          className="w-full bg-white/95 backdrop-blur-2xl text-[#1A1A2E] shadow-[0_30px_90px_rgba(15,15,61,0.15)] overflow-y-auto pointer-events-auto border-b border-blue-100 relative"
          style={{ height: `${drawerHeight}px`, fontFamily: 'Plus Jakarta Sans, sans-serif' }}
        >
          {/* Ambient Background Glow Spot */}
          <div className="absolute top-0 right-1/4 w-96 h-96 rounded-full bg-gradient-to-br from-blue-300/20 via-purple-300/20 to-pink-300/20 blur-3xl pointer-events-none" />

          <div className="max-w-7xl mx-auto px-6 sm:px-10 py-8 space-y-8 relative z-10">
            {/* Header inside Shutter */}
            <div className="flex items-center justify-between pb-6 border-b border-slate-200/80">
              <div className="flex items-center gap-3">
                <div className="h-10 w-28 sm:w-36 flex items-center overflow-hidden shrink-0">
                  <img
                    src={duneliLogo}
                    alt="Duneli"
                    draggable={false}
                    className="h-9 w-auto object-contain scale-[2.5] origin-left select-none drop-shadow-sm"
                  />
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#3B5BF6]">Live Audio Hub</span>
                  <h2 className="text-xl sm:text-2xl font-black text-[#1A1A2E] tracking-tight">
                    Duneli Audio Sanctuary
                  </h2>
                </div>
              </div>

              <button
                onClick={toggleShutter}
                className="px-5 py-2 rounded-full bg-[#1A1A2E] hover:bg-[#2d2d4e] text-xs font-extrabold flex items-center gap-2 text-white shadow-md transition-all hover:scale-105 cursor-pointer"
              >
                <span>Close Menu</span>
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick 3 Roles Bar */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-50/80 hover:bg-white border border-purple-100/80 rounded-2xl p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-all">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#7C3AED] to-[#a855f7] text-white flex items-center justify-center shadow-md">
                  <Headphones className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-[#7C3AED]">Listener</h4>
                  <p className="text-xs font-semibold text-[#1A1A2E]/60">Only able to listen — Mic OFF</p>
                </div>
              </div>

              <div className="bg-slate-50/80 hover:bg-white border border-blue-100/80 rounded-2xl p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-all">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#3B5BF6] to-[#6366f1] text-white flex items-center justify-center shadow-md">
                  <Mic className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-[#3B5BF6]">Speaker</h4>
                  <p className="text-xs font-semibold text-[#1A1A2E]/60">Speaks on turn — Orderly queue</p>
                </div>
              </div>

              <div className="bg-slate-50/80 hover:bg-white border border-orange-100/80 rounded-2xl p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-all">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#F97316] to-[#ef4444] text-white flex items-center justify-center shadow-md">
                  <Scale className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-[#F97316]">Debater</h4>
                  <p className="text-xs font-semibold text-[#1A1A2E]/60">Speaks anytime — Open mic access</p>
                </div>
              </div>
            </div>

            {/* Live Audio Rooms */}
            <div>
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <div className="relative flex items-center">
                    <Radio className="w-5 h-5 text-red-500" />
                    <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
                    </span>
                  </div>
                  <h3 className="text-xl font-extrabold text-[#1A1A2E]">Happening Now</h3>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {liveDiscussions.length === 0 ? (
                  <div className="col-span-2 flex flex-col items-center justify-center py-12 rounded-3xl border border-dashed border-blue-200 bg-blue-50/40 text-center">
                    <div className="text-4xl mb-3">🎙️</div>
                    <p className="text-sm font-bold text-[#1A1A2E]/60">No live sessions right now</p>
                    <p className="text-xs text-[#1A1A2E]/40 mt-1">Check back soon or schedule one below</p>
                  </div>
                ) : liveDiscussions.map((d) => (
                  <div
                    key={d.id}
                    className="bg-white border border-blue-100 shadow-xl shadow-blue-50/50 rounded-3xl p-6 flex flex-col justify-between transition-all duration-300 group relative overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 right-0 h-1" style={{ background: 'linear-gradient(90deg, #3B5BF6, #7C3AED, #F97316)' }} />

                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-[#3B5BF6] border border-blue-100">
                            {d.category}
                          </span>
                          <span className="text-xs text-[#1A1A2E]/40">· {d.language}</span>
                        </div>
                        <span className="flex items-center gap-1.5 bg-red-500 text-white px-3 py-1.5 rounded-full shadow-lg shadow-red-200">
                          <span className="relative flex h-1.5 w-1.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white" />
                          </span>
                          <span className="text-xs font-bold uppercase tracking-wider">Live</span>
                        </span>
                      </div>

                      <h4 className="text-lg font-bold text-[#1A1A2E] mb-2 leading-snug">
                        {d.title}
                      </h4>

                      <div className="text-sm text-[#1A1A2E]/50 space-y-0.5 mb-4">
                        {d.startedTime && (
                          <p className="flex items-center gap-1.5">
                            <Clock className="w-3 h-3" />
                            Started {formatElapsedTime(d.startedTime)}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-5 mb-4 text-sm text-[#1A1A2E]/60">
                        <div className="flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5" />
                          <span>{d.listenerCount} listening</span>
                        </div>
                        {d.speakerCount !== undefined && (
                          <div className="flex items-center gap-1.5">
                            <Mic className="w-3.5 h-3.5" />
                            <span>{d.speakerCount} speaking</span>
                          </div>
                        )}
                      </div>

                      {d.currentSpeaker && (
                        <div className="rounded-xl px-4 py-2.5 mb-4 bg-blue-50 border border-blue-100">
                          <p className="text-xs mb-0.5 text-[#3B5BF6]/70">Currently speaking</p>
                          <p className="text-sm font-semibold text-[#1A1A2E]">{d.currentSpeaker}</p>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => {
                        toggleShutter();
                        onJoinDiscussion(d.id);
                      }}
                      className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#3B5BF6] to-[#7C3AED] hover:from-[#2b4be6] hover:to-[#6b2adb] text-white font-extrabold text-xs shadow-lg shadow-blue-200 flex items-center justify-center gap-2 transition-transform hover:scale-[1.02] cursor-pointer"
                    >
                      <span>Join Discussion</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Search + Discovery Controls */}
            <div>
              <SearchBar
                currentTheme={currentTheme}
                allDiscussions={discussions}
                selectedLanguage={selectedLanguage}
                isLoggedIn={isLoggedIn}
                onScheduleDiscussion={onScheduleDiscussion}
                onLoginPrompt={onLoginPrompt}
                onJoinDiscussion={(id) => { toggleShutter(); onJoinDiscussion(id); }}
              />

              <div className="mt-6">
                <DiscoveryControls
                  currentTheme={currentTheme}
                  mode={discoveryMode}
                  onModeChange={setDiscoveryMode}
                  selectedCategory={selectedCategory}
                  onCategoryChange={setSelectedCategory}
                  selectedLanguage={selectedLanguage}
                  onLanguageChange={setSelectedLanguage}
                  sortBy={sortBy}
                  onSortChange={setSortBy}
                />
              </div>
            </div>

            {/* Upcoming Scheduled Discussions */}
            <div>
              <div className="flex items-center gap-3 mb-5">
                <Calendar className="w-5 h-5 text-[#7C3AED]" />
                <h3 className="text-xl font-extrabold text-[#1A1A2E]">Upcoming Scheduled Discussions</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredUpcoming.length === 0 ? (
                  <div className="col-span-3 flex flex-col items-center justify-center py-12 rounded-3xl border border-dashed border-purple-200 bg-purple-50/30 text-center">
                    <div className="text-4xl mb-3">📅</div>
                    <p className="text-sm font-bold text-[#1A1A2E]/60">No upcoming discussions scheduled</p>
                    <p className="text-xs text-[#1A1A2E]/40 mt-1">Be the first — schedule a topic using the search bar above</p>
                  </div>
                ) : filteredUpcoming.map((d) => (
                  <div
                    key={d.id}
                    className="rounded-3xl overflow-hidden bg-white border border-blue-100/70 shadow-lg shadow-blue-50/50 hover:shadow-xl hover:shadow-blue-100/50 transition-shadow"
                  >
                    <div className="h-0.5 w-full" style={{ background: 'linear-gradient(90deg, #3B5BF6, #7C3AED)' }} />

                    <div className="p-5">
                      <div className="flex items-center justify-between mb-4">
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-purple-50 text-[#7C3AED] border border-purple-100">
                          {d.category}
                        </span>
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-[#3B5BF6]">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{d.scheduledTime && formatScheduledTime(d.scheduledTime)}</span>
                        </div>
                      </div>

                      <h4 className="text-base font-bold mb-3 line-clamp-3 text-[#1A1A2E]">
                        {d.title}
                      </h4>

                      <div className="text-xs mb-4 space-y-1 text-[#1A1A2E]/50">
                        <p>{d.scheduledTime && formatFullTime(d.scheduledTime)}</p>
                        <p>{d.duration} min · {d.language}</p>
                      </div>

                      <div className="flex items-center gap-1.5 mb-4 text-xs text-[#1A1A2E]/50">
                        <ThumbsUp className="w-3.5 h-3.5" />
                        <span>{d.interestCount} interested</span>
                      </div>

                      <button
                        onClick={() => handleInterestClick(d.id)}
                        className={`w-full px-5 py-2.5 rounded-2xl text-sm font-semibold transition-all hover:scale-105 ${
                          d.hasUserInterest
                            ? 'text-white shadow-md shadow-blue-200'
                            : 'bg-blue-50 border border-blue-100 text-[#3B5BF6] hover:bg-blue-100'
                        }`}
                        style={d.hasUserInterest ? { background: 'linear-gradient(135deg, #3B5BF6, #7C3AED)' } : {}}
                      >
                        <div className="flex items-center justify-center gap-2">
                          <ThumbsUp className={`w-3.5 h-3.5 ${d.hasUserInterest ? 'fill-current' : ''}`} />
                          <span>{d.hasUserInterest ? 'Interested ✓' : 'Show Interest'}</span>
                        </div>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 2. Directly Attached Bottom Handle: Dark Blue Line + SVG Dip + Logo */}
        <div
          onClick={toggleShutter}
          className="w-full relative select-none group"
        >
          {/* Dark Blue Horizontal Line */}
          <div className="w-full h-3 bg-[#0F0F3D] hover:bg-[#18185c] transition-colors shadow-md pointer-events-auto cursor-grab active:cursor-grabbing" />

          {/* Centered SVG Dip Tab + Logo Handle */}
          <div className="absolute left-1/2 -translate-x-1/2 top-0 flex flex-col items-center pointer-events-auto cursor-grab active:cursor-grabbing z-20">
            <svg width="360" height="48" viewBox="0 0 360 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="pointer-events-auto cursor-grab active:cursor-grabbing">
              <path d="M 0 0 H 360 V 8 H 270 C 240 8, 240 48, 210 48 H 150 C 120 48, 120 8, 90 8 H 0 Z" fill="#0F0F3D" />
            </svg>

            {/* Duneli Logo Centered over Tab */}
            <img
              src={logo3}
              alt="Duneli"
              draggable={false}
              onDragStart={(e) => e.preventDefault()}
              className="h-8 w-auto object-contain scale-[3.2] origin-center absolute z-20 top-2.5 pointer-events-auto cursor-grab active:cursor-grabbing select-none transition-transform group-hover:scale-[3.4]"
            />

            {/* Left side callout text comfortably outside logo tab (Visible ONLY when shutter is closed) */}
            {!isOpen && (
              <div className="absolute right-[265px] sm:right-[285px] top-3.5 sm:top-4 flex items-center gap-1.5 text-[10px] sm:text-xs font-extrabold text-[#1A1A2E] tracking-wider uppercase whitespace-nowrap select-none pointer-events-none transition-opacity duration-300">
                <span>CLICK HERE</span>
                <span className="animate-pulse text-[#3B5BF6] text-xs sm:text-sm font-black">➔</span>
              </div>
            )}

            {/* Right side callout text comfortably outside logo tab (Visible ONLY when shutter is closed) */}
            {!isOpen && (
              <div className="absolute left-[265px] sm:left-[285px] top-3.5 sm:top-4 flex items-center gap-1.5 text-[10px] sm:text-xs font-extrabold text-[#1A1A2E] tracking-wider uppercase whitespace-nowrap select-none pointer-events-none transition-opacity duration-300">
                <span className="animate-pulse text-[#3B5BF6] text-xs sm:text-sm font-black">⬅</span>
                <span>FOR MORE</span>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </>
  );
}
