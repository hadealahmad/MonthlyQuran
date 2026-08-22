# Feature List (verified against code, v1.6.5)

Legend: ✅ implemented · 🧩 partially / platform-limited

## Core Scheduling
- ✅ 7-station spaced repetition algorithm (`algorithm.js`), offsets `[0, 0, 1, 4, 11, 25, 55]` days
- ✅ Morning/evening session split with configurable boundary hours (`MORNING_HOUR=6`, `EVENING_HOUR=20`)
- ✅ Task prioritization: New → Yesterday → Spaced → Catch-up (`PRIORITY`)
- ✅ Mark/unmark reviews complete per station per date; missed-review tracking
- ✅ Backlog system: overdue detection (2-day threshold), spread over 3/5/7 days, daily capacity of 5 tasks, station-based reprioritization (`backlog.js`)
- ✅ Catch-up task generation for missed stations

## Memorization Setup
- ✅ Multiple unit types: Page, Ayah (verse), Quarter-Hizb, Hizb, Juz
- ✅ Partial-page unit size option for `page` mode
- ✅ Big-surah presets on the setup screen (surah metadata from API)
- ✅ Configurable start page and plan length

## Views
- ✅ First-run setup wizard
- ✅ Today view (daily task list)
- ✅ Progress view (stats, station distribution)
- ✅ Calendar view — monthly history of completed/missed/planned reviews (`calendar.js`)
- ✅ Settings view (unit type, hours, language, theme, haptics, data export/import)
- ✅ Credits & Privacy views
- ✅ Modal dialog system for confirmations/editing (`dialog.js`)
- ✅ Last-view persistence between sessions

## Quran Data
- ✅ Surah metadata via `api.alquran.cloud/v1`, cached in storage
- ✅ Offline guard: skips fetch when `navigator.onLine === false`; cached data keeps app fully functional offline

## Platform Features
- ✅ PWA: manifest, service worker with versioned cache (`www/sw.js`), favicon set, install prompt
- ✅ Chrome MV3 extension (popup entry point, `_locales` ar/en store listings, alarms-based reminders)
- ✅ Firefox extension (same shell + `browser-polyfill.min.js`)
- ✅ Android app via Capacitor 8 (`com.monthlyquran.app`)
- ✅ Local notifications adapter (web: active-session only; extensions: alarms/background; Android: Capacitor local notifications) 🧩 capability varies by platform
- ✅ Haptics on Android via Capacitor Haptics (toggle in settings) 🧩 no-op elsewhere

## UX & Internationalization
- ✅ Arabic (default) and English UI with full translation dictionary (`i18n.js`, `[data-i18n]` attributes)
- ✅ RTL support
- ✅ Light/Dark themes persisted per user
- ✅ Haptic feedback toggle (Android)

## Data Management
- ✅ Export/import all data as JSON (backup & cross-platform migration)
- ✅ Duplicate-item protection via stable item ID pattern (`storage.js → saveItem`)
- ✅ Archive items (`ITEM_STATUS.ACTIVE/ARCHIVED`)

## Build & Release Tooling
- ✅ Core sync to 3 platform destinations (`scripts/sync.js`)
- ✅ Version stamping across manifests, gradle, env.js, service worker cache name (`scripts/version-sync.js`)
- ✅ Extension icon generation + zipped artifacts into `build/` (`scripts/build-extensions.js`)
- ✅ Full one-command build pipeline incl. Android APK (`scripts/build.js`)
- ✅ Android plugin compatibility patcher for bleeding-edge toolchains (`scripts/patch-android-plugins.js`)
- ✅ Release signing scripts (`sign-release-bundle.sh`, `build-and-sign-apk.sh`)
- ✅ Storage-migration smoke test script (`scripts/test-storage-migration.js`) — note: `npm test` is still a stub
