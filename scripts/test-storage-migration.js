
const fs = require('fs');
const path = require('path');

// Mock Browser Environment
const storageMap = new Map();
global.localStorage = {
    getItem: (key) => storageMap.get(key) || null,
    setItem: (key, val) => storageMap.set(key, String(val)),
    removeItem: (key) => storageMap.delete(key),
    clear: () => storageMap.clear()
};
global.window = global;
global.Logger = { error: console.error };

// Load Adapter
const adapterPath = path.resolve(__dirname, '../core/js/adapter/storage.js');
const adapterCode = fs.readFileSync(adapterPath, 'utf8');
eval(adapterCode);

// Test Logic
async function runTest() {
    console.log('Starting Storage Migration Test...');

    const MOCK_CONFIG = {
        unit_type: 'page',
        target: 'hizb',
        start_date: '2025-01-01',
        progression_name: 'Test Progression'
    };
    const KEY = 'quran_memorization_config';

    // 1. Simulate existing data from old app
    // The old app stored data as JSON strings in localStorage
    const rawOldData = JSON.stringify(MOCK_CONFIG);
    localStorage.setItem(KEY, rawOldData);
    console.log(`[Setup] Wrote legacy data to localStorage: ${rawOldData}`);

    // 2. Attempt to read using the new (patched) StorageAdapter
    try {
        const retrieved = await global.StorageAdapter.get(KEY);
        console.log(`[Read] Retrieved from StorageAdapter: ${retrieved}`);

        if (typeof retrieved !== 'string') {
            throw new Error(`Expected string, got ${typeof retrieved}`);
        }

        // 3. Parse as the Application would
        const parsed = JSON.parse(retrieved);
        console.log('[Parse] Parsed JSON:', parsed);

        // 4. Validate fields
        if (parsed.unit_type === MOCK_CONFIG.unit_type &&
            parsed.progression_name === MOCK_CONFIG.progression_name) {
            console.log('✅ SUCCESS: Data preserved and correctly readable.');
        } else {
            throw new Error('Data mismatch.');
        }

    } catch (e) {
        console.error('❌ FAILURE:', e);
        process.exit(1);
    }
}

runTest();
