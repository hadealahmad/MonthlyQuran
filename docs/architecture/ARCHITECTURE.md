# Application Architecture

> Verified against the codebase at v1.6.5. Supersedes `_backup/docs/ARCHITECTURE.md`.

MonthlyQuran is a **Progressive Web App** (also packaged as Chrome/Firefox extensions and an Android app via Capacitor) implementing a 7-station spaced-repetition algorithm for Quran memorization tracking. It is built with **vanilla JavaScript (ES6), no framework, no transpiler**.

## Core-First Architecture

The platform is an implementation detail; the business logic is universal. All logic lives in `core/` and is **copied at build time** into each platform shell (`chrome/src/core`, `firefox/src/core`, `www/core`). See [../development/SYNC_PROCESS.md](../development/SYNC_PROCESS.md).

Platform differences are isolated behind **adapters** in `core/js/adapter/`:

| Concern | Web/PWA | Chrome/Firefox | Android |
|---|---|---|---|
| Storage | `localStorage` wrapped in Promises | `browser.storage.local` / `chrome.storage.local` | `localStorage` (Capacitor WebView) |
| Notifications | `Notification` API (active session only) | `chrome.alarms` + background scripts | `@capacitor/local-notifications` |
| Haptics | not available | not available | `core/js/utils/haptics.js` → Capacitor Haptics |

Adapters are selected at runtime by `env.js` / feature detection — app code simply `await`s the adapter API.

## Module Map (`core/js/`)

| File | Lines* | Responsibility |
|---|---|---|
| `constants.js` | 135 | All shared constants: `DEFAULT_CONFIG`, `PRIORITY`, `UNIT_TYPES`, `STATIONS`, `REVIEW_OFFSETS = [0,0,1,4,11,25,55]`, `VIEWS`, backlog constants. Exposed on `window`. |
| `algorithm.js` | ~708 | The heart: date utilities (`DateUtils` local-timezone safe), schedule generation for the 7 stations, spaced-review task generation, catch-up/backlog task computation, progress statistics. |
| `storage.js` | ~530 | Persistence layer. CRUD for config & items, review completion tracking, export/import, surah metadata caching. Delegates to `StorageAdapter`. |
| `adapter/storage.js` | 158 | `StorageAdapter`: picks `localStorage` vs extension storage; async get/set/remove. |
| `adapter/notifications.js` | 124 | `NotificationsAdapter`: morning/evening reminders per platform. |
| `ui.js` | ~1920 | View rendering & event wiring: today view, progress view, settings, navigation, install prompt. |
| `components.js` | ~1056 | Reusable UI component renderers (task cards, stat cards, toggles, progress rings). |
| `dialog.js` | ~998 | Modal/dialog system: confirmations, item details, edit forms. |
| `calendar.js` | ~417 | Monthly calendar view of past/future reviews and completion history. |
| `backlog.js` | 182 | Missed-review backlog queue: spread options (3/5/7 days), daily capacity cap (5), station-based priority. |
| `quran-api.js` | ~461 | Surah metadata from `api.alquran.cloud/v1` with storage caching + offline guard; big-surah presets. |
| `i18n.js` | ~559 | Full UI translation dictionary, Arabic (default) + English; drives all `[data-i18n]` attributes. |
| `theme.js` | 82 | Light/dark theme switching (CSS class + persisted preference). |
| `app.js` | 303 | Bootstrap: init adapters, load config/items, route to setup or today view. |
| `env.js` | 6 | Runtime environment/version info (injected by `scripts/version-sync.js`). |
| `utils/debounce.js`, `utils/logger.js`, `utils/svg.js`, `utils/haptics.js` | — | Small utilities. |

\* approximate line counts; treat as scale indicators, not contracts.

## Views

Defined in `constants.js → VIEWS` and rendered by shells' HTML (`www/index.html`, extension popups):

1. **Setup** (`setup-view`) — first-run wizard: unit type, big-surah preset, language, theme, start page.
2. **Today** (`today-view`) — prioritized daily tasks: New (P1), Yesterday's maintenance (P2), Spaced reviews (P3), Catch-up (P4).
3. **Progress** (`progress-view`) — memorized units, station distribution, streaks/statistics.
4. **Calendar** (`calendar-view`) — per-day history of reviews completed/missed/planned.
5. **Settings** (`settings-view`) — unit type, hours, language, theme, haptics, export/import data.
6. **Credits** (`credits-view`) — attribution.
7. **Privacy** (`privacy-view`) — privacy policy page.

## Data Flow

```
User action (UI)
   → ui.js / dialog.js handlers
   → algorithm.js computes schedules & priorities
   → storage.js persists via StorageAdapter
   → adapter/storage.js writes to localStorage | browser.storage
   → ui re-renders affected components
```

External dependency: `https://api.alquran.cloud/v1` — used **only** for surah metadata (names, ayah counts); cached in storage so the app works fully offline afterward.

## Build-Time Version Propagation

`scripts/version-sync.js` reads `package.json` version and stamps it into:
- `chrome/manifest.json`, `firefox/manifest.json`, `www/manifest.json`
- `android/app/build.gradle` (versionCode = major×10000 + minor×100 + patch)
- `core/js/env.js` (`version`)
- `www/sw.js` (`CACHE_NAME = 'monthlyquran-v<version>'` → cache busting)

## CI

- `.github/workflows/deploy.yml` — deploys to GitHub Pages (Node 20, npm ci, build/sync) on push to main/master.
- `.github/workflows/release.yml` — release packaging.
