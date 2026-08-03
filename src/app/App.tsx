import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { EntryScreen } from './components/EntryScreen';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { NotificationPanel } from './components/NotificationPanel';
import { LoginModal } from './components/LoginModal';
import { RoleSelectionPage } from './components/RoleSelectionPage';
import { MeetingPage } from './components/MeetingPage';
import { LeavingMeetingPage } from './components/LeavingMeetingPage';
import { AuroraBackground } from './components/AuroraBackground';
import { HowDuneliWorks3D } from './components/HowDuneliWorks3D';
import { WhatIsDuneli } from './components/WhatIsDuneli';
import { DunoraSection } from './components/DunoraSection';
import { ShutterDrawer } from './components/ShutterDrawer';
import { Footer } from './components/ui/footer-section';
import { PrivacyPolicyPage } from './components/PrivacyPolicyPage';
import { AboutUsModal } from './components/AboutUsModal';
import { TermsModal } from './components/TermsModal';
import { CommunityGuidelinesModal } from './components/CommunityGuidelinesModal';
import { HelpCenterModal } from './components/HelpCenterModal';
import { FaqModal } from './components/FaqModal';
import { SplashScreen } from './components/SplashScreen';
import { ProfilePage } from './components/ProfilePage';
import { FeatureDetailPage } from './components/FeatureDetailPage';
import { MyActivityPage } from './components/MyActivityPage';
import { MyTopicsPage } from './components/MyTopicsPage';
import { SupportedTopicsPage } from './components/SupportedTopicsPage';
import { SavedTopicsPage } from './components/SavedTopicsPage';
import { mockNotifications, mockUser } from './data/mockData';
import { Discussion, User, Notification, Theme, DiscoveryMode, Category, SortOption, Language, Page, Role } from './types';
import { themes } from './config/themes';
import { initializeSecurityDeterrents } from '../services/securityDeterrents';
import { useAuth } from '../hooks/useAuth';
import { logout } from '../services/authService';
import {
  subscribeDiscussions,
  createDiscussion,
  voteDiscussion,
  joinMeeting,
  leaveMeeting,
  type RealDiscussion,
} from '../services/api';

