# 🎙️ DUNELI - Backend Integration Complete

**Status:** ✅ Production Ready

All backend services have been fully integrated and are ready for deployment.

---

## 📂 What's Been Done

✅ **Firebase Services**
- Authentication (Google, Phone OTP, Guest mode)
- Cloud Firestore (Real-time database)
- Cloud Functions (8 server-side functions)
- Firebase Analytics (Event tracking)
- Firebase Hosting (Deployment ready)

✅ **Agora Audio**
- Audio-only meetings
- Token generation (server-side)
- Role-based permissions
- Microphone control

✅ **Core Features**
- Anonymous user identities
- Discussion management
- Speaking queue (FIFO with 3-minute timer)
- Real-time reactions
- Security rules
- Database indexes

✅ **Documentation**
- Complete setup guide
- Integration examples
- Testing procedures
- Deployment checklist
- Troubleshooting guide

---

## 🚀 Quick Start

### 1. Prerequisites

```bash
# Check Node.js (need 18+)
node --version

# Install Firebase CLI
npm install -g firebase-tools

# Install dependencies
npm install
cd functions && npm install && cd ..
```

### 2. Configure Firebase

```bash
# Login
firebase login

# Link project
firebase use --add
```

### 3. Set Environment Variables

```bash
cp .env.example .env
# Edit .env with your Firebase credentials
```

### 4. Deploy Backend

```bash
# Option 1: Use deployment script
chmod +x deploy.sh
./deploy.sh

# Option 2: Use npm scripts
npm run deploy:firestore  # Deploy rules & indexes
npm run deploy:functions  # Deploy Cloud Functions
npm run deploy:hosting    # Deploy frontend
# OR
npm run deploy:all        # Deploy everything
```

### 5. Test Locally

```bash
npm run dev
# Open http://localhost:5173
```

---

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| **[QUICK_START.md](./QUICK_START.md)** | ☑️ Step-by-step checklist |
| **[SETUP_GUIDE.md](./SETUP_GUIDE.md)** | 📖 Detailed setup instructions |
| **[INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md)** | 💻 Code examples & API usage |
| **[TESTING_GUIDE.md](./TESTING_GUIDE.md)** | 🧪 Testing procedures |
| **[IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)** | 📊 Complete overview |

**Start here:** [QUICK_START.md](./QUICK_START.md)

---

## 🏗️ Project Structure

```
duneli-homepage/
├── 📄 Documentation
│   ├── README.md                    # This file
│   ├── QUICK_START.md              # Start here!
│   ├── SETUP_GUIDE.md              # Detailed setup
│   ├── INTEGRATION_GUIDE.md        # Code usage
│   ├── TESTING_GUIDE.md            # Testing
│   └── IMPLEMENTATION_SUMMARY.md   # Overview
│
├── 🔧 Configuration
│   ├── .env.example                # Environment template
│   ├── firebase.json               # Firebase config
│   ├── firestore.rules             # Security rules
│   ├── firestore.indexes.json      # Database indexes
│   └── vite.config.ts              # Build config
│
├── ☁️ Cloud Functions
│   └── functions/
│       ├── src/index.ts            # All functions
│       └── package.json            # Function deps
│
├── 💻 Frontend
│   └── src/
│       ├── lib/
│       │   ├── firebase.ts         # Firebase setup
│       │   └── agora.ts            # Agora setup
│       ├── services/
│       │   ├── authService.ts      # Authentication
│       │   ├── discussionService.ts # Discussions
│       │   ├── agoraService.ts     # Audio
│       │   ├── queueService.ts     # Speaking queue
│       │   └── reactionService.ts  # Reactions
│       ├── hooks/                  # React hooks
│       ├── contexts/               # React contexts
│       └── app/                    # Components
│
└── 🚀 Deployment
    ├── deploy.sh                   # Deployment script
    └── package.json                # NPM scripts
```

---

## ⚡ NPM Scripts

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production

# Deployment
npm run deploy:all       # Deploy everything
npm run deploy:hosting   # Deploy frontend only
npm run deploy:functions # Deploy functions only
npm run deploy:firestore # Deploy rules & indexes

