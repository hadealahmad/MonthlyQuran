# Synchronization and Build Process

> Updated to match `scripts/` as of v1.6.5. The old manual `cp -r` command from the legacy docs is obsolete.

## Model

`core/` is the single source of truth. Build scripts **delete and re-copy** `core/` into each platform shell — local edits in synced destinations are lost by design ("core first").

## Sync Targets (`scripts/sync.js`)

| Source | Destinations |
|---|---|
| `core/` (js, css, assets, data) | `chrome/src/core/`, `firefox/src/core/`, `www/core/` |

```bash
npm run sync        # also runs patch-android-plugins.js afterwards
```

## Version Stamping (`scripts/version-sync.js`)

Reads `version` from `package.json` (currently 1.6.5) and writes:

| Target | Update |
|---|---|
| `www/manifest.json`, `chrome/manifest.json`, `firefox/manifest.json` | `version` field |
| `android/app/build.gradle` | `versionCode = M*10000 + m*100 + p`, `versionName "<x.y.z>"` |
| `core/js/env.js` | runtime `version` |
| `www/sw.js` | `CACHE_NAME = 'monthlyquran-v<x.y.z>'` (cache bust) |

⚠️ Note: version-sync writes `env.js` **in core**, so it propagates on the next sync — run sync after version bumps.

## Full Pipeline (`npm run build`, `scripts/build.js`)

```
[1/5] version-sync          stamp versions everywhere
[2/5] sync                  core → chrome/firefox/www
[3/5] build:extensions      generate icons, zip chrome & firefox → build/*.zip
[4/5] cap sync android      copy www/ into android native assets
[5/5] gradle assembleDebug  Android APK (+ plugin patching first)
```

Outputs: PWA ready in `www/`, extension zips in `build/chrome-<ver>.zip` / `build/firefox-<ver>.zip`, Android project synced.

## Extension Build Details (`scripts/build-extensions.js`)

- Generates per-browser icon sizes (Chrome: 16/32/48/128; Firefox: 16/32/48/96) from `www/favicon/favicon-96x96.png` with fallback source paths.
- Zips `chrome/` and `firefox/` directories into `build/`.

## Platform-Specific Files (never synced)

- Extensions: `manifest.json`, `src/popup/*`, `_locales/*`, `lib/browser-polyfill.min.js` (Firefox)
- Web shell: `index.html`, `sw.js`, `manifest.json`, `favicon/`
- Android: `capacitor.config.json`, `MainActivity.java`, `AndroidManifest.xml`, gradle files

## Android Toolchain Patching (`scripts/patch-android-plugins.js`)

Runs automatically after every sync. Capacitor plugins often pin older Gradle/Kotlin/Java targets; this script patches the plugin build files so they compile against the project's modern toolchain (relevant when developing on rolling-release Linux with new JDK/Gradle). See [../architecture/ABSTRACT.md](../architecture/ABSTRACT.md) §4 for rationale.
