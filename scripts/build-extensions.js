#!/usr/bin/env node

/**
 * Browser Extensions Build Script
 * 
 * Generates icons and zips the extension directories.
 * Core code sync is handled by scripts/sync.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const CHROME_DIR = path.join(ROOT, 'chrome');
const FIREFOX_DIR = path.join(ROOT, 'firefox');
const BUILD_DIR = path.join(ROOT, 'build');

const CHROME_ICON_SIZES = [16, 32, 48, 128];
const FIREFOX_ICON_SIZES = [16, 32, 48, 96];

function copyFile(src, dest) {
    const destDir = path.dirname(dest);
    if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
    }
    fs.copyFileSync(src, dest);
}

function generateIcons(browserDir, sizes) {
    const iconsPath = path.join(browserDir, 'icons');
    const sourceFavicon = path.join(ROOT, 'core/assets/favicon/favicon-96x96.png');
    // Note: Adjust path if favicon is elsewhere. 
    // In step 30 I moved assets to core/assets. 
    // Original structure had favicon directory. 
    // Let's check where favicon is. 
    // In step 85 I moved favicon to www/. 
    // Let's assume there is a source favicon available or I check multiple locations.

    // Fallback source locations
    const sources = [
        path.join(ROOT, 'www/favicon/favicon-96x96.png'),
        path.join(ROOT, 'core/assets/favicon/favicon-96x96.png'),
        path.join(ROOT, 'favicon/favicon-96x96.png')
    ];

    let validSource = sources.find(s => fs.existsSync(s));

    if (!validSource) {
        console.warn(`  Warning: No source favicon found to generate icons.`);
        return;
    }

    if (!fs.existsSync(iconsPath)) {
        fs.mkdirSync(iconsPath, { recursive: true });
    }

    // Check ImageMagick
    let hasImageMagick = false;
    try {
        execSync('which convert', { stdio: 'ignore' });
        hasImageMagick = true;
    } catch {
        hasImageMagick = false;
    }

    sizes.forEach(size => {
        const destIcon = path.join(iconsPath, `icon-${size}.png`);
        if (fs.existsSync(destIcon)) return; // Don't overwrite if exists

        if (hasImageMagick) {
            try {
                execSync(`convert "${validSource}" -resize ${size}x${size} "${destIcon}"`, { stdio: 'pipe' });
                console.log(`  Generated: icon-${size}.png`);
            } catch (err) {
                console.warn(`  Failed to generate icon-${size}.png`);
            }
        } else {
            // Simple copy if size matches or just copy source
            copyFile(validSource, destIcon);
            console.log(`  Copied fallback: icon-${size}.png`);
        }
    });
}

function buildExtension(browser, dir) {
    console.log(`\nPackaging ${browser}...`);

    // 1. Generate Icons
    const sizes = browser === 'chrome' ? CHROME_ICON_SIZES : FIREFOX_ICON_SIZES;
    generateIcons(dir, sizes);

    // 2. Get Version
    const manifestPath = path.join(dir, 'manifest.json');
    if (!fs.existsSync(manifestPath)) {
        console.error(`  Error: manifest.json not found in ${dir}`);
        return;
    }
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    const version = manifest.version;

    // 3. Zip
    if (!fs.existsSync(BUILD_DIR)) {
        fs.mkdirSync(BUILD_DIR, { recursive: true });
    }

    const zipName = `${browser}-${version}.zip`;
    const zipPath = path.join(BUILD_DIR, zipName);

    if (fs.existsSync(zipPath)) fs.unlinkSync(zipPath);

    try {
        // Zip content of the directory
        execSync(`cd "${dir}" && zip -r "${zipPath}" . -x "*.git*" -x "*.DS_Store" -x "**/.DS_Store"`, { stdio: 'pipe' });
        console.log(`  ✓ Created: build/${zipName}`);
    } catch (err) {
        console.error(`  Error zipping: ${err.message}`);
    }
}

function main() {
    console.log('Starting Extension Build...');

    buildExtension('chrome', CHROME_DIR);
    buildExtension('firefox', FIREFOX_DIR);

    console.log('Extension Build Complete.');
}

main();
