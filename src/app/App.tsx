import { useState, useMemo, useEffect, useCallback } from 'react';
import { EntryScreen } from './components/EntryScreen';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { HappeningNow } from './components/HappeningNow';
import { SearchBar } from './components/SearchBar';
import { DiscoveryControls } from './components/DiscoveryControls';
import { UpcomingDiscussions } from './components/UpcomingDiscussions';
import { PhilosophyBanner } from './components/PhilosophyBanner';
import { NotificationPanel } from './components/NotificationPanel';
import { LoginModal } from './components/LoginModal';
import { RoleSelectionPage } from './components/RoleSelectionPage';
import { MeetingPage } from './components/MeetingPage';
import { LeavingMeetingPage } from './components/LeavingMeetingPage';
import { PrivacyPolicyPage } from './components/PrivacyPolicyPage';
import { NotFoundPage } from './components/NotFoundPage';
import { MyActivityPage, MyTopicsPage, SupportedTopicsPage, SavedTopicsPage, NotificationsPage } from './components/UserPages';
import { Discussion, User, Notification, Theme, DiscoveryMode, Category, SortOption, Language, Page, Role } from './types';
import { themes } from './config/themes';
import { onAuthChange, checkRedirectResult } from '../services/authService';
import { fetchDiscussions, createTopic, voteTopic, joinMeeting, leaveMeeting } from '../services/discussionService';

// ── Blank guest user ──────────────────────────────────────────
const GUEST_USER: User = { id: 'guest', name: 'Guest', avatar: '', isLoggedIn: false };

// ── Map backend topic → frontend Discussion ───────────────────
function mapTopic(t: any): Discussion {
  let status: Discussion['status'] = 'upcoming';
  if (t.meeting) {
    if (t.meeting.status === 'SCHEDULED') status = 'live';
    else if (t.meeting.status === 'COMPLETED') status = 'ended';
  }
  return {
    id:              t.id,
    title:           t.title,
    category:        (t.category as Discussion['category']) || 'Technology',
    language:        (t.language as Discussion['language'])  || 'English',
    status,
    interestCount:   t.voteCount  || 0,
    listenerCount:   t.meeting?.attendeeCount,
    speakerCount:    undefined,
    scheduledTime:   t.meeting?.meetingDate ? new Date(t.meeting.meetingDate) : undefined,
    startedTime:     status === 'live' && t.meeting?.meetingDate ? new Date(t.meeting.meetingDate) : undefined,
    hostId:          t.host?.id   || '',
    hostName:        t.host?.name || 'Unknown',
    hasUserInterest: t.hasUserVoted || false,
  };
}

// ── Persist page across tab switches / reloads ───────────────
const SAFE_PAGES: Page[] = ['homepage', 'myActivity', 'myTopics', 'supportedTopics', 'savedTopics', 'notifications'];

function getPersistedPage(): Page {
  try {
    const saved = sessionStorage.getItem('duneli_page') as Page | null;
    if (saved && SAFE_PAGES.includes(saved)) return saved;
  } catch {}
  return 'homepage';
}

function persistPage(page: Page) {
  try {
    if (SAFE_PAGES.includes(page)) sessionStorage.setItem('duneli_page', page);
    else sessionStorage.removeItem('duneli_page');
  } catch {}
}

