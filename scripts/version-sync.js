const fs = require('fs');
const path = require('path');

const rootPackagePath = path.resolve(__dirname, '../package.json');
const rootPackage = JSON.parse(fs.readFileSync(rootPackagePath, 'utf8'));
const version = rootPackage.version;

const targets = [
    {
        path: path.resolve(__dirname, '../www/manifest.json'),
        type: 'json',
        key: 'version'
    },
    {
        path: path.resolve(__dirname, '../chrome/manifest.json'),
        type: 'json',
        key: 'version'
    },
    {
        path: path.resolve(__dirname, '../firefox/manifest.json'),
        type: 'json',
        key: 'version'
    },
    {
        path: path.resolve(__dirname, '../android/app/build.gradle'),
        type: 'gradle'
    }
];

console.log(`Syncing version ${version} across platforms...`);

targets.forEach(target => {
    if (!fs.existsSync(target.path)) {
        console.warn(`File not found: ${target.path}`);
        return;
    }

    if (target.type === 'json') {
        const content = JSON.parse(fs.readFileSync(target.path, 'utf8'));
        content[target.key] = version;
        fs.writeFileSync(target.path, JSON.stringify(content, null, 2));
        console.log(`Updated version in ${path.relative(process.cwd(), target.path)}`);
    } else if (target.type === 'gradle') {
        let content = fs.readFileSync(target.path, 'utf8');
        // Simple regex to find versionCode and versionName
        // VersionCode is usually an integer, we might need a better logic for it
        const versionParts = version.split('.');
        const versionCode = parseInt(versionParts[0]) * 10000 + parseInt(versionParts[1]) * 100 + parseInt(versionParts[2]);

        content = content.replace(/versionCode \d+/, `versionCode ${versionCode}`);
        content = content.replace(/versionName "[^"]+"/, `versionName "${version}"`);

        fs.writeFileSync(target.path, content);
        console.log(`Updated version in ${path.relative(process.cwd(), target.path)}`);
    }
});

// Update env.js version if it exists
// Update env.js version if it exists
const envPath = path.resolve(__dirname, '../core/js/env.js');
if (fs.existsSync(envPath)) {
    let envContent = fs.readFileSync(envPath, 'utf8');
    envContent = envContent.replace(/version: '[^']+'/, `version: '${version}'`);
    fs.writeFileSync(envPath, envContent);
    console.log(`Updated version in core/js/env.js`);
}

// Update Service Worker Cache Name
const swPath = path.resolve(__dirname, '../www/sw.js');
if (fs.existsSync(swPath)) {
    let swContent = fs.readFileSync(swPath, 'utf8');
    // Replace CACHE_NAME = '...';
    swContent = swContent.replace(/const CACHE_NAME = '[^']+';/, `const CACHE_NAME = 'monthlyquran-v${version}';`);
    fs.writeFileSync(swPath, swContent);
    console.log(`Updated CACHE_NAME in www/sw.js`);
}

console.log('Version synchronization complete!');
