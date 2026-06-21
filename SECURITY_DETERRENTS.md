# 🔒 Client-Side Security Deterrents Guide

## ⚠️ IMPORTANT DISCLAIMER

**These are DETERRENTS only, NOT actual security!**

Real security is enforced by:
- ✅ Firebase Security Rules (server-side)
- ✅ Cloud Functions (server-side)
- ✅ Agora token validation (server-side)

**Client-side code can ALWAYS be bypassed.** These measures only discourage casual inspection.

---

## 📋 What's Implemented

### 1. Right-Click Context Menu Disabled
- Prevents casual users from using "Inspect Element"
- **Accessibility preserved**: Works on input fields for copy/paste
- **Production only**: Disabled in development

### 2. DevTools Keyboard Shortcuts Blocked
Blocks these shortcuts:
- `F12`
- `Ctrl + Shift + I` (Windows/Linux)
- `Ctrl + Shift + J` (Windows/Linux)
- `Ctrl + Shift + C` (Windows/Linux)
- `Cmd + Option + I` (Mac)
- `Cmd + Option + J` (Mac)
- `Cmd + Option + C` (Mac)

### 3. DevTools Detection
Detects when DevTools is open using:
- Debugger timing checks
- Window size differences
- Console override detection

When detected:
- **Option 1**: Show warning message (default)
- **Option 2**: Auto-logout user
- **Option 3**: Custom handler

---

## 🚀 Usage

### Basic Setup (Already Done)

The deterrents are initialized in `src/app/App.tsx`:

```typescript
import { initializeSecurityDeterrents } from '../services/securityDeterrents';

useEffect(() => {
  const cleanup = initializeSecurityDeterrents({
    onDevToolsDetected: 'warn', // Show warning
  });

  return cleanup; // Cleanup on unmount
}, []);
```

### Configuration Options

#### Option 1: Show Warning (Default)
```typescript
initializeSecurityDeterrents({
  onDevToolsDetected: 'warn',
});
```

Shows a full-screen warning:
```
Developer Tools Disabled
Developer tools are disabled for this application.
Please close the developer tools to continue.
```

#### Option 2: Auto-Logout
```typescript
initializeSecurityDeterrents({
  onDevToolsDetected: 'logout',
});
```

Automatically logs out the user when DevTools is detected.

#### Option 3: Custom Handler
```typescript
initializeSecurityDeterrents({
  onDevToolsDetected: 'custom',
  customHandler: () => {
    // Your custom logic
    console.log('DevTools detected!');
    // Redirect, show message, etc.
  },
});
```

#### Option 4: Disable DevTools Detection
```typescript
initializeSecurityDeterrents(); // No DevTools detection
```

Only blocks shortcuts and context menu.

---

## 🛠️ Advanced Usage

### Disable Only Specific Features

```typescript
// Import individual functions
import {
  disableContextMenu,
  blockDevToolsShortcuts,
  detectDevTools,
} from '../services/securityDeterrents';

// Use individually
useEffect(() => {
  // Only disable context menu
  const cleanup1 = disableContextMenu();
  
  // Only block shortcuts
  const cleanup2 = blockDevToolsShortcuts();
  
  return () => {
    cleanup1();
    cleanup2();
  };
}, []);
```

### Custom DevTools Warning

```typescript
import { detectDevTools } from '../services/securityDeterrents';

useEffect(() => {
  const cleanup = detectDevTools(() => {
    // Custom warning
    alert('Please close developer tools');
    // Or show your own modal
  });

  return cleanup;
}, []);
```

### Disable Console (Optional)

```typescript
import { disableConsole } from '../services/securityDeterrents';

// Call once (usually in main.tsx or App.tsx)
disableConsole(); // console.log, console.warn, etc. become no-ops
```

### Clear Console Periodically (Optional)

```typescript
import { clearConsolePeriodically } from '../services/securityDeterrents';

useEffect(() => {
  const cleanup = clearConsolePeriodically(); // Clears every 3 seconds
  return cleanup;
}, []);
```

---

## 🧪 Testing

### Test in Development
Deterrents are **automatically disabled** in development mode.

To test them:

1. Build for production:
```bash
npm run build
```

2. Preview production build:
```bash
npm run preview
```

3. Test the following:
   - Right-click → Should be blocked (except on inputs)
   - Press F12 → Should be blocked
   - Press Ctrl+Shift+I → Should be blocked
   - Open DevTools via browser menu → Should show warning (if enabled)

### Verify Development Mode
```bash
# Run dev server
npm run dev

# All deterrents should be disabled
# Right-click, F12, etc. should work normally
```

---

## 📊 How It Works

### Development vs Production