# Utilities
npm run emulators        # Start Firebase emulators
npm run logs             # View function logs
npm run logs:follow      # Stream logs in real-time
```

---

## 🔑 Key Features

### Anonymous Identity System
Every user gets a unique anonymous ID (e.g., `Δ-8472`, `Σ-9234`) instead of using real names.

### Three Meeting Roles

**🔇 Listener**
- Listen to audio
- React with 👍 or 👎
- Mic always OFF

**🎤 Speaker**
- Raise hand to join queue
- Speak for exactly 3 minutes
- Auto-muted at 0:00
- Returns to Listener

**🎯 Debater**
- Speak anytime
- Manual mic control
- No time limit

### Speaking Queue
- First-in, first-out order
- 3-minute speaking limit
- Auto-mute via Cloud Functions
- Real-time updates

### Real-time Features
- Live topic updates
- Speaking queue changes
- Reaction counts
- Participant counts

---

## 🔐 Security

✅ **Authentication Required**
- Guest mode is read-only
- All interactions require sign-in

✅ **Firestore Security Rules**
- Users can only modify their own data
- No privilege escalation
- Role enforcement

✅ **Agora Tokens**
- Generated server-side only
- Certificate never exposed
- 1-hour expiry

---

## 📊 Cloud Functions

| Function | Trigger | Purpose |
|----------|---------|---------|
| `generateAgoraToken` | HTTP | Generate Agora tokens |
| `startSpeakerTimer` | HTTP | Start 3-minute timer |
| `processSpeakerTimers` | Schedule (1 min) | Auto-mute speakers |
| `cleanupInactiveParticipants` | Schedule (5 min) | Remove stale data |
| `cleanupOldReactions` | Schedule (1 hour) | Delete old reactions |
| `cleanupDoneQueueEntries` | Schedule (1 min) | Clean queue |
| `updateLastActive` | Firestore trigger | Track activity |
| `autoEndLongDiscussions` | Schedule (10 min) | End old meetings |

---

## 🧪 Testing

```bash
# Test locally
npm run dev

# Test with emulators
npm run emulators
# In another terminal:
npm run dev

# View function logs
npm run logs

# Stream logs
npm run logs:follow
```

See [TESTING_GUIDE.md](./TESTING_GUIDE.md) for comprehensive testing procedures.

---

## 🚨 Troubleshooting

### Common Issues

**"Permission denied"**
```bash
firebase deploy --only firestore:rules
```

**"Index not found"**
```bash
firebase deploy --only firestore:indexes
# Wait 2-5 minutes for indexes to build
```

**Audio not working**
- Check browser microphone permissions
- Verify user role (listeners can't speak)
- Check Agora credentials

**Timer not working**
```bash
firebase functions:log --only processSpeakerTimers
```

---

## 📈 Monitoring

### Firebase Console
- [console.firebase.google.com](https://console.firebase.google.com)
- Check Authentication, Firestore, Functions, Hosting

### Agora Console
- [console.agora.io](https://console.agora.io)
- Monitor audio quality and usage

### Logs
```bash
firebase functions:log           # View logs
firebase functions:log --follow  # Stream logs
```

---

## 📝 Environment Variables

Required in `.env`:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

Get these from Firebase Console → Project Settings → Your apps → Web app

---

## ✅ Pre-Deployment Checklist

Before deploying:

- [ ] `.env` configured
- [ ] Firebase project created
- [ ] Authentication enabled (Google, Phone)
- [ ] Firestore database created
- [ ] Blaze plan enabled (for Functions)
- [ ] Dependencies installed
- [ ] `firebase login` completed
- [ ] `firebase use --add` completed

Then:

```bash
npm run deploy:all
```

---

## 📦 What's Included

### Backend ✅
- Complete Firebase integration
- 8 Cloud Functions
- Security rules
- Database indexes
- Agora token generation

### Services ✅
- Authentication (Google, Phone, Guest)
- Discussion management
- Speaking queue with timer
- Agora audio integration
- Reaction system

### Documentation ✅
- Setup guide (14 steps)
- Integration examples
- Testing procedures
- Troubleshooting guide
- API reference

### Tools ✅
- Deployment script
- NPM scripts
- Firebase emulators support

---

## 🎯 Next Steps

1. ✅ **You are here** - Backend complete
2. 📖 Read [QUICK_START.md](./QUICK_START.md)
3. 🔧 Configure Firebase project
4. 📝 Set environment variables
5. 🚀 Deploy backend
6. 🧪 Test thoroughly
7. 📊 Monitor metrics
8. 🎉 Launch to users

---

## 🆘 Need Help?

1. Check [QUICK_START.md](./QUICK_START.md) for step-by-step guide
2. Review [TROUBLESHOOTING section](#-troubleshooting) above
3. Check Firebase Console logs
4. View Cloud Functions logs: `npm run logs`
5. Test with Firebase Emulators: `npm run emulators`

---

## 📄 License

MIT License - See LICENSE file for details

---

## 🙏 Credits

- **Firebase** - Authentication, database, hosting
- **Agora** - Real-time audio
- **React** - Frontend framework
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components

---

## 💡 Core Principle

**Ideas compete, not people.**

DUNELI enables structured discussions where anonymous participants focus on ideas, not identities. The backend ensures fair speaking time, real-time engagement, and secure operations.

---

**Ready to deploy? Start with [QUICK_START.md](./QUICK_START.md)** 🚀

---

**Made with ❤️ for meaningful discussions.**
