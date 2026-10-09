#!/bin/bash

# Configuration (override via environment: KEYSTORE_PATH, KEY_ALIAS, ANDROID_SDK_ROOT, BUILD_TOOLS_VERSION)
KEYSTORE="${KEYSTORE_PATH:-/run/media/hadi/SSD1/androidkeypersonal.jks}"
ALIAS="${KEY_ALIAS:-key0}"
ANDROID_SDK_ROOT="${ANDROID_SDK_ROOT:-/home/hadi/Android/Sdk}"

if [ ! -f "$KEYSTORE" ]; then
  echo "❌ Keystore not found at: $KEYSTORE"
  echo "   Set KEYSTORE_PATH (and optionally KEY_ALIAS) in your environment."
  exit 1
fi
BUILD_TOOLS_VERSION="36.1.0"
ZIPALIGN="$ANDROID_SDK_ROOT/build-tools/$BUILD_TOOLS_VERSION/zipalign"
APKSIGNER="$ANDROID_SDK_ROOT/build-tools/$BUILD_TOOLS_VERSION/apksigner"

# Paths
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
ANDROID_DIR="$PROJECT_ROOT/android"
APK_DIR="$ANDROID_DIR/app/build/outputs/apk/release"
UNSIGNED_APK="$APK_DIR/app-release-unsigned.apk"
ALIGNED_APK="$APK_DIR/app-release-aligned.apk"
SIGNED_APK="$APK_DIR/app-release-signed.apk"

echo "╔════════════════════════════════════════╗"
echo "║      Building & Signing Android APK    ║"
echo "╚════════════════════════════════════════╝"

# 1. Build the Unsigned APK
echo "🚀 Building Release APK..."
cd "$ANDROID_DIR"
./gradlew assembleRelease

if [ $? -ne 0 ]; then
    echo "❌ Build failed."
    exit 1
fi

cd "$PROJECT_ROOT"

# Check if APK exists
if [ ! -f "$UNSIGNED_APK" ]; then
    echo "❌ Error: Unsigned APK not found at:"
    echo "   $UNSIGNED_APK"
    exit 1
fi

echo "✅ Build complete."

# 2. Zipalign
echo "📐 Running zipalign..."
rm -f "$ALIGNED_APK" # Remove if exists
"$ZIPALIGN" -v 4 "$UNSIGNED_APK" "$ALIGNED_APK"

if [ $? -ne 0 ]; then
    echo "❌ Zipalign failed."
    exit 1
fi

# 3. Sign
echo "✍️  Signing APK..."
# Current keystore setup requires prompting for password usually, 
# but apksigner takes password from stdin or arg.
# We will let it prompt interactively if possible, but in this agent environment interaction is tricky.
# However, the previous script `sign-release-bundle.sh` said: "You will be prompted for your keystore password."
# jarsigner prompts. apksigner also prompts.
# If I run this via `run_command`, the user can input the password.

echo "⚠️  You will be prompted for your keystore password."

rm -f "$SIGNED_APK" # Remove if exists
"$APKSIGNER" sign --ks "$KEYSTORE" --ks-key-alias "$ALIAS" --out "$SIGNED_APK" "$ALIGNED_APK"

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Success! The APK is signed and ready."
    echo "   Location: $SIGNED_APK"
else
    echo ""
    echo "❌ Signing failed."
    exit 1
fi
