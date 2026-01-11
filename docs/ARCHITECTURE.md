# Application Architecture

## Overview

Monthly Quran is a Progressive Web Application (PWA) built with vanilla JavaScript that implements a 7-station spaced repetition algorithm for Quran memorization tracking. The application follows a modular architecture with clear separation of concerns.

## Table of Contents

- [Module Structure](#module-structure)
- [Data Flow](#data-flow)
- [Component Hierarchy](#component-hierarchy)
- [Storage Schema](#storage-schema)
- [Algorithm Implementation](#algorithm-implementation)
- [View Management](#view-management)
- [Event Handling](#event-handling)

## Module Structure

The application is organized into modular JavaScript files, each with a specific responsibility:

### Core Modules

#### `storage.js` - Data Persistence Layer
- **Purpose**: Manages all LocalStorage operations
- **Key Functions**:
  - `saveConfig()` / `getConfig()` - User configuration management
  - `saveItem()` / `getAllItems()` - Memorization item CRUD operations
  - `markReviewComplete()` / `isReviewCompleted()` - Review tracking
  - `exportData()` / `importData()` - Data backup/restore
  - `saveSurahMetadata()` / `getSurahMetadata()` - Quran metadata caching
- **Storage Keys**:
  - `quran_memorization_config` - User settings and preferences (includes `start_page`)
  - `quran_memorization_items` - All memorization items
  - `quran_memorization_current_view` - Last viewed screen
  - `quran_memorization_install_prompt_shown` - PWA install prompt state
  - `quran_surah_metadata` - Cached surah metadata from API

#### `algorithm.js` - Spaced Repetition Logic
- **Purpose**: Implements the 7-station review algorithm
- **Key Components**:
  - `DateUtils` - Date normalization and comparison utilities
  - `Algorithm` - Review date calculation and schedule generation
- **Review Offsets**: `[0, 0, 1, 4, 11, 25, 55]` days from memorization date
- **Key Functions**:
  - `calculateReviewDates()` - Generates all 7 review dates for an item
  - `getDailySchedule()` - Generates daily task list (new, yesterday, spaced reviews)
  - `getProgressStats()` - Calculates completion statistics

#### `i18n.js` - Internationalization
- **Purpose**: Manages language switching and translations
- **Supported Languages**: English (en), Arabic (ar)
- **Features**:
  - Automatic RTL/LTR direction switching
  - HTML `data-i18n` attribute-based translation
  - Parameter substitution in translations
- **Key Functions**:
  - `init()` - Initialize with language from config
  - `t()` - Get translation for a key
  - `translatePage()` - Update all translatable elements

#### `theme.js` - Theme Management
- **Purpose**: Handles light/dark mode switching
- **Features**:
  - System preference detection
  - CSS variable-based theming
  - Persistent theme selection
- **Key Functions**:
  - `init()` - Load theme from config or system preference
  - `setTheme()` - Apply theme and save to config
  - `toggle()` - Switch between light/dark

#### `quran-api.js` - Quran API Integration
- **Purpose**: Handles all interactions with alquran.cloud API
- **Key Functions**:
  - `fetchSurahMetadata()` - Get surah metadata (with caching)
  - `getBigSurahs()` - Filter surahs with more than 3 pages
  - `getSurahByNumber()` - Get specific surah data
  - `fetchPageText()` - Get Quran text for reading modal
  - `getSurahPageCount()` / `getSurahStartPage()` - Helper functions
  - `getSurahName()` - Get surah name in specified language
- **Caching**: Metadata cached in localStorage after first fetch

#### `components.js` - UI Component Factory
- **Purpose**: Creates reusable UI components
- **Key Components**:
  - `createTaskCard()` - Task item with checkbox, read icon, and priority badge
  - `createProgressTimelineItem()` - Progress view timeline entry
  - `createQuickStats()` - Today's task statistics
  - `createStationIndicator()` - Visual station progress indicator
  - `showReadingModal()` - Modal displaying Quran text with verse separators

#### `ui.js` - View Management and Rendering
- **Purpose**: Controls view switching and rendering logic
- **Key Responsibilities**:
  - View lifecycle management
  - Tab navigation handling
  - Form initialization and submission
  - Task list rendering
  - Surah preset dropdown management
  - Dynamic unit label updates
  - Start page field visibility control
- **Views Managed**:
  - `setup-view` - Initial configuration (with surah preset, start page)
  - `today-view` - Daily task list (always shows today on reload)
  - `progress-view` - Timeline of all items
  - `calendar-view` - Calendar with task indicators
  - `settings-view` - App configuration
  - `credits-view` - Algorithm information
- **Key Functions**:
  - `loadSurahPresets()` - Populate big surahs dropdown
  - `updateUnitTypeDependentFields()` - Update labels and show/hide start page
  - `initSurahPresetHandler()` - Handle surah preset selection

#### `calendar.js` - Calendar Component
- **Purpose**: Calendar view with task visualization
- **Features**:
  - Month navigation (RTL/LTR aware)
  - Task count indicators by priority
  - Date selection to view specific day
  - Progression filtering
- **Key Functions**:
  - `render()` - Render calendar grid for current month
  - `getTaskCountsForMonth()` - Calculate task counts per day
  - `selectDate()` - Navigate to selected date's tasks

#### `dialog.js` - Modal Dialogs
- **Purpose**: Creates confirmation and input dialogs
- **Dialog Types**:
  - Delete confirmation (single item or all)
  - Import/export confirmations
  - Reset confirmation
  - Add memorization modal (with surah preset, start page support)
  - PWA install prompt

#### `utils/svg.js` - SVG Icon Utilities
- **Purpose**: Safe SVG icon creation
- **Key Functions**:
  - `createCheckboxChecked()` / `createCheckboxUnchecked()` - Checkbox icons
  - `createSunIcon()` / `createMoonIcon()` - Theme toggle icons
  - `createMinusIcon()` / `createPlusIcon()` - Number input icons
  - `createBookIcon()` - Reading icon for task cards

#### `app.js` - Application Bootstrap
- **Purpose**: Application initialization and coordination
- **Responsibilities**:
  - Initialize all subsystems
  - Handle PWA install prompts
  - Coordinate module loading order
  - Restore application state

## Data Flow

### Application Initialization

```
1. app.js loads
2. QuranAPI.fetchSurahMetadata() - Fetch/cache surah metadata in background
3. Storage.getConfig() - Check for existing configuration
4. If config exists:
   - i18n.init(config.language)
   - Theme.init()
   - UI.initTabNavigation()
   - UI.showView(savedView)
   - UI.renderTodayView() or appropriate view renderer
5. If no config:
   - Show setup-view
   - UI.renderSetupView() - Loads surah presets into dropdown
```

### Daily Schedule Generation

```
1. User navigates to today-view
2. UI.renderTodayView(targetDate)
3. Algorithm.getDailySchedule(targetDate, allItems, config)
   - Calculates new memorization items for target date
   - Checks all items for reviews due on target date
   - Categorizes into: new_memorization, yesterday_review, spaced_review
4. Tasks sorted by priority and completion status
5. Components.createTaskCard() for each task
6. Rendered to DOM
```

### Task Completion Flow

```
1. User clicks checkbox on task card
2. Event handler in Components.createTaskCard()
3. Storage.isReviewCompleted() - Check current status
4. Storage.markReviewComplete() or Storage.unmarkReviewComplete()
5. UI.renderTodayView() - Re-render to update UI
```

### Data Persistence

```
User Action → Storage Method → LocalStorage
- Config changes → Storage.saveConfig() → quran_memorization_config
- Item updates → Storage.saveItem() → quran_memorization_items
- Review completion → Storage.markReviewComplete() → Updates item in quran_memorization_items
```

## Component Hierarchy

### HTML Structure

```
#app
├── #setup-view (hidden by default)
│   └── .container > .card > #setup-form
├── #today-view (hidden by default)
│   ├── .header
│   └── .main > .container
│       ├── #today-stats
│       └── #today-tasks
├── #progress-view (hidden by default)
│   ├── .header
│   └── .main > .container > #progress-timeline
├── #calendar-view (hidden by default)
│   ├── .header
│   └── .main > .container
│       ├── .calendar-header
│       ├── .calendar-filters
│       └── #calendar-grid
├── #settings-view (hidden by default)
│   └── .container > .card > #settings-form
├── #credits-view (hidden by default)
│   └── .main > .container > .card
└── #bottom-nav
    └── .nav-tab (5 tabs)
```

### Component Creation Pattern

Components are created dynamically using factory functions:

```javascript
// Example: Task Card Creation
const taskCard = Components.createTaskCard(item, stationNumber, priority);
// Returns: <div class="schedule-item"> with checkbox, title, station, priority badge
```

## Storage Schema

### Configuration Object

```javascript
{
  unit_type: 'page' | 'verse' | 'hizb' | 'juz',
  total_units: number,           // Total units to memorize
  start_date: 'YYYY-MM-DD',      // Start date string
  start_page: number,            // Start page number (only for page unit type, default: 1)
  progression_name: string,      // User-defined name
  language: 'en' | 'ar',
  theme: 'light' | 'dark',
  morning_hour: number,          // Hour (0-23) for morning review
  evening_hour: number,          // Hour (0-23) for evening review
  updated_at: ISO8601 string      // Timestamp
}
```

### Item Object

```javascript
{
  id: string,                    // Format: 'item-{unitType}-{number}-{date}'
  content_reference: string,      // e.g., "Page 1" (language-dependent)
  date_memorized: 'YYYY-MM-DD',  // Date string
  status: 'active' | 'archived',
  progression_name: string,       // Optional progression grouping
  reviews_completed: string[],    // Format: ['{station}-{date}', ...]
  reviews_missed: string[]        // Format: ['{station}-{date}', ...]
}
```

### Review Key Format

Reviews are tracked using keys: `{stationNumber}-{date}`

Example: `"1-2024-01-15"` means Station 1 review completed on January 15, 2024

## Algorithm Implementation

### 7-Station Review System

The algorithm implements spaced repetition with 7 review stations:

| Station | Timing | Offset (days) | Description |
|---------|--------|---------------|-------------|
| 1 | Day 0 Morning | 0 | Initial memorization |
| 2 | Day 0 Evening | 0 | Same-day evening review |
| 3 | Day 1 | 1 | 24-hour review |
| 4 | Day 4 | 4 | First gap (3 days after station 3) |
| 5 | Day 11 | 11 | Week gap (1 week after station 4) |
| 6 | Day 25 | 25 | Fortnight gap (2 weeks after station 5) |
| 7 | Day 55 | 55 | Monthly seal (1 month after station 6) |

### Review Date Calculation

```javascript
// For each station, calculate review date:
reviewDate = memorizationDate + offset

// Special handling for Station 1 & 2 (same day):
// Both use offset 0, distinguished by timeOfDay: 'morning' | 'evening'
```

### Daily Schedule Generation Logic

The `getDailySchedule()` function:

1. **New Memorization**: Items scheduled for the target date (1 unit per day)
2. **Yesterday's Review**: Items memorized exactly 1 day before target date (Station 3)
3. **Spaced Review**: Items with reviews due on target date (Stations 4-7)

**Priority System**:
- Priority 1: New memorization (most important)
- Priority 2: Yesterday's review (critical for retention)
- Priority 3: Spaced reviews (maintenance)

### Time-Based Filtering

For real-time "today" view:
- Morning tasks (Station 1) appear after `morning_hour`
- Evening tasks (Station 2) appear after `morning_hour` (both shown together on first day)
- Other stations appear after `morning_hour`

For selected dates (past or future):
- All tasks shown regardless of time

## View Management

### View Switching

Views are managed through CSS class `hidden`:

```javascript
// Show a view
UI.showView('today-view')
// 1. Hide all views (.view.hidden)
// 2. Show target view (remove .hidden)
// 3. Update tab active state
// 4. Save current view to localStorage
```

### View Lifecycle

Each view has a render function:
- `UI.renderSetupView()` - Initialize form with saved/default values
- `UI.renderTodayView(date)` - Generate and render daily schedule
- `UI.renderProgressView()` - Create timeline of all items
- `Calendar.render()` - Render calendar grid
- `UI.renderSettingsView()` - Initialize settings form

### State Persistence

- Current view saved to `quran_memorization_current_view`
- Restored on app initialization
- Setup view never saved (always shown if no config)

## Event Handling

### Event Listener Initialization

Event listeners are set up in `UI.initEventListeners()`:

- Form submissions (setup, settings)
- Button clicks (export, import, reset, add)
- Theme/language toggles
- Tab navigation (handled by `initTabNavigation()`)

### Event Delegation

Some events use direct element binding:
- Task checkboxes: Bound in `Components.createTaskCard()`
- Calendar day clicks: Bound in `Calendar.render()`
- Dialog buttons: Bound in `Dialog` methods

### Global Objects

Key objects exposed to `window` for cross-module access:
- `window.UI` - UI management
- `window.App` - Application instance
- `window.Calendar` - Calendar component
- `window.DateUtils` - Date utilities

## Module Dependencies

```
app.js
├── storage.js (no dependencies)
├── algorithm.js
│   └── DateUtils (internal)
├── i18n.js (no dependencies)
├── theme.js
│   └── storage.js
├── dialog.js
│   └── i18n.js
├── components.js
│   ├── storage.js
│   ├── algorithm.js
│   └── i18n.js
├── calendar.js
│   ├── storage.js
│   ├── algorithm.js
│   └── i18n.js
└── ui.js
    ├── storage.js
    ├── algorithm.js
    ├── i18n.js
    ├── theme.js
    ├── components.js
    └── calendar.js
```

## Multi-Platform Architecture

The application is designed as a **Universal Web App**, where a single core codebase powers multiple distribution platforms:

1.  **PWA (Web)**: The root directory serves as a Progressive Web Application.
2.  **Browser Extensions**: Located in `browser extensions/`, with specific subdirectories for `chrome/` and `firefox/`.
3.  **Android**: Located in `android/`, utilizing Capacitor/WebView to wrap the web assets.

### Platform Separation

*   **Core (`/js`, `/css`, `/assets`)**: Contains 100% of the application logic, styling, and static assets. This is the "source of truth".
*   **Platform Wrappers**:
    *   `browser extensions/*/src/popup/`: Contains the entry points (`popup.html`, `popup.css`) that adapt the core app for the extension's narrow popup context.
    *   `android/app/src/main/assets/public/`: The destination for core assets when building the mobile app.

### Synchronization Strategy

The project uses a **Synchronized Build Process**. Since the application uses vanilla JavaScript and CSS (no build step like Webpack/Vite), updates to the core are manually or automatically propagated to platform directories using shell commands:

```bash
# Example Synchronization Command
cp -r js/* "browser extensions/firefox/js/" && \
cp -r js/* "browser extensions/chrome/js/" && \
cp -r css/* "browser extensions/firefox/css/" && \
cp -r css/* "browser extensions/chrome/css/" && \
cp -r assets/* "browser extensions/firefox/assets/" && \
cp -r assets/* "browser extensions/chrome/assets/"
```

### Browser Extension Considerations

#### 1. Content Security Policy (CSP)
Extensions have strict CSP rules. To comply:
*   **Local Fonts**: External font loading (Google Fonts) is replaced by local assets in `assets/fonts/` and a dedicated `css/fonts.css`.
*   **Inline Scripts**: No inline scripts are used; all logic is in external `.js` files.
*   **API Access**: API domains (`api.alquran.cloud`) must be whitelisted in the `manifest.json` permissions.

#### 2. Layout Constraints
Extension popups are limited by the browser (usually 800x600px max). The `popup.css` in each extension folder overrides core container styles to:
*   Set fixed window dimensions (e.g., 380x600px).
*   Optimize scroll behavior for small viewports.
*   Ensure UI components (like Modals) scale correctly within the narrow window.

#### 3. Global Scope Compatibility
In extension environments, scripts might be evaluated in isolated contexts. To ensure reliable access across modules, core constants and components are explicitly attached to the `window` object:
```javascript
window.UIComponents = UIComponents;
window.PRIORITY = PRIORITY;
```

## Date and Time Strategy

### Local Time Strategy

All dates use device local time, not UTC:
- `DateUtils.normalizeDate()` - Sets time to 00:00:00 local
- `DateUtils.getLocalDateString()` - Returns 'YYYY-MM-DD' in local time
- `DateUtils.isSameLocalDay()` - Compares dates ignoring time
- `DateUtils.daysDifference()` - Calculates days between dates

This ensures:
- Tasks appear on correct local day
- No timezone-related bugs
- Consistent behavior across devices

## Item ID Strategy

Items use stable IDs that don't change with language:

Format: `item-{unitType}-{number}-{date}`

Example: `item-page-5-2024-01-15`

This allows:
- Language switching without losing data
- Duplicate detection and cleanup
- Reliable item lookup

