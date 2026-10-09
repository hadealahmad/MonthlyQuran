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

    // Track active web timeouts so they can be cancelled/replaced (BUG-05)
    const webTimeouts = new Map();

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
            if (!options || !options.schedule || typeof options.schedule.hour !== 'number') {
                Logger.error('Notifications.schedule called without valid options:', options);
                return;
            }

            Logger.info('Scheduling notification', options);

            const hour = options.schedule.hour;
            const minute = options.schedule.minute || 0;
            const id = options.id != null ? options.id : 'reminder';

            if (isMobile && this.plugin) {
                await this.plugin.schedule({
                    notifications: [{
                        id: options.id,
                        title: options.title,
                        body: options.body,
                        extra: { reminderId: id },
                        schedule: { on: { hour, minute }, allowWhileIdle: true }
                    }]
                });
            } else if (isExtension) {
                // Use chrome.alarms to wake up background script
                const alarmName = `reminder-${id}`;

                const send = api.runtime.sendMessage({
                    type: 'SCHEDULE_ALARM',
                    payload: {
                        name: alarmName,
                        hour,
                        minute,
                        title: options.title,
                        body: options.body
                    }
                });
                // MV3 returns a promise that rejects if no listener is awake; don't crash
                if (send && typeof send.catch === 'function') {
                    send.catch(err => Logger.warn('Alarm scheduling message failed:', err));
                }

            } else if (isWeb) {
                // Web Notification (Active Session Only)
                // We can't really "schedule" in background without SW push.
                // We can set a timeout if the page is open.
                const now = new Date();
                const target = new Date();
                target.setHours(hour, minute, 0, 0);
                if (target < now) target.setDate(target.getDate() + 1);

                const delay = target.getTime() - now.getTime();

                // Replace any existing timeout for this ID (BUG-05)
                if (webTimeouts.has(id)) {
                    clearTimeout(webTimeouts.get(id));
                }

                const timeoutId = setTimeout(() => {
                    webTimeouts.delete(id);
                    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
                        new Notification(options.title, { body: options.body });
                    }
                }, delay);
                webTimeouts.set(id, timeoutId);
            }
        },

        async cancelAll() {
            if (isMobile && this.plugin) {
                const pending = await this.plugin.getPending();
                if (pending.notifications.length > 0) {
                    await this.plugin.cancel(pending);
                }
            } else if (isExtension) {
                try {
                    const send = api.runtime.sendMessage({ type: 'CANCEL_ALL_ALARMS' });
                    if (send && typeof send.catch === 'function') {
                        send.catch(err => Logger.warn('Cancel alarms message failed:', err));
                    }
                } catch (err) {
                    Logger.warn('Cancel alarms message failed:', err);
                }
            } else if (isWeb) {
                webTimeouts.forEach(t => clearTimeout(t));
                webTimeouts.clear();
            }
        }
    };
})();

window.Notifications = notifications;
