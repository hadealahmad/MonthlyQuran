# Development Guide

## Overview

This guide is for developers who want to understand, modify, or contribute to the Monthly Quran application.

## Table of Contents

- [Development Setup](#development-setup)
- [Code Structure](#code-structure)
- [Coding Conventions](#coding-conventions)
- [Adding New Features](#adding-new-features)
- [Testing](#testing)
- [Multi-Platform Support](#multi-platform-support)
- [Contributing](#contributing)

## Development Setup

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, or Edge)
- A text editor or IDE
- A local web server (optional, for testing service worker)

### Getting Started

1. **Clone or download the repository**
   ```bash
   git clone <repository-url>
   cd MonthlyQuran
   ```

2. **Open in browser**
   - Simply open `index.html` in your browser
   - Or use a local server:
     ```bash
     # Python 3
     python -m http.server 8000
     
     # Node.js (with http-server)
     npx http-server
     
     # PHP
     php -S localhost:8000
     ```

3. **Access the application**
   - Direct file: `file:///path/to/index.html`
   - Local server: `http://localhost:8000`

### Service Worker Development

For service worker testing, you **must** use a local server (not `file://`):
- Service workers only work over HTTP/HTTPS
- Use `localhost` for development
- HTTPS required for production

### Browser DevTools

Recommended tools for development:
- **Console**: Check for JavaScript errors
- **Application Tab**: 
  - LocalStorage inspection
  - Service Worker status
  - Cache inspection
- **Network Tab**: Monitor resource loading
- **Elements Tab**: Inspect DOM and CSS

## Code Quality Standards

### Constants
- All magic numbers and strings should be defined in `js/constants.js`
- Use constants from the constants file instead of hardcoded values
- Example: Use `DEFAULT_CONFIG.TOTAL_UNITS` instead of `30`

### Logging
- Use `Logger.error()`, `Logger.warn()`, `Logger.info()`, or `Logger.debug()` instead of `console.*`
- Logger automatically handles development/production modes
- Example: `Logger.error('Error message:', error)`

### DOM Manipulation
- Use `DOMCache.getElementById()` for frequently accessed elements
- Use `DocumentFragment` for batch DOM updates
- Prefer `textContent` over `innerHTML` for text-only updates
- Use `SVGUtils` for creating SVG icons instead of innerHTML

### Array Operations
- Use `Map` or `Set` for O(1) lookups when possible
- Combine multiple filter/find chains into single loops
- Prefer `for...of` loops over `forEach()` when early break is needed

### Function Size
- Keep functions under 50 lines when possible
- Split large functions into smaller, focused helper functions
- Use descriptive function names that indicate purpose

### Performance
- Debounce rapid user interactions (e.g., calendar navigation)
- Use memoization for expensive calculations
- Batch DOM updates using DocumentFragment
- Cache frequently accessed DOM elements

## Multi-Platform Support

This project follows a "Single Core, Multiple Wrappers" architecture. The code you edit in `js/` and `css/` powers:
*   The PWA (Web)
*   Chrome & Firefox Extensions
*   Android Mobile App

**Important**: After making changes to the core files, you MUST synchronize them to the platform-specific directories. See [Synchronization Process](SYNC_PROCESS.md) for the specific commands and details.

## Code Structure

### File Organization

```
MonthlyQuran/
├── index.html              # Main HTML structure
├── manifest.json           # PWA manifest
├── sw.js                   # Service worker
├── css/
│   ├── themes.css         # CSS variables and theme definitions
│   ├── components.css      # Component-specific styles
│   ├── styles.css         # Global styles and layout
│   └── navigation.css     # Navigation and tab styles
├── js/
│   ├── app.js             # Application entry point
│   ├── storage.js         # Data persistence layer
│   ├── quran-api.js       # Quran API integration
│   ├── algorithm.js       # Spaced repetition algorithm
│   ├── i18n.js            # Internationalization
│   ├── theme.js           # Theme management
│   ├── components.js      # UI component factory
│   ├── ui.js              # View management and rendering
│   ├── calendar.js        # Calendar component
│   ├── dialog.js          # Modal dialogs
│   └── utils/
│       ├── logger.js      # Logging utility
│       ├── svg.js         # SVG icon creation
│       └── debounce.js    # Debounce utility
└── docs/
    └── *.md               # Documentation files
```

### Module Loading Order

Scripts are loaded in this order (in `index.html`):

1. `constants.js` - Application constants
2. `utils/logger.js` - Logging utility
3. `utils/svg.js` - SVG icon utilities
4. `utils/debounce.js` - Debounce utility
5. `storage.js` - No dependencies
6. `quran-api.js` - Uses Storage, Logger
7. `algorithm.js` - Uses DateUtils (internal)
8. `i18n.js` - No dependencies
9. `theme.js` - Uses Storage
10. `dialog.js` - Uses i18n, SVGUtils
11. `components.js` - Uses Storage, Algorithm, i18n, SVGUtils, QuranAPI
12. `calendar.js` - Uses Storage, Algorithm, i18n
13. `ui.js` - Uses all above modules
14. `app.js` - Uses all above modules

**Important**: Maintain this order when adding new scripts.

### Module Dependencies

```
constants.js     (no dependencies)
utils/logger.js  (no dependencies)
utils/svg.js     (no dependencies)
utils/debounce.js (no dependencies)
storage.js       (no dependencies)
quran-api.js     → storage.js, logger.js
algorithm.js     (no dependencies, exposes DateUtils)
i18n.js          (no dependencies)
theme.js         → storage.js
dialog.js        → i18n.js, SVGUtils
components.js    → storage.js, algorithm.js, i18n.js, SVGUtils, QuranAPI
calendar.js      → storage.js, algorithm.js, i18n.js
ui.js            → storage.js, algorithm.js, i18n.js, theme.js, components.js, calendar.js, QuranAPI
app.js           → all modules
```

## Coding Conventions

### JavaScript Style

**Object Literals** (preferred over classes):
```javascript
const MyModule = {
  property: 'value',
  
  method() {
    // Method implementation
  }
};
```

**Function Declarations**:
```javascript
// Prefer method syntax in objects
const Module = {
  myMethod() {
    // Implementation
  }
};

// For standalone functions
function myFunction() {
  // Implementation
}
```

**Variable Naming**:
- `camelCase` for variables and functions
- `UPPER_SNAKE_CASE` for constants
- Descriptive names, avoid abbreviations

**Comments**:
```javascript
// Single-line comments for brief explanations

/**
 * Multi-line comments for complex logic
 * or function documentation
 */
```

### CSS Style

**CSS Variables** (for theming):
```css
[data-theme="light"] {
  --variable-name: value;
}
```

**Class Naming**:
- `kebab-case` for class names
- BEM-like structure: `.component-element-modifier`
- Example: `.schedule-item-title`, `.btn-primary`

**Organization**:
- Group related styles together
- Use comments to separate sections
- Follow the existing file structure

### HTML Structure

**Semantic HTML**:
```html
<main class="main">
  <div class="container">
    <!-- Content -->
  </div>
</main>
```

**Data Attributes**:
- `data-i18n`: Translation keys
- `data-i18n-aria`: Aria label translations
- `data-view`: View identifiers
- `data-value`: Toggle values

**Accessibility**:
- Use semantic elements (`<nav>`, `<main>`, `<header>`)
- Include `aria-label` attributes
- Ensure keyboard navigation works

### Code Organization Patterns

**Module Pattern**:
```javascript
const ModuleName = {
  // Private-like variables (not truly private)
  internalState: null,
  
  // Public methods
  init() {
    // Initialization
  },
  
  publicMethod() {
    // Implementation
  }
};
```

**Global Exposure** (when needed):
```javascript
// At end of module
window.ModuleName = ModuleName;
```

**Event Handling**:
```javascript
// Direct binding in component creation
element.addEventListener('click', (e) => {
  // Handler
});

// Or in initEventListeners
UI.initEventListeners = function() {
  const button = document.getElementById('my-button');
  button.addEventListener('click', this.handleClick);
};
```

## Utility Functions

### Logger (`js/utils/logger.js`)
- `Logger.error(message, error)`: Log errors (development only)
- `Logger.warn(message, data)`: Log warnings (development only)
- `Logger.info(message, data)`: Log info messages (development only)
- `Logger.debug(message, data)`: Log debug messages (development only)

### Debounce (`js/utils/debounce.js`)
- `debounce(func, wait, immediate)`: Debounce a function call
- Example: `const debouncedFn = debounce(() => doSomething(), 300)`

### SVG Utils (`js/utils/svg.js`)
- `SVGUtils.createCheckboxChecked()`: Create checked checkbox icon
- `SVGUtils.createCheckboxUnchecked()`: Create unchecked checkbox icon
- `SVGUtils.createSunIcon()`: Create sun icon
- `SVGUtils.createMoonIcon()`: Create moon icon
- `SVGUtils.createMinusIcon()`: Create minus icon
- `SVGUtils.createPlusIcon()`: Create plus icon
- `SVGUtils.createBookIcon()`: Create book/read icon for task cards

### DOMCache (`js/ui.js`)
- `DOMCache.getElementById(id)`: Get element by ID (cached)
- `DOMCache.querySelectorAll(selector, useCache)`: Query elements (optionally cached)
- `DOMCache.clear(key)`: Clear cache entry or all cache

## Adding New Features

### Adding a New View

1. **Add HTML structure** in `index.html`:
   ```html
   <div id="new-view" class="view hidden">
     <!-- View content -->
   </div>
   ```

2. **Add navigation tab** (if needed):
   ```html
   <button class="nav-tab" data-view="new-view">
     <!-- Tab content -->
   </button>
   ```

3. **Add render function** in `ui.js`:
   ```javascript
   renderNewView() {
     const config = Storage.getConfig();
     // Render logic
   }
   ```

4. **Add view switching** in `UI.initTabNavigation()`:
   ```javascript
   if (viewId === 'new-view') {
     this.renderNewView();
   }
   ```

5. **Add translations** in `i18n.js`:
   ```javascript
   en: {
     newView: {
       title: 'New View Title'
     }
   }
   ```

### Adding a New Component

1. **Add component factory** in `components.js`:
   ```javascript
   createNewComponent(data) {
     const element = document.createElement('div');
     element.className = 'new-component';
     // Build component
     return element;
   }
   ```

2. **Add styles** in `components.css`:
   ```css
   .new-component {
     /* Styles */
   }
   ```

3. **Use component** in view renderer:
   ```javascript
   const component = Components.createNewComponent(data);
   container.appendChild(component);
   ```

### Adding a New Translation

1. **Add to translations object** in `i18n.js`:
   ```javascript
   en: {
     newKey: 'English text',
     nested: {
       key: 'Nested text'
     }
   },
   ar: {
     newKey: 'النص العربي',
     nested: {
       key: 'نص متداخل'
     }
   }
   ```

2. **Use in HTML**:
   ```html
   <span data-i18n="newKey">Default text</span>
   ```

3. **Use in JavaScript**:
   ```javascript
   const text = i18n.t('newKey');
   const nested = i18n.t('nested.key');
   ```

### Modifying the Algorithm

The algorithm is in `algorithm.js`. Key functions:

- `calculateReviewDates()`: Generates review dates
- `getDailySchedule()`: Creates daily task list
- `getProgressStats()`: Calculates statistics

**Review Offsets**:
```javascript
const REVIEW_OFFSETS = [0, 0, 1, 4, 11, 25, 55];
```

To modify intervals, update this array and update documentation.

### Adding Storage Functionality

1. **Add storage key** (if needed):
   ```javascript
   const STORAGE_KEYS = {
     // ... existing keys
     NEW_KEY: 'quran_memorization_new_key'
   };
   ```

2. **Add methods** in `storage.js`:
   ```javascript
   saveNewData(data) {
     try {
       localStorage.setItem(STORAGE_KEYS.NEW_KEY, JSON.stringify(data));
       return true;
     } catch (error) {
       console.error('Error saving:', error);
       return false;
     }
   }
   ```

### Adding a New Dialog

1. **Add dialog method** in `dialog.js`:
   ```javascript
   showNewDialog(onConfirm, onCancel) {
     const overlay = document.createElement('div');
     overlay.className = 'dialog-overlay';
     // Build dialog
     document.body.appendChild(overlay);
   }
   ```

2. **Use dialog**:
   ```javascript
   Dialog.showNewDialog(
     () => { /* on confirm */ },
     () => { /* on cancel */ }
   );
   ```

## Testing

### Manual Testing

Since there's no automated test suite, manual testing is essential:

1. **Functionality Testing**:
   - Test each feature in isolation
   - Test feature interactions
   - Test edge cases

2. **Browser Testing**:
   - Test in Chrome/Edge
   - Test in Firefox
   - Test in Safari (if possible)
   - Test on mobile browsers

3. **PWA Testing**:
   - Test service worker registration
   - Test offline functionality
   - Test install prompt
   - Test caching behavior

4. **Data Testing**:
   - Test with empty data
   - Test with large datasets
   - Test data export/import
   - Test data migration (if applicable)

### Testing Checklist

Before submitting changes:

- [ ] All features work as expected
- [ ] No console errors
- [ ] Works in multiple browsers
- [ ] Responsive design works
- [ ] RTL/LTR switching works
- [ ] Theme switching works
- [ ] Service worker works offline
- [ ] Data persists correctly
- [ ] Export/import works
- [ ] No performance regressions

### Debugging

**Console Logging**:
```javascript
// Use console.log for debugging
console.log('Debug info:', data);

// Use console.error for errors
console.error('Error:', error);
```

**Breakpoints**:
- Use browser DevTools debugger
- Set breakpoints in source code
- Step through execution

**LocalStorage Inspection**:
- Use DevTools Application tab
- Inspect stored data
- Manually modify for testing (be careful)

## Contributing

### Getting Started

1. **Fork or clone the repository**
2. **Create a branch** for your changes
3. **Make your changes** following coding conventions
4. **Test thoroughly**
5. **Document your changes** (if needed)

### Code Review Guidelines

**Before Submitting**:
- Code follows existing style
- No console errors
- Works in multiple browsers
- Documentation updated (if needed)
- No breaking changes (unless intentional)

**Pull Request**:
- Clear description of changes
- Explain why changes were made
- Reference any related issues
- Include screenshots (for UI changes)

### Areas for Contribution

**Potential Improvements**:
- Performance optimizations
- Accessibility enhancements
- Additional language support
- UI/UX improvements
- Bug fixes
- Documentation improvements

**Feature Ideas**:
- Multiple progressions management
- Statistics and analytics
- Reminder notifications
- Cloud sync (requires backend)
- Social features (requires backend)

### Code of Conduct

- Be respectful and constructive
- Focus on code quality
- Help others learn
- Follow existing patterns
- Ask questions if unsure

## Common Patterns

### Creating a Toggle Component

```javascript
// HTML
<div class="toggle-options" id="my-toggle">
  <button class="toggle-option" data-value="option1">Option 1</button>
  <button class="toggle-option" data-value="option2">Option 2</button>
</div>

// JavaScript
function initToggle(toggleId, defaultValue, onChange) {
  const toggle = document.getElementById(toggleId);
  const options = toggle.querySelectorAll('.toggle-option');
  
  // Set initial value
  options.forEach(btn => {
    if (btn.getAttribute('data-value') === defaultValue) {
      btn.classList.add('active');
    }
  });
  
  // Handle clicks
  options.forEach(btn => {
    btn.addEventListener('click', () => {
      options.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const value = btn.getAttribute('data-value');
      if (onChange) onChange(value);
    });
  });
}
```

### Creating a Form

```javascript
// HTML
<form id="my-form">
  <div class="form-group">
    <label for="my-input">Label</label>
    <input type="text" id="my-input" class="input" required>
  </div>
  <button type="submit" class="btn btn-primary">Submit</button>
</form>

// JavaScript
const form = document.getElementById('my-form');
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const value = document.getElementById('my-input').value;
  // Handle submission
});
```

### Creating a Modal

```javascript
function showModal(title, content, onConfirm, onCancel) {
  const overlay = document.createElement('div');
  overlay.className = 'dialog-overlay';
  overlay.style.cssText = '/* styles */';
  
  const dialog = document.createElement('div');
  dialog.className = 'dialog';
  // Build dialog content
  
  overlay.appendChild(dialog);
  document.body.appendChild(overlay);
  
  // Close handlers
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      overlay.remove();
      if (onCancel) onCancel();
    }
  });
}
```

## Performance Considerations

### Optimization Tips

1. **Minimize DOM Manipulation**:
   - Batch DOM updates
   - Use `innerHTML` for large updates
   - Cache DOM references

2. **Efficient Rendering**:
   - Only render active view
   - Lazy load components when possible
   - Debounce frequent operations

3. **Storage Efficiency**:
   - Don't store unnecessary data
   - Clean up old data periodically
   - Use efficient data structures

4. **Event Handling**:
   - Remove event listeners when not needed
   - Use event delegation when appropriate
   - Avoid memory leaks

## Security Considerations

### Client-Side Only

Since this is a client-side only application:
- No server-side validation needed
- No authentication required
- All security is browser-based

### Data Privacy

- All data stored locally
- No data transmission
- User controls all data via export/import

### Best Practices

- Validate user input (even client-side)
- Sanitize data before storage
- Handle errors gracefully
- Don't expose sensitive data in console

## Deployment

See [Technical Documentation](TECHNICAL.md#build-and-deployment) for deployment details.

### Pre-Deployment Checklist

- [ ] All features tested
- [ ] No console errors
- [ ] Service worker updated (if changed)
- [ ] Cache version updated (if changed)
- [ ] Manifest updated (if changed)
- [ ] All paths are relative
- [ ] Documentation updated

### Version Management

When making significant changes:
1. Update service worker cache name
2. Update manifest version (if tracking)
3. Update documentation
4. Test thoroughly before deploying

