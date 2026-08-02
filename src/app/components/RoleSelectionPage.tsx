import { Headphones, Mic, Scale, ArrowLeft } from 'lucide-react';
import { Theme, Role, Discussion } from '../types';
import { themes } from '../config/themes';
import { motion } from 'motion/react';

interface RoleSelectionPageProps {
  discussion: Discussion;
  currentTheme: Theme;
  onSelectRole: (role: Role) => void;
  onBack: () => void;
}

export function RoleSelectionPage({ 
  discussion, 
  currentTheme, 
  onSelectRole,
  onBack 
}: RoleSelectionPageProps) {
  const theme = themes[currentTheme];
  const isDuneli = currentTheme === 'duneli';

  const roles = [
    {
      id: 'listener' as Role,
      icon: Headphones,
      title: 'Listener 🎧',
      subtitle: 'Only Able to Listen',
      titleColor: 'text-[#7C3AED]',
      iconBg: 'from-[#7C3AED] to-[#a855f7]',
      buttonStyle: 'bg-gradient-to-r from-[#7C3AED] to-[#a855f7]',
      shadowColor: 'shadow-purple-200',
      description: 'Join with 0% pressure. Microphone is locked OFF so you can listen silently.',
      permissions: [
        'Only able to listen (Mic locked OFF)',
        'Zero pressure, silent spectator mode',
        'React to ideas with 👍 / 👎',
        'Raise hand to request speaking time'
      ]
    },
    {
      id: 'speaker' as Role,
      icon: Mic,
      title: 'Speaker 🎙️',
      subtitle: 'Speaks On Their Turn',
      titleColor: 'text-[#3B5BF6]',
      iconBg: 'from-[#3B5BF6] to-[#6366f1]',
      buttonStyle: 'bg-gradient-to-r from-[#3B5BF6] to-[#6366f1]',
      shadowColor: 'shadow-blue-200',
      description: 'Speaks when your turn comes in an orderly, turn-based queue.',
      permissions: [
        'Speaks on your turn when queue arrives',
        '3-minute live speaking timer',
        'Timer shown on screen during turn',
        'Auto-muted when turn ends',
        'Return to Listener after speaking'
      ]
    },
    {
      id: 'debater' as Role,
      icon: Scale,
      title: 'Debater ⚡',
      subtitle: 'Speaks Anytime',
      titleColor: 'text-[#F97316]',
      iconBg: 'from-[#F97316] to-[#ef4444]',
      buttonStyle: 'bg-gradient-to-r from-[#F97316] to-[#ef4444]',
      shadowColor: 'shadow-orange-200',
      description: 'Speaks anytime with open microphone access throughout the debate.',
      permissions: [
        'Speaks anytime (Open mic access)',
        'Mute / unmute freely at any moment',
        'No turn limits or waiting queues',
        'Active real-time debate encouraged'
      ]
    }
  ];

  return (
    <div
      className={`min-h-screen ${isDuneli ? 'text-[#1A1A2E]' : theme.textColor}`}
      style={{
        background: isDuneli
          ? 'linear-gradient(160deg, #f8f7ff 0%, #eef2ff 40%, #f0f7ff 70%, #faf5ff 100%)'
          : theme.background,
        fontFamily: 'Plus Jakarta Sans, sans-serif',
      }}
    >
      {/* Decorative blobs for duneli */}
      {isDuneli && (
        <>
          <div className="fixed top-0 right-0 w-96 h-96 rounded-full opacity-20 blur-3xl pointer-events-none"
            style={{ background: 'radial-gradient(circle, #7C3AED, transparent)', transform: 'translate(30%, -30%)' }} />
          <div className="fixed bottom-0 left-0 w-80 h-80 rounded-full opacity-15 blur-3xl pointer-events-none"
            style={{ background: 'radial-gradient(circle, #3B5BF6, transparent)', transform: 'translate(-30%, 30%)' }} />
        </>
      )}

      <div className="max-w-6xl mx-auto px-6 lg:px-8 py-10 relative">
        {/* Back Button */}
        <button
          onClick={onBack}
          className={`mb-8 flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all hover:scale-105 ${
            isDuneli
              ? 'bg-white border border-blue-100 text-[#1A1A2E] shadow-sm hover:shadow-md'
              : `${theme.cardStyle} hover:scale-105`
          }`}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Homepage</span>
        </button>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <h1
            className={`text-3xl sm:text-5xl font-black mb-4 ${isDuneli ? 'text-[#1A1A2E]' : theme.textColor}`}
            style={{ letterSpacing: '-0.02em' }}
          >
            How would you like to join?
          </h1>

          {/* Discussion Info */}
          <div className={`rounded-2xl p-5 mt-6 max-w-2xl mx-auto ${
            isDuneli
              ? 'bg-white border border-blue-100 shadow-lg shadow-blue-50'
              : `${theme.cardStyle}`
          }`}>
            {isDuneli && <div className="h-0.5 w-full mb-4 -mt-5 -mx-5 rounded-t-2xl"
              style={{ background: 'linear-gradient(90deg, #3B5BF6, #7C3AED, #F97316)', width: 'calc(100% + 40px)' }} />}
            <h2 className={`text-lg font-bold mb-2 ${isDuneli ? 'text-[#1A1A2E]' : theme.textColor}`}>
              {discussion.title}
            </h2>
            <div className={`flex items-center justify-center flex-wrap gap-3 text-sm ${isDuneli ? 'text-[#1A1A2E]/50' : `${theme.textColor} opacity-70`}`}>
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                isDuneli ? 'bg-blue-50 text-[#3B5BF6] border border-blue-100' : `${theme.cardStyle}`
              }`}>
                {discussion.category}
              </span>
              <span>· {discussion.listenerCount} listening</span>
              <span>· Hosted by {discussion.hostName}</span>
            </div>
          </div>
        </motion.div>

        {/* Role Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          {roles.map((role, index) => (
            <motion.button
              key={role.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => onSelectRole(role.id)}
              className={`text-left rounded-3xl p-7 transition-all hover:scale-105 group ${
                isDuneli
                  ? 'bg-white border border-blue-100/70 shadow-lg hover:shadow-xl shadow-blue-50/50 hover:shadow-blue-100/50'
                  : `${theme.cardStyle}`
              }`}
            >
              {/* Icon */}
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${role.iconBg} flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform`}>
                <role.icon className="w-7 h-7 text-white" />
              </div>

              {/* Title */}
              <h3
                className={`text-2xl font-black mb-1 ${isDuneli ? role.titleColor : theme.textColor}`}
                style={{ letterSpacing: '-0.02em' }}
              >
                {role.title}
              </h3>
              <div className="inline-block px-3 py-1 rounded-lg bg-blue-50 border border-blue-100 font-extrabold text-xs mb-3 text-[#1A1A2E]/80">
                {role.subtitle}
              </div>
              <p className={`text-sm mb-5 ${isDuneli ? 'text-[#1A1A2E]/60' : `${theme.textColor} opacity-80`}`}>
                {role.description}
              </p>

              {/* Permissions */}
              <div className="space-y-1.5 mb-6">
                {role.permissions.map((permission, idx) => (
                  <div key={idx} className={`flex items-start gap-2 text-xs ${isDuneli ? 'text-[#1A1A2E]/60' : `${theme.textColor} opacity-70`}`}>
                    <span className="text-green-500 mt-0.5 font-bold">✓</span>
                    <span>{permission}</span>
                  </div>
                ))}
              </div>

              {/* Select Button */}
              <div className={`w-full py-3 rounded-2xl text-center text-sm font-bold text-white shadow-lg ${role.shadowColor} ${role.buttonStyle}`}>
                Select {role.title}
              </div>
            </motion.button>
          ))}
        </div>

        {/* Info Note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className={`text-center text-sm ${isDuneli ? 'text-[#1A1A2E]/40' : `${theme.textColor} opacity-60`}`}
        >
          <p>You can change your role or leave the discussion at any time.</p>
        </motion.div>
      </div>
    </div>
  );
}
