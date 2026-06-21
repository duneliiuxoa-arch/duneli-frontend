// Client-Side Security Deterrents (Production Only)
// IMPORTANT: These are deterrents only, NOT actual security
// Real security is enforced by Firebase Security Rules and Cloud Functions

/**
 * Disable right-click context menu (production only)
 * Prevents casual users from inspecting elements
 */
export const disableContextMenu = (): (() => void) => {
  // Only in production
  if (import.meta.env.DEV) {
    return () => {};
  }

  const handleContextMenu = (e: MouseEvent) => {
    // Allow context menu on input fields for accessibility
    const target = e.target as HTMLElement;
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.isContentEditable
    ) {
      return;
    }

    e.preventDefault();
  };

  document.addEventListener('contextmenu', handleContextMenu);

  // Return cleanup function
  return () => {
    document.removeEventListener('contextmenu', handleContextMenu);
  };
};

/**
 * Block common DevTools keyboard shortcuts (production only)
 */
export const blockDevToolsShortcuts = (): (() => void) => {
  // Only in production
  if (import.meta.env.DEV) {
    return () => {};
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    // F12
    if (e.key === 'F12') {
      e.preventDefault();
      return;
    }

    // Ctrl + Shift + I (Windows/Linux)
    if (e.ctrlKey && e.shiftKey && e.key === 'I') {
      e.preventDefault();
      return;
    }

    // Ctrl + Shift + J (Windows/Linux)
    if (e.ctrlKey && e.shiftKey && e.key === 'J') {
      e.preventDefault();
      return;
    }

    // Ctrl + Shift + C (Windows/Linux)
    if (e.ctrlKey && e.shiftKey && e.key === 'C') {
      e.preventDefault();
      return;
    }

    // Cmd + Option + I (Mac)
    if (e.metaKey && e.altKey && e.key === 'I') {
      e.preventDefault();
      return;
    }

    // Cmd + Option + J (Mac)
    if (e.metaKey && e.altKey && e.key === 'J') {
      e.preventDefault();
      return;
    }

    // Cmd + Option + C (Mac)
    if (e.metaKey && e.altKey && e.key === 'C') {
      e.preventDefault();
      return;
    }
  };

  document.addEventListener('keydown', handleKeyDown);

  // Return cleanup function
  return () => {
    document.removeEventListener('keydown', handleKeyDown);
  };
};

/**
 * Detect if DevTools is open (production only)
 * Uses multiple detection methods for better coverage
 */
export const detectDevTools = (
  onDetected: () => void
): (() => void) => {
  // Only in production
  if (import.meta.env.DEV) {
    return () => {};
  }

  let isDevToolsOpen = false;

  // Method 1: Debugger timing check
  const checkDebugger = () => {
    const start = Date.now();
    // debugger statement takes longer when DevTools is open
    // eslint-disable-next-line no-debugger
    debugger;
    const end = Date.now();

    // If execution took more than 100ms, DevTools is likely open
    if (end - start > 100) {
      if (!isDevToolsOpen) {
        isDevToolsOpen = true;
        onDetected();
      }
    } else {
      isDevToolsOpen = false;
    }
  };

  // Method 2: Window size detection
  const checkWindowSize = () => {
    const threshold = 160;
    const widthThreshold = window.outerWidth - window.innerWidth > threshold;
    const heightThreshold = window.outerHeight - window.innerHeight > threshold;

    if (widthThreshold || heightThreshold) {
      if (!isDevToolsOpen) {
        isDevToolsOpen = true;
        onDetected();
      }
    }
  };

  // Method 3: Console.log override detection
  const checkConsole = () => {
    const element = new Image();
    Object.defineProperty(element, 'id', {
      get: function () {
        if (!isDevToolsOpen) {
          isDevToolsOpen = true;
          onDetected();
        }
      },
    });

    // This will trigger the getter if console is open
    console.log(element);
  };

  // Run checks every 1 second
  const interval = setInterval(() => {
    try {
      checkDebugger();
      checkWindowSize();
    } catch (e) {
      // Ignore errors
    }
  }, 1000);

  // Return cleanup function
  return () => {
    clearInterval(interval);
  };
};

/**
 * Show warning message when DevTools is detected
 */
export const showDevToolsWarning = (): void => {
  // Create warning overlay
  const overlay = document.createElement('div');
  overlay.id = 'devtools-warning';
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.95);
    z-index: 999999;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  `;

  const message = document.createElement('div');
  message.style.cssText = `
    background: white;
    padding: 40px;
    border-radius: 8px;
    max-width: 500px;
    text-align: center;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  `;

  message.innerHTML = `
    <h2 style="margin: 0 0 16px 0; color: #1a1a1a; font-size: 24px;">
      Developer Tools Disabled
    </h2>
    <p style="margin: 0; color: #666; font-size: 16px; line-height: 1.5;">
      Developer tools are disabled for this application.
      Please close the developer tools to continue.
    </p>
  `;

  overlay.appendChild(message);
  document.body.appendChild(overlay);
};

/**
 * Auto-logout user when DevTools is detected (optional)
 */
export const logoutOnDevToolsDetected = async (): Promise<void> => {
  try {
    // Import logout function dynamically to avoid circular dependencies
    const { logout } = await import('./authService');
    await logout();

    // Show message
    alert('You have been logged out due to security restrictions.');

    // Reload page
    window.location.reload();
  } catch (error) {
    console.error('Error logging out:', error);
  }
};

/**
 * Initialize all client-side deterrents
 * Call this once on app initialization
 * 
 * @param options Configuration options
 * @returns Cleanup function to remove all deterrents
 */
export const initializeSecurityDeterrents = (options?: {
  onDevToolsDetected?: 'warn' | 'logout' | 'custom';
  customHandler?: () => void;
}): (() => void) => {
  // Only in production
  if (import.meta.env.DEV) {
    console.log('Security deterrents disabled in development mode');
    return () => {};
  }

  console.log('Initializing security deterrents...');

  // Disable context menu
  const cleanupContextMenu = disableContextMenu();

  // Block DevTools shortcuts
  const cleanupShortcuts = blockDevToolsShortcuts();

  // Detect DevTools
  let cleanupDetector = () => {};

  if (options?.onDevToolsDetected) {
    const handler = () => {
      switch (options.onDevToolsDetected) {
        case 'warn':
          showDevToolsWarning();
          break;
        case 'logout':
          logoutOnDevToolsDetected();
          break;
        case 'custom':
          if (options.customHandler) {
            options.customHandler();
          }
          break;
      }
    };

    cleanupDetector = detectDevTools(handler);
  }

  // Return cleanup function
  return () => {
    cleanupContextMenu();
    cleanupShortcuts();
    cleanupDetector();

    // Remove warning overlay if exists
    const overlay = document.getElementById('devtools-warning');
    if (overlay) {
      overlay.remove();
    }
  };
};

/**
 * Disable console in production (optional)
 * This prevents console.log from working
 */
export const disableConsole = (): void => {
  // Only in production
  if (import.meta.env.DEV) {
    return;
  }

  // Override console methods
  const noop = () => {};
  
  console.log = noop;
  console.warn = noop;
  console.error = noop;
  console.info = noop;
  console.debug = noop;
};

/**
 * Clear console periodically (optional)
 * This clears the console every few seconds
 */
export const clearConsolePeriodically = (): (() => void) => {
  // Only in production
  if (import.meta.env.DEV) {
    return () => {};
  }

  const interval = setInterval(() => {
    console.clear();
  }, 3000);

  return () => {
    clearInterval(interval);
  };
};
