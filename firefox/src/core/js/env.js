window.env = {
    isExtension: typeof chrome !== 'undefined' && !!chrome.runtime && !!chrome.runtime.id,
    isMobile: !!(window.Capacitor && window.Capacitor.isNative),
    isWeb: !(typeof chrome !== 'undefined' && !!chrome.runtime && !!chrome.runtime.id) && !(window.Capacitor && window.Capacitor.isNative),
    version: '1.1.1'
};
