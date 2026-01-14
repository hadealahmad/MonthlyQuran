const fs = require('fs');
const path = require('path');

const CORE_DIR = path.resolve(__dirname, '../core');
const DESTINATIONS = [
    path.resolve(__dirname, '../chrome/src/core'),
    path.resolve(__dirname, '../firefox/src/core'),
    path.resolve(__dirname, '../www/core')
];

function deleteFolderRecursive(directoryPath) {
    if (fs.existsSync(directoryPath)) {
        fs.readdirSync(directoryPath).forEach((file, index) => {
            const curPath = path.join(directoryPath, file);
            if (fs.lstatSync(curPath).isDirectory()) {
                deleteFolderRecursive(curPath);
            } else {
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(directoryPath);
    }
}

function copyFolderRecursiveSync(source, target) {
    let files = [];
    const targetFolder = target;
    if (!fs.existsSync(targetFolder)) {
        fs.mkdirSync(targetFolder, { recursive: true });
    }

    if (fs.lstatSync(source).isDirectory()) {
        files = fs.readdirSync(source);
        files.forEach(function (file) {
            const curSource = path.join(source, file);
            const curTarget = path.join(targetFolder, file);
            if (fs.lstatSync(curSource).isDirectory()) {
                copyFolderRecursiveSync(curSource, curTarget);
            } else {
                fs.copyFileSync(curSource, curTarget);
            }
        });
    }
}

console.log('Starting Core Synchronization...');

DESTINATIONS.forEach(dest => {
    console.log(`Syncing to: ${dest}`);
    deleteFolderRecursive(dest);
    copyFolderRecursiveSync(CORE_DIR, dest);
});

console.log('Synchronization Complete!');
