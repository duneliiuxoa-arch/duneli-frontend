# 🚀 DUNELI Quick Start Checklist

Use this checklist to get DUNELI up and running quickly.

---

## ☑️ Pre-Setup

- [ ] Node.js 18+ installed (`node --version`)
- [ ] npm or pnpm installed
- [ ] Firebase CLI installed (`npm install -g firebase-tools`)
- [ ] Git installed
- [ ] Firebase account created
- [ ] Code editor (VS Code recommended)

---

## ☑️ Firebase Console Setup

### 1. Create Firebase Project
- [ ] Go to [Firebase Console](https://console.firebase.google.com)
- [ ] Click "Add Project"
- [ ] Name: "DUNELI" (or your choice)
- [ ] Enable Google Analytics (recommended)
- [ ] Click "Create Project"

### 2. Enable Authentication
- [ ] Go to **Authentication** → Get Started
- [ ] Enable **Google** sign-in
- [ ] Enable **Phone** sign-in
- [ ] Configure OAuth consent screen (if required)

### 3. Create Firestore Database
- [ ] Go to **Firestore Database**
- [ ] Click "Create Database"
- [ ] Select **Production Mode**
- [ ] Choose a location (closest to your users)
- [ ] Click "Enable"

### 4. Enable Cloud Functions
- [ ] Go to **Functions**
- [ ] Upgrade to **Blaze Plan** (pay-as-you-go, required for Functions)
- [ ] Note: Free tier includes 125K function invocations/month

### 5. Get Firebase Config
- [ ] Go to **Project Settings** (gear icon)
- [ ] Scroll to "Your apps"
- [ ] Click Web icon (`</>`)
- [ ] Register app: "DUNELI Web"
- [ ] Copy the config object (you'll need this later)

---

## ☑️ Local Setup

### 1. Clone and Install
```bash
# Clone repository
cd path/to/duneli-homepage

# Install dependencies
npm install

# Install Cloud Functions dependencies
cd functions
npm install
cd ..
```

### 2. Configure Environment
```bash
# Copy example file
cp .env.example .env

# Edit .env with your Firebase config
# (paste values from Firebase Console)
```

Your `.env` should look like:
```
VITE_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXX
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:xxxxx
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXX
```

### 3. Firebase CLI Setup
```bash
# Login to Firebase
firebase login

# Link to your project
firebase use --add
# Select your project
# Alias: default
```

---

## ☑️ Deploy Backend

### 1. Deploy Firestore Rules
```bash
firebase deploy --only firestore:rules
```
- [ ] Command completed successfully
- [ ] Check Firebase Console → Firestore → Rules

### 2. Deploy Firestore Indexes
```bash
firebase deploy --only firestore:indexes
```
- [ ] Command completed successfully
- [ ] Wait 2-5 minutes for indexes to build
- [ ] Check Firebase Console → Firestore → Indexes
- [ ] All indexes show "Enabled" (not "Building")

### 3. Build Cloud Functions
```bash
cd functions
npm run build
cd ..
```
- [ ] Build completed without errors

### 4. Deploy Cloud Functions
```bash
firebase deploy --only functions
```
- [ ] All 8 functions deployed successfully:
  - [ ] generateAgoraToken
  - [ ] startSpeakerTimer
  - [ ] processSpeakerTimers
  - [ ] cleanupInactiveParticipants
  - [ ] cleanupOldReactions
  - [ ] cleanupDoneQueueEntries
  - [ ] updateLastActive
  - [ ] autoEndLongDiscussions

- [ ] Check Firebase Console → Functions → Dashboard
- [ ] All functions show "Deployed"

---

## ☑️ Test Locally

### 1. Start Development Server
```bash
npm run dev
```
- [ ] Server starts at `http://localhost:5173`
- [ ] No errors in console

### 2. Test Authentication
- [ ] Open browser to `http://localhost:5173`
- [ ] Click login
- [ ] Test Google sign-in works
- [ ] Test Phone OTP works (optional)
- [ ] Test Guest mode (browse only)
- [ ] Check Firebase Console → Authentication → Users
- [ ] New user appears with anonymous ID

### 3. Test Discussion Flow
- [ ] Create a new topic
- [ ] Check Firestore → topics collection
- [ ] New topic appears
- [ ] Start a discussion
- [ ] Check discussions collection
- [ ] Join as Listener
- [ ] Check participants collection
- [ ] React with 👍 or 👎
- [ ] Check reactions collection

### 4. Test Speaking Queue (requires 2 users)
- [ ] Open app in 2 different browsers/devices
- [ ] User 1: Join as Speaker
- [ ] User 1: Raise hand
- [ ] Check speakingQueue collection
- [ ] Queue entry appears with "waiting" status
- [ ] User 1 starts speaking
- [ ] Status changes to "speaking"
- [ ] Wait 3 minutes
- [ ] Status changes to "done"
- [ ] Entry is deleted

### 5. Test Audio
- [ ] Join as Speaker or Debater
- [ ] Grant microphone permissions
- [ ] Unmute microphone
- [ ] Speak and verify audio works
- [ ] Check Agora Console (optional)
- [ ] Verify channel activity

---

## ☑️ Deploy to Production

### 1. Build Frontend
```bash
npm run build
```
- [ ] Build completes successfully
- [ ] `dist/` folder created

### 2. Deploy to Firebase Hosting
```bash
firebase deploy --only hosting
```
- [ ] Hosting deployed successfully
- [ ] Note the Hosting URL (e.g., `https://your-project.web.app`)

### 3. Test Production Site
- [ ] Open Hosting URL in browser
- [ ] Site loads correctly
- [ ] Test authentication works
- [ ] Test creating discussion works
- [ ] Test joining meeting works
- [ ] Test audio works

---

## ☑️ Verify Everything

### Firebase Console Checks
- [ ] **Authentication** → Users appearing
- [ ] **Firestore** → Collections populated
- [ ] **Functions** → All functions deployed
- [ ] **Functions** → Logs show no errors
- [ ] **Hosting** → Site deployed
- [ ] **Analytics** → Events appearing (may take 24h)

### Functionality Checks
- [ ] User can sign in with Google
- [ ] User can sign in with Phone OTP
- [ ] User gets anonymous ID
- [ ] Guest can browse (read-only)
- [ ] Can create topics
- [ ] Can view live topics
- [ ] Can start discussions
- [ ] Can join as Listener
- [ ] Can join as Speaker (queue works)
- [ ] Can join as Debater
- [ ] Speaker timer works (3 minutes)
- [ ] Auto-mute works at 0:00
- [ ] Reactions work (👍/👎)
- [ ] Audio works (Agora)
- [ ] Can leave meeting
- [ ] Cleanup functions run (check logs after 5-10 minutes)

---

## ☑️ Monitoring Setup

### 1. Firebase Console
- [ ] Bookmark Firebase Console for your project
- [ ] Check **Functions** → Logs daily
- [ ] Monitor **Usage** → Resource usage
- [ ] Set up budget alerts (optional)

### 2. Agora Console
- [ ] Sign in to [Agora Console](https://console.agora.io)
- [ ] Check project usage
- [ ] Monitor concurrent users
- [ ] Check audio quality metrics

### 3. Error Monitoring (Optional)
- [ ] Set up Sentry or similar (optional)
- [ ] Configure error alerts

---

## ☑️ Post-Launch

### Documentation
- [ ] Team knows how to access Firebase Console
- [ ] Team knows how to view logs
- [ ] Team knows how to deploy updates

### Maintenance Schedule
- [ ] Weekly: Check function logs
- [ ] Weekly: Monitor Firebase usage
- [ ] Weekly: Check Agora usage
- [ ] Monthly: Review security rules
- [ ] Monthly: Update dependencies

### Scaling Preparation
- [ ] Monitor user growth
- [ ] Plan for Agora plan upgrade if needed
- [ ] Plan for Firebase plan adjustments
- [ ] Consider CDN for static assets

---

## 🆘 Troubleshooting

If something doesn't work:

1. **Check Firebase Console logs**
   ```bash
   firebase functions:log
   ```

2. **Check browser console** (F12)
   - Look for error messages
   - Check Network tab for failed requests

3. **Common Issues:**
   - **"Permission denied"**: Deploy security rules again
   - **"Function not found"**: Deploy functions again
   - **"No index"**: Wait for indexes to build (or deploy again)
   - **Audio not working**: Check browser permissions
   - **Timer not working**: Check Cloud Functions logs

4. **Re-deploy everything:**
   ```bash
   firebase deploy
   ```

---

## ✅ You're Done!

Once all items are checked:

- ✨ DUNELI is fully operational
- 🎙️ Users can join audio discussions
- 🔐 Authentication is working
- ☁️ Backend is deployed
- 📊 Analytics is tracking
- 🚀 Ready for users!

---

**Need help?** Check:
- [README.md](./README.md) - Project overview
- [SETUP_GUIDE.md](./SETUP_GUIDE.md) - Detailed instructions
- [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md) - Code examples
- Firebase Console logs
- GitHub Issues

**Happy discussing! 🎉**
