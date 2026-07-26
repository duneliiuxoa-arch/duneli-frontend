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

  const roles = [
    {
      id: 'listener' as Role,
      icon: Headphones,
      title: 'Listener',
      description: 'Listen, react to ideas, and raise your hand to speak.',
      permissions: [
        'Listen to all speakers',
        'React to ideas with 👍 / 👎',
        'Raise hand to request speaking time',
        'Microphone stays OFF'
      ]
    },
    {
      id: 'speaker' as Role,
      icon: Mic,
      title: 'Speaker',
      description: 'Speak for up to 3 minutes when your turn comes.',
      permissions: [
        'Join the speaking queue',
        '3-minute speaking limit',
        'Timer shown during your turn',
        'Auto-muted when time ends',
        'Return to Listener after speaking'
      ]
    },
    {
      id: 'debater' as Role,
      icon: Scale,
      title: 'Debater',
      description: 'Speak up to 3 times per hour, 3 minutes each time.',
      permissions: [
        '3 speaking slots per hour',
        '3-minute mic time per slot',
        'Mic auto-mutes after 3 minutes',
        'Tap mic again to use next slot',
        'Slots reset after 1 hour'
      ]
    }
  ];

  return (
    <div 
      className={`min-h-screen ${theme.textColor}`}
      style={{ background: theme.background, fontFamily: 'var(--font-body)' }}
    >
      <div className="max-w-6xl mx-auto px-4 py-8 sm:px-8 sm:py-12">
        {/* Back Button */}
        <button
          onClick={onBack}
          className={`${theme.cardStyle} rounded-full px-4 py-2.5 sm:px-6 sm:py-3 flex items-center gap-2 hover:scale-105 transition-all mb-6 sm:mb-8 text-sm sm:text-base`}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Homepage</span>
        </button>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8 sm:mb-12"
        >
          <h1 
            className={`text-2xl sm:text-4xl md:text-5xl font-bold mb-4 ${theme.textColor}`}
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            How would you like to join this discussion?
          </h1>
          
          {/* Discussion Info */}
          <div className={`${theme.cardStyle} rounded-2xl p-4 sm:p-6 mt-6 sm:mt-8 max-w-3xl mx-auto`}>
            <h2 className={`text-lg sm:text-xl font-semibold mb-2 ${theme.textColor}`}>
              {discussion.title}
            </h2>
            <div className={`flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-xs sm:text-sm ${theme.textColor} opacity-70`}>
              <span className={`px-3 py-1 rounded-full ${theme.cardStyle}`}>
                {discussion.category}
              </span>
              <span className="hidden sm:inline">•</span>
              <span>{discussion.listenerCount} listening</span>
              <span className="hidden sm:inline">•</span>
              <span>Hosted by {discussion.hostName}</span>
            </div>
          </div>
        </motion.div>

        {/* Role Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-8">
          {roles.map((role, index) => (
            <motion.button
              key={role.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => onSelectRole(role.id)}
              className={`${theme.cardStyle} rounded-3xl p-5 sm:p-8 text-left hover:scale-105 transition-all group`}
            >
              {/* Icon */}
              <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full ${theme.buttonClass} flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform`}>
                <role.icon className="w-6 h-6 sm:w-8 sm:h-8" />
              </div>

              {/* Title & Description */}
              <h3 
                className={`text-xl sm:text-2xl font-bold mb-2 sm:mb-3 ${theme.textColor}`}
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                {role.title}
              </h3>
              <p className={`${theme.textColor} opacity-80 mb-4 sm:mb-6 text-sm sm:text-base`}>
                {role.description}
              </p>

              {/* Permissions */}
              <div className="space-y-2">
                {role.permissions.map((permission, idx) => (
                  <div key={idx} className={`flex items-start gap-2 text-sm ${theme.textColor} opacity-70`}>
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span>{permission}</span>
                  </div>
                ))}
              </div>

              {/* Select Button */}
              <div className={`mt-6 w-full py-3 rounded-2xl text-center font-medium ${theme.buttonClass}`}>
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
          className={`text-center ${theme.textColor} opacity-60 text-sm`}
        >
          <p>You can change your role or leave the discussion at any time.</p>
        </motion.div>
      </div>
    </div>
  );
}
