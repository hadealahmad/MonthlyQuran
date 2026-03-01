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
      
      // ✅ تطبيق الانتقال السلس عند التحميل الأول (اختياري)
      this.navigateWithTransition(savedView, async () => {
        UI.showView(savedView);
        if (savedView === 'today-view') {
          const today = new Date();
          UI.currentDate = today;
          await UI.renderTodayView(today);
        } else if (savedView === 'progress-view') {
          await UI.renderProgressView();
        } else if (savedView === 'calendar-view') {
          if (typeof Calendar !== 'undefined') await Calendar.initAsView();
        } else if (savedView === 'settings-view') {
          await UI.renderSettingsView();
        }
      });

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

  /**
   * ✅ دالة الملاحة الذكية باستخدام View Transitions API
   * تضمن السلاسة، دعم الإعدادات، والـ Fallback للمتصفحات القديمة
   */
  async navigateWithTransition(viewId, updateCallback) {
    const config = await Storage.getConfig();
    const useTransitions = config?.enableTransitions !== false; // القيمة الافتراضية true
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // التحقق من دعم المتصفح + إعدادات المستخدم + تفضيلات الحركة في النظام
    if (!document.startViewTransition || !useTransitions || prefersReducedMotion) {
      await updateCallback();
      return;
    }

    // تنفيذ الانتقال السلس
    const transition = document.startViewTransition(async () => {
      await updateCallback();
    });

    // اختياري: يمكن إضافة Logic هنا عند انتهاء الأنيميشن
    try {
      await transition.finished;
    } catch (e) {
      Logger.error('View Transition failed:', e);
    }
  },

  // Check version and clear cache if needed
  async checkVersion() {
    if (typeof env === 'undefined' || typeof StorageAdapter === 'undefined') return;

    const lastVersion = await StorageAdapter.get('last_app_version');
    const currentVersion = env.version;

    if (lastVersion !== currentVersion) {
      Logger.info(`Version upgrade detected: ${lastVersion} -> ${currentVersion}`);
      await StorageAdapter.remove('quran_surah_metadata');
      if (typeof QuranAPI !== 'undefined') {
        await StorageAdapter.remove(QuranAPI.STORAGE_KEY);
      }
      await StorageAdapter.set('last_app_version', currentVersion);
      Logger.info('Metadata cache cleared for update.');
    }
  },

  // Initialize PWA install prompt
  initInstallPrompt() {
    window.addEventListener('beforeinstallprompt', async (e) => {
      e.preventDefault();
      this.deferredPrompt = e;
      const hasBeenShown = await Storage.hasInstallPromptBeenShown();
      if (!hasBeenShown) {
        setTimeout(() => {
          Dialog.showInstallPrompt(this.deferredPrompt);
        }, 1000);
      }
    });

    window.addEventListener('appinstalled', async () => {
      this.deferredPrompt = null;
      const banner = document.getElementById('install-prompt-banner');
      if (banner) {
        banner.remove();
        const bottomNav = document.getElementById('bottom-nav');
        if (bottomNav) bottomNav.style.paddingBottom = '';
      }
      await Storage.markInstallPromptShown();
    });
  },

  // Hardware Back Button Logic (Android/Capacitor)
  initBackButton() {
    Logger.info('Initializing Back Button Logic...');
    const isMobile = !!(window.Capacitor && window.Capacitor.isNative);
    
    const attach = () => {
      if (window.Capacitor?.Plugins?.App) {
        window.Capacitor.Plugins.App.removeAllListeners('backButton').then(() => {
          window.Capacitor.Plugins.App.addListener('backButton', async () => {
            const now = Date.now();
            if (now - this.backButtonLastPress < 400) {
              window.Capacitor.Plugins.App.exitApp();
              return;
            }
            this.backButtonLastPress = now;

            if (typeof Dialog !== 'undefined' && Dialog.closeLast()) return;

            if (typeof UI !== 'undefined') {
              if (await UI.goBack()) return;
              const currentView = UI.currentView;
              if (currentView && currentView !== 'today-view') {
                // ✅ استخدام الانتقال حتى في زر الرجوع
                this.navigateWithTransition('today-view', () => UI.showView('today-view'));
                return;
              }
            }
            if (typeof UI !== 'undefined' && UI.showToast) {
              UI.showToast(i18n.t('common.pressAgainToExit') || 'Press back again to exit', 'info');
            }
          });
        });
      }
    };

    if (window.Capacitor) attach();
    else {
      let attempts = 0;
      const interval = setInterval(() => {
        attempts++;
        if (window.Capacitor?.Plugins?.App) {
          clearInterval(interval);
          attach();
        } else if (attempts > 50) clearInterval(interval);
      }, 100);
    }
  },

  initNotificationListeners() {
    if (typeof env !== 'undefined' && env.isMobile && window.Capacitor?.Plugins?.LocalNotifications) {
      window.Capacitor.Plugins.LocalNotifications.addListener('localNotificationActionPerformed', (notificationAction) => {
        const reminderId = notificationAction.notification.extra?.reminderId;
        if (reminderId) {
          setTimeout(() => {
            if (typeof UI !== 'undefined') {
              this.navigateWithTransition('today-view', () => UI.showView('today-view'));
            }
          }, 500);
        }
      });
    }
  }
};

// Initialize app when DOM and stylesheets are ready
if (document.readyState === 'loading') {
  window.addEventListener('load', () => App.init().catch(err => Logger.error('App init failed:', err)));
} else {
  App.init().catch(err => Logger.error('App init failed:', err));
}
