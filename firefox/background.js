/**
 * Firefox background script (MV2).
 * Receives scheduling messages from the popup and manages alarms +
 * notifications. Uses the chrome.* namespace with callbacks, which Firefox
 * supports natively (avoids needing the polyfill in the background context).
 * Platform-specific file — never overwritten by sync.
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
        const { name, hour, minute } = msg.payload;
        const when = nextOccurrence(hour, minute);
        chrome.alarms.create(name, { when, periodInMinutes: 1440 });
        // Keep display info for when the alarm fires
        const store = {};
        store[name] = { title: msg.payload.title, body: msg.payload.body };
        chrome.storage.local.set(store);
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
    chrome.storage.local.get(alarm.name, items => {
        const info = items && items[alarm.name];
        chrome.notifications.create(alarm.name, {
            type: 'basic',
            iconUrl: chrome.runtime.getURL('icons/icon-96.png'),
            title: (info && info.title) || 'Monthly Quran',
            message: (info && info.body) || ''
        });
    });
});
