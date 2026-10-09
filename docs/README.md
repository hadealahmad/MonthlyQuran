# MonthlyQuran Documentation

A multi-platform Quran memorization tracker built on a 7-station spaced repetition algorithm.
**Current version:** 1.6.5 · **Stack:** Vanilla JS (ES6, no framework), CSS custom properties, Capacitor 8.

## Documentation Map

```
docs/
├── README.md                 ← You are here
├── architecture/
│   ├── ARCHITECTURE.md       Core-first architecture, module map, data flow
│   ├── ABSTRACT.md           Design rationale for the "write once, sync everywhere" model
│   └── DATA_SCHEMA.md        Storage keys, config & item schemas, review tracking format
├── features/
│   ├── FEATURES.md           Feature checklist verified against the codebase
│   └── MemorizationRules.md  The science & 7-station algorithm behind the app
├── development/
│   ├── DEVELOPMENT.md        Dev setup, conventions, how to run on dev
│   ├── SYNC_PROCESS.md       Core sync + build pipeline (sync.js → build.js)
│   └── RELEASE.md            Versioning, signing, distribution channels
├── platforms/
│   ├── ANDROID_GUIDE.md      Capacitor/Android workflow & troubleshooting
│   └── EXTENSIONS.md         Chrome & Firefox extension shells and manifests
└── design/
    └── STYLING.md            Theme system, design tokens, typography, i18n/RTL
```

## Project Structure (as of v1.6.5)

```
/
├── index.html              # PWA entry point (root-level shell for web)
├── core/                   # ★ SINGLE SOURCE OF TRUTH — all shared code
│   ├── js/                 #   app, algorithm, storage, ui, calendar, backlog,
│   │   │                   #   dialog, components, constants, i18n, theme,
│   │   │                   #   quran-api, env
│   │   ├── adapter/        #   storage.js + notifications.js platform adapters
│   │   └── utils/          #   debounce, logger, svg, haptics
│   ├── css/                #   themes, components, styles, navigation, fonts
│   ├── assets/fonts/       #   Amiri, IBM Plex Sans Arabic, Scheherazade New
│   └── data/               #   Shared JSON data (currently empty/reserved)
├── www/                    # PWA build output (core synced here) + favicon + sw.js + manifest.json
├── chrome/                 # Chrome MV3 extension shell (manifest, popup, _locales; src/core = synced copy)
├── firefox/                # Firefox MV2/3 extension shell (+ browser-polyfill; src/core = synced copy)
├── android/                # Capacitor Android native project
├── scripts/                # Build tooling (see development/SYNC_PROCESS.md)
├── build/                  # Zipped extension artifacts per version
├── _backup/                # Legacy pre-refactor snapshot (DO NOT edit or sync from here)
└── docs/                   # This documentation folder
```

## Quick Links

- **Run in dev:** see [development/DEVELOPMENT.md](development/DEVELOPMENT.md)
- **How syncing works:** see [development/SYNC_PROCESS.md](development/SYNC_PROCESS.md)
- **Storage format / data model:** see [architecture/DATA_SCHEMA.md](architecture/DATA_SCHEMA.md)
- **What the 7 stations are:** see [features/MemorizationRules.md](features/MemorizationRules.md)

> **Note:** The root `README.md` is maintained separately. Files under `_backup/docs/` are historical and superseded by this folder.
