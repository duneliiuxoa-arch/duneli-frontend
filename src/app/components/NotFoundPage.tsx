import { motion } from 'motion/react';
import { ArrowLeft, Search, Home, Compass } from 'lucide-react';
import { Theme } from '../types';
import { themes } from '../config/themes';

interface Props {
  currentTheme: Theme;
  onBack: () => void;
  currentPath?: string;
}

// Smart URL suggestions based on what user might have typed
function getSuggestions(path: string) {
  const p = path.toLowerCase();
  const all = [
    { label: 'Home',             path: '/',          icon: '🏠', desc: 'Browse live discussions' },
    { label: 'Privacy Policy',   path: '/privacy',   icon: '🔒', desc: 'Our privacy commitment' },
    { label: 'Contact',          path: 'mailto:hello@duneli.com', icon: '✉️', desc: 'Get in touch' },
  ];

  // keyword-based smart match
  if (p.includes('priv'))   return [all[1], all[0]];
  if (p.includes('home') || p.includes('index')) return [all[0], all[1]];
  if (p.includes('contact') || p.includes('mail')) return [all[2], all[0]];

  return all;
}

export function NotFoundPage({ currentTheme, onBack, currentPath = '' }: Props) {
  const theme = themes[currentTheme];
  const suggestions = getSuggestions(currentPath);

  return (
    <div
      className={`min-h-screen flex flex-col items-center justify-center px-6 py-16 ${theme.textColor}`}
      style={{ background: theme.background, fontFamily: 'var(--font-body)' }}
    >
      {/* Back button */}
      <motion.button
        initial={{ opacity: 0, x: -16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
        onClick={onBack}
        className="absolute top-6 left-6 flex items-center gap-2 text-sm opacity-60 hover:opacity-100 transition-opacity"
      >
        <ArrowLeft size={16} />
        Back
      </motion.button>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-lg w-full text-center"
      >
        {/* 404 display */}
        <div className="relative mb-8 select-none">
          <div
            className="text-[120px] font-bold leading-none opacity-10 select-none"
            style={{ letterSpacing: '-4px' }}
          >
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className={`w-16 h-16 rounded-2xl ${theme.cardStyle} flex items-center justify-center`}
            >
              <Compass size={28} style={{ color: theme.accentColor }} />
            </div>
          </div>
        </div>

        {/* Message */}
        <h1 className="text-2xl font-semibold mb-3">This page doesn't exist</h1>
        <p className="text-sm opacity-60 mb-2 leading-relaxed">
          The URL{' '}
          {currentPath && (
            <span
              className="font-mono px-1.5 py-0.5 rounded text-xs"
              style={{
                background: 'rgba(0,0,0,0.12)',
                wordBreak: 'break-all',
              }}
            >
              {currentPath}
            </span>
          )}{' '}
          doesn't match any page on Duneli.
        </p>
        <p className="text-sm opacity-50 mb-10">Maybe a typo? Here's where you might want to go:</p>

        {/* Suggestions */}
        <div className="flex flex-col gap-3 mb-10">
          {suggestions.map((s, i) => (
            <motion.div
              key={s.path}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.07, duration: 0.35 }}
            >
              {s.path.startsWith('mailto') ? (
                <a
                  href={s.path}
                  className={`flex items-center gap-4 px-5 py-4 rounded-xl ${theme.cardStyle} hover:scale-[1.02] transition-transform text-left w-full`}
                >
                  <span className="text-xl">{s.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">{s.label}</div>
                    <div className="text-xs opacity-50 mt-0.5">{s.desc}</div>
                  </div>
                  <span className="text-xs opacity-40 font-mono truncate max-w-[120px]">{s.path}</span>
                </a>
              ) : (
                <button
                  onClick={s.path === '/' ? onBack : () => {/* handled via onBack for now */}}
                  className={`flex items-center gap-4 px-5 py-4 rounded-xl ${theme.cardStyle} hover:scale-[1.02] transition-transform text-left w-full cursor-pointer`}
                >
                  <span className="text-xl">{s.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">{s.label}</div>
                    <div className="text-xs opacity-50 mt-0.5">{s.desc}</div>
                  </div>
                  <span className="text-xs opacity-40 font-mono">duneli.com{s.path}</span>
                </button>
              )}
            </motion.div>
          ))}
        </div>

        {/* Go home CTA */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          onClick={onBack}
          className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium ${theme.buttonClass} transition-all hover:scale-105 active:scale-95`}
        >
          <Home size={16} />
          Go to Duneli Home
        </motion.button>
      </motion.div>

      {/* Footer note */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="absolute bottom-6 text-xs opacity-30"
      >
        Error 404 · Duneli
      </motion.p>
    </div>
  );
}
