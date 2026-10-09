// core/js/utils/haptics.js
const HapticsService = {
  isEnabled: true,
  hasNativeHaptics: false,
  hasWebVibrate: false,

  async init(config) {
    this.isEnabled = config?.enable_haptics !== false; // Default true if not explicitly false
    this.hasNativeHaptics = !!(window.Capacitor && window.Capacitor.isNative);
    this.hasWebVibrate = !!navigator.vibrate;
  },

  updateConfig(isEnabled) {
    this.isEnabled = isEnabled;
  },

  async isAvailable() {
    if (!this.isEnabled) return false;

    // Check for Capacitor native haptics
    const hasCapacitorHaptics = window.Capacitor && 
           window.Capacitor.isNative && 
           window.Capacitor.Plugins &&
           window.Capacitor.Plugins.Haptics;

    // Check for Web Vibration API (for PWA/browser)
    const hasVibrationApi = !!navigator.vibrate;

    return hasCapacitorHaptics || hasVibrationApi;
  },

  // Web Vibration API patterns (in milliseconds)
  PATTERNS: {
    SUCCESS: [50, 50, 50],
    WARNING: [100, 50, 100],
    ERROR: [200, 100, 200],
    LIGHT: 10,
    MEDIUM: 25,
    HEAVY: 40,
    SELECTION: 15
  },

  // Native Capacitor haptics
  async success() {
    if (!this.isEnabled) return;

    if (this.hasNativeHaptics && window.Capacitor.Plugins.Haptics) {
      await window.Capacitor.Plugins.Haptics.notification({ type: 'SUCCESS' }).catch(() => {});
    } else if (this.hasWebVibrate && navigator.vibrate) {
      navigator.vibrate(this.PATTERNS.SUCCESS);
    }
  },

  async warning() {
    if (!this.isEnabled) return;

    if (this.hasNativeHaptics && window.Capacitor.Plugins.Haptics) {
      await window.Capacitor.Plugins.Haptics.notification({ type: 'WARNING' }).catch(() => {});
    } else if (this.hasWebVibrate && navigator.vibrate) {
      navigator.vibrate(this.PATTERNS.WARNING);
    }
  },

  async error() {
    if (!this.isEnabled) return;

    if (this.hasNativeHaptics && window.Capacitor.Plugins.Haptics) {
      await window.Capacitor.Plugins.Haptics.notification({ type: 'ERROR' }).catch(() => {});
    } else if (this.hasWebVibrate && navigator.vibrate) {
      navigator.vibrate(this.PATTERNS.ERROR);
    }
  },

  async selection() {
    if (!this.isEnabled) return;

    if (this.hasNativeHaptics && window.Capacitor.Plugins.Haptics) {
      await window.Capacitor.Plugins.Haptics.selectionStart().catch(() => {});
    } else if (this.hasWebVibrate && navigator.vibrate) {
      navigator.vibrate(this.PATTERNS.SELECTION);
    }
  },

  async light() {
    if (!this.isEnabled) return;

    if (this.hasNativeHaptics && window.Capacitor.Plugins.Haptics) {
      await window.Capacitor.Plugins.Haptics.impact({ style: 'LIGHT' }).catch(() => {});
    } else if (this.hasWebVibrate && navigator.vibrate) {
      navigator.vibrate(this.PATTERNS.LIGHT);
    }
  },

  async medium() {
    if (!this.isEnabled) return;

    if (this.hasNativeHaptics && window.Capacitor.Plugins.Haptics) {
      await window.Capacitor.Plugins.Haptics.impact({ style: 'MEDIUM' }).catch(() => {});
    } else if (this.hasWebVibrate && navigator.vibrate) {
      navigator.vibrate(this.PATTERNS.MEDIUM);
    }
  },

  async heavy() {
    if (!this.isEnabled) return;

    if (this.hasNativeHaptics && window.Capacitor.Plugins.Haptics) {
      await window.Capacitor.Plugins.Haptics.impact({ style: 'HEAVY' }).catch(() => {});
    } else if (this.hasWebVibrate && navigator.vibrate) {
      navigator.vibrate(this.PATTERNS.HEAVY);
    }
  }
};

window.HapticsService = HapticsService;
