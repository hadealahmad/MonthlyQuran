# Abstract: Multi-Platform "Write Once, Sync Everywhere" Architecture

## 1. The Core Philosophy
The primary challenge in maintaining a cross-platform application (Chrome Extension, Firefox Add-on, PWA, Android App) is **code drift**. Over time, platform-specific implementations of the same feature diverge, leading to maintenance nightmares.

This project uses a **"Core First"** architecture. 
- **The specific platform is an implementation detail.**
- **The business logic is universal.**

## 2. Architecture Overview

### Directory Structure
```
/
├── core/                  # SINGLE SOURCE OF TRUTH
│   ├── js/                # Shared Logic (API, State, Validators)
│   ├── css/               # Shared Styles
│   ├── assets/            # Shared Icons/Images
│   └── data/              # Shared JSON Data
├── chrome/                # Chrome Extension Shell
│   └── src/               # Destination for core sync
├── firefox/               # Firefox Extension Shell
│   └── src/               # Destination for core sync
├── www/                   # PWA / Mobile Web Shell
│   └── core/              # Destination for core sync
└── scripts/               # Build & Sync Tooling
```

### The Synchronization Mechanism
Instead of using symlinks (which fail in many build environments and stores), we use **build-time synchronization**.
- **`scripts/sync.js`**: Recursively copies `core/` to `chrome/src/core`, `firefox/src/core`, and `www/core`.
- **`scripts/version-sync.js`**: Reads `version` from `package.json` and updates:
    - `manifest.json` (Chrome/Firefox)
    - `build.gradle` (Android)
    - `sw.js` (Cache handling)
    - `env.js` (Runtime version access)

## 3. The Adapter Pattern
To handle platform differences (e.g., FileSystem, Notifications, Storage), we use **Adapters** located in `core/js/adapter`.

### Storage Adapter
- **Extensions**: Uses `chrome.storage.local` (Async).
- **Web/Android**: Uses `localStorage` (Sync) wrapped in Promises.
- **Result**: Application logic awaits `Storage.get()` without caring about the underlying engine.

### Notification Adapter
- **Extensions**: Uses `chrome.alarms` + Background Scripts.
- **Android**: Uses `@capacitor/local-notifications`.
- **Web**: Uses `Notification` API (active session only).

## 4. Android Development (The Hard Part)

### The Challenge: Modern Environment vs Stable Android
Developing React Native or Capacitor apps on a bleeding-edge Arch Linux machine (with Java 25, Gradle 8.13+, and latest Android SDK) is painful because:
1.  **Strict JDK Versioning**: Android builds strictly require JDK 17 (or 21 recently), but your system might default to JDK 25.
2.  **Plugin Incompatibility**: Capacitor plugins often hardcode toolchain versions or assume older Gradle versions.
3.  **Kotlin vs Java Targets**: Plugins might compile Kotlin for Java 1.8 while your project targets Java 21, causing build failures.

### The Solution: Automated Patching
We implemented `scripts/patch-android-plugins.js` which runs automatically after `npm run sync`.
It scans `node_modules/@capacitor` and:
1.  **Strip Hardcoded Constraints**: Removes `jvmToolchain(21)` or older `sourceCompatibility`.
2.  **Enforce Consistency**: Injects `JavaVersion.VERSION_17` and `jvmTarget = "17"` into every plugin's `build.gradle`.

### How to Work on Android
You do **not** need Android Studio open. usage:
1.  **Setup**: Ensure `ANDROID_HOME` is set.
2.  **Run Emulator**: `npm run android:run`. This:
    -   Syncs Core content.
    -   Patches Plugins.
    -   Compiles APK.
    -   Installs on Emulator.

## 5. Applying This to Other Projects
To replicate this success:
1.  **Isolate Logic**: Move *everything* that isn't platform-specific API calls into a `core` folder.
2.  **Abstract I/O**: Never call `localStorage` or `fetch` directly in UI components. Wrap them in Adapters.
3.  **Script Everything**: Don't rely on IDE magic. If you can't build it with `npm run build`, it's not maintaining-able.
4.  **Version Handshake**: implementing a check on app launch (in `app.js`) to compare the running version with stored version allows you to invalidate caches intelligently when you ship updates.

## 6. Lessons Learned
- **Don't fight the tooling**: If Gradle complains about versions, don't just downgrade your system Java. Patch the build files dynamically.
- **Native logic belongs in Native**: We replicate the "Native Back Button" behavior in `app.js` using Capacitor listeners to give the Web App a naive feel on Android.
