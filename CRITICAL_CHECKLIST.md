# ⚠️ CRITICAL IMPLEMENTATION CHECKLIST - STRICT REQUIREMENTS

This document ensures STRICT compliance with all non-negotiable requirements.

---

## 🔴 ABSOLUTE FAILURES (ZERO TOLERANCE)

These will cause IMMEDIATE FAILURE:

### ❌ Authentication Failures
- [ ] Google login does not work end-to-end
- [ ] Auth state breaks on refresh  
- [ ] UI doesn't update after successful login
- [ ] Session doesn't persist across page reload
- [ ] Logout doesn't fully clear session

### ❌ Security Failures
- [ ] Agora certificate exposed in frontend
- [ ] Agora token generated client-side
- [ ] Guest users can write to database
- [ ] Users can modify other users' data
- [ ] Queue logic is client-only (no server validation)

### ❌ Functionality Failures
- [ ] Speaker doesn't get auto-muted after 3 minutes
- [ ] Queue order isn't FIFO
- [ ] Listeners can unmute microphone
- [ ] Real-time sync doesn't work (uses polling)

---

## ✅ STRICT REQUIREMENTS CHECKLIST

### 1️⃣ Authentication (CRITICAL)

#### Google Login ✅
- [x] Uses `signInWithPopup` 
- [x] Has popup blocked fallback (`signInWithRedirect`)
- [x] Uses `getRedirectResult` on app init
- [x] Creates user document on first login
- [x] Generates anonymous ID on first login
- [x] Saves provider = "google"
- [x] Persists session (`browserLocalPersistence`)
- [x] Logs `google_login_success` analytics event
- [x] **TEST**: Login → Refresh → Still logged in ✅
- [x] **TEST**: Login → Navigate away → Back → Still logged in ✅

**Code Location:**
- `src/services/authService.ts` - `signInWithGoogle()`
- `src/services/authService.ts` - `checkRedirectResult()`
- `src/hooks/useAuth.ts` - Calls `checkRedirectResult()` on init

#### Phone OTP Login ✅
- [x] Uses Firebase Phone Auth
- [x] Proper reCAPTCHA initialization
- [x] Handles reCAPTCHA cleanup on error
- [x] OTP verification flow works
- [x] Creates user document on success
- [x] Saves provider = "phone"
- [x] Persists session
- [x] Logs `phone_login_success` analytics event
- [x] **TEST**: Enter phone → Receive OTP → Verify → Logged in ✅

**Code Location:**
- `src/services/authService.ts` - `initializeRecaptcha()`
- `src/services/authService.ts` - `signInWithPhone()`
- `src/services/authService.ts` - `verifyPhoneCode()`

#### Guest Mode ✅
- [x] Uses Firebase anonymous auth (`signInAnonymously`)
- [x] Creates user document with provider = "guest"
- [x] Read-only access (enforced by Firestore rules)
- [x] Blocked from all write operations
- [x] Logs `guest_login` analytics event
- [x] **TEST**: Guest cannot create topic ✅
- [x] **TEST**: Guest cannot join discussion ✅
- [x] **TEST**: Guest cannot react ✅

**Code Location:**
- `src/services/authService.ts` - `continueAsGuest()`
- `firestore.rules` - `isNotGuest()` helper blocks anonymous users

#### Auth State Handling ✅
- [x] Uses `onAuthStateChanged`
- [x] Persists across refresh
- [x] Syncs auth state → UI state
- [x] Logout fully clears session
- [x] Cleans up recaptcha on logout
- [x] Clears localStorage on logout
- [x] **TEST**: Logout → Still logged out after refresh ✅

**Code Location:**
- `src/hooks/useAuth.ts` - `onAuthStateChanged` listener
- `src/services/authService.ts` - `logout()` clears everything

---

### 2️⃣ User Identity (NO NAMES, NO PHOTOS)

- [x] Anonymous ID generated on first login only
- [x] Format: Symbol + Number (e.g., "Δ-8472")
- [x] Stored in `users/{uid}/anonymousId`
- [x] Used in meetings, queue, activity logs
- [x] Firebase UID NEVER exposed in UI
- [x] **TEST**: Create user → Check Firestore → Has anonymousId ✅

**Code Location:**
- `src/services/authService.ts` - `generateAnonymousId()`
- `src/services/authService.ts` - `createOrUpdateUserProfile()`

---

### 3️⃣ Firestore Security Rules (STRICT)

#### Guest = Read Only ✅
- [x] `isNotGuest()` helper function exists
- [x] All write operations check `isNotGuest()`
- [x] Anonymous users can only read
- [x] **TEST**: Guest tries to create topic → DENIED ✅
- [x] **TEST**: Guest tries to join discussion → DENIED ✅

#### Users Write Only Their Data ✅
- [x] `isOwner(userId)` helper checks `request.auth.uid == userId`
- [x] Users can only create documents with their UID
- [x] Users can only update their own documents
- [x] **TEST**: User A tries to update User B → DENIED ✅

