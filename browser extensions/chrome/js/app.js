// Main Application Logic

const App = {
  deferredPrompt: null,

  // Initialize the application (async for storage operations)
  async init() {
    // Initialize DOM cache first
    if (typeof UI !== 'undefined' && UI.initDOMCache) {
      UI.initDOMCache();
    }

    // Initialize storage, theme, and i18n
    const config = await Storage.getConfig();

    // Fetch surah metadata in background (if not cached)
    if (typeof QuranAPI !== 'undefined') {
      const cachedMeta = await StorageAdapter.get(QuranAPI.STORAGE_KEY);
      if (!cachedMeta && typeof UI !== 'undefined' && UI.showToast) {
        UI.showToast('Downloading Quran data...', 'info');
      }

      QuranAPI.fetchSurahMetadata()
        .then(data => {
          if (data && !cachedMeta && typeof UI !== 'undefined' && UI.showToast) {
            UI.showToast('Quran data downloaded successfully', 'success');
          }
        })
        .catch(err => {
          Logger.error('Error fetching surah metadata on init:', err);
          if (!cachedMeta && typeof UI !== 'undefined' && UI.showToast) {
            UI.showToast('Failed to download Quran data. Check internet connection.', 'error');
          }
        });
    }

    if (typeof UI === 'undefined') {
      Logger.error('UI is not defined. Make sure ui.js is loaded before app.js');
      return;
    }

    if (config) {
      // Initialize with saved config
      i18n.init(config.language);
      await Theme.init();

      // Initialize tab navigation
      UI.initTabNavigation();

      // Restore saved view or default to today-view
      const savedView = await Storage.getCurrentView() || 'today-view';
      UI.showView(savedView);

      // Render the view if needed
      if (savedView === 'today-view') {
        // Always show today's tasks on initial load
        const today = new Date();
        UI.currentDate = today;
        await UI.renderTodayView(today);
      } else if (savedView === 'progress-view') {
        await UI.renderProgressView();
      } else if (savedView === 'calendar-view') {
        if (typeof Calendar !== 'undefined') {
          await Calendar.initAsView();
        }
      } else if (savedView === 'settings-view') {
        await UI.renderSettingsView();
      } else if (savedView === 'credits-view') {
        // Credits view doesn't need special rendering
      }
    } else {
      // Show setup
      await Theme.init();
      i18n.init(DEFAULT_CONFIG.LANGUAGE);
      UI.showView('setup-view');
      await UI.renderSetupView();
    }

    // Initialize event listeners
    UI.initEventListeners();

    // Update language toggle display
    UI.updateLanguageToggles();

    // Translate the page
    i18n.translatePage();

    // Make UI and App globally available for components
    window.UI = UI;
    window.App = this;

    // Initialize Notifications
    if (typeof Notifications !== 'undefined') {
      Notifications.init();
    }

    // Initialize PWA install prompt
    this.initInstallPrompt();
  },

  // Initialize PWA install prompt
  initInstallPrompt() {
    // Listen for beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', async (e) => {
      e.preventDefault();
      this.deferredPrompt = e;

      // Show prompt on first launch if not already shown
      const hasBeenShown = await Storage.hasInstallPromptBeenShown();
      if (!hasBeenShown) {
        // Small delay to ensure UI is rendered
        setTimeout(() => {
          Dialog.showInstallPrompt(this.deferredPrompt);
        }, 1000);
      }
    });

    // Listen for appinstalled event
    window.addEventListener('appinstalled', async () => {
      this.deferredPrompt = null;
      const banner = document.getElementById('install-prompt-banner');
      if (banner) {
        banner.remove();
        const bottomNav = document.getElementById('bottom-nav');
        if (bottomNav) {
          bottomNav.style.paddingBottom = '';
        }
      }
      await Storage.markInstallPromptShown();
    });
  }
};

// Initialize app when DOM and stylesheets are ready
// Using window.load ensures all stylesheets are loaded before layout calculations
if (document.readyState === 'loading') {
  window.addEventListener('load', () => App.init().catch(err => Logger.error('App init failed:', err)));
} else if (document.readyState === 'interactive') {
  // DOM ready but stylesheets might not be, wait for load
  window.addEventListener('load', () => App.init().catch(err => Logger.error('App init failed:', err)));
} else {
  // Already loaded
  App.init().catch(err => Logger.error('App init failed:', err));
}
