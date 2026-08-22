# Android App Guide

> Updated for Capacitor 8 (current `package.json` / `capacitor.config.json`).

## Configuration

- App ID: `com.monthlyquran.app`, name: `MonthlyQuran`
- Web dir: `www/` (built/synced web assets)
- Debugging disabled, mixed content allowed, cleartext traffic disallowed (`capacitor.config.json`)
- Plugins: `@capacitor/app`, `filesystem`, `haptics`, `local-notifications`, `share`

## Workflow

1. Edit code in **`core/`** only.
2. Sync & build:
   ```bash
   npm run sync              # core → www/core + android plugin patches
   npm run build             # full: versions + sync + extensions + cap sync + gradle debug APK
   ```
3. Run on device/emulator:
   ```bash
   npm run android:run       # sets ANDROID_HOME to ~/Android/Sdk automatically
   npm run open:android      # opens Android Studio at /opt/android-studio
   ```
4. Release:
   ```bash
   npm run android:build:release    # .aab bundle
   npm run sign:android             # or npm run build:apk:signed for a signed APK
   ```

## Toolchain Notes

- Requires JDK 17 (or 21) and Android SDK; the project targets modern Gradle.
- `scripts/patch-android-plugins.js` (auto-run after sync) patches Capacitor plugin build files that pin older toolchain versions — see [../architecture/ABSTRACT.md](../architecture/ABSTRACT.md) §4.

## Troubleshooting

- **Gradle errors in Studio:** File → Sync Project with Gradle Files.
- **Plugin compile failures:** re-run `npm run sync` so the patcher executes; check its console output.
- **Permissions:** edit `android/app/src/main/AndroidManifest.xml` (platform-specific, never synced).
- **Version mismatch:** bump `package.json` and run `node scripts/version-sync.js`.
