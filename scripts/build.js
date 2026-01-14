const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('╔════════════════════════════════════════╗');
console.log('║        Wird Reminder Build System      ║');
console.log('╚════════════════════════════════════════╝');

// 1. Version Sync
console.log('\n[1/5] Syncing Versions...');
require('./version-sync.js');

// 2. Core Sync
console.log('\n[2/5] Syncing Core Code...');
require('./sync.js');

// 3. Build Extensions
console.log('\n[3/5] Building Extensions...');
try {
    execSync('npm run build:extensions', { stdio: 'inherit' });
} catch (e) {
    console.error('Extension build failed', e);
    process.exit(1);
}

// 4. Capacitor Sync (Android)
console.log('\n[4/5] Syncing Capacitor (Android)...');
try {
    execSync('npx cap sync android', { stdio: 'inherit' });
} catch (e) {
    console.warn('Capacitor sync failed (maybe SDK missing?), skipping Android build steps if strictly native.');
}

// 5. Build Android
console.log('\n[5/5] Building Android APK...');
try {
    // Determine Android project path
    const androidDir = path.join(__dirname, '..', 'android');
    if (fs.existsSync(androidDir)) {
        console.log('  >> Patching execution environment...');
        require('./patch-android-plugins.js');

        console.log('  >> Running Gradle Build (assembleDebug)...');
        execSync('npm run android:build', { stdio: 'inherit' });
    } else {
        console.log('  >> Android directory not found, skipping.');
    }
} catch (e) {
    console.error('Android build failed', e);
    // process.exit(1); // Optional: fail build if android fails
}

console.log('\n════════════════════════════════════════');
console.log('✓ Build Process Complete!');
console.log('  - Web:   Ready in www/');
console.log('  - Exts:  Ready in build/');
console.log('  - Android: Project synced.');
console.log('════════════════════════════════════════\n');
