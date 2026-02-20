// core/js/utils/haptics.js
const HapticsService = {
  isEnabled: true,

  async init(config) {
    this.isEnabled = config?.enable_haptics !== false; // Default true if not explicitly false
  },

  updateConfig(isEnabled) {
    this.isEnabled = isEnabled;
  },

  async isAvailable() {
    return this.isEnabled && 
           window.Capacitor && 
           window.Capacitor.isNative && 
           window.Capacitor.Plugins &&
           window.Capacitor.Plugins.Haptics;
  },

  async success() {
    if (await this.isAvailable()) {
      await window.Capacitor.Plugins.Haptics.notification({ type: 'SUCCESS' }).catch(() => {});
    }
  },

  async warning() {
    if (await this.isAvailable()) {
      await window.Capacitor.Plugins.Haptics.notification({ type: 'WARNING' }).catch(() => {});
    }
  },

  async selection() {
    if (await this.isAvailable()) {
      await window.Capacitor.Plugins.Haptics.selectionStart().catch(() => {});
    }
  },

  async light() {
    if (await this.isAvailable()) {
      await window.Capacitor.Plugins.Haptics.impact({ style: 'LIGHT' }).catch(() => {});
    }
  },

  async medium() {
    if (await this.isAvailable()) {
      await window.Capacitor.Plugins.Haptics.impact({ style: 'MEDIUM' }).catch(() => {});
    }
  }
};

window.HapticsService = HapticsService;
