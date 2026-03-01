// Main Application Logic

const App = {
  deferredPrompt: null,
  backButtonLastPress: 0,

  // Initialize the application (async for storage operations)
  async init() {
    // 1. Version Handshake (Metadata Cache Invalidation)
    await this.checkVersion();

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
      
      if (typeof HapticsService !== 'undefined') {
        HapticsService.init(config);
      }

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

    // Initialize Mobile Hardware Back Button
    this.initBackButton();

    // Initialize Notification Click Listeners
    this.initNotificationListeners();
  },

  // Check version and clear cache if needed
  async checkVersion() {
    if (typeof env === 'undefined' || typeof StorageAdapter === 'undefined') return;

    const lastVersion = await StorageAdapter.get('last_app_version');
    const currentVersion = env.version;

    if (lastVersion !== currentVersion) {
      Logger.info(`Version upgrade detected: ${lastVersion} -> ${currentVersion}`);

      // Clear metadata cache (force refresh)
      await StorageAdapter.remove('quran_surah_metadata');
      // Note: Assuming 'quran_surah_metadata' is the key used in QuranAPI.JS or similar
      // If QuranAPI.STORAGE_KEY is available and different, use that.
      if (typeof QuranAPI !== 'undefined') {
        await StorageAdapter.remove(QuranAPI.STORAGE_KEY);
      }

      // Update stored version
      await StorageAdapter.set('last_app_version', currentVersion);

      Logger.info('Metadata cache cleared for update.');
    }
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
  },

  // Hardware Back Button Logic (Android/Capacitor)
  initBackButton() {
    Logger.info('Initializing Back Button Logic...');

    // Check if we are in a text context suited for mobile
    // We check window.Capacitor directly because env.isMobile might be evaluated before Capacitor injects
    const isMobile = !!(window.Capacitor && window.Capacitor.isNative);
    Logger.info('Environment check:', { isMobile, capacitor: !!window.Capacitor });

    // Helper to attach listener
    const attach = () => {
      if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.App) {
        Logger.info('Attaching Capacitor backButton listener...');
        window.Capacitor.Plugins.App.removeAllListeners('backButton').then(() => {
          window.Capacitor.Plugins.App.addListener('backButton', async () => {
            Logger.debug('Hardware Back Button Pressed');

            // 1. Double-Tap to Exit Priority
            // If the user double-taps back quickly (within 400ms), exit the app immediately
            // regardless of navigation history or modals. This is a common Android pattern.
            const now = Date.now();
            if (now - this.backButtonLastPress < 400) {
              window.Capacitor.Plugins.App.exitApp();
              return;
            }
            // Update last press time slightly later or here?
            // If we update here, every single press counts towards the double press logic.
            // But we only want to trigger exit on the second press.
            // So we update the timestamp now.

            // However, strictly speaking, if we process the event normally (e.g. close modal),
            // that shouldn't necessarily start the "exit timer" or count as "first tap of exit".
            // BUT, the user requirement is "double back tap should exit... but double click must be in fast succession".
            // This implies if I'm deep in history, a quick double-tap should exit.
            // So we MUST track the timestamp on EVERY back press.
            this.backButtonLastPress = now;

            // 2. Modal Management
            // Try to close the last dialog/overlay
            if (typeof Dialog !== 'undefined') {
              if (Dialog.closeLast()) {
                Logger.debug('Dialog closed via back button');
                return;
              }
            }

            // 3. Navigation: Return to previous tab if history exists
            // Or return to main tab if on sub-tab and no history
            if (typeof UI !== 'undefined') {
              if (await UI.goBack()) {
                Logger.debug('Navigated back in history');
                return;
              }

              // Fallback: If no history but not on today view, go to today view
              const currentView = UI.currentView;
              if (currentView && currentView !== 'today-view') {
                Logger.debug(`Navigating back to today-view from ${currentView} (fallback)`);
                UI.showView('today-view');
                return;
              }
            }

            // 4. Single Press on Root: Show Toast
            if (typeof UI !== 'undefined' && UI.showToast) {
              UI.showToast(i18n.t('common.pressAgainToExit') || 'Press back again to exit', 'info');
            }

          });
          Logger.info('Hardware Back Button Listener Attached Successfully');
        });
      } else {
        Logger.warn('Capacitor App Plugin not available properly', window.Capacitor);
      }
    };

    // Attempt to attach. If Capacitor is not ready, wait for it.
    if (window.Capacitor) {
      attach();
    } else {
      // Wait for Capacitor to be ready
      // Poll for up to 5 seconds
      let attempts = 0;
      const interval = setInterval(() => {
        attempts++;
        if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.App) {
          clearInterval(interval);
          Logger.info('Capacitor became ready after polling.');
          attach();
        } else if (attempts > 50) {
          clearInterval(interval);
          Logger.error('Capacitor failed to load after timeout (5s)');
        }
      }, 100);
    }
  },

  // Notification Click Listener (Android/Capacitor)
  initNotificationListeners() {
    if (typeof env !== 'undefined' && env.isMobile && window.Capacitor && window.Capacitor.Plugins.LocalNotifications) {
      window.Capacitor.Plugins.LocalNotifications.addListener('localNotificationActionPerformed', (notificationAction) => {
        const reminderId = notificationAction.notification.extra && notificationAction.notification.extra.reminderId;
        Logger.info('Notification clicked', reminderId);

        if (reminderId) {
          // If we have a specific view for reminders/reading, navigate there.
          // For MonthlyQuran, we might just highlight it in today-view or show a toast.
          // Since we assume simple app structure, getting focus is the primary goal.

          setTimeout(() => {
            if (typeof UI !== 'undefined') {
              UI.showView('today-view');
              // Ideally scroll to the item if list exists
            }
          }, 500);
        }
      });
    }
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
