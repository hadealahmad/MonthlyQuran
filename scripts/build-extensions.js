#!/usr/bin/env node

/**
 * Browser Extensions Build Script
 * 
 * Copies core source files to Chrome and Firefox extension directories,
 * applies platform-specific transformations, and generates distributable zips.
 * 
 * Usage:
 *   node scripts/build-extensions.js
 *   npm run build:extensions
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const EXT_DIR = path.join(ROOT, 'browser extensions');
const BUILD_DIR = path.join(EXT_DIR, 'build');

// Core files to copy (relative to ROOT)
const CORE_FILES = [
    'css/themes.css',
    'css/components.css',
    'css/styles.css',
    'css/navigation.css',
    'js/constants.js',
    'js/storage-adapter.js',
    'js/storage.js',
    'js/quran-api.js',
    'js/algorithm.js',
    'js/i18n.js',
    'js/theme.js',
    'js/dialog.js',
    'js/components.js',
    'js/calendar.js',
    'js/ui.js',
    'js/notifications.js',
    'js/app.js',
    'js/utils/logger.js',
    'js/utils/svg.js',
    'js/utils/debounce.js',
];

// Icon sizes needed for each browser
const CHROME_ICON_SIZES = [16, 32, 48, 128];
const FIREFOX_ICON_SIZES = [16, 32, 48, 96];

/**
 * Copy a file, creating destination directory if needed
 */
function copyFile(src, dest) {
    const destDir = path.dirname(dest);
    if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
    }
    fs.copyFileSync(src, dest);
}

/**
 * Copy a directory recursively
 */
function copyDir(src, dest) {
    if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
    }
    fs.cpSync(src, dest, { recursive: true });
}

/**
 * Generate icons from source favicon
 * Uses ImageMagick if available, otherwise copies existing icons
 */
function generateIcons(browser, sizes) {
    const extPath = path.join(EXT_DIR, browser);
    const iconsPath = path.join(extPath, 'icons');
    const sourceFavicon = path.join(ROOT, 'favicon', 'favicon-96x96.png');
    const svgFavicon = path.join(ROOT, 'favicon', 'favicon.svg');

    if (!fs.existsSync(iconsPath)) {
        fs.mkdirSync(iconsPath, { recursive: true });
    }

    // Check if ImageMagick (convert) is available
    let hasImageMagick = false;
    try {
        execSync('which convert', { stdio: 'ignore' });
        hasImageMagick = true;
    } catch {
        hasImageMagick = false;
    }

    sizes.forEach(size => {
        const destIcon = path.join(iconsPath, `icon-${size}.png`);

        // Try to find existing icon
        const existingIcon = path.join(ROOT, 'favicon', `favicon-${size}x${size}.png`);
        if (fs.existsSync(existingIcon)) {
            copyFile(existingIcon, destIcon);
            console.log(`  Copied existing icon: icon-${size}.png`);
            return;
        }

        // Try to generate with ImageMagick
        if (hasImageMagick && fs.existsSync(sourceFavicon)) {
            try {
                execSync(`convert "${sourceFavicon}" -resize ${size}x${size} "${destIcon}"`, { stdio: 'pipe' });
                console.log(`  Generated icon: icon-${size}.png`);
                return;
            } catch (err) {
                console.warn(`  Warning: Failed to generate icon-${size}.png`);
            }
        }

        // Fallback: copy 96x96 if it exists
        if (fs.existsSync(sourceFavicon)) {
            copyFile(sourceFavicon, destIcon);
            console.log(`  Copied fallback icon: icon-${size}.png (resize manually recommended)`);
        } else {
            console.warn(`  Warning: No source icon found for size ${size}`);
        }
    });
}

/**
 * Build a single extension (Chrome or Firefox)
 */
function buildExtension(browser) {
    console.log(`\nBuilding ${browser} extension...`);

    const extPath = path.join(EXT_DIR, browser);
    const iconSizes = browser === 'chrome' ? CHROME_ICON_SIZES : FIREFOX_ICON_SIZES;

    // 1. Copy core files
    console.log('  Copying core files...');
    CORE_FILES.forEach(file => {
        const src = path.join(ROOT, file);
        const dest = path.join(extPath, file);
        if (fs.existsSync(src)) {
            copyFile(src, dest);
        } else {
            console.warn(`  Warning: ${file} not found`);
        }
    });

    // 2. Copy extension-specific popup files
    console.log('  Copying popup files...');
    const srcPopup = path.join(EXT_DIR, 'src', 'popup');
    const destPopup = path.join(extPath, 'src', 'popup');
    if (fs.existsSync(srcPopup)) {
        copyDir(srcPopup, destPopup);
    }

    // 3. Copy browser polyfill (Chrome only needs it, but include for both for consistency)
    console.log('  Copying browser polyfill...');
    const srcLib = path.join(EXT_DIR, 'src', 'lib');
    const destLib = path.join(extPath, 'src', 'lib');
    if (fs.existsSync(srcLib)) {
        copyDir(srcLib, destLib);
    }

    // 4. Generate/copy icons
    console.log('  Processing icons...');
    generateIcons(browser, iconSizes);

    // 5. Get version from manifest
    const manifestPath = path.join(extPath, 'manifest.json');
    if (!fs.existsSync(manifestPath)) {
        console.error(`  Error: manifest.json not found for ${browser}`);
        return;
    }
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    const version = manifest.version;

    // 6. Create build directory
    if (!fs.existsSync(BUILD_DIR)) {
        fs.mkdirSync(BUILD_DIR, { recursive: true });
    }

    // 7. Create zip
    const zipName = `${browser}-${version}.zip`;
    const zipPath = path.join(BUILD_DIR, zipName);

    // Remove old zip if exists
    if (fs.existsSync(zipPath)) {
        fs.unlinkSync(zipPath);
    }

    console.log('  Creating zip package...');
    try {
        execSync(`cd "${extPath}" && zip -r "${zipPath}" . -x "*.git*" -x "*.DS_Store"`, { stdio: 'pipe' });
        console.log(`  ✓ Created: build/${zipName}`);
    } catch (err) {
        console.error(`  Error creating zip: ${err.message}`);
    }
}

/**
 * Main build process
 */
function main() {
    console.log('╔════════════════════════════════════════╗');
    console.log('║   Browser Extensions Build Script      ║');
    console.log('╚════════════════════════════════════════╝');
    console.log(`\nRoot: ${ROOT}`);
    console.log(`Extensions: ${EXT_DIR}`);
    console.log(`Output: ${BUILD_DIR}`);

    // Build Chrome extension
    buildExtension('chrome');

    // Build Firefox extension
    buildExtension('firefox');

    console.log('\n════════════════════════════════════════');
    console.log('✓ Build complete!');
    console.log(`  Chrome:  ${BUILD_DIR}/chrome-*.zip`);
    console.log(`  Firefox: ${BUILD_DIR}/firefox-*.zip`);
    console.log('════════════════════════════════════════\n');
}

// Run
main();
