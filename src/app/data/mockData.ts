import { Discussion, Notification, User } from '../types';

export const mockDiscussions: Discussion[] = [
  // LIVE DISCUSSIONS
  {
    id: 'live-1',
    title: 'How should democratic systems adapt to rapid information spread?',
    category: 'Politics',
    language: 'English',
    status: 'live',
    interestCount: 342,
    listenerCount: 127,
    speakerCount: 4,
    currentSpeaker: 'Emma Thompson',
    startedTime: new Date(Date.now() - 25 * 60000), // 25 minutes ago
    duration: 60,
    hostId: 'host1',
    hostName: 'Emma Thompson',
  },
  {
    id: 'live-2',
    title: 'What role should AI play in climate modeling and prediction?',
    category: 'Environment',
    language: 'English',
    status: 'live',
    interestCount: 567,
    listenerCount: 89,
    speakerCount: 3,
    currentSpeaker: 'Sarah Chen',
    startedTime: new Date(Date.now() - 42 * 60000), // 42 minutes ago
    duration: 90,
    hostId: 'host2',
    hostName: 'Sarah Chen',
  },
  {
    id: 'live-3',
    title: 'Can quantum computing break current encryption standards?',
    category: 'Technology',
    language: 'English',
    status: 'live',
    interestCount: 512,
    listenerCount: 156,
    speakerCount: 5,
    currentSpeaker: 'David Kim',
    startedTime: new Date(Date.now() - 18 * 60000), // 18 minutes ago
    duration: 60,
    hostId: 'host3',
    hostName: 'David Kim',
  },

  // UPCOMING DISCUSSIONS
  {
    id: 'upcoming-1',
    title: 'Should historical preservation prioritize authenticity over accessibility?',
    category: 'History',
    language: 'English',
    status: 'upcoming',
    interestCount: 234,
    scheduledTime: new Date(Date.now() + 2 * 60 * 60000), // 2 hours from now
    duration: 60,
    hostId: 'host4',
    hostName: 'Alex Morgan',
  },
  {
    id: 'upcoming-2',
    title: 'Does geographic isolation foster unique cultural development?',
    category: 'Geography',
    language: 'English',
    status: 'upcoming',
    interestCount: 189,
    scheduledTime: new Date(Date.now() + 4 * 60 * 60000), // 4 hours from now
    duration: 90,
    hostId: 'host5',
    hostName: 'Maya Patel',
  },
  {
    id: 'upcoming-3',
    title: 'What are the ethical boundaries of predictive analytics in sports?',
    category: 'Sports',
    language: 'English',
    status: 'upcoming',
    interestCount: 156,
    scheduledTime: new Date(Date.now() + 24 * 60 * 60000), // 1 day from now
    duration: 60,
    hostId: 'host6',
    hostName: 'Chris Williams',
  },
  {
    id: 'upcoming-4',
    title: '气候变化对农业生产的长期影响是什么？',
    category: 'Environment',
    language: 'Chinese',
    status: 'upcoming',
    interestCount: 298,
    scheduledTime: new Date(Date.now() + 6 * 60 * 60000), // 6 hours from now
    duration: 75,
    hostId: 'host7',
    hostName: 'Wei Zhang',
  },
  {
    id: 'upcoming-5',
    title: 'Quel est le rôle de l\'intelligence artificielle dans l\'éducation moderne?',
    category: 'Technology',
    language: 'French',
    status: 'upcoming',
    interestCount: 201,
    scheduledTime: new Date(Date.now() + 8 * 60 * 60000), // 8 hours from now
    duration: 60,
    hostId: 'host8',
    hostName: 'Marie Dubois',
  },
  {
    id: 'upcoming-6',
    title: 'How did trade routes shape ancient civilizations?',
    category: 'History',
    language: 'English',
    status: 'upcoming',
    interestCount: 387,
    scheduledTime: new Date(Date.now() + 12 * 60 * 60000), // 12 hours from now
    duration: 90,
    hostId: 'host9',
    hostName: 'Michael Zhang',
  },
];

export const mockNotifications: Notification[] = [
  {
    id: 'n1',
    type: 'discussionStarted',
    message: 'Discussion has started',
    discussionId: 'live-1',
    discussionTitle: 'How should democratic systems adapt to rapid information spread?',
    timestamp: new Date(Date.now() - 25 * 60000),
    read: false,
  },
  {
    id: 'n2',
    type: 'discussionScheduled',
    message: 'Scheduled for today at 3:00 PM',
    discussionId: 'upcoming-1',
    discussionTitle: 'Should historical preservation prioritize authenticity over accessibility?',
    timestamp: new Date(Date.now() - 2 * 60 * 60000),
    read: false,
  },
  {
    id: 'n3',
    type: 'discussionEnding',
    message: 'Discussion ending in 10 minutes',
    discussionId: 'live-2',
    discussionTitle: 'What role should AI play in climate modeling and prediction?',
    timestamp: new Date(Date.now() - 5 * 60000),
    read: true,
  },
];

export const mockUser: User = {
  id: 'guest',
  name: 'Guest',
  avatar: '',
  isLoggedIn: false,
};
