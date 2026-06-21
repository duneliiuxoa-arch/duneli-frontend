import { User as UserIcon, LogOut, LogIn, Bookmark, TrendingUp, FileText, Bell, Palette } from 'lucide-react';
import { User, Theme } from '../types';
import { themes } from '../config/themes';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface HeaderProps {
  user: User;
  currentTheme: Theme;
  onThemeChange: (theme: Theme) => void;
  onLogin: () => void;
  onLogout: () => void;
  onNavigate: (page: import('../types').Page) => void;
}

export function Header({ user, currentTheme, onThemeChange, onLogin, onLogout, onNavigate }: HeaderProps) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const theme = themes[currentTheme];

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

  return (
    <header className="w-full py-4 px-4 md:py-6 md:px-8">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2 md:gap-3">
          <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full ${theme.buttonClass} flex items-center justify-center flex-shrink-0`}>
            <span className="font-bold" style={{ fontFamily: 'var(--font-heading)' }}>D</span>
          </div>
          <div>
            <h1 className={`text-lg md:text-2xl font-bold ${theme.textColor}`} style={{ fontFamily: 'var(--font-heading)' }}>
              DUNELI
            </h1>
            <p className={`text-[10px] md:text-xs ${theme.textColor} opacity-60`}>#ideasNotPeople</p>
          </div>
        </div>

        {/* User Menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => {
              setShowUserMenu(!showUserMenu);
              setShowThemeMenu(false);
            }}
            className={`${theme.cardStyle} rounded-full p-2 flex items-center gap-2 px-4 hover:scale-105 transition-transform`}
          >
            <div className={`w-8 h-8 rounded-full ${theme.buttonClass} flex items-center justify-center`}>
              <UserIcon className="w-4 h-4" />
            </div>
            {user.isLoggedIn && (
              <span className={`hidden sm:block ${theme.textColor}`}>{user.name}</span>
            )}
          </button>

          <AnimatePresence>
            {showUserMenu && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`absolute right-0 mt-2 w-[calc(100vw-2rem)] max-w-56 ${theme.cardStyle} rounded-xl overflow-hidden z-50`}
              >
                {user.isLoggedIn ? (
                  <>
                    <button className={`w-full px-4 py-3 hover:bg-white/10 flex items-center gap-3 transition-colors ${theme.textColor}`} onClick={() => { onNavigate('myActivity'); setShowUserMenu(false); }}>
                      <FileText className="w-4 h-4" />
                      <span>My Activity</span>
                    </button>
                    <button className={`w-full px-4 py-3 hover:bg-white/10 flex items-center gap-3 transition-colors ${theme.textColor}`} onClick={() => { onNavigate('myTopics'); setShowUserMenu(false); }}>
                      <TrendingUp className="w-4 h-4" />
                      <span>My Topics</span>
                    </button>
                    <button className={`w-full px-4 py-3 hover:bg-white/10 flex items-center gap-3 transition-colors ${theme.textColor}`} onClick={() => { onNavigate('supportedTopics'); setShowUserMenu(false); }}>
                      <TrendingUp className="w-4 h-4" />
                      <span>Supported Topics</span>
                    </button>
                    <button className={`w-full px-4 py-3 hover:bg-white/10 flex items-center gap-3 transition-colors ${theme.textColor}`} onClick={() => { onNavigate('savedTopics'); setShowUserMenu(false); }}>
                      <Bookmark className="w-4 h-4" />
                      <span>Saved Topics</span>
                    </button>
                    <button className={`w-full px-4 py-3 hover:bg-white/10 flex items-center gap-3 transition-colors ${theme.textColor}`} onClick={() => { onNavigate('notifications'); setShowUserMenu(false); }}>
                      <Bell className="w-4 h-4" />
                      <span>Notifications</span>
                    </button>
                    <div className={`border-t ${theme.textColor === 'text-white' ? 'border-white/10' : 'border-gray-200'}`} />
                    <button
                      onClick={() => {
                        setShowThemeMenu(!showThemeMenu);
                      }}
                      className={`w-full px-4 py-3 hover:bg-white/10 flex items-center gap-3 transition-colors ${theme.textColor}`}
                    >
                      <Palette className="w-4 h-4" />
                      <span>Theme</span>
                    </button>
                    {showThemeMenu && (
                      <div className={`border-t ${theme.textColor === 'text-white' ? 'border-white/10' : 'border-gray-200'} p-3`}>
                        <div className="grid grid-cols-2 gap-2">
                          {(Object.keys(themes) as Theme[]).map((themeKey) => (
                            <button
                              key={themeKey}
                              onClick={() => {
                                onThemeChange(themeKey);
                                setShowThemeMenu(false);
                                setShowUserMenu(false);
                              }}
                              className={`px-3 py-2 rounded-lg text-xs transition-all ${
                                currentTheme === themeKey 
                                  ? theme.buttonClass 
                                  : `${theme.cardStyle} hover:bg-white/10`
                              }`}
                            >
                              {themes[themeKey].name}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className={`border-t ${theme.textColor === 'text-white' ? 'border-white/10' : 'border-gray-200'}`} />
                    <button
                      onClick={onLogout}
                      className={`w-full px-4 py-3 hover:bg-white/10 flex items-center gap-3 transition-colors text-red-500`}
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Log Out</span>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={onLogin}
                      className={`w-full px-4 py-3 ${theme.buttonClass} flex items-center justify-center gap-3 transition-colors`}
                    >
                      <LogIn className="w-4 h-4" />
                      <span>Log In</span>
                    </button>
                    <div className={`border-t ${theme.textColor === 'text-white' ? 'border-white/10' : 'border-gray-200'}`} />
                    <button
                      onClick={() => {
                        setShowThemeMenu(!showThemeMenu);
                      }}
                      className={`w-full px-4 py-3 hover:bg-white/10 flex items-center gap-3 transition-colors ${theme.textColor}`}
                    >
                      <Palette className="w-4 h-4" />
                      <span>Theme</span>
                    </button>
                    {showThemeMenu && (
                      <div className={`border-t ${theme.textColor === 'text-white' ? 'border-white/10' : 'border-gray-200'} p-3`}>
                        <div className="grid grid-cols-2 gap-2">
                          {(Object.keys(themes) as Theme[]).map((themeKey) => (
                            <button
                              key={themeKey}
                              onClick={() => {
                                onThemeChange(themeKey);
                                setShowThemeMenu(false);
                                setShowUserMenu(false);
                              }}
                              className={`px-3 py-2 rounded-lg text-xs transition-all ${
                                currentTheme === themeKey 
                                  ? theme.buttonClass 
                                  : `${theme.cardStyle} hover:bg-white/10`
                              }`}
                            >
                              {themes[themeKey].name}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
