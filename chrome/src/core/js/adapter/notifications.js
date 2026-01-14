/**
 * Unified Notifications Adapter
 * Handles differences between Extensions, Mobile (Capacitor), and Web
 */
const notifications = (() => {
    // Platform detection (can rely on env.js or do it here)
    const isExtension = typeof chrome !== 'undefined' && !!chrome.runtime && !!chrome.runtime.id;
    const isMobile = !!(window.Capacitor && window.Capacitor.isNative);
    const isWeb = !isExtension && !isMobile;
    const api = typeof browser !== 'undefined' ? browser : (typeof chrome !== 'undefined' ? chrome : null);

    return {
        async init() {
            Logger.info('Initializing Notifications Adapter', { isExtension, isMobile, isWeb });

            if (isMobile) {
                if (typeof window.Capacitor !== 'undefined' &&
                    window.Capacitor.Plugins &&
                    window.Capacitor.Plugins.LocalNotifications) {
                    this.plugin = window.Capacitor.Plugins.LocalNotifications;
                    // Request permissions on init for mobile
                    await this.requestPermission();
                }
            } else if (isExtension) {
                // Extensions don't need explicit init for alarms, but maybe for notifications permission
                // logic handled in background script usually
            } else if (isWeb) {
                if ('Notification' in window) {
                    if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
                        await Notification.requestPermission();
                    }
                }
            }
        },

        async requestPermission() {
            if (isMobile && this.plugin) {
                const status = await this.plugin.requestPermissions();
                return status.display === 'granted';
            } else if (isWeb && 'Notification' in window) {
                const permission = await Notification.requestPermission();
                return permission === 'granted';
            }
            return true; // Extensions usually have permission via manifest
        },

        async schedule(options) {
            // Options: { id, title, body, schedule: { hour, minute } }
            Logger.info('Scheduling notification', options);

            const hour = options.schedule.hour;
            const minute = options.schedule.minute || 0;

            if (isMobile && this.plugin) {
                await this.plugin.schedule({
                    notifications: [{
                        id: options.id,
                        title: options.title,
                        body: options.body,
                        extra: { reminderId: options.id },
                        schedule: { on: { hour, minute }, allowWhileIdle: true }
                    }]
                });
            } else if (isExtension) {
                // Use chrome.alarms to wake up background script
                // We need a unique name for the alarm
                const alarmName = `reminder-${options.id}`;

                // Calculate time until next occurrence
                // This is a naive implementation, real world needs more robust time calculation
                // but chrome.alarms.create with 'when' argument is standard
                // or 'periodInMinutes' if we want it repeating. 
                // Detailed scheduling usually happens in background service worker.
                // WE SEND A MESSAGE TO BACKGROUND WORKER TO SCHEDULE

                api.runtime.sendMessage({
                    type: 'SCHEDULE_ALARM',
                    payload: {
                        name: alarmName,
                        hour,
                        minute,
                        title: options.title,
                        body: options.body
                    }
                });

            } else if (isWeb) {
                // Web Notification (Active Session Only)
                // We can't really "schedule" in background without SW push.
                // We can set a timeout if the page is open.
                const now = new Date();
                const target = new Date();
                target.setHours(hour, minute, 0, 0);
                if (target < now) target.setDate(target.getDate() + 1);

                const delay = target.getTime() - now.getTime();

                // Clear existing timeout for this ID if tracked
                // ...

                setTimeout(() => {
                    if (Notification.permission === 'granted') {
                        new Notification(options.title, { body: options.body });
                    }
                }, delay);
            }
        },

        async cancelAll() {
            if (isMobile && this.plugin) {
                const pending = await this.plugin.getPending();
                if (pending.notifications.length > 0) {
                    await this.plugin.cancel(pending);
                }
            } else if (isExtension) {
                api.runtime.sendMessage({ type: 'CANCEL_ALL_ALARMS' });
            } else if (isWeb) {
                // Clear timeouts
            }
        }
    };
})();

window.Notifications = notifications;
