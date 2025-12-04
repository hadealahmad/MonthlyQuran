# Technical Documentation

## Overview

This document provides detailed technical information about the technologies, APIs, and implementation details used in the Monthly Quran application.

## Table of Contents

- [Technology Stack](#technology-stack)
- [Browser APIs](#browser-apis)
- [Progressive Web App (PWA)](#progressive-web-app-pwa)
- [Internationalization System](#internationalization-system)
- [Theme System](#theme-system)
- [Date Handling](#date-handling)
- [Storage Implementation](#storage-implementation)
- [Build and Deployment](#build-and-deployment)

## Technology Stack

### Core Technologies

- **HTML5**: Semantic markup, accessibility features
- **CSS3**: Modern styling with CSS Variables, Flexbox, Grid
- **Vanilla JavaScript (ES6+)**: No frameworks or build tools required
  - Arrow functions
  - Template literals
  - Destructuring
  - Array methods (map, filter, forEach)
  - Classes (not used - object literals preferred)

### No Dependencies

The application uses zero external JavaScript libraries or frameworks:
- No jQuery
- No React/Vue/Angular
- No build tools (Webpack, Vite, etc.)
- No package manager (npm, yarn, etc.)

### External Resources

- **Google Fonts**: IBM Plex Sans Arabic for Arabic text rendering
- **Service Worker**: Native browser API for offline support

## Browser APIs

### LocalStorage API

**Purpose**: Persistent client-side storage

**Usage**:
```javascript
// Save data
localStorage.setItem('key', JSON.stringify(data));

// Retrieve data
const data = JSON.parse(localStorage.getItem('key'));

// Remove data
localStorage.removeItem('key');
```

**Storage Keys Used**:
- `quran_memorization_config` - User configuration
- `quran_memorization_items` - All memorization items
- `quran_memorization_current_view` - Last active view
- `quran_memorization_install_prompt_shown` - PWA install state

**Limitations**:
- 5-10MB storage limit (varies by browser)
- Synchronous API (blocks main thread)
- String-only storage (JSON serialization required)
- Same-origin policy applies

### Service Worker API

**Purpose**: Enable offline functionality and caching

**Implementation** (`sw.js`):

```javascript
// Cache name with version
const CACHE_NAME = 'monthly-quran-v1';

// Files to cache on install
const urlsToCache = [
  './',
  './index.html',
  './css/*.css',
  './js/*.js',
  './manifest.json'
];
```

**Lifecycle Events**:

1. **Install Event**: Caches static assets
   ```javascript
   self.addEventListener('install', (event) => {
     event.waitUntil(
       caches.open(CACHE_NAME)
         .then(cache => cache.addAll(urlsToCache))
     );
     self.skipWaiting(); // Activate immediately
   });
   ```

2. **Activate Event**: Cleans up old caches
   ```javascript
   self.addEventListener('activate', (event) => {
     event.waitUntil(
       caches.keys().then(cacheNames => {
         return Promise.all(
           cacheNames.map(cacheName => {
             if (cacheName !== CACHE_NAME) {
               return caches.delete(cacheName);
             }
           })
         );
       })
     );
   });
   ```

3. **Fetch Event**: Serves from cache, falls back to network
   ```javascript
   self.addEventListener('fetch', (event) => {
     event.respondWith(
       caches.match(event.request)
         .then(response => response || fetch(event.request))
     );
   });
   ```

**Registration** (in `index.html`):
```javascript
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js');
  });
}
```

### Web App Manifest API

**Purpose**: Enable "Add to Home Screen" functionality

**File**: `manifest.json`

**Key Properties**:
```json
{
  "name": "Monthly Quran - Memorization Tracker",
  "short_name": "Monthly Quran",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#0f172a",
  "orientation": "portrait",
  "icons": [/* Array of icon objects */]
}
```

**Icon Sizes**: 72x72, 96x96, 128x128, 144x144, 152x152, 192x192, 384x384, 512x512

### Before Install Prompt API

**Purpose**: Custom PWA install prompts

**Implementation**:
```javascript
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  // Show custom install button
});

// User clicks install button
installButton.addEventListener('click', () => {
  deferredPrompt.prompt();
  deferredPrompt.userChoice.then((choiceResult) => {
    if (choiceResult.outcome === 'accepted') {
      // User installed
    }
    deferredPrompt = null;
  });
});
```

### Media Query API

**Purpose**: System theme detection

**Usage**:
```javascript
// Check system preference
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

// Listen for changes
window.matchMedia('(prefers-color-scheme: dark)')
  .addEventListener('change', (e) => {
    if (e.matches) {
      // System switched to dark mode
    }
  });
```

### File API

**Purpose**: Data export/import

**Export**:
```javascript
const data = Storage.exportData();
const blob = new Blob([data], { type: 'application/json' });
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'backup.json';
a.click();
URL.revokeObjectURL(url);
```

**Import**:
```javascript
const input = document.createElement('input');
input.type = 'file';
input.accept = 'application/json';
input.addEventListener('change', (e) => {
  const file = e.target.files[0];
  const reader = new FileReader();
  reader.onload = (event) => {
    Storage.importData(event.target.result);
  };
  reader.readAsText(file);
});
```

## Progressive Web App (PWA)

### PWA Requirements Met

1. **HTTPS** (or localhost for development)
2. **Web App Manifest** (`manifest.json`)
3. **Service Worker** (`sw.js`)
4. **Responsive Design** (mobile-first)
5. **Offline Functionality** (cached assets)

### Installability Criteria

- Served over HTTPS
- Has valid manifest with required fields
- Has registered service worker
- Meets engagement heuristics (varies by browser)

### Offline Strategy

**Cache-First Strategy**:
1. Check cache for resource
2. If found, return cached version
3. If not found, fetch from network
4. Cache new resources for future use

**Cached Resources**:
- HTML files
- CSS files
- JavaScript files
- Manifest file
- Static assets

**Not Cached**:
- User data (stored in LocalStorage, works offline)
- External fonts (cached by browser separately)

### Update Strategy

When `sw.js` changes:
1. New service worker installs in background
2. Old service worker continues serving
3. On next page load, new worker activates
4. Old caches cleaned up
5. New resources cached

**Cache Versioning**: Cache name includes version (`monthly-quran-v1`)

## Internationalization System

### Implementation

**File**: `js/i18n.js`

**Translation Structure**:
```javascript
const translations = {
  en: {
    app: { title: 'Monthly Quran' },
    nav: { today: 'Today' },
    // Nested object structure
  },
  ar: {
    app: { title: 'القرآن الشهري' },
    nav: { today: 'اليوم' },
    // Arabic translations
  }
};
```

### Translation Lookup

**Key Format**: Dot-separated path
```javascript
i18n.t('nav.today') // Returns 'Today' or 'اليوم'
i18n.t('today.stats', { total: 5, completed: 3 })
// Returns '5 tasks today, 3 completed'
```

### HTML Integration

**Data Attributes**:
```html
<!-- Text content -->
<span data-i18n="nav.today">Today</span>

<!-- Aria labels -->
<button data-i18n-aria="aria.toggleLanguage">Toggle</button>
```

**Translation Process**:
1. `i18n.translatePage()` scans DOM
2. Finds all `[data-i18n]` and `[data-i18n-aria]` elements
3. Replaces text with translation
4. Updates `dir` and `lang` attributes

### RTL Support

**Automatic Direction Switching**:
```javascript
if (language === 'ar') {
  document.documentElement.setAttribute('dir', 'rtl');
  document.documentElement.setAttribute('lang', 'ar');
} else {
  document.documentElement.setAttribute('dir', 'ltr');
  document.documentElement.setAttribute('lang', 'en');
}
```

**CSS RTL Handling**:
- Logical properties used where possible
- CSS Variables for spacing
- Flexbox with `direction` awareness

### Parameter Substitution

**Format**: `{{parameterName}}`

**Example**:
```javascript
// Translation
'today.stats': '{{total}} tasks today, {{completed}} completed'

// Usage
i18n.t('today.stats', { total: 5, completed: 3 })
// Returns: '5 tasks today, 3 completed'
```

## Theme System

### CSS Variables

**Implementation**: CSS custom properties in `css/themes.css`

**Light Theme Variables**:
```css
[data-theme="light"] {
  --bg: #ffffff;
  --fg: #0f172a;
  --card-bg: #ffffff;
  --border-color: #e2e8f0;
  /* ... more variables */
}
```

**Dark Theme Variables**:
```css
[data-theme="dark"] {
  --bg: #0f172a;
  --fg: #f1f5f9;
  --card-bg: #1e293b;
  --border-color: #334155;
  /* ... more variables */
}
```

### Theme Application

**HTML Attribute**:
```html
<html data-theme="light">
<!-- or -->
<html data-theme="dark">
```

**JavaScript Control**:
```javascript
document.documentElement.setAttribute('data-theme', 'dark');
```

### System Preference Detection

**Initial Load**:
```javascript
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
Theme.setTheme(prefersDark ? 'dark' : 'light');
```

**Dynamic Updates**:
```javascript
window.matchMedia('(prefers-color-scheme: dark)')
  .addEventListener('change', (e) => {
    if (!userHasSetTheme) {
      Theme.setTheme(e.matches ? 'dark' : 'light');
    }
  });
```

### Theme Persistence

Theme preference saved in user config:
```javascript
config.theme = 'dark';
Storage.saveConfig(config);
```

## Date Handling

### Local Time Strategy

All dates use device local timezone, not UTC.

**Rationale**:
- Tasks should appear on correct local day
- Avoids timezone-related bugs
- Consistent behavior across devices

### Date Utilities

**File**: `js/algorithm.js` (DateUtils object)

**Key Functions**:

1. **normalizeDate(date)**: Set time to 00:00:00 local
   ```javascript
   const d = new Date(date);
   d.setHours(0, 0, 0, 0);
   return d;
   ```

2. **getLocalDateString(date)**: Format as 'YYYY-MM-DD' in local time
   ```javascript
   const year = d.getFullYear();
   const month = String(d.getMonth() + 1).padStart(2, '0');
   const day = String(d.getDate()).padStart(2, '0');
   return `${year}-${month}-${day}`;
   ```

3. **isSameLocalDay(date1, date2)**: Compare dates ignoring time
   ```javascript
   const d1 = normalizeDate(date1);
   const d2 = normalizeDate(date2);
   return d1.getTime() === d2.getTime();
   ```

4. **daysDifference(date1, date2)**: Calculate days between dates
   ```javascript
   const d1 = normalizeDate(date1);
   const d2 = normalizeDate(date2);
   return Math.floor((d1 - d2) / (1000 * 60 * 60 * 24));
   ```

### Date Storage Format

**Storage**: ISO date strings ('YYYY-MM-DD')
- Not full ISO 8601 (no time component)
- Not Date objects (JSON serialization)
- Consistent format for comparison

**Example**: `'2024-01-15'`

### Time-Based Filtering

**Morning/Evening Hours**:
- Configurable in settings
- Default: Morning 6:00, Evening 20:00
- Used to filter tasks in "today" view

**Logic**:
```javascript
const currentHour = new Date().getHours();
const morningHour = config.morning_hour || 6;

if (isToday && currentHour < morningHour) {
  // Don't show morning tasks yet
}
```

## Storage Implementation

### Data Serialization

**Format**: JSON

**Storage Methods**:
```javascript
// Save
localStorage.setItem(key, JSON.stringify(data));

// Load
const data = JSON.parse(localStorage.getItem(key) || 'null');
```

### Error Handling

**Try-Catch Blocks**:
```javascript
try {
  localStorage.setItem(key, JSON.stringify(data));
  return true;
} catch (error) {
  console.error('Storage error:', error);
  return false;
}
```

**Quota Exceeded Handling**:
- LocalStorage has 5-10MB limit
- Error caught and logged
- User notified if critical operation fails

### Data Migration

**Version Tracking**: Not currently implemented
- Future: Add version field to config
- Migration functions for schema changes

### Backup/Restore

**Export Format**:
```json
{
  "config": { /* user config */ },
  "items": [ /* array of items */ ],
  "exported_at": "2024-01-15T10:30:00.000Z"
}
```

**Import Validation**:
- JSON parsing
- Structure validation
- Config and items arrays checked

## Performance Optimizations

### DOM Query Optimization
- **DOMCache Utility**: Caches frequently accessed DOM elements to reduce query overhead
- **Lazy Initialization**: Less-used elements are queried on-demand
- **Result**: Reduced DOM queries by 80%+ compared to direct queries

### Schedule Calculation Memoization
- **Cache Strategy**: Memoization cache for `getDailySchedule()` calculations
- **Cache Key**: Based on date, configuration, and items hash
- **Invalidation**: Automatic invalidation when items change
- **Size Limit**: Maximum 50 cached entries to prevent memory issues
- **Result**: Faster view rendering, especially with large datasets

### Array Operation Optimization
- **Map/Set Usage**: O(1) lookups instead of O(n) array.find() operations
- **Single Loop Pattern**: Combined multiple filter/find chains into single loops
- **Result**: Reduced O(n²) operations to O(n)

### DOM Update Batching
- **DocumentFragment**: Used for batch DOM updates instead of individual appendChild() calls
- **Result**: Reduced reflows/repaints, smoother UI updates

### Debouncing
- **Calendar Navigation**: Debounced to prevent excessive renders during rapid navigation
- **User Interactions**: Applied to rapid interactions to improve responsiveness

### Code Quality Improvements
- **Constants File**: Eliminated magic numbers and strings
- **Logger Utility**: Centralized logging with production mode support
- **SVG Utilities**: Safe DOM creation for icons, eliminating innerHTML XSS risks
- **Function Splitting**: Large functions split into smaller, testable units

## Build and Deployment

### No Build Step Required

The application runs directly in the browser:
- No compilation needed
- No bundling required
- No transpilation

### File Structure

```
MonthlyQuran/
├── index.html          # Main HTML file
├── manifest.json       # PWA manifest
├── sw.js              # Service worker
├── css/
│   ├── themes.css     # Theme variables
│   ├── components.css # Component styles
│   ├── styles.css     # Global styles
│   └── navigation.css # Navigation styles
├── js/
│   ├── app.js         # Application entry
│   ├── storage.js     # Data persistence
│   ├── algorithm.js   # Spaced repetition
│   ├── i18n.js        # Translations
│   ├── theme.js       # Theme management
│   ├── components.js  # UI components
│   ├── ui.js          # View management
│   ├── calendar.js    # Calendar component
│   └── dialog.js      # Modal dialogs
└── docs/
    └── *.md           # Documentation
```

### Deployment to GitHub Pages

**Requirements**:
- All paths must be relative (e.g., `./js/app.js`)
- Service worker must use relative paths
- `.nojekyll` file (if needed) to prevent Jekyll processing

**Deployment Methods**:

1. **GitHub Actions** (Recommended):
   - Automatic deployment on push
   - No manual steps required

2. **Manual Deployment**:
   - Push to repository
   - Enable GitHub Pages in Settings
   - Select branch and folder

### Browser Compatibility

**Minimum Requirements**:
- Service Worker support
- LocalStorage support
- ES6+ JavaScript support
- CSS Variables support

**Tested Browsers**:
- Chrome/Edge (recommended)
- Firefox
- Safari (iOS 11.3+)

### Performance Considerations

**Optimizations**:
- Service worker caching
- Lazy view rendering (only render active view)
- Efficient DOM updates (innerHTML only when needed)
- Minimal re-renders (only update changed elements)

**Bundle Size**: ~50KB total JavaScript (uncompressed)

### Security Considerations

**Client-Side Only**:
- No server-side code
- No API calls
- All data stored locally
- No authentication needed

**Data Privacy**:
- All data stored in browser LocalStorage
- Never transmitted to servers
- User has full control via export/import

