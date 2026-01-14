// Application Constants

/**
 * Default configuration values
 */
const DEFAULT_CONFIG = {
  UNIT_TYPE: 'page',
  TOTAL_UNITS: 30,
  MORNING_HOUR: 6,
  EVENING_HOUR: 20,
  THEME: 'light',
  LANGUAGE: 'ar',
  PROGRESSION_NAME: ''
};

/**
 * Task priority levels
 */
const PRIORITY = {
  NEW: 1,
  YESTERDAY: 2,
  SPACED: 3
};

/**
 * Time of day constants
 */
const TIME_OF_DAY = {
  MORNING: 'morning',
  EVENING: 'evening',
  ANY: 'any'
};

/**
 * Unit type options
 */
const UNIT_TYPES = {
  PAGE: 'page',
  VERSE: 'verse',
  HIZB: 'hizb',
  JUZ: 'juz'
};

/**
 * Station numbers (1-7)
 */
const STATIONS = {
  MIN: 1,
  MAX: 7,
  STATION_1: 1,
  STATION_2: 2,
  STATION_3: 3,
  STATION_4: 4,
  STATION_5: 5,
  STATION_6: 6,
  STATION_7: 7
};

/**
 * Review offsets in days from memorization date
 * Station 1: Day 0 AM, Station 2: Day 0 PM, Station 3: Day 1, etc.
 */
const REVIEW_OFFSETS = [0, 0, 1, 4, 11, 25, 55];

/**
 * Expected offsets for spaced reviews (Stations 4-7)
 */
const SPACED_REVIEW_OFFSETS = [4, 11, 25, 55];

/**
 * Spaced review station numbers
 */
const SPACED_REVIEW_STATIONS = [4, 5, 6, 7];

/**
 * Theme options
 */
const THEMES = {
  LIGHT: 'light',
  DARK: 'dark'
};

/**
 * Language options
 */
const LANGUAGES = {
  ENGLISH: 'en',
  ARABIC: 'ar'
};

/**
 * Item status values
 */
const ITEM_STATUS = {
  ACTIVE: 'active',
  ARCHIVED: 'archived'
};

/**
 * View IDs
 */
const VIEWS = {
  SETUP: 'setup-view',
  TODAY: 'today-view',
  PROGRESS: 'progress-view',
  CALENDAR: 'calendar-view',
  SETTINGS: 'settings-view',
  CREDITS: 'credits-view'
};
// Expose to window for use in other modules
window.DEFAULT_CONFIG = DEFAULT_CONFIG;
window.PRIORITY = PRIORITY;
window.TIME_OF_DAY = TIME_OF_DAY;
window.UNIT_TYPES = UNIT_TYPES;
window.STATIONS = STATIONS;
window.REVIEW_OFFSETS = REVIEW_OFFSETS;
window.THEMES = THEMES;
window.LANGUAGES = LANGUAGES;
window.ITEM_STATUS = ITEM_STATUS;
window.VIEWS = VIEWS;