export default function App() {
  // Real Supabase Auth Integration
  const supabaseAuth = useAuth();

  // Splash Screen State
  const [showSplash, setShowSplash] = useState(true);

  // Page State
  const [currentPage, setCurrentPage] = useState<Page>('homepage');
  const [selectedDiscussion, setSelectedDiscussion] = useState<Discussion | null>(null);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [selectedFeatureTitle, setSelectedFeatureTitle] = useState<string>('100% Anonymous');
  const [isShutterOpen, setIsShutterOpen] = useState(false);
  
  // Theme State - Nova Futuristic is default
  const [currentTheme, setCurrentTheme] = useState<Theme>('futuristic');
  
  // User State
  const [user, setUser] = useState<User>(mockUser);

  // Update App User state whenever Supabase Auth Session changes
  useEffect(() => {
    if (supabaseAuth.user) {
      setUser({
        id: supabaseAuth.user.id,
        name: supabaseAuth.user.name,
        avatar: supabaseAuth.user.avatar || '',
        isLoggedIn: !supabaseAuth.user.isGuest,
      });
    } else {
      setUser(mockUser);
    }
  }, [supabaseAuth.user]);
  
  // Data State — Populated 100% from REAL Supabase API
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);

  // ── Real API: subscribe to discussions ───────────────────
  useEffect(() => {
    const unsubscribe = subscribeDiscussions((realItems) => {
      const mapped: Discussion[] = realItems.map((d: RealDiscussion) => ({
        id:             d.id,
        title:          d.title,
        category:       (d.category as any) || 'Technology',
        language:       (d.language  as any) || 'English',
        status:         d.status,
        interestCount:  d.interestCount,
        listenerCount:  d.activeAttendees,
        scheduledTime:  d.scheduledTime,
        startedTime:    d.startedTime,
        duration:       60,
        hostId:         d.hostId,
        hostName:       d.hostName,
        hasUserInterest: d.hasUserVoted,
        hasUserSaved:   false,
      }));
      setDiscussions(mapped);
    });
    return unsubscribe;
  }, []);
  
  // Discovery State
  const [discoveryMode, setDiscoveryMode] = useState<DiscoveryMode>('interest');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'All'>('All');
  const [selectedLanguage, setSelectedLanguage] = useState<Language | 'All'>('All');
  const [sortBy, setSortBy] = useState<SortOption>('trending');
  
  // Modal State
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showAboutUsModal, setShowAboutUsModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showGuidelinesModal, setShowGuidelinesModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showFaqModal, setShowFaqModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);

  const theme = themes[currentTheme];

  // Always start at top of page on page refresh / initial load
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
  }, []);

  // Prevent global text copy, selection, right-click, and dragging everywhere on site except input elements
  useEffect(() => {
    const isInputElement = (el: HTMLElement | null) => {
      if (!el) return false;
      const tagName = el.tagName;
      return tagName === 'INPUT' || tagName === 'TEXTAREA' || el.isContentEditable || Boolean(el.closest('input')) || Boolean(el.closest('textarea'));
    };

    const clearSelection = () => {
      const activeEl = document.activeElement as HTMLElement;
      if (isInputElement(activeEl)) return;
      if (window.getSelection) {
        window.getSelection()?.removeAllRanges();
      }
    };

    const preventAction = (e: Event) => {
      const target = e.target as HTMLElement;
      if (isInputElement(target)) return;
      clearSelection();
      e.preventDefault();
    };

    const preventCopyKey = (e: KeyboardEvent) => {
      const activeEl = document.activeElement as HTMLElement;
      if (isInputElement(activeEl)) return;
      if ((e.ctrlKey || e.metaKey) && (e.key === 'c' || e.key === 'C' || e.key === 'x' || e.key === 'X')) {
        e.preventDefault();
        clearSelection();
      }
    };

    window.addEventListener('selectstart', preventAction);
    window.addEventListener('dragstart', preventAction);
    window.addEventListener('mousedown', clearSelection);
    window.addEventListener('mouseup', clearSelection);
    window.addEventListener('copy', preventAction);
    window.addEventListener('cut', preventAction);
    window.addEventListener('contextmenu', preventAction);
    window.addEventListener('keydown', preventCopyKey);
    window.addEventListener('selectionchange', clearSelection);

    return () => {
      window.removeEventListener('selectstart', preventAction);
      window.removeEventListener('dragstart', preventAction);
      window.removeEventListener('mousedown', clearSelection);
      window.removeEventListener('mouseup', clearSelection);
      window.removeEventListener('copy', preventAction);
      window.removeEventListener('cut', preventAction);
      window.removeEventListener('contextmenu', preventAction);
      window.removeEventListener('keydown', preventCopyKey);
      window.removeEventListener('selectionchange', clearSelection);
    };
  }, []);

  // Initialize security deterrents (production only)
  useEffect(() => {
    // Initialize client-side security deterrents
    // These are DETERRENTS only, not actual security
    // Real security is in Firebase Rules and Cloud Functions
    const cleanup = initializeSecurityDeterrents({
      onDevToolsDetected: 'warn', // Options: 'warn' | 'logout' | 'custom'
      // Uncomment below to auto-logout on DevTools detection
      // onDevToolsDetected: 'logout',
      // Or use custom handler:
      // onDevToolsDetected: 'custom',
      // customHandler: () => {
      //   console.log('DevTools detected - custom action');
      // },
    });

    // Cleanup on unmount
    return cleanup;
  }, []);

  // Handlers
  const handleLogin = () => {
    setUser({
      id: 'user-123',
      name: 'Jordan Smith',
      avatar: '',
      isLoggedIn: true,
    });
    if (currentPage === 'entry') {
      setCurrentPage('homepage');
    }
  };

  const handleLogout = async () => {
    await logout();
    setUser(mockUser);
    setCurrentPage('homepage');
    // Reset user-specific states
    setDiscussions(discussions.map(discussion => ({
      ...discussion,
      hasUserInterest: false,
      hasUserSaved: false,
    })));
  };

  const handleContinueAsGuest = () => {
    setCurrentPage('homepage');
  };

  const handleShowInterest = async (discussionId: string) => {
    // Optimistic update
    setDiscussions(prev => prev.map(d =>
      d.id === discussionId
        ? { ...d, hasUserInterest: !d.hasUserInterest, interestCount: d.hasUserInterest ? d.interestCount - 1 : d.interestCount + 1 }
        : d
    ));
    // Real API vote
    await voteDiscussion(discussionId);
  };

  const handleScheduleDiscussion = async (title: string, scheduledAt?: Date, category?: string, language?: string) => {
    // Real API
    const newId = await createDiscussion(title, scheduledAt, category, language);
    const scheduledTime = scheduledAt || new Date(Date.now() + 24 * 60 * 60000);
    const topicCategory = category || (selectedCategory === 'All' ? 'Technology' : selectedCategory);

    const newDiscussion: Discussion = {
      id:             newId || `topic_${Date.now()}`,
      title,
      category:       topicCategory as any,
      language:       selectedLanguage === 'All' ? 'English' : selectedLanguage as any,
      status:         'upcoming',
      interestCount:  1,
      scheduledTime,
      duration:       60,
      hostId:         user.id,
      hostName:       user.name,
      hasUserInterest: true,
    };
    setDiscussions(prev => [newDiscussion, ...prev]);

    const newNotification: Notification = {
      id:              `notif-${Date.now()}`,
      type:            'discussionScheduled',
      message:         'Your discussion has been scheduled',
      discussionId:    newDiscussion.id,
      discussionTitle: newDiscussion.title,
      timestamp:       new Date(),
      read:            false,
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  const handleJoinDiscussion = (discussionId: string) => {
    const discussion = discussions.find(d => d.id === discussionId);
    if (discussion) {
      setSelectedDiscussion(discussion);
      setCurrentPage('roleSelection');
      joinMeeting(discussionId); // real API — attendee count update
    }
  };

  const handleSelectRole = (role: Role) => {
    setSelectedRole(role);
    setCurrentPage('meeting');
  };

  const handleLeaveMeeting = () => {
    if (selectedDiscussion) leaveMeeting(selectedDiscussion.id); // real API
    setCurrentPage('leaving');
  };

  const handleReturnHome = () => {
    setCurrentPage('homepage');
    setSelectedDiscussion(null);
    setSelectedRole(null);
  };

  const handleGoToProfile = () => {
    setCurrentPage('profile');
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const handleBackFromRoleSelection = () => {
    setCurrentPage('homepage');
    setSelectedDiscussion(null);
  };

  const handleMarkAsRead = (notificationId: string) => {
    setNotifications(notifications.map(n =>
      n.id === notificationId ? { ...n, read: true } : n
    ));
  };

  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const handleLoginPrompt = () => {
    setShowLoginModal(true);
  };

  // Filtered and sorted discussions
  const filteredDiscussions = useMemo(() => {
    let filtered = [...discussions];

    // Filter by language
    if (selectedLanguage !== 'All') {
      filtered = filtered.filter(d => d.language === selectedLanguage);
    }

    // Filter by mode and category
    if (discoveryMode === 'categories' && selectedCategory !== 'All') {
      filtered = filtered.filter(d => d.category === selectedCategory);
    }

    if (discoveryMode === 'interest') {
      // In interest mode, show upcoming discussions sorted by interest
      filtered = filtered.filter(d => d.status === 'upcoming');
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'trending':
          return b.interestCount - a.interestCount;
        case 'newest':
          const aTime = a.scheduledTime || a.startedTime || new Date(0);
          const bTime = b.scheduledTime || b.startedTime || new Date(0);
          return bTime.getTime() - aTime.getTime();
        case 'mostInterested':
          return b.interestCount - a.interestCount;
        default:
          return 0;
      }
    });

    return filtered;
  }, [discussions, discoveryMode, selectedCategory, selectedLanguage, sortBy]);

  // Helper function to render active page view
  const renderCurrentPage = () => {
    // Entry Screen
    if (currentPage === 'entry') {
      return (
        <EntryScreen
          onLogin={handleLogin}
          onContinueAsGuest={handleContinueAsGuest}
        />
      );
    }

    // Role Selection Page
    if (currentPage === 'roleSelection' && selectedDiscussion) {
      return (
        <RoleSelectionPage
          discussion={selectedDiscussion}
          currentTheme={currentTheme}
          onSelectRole={handleSelectRole}
          onBack={handleBackFromRoleSelection}
        />
      );
    }

    // Meeting Page
    if (currentPage === 'meeting' && selectedDiscussion && selectedRole) {
      return (
        <MeetingPage
          discussion={selectedDiscussion}
          currentTheme={currentTheme}
          userRole={selectedRole}
          userName={user.name}
          onLeave={handleLeaveMeeting}
        />
      );
    }

    // Leaving Meeting Page
    if (currentPage === 'leaving' && selectedDiscussion) {
      return (
        <LeavingMeetingPage
          discussionTitle={selectedDiscussion.title}
          currentTheme={currentTheme}
          onReturnHome={handleReturnHome}
        />
      );
    }

    // Privacy Policy Page
    if (currentPage === 'privacyPolicy') {
      return (
        <PrivacyPolicyPage
          onBack={() => {
            setCurrentPage('homepage');
            window.scrollTo(0, 0);
          }}
        />
      );
    }

    // Profile Page
    if (currentPage === 'profile') {
      return (
        <ProfilePage
          user={user}
          currentTheme={currentTheme}
          onBack={() => {
            setCurrentPage('homepage');
            window.scrollTo(0, 0);
          }}
          onSave={(updatedUser) => {
            setUser(prev => ({ ...prev, ...updatedUser }));
            setCurrentPage('homepage');
            window.scrollTo(0, 0);
          }}
        />
      );
    }

    // Feature Detail Page
    if (currentPage === 'featureDetail') {
      return (
        <FeatureDetailPage
          featureTitle={selectedFeatureTitle}
          currentTheme={currentTheme}
          onBack={() => {
            setIsShutterOpen(false);
            setCurrentPage('homepage');
            window.scrollTo(0, 0);
          }}
          onOpenShutter={() => {
            setCurrentPage('homepage');
            setIsShutterOpen(true);
          }}
        />
      );
    }

    // My Activity Page
    if (currentPage === 'myActivity') {
      return (
        <MyActivityPage
          currentTheme={currentTheme}
          onBack={() => {
            setCurrentPage('homepage');
            window.scrollTo(0, 0);
          }}
          onOpenShutter={() => {
            setCurrentPage('homepage');
            setIsShutterOpen(true);
          }}
        />
      );
    }

    // My Topics Page
    if (currentPage === 'myTopics') {
      return (
        <MyTopicsPage
          currentTheme={currentTheme}
          onBack={() => {
            setCurrentPage('homepage');
            window.scrollTo(0, 0);
          }}
          onOpenShutter={() => {
            setCurrentPage('homepage');
            setIsShutterOpen(true);
          }}
        />
      );
    }

    // Supported Topics Page
    if (currentPage === 'supportedTopics') {
      return (
        <SupportedTopicsPage
          currentTheme={currentTheme}
          onBack={() => {
            setCurrentPage('homepage');
            window.scrollTo(0, 0);
          }}
          onOpenShutter={() => {
            setCurrentPage('homepage');
            setIsShutterOpen(true);
          }}
        />
      );
    }

    // Saved Topics Page
    if (currentPage === 'savedTopics') {
      return (
        <SavedTopicsPage
          currentTheme={currentTheme}
          onBack={() => {
            setCurrentPage('homepage');
            window.scrollTo(0, 0);
          }}
          onOpenShutter={() => {
            setCurrentPage('homepage');
            setIsShutterOpen(true);
          }}
        />
      );
    }

    // Homepage
    return (
      <AuroraBackground className="min-h-screen w-full block bg-transparent p-0 overflow-x-hidden">
        <div 
          className={`min-h-screen transition-all duration-700 ${theme.textColor}`}
          style={{ background: 'transparent', fontFamily: 'var(--font-body)' }}
        >
          {/* Header */}
          <Header
            user={user}
            currentTheme={currentTheme}
            onThemeChange={setCurrentTheme}
            onLogin={() => setShowLoginModal(true)}
            onLogout={handleLogout}
            onProfile={handleGoToProfile}
            onMyActivity={() => {
              setCurrentPage('myActivity');
              window.scrollTo(0, 0);
            }}
            onMyTopics={() => {
              setCurrentPage('myTopics');
              window.scrollTo(0, 0);
            }}
            onSupportedTopics={() => {
              setCurrentPage('supportedTopics');
              window.scrollTo(0, 0);
            }}
            onSavedTopics={() => {
              setCurrentPage('savedTopics');
              window.scrollTo(0, 0);
            }}
          />

          {/* Hero Section */}
          <Hero
            currentTheme={currentTheme}
            textColor={theme.textColor}
            onReadMore={(title) => {
              setIsShutterOpen(false);
              setSelectedFeatureTitle(title);
              setCurrentPage('featureDetail');
              window.scrollTo(0, 0);
            }}
          />

          {/* What is Duneli Section */}
          <WhatIsDuneli currentTheme={currentTheme} />

          {/* How Duneli Works 3D Section */}
          <HowDuneliWorks3D currentTheme={currentTheme} />

          {/* Dunora Publication Showcase Section */}
          <DunoraSection currentTheme={currentTheme} />

          {/* Footer */}
          <Footer
            onOpenShutter={() => setIsShutterOpen(true)}
            onPrivacyPolicyClick={() => setCurrentPage('privacyPolicy')}
            onAboutUsClick={() => setShowAboutUsModal(true)}
            onTermsClick={() => setShowTermsModal(true)}
            onGuidelinesClick={() => setShowGuidelinesModal(true)}
            onHelpClick={() => setShowHelpModal(true)}
            onFaqClick={() => setShowFaqModal(true)}
          />

          {/* Notification Panel */}
          <NotificationPanel
            notifications={notifications}
            currentTheme={currentTheme}
            onMarkAsRead={handleMarkAsRead}
            onMarkAllAsRead={handleMarkAllAsRead}
          />

          {/* Login Modal */}
          <LoginModal
            isOpen={showLoginModal}
            currentTheme={currentTheme}
            onClose={() => setShowLoginModal(false)}
            onLogin={handleLogin}
          />

          {/* About Us Modal */}
          <AboutUsModal
            isOpen={showAboutUsModal}
            onClose={() => setShowAboutUsModal(false)}
          />

          {/* Terms of Service Modal */}
          <TermsModal
            isOpen={showTermsModal}
            onClose={() => setShowTermsModal(false)}
          />

          {/* Community Guidelines Modal */}
          <CommunityGuidelinesModal
            isOpen={showGuidelinesModal}
            onClose={() => setShowGuidelinesModal(false)}
          />

          {/* Help Center Modal */}
          <HelpCenterModal
            isOpen={showHelpModal}
            onClose={() => setShowHelpModal(false)}
          />

          {/* FAQs Modal */}
          <FaqModal
            isOpen={showFaqModal}
            onClose={() => setShowFaqModal(false)}
          />
        </div>
      </AuroraBackground>
    );
  };

  return (
    <>
      {showSplash && (
        <SplashScreen
          onFinish={() => {
            setShowSplash(false);
            window.scrollTo(0, 0);
          }}
        />
      )}

      {/* Viewport Draggable Shutter Drawer (Homepage Only) */}
      {currentPage === 'homepage' && (
        <ShutterDrawer
          discussions={discussions}
          currentTheme={currentTheme}
          isLoggedIn={user.isLoggedIn}
          onJoinDiscussion={handleJoinDiscussion}
          onShowInterest={handleShowInterest}
          onScheduleDiscussion={handleScheduleDiscussion}
          onLoginPrompt={() => setShowLoginModal(true)}
          externalIsOpen={isShutterOpen}
        />
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={currentPage}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: 'easeInOut' }}
          className="w-full min-h-screen"
        >
          {renderCurrentPage()}
        </motion.div>
      </AnimatePresence>

      {/* Viewport Floating Notification Panel (Homepage Only) */}
      {currentPage === 'homepage' && (
        <NotificationPanel
          notifications={notifications}
          currentTheme={currentTheme}
          onMarkAsRead={handleMarkAsRead}
          onMarkAllAsRead={handleMarkAllAsRead}
        />
      )}
    </>
  );
}