```typescript
// Check environment
if (import.meta.env.DEV) {
  // Development mode - skip deterrents
  return () => {};
}

// Production mode - enable deterrents
```

Vite automatically sets `import.meta.env.DEV` based on the mode:
- `npm run dev` → `DEV = true`
- `npm run build` → `DEV = false`

### Detection Methods

#### Method 1: Debugger Timing
```typescript
const start = Date.now();
debugger; // Takes longer when DevTools is open
const end = Date.now();

if (end - start > 100) {
  // DevTools is open
}
```

#### Method 2: Window Size
```typescript
const widthDiff = window.outerWidth - window.innerWidth;
const heightDiff = window.outerHeight - window.innerHeight;

if (widthDiff > 160 || heightDiff > 160) {
  // DevTools is likely docked
}
```

#### Method 3: Console Override
```typescript
const element = new Image();
Object.defineProperty(element, 'id', {
  get: function() {
    // This runs when console tries to display the element
    // Means DevTools console is open
  }
});
console.log(element);
```

---

## ⚙️ Configuration Reference

### `initializeSecurityDeterrents(options?)`

**Parameters:**
```typescript
interface Options {
  onDevToolsDetected?: 'warn' | 'logout' | 'custom';
  customHandler?: () => void;
}
```

**Returns:**
```typescript
() => void // Cleanup function
```

**Example:**
```typescript
const cleanup = initializeSecurityDeterrents({
  onDevToolsDetected: 'warn',
});

// Later, cleanup
cleanup();
```

---

## 🚨 Limitations

### What These DO NOT Protect Against

❌ **Determined developers** - Can disable JavaScript entirely
❌ **Browser extensions** - Can bypass all client-side restrictions
❌ **Modified browsers** - Can remove protections
❌ **Network inspection** - Can still inspect network traffic
❌ **Source code access** - Code is always visible in production

### What These DO Discourage

✅ Casual users from inspecting
✅ Accidental DevTools opening
✅ Quick copy-paste of code
✅ Surface-level exploration

---

## 🔐 Real Security Checklist

Client-side deterrents are NOT security. Real security requires:

### ✅ Server-Side (Implemented)
- [x] Firebase Security Rules enforce guest read-only
- [x] Cloud Functions validate all operations
- [x] Agora tokens generated server-side only
- [x] User authentication required for writes
- [x] Input validation in Cloud Functions

### ⚠️ Never Rely On
- [ ] ❌ Client-side validation only
- [ ] ❌ Hidden UI elements
- [ ] ❌ Obfuscated JavaScript
- [ ] ❌ Disabled DevTools
- [ ] ❌ Console overrides

---

## 📝 Best Practices

### Do's ✅
- ✅ Use these as part of defense-in-depth
- ✅ Always enforce security server-side
- ✅ Test in production build
- ✅ Keep development mode functional
- ✅ Document why they're used

### Don'ts ❌
- ❌ Don't rely on these for security
- ❌ Don't store secrets in frontend
- ❌ Don't assume users can't bypass
- ❌ Don't block accessibility features
- ❌ Don't interfere with app functionality

---

## 🔧 Troubleshooting

### Deterrents Not Working in Production

**Check 1: Build mode**
```bash
# Make sure you're testing production build
npm run build
npm run preview
# NOT npm run dev
```

**Check 2: Environment variable**
```typescript
console.log('DEV mode:', import.meta.env.DEV); // Should be false
```

### Deterrents Working in Development

This means the environment check is failing:

```typescript
// Add debug logging
if (import.meta.env.DEV) {
  console.log('Deterrents disabled - DEV mode');
  return () => {};
}
```

### Right-Click Still Works on Some Elements

This is intentional for accessibility:

```typescript
// These elements allow right-click
- <input>
- <textarea>
- [contenteditable]
```

### DevTools Detection Doesn't Work

Detection methods can be unreliable. Try:
1. Using 'warn' mode and opening DevTools manually
2. Testing in different browsers
3. Using custom handler with logging

---

## 📚 File Structure

```
src/
├── services/
│   └── securityDeterrents.ts    # All deterrent functions
├── app/
│   └── App.tsx                  # Initialization
└── main.tsx                     # Optional: disableConsole()
```

---

## 🎯 Summary

**Purpose**: Discourage casual inspection
**Reality**: Can always be bypassed
**Security**: Server-side only (Firebase Rules + Cloud Functions)

These deterrents add a layer of obscurity but should NEVER be treated as security measures.

---

## 📞 Questions?

- Check server-side security: `firestore.rules`
- Check Cloud Functions: `functions/src/index.ts`
- Test deterrents: `npm run build && npm run preview`

**Remember: Real security is in Firebase, not the browser! 🔐**
