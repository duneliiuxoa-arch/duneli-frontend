import { User as UserIcon, LogOut, Bookmark, TrendingUp, FileText, Bell, Palette, UserCircle, Mic, Headphones, Scale } from 'lucide-react';
import duneliLogo from '../../assets/logo.png';
import { User, Theme } from '../types';
import { themes } from '../config/themes';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RainbowButton } from './RainbowButton';

interface HeaderProps {
  user: User;
  currentTheme: Theme;
  onThemeChange: (theme: Theme) => void;
  onLogin: () => void;
  onLogout: () => void;
  onProfile: () => void;
  onMyActivity?: () => void;
  onMyTopics?: () => void;
  onSupportedTopics?: () => void;
  onSavedTopics?: () => void;
  onOpenShutter?: () => void;
}

export function Header({
  user,
  currentTheme,
  onThemeChange,
  onLogin,
  onLogout,
  onProfile,
  onMyActivity,
  onMyTopics,
  onSupportedTopics,
  onSavedTopics,
  onOpenShutter,
}: HeaderProps) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const theme = themes[currentTheme];
  const isDuneli = currentTheme === 'duneli';

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
        setShowThemeMenu(false);
      }
    }

    if (showUserMenu || showThemeMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showUserMenu, showThemeMenu]);

  const navPills = [
    { icon: Mic, label: 'Speaker', color: 'text-[#3B5BF6]' },
    { icon: Headphones, label: 'Listen', color: 'text-[#7C3AED]' },
    { icon: Scale, label: 'Debate', color: 'text-[#F97316]' },
  ];

  return (
    <header className="w-full sticky top-0 z-30 pointer-events-none">
      {/* Transparent navbar content */}
      <div className="pt-7 pb-2 pointer-events-auto" style={{ background: 'transparent' }}>
        <div className="w-full relative flex items-center justify-between px-6 lg:px-10">
          {/* Left spacer */}
          <div className="flex items-center w-40" />

          {/* Pinned background User Count Badge */}
          <div className="absolute left-1/2 -translate-x-1/2 top-[54px] flex items-center gap-3 px-4 py-1.5 rounded-full bg-white/85 backdrop-blur-md border border-white/90 shadow-lg shadow-blue-500/5 pointer-events-auto whitespace-nowrap z-20 select-none">
            <div className="flex -space-x-2">
              {['#3B5BF6', '#7C3AED', '#F97316', '#10b981'].map((color, i) => (
                <div
                  key={i}
                  className="w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-extrabold shadow-sm select-none"
                  style={{ background: color }}
                >
                  {String.fromCharCode(65 + i)}
                </div>
              ))}
            </div>
            <span className="text-xs sm:text-sm font-extrabold text-[#1A1A2E] select-none tracking-tight">10K+ Users</span>
          </div>

        {/* Center Nav Pills hidden since logo is centered */}

        {/* Right — Auth + User Menu */}
        <div className="flex items-center gap-3" ref={menuRef}>
          {!user.isLoggedIn ? (
            <RainbowButton onClick={onLogin} className="rounded-full text-sm font-extrabold px-6 h-10">
              Join now
            </RainbowButton>
          ) : (
            <>
            {/* User pill button — own relative context */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowUserMenu(!showUserMenu);
                  setShowThemeMenu(false);
                }}
                className="bg-white border border-slate-200 shadow-md rounded-full p-1.5 flex items-center gap-2.5 px-3 hover:scale-105 hover:shadow-lg transition-all cursor-pointer"
              >
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-white shrink-0"
                  style={{ background: 'linear-gradient(135deg, #3B5BF6, #7C3AED)' }}
                >
                  <UserIcon className="w-3.5 h-3.5" />
                </div>
                <span className="hidden sm:block text-sm font-extrabold text-[#1A1A2E]">{user.name}</span>
              </button>

              <AnimatePresence>
                {showUserMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 top-full mt-2 w-60 bg-white border border-slate-200 rounded-2xl overflow-hidden z-50 shadow-xl"
                  >

                    {/* My Profile */}
                    <button
                      onClick={() => { onProfile(); setShowUserMenu(false); }}
                      className="w-full px-4 py-3 hover:bg-blue-50 flex items-center gap-3 transition-colors text-[#1A1A2E] cursor-pointer"
                    >
                      <UserCircle className="w-4 h-4 text-[#3B5BF6]" />
                      <span className="font-semibold text-sm">My Profile</span>
                    </button>

                    {/* My Activity */}
                    <button
                      onClick={() => { onMyActivity?.(); setShowUserMenu(false); }}
                      className="w-full px-4 py-3 hover:bg-blue-50 flex items-center gap-3 transition-colors text-[#1A1A2E] cursor-pointer"
                    >
                      <FileText className="w-4 h-4 text-[#3B5BF6]" />
                      <span className="font-semibold text-sm">My Activity</span>
                    </button>

                    {/* My Topics */}
                    <button
                      onClick={() => { onMyTopics?.(); setShowUserMenu(false); }}
                      className="w-full px-4 py-3 hover:bg-blue-50 flex items-center gap-3 transition-colors text-[#1A1A2E] cursor-pointer"
                    >
                      <TrendingUp className="w-4 h-4 text-[#7C3AED]" />
                      <span className="font-semibold text-sm">My Topics</span>
                    </button>

                    {/* Supported Topics */}
                    <button
                      onClick={() => { onSupportedTopics?.(); setShowUserMenu(false); }}
                      className="w-full px-4 py-3 hover:bg-blue-50 flex items-center gap-3 transition-colors text-[#1A1A2E] cursor-pointer"
                    >
                      <TrendingUp className="w-4 h-4 text-[#7C3AED]" />
                      <span className="font-semibold text-sm">Supported Topics</span>
                    </button>

                    {/* Saved Topics */}
                    <button
                      onClick={() => { onSavedTopics?.(); setShowUserMenu(false); }}
                      className="w-full px-4 py-3 hover:bg-blue-50 flex items-center gap-3 transition-colors text-[#1A1A2E] cursor-pointer"
                    >
                      <Bookmark className="w-4 h-4 text-[#F97316]" />
                      <span className="font-semibold text-sm">Saved Topics</span>
                    </button>

                    <div className="border-t border-slate-100" />
                    <button
                      onClick={onLogout}
                      className="w-full px-4 py-3 hover:bg-red-50 flex items-center gap-3 transition-colors text-red-500 cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="font-semibold text-sm">Log Out</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            </>
          )}

          {/* Theme button for non-logged in users */}
          {!user.isLoggedIn && (
            <div className="relative">
              <button
                onClick={() => setShowThemeMenu(!showThemeMenu)}
                className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-md border border-blue-200/80 shadow-md hover:shadow-lg flex items-center justify-center text-[#3B5BF6] hover:scale-105 transition-all cursor-pointer"
                title="Change Theme"
              >
                <Palette className="w-5 h-5 text-[#3B5BF6]" />
              </button>
              <AnimatePresence>
                {showThemeMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 mt-3 w-56 bg-white/95 backdrop-blur-2xl border border-blue-200/80 shadow-2xl rounded-2xl overflow-hidden z-50 p-3"
                  >
                    <div className="grid grid-cols-2 gap-2">
                      {(Object.keys(themes) as Theme[]).map((themeKey) => (
                        <button
                          key={themeKey}
                          onClick={() => {
                            onThemeChange(themeKey);
                            setShowThemeMenu(false);
                          }}
                          className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                            currentTheme === themeKey
                              ? 'bg-gradient-to-r from-[#3B5BF6] to-[#7C3AED] text-white shadow-md font-extrabold'
                              : 'bg-slate-100/90 text-[#1A1A2E] hover:bg-blue-50 hover:text-[#3B5BF6] border border-slate-200/70'
                          }`}
                        >
                          {themes[themeKey].name}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Theme button — shown right of user pill when logged in */}
          {user.isLoggedIn && (
            <div className="relative">
              <button
                onClick={() => { setShowThemeMenu(!showThemeMenu); setShowUserMenu(false); }}
                className="w-9 h-9 rounded-full bg-white border border-slate-200 shadow-md hover:shadow-lg flex items-center justify-center text-[#3B5BF6] hover:scale-105 transition-all cursor-pointer"
              >
                <Palette className="w-4 h-4" />
              </button>
              <AnimatePresence>
                {showThemeMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 top-full mt-2 w-52 bg-white border border-slate-200 rounded-2xl z-50 shadow-xl p-3"
                  >
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1 mb-2">Select Theme</p>
                    <div className="grid grid-cols-2 gap-2">
                      {(Object.keys(themes) as Theme[]).map((themeKey) => (
                        <button
                          key={themeKey}
                          onClick={() => {
                            onThemeChange(themeKey);
                            setShowThemeMenu(false);
                          }}
                          className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                            currentTheme === themeKey
                              ? 'bg-gradient-to-r from-[#3B5BF6] to-[#7C3AED] text-white shadow-md'
                              : 'bg-slate-100 text-[#1A1A2E] hover:bg-blue-50 hover:text-[#3B5BF6] border border-slate-200'
                          }`}
                        >
                          {themes[themeKey].name}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
        </div>
      </div>
    </header>
  );
}