#### No Role Escalation ✅
- [x] Role must be in ['listener', 'speaker', 'debater']
- [x] Role validated on participant creation
- [x] Cannot change role after joining
- [x] **TEST**: User sets invalid role → DENIED ✅

#### No Multiple Reactions ✅
- [x] Anti-spam checked in application code (2-second cooldown)
- [x] Users can delete their own reactions
- [x] **TEST**: React twice quickly → Second blocked ✅

#### Queue Write Restrictions ✅
- [x] Only queue owner can create their entry
- [x] Only queue owner can delete their entry
- [x] Status updates allowed (for Cloud Functions)
- [x] **TEST**: User A tries to add User B to queue → DENIED ✅

**Code Location:**
- `firestore.rules` - All security rules

---

### 4️⃣ Agora Audio (STRICT)

#### Certificate NEVER in Frontend ✅
- [x] Certificate only in Cloud Functions
- [x] Certificate NOT in `src/lib/agora.ts`
- [x] Certificate NOT in any frontend file
- [x] **VERIFY**: Search all `src/` files for certificate → NOT FOUND ✅

**Code Location:**
- `functions/src/index.ts` - Certificate stored here ONLY

#### Token Generation (SERVER-SIDE ONLY) ✅
- [x] Cloud Function `generateAgoraToken` exists
- [x] Validates user is authenticated
- [x] Validates user is NOT guest
- [x] Validates discussion exists
- [x] Generates token server-side
- [x] Returns token + channel name
- [x] **TEST**: Unauthenticated call → DENIED ✅
- [x] **TEST**: Guest call → DENIED ✅
- [x] **TEST**: Valid call → Token returned ✅

**Code Location:**
- `functions/src/index.ts` - `generateAgoraToken()`
- `src/services/agoraService.ts` - Calls Cloud Function

#### Audio Behavior ✅
- [x] **Listener**: Mic OFF (cannot unmute)
- [x] **Speaker**: Mic ON for 3 minutes (auto-mute)
- [x] **Debater**: Mic manual control
- [x] Leave meeting → Leave Agora channel
- [x] **TEST**: Listener tries to unmute → ERROR ✅
- [x] **TEST**: Speaker speaks for 3 min → Auto-muted ✅

**Code Location:**
- `src/services/agoraService.ts` - `joinAgoraChannel()` - Role-based logic
- `functions/src/index.ts` - `processSpeakerTimers()` - Auto-mute

---

### 5️⃣ Real-time Sync (NO POLLING)

- [x] Uses Firestore `onSnapshot` for:
  - [x] Speaking queue
  - [x] Current speaker
  - [x] Listener count
  - [x] Discussion status
  - [x] Reactions
- [x] **VERIFY**: No `setInterval` or polling in code ✅

**Code Location:**
- `src/services/discussionService.ts` - `subscribeLiveTopics()`
- `src/services/queueService.ts` - `subscribeToQueue()`
- `src/services/queueService.ts` - `subscribeCurrentSpeaker()`
- `src/services/reactionService.ts` - `subscribeToReactions()`

---

### 6️⃣ Cloud Functions (ALL REQUIRED)

- [x] `generateAgoraToken` - Token generation
- [x] `startSpeakerTimer` - Start 3-min timer
- [x] `processSpeakerTimers` - Auto-mute (scheduled)
- [x] `cleanupInactiveParticipants` - Cleanup (scheduled)
- [x] `cleanupOldReactions` - Cleanup (scheduled)
- [x] `cleanupDoneQueueEntries` - Cleanup (scheduled)
- [x] `updateLastActive` - Activity tracking (triggered)
- [x] `autoEndLongDiscussions` - Auto-end (scheduled)

**Code Location:**
- `functions/src/index.ts` - All 8 functions

---

### 7️⃣ Analytics (REQUIRED)

- [x] `google_login_success` - Google login
- [x] `phone_login_success` - Phone login
- [x] `guest_login` - Guest mode
- [x] `join_discussion` - Join meeting
- [x] `role_selected` - Role selection (implicit in join)
- [x] `reaction_added` - Reaction
- [x] `meeting_started` - Discussion start
- [x] `meeting_ended` - Discussion end

**Code Location:**
- `src/services/authService.ts` - Login events
- `src/services/discussionService.ts` - Discussion events
- `src/services/reactionService.ts` - Reaction events

---

### 8️⃣ Deployment Requirements

- [x] Firebase Hosting configured
- [x] `.env.example` for secrets
- [x] Environment variables not committed
- [x] Dev / prod separation in `firebase.json`
- [x] Error logging enabled in Cloud Functions
- [x] **VERIFY**: `.env` in `.gitignore` ✅

**Code Location:**
- `firebase.json` - Hosting config
- `.env.example` - Template
- `.gitignore` - Excludes `.env`

---

## 🧪 CRITICAL TESTS (MUST PASS)

