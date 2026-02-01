# Monthly Quran

<p align="center">
  <a href="https://play.google.com/store/apps/details?id=com.monthlyquran.app">
    <img src="https://img.shields.io/badge/Google_Play-414141?style=for-the-badge&logo=google-play&logoColor=white" alt="Get it on Google Play" height="50">
  </a>
  &nbsp;&nbsp;
  <a href="https://chromewebstore.google.com/detail/djhcclihfkoijibblmhgfoomibieokma?utm_source=item-share-cb">
    <img src="https://img.shields.io/badge/Chrome_Web_Store-4285F4?style=for-the-badge&logo=google-chrome&logoColor=white" alt="Available on Chrome Web Store" height="50">
  </a>
  &nbsp;&nbsp;
  <a href="https://addons.mozilla.org/en-US/firefox/addon/monthly-quran-%D8%A7%D9%84%D9%82%D8%B1%D8%A2%D9%86-%D8%A7%D9%84%D8%B4%D9%87%D8%B1%D9%8A/">
    <img src="https://img.shields.io/badge/Firefox_Add--ons-FF7139?style=for-the-badge&logo=firefox-browser&logoColor=white" alt="Get the Firefox Add-on" height="50">
  </a>
  &nbsp;&nbsp;
  <a href="https://hadealahmad.github.io/MonthlyQuran/">
    <img src="https://img.shields.io/badge/Web_App-0078D4?style=for-the-badge&logo=pwa&logoColor=white" alt="Open Web App" height="50">
  </a>
</p>

---

A simple, cross-platform application for tracking Quran memorization using a spaced repetition system. The app helps you follow a 7-station review schedule based on memory retention principles.

It is available as:
- **PWA (Progressive Web App)** for any browser.
- **Chrome Extension** for desktop workflow.
- **Firefox Add-on** for privacy-focused browsing.
- **Android App** for mobile experience.

## What It Does

The application tracks your daily memorization tasks and automatically schedules reviews at specific intervals. Each unit you memorize goes through 7 review stations over approximately 55 days, helping move content from short-term to long-term memory.

## Architecture: "Write Once, Sync Everywhere"

This project uses a unified codebase located in `core/`.
- **`core/`**: Contains all logic (`js`), structure (`html` logic), styles (`css`), and assets.
- **`chrome/`, `firefox/`, `www/`**: Platform wrappers that receive code from `core/`.
- **`scripts/`**: Build and synchronization tooling.

For a detailed deep-dive on the architecture and how to replicate it, read [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) and [agent/abstract.md](agent/abstract.md).

## Getting Started (Development)

### Prerequisites
- Node.js (v18+)
- NPM
- (Optional) Android SDK for mobile builds

### One-Command Build
To build the project for **ALL** platforms at once:
```bash
npm run build
```
This command will:
1. Sync the version numbers across all manifests and config files.
2. Sync the `core/` code to all platform directories.
3. Package the Chrome Extension (`build/chrome-x.x.x.zip`).
4. Package the Firefox Extension (`build/firefox-x.x.x.zip`).
5. Sync the Android Capacitor project and build the APK (`android/app/build/outputs/apk/debug/app-debug.apk`).

### Running the Android App
To launch the Android emulator without opening Android Studio:
```bash
npm run android:run
```
*Note: Ensure `ANDROID_HOME` is set in your environment or editing the script.*

## Project Structure

```
/
├── core/                  # SINGLE SOURCE OF TRUTH (Edit code here!)
│   ├── js/                # Shared Logic & Adapters
│   ├── css/               # Shared Styles
│   └── assets/            # Shared Icons
├── chrome/                # Chrome Extension Wrapper
├── firefox/               # Firefox Extension Wrapper
├── www/                   # Web/PWA Wrapper
├── android/               # Native Android Project (Capacitor)
└── scripts/               # Automation Scripts
```

## Features

- **7-station spaced repetition algorithm**
- **Cross-Platform**: Seamless experience on Mobile, Web, and Desktop.
- **Offline First**: Works fully offline via Service Workers and Local Storage.
- **Cloud-Free**: Your data stays on your device (LocalStorage / Chrome Storage).
- **Native Android Feel**: Hardware back button support and native notifications.
- **Quran API Integration**: Fetches metadata for intuitive setup.
- **Data Export/Import**: JSON-based backup system.

## Algorithm Credits

This application implements the **7-Station Spaced Repetition Algorithm** for Quran memorization, developed by **Dr. Wafaa Orabi** (د. وفاء عرابي).

The algorithm is based on scientific principles of memory retention, specifically the **Forgetting Curve** discovered by Hermann Ebbinghaus. Instead of mass repetition (cramming), the system uses spaced repetition at calculated intervals to move content from short-term to long-term memory through 7 review stations over approximately one month.

Each station represents a calculated timing for repetition to enhance permanent memorization: repeating the text several hours after the initial memorization, then reviews after days and weeks. This transfers information from short-term to long-term memory, utilizing the forgetting curve and effective repetitive learning techniques.

📞 **Contact**: [Dr. Wafaa Orabi's Telegram Channel](https://t.me/wafaa_oraby_coach)

## Documentation

Detailed documentation is available in the `docs/` folder:

- [Architecture](docs/ARCHITECTURE.md) - Deep dive into structure and sync logic.
- [Abstract for AI Agents](agent/abstract.md) - High-level conceptual guide for replicating this architecture.
- [User Guide](docs/USER_GUIDE.md) - How to use the application.
- [Development Guide](docs/DEVELOPMENT.md) - For contributors.
- [Memorization Rules](docs/MemorizationRules.md) - Algorithm methodology.

## License

MIT License
