# Synchronization and Build Process

## Overview

Monthly Quran uses a logic-sharing architecture where the core application (residing in the root directory) powers multiple platforms. Because the project uses vanilla JavaScript and CSS without a transpile step, we use a **Synchronization** method to deploy updates to all platforms simultaneously.

## Deployment Platforms

1.  **Web (PWA)**: Root directory.
2.  **Chrome Extension**: `browser extensions/chrome/`
3.  **Firefox Extension**: `browser extensions/firefox/`
4.  **Android App**: `android/app/src/main/assets/public/`

## Core Assets

The following directories must be kept perfectly in sync across all platforms:
*   `/js/`: Core application logic.
*   `/css/`: Global stylesheets and themes.
*   `/assets/`: Fonts, icons, and static data.

## Sync Command

Whenever you make changes to the core files in the root directory, run the following command to propagate the changes to all extension and mobile folders:

```bash
# Full Multi-Platform Sync Command
cp -r js/* "browser extensions/firefox/js/" && \
cp -r js/* "browser extensions/chrome/js/" && \
cp -r js/* www/js/ && \
cp -r js/* android/app/src/main/assets/public/js/ && \
cp -r css/* "browser extensions/firefox/css/" && \
cp -r css/* "browser extensions/chrome/css/" && \
cp -r css/* www/css/ && \
cp -r css/* android/app/src/main/assets/public/css/ && \
cp -r assets/* "browser extensions/firefox/assets/" && \
cp -r assets/* "browser extensions/chrome/assets/" && \
cp -r assets/* www/assets/ && \
cp -r assets/* android/app/src/main/assets/public/assets/
```

## Platform-Specific Files

**Do NOT synchronize** the following files, as they are unique to each platform:

### Browser Extensions
*   `manifest.json`: Extension metadata and permissions.
*   `src/popup/popup.html`: Custom entry point for the extension popup.
*   `src/popup/popup.css`: Overrides for fixed window dimensions and popup-specific styling.
*   `_locales/`: Extension-specific metadata translations for store listings.

### Android
*   `capacitor.config.ts`: Capacitor configuration.
*   `MainActivity.java` / `AndroidManifest.xml`: Native Android boilerplate.

## Best Practices

1.  **Always Edit Root**: Never edit files inside the `browser extensions/` or `android/` directories directly. Always edit the files in the root `/js` or `/css` folders and then run the sync command.
2.  **Verify Manifests**: After synchronization, verify if the `manifest.json` in extensions needs updating (e.g., if you added a new permission or host permission).
3.  **Local Dev**: Use a local server (e.g., `python -m http.server`) in the root directory for the fastest development cycle, then test the extensions only when the core logic is stable.
