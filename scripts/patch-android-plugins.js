const fs = require('fs');
const path = require('path');

const pluginPath = path.resolve(__dirname, '../node_modules/@capacitor');

function patchFile(filePath) {
    if (!fs.existsSync(filePath)) return;

    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // Remove existing blocks
    content = content.replace(/compileOptions\s*\{[^}]*\}/g, '');
    content = content.replace(/kotlin\s*\{\s*jvmToolchain\(\d+\)\s*\}/g, '');
    content = content.replace(/kotlinOptions\s*\{[^}]*\}/g, '');

    // Inject compileOptions inside android block
    const compileOptionsBlock = `
    compileOptions {
        sourceCompatibility JavaVersion.VERSION_17
        targetCompatibility JavaVersion.VERSION_17
    }
    `;

    // Inject at start of defaultConfig
    if (content.includes('defaultConfig {')) {
        content = content.replace('defaultConfig {', `${compileOptionsBlock}\n    defaultConfig {`);
    }

    // Inject kotlin task configuration ONLY if kotlin-android plugin is applied
    if (content.includes("apply plugin: 'kotlin-android'") || content.includes('id "org.jetbrains.kotlin.android"')) {
        const footerBlock = `
tasks.withType(org.jetbrains.kotlin.gradle.tasks.KotlinCompile).configureEach {
    kotlinOptions {
        jvmTarget = "17"
    }
}
        `;
        content = content + '\n' + footerBlock;
    }

    // Cleanup extra newlines
    content = content.replace(/\n\s*\n/g, '\n');

    if (content !== original) {
        console.log(`Patched: ${filePath}`);
        fs.writeFileSync(filePath, content);
    }
}

if (fs.existsSync(pluginPath)) {
    const plugins = fs.readdirSync(pluginPath);
    plugins.forEach(plugin => {
        const androidBuild = path.join(pluginPath, plugin, 'android', 'build.gradle');
        patchFile(androidBuild);
    });
}

console.log('Android plugins patched intelligently.');
