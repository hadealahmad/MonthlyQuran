/**
 * Chrome MV3 background service worker.
 * Receives scheduling messages from the popup and manages chrome.alarms +
 * chrome.notifications. Platform-specific file — never overwritten by sync.
 */

const REMINDER_PREFIX = 'reminder-';

function nextOccurrence(hour, minute) {
    const now = Date.now();
    const target = new Date();
    target.setHours(hour, minute, 0, 0);
    if (target.getTime() <= now) target.setDate(target.getDate() + 1);
    return target.getTime();
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (!msg || typeof msg !== 'object') return;

    if (msg.type === 'SCHEDULE_ALARM' && msg.payload) {
        const { name, hour, minute, title, body } = msg.payload;
        const when = nextOccurrence(hour, minute);
        // Daily repeating alarm aligned to the requested time
        chrome.alarms.create(name, { when, periodInMinutes: 1440 });
        // Keep display info for when the alarm fires
        chrome.storage.session.set({ [name]: { title, body } }).catch(() => {});
        sendResponse({ ok: true });
    }

    if (msg.type === 'CANCEL_ALL_ALARMS') {
        chrome.alarms.getAll(alarms => {
            alarms.forEach(a => {
                if (a.name.startsWith(REMINDER_PREFIX)) chrome.alarms.clear(a.name);
            });
        });
        sendResponse({ ok: true });
    }

    return true; // async sendResponse
});

chrome.alarms.onAlarm.addListener(alarm => {
    if (!alarm.name.startsWith(REMINDER_PREFIX)) return;
    const lookup = chrome.storage.session.get(alarm.name).then(items => items && items[alarm.name]);
    lookup
        .then(info => {
            const title = (info && info.title) || 'Monthly Quran';
            const body = (info && info.body) || '';
            chrome.notifications.create(alarm.name, {
                type: 'basic',
                iconUrl: 'icons/icon-128.png',
                title,
                message: body
            });
        })
        .catch(() => {
            chrome.notifications.create(alarm.name, {
                type: 'basic',
                iconUrl: 'icons/icon-128.png',
                title: 'Monthly Quran',
                message: ''
            });
        });
});
