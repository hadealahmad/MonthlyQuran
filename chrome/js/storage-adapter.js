/**
 * Storage Adapter - Cross-platform storage abstraction
 * 
 * Provides a unified async API for storage that works across:
 * - Browser extensions (uses browser.storage.local)
 * - PWA/Web (uses localStorage)
 * - Capacitor Android (uses localStorage)
 * 
 * All methods return Promises for consistency across platforms.
 */

const StorageAdapter = (() => {
    // Detect if running in browser extension context
    // Check for browser.storage (Firefox native) or chrome.storage (Chrome)
    const isExtension = (() => {
        try {
            // Firefox uses 'browser' namespace natively
            if (typeof browser !== 'undefined' && browser.storage && browser.storage.local) {
                return 'browser';
            }
            // Chrome uses 'chrome' namespace (but we'll use polyfill in extensions)
            if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
                return 'chrome';
            }
            return false;
        } catch (e) {
            return false;
        }
    })();

    /**
     * Extension storage implementation (async)
     * Uses browser.storage.local API
     */
    const extensionStorage = {
        async get(key) {
            try {
                // Use browser namespace (polyfill provides this for Chrome)
                const api = typeof browser !== 'undefined' ? browser : chrome;
                const result = await api.storage.local.get(key);
                return result[key] !== undefined ? JSON.stringify(result[key]) : null;
            } catch (error) {
                if (typeof Logger !== 'undefined') {
                    Logger.error('StorageAdapter.get error:', error);
                }
                return null;
            }
        },

        async set(key, value) {
            try {
                const api = typeof browser !== 'undefined' ? browser : chrome;
                const parsed = value ? JSON.parse(value) : null;
                await api.storage.local.set({ [key]: parsed });
                return true;
            } catch (error) {
                if (typeof Logger !== 'undefined') {
                    Logger.error('StorageAdapter.set error:', error);
                }
                return false;
            }
        },

        async remove(key) {
            try {
                const api = typeof browser !== 'undefined' ? browser : chrome;
                await api.storage.local.remove(key);
                return true;
            } catch (error) {
                if (typeof Logger !== 'undefined') {
                    Logger.error('StorageAdapter.remove error:', error);
                }
                return false;
            }
        },

        async clear() {
            try {
                const api = typeof browser !== 'undefined' ? browser : chrome;
                await api.storage.local.clear();
                return true;
            } catch (error) {
                if (typeof Logger !== 'undefined') {
                    Logger.error('StorageAdapter.clear error:', error);
                }
                return false;
            }
        }
    };

    /**
     * LocalStorage implementation (sync wrapped as async for consistency)
     * Used for PWA/Web and Capacitor Android
     */
    const localStorageWrapper = {
        async get(key) {
            try {
                return localStorage.getItem(key);
            } catch (error) {
                if (typeof Logger !== 'undefined') {
                    Logger.error('StorageAdapter.get error:', error);
                }
                return null;
            }
        },

        async set(key, value) {
            try {
                localStorage.setItem(key, value);
                return true;
            } catch (error) {
                if (typeof Logger !== 'undefined') {
                    Logger.error('StorageAdapter.set error:', error);
                }
                return false;
            }
        },

        async remove(key) {
            try {
                localStorage.removeItem(key);
                return true;
            } catch (error) {
                if (typeof Logger !== 'undefined') {
                    Logger.error('StorageAdapter.remove error:', error);
                }
                return false;
            }
        },

        async clear() {
            try {
                localStorage.clear();
                return true;
            } catch (error) {
                if (typeof Logger !== 'undefined') {
                    Logger.error('StorageAdapter.clear error:', error);
                }
                return false;
            }
        }
    };

    // Return the appropriate storage implementation
    const implementation = isExtension ? extensionStorage : localStorageWrapper;

    // Add a method to check the current platform
    implementation.getPlatform = () => {
        if (isExtension === 'browser') return 'firefox-extension';
        if (isExtension === 'chrome') return 'chrome-extension';
        return 'web';
    };

    return implementation;
})();

// Expose globally for other modules
window.StorageAdapter = StorageAdapter;
