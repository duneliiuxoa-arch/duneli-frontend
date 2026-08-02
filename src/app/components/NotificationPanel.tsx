import { Bell, X, Check, Mic, Clock, Calendar, Bookmark } from 'lucide-react';
import { useState } from 'react';
import { Notification, Theme } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface NotificationPanelProps {
  notifications: Notification[];
  currentTheme: Theme;
  onMarkAsRead: (notificationId: string) => void;
  onMarkAllAsRead: () => void;
}

export function NotificationPanel({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
}: NotificationPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'discussionStarted':
        return (
          <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#3B5BF6] shrink-0">
            <Mic className="w-4 h-4" />
          </div>
        );
      case 'discussionEnding':
        return (
          <div className="w-9 h-9 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-[#F97316] shrink-0">
            <Clock className="w-4 h-4" />
          </div>
        );
      case 'discussionScheduled':
        return (
          <div className="w-9 h-9 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-[#7C3AED] shrink-0">
            <Calendar className="w-4 h-4" />
          </div>
        );
      case 'savedDiscussion':
        return (
          <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[#10b981] shrink-0">
            <Bookmark className="w-4 h-4" />
          </div>
        );
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
      {/* Notification Bell Floating Button */}
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-8 right-8 w-14 h-14 rounded-full bg-white border-2 border-slate-200/90 shadow-2xl flex items-center justify-center text-[#3B5BF6] z-[9999] cursor-pointer hover:border-[#3B5BF6] transition-all"
        style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
      >
        <Bell className="w-6 h-6 text-[#3B5BF6]" />
        {unreadCount > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 bg-[#3B5BF6] text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shadow-md"
          >
            {unreadCount}
          </motion.div>
        )}
      </motion.button>

      {/* Notification Panel Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-slate-950/40 backdrop-blur-md z-40"
            />

            {/* Solid High-Contrast Panel */}
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.96 }}
              className="fixed bottom-0 right-0 w-full sm:w-[420px] h-[75vh] sm:h-[580px] bg-white border-2 border-slate-200/90 shadow-2xl rounded-t-3xl sm:rounded-3xl sm:bottom-8 sm:right-8 z-50 flex flex-col overflow-hidden"
              style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
            >
              {/* Panel Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-white">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#3B5BF6]">
                    <Bell className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-extrabold text-[#1A1A2E] tracking-tight">
                    Notifications
                  </h3>
                  {unreadCount > 0 && (
                    <span className="px-2.5 py-0.5 bg-[#3B5BF6] text-white rounded-full text-xs font-extrabold">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-[#1A1A2E] transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Notifications List */}
              <div className="flex-1 overflow-y-auto divide-y divide-slate-100 bg-white">
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-slate-400 p-8 text-center">
                    <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center mb-3">
                      <Bell className="w-7 h-7 text-slate-300" />
                    </div>
                    <p className="text-sm font-bold text-[#1A1A2E]">No notifications yet</p>
                    <p className="text-xs text-slate-400 mt-1">We'll alert you when sessions start or schedule updates occur.</p>
                  </div>
                ) : (
                  <>
                    {notifications.map((notification) => (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`p-4 transition-colors flex items-start gap-3.5 ${
                          !notification.read ? 'bg-blue-50/40' : 'hover:bg-slate-50/80'
                        }`}
                      >
                        {getNotificationIcon(notification.type)}

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-0.5">
                            <p className="text-xs sm:text-sm font-extrabold text-[#1A1A2E] leading-snug">
                              {notification.message}
                            </p>
                            {!notification.read && (
                              <span className="w-2 h-2 rounded-full bg-[#3B5BF6] shrink-0" />
                            )}
                          </div>

                          <p className="text-xs font-semibold text-slate-600 line-clamp-1 mb-1">
                            {notification.discussionTitle}
                          </p>

                          <p className="text-[11px] font-bold text-slate-400">
                            {formatTimestamp(notification.timestamp)}
                          </p>
                        </div>

                        {!notification.read && (
                          <button
                            onClick={() => onMarkAsRead(notification.id)}
                            className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-[#3B5BF6] hover:border-[#3B5BF6] transition-all cursor-pointer shrink-0"
                            title="Mark as read"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </motion.div>
                    ))}
                  </>
                )}
              </div>

              {/* Footer */}
              {notifications.length > 0 && unreadCount > 0 && (
                <div className="p-4 border-t border-slate-100 bg-white">
                  <button
                    onClick={onMarkAllAsRead}
                    className="w-full py-2.5 px-4 rounded-xl bg-[#1A1A2E] hover:bg-[#2d2d4e] active:scale-95 text-white text-xs font-extrabold shadow-md transition-all cursor-pointer"
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
