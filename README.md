# 🎙️ DUNELI - Structured Audio Discussion Platform

[![Firebase](https://img.shields.io/badge/Firebase-11.1.0-orange.svg)](https://firebase.google.com/)
[![Agora](https://img.shields.io/badge/Agora-4.21.0-blue.svg)](https://www.agora.io/)
[![React](https://img.shields.io/badge/React-18.3.1-61dafb.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3.0-blue.svg)](https://www.typescriptlang.org/)

**DUNELI** is a structured audio discussion platform where **ideas compete, not people**. Built with Firebase, Agora Web SDK, and React.

---

## 🌟 Features

### Core Functionality
- 🎭 **Anonymous Identity** - Every user gets a unique anonymous ID (e.g., Δ-8472)
- 🎙️ **Audio-Only Meetings** - Focus on ideas through voice discussions
- 🎯 **Three Roles**: Listener, Speaker, Debater
- ⏱️ **Timed Speaking** - Speakers get exactly 3 minutes
- 📋 **FIFO Queue** - Fair speaking order, no skipping
- 👍👎 **Real-time Reactions** - Agree/Disagree without interrupting

### Technical Features
- 🔐 **Firebase Authentication** - Google & Phone OTP
- 📊 **Firestore Database** - Real-time sync
- ☁️ **Cloud Functions** - Agora tokens, timers, cleanup
- 🔒 **Security Rules** - Production-ready permissions
- 📈 **Firebase Analytics** - Track user engagement
- 🚀 **Firebase Hosting** - Fast global CDN

---

## 🏗️ Architecture

```
┌─────────────────┐
│   React App     │
│  (Vite + TS)    │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
┌───▼────┐ ┌─▼──────┐
│Firebase│ │ Agora  │
│        │ │Web SDK │
│ • Auth │ │        │
│ • DB   │ │• Audio │
│ • Fn   │ │• RTC   │
└────────┘ └────────┘
```

---

## 📋 Prerequisites

- **Node.js** 18+ 
- **npm** or **pnpm**
- **Firebase CLI**: `npm install -g firebase-tools`
- **Firebase Project** (create at [console.firebase.google.com](https://console.firebase.google.com))
- **Git**

---

## 🚀 Quick Start

### 1️⃣ Clone & Install

```bash
# Clone repository
git clone <your-repo-url>
cd duneli-homepage

# Install dependencies
npm install

# Install Cloud Functions dependencies
cd functions
npm install
cd ..
```

### 2️⃣ Firebase Setup

```bash
# Login to Firebase
firebase login

# Link to your Firebase project
firebase use --add
# Select your project and enter alias: default
```

### 3️⃣ Configure Environment

```bash
# Copy example env file
cp .env.example .env
```

Edit `.env` with your Firebase config:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

Get these values from:
**Firebase Console** → **Project Settings** → **General** → **Your apps** → **Web app**

### 4️⃣ Enable Firebase Services

In Firebase Console:

1. **Authentication** → Enable **Google** and **Phone** sign-in
2. **Firestore Database** → Create database (start in production mode)
3. **Functions** → Ensure Blaze plan is enabled (required for Cloud Functions)
4. **Hosting** → Initialize if not already done

### 5️⃣ Deploy Backend

```bash
# Deploy Firestore rules and indexes
firebase deploy --only firestore

# Build and deploy Cloud Functions
cd functions
npm run build
cd ..
firebase deploy --only functions

# Wait for indexes to build (check Firebase Console)
```

### 6️⃣ Run Development Server

```bash
npm run dev
```

Visit `http://localhost:5173`

### 7️⃣ Deploy to Production

```bash
# Build frontend
npm run build

# Deploy to Firebase Hosting
firebase deploy --only hosting

# Or deploy everything at once
firebase deploy
```

---

## 📁 Project Structure

```
duneli-homepage/
├── functions/              # Firebase Cloud Functions
│   ├── src/
│   │   └── index.ts       # All Cloud Functions
│   ├── package.json
│   └── tsconfig.json
├── src/
│   ├── app/
│   │   ├── components/    # React components
│   │   ├── config/        # App configuration
│   │   ├── data/          # Mock data
│   │   └── types/         # TypeScript types
│   ├── contexts/          # React contexts
│   │   └── AuthContext.tsx
│   ├── hooks/             # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── useDiscussion.ts
│   │   ├── useQueue.ts
│   │   ├── useReactions.ts
│   │   └── useTimer.ts
│   ├── lib/               # Core libraries
│   │   ├── firebase.ts    # Firebase setup
│   │   └── agora.ts       # Agora setup
│   ├── services/          # Business logic
│   │   ├── authService.ts
│   │   ├── discussionService.ts
│   │   ├── agoraService.ts
│   │   ├── queueService.ts
│   │   └── reactionService.ts
│   └── styles/            # Global styles
├── firebase.json          # Firebase configuration
├── firestore.rules        # Security rules
├── firestore.indexes.json # Database indexes
├── .env.example           # Environment template
└── package.json           # Dependencies
```

---

## 🔐 Security

### Firestore Security Rules

Rules are in `firestore.rules`:

- ✅ **Users**: Can only write their own profile
- ✅ **Topics**: Only creators can update
- ✅ **Participants**: Can only join/leave for themselves
- ✅ **Queue**: FIFO enforcement
- ✅ **Reactions**: Anti-spam protection
- ✅ **Guest Mode**: Read-only access

### Agora Token Security

- 🔒 Tokens generated server-side only via Cloud Function
- 🔒 Certificate never exposed to frontend
- 🔒 1-hour token expiry
- 🔒 Role-based permissions (listener/publisher)

---

## 🎙️ Meeting Roles

### 🔇 Listener
- Audio listen only
- 👍 / 👎 reactions allowed
- Cannot raise hand
- Mic always OFF

### 🎤 Speaker
- Can raise hand to speak
- Joins FIFO queue
- Gets **exactly 3 minutes**
- Auto-muted at 0:00
- Returns to Listener after speaking

### 🎯 Debater
- Mic always available
- Manual mute/unmute control
- No time limit
- Can speak anytime

---

## 🛠️ Cloud Functions

Deployed functions:

1. **`generateAgoraToken`** - Generate Agora RTC tokens
2. **`startSpeakerTimer`** - Start 3-minute timer for speakers
3. **`processSpeakerTimers`** - Auto-mute speakers after 3 minutes (runs every minute)
4. **`cleanupInactiveParticipants`** - Remove stale participants (every 5 min)
5. **`cleanupOldReactions`** - Delete old reactions (every hour)
6. **`cleanupDoneQueueEntries`** - Remove done queue entries (every minute)
7. **`updateLastActive`** - Update user activity timestamp
8. **`autoEndLongDiscussions`** - End discussions after 2 hours (every 10 min)

---

## 📊 Firestore Collections

### `users`
```typescript
{
  anonymousId: string        // e.g., "Δ-8472"
  authProvider: string       // "google" | "phone" | "guest"
  createdAt: Timestamp
  lastActiveAt: Timestamp
}
```

### `topics`
```typescript
{
  title: string
  category: string
  createdBy: string          // userId
  createdAt: Timestamp
  scheduledAt: Timestamp?
  status: string             // "live" | "upcoming" | "ended"
  interestCount: number
}
```

### `discussions`
```typescript
{
  topicId: string
  startedAt: Timestamp
  endedAt: Timestamp?
  agoraChannelName: string
  status: string             // "live" | "ended"
}
```

### `participants`
```typescript
{
  discussionId: string
  userId: string
  role: string               // "listener" | "speaker" | "debater"
  joinedAt: Timestamp
}
```

### `speakingQueue`
```typescript
{
  discussionId: string
  userId: string
  requestedAt: Timestamp
  status: string             // "waiting" | "speaking" | "done"
}
```

### `reactions`
```typescript
{
  discussionId: string
  userId: string
  type: string               // "agree" | "disagree"
  createdAt: Timestamp
}
```

---

## 🧪 Testing

### Local Testing with Emulators

```bash
# Start Firebase emulators
firebase emulators:start

# In another terminal, run dev server
npm run dev
```

### Test Checklist

- [ ] Google sign-in works
- [ ] Phone OTP works
- [ ] Guest mode restricts interactions
- [ ] Can create discussion
- [ ] Can join as Listener
- [ ] Can join as Speaker (queue works)
- [ ] Can join as Debater
- [ ] Speaker gets 3-minute timer
- [ ] Auto-mute at 0:00 works
- [ ] Reactions work (👍/👎)
- [ ] Audio works in Agora
- [ ] Can leave meeting
- [ ] Analytics events fire

---

## 🐛 Troubleshooting

### "Permission denied" in Firestore
- Ensure security rules are deployed: `firebase deploy --only firestore:rules`
- Verify user is authenticated
- Check rule conditions match your query

### Agora token generation fails
- Verify Cloud Function is deployed: `firebase functions:list`
- Check logs: `firebase functions:log --only generateAgoraToken`
- Ensure user is authenticated before calling

### Audio not working
- Check browser microphone permissions
- Verify Agora credentials in `src/lib/agora.ts`
- Check role (listeners can't speak)
- Test with two different browsers/devices

### Speaker timer doesn't work
- Verify `processSpeakerTimers` function is deployed
- Check function logs: `firebase functions:log`
- Ensure `speakerTimers` collection exists

### Build fails
- Clear node_modules: `rm -rf node_modules && npm install`
- Clear build cache: `rm -rf dist .vite`
- Check Node.js version: `node --version` (should be 18+)

---

## 📈 Monitoring

### Firebase Console

Monitor at [console.firebase.google.com](https://console.firebase.google.com):

- **Authentication**: User sign-ups and activity
- **Firestore**: Read/write operations and costs
- **Functions**: Invocations, errors, execution time
- **Analytics**: User events and engagement
- **Hosting**: Traffic and bandwidth

### Agora Console

Monitor at [console.agora.io](https://console.agora.io):

- Real-time channel usage
- Audio quality metrics
- Concurrent users
- Usage statistics

### Logs

```bash
# View all function logs
firebase functions:log

# View specific function logs
firebase functions:log --only generateAgoraToken

# Stream logs in real-time
firebase functions:log --follow
```

---

## 🔧 Configuration

### Agora Credentials

Already configured in code:
- **App ID**: `649581f9f2664ca5b6e54ed70bc371b5`
- **App Certificate**: `5a2286112a1f4901ad710c5fbecab0ec`

These are set in:
- `src/lib/agora.ts` (Frontend)
- `functions/src/index.ts` (Backend)

### Firebase Limits

- **Firestore**: 50,000 reads/day (free), unlimited writes
- **Functions**: 125,000 invocations/month (free)
- **Hosting**: 10 GB storage, 360 MB/day transfer (free)
- **Agora**: 10,000 minutes/month (free)

For production, upgrade to Blaze plan (pay-as-you-go).

---

## 🚀 Scaling

### Database
- Firestore scales automatically
- Optimize queries with composite indexes
- Monitor read/write costs in console

### Functions
- Auto-scales based on demand
- Consider upgrading to larger instance sizes if needed
- Monitor execution time and memory usage

### Agora
- Scales automatically for audio channels
- Monitor concurrent users in Agora console
- Upgrade plan as needed

---

## 📚 Resources

- [Full Setup Guide](./SETUP_GUIDE.md)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Agora Web SDK Docs](https://docs.agora.io/en/voice-calling/overview/product-overview)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Cloud Functions Guide](https://firebase.google.com/docs/functions)

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 🙏 Acknowledgments

- **Firebase** - Backend infrastructure
- **Agora** - Real-time audio
- **React** - Frontend framework
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components

---

## 📧 Support

For issues and questions:

1. Check [Troubleshooting](#-troubleshooting) section
2. Review Firebase Console logs
3. Check Cloud Functions logs
4. Open an issue on GitHub

---

**Made with ❤️ for meaningful discussions where ideas compete, not people.**
