/**
 * Local Notifications Logic
 * Handles scheduling and managing local notifications for daily reminders.
 * Note: This primarily works on Android/Native when the app is backgrounded.
 * Web PWA support for background notifications requires a Service Worker and Push Server,
 * which is out of scope for this offline-first local notification implementation.
 */

const Notifications = {
    plugin: null,

    // Initialize the notification system
    async init() {
        // Check if Capacitor and LocalNotifications plugin are available
        if (typeof window.Capacitor !== 'undefined' &&
            window.Capacitor.Plugins &&
            window.Capacitor.Plugins.LocalNotifications) {

            this.plugin = window.Capacitor.Plugins.LocalNotifications;
            Logger.info('LocalNotifications plugin initialized');

            // Check permissions on init (optional, mainly to see status)
            // validation is done before scheduling
        } else {
            // This is expected when running in a browser or extension environment
            console.log('LocalNotifications plugin not available on this platform (Web/PWA/Extension mode). Reminders disabled.');
        }
    },

    // Check if permission is granted
    async checkPermission() {
        if (!this.plugin) return false;
        try {
            const status = await this.plugin.checkPermissions();
            return status.display === 'granted';
        } catch (error) {
            Logger.error('Error checking notification permissions:', error);
            return false;
        }
    },

    // Request permission
    async requestPermission() {
        if (!this.plugin) return false;
        try {
            const status = await this.plugin.requestPermissions();
            return status.display === 'granted';
        } catch (error) {
            Logger.error('Error requesting notification permissions:', error);
            return false;
        }
    },

    // Cancel all pending notifications
    async cancelAll() {
        if (!this.plugin) return;
        try {
            const pending = await this.plugin.getPending();
            if (pending.notifications.length > 0) {
                await this.plugin.cancel(pending);
                Logger.info('Cancelled pending notifications');
            }
        } catch (error) {
            Logger.error('Error cancelling notifications:', error);
        }
    },

    // Schedule notifications based on configuration
    async schedule() {
        if (!this.plugin) {
            Logger.info('Cannot schedule notifications: Plugin not available');
            return;
        }

        const config = await Storage.getConfig();
        if (!config) return;

        // Cancel existing first
        await this.cancelAll();

        const notifications = [];
        let idCount = 100; // Start with ID 100 to avoid conflicts

        // Schedule Morning Reminder
        if (config.morning_hour !== undefined && config.morning_hour !== null) {
            const hour = parseInt(config.morning_hour);
            if (!isNaN(hour) && hour >= 0 && hour <= 23) {
                notifications.push({
                    id: idCount++,
                    title: i18n.t('notifications.title'),
                    body: i18n.t('notifications.morningReminder'),
                    schedule: {
                        on: {
                            hour: hour,
                            minute: 0
                        },
                        allowWhileIdle: true
                    }
                });
            }
        }

        // Schedule Evening Reminder
        if (config.evening_hour !== undefined && config.evening_hour !== null) {
            const hour = parseInt(config.evening_hour);
            if (!isNaN(hour) && hour >= 0 && hour <= 23) {
                notifications.push({
                    id: idCount++,
                    title: i18n.t('notifications.title'),
                    body: i18n.t('notifications.eveningReminder'),
                    schedule: {
                        on: {
                            hour: hour,
                            minute: 0
                        },
                        allowWhileIdle: true
                    }
                });
            }
        }

        if (notifications.length > 0) {
            // Check/Request permission
            let granted = await this.checkPermission();
            if (!granted) {
                granted = await this.requestPermission();
            }

            if (granted) {
                try {
                    await this.plugin.schedule({ notifications });
                    Logger.info(`Scheduled ${notifications.length} notifications`, notifications);
                    if (typeof UI !== 'undefined' && UI.showToast) {
                        UI.showToast(i18n.t('common.success'), 'success');
                    }
                } catch (error) {
                    Logger.error('Error scheduling notifications:', error);
                }
            } else {
                Logger.warn('Notification permission not granted');
                if (typeof UI !== 'undefined' && UI.showToast) {
                    UI.showToast('Notification permission required', 'error');
                }
            }
        } else {
            Logger.info('No notifications to schedule (hours not set)');
        }
    }
};
