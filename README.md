# Monthly Quran

A simple web application for tracking Quran memorization using a spaced repetition system. The app helps you follow a 7-station review schedule based on memory retention principles.

## What It Does

The application tracks your daily memorization tasks and automatically schedules reviews at specific intervals. Each unit you memorize goes through 7 review stations over approximately 55 days, helping move content from short-term to long-term memory.

## How It Works

### The Algorithm

The app implements a 7-station spaced repetition system:

1. **Station 1** (Day 0 Morning): Initial memorization
2. **Station 2** (Day 0 Evening): Same-day evening review
3. **Station 3** (Day 1): 24-hour review
4. **Station 4** (Day 4): First gap review
5. **Station 5** (Day 11): Week gap review
6. **Station 6** (Day 25): Fortnight gap review
7. **Station 7** (Day 55): Monthly review

This schedule is based on the forgetting curve principle - each review happens just before you're likely to forget, reinforcing the memory pathway.

### Daily Workflow

Each day, the app shows you three types of tasks:

- **New Memorization**: The new unit scheduled for today (Priority 1)
- **Yesterday's Review**: The unit you memorized yesterday (Priority 2)
- **Spaced Reviews**: Older units that need review based on their station schedule (Priority 3)

You mark tasks as complete by checking them off. The app tracks your progress and schedules future reviews automatically.

### Data Storage

All your data is stored locally in your browser using LocalStorage. Nothing is sent to any server. You can export your data as a JSON file for backup or to transfer between devices.

## Technology Stack

This is a vanilla JavaScript application with no frameworks or build tools:

- **HTML5**: Semantic markup
- **CSS3**: Styling with CSS Variables for theming
- **JavaScript (ES6+)**: Vanilla JavaScript, no frameworks
- **LocalStorage API**: Client-side data persistence
- **Service Worker API**: Offline functionality and caching
- **Web App Manifest**: Progressive Web App support
- **Google Fonts**: IBM Plex Sans Arabic for Arabic text

### Browser APIs Used

- `localStorage` - Data persistence
- `serviceWorker` - Offline support
- `navigator.serviceWorker` - PWA functionality
- `window.matchMedia` - System theme detection
- `File API` - Data export/import
- `beforeinstallprompt` - PWA install prompts

### No Dependencies

The application uses zero external JavaScript libraries. Everything runs in the browser with standard web APIs.

## Getting Started

1. Open `index.html` in a web browser, or serve it using a local web server
2. Complete the initial setup:
   - Choose your unit type (page, verse, hizb, or juz)
   - Set total units to memorize
   - Select a start date
   - Optionally name your progression
   - Choose language and theme preferences
3. Start using the app - tasks will appear automatically based on your schedule

For detailed instructions, see the [User Guide](docs/USER_GUIDE.md).

## Features

- 7-station spaced repetition algorithm
- Daily task scheduling with priorities
- Progress tracking with visual timeline
- Calendar view with task indicators
- Bilingual interface (English/Arabic) with RTL support
- Light/dark theme with system preference detection
- Offline functionality via service worker
- Data export/import for backup and transfer
- Progressive Web App - can be installed on devices

## Documentation

Detailed documentation is available in the `docs/` folder:

- [Architecture](docs/ARCHITECTURE.md) - Application structure and design
- [Technical Details](docs/TECHNICAL.md) - Technology stack and implementation
- [User Guide](docs/USER_GUIDE.md) - How to use the application
- [Development Guide](docs/DEVELOPMENT.md) - For developers and contributors
- [Memorization Rules](docs/MemorizationRules.md) - Algorithm methodology

## Deployment

The app can be deployed to any static hosting service. For GitHub Pages:

1. Push the code to a GitHub repository
2. Go to Settings > Pages
3. Select the source branch and folder (root)
4. The app will be available at `https://username.github.io/repository-name`

**Important**: All file paths use relative paths (e.g., `./js/app.js`) to work correctly on GitHub Pages.

## Browser Support

Works in any modern browser with:
- Service Worker support
- LocalStorage support
- ES6+ JavaScript support

Tested and working in:
- Chrome/Edge
- Firefox
- Safari (iOS 11.3+)

## License

MIT License
