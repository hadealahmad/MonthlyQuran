# Release & Versioning

## Version Source

Single source: `package.json` → `"version"` (currently **1.6.5**). Everything else is stamped by `scripts/version-sync.js` — see [SYNC_PROCESS.md](SYNC_PROCESS.md).

## Release Channels

| Channel | Artifact | Pipeline |
|---|---|---|
| Web/PWA | `www/` on GitHub Pages | `.github/workflows/deploy.yml` (auto on push to main/master) |
| Chrome Web Store | `build/chrome-<ver>.zip` | `npm run build:extensions` |
| Firefox Add-ons (AMO) | `build/firefox-<ver>.zip` | `npm run build:extensions` |
| Android (sideload/debug) | debug APK | `npm run android:build` |
| Android (Play / release) | signed `.aab` / APK | `npm run android:build:release` + signing scripts |

## Signing

- `scripts/sign-release-bundle.sh` (`npm run sign:android`) — signs the gradle release bundle.
- `scripts/build-and-sign-apk.sh` (`npm run build:apk:signed`) — full build + sign APK in one step.
- Keep keystore paths/passwords out of git; scripts expect local env/keystore.

## Release Checklist

1. Update `package.json` version.
2. Run `npm run build` (stamps versions, syncs, zips extensions, builds Android).
3. Verify version stamped in all manifests, `env.js`, and `sw.js` cache name.
4. Test PWA from `www/`, load unpacked extensions, smoke-test Android build.
5. Commit, tag, push; Pages deploy triggers automatically.
6. Upload extension zips to the stores.

## Known Gaps

- No automated test suite (`npm test` is a stub). `scripts/test-storage-migration.js` exists as a manual check for storage schema migration.