export default function App() {
  // ── Page state ─────────────────────────────────────────────
  const [currentPage, setCurrentPageRaw] = useState<Page>(getPersistedPage);
  const [selectedDiscussion, setSelectedDiscussion] = useState<Discussion | null>(null);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  const setCurrentPage = useCallback((page: Page) => {
    persistPage(page);
    setCurrentPageRaw(page);
  }, []);

  // ── Theme ──────────────────────────────────────────────────
  const [currentTheme, setCurrentTheme] = useState<Theme>(() => {
    try { return (localStorage.getItem('duneli_theme') as Theme) || 'dream'; } catch { return 'dream'; }
  });

  const handleThemeChange = useCallback((t: Theme) => {
    try { localStorage.setItem('duneli_theme', t); } catch {}
    setCurrentTheme(t);
  }, []);

  // ── User ───────────────────────────────────────────────────
  const [user, setUser] = useState<User>(GUEST_USER);

  // ── Data ───────────────────────────────────────────────────
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // ── Discovery ──────────────────────────────────────────────
  const [discoveryMode, setDiscoveryMode] = useState<DiscoveryMode>('interest');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'All'>('All');
  const [selectedLanguage, setSelectedLanguage] = useState<Language | 'All'>('All');
  const [sortBy, setSortBy] = useState<SortOption>('trending');

  // ── Modal ──────────────────────────────────────────────────
  const [showLoginModal, setShowLoginModal] = useState(false);

  const theme = themes[currentTheme];

  // ── Load discussions from real API ─────────────────────────
  const loadDiscussions = useCallback(async () => {
    setLoading(true);
    try {
      const topics = await fetchDiscussions('ALL');
      setDiscussions(topics.map(mapTopic));
    } catch (err) {
      console.error('[App] Failed to load discussions:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Auth init + listener ───────────────────────────────────
  useEffect(() => {
    checkRedirectResult().then(supabaseUser => {
      if (supabaseUser) {
        setUser({
          id:         supabaseUser.id,
          name:       supabaseUser.user_metadata?.full_name || supabaseUser.email?.split('@')[0] || 'User',
          avatar:     supabaseUser.user_metadata?.avatar_url || '',
          isLoggedIn: true,
        });
        setCurrentPage('homepage');
      }
    });

    const unsubscribe = onAuthChange((supabaseUser) => {
      if (supabaseUser) {
        setUser({
          id:         supabaseUser.id,
          name:       supabaseUser.user_metadata?.full_name || supabaseUser.email?.split('@')[0] || 'User',
          avatar:     supabaseUser.user_metadata?.avatar_url || '',
          isLoggedIn: !supabaseUser.is_anonymous,
        });
        // only redirect to homepage if currently on entry screen
        setCurrentPageRaw(prev => prev === 'entry' ? 'homepage' : prev);
      } else {
        setUser(GUEST_USER);
      }
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    loadDiscussions();
    const interval = setInterval(loadDiscussions, 60_000);
    return () => clearInterval(interval);
  }, [loadDiscussions]);

  // ── Handlers ───────────────────────────────────────────────
  const handleLogin = useCallback((supabaseUser?: any) => {
    if (supabaseUser) {
      setUser({
        id:         supabaseUser.id,
        name:       supabaseUser.user_metadata?.full_name || supabaseUser.email?.split('@')[0] || 'User',
        avatar:     supabaseUser.user_metadata?.avatar_url || '',
        isLoggedIn: true,
      });
    }
    setCurrentPage('homepage');
  }, []);

  const handleLogout = useCallback(() => {
    setUser(GUEST_USER);
    setCurrentPage('homepage');
  }, []);

  const handleNavigate        = useCallback((page: Page) => setCurrentPage(page), []);

  const handleShowInterest = useCallback(async (discussionId: string) => {
    setDiscussions(prev => prev.map(d =>
      d.id === discussionId
        ? { ...d, hasUserInterest: !d.hasUserInterest, interestCount: d.hasUserInterest ? d.interestCount - 1 : d.interestCount + 1 }
        : d
    ));
    try {
      await voteTopic(discussionId);
    } catch {
      setDiscussions(prev => prev.map(d =>
        d.id === discussionId
          ? { ...d, hasUserInterest: !d.hasUserInterest, interestCount: d.hasUserInterest ? d.interestCount - 1 : d.interestCount + 1 }
          : d
      ));
    }
  }, []);

  const handleScheduleDiscussion = useCallback(async (title: string) => {
    try {
      const newTopic = await createTopic(title);
      const newDiscussion = mapTopic(newTopic);
      setDiscussions(prev => [newDiscussion, ...prev]);
      const notif: Notification = {
        id:              `notif-${Date.now()}`,
        type:            'discussionScheduled',
        message:         'Your discussion has been scheduled',
        discussionId:    newDiscussion.id,
        discussionTitle: newDiscussion.title,
        timestamp:       new Date(),
        read:            false,
      };
      setNotifications(prev => [notif, ...prev]);
    } catch (err) {
      console.error('[App] Failed to schedule discussion:', err);
    }
  }, []);

  const handleJoinDiscussion = useCallback((discussionId: string) => {
    const discussion = discussions.find(d => d.id === discussionId);
    if (discussion) { setSelectedDiscussion(discussion); setCurrentPage('roleSelection'); }
  }, [discussions]);

  const handleSelectRole = useCallback((role: Role) => {
    setSelectedRole(role);
    setCurrentPage('meeting');
    // Record attendee in DB
    if (selectedDiscussion) joinMeeting(selectedDiscussion.id).catch(console.error);
  }, [selectedDiscussion]);

  const handleLeaveMeeting = useCallback(() => {
    setCurrentPage('leaving');
    // Record leftAt in DB
    if (selectedDiscussion) leaveMeeting(selectedDiscussion.id).catch(console.error);
  }, [selectedDiscussion]);
  const handleReturnHome          = useCallback(() => { setCurrentPage('homepage'); setSelectedDiscussion(null); setSelectedRole(null); loadDiscussions(); }, [loadDiscussions]);
  const handleBackFromRoleSelection = useCallback(() => { setCurrentPage('homepage'); setSelectedDiscussion(null); }, []);
  const handleMarkAsRead          = useCallback((id: string) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n)), []);
  const handleMarkAllAsRead       = useCallback(() => setNotifications(prev => prev.map(n => ({ ...n, read: true }))), []);
  const handleLoginPrompt         = useCallback(() => setShowLoginModal(true), []);

  // ── Filtered + sorted discussions ─────────────────────────
  const filteredDiscussions = useMemo(() => {
    let filtered = [...discussions];
    if (selectedLanguage !== 'All') filtered = filtered.filter(d => d.language === selectedLanguage);
    if (discoveryMode === 'categories' && selectedCategory !== 'All') filtered = filtered.filter(d => d.category === selectedCategory);
    if (discoveryMode === 'interest') filtered = filtered.filter(d => d.status === 'upcoming');
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'trending':
        case 'mostInterested': return b.interestCount - a.interestCount;
        case 'newest': {
          const aT = a.scheduledTime || a.startedTime || new Date(0);
          const bT = b.scheduledTime || b.startedTime || new Date(0);
          return bT.getTime() - aT.getTime();
        }
        default: return 0;
      }
    });
    return filtered;
  }, [discussions, discoveryMode, selectedCategory, selectedLanguage, sortBy]);

  // ── Saved discussions (client-side for now) ───────────────
  const savedDiscussions = discussions
    .filter(d => d.hasUserSaved)
    .map(d => ({ id: d.id, title: d.title, status: d.status, interestCount: d.interestCount }));

  // ── Page renders ───────────────────────────────────────────
  if (currentPage === 'entry')
    return <EntryScreen onLogin={handleLogin} />;

  if (currentPage === 'myActivity')
    return <MyActivityPage currentTheme={currentTheme} onBack={() => setCurrentPage('homepage')} />;

  if (currentPage === 'myTopics')
    return <MyTopicsPage currentTheme={currentTheme} onBack={() => setCurrentPage('homepage')} />;

  if (currentPage === 'supportedTopics')
    return <SupportedTopicsPage currentTheme={currentTheme} onBack={() => setCurrentPage('homepage')} />;

  if (currentPage === 'savedTopics')
    return <SavedTopicsPage currentTheme={currentTheme} onBack={() => setCurrentPage('homepage')} savedDiscussions={savedDiscussions} />;

  if (currentPage === 'notifications')
    return <NotificationsPage currentTheme={currentTheme} onBack={() => setCurrentPage('homepage')} notifications={notifications} onMarkAsRead={handleMarkAsRead} onMarkAllAsRead={handleMarkAllAsRead} />;

  if (currentPage === 'roleSelection' && selectedDiscussion)
    return <RoleSelectionPage discussion={selectedDiscussion} currentTheme={currentTheme} onSelectRole={handleSelectRole} onBack={handleBackFromRoleSelection} />;

  if (currentPage === 'meeting' && selectedDiscussion && selectedRole)
    return <MeetingPage discussion={selectedDiscussion} currentTheme={currentTheme} userRole={selectedRole} userName={user.name} onLeave={handleLeaveMeeting} />;

  if (currentPage === 'privacy')
    return <PrivacyPolicyPage currentTheme={currentTheme} onBack={() => setCurrentPage('homepage')} />;

  if (currentPage === 'notFound')
    return <NotFoundPage currentTheme={currentTheme} onBack={() => setCurrentPage('homepage')} currentPath={window.location.pathname} />;

  if (currentPage === 'leaving' && selectedDiscussion)
    return <LeavingMeetingPage discussionTitle={selectedDiscussion.title} currentTheme={currentTheme} onReturnHome={handleReturnHome} />;

  // ── Homepage ───────────────────────────────────────────────
  return (
    <div
      className={`min-h-screen transition-all duration-700 ${theme.textColor}`}
      style={{ background: theme.background, fontFamily: 'var(--font-body)' }}
    >
      <Header
        user={user}
        currentTheme={currentTheme}
        onThemeChange={handleThemeChange}
        onLogin={() => setShowLoginModal(true)}
        onLogout={handleLogout}
        onNavigate={handleNavigate}
      />

      <Hero currentTheme={currentTheme} textColor={theme.textColor} />

      {loading ? (
        <div className={`text-center py-24 ${theme.textColor} opacity-50`}>Loading discussions...</div>
      ) : (
        <>
          <HappeningNow discussions={discussions} currentTheme={currentTheme} isLoggedIn={user.isLoggedIn} onJoinDiscussion={handleJoinDiscussion} onLoginPrompt={handleLoginPrompt} />
          <div className="max-w-7xl mx-auto px-4 py-8 sm:px-8 sm:py-12">
            <SearchBar currentTheme={currentTheme} allDiscussions={discussions} selectedLanguage={selectedLanguage} isLoggedIn={user.isLoggedIn} onScheduleDiscussion={handleScheduleDiscussion} onLoginPrompt={handleLoginPrompt} />
            <div className="mt-8">
              <DiscoveryControls currentTheme={currentTheme} mode={discoveryMode} onModeChange={setDiscoveryMode} selectedCategory={selectedCategory} onCategoryChange={setSelectedCategory} selectedLanguage={selectedLanguage} onLanguageChange={setSelectedLanguage} sortBy={sortBy} onSortChange={setSortBy} />
            </div>
          </div>
          <UpcomingDiscussions discussions={filteredDiscussions} currentTheme={currentTheme} isLoggedIn={user.isLoggedIn} onShowInterest={handleShowInterest} onLoginPrompt={handleLoginPrompt} />
        </>
      )}

      <PhilosophyBanner currentTheme={currentTheme} />

      {/* ── Footer ── */}
      <footer className="text-center py-8 px-6" style={{ opacity: 0.45, fontSize: 13 }}>
        <div className={`${theme.textColor} flex items-center justify-center gap-4 flex-wrap`}>
          <span>© 2026 Duneli · IUXOA</span>
          <span>·</span>
          <button
            onClick={() => setCurrentPage('privacy')}
            className="underline underline-offset-2 hover:opacity-80 transition-opacity">
            Privacy Policy
          </button>
          <span>·</span>
          <a href="mailto:hello@duneli.com"
            className="underline underline-offset-2 hover:opacity-80 transition-opacity">
            Contact
          </a>
        </div>
      </footer>

      <NotificationPanel notifications={notifications} currentTheme={currentTheme} onMarkAsRead={handleMarkAsRead} onMarkAllAsRead={handleMarkAllAsRead} />

      <LoginModal isOpen={showLoginModal} currentTheme={currentTheme} onClose={() => setShowLoginModal(false)} onLogin={handleLogin} />
    </div>
  );
}
