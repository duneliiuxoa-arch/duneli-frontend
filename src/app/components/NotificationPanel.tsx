import { Bell, X, Check } from 'lucide-react';
import { useState } from 'react';
import { Notification, Theme } from '../types';
import { themes } from '../config/themes';
import { motion, AnimatePresence } from 'motion/react';

interface NotificationPanelProps {
  notifications: Notification[];
  currentTheme: Theme;
  onMarkAsRead: (notificationId: string) => void;
  onMarkAllAsRead: () => void;
}

export function NotificationPanel({
  notifications,
  currentTheme,
  onMarkAsRead,
  onMarkAllAsRead,
}: NotificationPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const theme = themes[currentTheme];
  const unreadCount = notifications.filter(n => !n.read).length;

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'discussionStarted':
        return '🎙️';
      case 'discussionEnding':
        return '⏰';
      case 'discussionScheduled':
        return '📅';
      case 'savedDiscussion':
        return '🔖';
    }
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <>
      {/* Notification Bell */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-8 right-8 ${theme.buttonClass} w-14 h-14 rounded-full flex items-center justify-center shadow-lg z-40`}
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
          >
            {unreadCount}
          </motion.div>
        )}
      </motion.button>

      {/* Notification Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            />

            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className={`fixed bottom-0 right-0 w-full sm:w-96 h-[70vh] ${theme.cardStyle} rounded-t-3xl sm:rounded-3xl sm:bottom-8 sm:right-8 sm:h-[600px] z-50 flex flex-col`}
            >
              {/* Header */}
              <div className={`flex items-center justify-between p-6 border-b ${theme.textColor === 'text-white' ? 'border-white/10' : 'border-gray-200'}`}>
                <h3 className={`font-semibold flex items-center gap-2 ${theme.textColor}`} style={{ fontFamily: 'var(--font-heading)' }}>
                  <Bell className="w-5 h-5" />
                  Notifications
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 bg-red-500 text-white rounded-full text-xs">
                      {unreadCount}
                    </span>
                  )}
                </h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                  <X className={`w-5 h-5 ${theme.textColor}`} />
                </button>
              </div>

              {/* Notifications List */}
              <div className="flex-1 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className={`flex flex-col items-center justify-center h-full opacity-50 ${theme.textColor}`}>
                    <Bell className="w-12 h-12 mb-4" />
                    <p>No notifications yet</p>
                  </div>
                ) : (
                  <>
                    {notifications.map((notification) => (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`p-4 border-b ${theme.textColor === 'text-white' ? 'border-white/10' : 'border-gray-200'} hover:bg-white/5 transition-colors ${
                          !notification.read ? 'bg-white/5' : ''
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="text-2xl">{getNotificationIcon(notification.type)}</div>
                          <div className="flex-1 min-w-0">
                            <p className={`font-medium mb-1 ${theme.textColor}`}>{notification.message}</p>
                            <p className={`text-sm opacity-70 line-clamp-1 mb-2 ${theme.textColor}`}>
                              {notification.discussionTitle}
                            </p>
                            <p className={`text-xs opacity-50 ${theme.textColor}`}>{formatTimestamp(notification.timestamp)}</p>
                          </div>
                          {!notification.read && (
                            <button
                              onClick={() => onMarkAsRead(notification.id)}
                              className="p-1 hover:bg-white/10 rounded-full transition-colors"
                              title="Mark as read"
                            >
                              <Check className={`w-4 h-4 ${theme.textColor}`} />
                            </button>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </>
                )}
              </div>

              {/* Footer */}
              {notifications.length > 0 && unreadCount > 0 && (
                <div className={`p-4 border-t ${theme.textColor === 'text-white' ? 'border-white/10' : 'border-gray-200'}`}>
                  <button
                    onClick={onMarkAllAsRead}
                    className={`w-full py-2 px-4 rounded-full ${theme.buttonClass} transition-colors`}
                  >
                    Mark all as read
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
