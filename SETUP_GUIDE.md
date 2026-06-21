# DUNELI - Firebase + Agora Implementation Guide

## 🎯 Overview

This guide covers the complete setup and deployment of DUNELI's backend integration with Firebase and Agora.

## 📋 Prerequisites

- Node.js 18+ installed
- Firebase CLI installed: `npm install -g firebase-tools`
- A Firebase project created at [Firebase Console](https://console.firebase.google.com)
- Git installed

---

## 🚀 Step 1: Firebase Project Setup

### 1.1 Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Add Project"
3. Name it "DUNELI" (or your preferred name)
4. Enable Google Analytics (recommended)
5. Click "Create Project"

### 1.2 Enable Authentication

1. In Firebase Console, go to **Authentication**
2. Click "Get Started"
3. Enable **Google** sign-in method
4. Enable **Phone** sign-in method
5. For Phone auth, you may need to configure reCAPTCHA

### 1.3 Create Firestore Database

1. Go to **Firestore Database**
2. Click "Create Database"
3. Start in **Production Mode**
4. Choose a location close to your users
5. Click "Enable"

### 1.4 Get Firebase Configuration

1. Go to **Project Settings** (gear icon)
2. Scroll to "Your apps"
3. Click the Web icon (`</>`)
4. Register your app with name "DUNELI Web"
5. Copy the configuration object

---

## 🔧 Step 2: Local Environment Setup

### 2.1 Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install Cloud Functions dependencies
cd functions
npm install
cd ..
```

### 2.2 Configure Environment Variables

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Edit `.env` and add your Firebase configuration:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

### 2.3 Firebase CLI Login

```bash
firebase login
```

### 2.4 Initialize Firebase Project

```bash
# Link to your Firebase project
firebase use --add

# Select your project
# Enter alias: default
```

---

## 🔐 Step 3: Deploy Security Rules

### 3.1 Deploy Firestore Rules

```bash
firebase deploy --only firestore:rules
```

### 3.2 Deploy Firestore Indexes

```bash
firebase deploy --only firestore:indexes
```

Wait for indexes to build (check Firebase Console > Firestore > Indexes)

---

## ☁️ Step 4: Deploy Cloud Functions

### 4.1 Build Functions

```bash
cd functions
npm run build
cd ..
```

### 4.2 Deploy Functions

```bash
firebase deploy --only functions
```

This will deploy:
- `generateAgoraToken` - Token generation for Agora
- `onSpeakerTimeout` - Auto-mute after 3 minutes
- `cleanupInactiveParticipants` - Cleanup job
- `cleanupOldReactions` - Cleanup job
- `updateLastActive` - Activity tracker

---

## 🧪 Step 5: Test Locally

### 5.1 Start Firebase Emulators (Optional)

```bash
firebase emulators:start
```

### 5.2 Run Development Server

```bash
npm run dev
```

Visit `http://localhost:5173`

---

## 🌐 Step 6: Production Deployment

### 6.1 Build Frontend

```bash
npm run build
```

### 6.2 Deploy to Firebase Hosting

```bash
firebase deploy --only hosting
```

### 6.3 Deploy Everything

To deploy all at once:
```bash
firebase deploy
```

---

## 🎙️ Step 7: Verify Agora Integration

### 7.1 Agora Credentials

The Agora credentials are already configured in the code:
- **App ID**: `649581f9f2664ca5b6e54ed70bc371b5`
- **App Certificate**: `5a2286112a1f4901ad710c5fbecab0ec`

These are set in:
- Frontend: `src/lib/agora.ts`
- Backend: `functions/src/index.ts`

### 7.2 Test Audio Meeting

1. Create a test account
2. Join a discussion
3. Select "Speaker" or "Debater" role
4. Verify microphone permissions
5. Test audio with another account

---

## 📊 Step 8: Monitor & Analytics

### 8.1 Firebase Console

Monitor in Firebase Console:
- **Authentication**: User sign-ups
- **Firestore**: Database usage
- **Functions**: Function invocations and logs
- **Analytics**: User events

### 8.2 Function Logs

View logs:
```bash
firebase functions:log
```

### 8.3 Agora Console

Monitor Agora usage at [Agora Console](https://console.agora.io):
- Real-time monitoring
- Usage statistics
- Quality metrics

---

## 🔒 Step 9: Security Checklist

- [ ] Environment variables are NOT committed to Git
- [ ] Firestore security rules are deployed
- [ ] Authentication is required for interactions
- [ ] Agora tokens are generated server-side only
- [ ] Rate limiting is in place for reactions
- [ ] Guest mode restricts interactions

---

## 🐛 Step 10: Troubleshooting

### Common Issues

**Issue: "Permission denied" in Firestore**
- Check that security rules are deployed
- Verify user is authenticated
- Check rule conditions

**Issue: Agora token generation fails**
- Verify Cloud Function is deployed
- Check Function logs for errors
- Ensure user is authenticated

**Issue: Audio not working**
- Check browser permissions for microphone
- Verify Agora credentials
- Check role (listeners can't speak)

**Issue: Speaker timer not working**
- Check Cloud Function `onSpeakerTimeout` is deployed
- Verify Firestore triggers are enabled
- Check Function logs

### Debug Commands

```bash
# View all deployed resources
firebase deploy --only hosting,functions,firestore

# Check Function logs
firebase functions:log --only generateAgoraToken

# Test Functions locally
cd functions
npm run serve
```

---

## 📱 Step 11: Mobile Testing

The app should work on mobile browsers with:
- Responsive design (already implemented)
- Mobile audio permissions
- Touch-friendly controls

Test on:
- iOS Safari
- Android Chrome
- Mobile Firefox

---

## 🔄 Step 12: CI/CD Setup (Optional)

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Firebase

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
        env:
          VITE_FIREBASE_API_KEY: ${{ secrets.FIREBASE_API_KEY }}
          # Add other env vars
      
      - name: Deploy to Firebase
        uses: w9jds/firebase-action@master
        with:
          args: deploy
        env:
          FIREBASE_TOKEN: ${{ secrets.FIREBASE_TOKEN }}
```

---

## 📈 Step 13: Scaling Considerations

### Database
- Firestore scales automatically
- Monitor read/write usage
- Optimize queries with indexes

### Functions
- Functions scale automatically
- Monitor execution time
- Consider upgrading to Blaze plan for production

### Agora
- Audio channels scale automatically
- Monitor concurrent users
- Upgrade Agora plan as needed

---

## 🎓 Step 14: Key Files Reference

### Frontend
- `src/lib/firebase.ts` - Firebase initialization
- `src/lib/agora.ts` - Agora SDK setup
- `src/services/` - All service layer code
- `src/hooks/` - React hooks for Firebase/Agora
- `src/contexts/AuthContext.tsx` - Auth provider

### Backend
- `functions/src/index.ts` - Cloud Functions
- `firestore.rules` - Security rules
- `firestore.indexes.json` - Database indexes

### Configuration
- `firebase.json` - Firebase config
- `.env` - Environment variables (local)
- `package.json` - Dependencies

---

## ✅ Final Checklist

Before going live:

- [ ] All dependencies installed
- [ ] Environment variables configured
- [ ] Firebase project created and configured
- [ ] Authentication methods enabled
- [ ] Firestore database created
- [ ] Security rules deployed
- [ ] Indexes deployed and built
- [ ] Cloud Functions deployed
- [ ] Frontend built and deployed
- [ ] Agora integration tested
- [ ] Analytics configured
- [ ] Error monitoring set up
- [ ] Backup strategy in place

---

## 🆘 Support

For issues:
1. Check Firebase Console logs
2. Check Cloud Functions logs
3. Review Firestore security rules
4. Test with Firebase Emulator
5. Review Agora Console for audio issues

## 📚 Documentation Links

- [Firebase Docs](https://firebase.google.com/docs)
- [Agora Web SDK Docs](https://docs.agora.io/en/voice-calling/overview/product-overview)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Cloud Functions](https://firebase.google.com/docs/functions)

---

## 🎉 You're Ready!

Your DUNELI app is now fully integrated with Firebase and Agora. Happy discussing! 🎙️
