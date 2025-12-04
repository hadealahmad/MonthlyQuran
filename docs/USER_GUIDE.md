# User Guide

## Overview

This guide will help you get started with Monthly Quran and make the most of its features for tracking your Quran memorization progress.

## Table of Contents

- [Getting Started](#getting-started)
- [Understanding the 7-Station Algorithm](#understanding-the-7-station-algorithm)
- [Using the Today View](#using-the-today-view)
- [Tracking Progress](#tracking-progress)
- [Using the Calendar](#using-the-calendar)
- [Settings and Configuration](#settings-and-configuration)
- [Data Management](#data-management)
- [Troubleshooting](#troubleshooting)

## Getting Started

### First-Time Setup

When you first open the application, you'll see the setup screen. Here's what you need to configure:

1. **Unit Type**: Choose how you want to track your memorization
   - **Page**: Track by page (most common)
   - **Ayah**: Track by verse
   - **Hizb**: Track by hizb (1/60th of Quran)
   - **Juz**: Track by juz (1/30th of Quran)

2. **Total Units**: Enter how many units you plan to memorize
   - Example: If memorizing 30 pages, enter `30`

3. **Start Date**: Select when you want to begin memorization
   - This determines when your first unit is scheduled
   - Each day after start date, one new unit is scheduled

4. **Progression Name**: Give your memorization plan a name
   - Example: "Juz 1", "Surah Al-Baqarah", "First 30 Pages"
   - This helps if you track multiple progressions

5. **Language**: Choose your preferred interface language
   - **EN**: English (left-to-right)
   - **AR**: Arabic (right-to-left)

6. **Theme**: Choose your preferred color scheme
   - **Light**: Light background, dark text
   - **Dark**: Dark background, light text

7. Click **"Start Memorization"** to begin

### After Setup

Once setup is complete, you'll see the **Today** view with your daily tasks. The app will automatically:
- Create items for all planned units
- Schedule reviews according to the 7-station algorithm
- Show today's tasks based on your start date

## Understanding the 7-Station Algorithm

The application uses a scientifically-backed spaced repetition system with 7 review stations. Understanding this will help you use the app effectively.

### The Stations

Each unit you memorize goes through 7 review stations over approximately 55 days:

1. **Station 1 (Morning)**: Day 0 - Initial memorization in the morning
2. **Station 2 (Evening)**: Day 0 - Same-day evening review
3. **Station 3 (24-Hour Review)**: Day 1 - Review the next day
4. **Station 4 (First Gap)**: Day 4 - Review 3 days after Station 3
5. **Station 5 (Week Gap)**: Day 11 - Review 1 week after Station 4
6. **Station 6 (Fortnight Gap)**: Day 25 - Review 2 weeks after Station 5
7. **Station 7 (Monthly Seal)**: Day 55 - Review 1 month after Station 6

### Why This Works

The algorithm is based on the **Forgetting Curve** principle:
- Without review, we forget information rapidly
- Each review "resets" the forgetting curve
- Spaced reviews move content from short-term to long-term memory
- By Station 7, the content is firmly in long-term memory

### Daily Workflow

On any given day, you'll have three types of tasks:

1. **New Memorization** (Priority 1 - Blue badge)
   - The new unit scheduled for today
   - Most important - do this first

2. **Yesterday's Review** (Priority 2 - Orange badge)
   - The unit you memorized yesterday
   - Critical for retention - do this second

3. **Spaced Review** (Priority 3 - Green badge)
   - Older units that need review based on their station schedule
   - Maintenance reviews - do these after new memorization

## Using the Today View

The Today view is your main workspace. It shows all tasks scheduled for the selected day.

### Task Cards

Each task is displayed as a card showing:
- **Content Reference**: The unit name (e.g., "Page 5")
- **Station Number**: Which review station this is
- **Priority Badge**: Visual indicator of task priority
- **Checkbox**: Mark task as complete

### Completing Tasks

1. Click the checkbox on a task card to mark it complete
2. The card will show a checkmark and gray out
3. Click again to unmark if you made a mistake

### Task Sorting

Tasks are automatically sorted:
- **Uncompleted tasks first** (by priority)
- **Completed tasks last** (by priority)
- Within each group, sorted by content reference

### Viewing Different Days

- **Today**: Shows current day's tasks
- **Calendar**: Tap the Calendar tab, then tap any date to view that day's tasks
- **Navigation**: The Today tab label changes to show the day name when viewing a past/future date

### Time-Based Filtering

For the current day (today):
- Morning tasks appear after your configured morning hour (default 6:00 AM)
- Evening tasks appear after morning hour (both shown together on first day)
- Other stations appear after morning hour

For past or future dates:
- All tasks are shown regardless of time

## Tracking Progress

### Progress View

The Progress view shows a timeline of all your memorization items.

### Timeline Items

Each item displays:
- **Content Reference**: The unit name
- **Current Station**: Which station you're currently on
- **Next Review Date**: When the next review is scheduled
- **Station Indicators**: Visual progress through all 7 stations

### Station Indicators

The 7 circles show your progress:
- **Completed** (filled): Station review completed
- **Current** (highlighted): Your current station
- **Upcoming** (outline): Future stations not yet reached

### Adding New Progressions

1. Tap the **+** button in the Progress view header
2. Fill in the form (same as initial setup)
3. The new progression will be added to your timeline

### Deleting Items

1. Long-press or right-click on a timeline item
2. Choose:
   - **Delete this item only**: Remove just this unit
   - **Delete all items**: Remove all memorization data (use with caution)

## Using the Calendar

The Calendar view provides a visual overview of your schedule.

### Calendar Features

- **Month Navigation**: Use arrow buttons to move between months
- **Task Indicators**: Colored circles show task counts for each day
  - **Blue**: New memorization tasks
  - **Orange**: Yesterday review tasks
  - **Green**: Spaced review tasks
- **Today Highlight**: Current day is highlighted
- **Selected Date**: The date you're viewing in Today view is marked

### Selecting a Date

1. Tap any date on the calendar
2. The app switches to Today view showing that date's tasks
3. The Today tab label shows the day name

### Progression Filtering

Use the dropdown at the top to filter by progression:
- **All Progressions**: Show all tasks
- **[Progression Name]**: Show only tasks for that progression

### RTL/LTR Navigation

In Arabic (RTL) mode:
- Left arrow (visually right) = Next month
- Right arrow (visually left) = Previous month

In English (LTR) mode:
- Left arrow = Previous month
- Right arrow = Next month

## Settings and Configuration

### Accessing Settings

Tap the **Settings** tab in the bottom navigation.

### Available Settings

1. **Language**: Switch between English and Arabic
   - Changes take effect immediately
   - All text updates automatically

2. **Theme**: Switch between Light and Dark mode
   - Changes take effect immediately
   - Preference is saved

3. **Morning Review Hour**: Set when morning tasks appear
   - Default: 6:00 AM
   - Format: 24-hour time (HH:MM)

4. **Evening Review Hour**: Set when evening tasks appear
   - Default: 8:00 PM
   - Format: 24-hour time (HH:MM)

### Data Management

#### Export Data

1. Tap **"Export Data"**
2. A JSON file will download
3. Save this file in a safe place as a backup

**What's Exported**:
- Your configuration
- All memorization items
- Review completion status
- Export timestamp

#### Import Data

1. Tap **"Import Data"**
2. Select your backup JSON file
3. Confirm the import
4. All current data will be replaced with imported data

**Warning**: Importing will overwrite all current data. Make sure you have a backup if needed.

#### Reset Application

1. Tap **"Reset Application"**
2. Confirm the reset
3. All data will be deleted
4. You'll return to the setup screen

**Warning**: This action cannot be undone. Export your data first if you want to keep it.

## Data Management

### Automatic Saving

All your data is automatically saved to your device's browser storage:
- Tasks marked complete are saved immediately
- Settings changes are saved immediately
- No manual save button needed

### Data Location

Data is stored in your browser's LocalStorage:
- **Desktop**: Browser's local storage
- **Mobile**: Browser's local storage
- **PWA**: Same as browser storage

### Data Privacy

- All data stays on your device
- No data is sent to any server
- No internet connection required (after first load)
- You have full control via export/import

### Backup Recommendations

1. **Regular Backups**: Export your data weekly or monthly
2. **Before Major Changes**: Export before resetting or importing
3. **Multiple Devices**: Export and import to sync between devices
4. **Safe Storage**: Keep backup files in cloud storage or multiple locations

### Syncing Between Devices

Currently, syncing must be done manually:
1. Export data on Device A
2. Transfer file to Device B (email, cloud, etc.)
3. Import data on Device B

**Note**: This will replace Device B's data with Device A's data.

## Troubleshooting

### Tasks Not Appearing

**Problem**: Tasks don't show up for today

**Solutions**:
- Check that your start date is today or in the past
- Verify you've completed setup
- Check if you're viewing the correct date (tap Calendar to see)
- Ensure morning hour has passed (for today's tasks)

### Completed Tasks Still Showing

**Problem**: Tasks marked complete still appear

**Solutions**:
- Refresh the page
- Check that you're viewing the correct date
- Verify the task wasn't unmarked accidentally

### Data Lost

**Problem**: Your memorization data is gone

**Solutions**:
- Check if you accidentally reset the app
- Look for a backup file you exported
- Check browser storage (some browsers clear storage on certain conditions)
- If using multiple browsers, data is separate per browser

### Calendar Not Loading

**Problem**: Calendar view is blank or broken

**Solutions**:
- Refresh the page
- Check browser console for errors
- Ensure JavaScript is enabled
- Try a different browser

### Theme Not Changing

**Problem**: Theme toggle doesn't work

**Solutions**:
- Refresh the page
- Check browser console for errors
- Clear browser cache and reload
- Try a different browser

### Language Not Changing

**Problem**: Language toggle doesn't work

**Solutions**:
- Refresh the page
- Check that translations are loading
- Clear browser cache
- Try a different browser

### PWA Install Not Working

**Problem**: Can't install as PWA

**Solutions**:
- Ensure you're using HTTPS (or localhost)
- Check that manifest.json is accessible
- Verify service worker is registered
- Some browsers require user interaction before showing install prompt
- Check browser's installability criteria

### Offline Not Working

**Problem**: App doesn't work offline

**Solutions**:
- Visit the app online first (to cache resources)
- Wait for service worker to install
- Check that service worker is registered (browser DevTools)
- Clear cache and reload online, then try offline

### Date Issues

**Problem**: Tasks appear on wrong days

**Solutions**:
- Check your device's date/time settings
- Ensure timezone is correct
- The app uses device local time, not UTC
- Refresh the page after changing device time

### Performance Issues

**Problem**: App is slow or laggy

**Solutions**:
- Close other browser tabs
- Clear browser cache
- Check available storage space
- If you have many items (1000+), consider archiving old progressions
- Try a different browser

### Browser Compatibility

**Minimum Requirements**:
- Service Worker support
- LocalStorage support
- ES6 JavaScript support
- CSS Variables support

**Recommended Browsers**:
- Chrome/Edge (best support)
- Firefox
- Safari (iOS 11.3+)

If you experience issues, try a different browser.

## Tips for Effective Use

### Daily Routine

1. **Morning**: Complete new memorization and morning reviews
2. **Evening**: Complete evening reviews
3. **Throughout Day**: Complete spaced reviews when convenient

### Staying Consistent

- Check the app daily
- Complete tasks in priority order
- Don't skip yesterday's review (critical for retention)
- Use the calendar to plan ahead

### Managing Multiple Progressions

- Use descriptive progression names
- Filter by progression in Calendar view
- Track different units (pages, verses, etc.) as separate progressions

### Long-Term Success

- Trust the algorithm - it's based on science
- Don't rush - quality over quantity
- Review even when it feels easy (it's reinforcing memory)
- Use the progress view to see your overall advancement

### Getting Help

If you encounter issues not covered here:
1. Check the browser console for error messages
2. Try the troubleshooting steps above
3. Export your data before trying fixes
4. Check the [Technical Documentation](TECHNICAL.md) for implementation details