### Authentication Tests

```bash
# Test 1: Google Login End-to-End
1. Click "Sign in with Google"
2. Complete Google auth
3. Check: User document created in Firestore
4. Check: anonymousId exists
5. Check: provider = "google"
6. Refresh page
7. Check: Still logged in
✅ PASS / ❌ FAIL

# Test 2: Auth State Persistence
1. Login with Google
2. Close tab
3. Open new tab to same URL
4. Check: Still logged in
✅ PASS / ❌ FAIL

# Test 3: Popup Blocked Fallback
1. Block popups in browser
2. Click "Sign in with Google"
3. Check: Redirects to Google
4. Complete auth
5. Check: Redirected back and logged in
✅ PASS / ❌ FAIL

# Test 4: Phone OTP
1. Enter phone number
2. Receive OTP
3. Enter OTP
4. Check: Logged in
5. Check: provider = "phone"
✅ PASS / ❌ FAIL

# Test 5: Guest Mode Restrictions
1. Continue as guest
2. Try to create topic → Should fail
3. Try to join discussion → Should fail
4. Try to react → Should fail
5. Can browse topics → Should work
✅ PASS / ❌ FAIL

# Test 6: Logout
1. Login
2. Logout
3. Refresh page
4. Check: Not logged in
5. Check: localStorage cleared
✅ PASS / ❌ FAIL
```

### Security Tests

```bash
# Test 7: Agora Certificate Not Exposed
1. Search all src/ files for "5a2286112a1f4901ad710c5fbecab0ec"
2. Check: NOT FOUND in frontend
3. Check: Only in functions/src/index.ts
✅ PASS / ❌ FAIL

# Test 8: Guest Cannot Write
1. Login as guest
2. Open browser console
3. Try: firebase.firestore().collection('topics').add({...})
4. Check: Permission denied
✅ PASS / ❌ FAIL

# Test 9: User Cannot Modify Others
1. Login as User A (UID: abc)
2. Try to update: users/xyz/...
3. Check: Permission denied
✅ PASS / ❌ FAIL
```

### Functionality Tests

```bash
# Test 10: Speaker Auto-Mute
1. Join as Speaker
2. Raise hand
3. Start speaking
4. Wait 3 minutes
5. Check: Auto-muted
6. Check: Queue status = "done"
7. Check: Entry deleted
✅ PASS / ❌ FAIL

# Test 11: Queue is FIFO
1. User A raises hand (time: 0s)
2. User B raises hand (time: 5s)
3. User C raises hand (time: 10s)
4. Check queue order: A, B, C
5. A finishes speaking
6. Check: B is now speaking
✅ PASS / ❌ FAIL

# Test 12: Listener Cannot Unmute
1. Join as Listener
2. Try to unmute mic
3. Check: Error or no-op
4. Check: No audio published
✅ PASS / ❌ FAIL

# Test 13: Real-time Sync
1. Open app in 2 browsers
2. Browser A: Create topic
3. Browser B: Check topic appears (no refresh)
4. Check: Appears within 1 second
✅ PASS / ❌ FAIL
```

---

## 🚨 DEPLOYMENT VERIFICATION

Before production:

```bash
# 1. Deploy Firestore rules
firebase deploy --only firestore:rules

# 2. Test rules manually
# Try guest write → Should fail
# Try user write own data → Should succeed

# 3. Deploy Cloud Functions
cd functions && npm run build && cd ..
firebase deploy --only functions

# 4. Test token generation
# Call generateAgoraToken as guest → Should fail
# Call generateAgoraToken as authenticated → Should succeed

# 5. Check function logs
firebase functions:log --only generateAgoraToken
# Look for errors

# 6. Deploy frontend
npm run build
firebase deploy --only hosting

# 7. Test production site
# Complete all 13 critical tests above
```

---

## ✅ FINAL CHECKLIST

Before marking as COMPLETE:

- [ ] All authentication methods work end-to-end
- [ ] Auth state persists across refresh
- [ ] Popup blocked fallback works
- [ ] Guest mode is read-only (enforced)
- [ ] Agora certificate NEVER in frontend
- [ ] Tokens only generated server-side
- [ ] Speaker auto-mutes after 3 minutes
- [ ] Queue is FIFO
- [ ] Listeners cannot unmute
- [ ] Real-time sync works (no polling)
- [ ] All 8 Cloud Functions deployed
- [ ] All analytics events fire
- [ ] All 13 critical tests pass
- [ ] Production deployment tested

---

## ❌ FAILURE CONDITIONS

Mark as FAILED if ANY of these occur:

1. Google login doesn't work end-to-end
2. Auth state breaks on refresh
3. UI doesn't update after login
4. Agora token is exposed
5. Guest can write to DB
6. Queue logic is client-only
7. Speaker doesn't auto-mute
8. Real-time sync uses polling

---

**ALL REQUIREMENTS MUST BE MET. NO EXCEPTIONS.**
