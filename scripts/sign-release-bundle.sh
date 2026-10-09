#!/bin/bash

# Configuration (override via environment: KEYSTORE_PATH, KEY_ALIAS)
KEYSTORE="${KEYSTORE_PATH:-/run/media/hadi/SSD1/androidkeypersonal.jks}"
ALIAS="${KEY_ALIAS:-key0}"

if [ ! -f "$KEYSTORE" ]; then
  echo "❌ Keystore not found at: $KEYSTORE"
  echo "   Set KEYSTORE_PATH (and optionally KEY_ALIAS) in your environment."
  exit 1
fi

# Determine paths relative to this script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
AAB_PATH="$PROJECT_ROOT/android/app/build/outputs/bundle/release/app-release.aab"

echo "╔════════════════════════════════════════╗"
echo "║      Signing Android Release Bundle    ║"
echo "╚════════════════════════════════════════╝"

if [ ! -f "$AAB_PATH" ]; then
    echo "❌ Error: AAB file not found at:"
    echo "   $AAB_PATH"
    echo "   Please run 'npm run android:build:release' first."
    exit 1
fi

echo "📂 Bundle: $AAB_PATH"
echo "🔑 Keystore: $KEYSTORE"
echo "🏷️  Alias: $ALIAS"
echo ""
echo "⚠️  You will be prompted for your keystore password."
echo ""

# Sign the bundle using jarsigner
jarsigner -verbose -sigalg SHA256withRSA -digestalg SHA-256 -keystore "$KEYSTORE" "$AAB_PATH" "$ALIAS"

STATUS=$?

if [ $STATUS -eq 0 ]; then
    echo ""
    echo "✅ Success! The bundle is signed and ready for Google Play."
    echo "   Location: $AAB_PATH"
else
    echo ""
    echo "❌ Signing failed."
    exit $STATUS
fi
