// Spaced Repetition Algorithm Implementation

// Review intervals in days from memorization date
// Station 1: Day 0 AM, Station 2: Day 0 PM, Station 3: Day 1, Station 4: Day 4, etc.
// Note: REVIEW_OFFSETS is now defined in constants.js

// Date utility functions using device local time
const DateUtils = {
  // Normalize a date to local midnight (0,0,0,0)
  normalizeDate(date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
  },

  // Get local date string in YYYY-MM-DD format (not UTC)
  getLocalDateString(date) {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  },

  // Check if two dates are the same local day
  isSameLocalDay(date1, date2) {
    const d1 = this.normalizeDate(date1);
    const d2 = this.normalizeDate(date2);
    return d1.getTime() === d2.getTime();
  },

  // Calculate days difference between two dates (normalized to local midnight)
  daysDifference(date1, date2) {
    const d1 = this.normalizeDate(date1);
    const d2 = this.normalizeDate(date2);
    return Math.floor((d1 - d2) / (1000 * 60 * 60 * 24));
  }
};

const Algorithm = {
  // Memoization cache for schedule calculations
  _scheduleCache: new Map(),
  _cacheMaxSize: 50, // Limit cache size to prevent memory issues
  
  /**
   * Generate hash for items array to detect changes
   * @param {Array} items - Items array
   * @returns {string} Hash string
   */
  _hashItems(items) {
    if (!items || items.length === 0) return '0';
    // Use length and first/last item IDs for quick hash
    return `${items.length}-${items[0]?.id || ''}-${items[items.length - 1]?.id || ''}`;
  },
  
  /**
   * Clear schedule cache
   */
  clearScheduleCache() {
    this._scheduleCache.clear();
  },
  
  /**
   * Check if tasks should be shown based on date and time
   * @param {boolean} isToday - Whether target date is today
   * @param {boolean} isSelectedDate - Whether viewing a manually selected date
   * @param {number} currentHour - Current hour (0-23)
   * @param {number} morningHour - Morning hour threshold
   * @returns {boolean} True if tasks should be shown
   */
  _shouldShowTask(isToday, isSelectedDate, currentHour, morningHour) {
    return isSelectedDate || !isToday || (isToday && currentHour >= morningHour);
  },

  /**
   * Get new memorization tasks for target date
   * @param {string} targetDateStr - Target date string
   * @param {Array} allItems - All items
   * @param {Object} config - Configuration
   * @param {number} daysSinceStart - Days since start date
   * @param {boolean} isToday - Whether target date is today
   * @param {boolean} isSelectedDate - Whether viewing selected date
   * @param {number} currentHour - Current hour
   * @param {number} morningHour - Morning hour threshold
   * @returns {Array} Array of new memorization tasks
   */
  _getNewMemorizationTasks(targetDateStr, allItems, config, daysSinceStart, isToday, isSelectedDate, currentHour, morningHour) {
    const tasks = [];
    const totalUnits = config.total_units || DEFAULT_CONFIG.TOTAL_UNITS;
    
    if (daysSinceStart < 0 || daysSinceStart >= totalUnits) {
      return tasks;
    }

    const unitType = config.unit_type || DEFAULT_CONFIG.UNIT_TYPE;
    const itemNumber = daysSinceStart + 1;
    const contentRef = this.formatContentReference(unitType, itemNumber);
    
    // Use for...of loop instead of find for better control
    let existingItem = null;
    const idPrefix = `item-${unitType}-${itemNumber}-`;
    for (const item of allItems) {
      if (item.status === ITEM_STATUS.ACTIVE && item.date_memorized === targetDateStr) {
        if (item.id === `${idPrefix}${targetDateStr}` || 
            item.id.startsWith(idPrefix) ||
            item.id.includes(`-${itemNumber}-${targetDateStr}`)) {
          existingItem = item;
          break;
        }
      }
    }
    
    if (!existingItem) {
      // New item - show tasks if time allows
      if (isToday && !isSelectedDate) {
        if (currentHour >= morningHour) {
          tasks.push({
            id: `new-${targetDateStr}-${itemNumber}-morning`,
            content_reference: contentRef,
            date_memorized: targetDateStr,
            status: ITEM_STATUS.ACTIVE,
            reviews_completed: [],
            reviews_missed: [],
            timeOfDay: TIME_OF_DAY.MORNING,
            dueStation: STATIONS.STATION_1
          });
          tasks.push({
            id: `new-${targetDateStr}-${itemNumber}-evening`,
            content_reference: contentRef,
            date_memorized: targetDateStr,
            status: ITEM_STATUS.ACTIVE,
            reviews_completed: [],
            reviews_missed: [],
            timeOfDay: TIME_OF_DAY.EVENING,
            dueStation: STATIONS.STATION_2
          });
        }
      } else {
        tasks.push({
          id: `new-${targetDateStr}-${itemNumber}`,
          content_reference: contentRef,
          date_memorized: targetDateStr,
          status: ITEM_STATUS.ACTIVE,
          reviews_completed: [],
          reviews_missed: []
        });
      }
    } else {
      // Item exists, check if it needs review on target date
      const daysSinceMem = DateUtils.daysDifference(DateUtils.normalizeDate(targetDateStr), existingItem.date_memorized);
      const isMemorizedOnTargetDate = daysSinceMem === 0;
      
      if (isMemorizedOnTargetDate) {
        if (isToday && !isSelectedDate) {
          if (currentHour >= morningHour) {
            tasks.push({ ...existingItem, timeOfDay: TIME_OF_DAY.MORNING, dueStation: STATIONS.STATION_1 });
            tasks.push({ ...existingItem, timeOfDay: TIME_OF_DAY.EVENING, dueStation: STATIONS.STATION_2 });
          }
        } else {
          tasks.push({ ...existingItem, timeOfDay: TIME_OF_DAY.MORNING, dueStation: STATIONS.STATION_1 });
          tasks.push({ ...existingItem, timeOfDay: TIME_OF_DAY.EVENING, dueStation: STATIONS.STATION_2 });
        }
        } else {
          const reviewsDue = this.getReviewsDueOnDate(existingItem, targetDateStr);
          if (reviewsDue.length > 0) {
            // Use single loop instead of multiple finds
            let hasMorningReview = false;
            let hasEveningReview = false;
            for (const review of reviewsDue) {
              if (review.station === STATIONS.STATION_1 && review.timeOfDay === TIME_OF_DAY.MORNING) {
                hasMorningReview = true;
              }
              if (review.station === STATIONS.STATION_2 && review.timeOfDay === TIME_OF_DAY.EVENING) {
                hasEveningReview = true;
              }
            }
            
            if (isToday && !isSelectedDate) {
              if (!hasMorningReview && !hasEveningReview && currentHour >= morningHour) {
                tasks.push(existingItem);
              }
            } else {
              tasks.push(existingItem);
            }
          }
        }
    }
    
    return tasks;
  },

  /**
   * Get yesterday review tasks (Station 3)
   * @param {string} targetDateStr - Target date string
   * @param {Array} allItems - All items
   * @param {Date} target - Target date object
   * @param {boolean} isToday - Whether target date is today
   * @param {boolean} isSelectedDate - Whether viewing selected date
   * @param {number} currentHour - Current hour
   * @param {number} morningHour - Morning hour threshold
   * @returns {Array} Array of yesterday review tasks
   */
  _getYesterdayReviewTasks(targetDateStr, allItems, target, isToday, isSelectedDate, currentHour, morningHour) {
    const tasks = [];
    
    if (!this._shouldShowTask(isToday, isSelectedDate, currentHour, morningHour)) {
      return tasks;
    }
    
    // Single loop, combine filter and find
    for (const item of allItems) {
      if (item.status !== ITEM_STATUS.ACTIVE || !item.date_memorized) continue;
      
      const daysPassed = DateUtils.daysDifference(target, item.date_memorized);
      if (daysPassed === 1) {
        const reviewsDue = this.getReviewsDueOnDate(item, targetDateStr);
        // Use for...of instead of find for better performance in small arrays
        for (const review of reviewsDue) {
          if (review.station === STATIONS.STATION_3) {
            tasks.push({ ...item, dueStation: STATIONS.STATION_3 });
            break; // Found, no need to continue
          }
        }
      }
    }
    
    return tasks;
  },

  /**
   * Get spaced review tasks (Stations 4-7)
   * @param {string} targetDateStr - Target date string
   * @param {Array} allItems - All items
   * @param {Date} target - Target date object
   * @param {Object} config - Configuration
   * @param {number} daysSinceStart - Days since start date
   * @param {boolean} isToday - Whether target date is today
   * @param {boolean} isSelectedDate - Whether viewing selected date
   * @param {number} currentHour - Current hour
   * @param {number} morningHour - Morning hour threshold
   * @returns {Array} Array of spaced review tasks
   */
  _getSpacedReviewTasks(targetDateStr, allItems, target, config, daysSinceStart, isToday, isSelectedDate, currentHour, morningHour) {
    const tasks = [];
    const totalUnits = config.total_units || DEFAULT_CONFIG.TOTAL_UNITS;
    const expectedOffsets = SPACED_REVIEW_OFFSETS || [4, 11, 25, 55];
    const expectedStations = SPACED_REVIEW_STATIONS || [4, 5, 6, 7];
    
    if (!this._shouldShowTask(isToday, isSelectedDate, currentHour, morningHour)) {
      return tasks;
    }
    
    // Use Map for O(1) lookup of expected offsets by station
    const offsetMap = new Map();
    expectedStations.forEach((station, index) => {
      offsetMap.set(station, expectedOffsets[index]);
    });
    
    // Pre-calculate content reference for new item check
    const newItemContentRef = daysSinceStart >= 0 && daysSinceStart < totalUnits
      ? this.formatContentReference(config.unit_type || DEFAULT_CONFIG.UNIT_TYPE, daysSinceStart + 1)
      : null;
    
    // Single loop through items
    for (const item of allItems) {
      if (item.status !== ITEM_STATUS.ACTIVE || !item.date_memorized) continue;
      
      const daysPassed = DateUtils.daysDifference(target, item.date_memorized);
      
      // Skip if this item is being handled in new memorization section
      if (daysPassed === 0 && daysSinceStart >= 0 && daysSinceStart < totalUnits && 
          item.content_reference === newItemContentRef) {
        continue;
      }
      
      const reviewsDue = this.getReviewsDueOnDate(item, targetDateStr);
      
      // Process reviews in single loop
      for (const review of reviewsDue) {
        const station = review.station;
        
        // Handle stations 1 & 2 (same day)
        if (station === STATIONS.STATION_1 || station === STATIONS.STATION_2) {
          if (daysPassed === 0) {
            if (station === STATIONS.STATION_1 && review.timeOfDay === TIME_OF_DAY.MORNING) {
              tasks.push({ ...item, timeOfDay: TIME_OF_DAY.MORNING, dueStation: STATIONS.STATION_1 });
            } else if (station === STATIONS.STATION_2 && review.timeOfDay === TIME_OF_DAY.EVENING) {
              tasks.push({ ...item, timeOfDay: TIME_OF_DAY.EVENING, dueStation: STATIONS.STATION_2 });
            }
          }
        }
        // Handle stations 4-7 (spaced reviews) - use Map for O(1) lookup
        else if (station >= STATIONS.STATION_4 && station <= STATIONS.STATION_7) {
          const expectedOffset = offsetMap.get(station);
          if (expectedOffset !== undefined && daysPassed === expectedOffset) {
            tasks.push({ ...item, dueStation: station });
          }
        }
      }
    }
    
    return tasks;
  },

  // Calculate all 7 review dates for a memorization date
  calculateReviewDates(memorizationDate) {
    const memDate = DateUtils.normalizeDate(memorizationDate);
    const dates = [];
    
    const reviewOffsets = REVIEW_OFFSETS || [0, 0, 1, 4, 11, 25, 55];
    reviewOffsets.forEach((offset, index) => {
      const reviewDate = new Date(memDate);
      reviewDate.setDate(reviewDate.getDate() + offset);
      
      // For same-day reviews (Station 1 & 2), we need to distinguish AM/PM
      if (offset === 0) {
        dates.push({
          station: index + 1,
          date: DateUtils.getLocalDateString(reviewDate),
          timeOfDay: index === 0 ? TIME_OF_DAY.MORNING : TIME_OF_DAY.EVENING
        });
      } else {
        dates.push({
          station: index + 1,
          date: DateUtils.getLocalDateString(reviewDate),
          timeOfDay: TIME_OF_DAY.ANY
        });
      }
    });
    
    return dates;
  },

  // Get the review date for a specific station
  getReviewDateForStation(memorizationDate, stationNumber) {
    if (stationNumber < STATIONS.MIN || stationNumber > STATIONS.MAX) return null;
    
    const memDate = DateUtils.normalizeDate(memorizationDate);
    const reviewOffsets = REVIEW_OFFSETS || [0, 0, 1, 4, 11, 25, 55];
    const offset = reviewOffsets[stationNumber - 1];
    const reviewDate = new Date(memDate);
    reviewDate.setDate(reviewDate.getDate() + offset);
    
    return DateUtils.getLocalDateString(reviewDate);
  },

  // Check if a review is due on a specific date
  isReviewDue(item, targetDate, stationNumber) {
    if (!item || !item.date_memorized) return false;
    
    const daysPassed = DateUtils.daysDifference(targetDate, item.date_memorized);
    
    // Get expected offset for this station
    const reviewOffsets = REVIEW_OFFSETS || [0, 0, 1, 4, 11, 25, 55];
    const expectedOffset = reviewOffsets[stationNumber - 1];
    
    // For same-day reviews (Station 1 & 2), check if it's the same day
    if (expectedOffset === 0) {
      return daysPassed === 0;
    }
    
    return daysPassed === expectedOffset;
  },

  // Get all reviews due on a specific date
  getReviewsDueOnDate(item, targetDate) {
    if (!item || !item.date_memorized) return [];
    
    const daysPassed = DateUtils.daysDifference(targetDate, item.date_memorized);
    
    const dueReviews = [];
    
    const reviewOffsets = REVIEW_OFFSETS || [0, 0, 1, 4, 11, 25, 55];
    reviewOffsets.forEach((offset, index) => {
      const station = index + 1;
      
      if (offset === 0 && daysPassed === 0) {
        // Same day reviews - both stations are due
        dueReviews.push({
          station: station,
          timeOfDay: station === STATIONS.STATION_1 ? TIME_OF_DAY.MORNING : TIME_OF_DAY.EVENING
        });
      } else if (daysPassed === offset) {
        dueReviews.push({
          station: station,
          timeOfDay: TIME_OF_DAY.ANY
        });
      }
    });
    
    return dueReviews;
  },

  /**
   * Generate daily schedule for a target date
   * @param {string|Date} targetDate - Target date for schedule
   * @param {Array} allItems - All memorization items
   * @param {Object} config - User configuration
   * @param {Function} storageCheckFn - Function to check review completion (optional, not used but kept for compatibility)
   * @param {boolean} isSelectedDate - Whether viewing a manually selected date (not real-time today)
   * @returns {Object} Schedule object with new_memorization, yesterday_review, spaced_review arrays
   */
  getDailySchedule(targetDate, allItems, config, storageCheckFn = null, isSelectedDate = false) {
    const target = DateUtils.normalizeDate(targetDate);
    const targetDateStr = DateUtils.getLocalDateString(target);
    const now = new Date();
    const currentHour = now.getHours();
    const today = DateUtils.normalizeDate(now);
    const todayStr = DateUtils.getLocalDateString(today);
    
    // Check cache (only for non-today dates to avoid stale data)
    if (!isSelectedDate && targetDateStr !== todayStr) {
      const cacheKey = `${targetDateStr}-${config.start_date}-${allItems.length}`;
      const cached = this._scheduleCache.get(cacheKey);
      if (cached) {
        const itemsHash = this._hashItems(allItems);
        if (cached.itemsHash === itemsHash) {
          return cached.schedule;
        }
      }
    }
    
    const schedule = {
      new_memorization: [],
      yesterday_review: [],
      spaced_review: []
    };

    if (!config || !config.start_date) {
      return schedule;
    }

    // Get morning and evening hours from config
    const morningHour = config.morning_hour !== undefined ? config.morning_hour : DEFAULT_CONFIG.MORNING_HOUR;
    const eveningHour = config.evening_hour !== undefined ? config.evening_hour : DEFAULT_CONFIG.EVENING_HOUR;

    const startDate = DateUtils.normalizeDate(config.start_date);
    const daysSinceStart = DateUtils.daysDifference(target, startDate);
    
    // For selected dates, always show tasks regardless of time
    // For real-time today, respect time-based filtering
    const isToday = targetDateStr === todayStr;

    // Get new memorization tasks
    schedule.new_memorization = this._getNewMemorizationTasks(
      targetDateStr, allItems, config, daysSinceStart, isToday, isSelectedDate, currentHour, morningHour
    );

    // Get yesterday review tasks (Station 3)
    schedule.yesterday_review = this._getYesterdayReviewTasks(
      targetDateStr, allItems, target, isToday, isSelectedDate, currentHour, morningHour
    );

    // Get spaced review tasks (Stations 4-7 and same-day reviews from existing items)
    const spacedTasks = this._getSpacedReviewTasks(
      targetDateStr, allItems, target, config, daysSinceStart, isToday, isSelectedDate, currentHour, morningHour
    );
    
    // Separate same-day reviews (stations 1 & 2) from spaced reviews
    spacedTasks.forEach(task => {
      if (task.dueStation === STATIONS.STATION_1 || task.dueStation === STATIONS.STATION_2) {
        schedule.new_memorization.push(task);
      } else {
        schedule.spaced_review.push(task);
      }
    });

    // Cache result for non-today dates
    if (!isSelectedDate && targetDateStr !== todayStr) {
      const cacheKey = `${targetDateStr}-${config.start_date}-${allItems.length}`;
      const itemsHash = this._hashItems(allItems);
      
      // Limit cache size
      if (this._scheduleCache.size >= this._cacheMaxSize) {
        // Remove oldest entry (first in Map)
        const firstKey = this._scheduleCache.keys().next().value;
        this._scheduleCache.delete(firstKey);
      }
      
      this._scheduleCache.set(cacheKey, {
        schedule: JSON.parse(JSON.stringify(schedule)), // Deep clone
        itemsHash: itemsHash
      });
    }

    return schedule;
  },

  // Format content reference based on unit type
  formatContentReference(unitType, number) {
    // Use i18n if available, otherwise fallback to English
    if (typeof i18n !== 'undefined') {
      const unitName = i18n.t(`units.${unitType}`);
      return `${unitName} ${number}`;
    }
    // Fallback to English
    switch (unitType) {
      case 'page':
        return `Page ${number}`;
      case 'verse':
        return `Ayah ${number}`;
      case 'hizb':
        return `Hizb ${number}`;
      case 'juz':
        return `Juz ${number}`;
      default:
        return `Unit ${number}`;
    }
  },

  // Get next page/unit number to memorize
  getNextPageNumber(allItems, config) {
    if (!config || !allItems.length) return 1;
    
    const activeItems = allItems.filter(item => item.status === 'active');
    if (activeItems.length === 0) return 1;
    
    // Extract numbers from content references
    const numbers = activeItems
      .map(item => {
        const match = item.content_reference.match(/\d+/);
        return match ? parseInt(match[0]) : 0;
      })
      .filter(num => num > 0);
    
    if (numbers.length === 0) return 1;
    
    return Math.max(...numbers) + 1;
  },

  // Get progress statistics relative to today's date
  getProgressStats(allItems, config) {
    if (!config || !config.start_date) {
      return {
        totalItems: 0,
        totalReviews: 0,
        completedReviews: 0,
        completionRate: 0
      };
    }

    const today = DateUtils.normalizeDate(new Date());
    const startDate = DateUtils.normalizeDate(config.start_date);
    
    // Calculate how many days have passed since start (including today)
    const daysSinceStart = DateUtils.daysDifference(today, startDate);
    
    // If we haven't started yet, return zeros
    if (daysSinceStart < 0) {
      return {
        totalItems: 0,
        totalReviews: 0,
        completedReviews: 0,
        completionRate: 0
      };
    }

    // Calculate expected items up to and including today (1 unit per day)
    const totalUnits = config.total_units || DEFAULT_CONFIG.TOTAL_UNITS;
    const expectedItemsCount = Math.min(daysSinceStart + 1, totalUnits);
    
    // Build a map of expected items by date
    const expectedItemsByDate = {};
    const daysToProcess = Math.min(daysSinceStart + 1, totalUnits);
    for (let day = 0; day < daysToProcess; day++) {
      const itemDate = new Date(startDate);
      itemDate.setDate(itemDate.getDate() + day);
      const dateStr = DateUtils.getLocalDateString(itemDate);
      
      // 1 unit per day, so itemNumber = day + 1
      const itemNumber = day + 1;
      const contentRef = this.formatContentReference(config.unit_type || DEFAULT_CONFIG.UNIT_TYPE, itemNumber);
      if (!expectedItemsByDate[dateStr]) {
        expectedItemsByDate[dateStr] = [];
      }
      expectedItemsByDate[dateStr].push({
        content_reference: contentRef,
        date_memorized: dateStr,
        expected_number: itemNumber
      });
    }
    
    // Get actual items that exist - use single loop with Map for O(1) lookups
    const itemsMap = new Map();
    for (const item of allItems) {
      if (item.status === ITEM_STATUS.ACTIVE) {
        itemsMap.set(item.content_reference, item);
      }
    }
    
    // Count items and reviews
    let totalItems = 0;
    let totalReviews = 0;
    let completedReviews = 0;
    
    // Use Set for O(1) lookup of completed reviews
    const expectedItems = Object.values(expectedItemsByDate).flat();
    for (const expectedItem of expectedItems) {
      const actualItem = itemsMap.get(expectedItem.content_reference);
      const expectedItemDate = DateUtils.normalizeDate(expectedItem.date_memorized);
      
      // Count item if it exists or if it should exist by today
      if (actualItem || expectedItemDate <= today) {
        totalItems++;
      }
      
      // Only process reviews for items that actually exist
      if (actualItem && actualItem.date_memorized) {
        // Calculate which reviews should have been completed by today
        const reviewDates = this.calculateReviewDates(actualItem.date_memorized);
        const reviewsDueByToday = [];
        for (const review of reviewDates) {
          const reviewDate = DateUtils.normalizeDate(review.date);
          if (reviewDate <= today) {
            reviewsDueByToday.push(review);
          }
        }
        
        // Count reviews that should be done by today
        totalReviews += reviewsDueByToday.length;
        
        // Count completed reviews - use Set for O(1) lookup
        if (actualItem.reviews_completed && actualItem.reviews_completed.length > 0) {
          const completedSet = new Set(actualItem.reviews_completed);
          for (const review of reviewsDueByToday) {
            const reviewKey = `${review.station}-${review.date}`;
            if (completedSet.has(reviewKey)) {
              completedReviews++;
            }
          }
        }
      }
    }
    
    return {
      totalItems,
      totalReviews,
      completedReviews,
      completionRate: totalReviews > 0 ? (completedReviews / totalReviews) * 100 : 0
    };
  }
};

// Expose DateUtils globally for use in other modules
window.DateUtils = DateUtils;

