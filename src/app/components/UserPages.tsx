// =============================================================
// UserPages.tsx — My Activity, My Topics, Supported Topics,
//                 Saved Topics, Notifications pages
// =============================================================
import { useEffect, useState } from 'react';
import { ArrowLeft, TrendingUp, MessageSquare, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { Theme, Notification, User } from '../types';
import { themes } from '../config/themes';
import { fetchMyActivity, fetchMyTopics, fetchSupportedTopics } from '../../services/discussionService';

// ── Shared back-button page shell ─────────────────────────────
function PageShell({
  title,
  currentTheme,
  onBack,
  children,
}: {
  title: string;
  currentTheme: Theme;
  onBack: () => void;
  children: React.ReactNode;
}) {
  const theme = themes[currentTheme];
  return (
    <div
      className={`min-h-screen ${theme.textColor}`}
      style={{ background: theme.background, fontFamily: 'var(--font-body)' }}
    >
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <button
          onClick={onBack}
          className={`flex items-center gap-2 mb-6 sm:mb-8 ${theme.textColor} opacity-70 hover:opacity-100 transition-opacity`}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8" style={{ fontFamily: 'var(--font-heading)' }}>
          {title}
        </h1>
        {children}
      </div>
    </div>
  );
}

// ── Status badge ───────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
    ACTIVE:    { label: 'Active',    color: 'bg-green-400/20 text-green-700',  icon: <AlertCircle className="w-3 h-3" /> },
    CLOSED:    { label: 'Ended',     color: 'bg-gray-400/20 text-gray-600',    icon: <XCircle className="w-3 h-3" /> },
    SCHEDULED: { label: 'Scheduled', color: 'bg-blue-400/20 text-blue-700',    icon: <Clock className="w-3 h-3" /> },
    COMPLETED: { label: 'Done',      color: 'bg-purple-400/20 text-purple-700',icon: <CheckCircle className="w-3 h-3" /> },
  };
  const s = map[status?.toUpperCase()] ?? { label: status, color: 'bg-gray-200 text-gray-600', icon: null };
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${s.color}`}>
      {s.icon}{s.label}
    </span>
  );
}

// ── Empty state ────────────────────────────────────────────────
function EmptyState({ message }: { message: string }) {
  return (
    <div className="text-center py-20 opacity-50">
      <p className="text-lg">{message}</p>
    </div>
  );
}

// ── Loading skeleton ───────────────────────────────────────────
function LoadingSkeleton({ theme }: { theme: string }) {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map(i => (
        <div key={i} className={`h-20 rounded-xl animate-pulse ${theme}`} style={{ opacity: 0.4 }} />
      ))}
    </div>
  );
}

// =============================================================
// MY ACTIVITY PAGE
// =============================================================
export function MyActivityPage({
  currentTheme,
  onBack,
}: {
  currentTheme: Theme;
  onBack: () => void;
}) {
  const theme = themes[currentTheme];
  const [attendances, setAttendances] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyActivity().then(data => {
      setAttendances(data);
      setLoading(false);
    });
  }, []);

  return (
    <PageShell title="My Activity" currentTheme={currentTheme} onBack={onBack}>
      {loading ? (
        <LoadingSkeleton theme={theme.cardStyle} />
      ) : attendances.length === 0 ? (
        <EmptyState message="You haven't attended any discussions yet." />
      ) : (
        <div className="space-y-3">
          {attendances.map((a: any, i: number) => {
            const duration = a.leftAt && a.joinedAt
              ? Math.round((new Date(a.leftAt).getTime() - new Date(a.joinedAt).getTime()) / 60000)
              : null;
            return (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`${theme.cardStyle} rounded-xl px-4 sm:px-5 py-3 sm:py-4`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate text-sm sm:text-base">{a.meeting?.topic?.title ?? 'Unknown topic'}</p>
                    <p className="text-sm opacity-60 mt-0.5">
                      {new Date(a.joinedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      {duration !== null && ` · ${duration} min`}
                    </p>
                    {a.meeting?.post && (
                      <p className="text-xs mt-1 opacity-50">📄 Post: {a.meeting.post.title}</p>
                    )}
                  </div>
                  <StatusBadge status={a.meeting?.status ?? ''} />
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </PageShell>
  );
}

// =============================================================
// MY TOPICS PAGE
// =============================================================
export function MyTopicsPage({
  currentTheme,
  onBack,
}: {
  currentTheme: Theme;
  onBack: () => void;
}) {
  const theme = themes[currentTheme];
  const [topics, setTopics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyTopics().then(data => {
      setTopics(data);
      setLoading(false);
    });
  }, []);

  return (
    <PageShell title="My Topics" currentTheme={currentTheme} onBack={onBack}>
      {loading ? (
        <LoadingSkeleton theme={theme.cardStyle} />
      ) : topics.length === 0 ? (
        <EmptyState message="You haven't created any topics yet." />
      ) : (
        <div className="space-y-3">
          {topics.map((t: any, i: number) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`${theme.cardStyle} rounded-xl px-4 sm:px-5 py-3 sm:py-4`}
              >
              <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
              <p className="font-semibold truncate text-sm sm:text-base">{t.title}</p>
                  <div className="flex items-center gap-3 mt-1 text-sm opacity-60">
                    <span className="flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      {t.topicScore?.voteCount ?? t._count?.votes ?? 0} votes
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="w-3 h-3" />
                      {t._count?.chatMessages ?? 0} messages
                    </span>
                    <span>{new Date(t.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                  </div>
                </div>
                <StatusBadge status={t.status} />
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </PageShell>
  );
}

// =============================================================
// SUPPORTED TOPICS PAGE
// =============================================================
export function SupportedTopicsPage({
  currentTheme,
  onBack,
}: {
  currentTheme: Theme;
  onBack: () => void;
}) {
  const theme = themes[currentTheme];
  const [votes, setVotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSupportedTopics().then(data => {
      setVotes(data);
      setLoading(false);
    });
  }, []);

  return (
    <PageShell title="Supported Topics" currentTheme={currentTheme} onBack={onBack}>
      {loading ? (
        <LoadingSkeleton theme={theme.cardStyle} />
      ) : votes.length === 0 ? (
        <EmptyState message="You haven't supported any topics yet." />
      ) : (
        <div className="space-y-3">
          {votes.map((v: any, i: number) => (
            <motion.div
              key={v.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`${theme.cardStyle} rounded-xl px-4 sm:px-5 py-3 sm:py-4`}
              >
              <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
              <p className="font-semibold truncate text-sm sm:text-base">{v.topic?.title ?? 'Unknown topic'}</p>
                  <div className="flex items-center gap-3 mt-1 text-sm opacity-60">
                    <span>by {v.topic?.createdBy?.name ?? 'Unknown'}</span>
                    <span className="flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      {v.topic?.topicScore?.voteCount ?? 0} total votes
                    </span>
                    <span>Supported {new Date(v.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                  </div>
                </div>
                <StatusBadge status={v.topic?.status ?? ''} />
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </PageShell>
  );
}

// =============================================================
// SAVED TOPICS PAGE
// (Uses hasUserSaved on Discussion — stored client-side for now
//  since backend doesn't have a savedTopics table yet)
// =============================================================
export function SavedTopicsPage({
  currentTheme,
  onBack,
  savedDiscussions,
}: {
  currentTheme: Theme;
  onBack: () => void;
  savedDiscussions: Array<{ id: string; title: string; status: string; interestCount: number }>;
}) {
  const theme = themes[currentTheme];

  return (
    <PageShell title="Saved Topics" currentTheme={currentTheme} onBack={onBack}>
      {savedDiscussions.length === 0 ? (
        <EmptyState message="No saved topics yet. Bookmark topics from the home page." />
      ) : (
        <div className="space-y-3">
          {savedDiscussions.map((d, i) => (
            <motion.div
              key={d.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`${theme.cardStyle} rounded-xl px-4 sm:px-5 py-3 sm:py-4`}
              >
              <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
              <p className="font-semibold truncate text-sm sm:text-base">{d.title}</p>
                  <p className="text-sm opacity-60 mt-1 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    {d.interestCount} votes
                  </p>
                </div>
                <StatusBadge status={d.status.toUpperCase()} />
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </PageShell>
  );
}

// =============================================================
// NOTIFICATIONS PAGE
// =============================================================
export function NotificationsPage({
  currentTheme,
  onBack,
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
}: {
  currentTheme: Theme;
  onBack: () => void;
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
}) {
  const theme = themes[currentTheme];
  const unreadCount = notifications.filter(n => !n.read).length;

  const typeLabel: Record<Notification['type'], string> = {
    discussionStarted:   '🔴 Discussion started',
    discussionEnding:    '⏰ Discussion ending soon',
    discussionScheduled: '📅 Discussion scheduled',
    savedDiscussion:     '🔖 Saved discussion update',
  };

  return (
    <PageShell title="Notifications" currentTheme={currentTheme} onBack={onBack}>
      {notifications.length > 0 && unreadCount > 0 && (
        <div className="flex justify-end mb-4">
          <button
            onClick={onMarkAllAsRead}
            className={`text-sm px-3 py-1 rounded-full ${theme.buttonClass} opacity-80 hover:opacity-100`}
          >
            Mark all as read
          </button>
        </div>
      )}
      {notifications.length === 0 ? (
        <EmptyState message="No notifications yet." />
      ) : (
        <div className="space-y-3">
          {notifications.map((n, i) => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => onMarkAsRead(n.id)}
              className={`${theme.cardStyle} rounded-xl px-4 sm:px-5 py-3 sm:py-4 cursor-pointer transition-opacity ${n.read ? 'opacity-60' : ''}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium opacity-60 mb-0.5">{typeLabel[n.type]}</p>
                  <p className="font-semibold truncate">{n.discussionTitle}</p>
                  <p className="text-sm opacity-60 mt-0.5">{n.message}</p>
                  <p className="text-xs opacity-40 mt-1">
                    {new Date(n.timestamp).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                {!n.read && (
                  <span className="w-2 h-2 rounded-full bg-pink-500 mt-1 shrink-0" />
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </PageShell>
  );
}
