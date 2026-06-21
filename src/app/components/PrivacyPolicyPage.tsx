import { motion } from 'motion/react';
import { ArrowLeft, Shield, Eye, Lock, Database, Bell, Mail, Globe, Trash2 } from 'lucide-react';
import { Theme } from '../types';
import { themes } from '../config/themes';

interface Props {
  currentTheme: Theme;
  onBack: () => void;
}

const SECTIONS = [
  {
    icon: <Database size={18} />,
    title: 'Information We Collect',
    content: [
      'Account information: name, email address, and profile picture when you sign in via Google or phone.',
      'Anonymous ID (DNL-XXXX): auto-generated for every user to protect your real identity in discussions.',
      'Participation data: which discussions you join, your role (listener/speaker/debater), and timestamps.',
      'Votes and interests: topics you vote on or mark as interesting.',
      'Chat messages: messages sent during live meetings, stored securely.',
      'Device info: browser type, OS, and IP address for security and abuse prevention only.',
    ],
  },
  {
    icon: <Eye size={18} />,
    title: 'How We Use Your Information',
    content: [
      'To provide and improve the Duneli live debate experience.',
      'To display your anonymous ID (not your real name) in meetings and discussions.',
      'To send notifications about discussions you follow (only if you opt in).',
      'To detect and prevent spam, abuse, and security threats.',
      'To generate anonymized analytics about platform usage — never sold to third parties.',
      'Discussion summaries from completed meetings are published on Dunora as articles, without identifying individual users.',
    ],
  },
  {
    icon: <Globe size={18} />,
    title: 'Information We Share',
    content: [
      'We do NOT sell your personal data to anyone, ever.',
      'Supabase (our database provider): stores your account and discussion data securely.',
      'Agora (our audio provider): processes real-time audio during live meetings. No audio is recorded or stored.',
      'Discussion summaries (not personal data) are shared with Dunora to create articles.',
      'We may share data with law enforcement only when legally required.',
    ],
  },
  {
    icon: <Lock size={18} />,
    title: 'Data Security',
    content: [
      'All data is encrypted in transit using HTTPS/TLS.',
      'Your password is never stored — we use Google OAuth and phone OTP only.',
      'Database access is restricted and monitored.',
      'Admin panel is not indexed by search engines and is password-protected.',
      'We regularly audit our security practices.',
    ],
  },
  {
    icon: <Bell size={18} />,
    title: 'Cookies & Storage',
    content: [
      'We use localStorage and sessionStorage to remember your theme preference and session state.',
      'No third-party advertising cookies are used.',
      'Supabase uses a secure session cookie for authentication.',
      'You can clear all stored data by logging out and clearing your browser storage.',
    ],
  },
  {
    icon: <Trash2 size={18} />,
    title: 'Your Rights',
    content: [
      'Access: You can request a copy of your personal data at any time.',
      'Deletion: You can request deletion of your account and all associated data.',
      'Correction: You can update your profile information at any time.',
      'Opt-out: You can disable notifications from your profile settings.',
      'To exercise any right, email us at: privacy@duneli.com',
    ],
  },
  {
    icon: <Mail size={18} />,
    title: 'Contact Us',
    content: [
      'If you have questions about this Privacy Policy, contact us:',
      'Email: privacy@duneli.com',
      'Platform: Duneli — Live Debate Platform',
      'Operated by: IUXOA Creative Studio',
      'This policy was last updated: June 2026',
    ],
  },
];

export function PrivacyPolicyPage({ currentTheme, onBack }: Props) {
  const theme = themes[currentTheme];

  return (
    <div
      className={`min-h-screen ${theme.textColor}`}
      style={{ background: theme.background, fontFamily: 'var(--font-body)' }}
    >
      {/* ── Header ── */}
      <div className={`sticky top-0 z-50 ${theme.cardStyle} border-b`}
        style={{ borderColor: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)' }}>
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-4">
          <button onClick={onBack}
            className={`flex items-center gap-2 text-sm opacity-70 hover:opacity-100 transition-opacity ${theme.textColor}`}>
            <ArrowLeft size={16} /> Back
          </button>
          <div className="flex items-center gap-2">
            <Shield size={18} style={{ color: '#6366f1' }} />
            <span className="font-semibold text-sm">Privacy Policy</span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-10 sm:px-6 sm:py-16">
        {/* ── Hero ── */}
        <motion.div className="text-center mb-10 sm:mb-16"
          initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl mb-5 sm:mb-6"
            style={{ background: 'linear-gradient(135deg, #6366f1, #06b6d4)', boxShadow: '0 0 40px rgba(99,102,241,0.3)' }}>
            <Shield size={24} className="text-white" />
          </div>
          <h1 className="text-2xl sm:text-4xl font-bold mb-3 sm:mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
            Privacy Policy
          </h1>
          <p className="text-sm sm:text-lg opacity-60 max-w-xl mx-auto leading-relaxed">
            We believe in transparency. Here's exactly what data we collect,
            why we collect it, and how we protect it.
          </p>
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium"
            style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)', color: '#a5b4fc' }}>
            Last updated: June 2026
          </div>
        </motion.div>

        {/* ── Key promise banner ── */}
        <motion.div className="mb-12 p-6 rounded-2xl"
          style={{ background: 'rgba(52,211,153,0.07)', border: '1px solid rgba(52,211,153,0.2)' }}
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
              style={{ background: 'rgba(52,211,153,0.15)' }}>
              <Shield size={15} style={{ color: '#34d399' }} />
            </div>
            <div>
              <p className="font-semibold mb-1" style={{ color: '#34d399' }}>Our Promise</p>
              <p className="text-sm opacity-75 leading-relaxed">
                Duneli will <strong>never sell your data</strong> to advertisers or third parties.
                Your real identity stays private — we use anonymous IDs (DNL-XXXX) in all public discussions.
                Audio from live meetings is <strong>never recorded or stored</strong>.
              </p>
            </div>
          </div>
        </motion.div>

        {/* ── Sections ── */}
        <div className="space-y-5 sm:space-y-8">
          {SECTIONS.map((section, i) => (
            <motion.div key={section.title}
              className={`${theme.cardStyle} rounded-2xl p-5 sm:p-8`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.07 }}>
              <div className="flex items-center gap-3 mb-4 sm:mb-5">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(99,102,241,0.12)', color: '#6366f1' }}>
                  {section.icon}
                </div>
                <h2 className="text-base sm:text-lg font-bold">{section.title}</h2>
              </div>
              <ul className="space-y-2.5 sm:space-y-3">
                {section.content.map((item, j) => (
                  <li key={j} className="flex items-start gap-3 text-xs sm:text-sm opacity-75 leading-relaxed">
                    <span className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0"
                      style={{ background: '#6366f1' }} />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* ── Footer ── */}
        <motion.div className="mt-16 text-center text-sm opacity-40"
          initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ delay: 0.8 }}>
          <p>© 2026 Duneli · IUXOA Creative Studio · All rights reserved</p>
          <p className="mt-1">This policy applies to the Duneli platform and its associated services.</p>
        </motion.div>
      </div>
    </div>
  );
}
