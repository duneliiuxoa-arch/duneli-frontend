export type Category = 
  | 'Geography' 
  | 'Politics' 
  | 'History'
  | 'Sports' 
  | 'Technology' 
  | 'Environment';

export type Language = 
  | 'English'
  | 'Chinese'
  | 'Spanish'
  | 'French'
  | 'German'
  | 'Hindi';

export type DiscussionStatus = 'live' | 'upcoming' | 'ended';

export type SortOption = 'trending' | 'newest' | 'mostInterested';

export type DiscoveryMode = 'interest' | 'categories';

export type Theme = 'aurora' | 'mist' | 'mint' | 'dream';

export type Page = 'entry' | 'homepage' | 'roleSelection' | 'meeting' | 'leaving' | 'myActivity' | 'myTopics' | 'supportedTopics' | 'savedTopics' | 'notifications' | 'privacy' | 'notFound';

export type Role = 'listener' | 'speaker' | 'debater';

export type FeedbackOption = 'thoughtProvoking' | 'calm' | 'confusing' | 'neutral';

export interface Discussion {
  id: string;
  title: string;
  category: Category;
  language: Language;
  status: DiscussionStatus;
  interestCount: number;
  listenerCount?: number;
  speakerCount?: number;
  currentSpeaker?: string;
  scheduledTime?: Date;
  startedTime?: Date;
  duration?: number;
  hostId: string;
  hostName: string;
  hasUserInterest?: boolean;
  hasUserSaved?: boolean;
  meetingId?: string; // backend meeting ID for transcription
}

export interface HandRaiseRequest {
  userId: string;
  userName: string;
  timestamp: Date;
}

export interface Idea {
  id: string;
  speakerId: string;
  speakerName: string;
  content: string;
  timestamp: Date;
  agreeCount: number;
  disagreeCount: number;
  hasUserAgreed?: boolean;
  hasUserDisagreed?: boolean;
}

export interface Participant {
  id: string;
  name: string;
  role: Role;
  isSpeaking: boolean;
  speakingStartTime?: Date;
}

export interface Notification {
  id: string;
  type: 'discussionStarted' | 'discussionEnding' | 'discussionScheduled' | 'savedDiscussion';
  message: string;
  discussionId: string;
  discussionTitle: string;
  timestamp: Date;
  read: boolean;
}

export interface User {
  id: string;
  name: string;
  avatar: string;
  isLoggedIn: boolean;
}