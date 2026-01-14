/**
 * Unified Storage Adapter
 * Handles differences between chrome.storage and localStorage
 */
const storage = (() => {
    const isExtension = typeof chrome !== 'undefined' && !!chrome.runtime && !!chrome.runtime.id;
    const api = typeof browser !== 'undefined' ? browser : (typeof chrome !== 'undefined' ? chrome : null);

    return {
        async get(key) {
            if (isExtension) {
                const result = await api.storage.local.get(key);
                return result[key];
            } else {
                const value = localStorage.getItem(key);
                try {
                    return value ? JSON.parse(value) : null;
                } catch (e) {
                    return value;
                }
            }
        },

        async set(key, value) {
            if (isExtension) {
                await api.storage.local.set({ [key]: value });
            } else {
                localStorage.setItem(key, JSON.stringify(value));
            }
        },

        async remove(key) {
            if (isExtension) {
                await api.storage.local.remove(key);
            } else {
                localStorage.removeItem(key);
            }
        },

        async clear() {
            if (isExtension) {
                await api.storage.local.clear();
            } else {
                localStorage.clear();
            }
        }
    };
})();

window.storage = storage;
// Keep legacy name for compatibility if needed
window.StorageAdapter = storage;
