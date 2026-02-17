// UI Management and Rendering

// DOM Cache for frequently accessed elements
const DOMCache = {
  _cache: {},

  /**
   * Get element by ID, using cache if available
   * @param {string} id - Element ID
   * @returns {HTMLElement|null} Element or null
   */
  getElementById(id) {
    if (!this._cache[id]) {
      this._cache[id] = document.getElementById(id);
    }
    return this._cache[id];
  },

  /**
   * Get elements by selector, using cache if available
   * @param {string} selector - CSS selector
   * @param {boolean} useCache - Whether to use cache (default: true)
   * @returns {NodeList} Elements
   */
  querySelectorAll(selector, useCache = true) {
    const cacheKey = `query_${selector}`;
    if (useCache && this._cache[cacheKey]) {
      return this._cache[cacheKey];
    }
    const elements = document.querySelectorAll(selector);
    if (useCache) {
      this._cache[cacheKey] = elements;
    }
    return elements;
  },

  /**
   * Clear cache for a specific key or all cache
   * @param {string} key - Optional key to clear, or undefined to clear all
   */
  clear(key) {
    if (key) {
      delete this._cache[key];
    } else {
      this._cache = {};
    }
  },

  /**
   * Initialize cache with frequently accessed elements
   */
  init() {
    this._cache['today-stats'] = document.getElementById('today-stats');
    this._cache['today-tasks'] = document.getElementById('today-tasks');
    this._cache['progress-timeline'] = document.getElementById('progress-timeline');
    this._cache['calendar-grid'] = document.getElementById('calendar-grid');
    this._cache['calendar-month-year'] = document.getElementById('calendar-month-year');
    this._cache['calendar-progression-filter'] = document.getElementById('calendar-progression-filter');
    this._cache['query_.nav-tab'] = document.querySelectorAll('.nav-tab');
  }
};

const UI = {
  // Current date context (defaults to today)
  // Current date context (defaults to today)
  currentDate: new Date(),
  currentView: 'today-view',
  viewHistory: [],

  // Show a specific view
  async showView(viewId) {
    try {
      // Get all views - don't use cache here to be safe
      const views = document.querySelectorAll('.view');
      if (views.length > 0) {
        // Use a standard for loop for better compatibility
        for (let i = 0; i < views.length; i++) {
          views[i].classList.add('hidden');
        }
      }

      const targetView = document.getElementById(viewId);
      if (targetView) {
        targetView.classList.remove('hidden');

        // Ensure the screen scrolls back to top during view switch
        window.scrollTo(0, 0);
      } else {
        Logger.error(`View not found: ${viewId}`);
      }

      // Update tab active state
      // Update tab active state
      this.updateTabActiveState(viewId);

      // Update history: if viewId is different from current, push current to history
      if (this.currentView && this.currentView !== viewId) {
        // Prevent duplicates at the top of the stack
        if (this.viewHistory.length === 0 || this.viewHistory[this.viewHistory.length - 1] !== this.currentView) {
          this.viewHistory.push(this.currentView);
        }
        // Limit history size to prevent memory leaks (e.g., 50 items)
        if (this.viewHistory.length > 50) {
          this.viewHistory.shift();
        }
      }
      this.currentView = viewId;

      // Save current view to localStorage (skip setup-view and privacy-view)
      if (viewId !== 'setup-view' && viewId !== 'privacy-view') {
        await Storage.saveCurrentView(viewId);
      }
    } catch (error) {
      if (typeof Logger !== 'undefined') {
        Logger.error('Error in showView:', error);
      } else {
        console.error('Error in showView:', error);
      }
    }
  },

  // Navigate back in history
  async goBack() {
    if (this.viewHistory.length > 0) {
      const previousView = this.viewHistory.pop();
      // Manually switch view without pushing to history (since we just popped it)
      try {
        const views = document.querySelectorAll('.view');
        views.forEach(v => v.classList.add('hidden'));

        const target = document.getElementById(previousView);
        if (target) {
          target.classList.remove('hidden');
          window.scrollTo(0, 0);
          this.updateTabActiveState(previousView);
          this.currentView = previousView;
          await Storage.saveCurrentView(previousView);

          // Re-render if necessary
          if (previousView === 'today-view') {
            const today = new Date();
            this.currentDate = today;
            await this.renderTodayView(today);
            this.updateNavbarLabel();
          } else if (previousView === 'progress-view') {
            await this.renderProgressView();
          } else if (previousView === 'calendar-view') {
            if (window.Calendar) await Calendar.initAsView();
          } else if (previousView === 'settings-view') {
            await this.renderSettingsView();
          }
          return true;
        }
      } catch (e) {
        Logger.error('Error going back', e);
      }
    }
    return false;
  },

  // Initialize tab navigation
  initTabNavigation() {
    const bottomNav = document.getElementById('bottom-nav');
    if (!bottomNav) return;

    bottomNav.addEventListener('click', async (e) => {
      const tab = e.target.closest('.nav-tab');
      if (!tab) return;

      const viewId = tab.getAttribute('data-view');
      if (viewId) {
        await this.showView(viewId);

        // Render the view if needed
        if (viewId === 'today-view') {
          const today = new Date();
          this.currentDate = today;
          await this.renderTodayView(today);
        } else if (viewId === 'progress-view') {
          await this.renderProgressView();
        } else if (viewId === 'calendar-view') {
          if (window.Calendar) {
            await Calendar.initAsView();
          }
        } else if (viewId === 'settings-view') {
          await this.renderSettingsView();
        }

        // Update navbar label when switching views
        if (viewId === 'today-view') {
          this.updateNavbarLabel();
        }
      }
    });
  },

  // Update tab active state
  updateTabActiveState(viewId) {
    const tabs = document.querySelectorAll('.nav-tab');
    for (let i = 0; i < tabs.length; i++) {
      const tab = tabs[i];
      const tabViewId = tab.getAttribute('data-view');
      if (tabViewId === viewId) {
        tab.classList.add('active');
      } else {
        tab.classList.remove('active');
      }
    }
  },

  // Render setup view
  async renderSetupView() {
    const config = await Storage.getConfig();

    // Ensure theme is initialized
    if (!Theme.getTheme()) {
      Theme.init();
    }

    const currentTheme = Theme.getTheme();
    const currentLang = i18n.getLanguage();

    // Load surah presets
    await this.loadSurahPresets();

    // Initialize unit type toggle
    const unitTypeToggle = DOMCache.getElementById('unit-type-toggle');
    if (unitTypeToggle) {
      const selectedValue = config?.unit_type || DEFAULT_CONFIG.UNIT_TYPE;
      unitTypeToggle.querySelectorAll('.toggle-option').forEach(btn => {
        if (btn.getAttribute('data-value') === selectedValue) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });
    }

    // Initialize language toggle
    const languageToggle = DOMCache.getElementById('setup-language-toggle');
    if (languageToggle) {
      const selectedValue = config?.language || currentLang || DEFAULT_CONFIG.LANGUAGE;
      languageToggle.querySelectorAll('.toggle-option').forEach(btn => {
        if (btn.getAttribute('data-value') === selectedValue) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });
    }

    // Initialize theme toggle
    const themeToggle = DOMCache.getElementById('setup-theme-toggle');
    if (themeToggle) {
      const selectedValue = config?.theme || currentTheme || DEFAULT_CONFIG.THEME;
      themeToggle.querySelectorAll('.toggle-option').forEach(btn => {
        if (btn.getAttribute('data-value') === selectedValue) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });
    }

    // Pre-fill other form fields
    const totalUnitsInput = DOMCache.getElementById('total-units');
    const startDateInput = DOMCache.getElementById('start-date');
    const progressionNameInput = DOMCache.getElementById('progression-name');
    const startPageInput = DOMCache.getElementById('start-page');
    const startPageGroup = DOMCache.getElementById('start-page-group');

    if (config) {
      if (totalUnitsInput) totalUnitsInput.value = config.total_units || DEFAULT_CONFIG.TOTAL_UNITS;
      if (startDateInput) startDateInput.value = config.start_date || '';
      if (progressionNameInput) progressionNameInput.value = config.progression_name || '';
      if (startPageInput) startPageInput.value = config.start_page || 1;
    } else {
      // Set default start date to today (using local date)
      if (startDateInput && !startDateInput.value) {
        startDateInput.value = DateUtils ? DateUtils.getLocalDateString(new Date()) : new Date().toISOString().split('T')[0];
      }
      // Set default total units to 30
      if (totalUnitsInput && !totalUnitsInput.value) {
        totalUnitsInput.value = DEFAULT_CONFIG.TOTAL_UNITS;
      }
      if (startPageInput && !startPageInput.value) {
        startPageInput.value = 1;
      }
    }

    // Update unit count label and start page visibility
    this.updateUnitTypeDependentFields();

    // Initialize toggle event listeners
    this.initSetupToggles();

    // Initialize number input buttons
    this.initNumberInput();

    // Initialize surah preset handler
    this.initSurahPresetHandler();
  },

  // Initialize number input increment/decrement buttons
  initNumberInput() {
    const decreaseBtn = DOMCache.getElementById('total-units-decrease');
    const increaseBtn = DOMCache.getElementById('total-units-increase');
    const input = DOMCache.getElementById('total-units');

    if (decreaseBtn && input) {
      decreaseBtn.addEventListener('click', () => {
        const currentValue = parseInt(input.value) || DEFAULT_CONFIG.TOTAL_UNITS;
        const newValue = Math.max(1, currentValue - 1);
        input.value = newValue;
        input.dispatchEvent(new Event('change', { bubbles: true }));
      });
    }

    if (increaseBtn && input) {
      increaseBtn.addEventListener('click', () => {
        const currentValue = parseInt(input.value) || DEFAULT_CONFIG.TOTAL_UNITS;
        const newValue = currentValue + 1;
        input.value = newValue;
        input.dispatchEvent(new Event('change', { bubbles: true }));
      });
    }
  },

  // Load surah presets into dropdown
  async loadSurahPresets() {
    const presetSelect = DOMCache.getElementById('surah-preset');
    if (!presetSelect) {
      Logger.warn('Surah preset select element not found');
      return;
    }

    // Clear existing options except "None"
    while (presetSelect.children.length > 1) {
      presetSelect.removeChild(presetSelect.lastChild);
    }

    try {
      const bigSurahs = await QuranAPI.getBigSurahs();
      const currentLang = i18n.getLanguage();

      if (!bigSurahs || bigSurahs.length === 0) {
        Logger.warn('No big surahs found. This might be due to API response format or network issues.');
        // Optionally show a message to user
        return;
      }

      bigSurahs.forEach(surah => {
        if (!surah || !surah.number) {
          Logger.warn('Invalid surah object:', surah);
          return;
        }

        const option = document.createElement('option');
        option.value = surah.number;
        const pageCount = QuranAPI.getSurahPageCount(surah);
        const surahName = QuranAPI.getSurahName(surah, currentLang);
        option.textContent = `${surah.number}. ${surahName} (${pageCount} ${i18n.t('units.page')})`;
        option.dataset.surahData = JSON.stringify(surah);
        presetSelect.appendChild(option);
      });

      Logger.info(`Loaded ${bigSurahs.length} big surahs into dropdown`);
    } catch (error) {
      Logger.error('Error loading surah presets:', error);
    }
  },

  // Update unit type dependent fields (label and start page visibility)
  updateUnitTypeDependentFields() {
    const unitTypeToggle = DOMCache.getElementById('unit-type-toggle');
    const totalUnitsLabel = DOMCache.getElementById('total-units-label');
    const startPageGroup = DOMCache.getElementById('start-page-group');

    if (!unitTypeToggle || !totalUnitsLabel) return;

    const selectedUnitType = unitTypeToggle.querySelector('.toggle-option.active')?.getAttribute('data-value') || DEFAULT_CONFIG.UNIT_TYPE;

    // Update label and limits
    let labelKey = 'setup.totalUnits';
    let maxUnits = 604;

    if (selectedUnitType === 'page') {
      labelKey = 'setup.totalPages';
      maxUnits = 604;
    } else if (selectedUnitType === 'verse') {
      labelKey = 'setup.totalVerses';
      maxUnits = 6349;
    } else if (selectedUnitType === 'quarter_hizb') {
      labelKey = 'setup.totalQuarterHizbs';
      maxUnits = 240;
    } else if (selectedUnitType === 'hizb') {
      labelKey = 'setup.totalHizbs';
      maxUnits = 60;
    } else if (selectedUnitType === 'juz') {
      labelKey = 'setup.totalJuzs';
      maxUnits = 30;
    }

    totalUnitsLabel.setAttribute('data-i18n', labelKey);
    totalUnitsLabel.textContent = i18n.t(labelKey);

    const totalUnitsInput = DOMCache.getElementById('total-units');
    if (totalUnitsInput) {
      totalUnitsInput.max = maxUnits;
      if (parseInt(totalUnitsInput.value) > maxUnits) {
        totalUnitsInput.value = maxUnits;
      }
    }

    // Show/hide start page field
    if (startPageGroup) {
      if (selectedUnitType === 'page') {
        startPageGroup.style.display = 'block';
      } else {
        startPageGroup.style.display = 'none';
      }
    }
  },

  // Initialize surah preset handler
  initSurahPresetHandler() {
    const presetSelect = DOMCache.getElementById('surah-preset');
    if (!presetSelect) return;

    presetSelect.addEventListener('change', async (e) => {
      const selectedValue = e.target.value;
      if (!selectedValue) return;

      const option = e.target.querySelector(`option[value="${selectedValue}"]`);
      if (!option || !option.dataset.surahData) return;

      try {
        const surah = JSON.parse(option.dataset.surahData);
        const startPage = QuranAPI.getSurahStartPage(surah);
        const pageCount = QuranAPI.getSurahPageCount(surah);
        const currentLang = i18n.getLanguage();
        const surahName = QuranAPI.getSurahName(surah, currentLang);

        // Set unit type to page
        const unitTypeToggle = DOMCache.getElementById('unit-type-toggle');
        if (unitTypeToggle) {
          unitTypeToggle.querySelectorAll('.toggle-option').forEach(btn => {
            btn.classList.remove('active');
            if (btn.getAttribute('data-value') === 'page') {
              btn.classList.add('active');
            }
          });
        }

        // Update fields
        const totalUnitsInput = DOMCache.getElementById('total-units');
        const startPageInput = DOMCache.getElementById('start-page');
        const progressionNameInput = DOMCache.getElementById('progression-name');

        if (totalUnitsInput) totalUnitsInput.value = pageCount;
        if (startPageInput) startPageInput.value = startPage;
        if (progressionNameInput) progressionNameInput.value = surahName;

        // Update dependent fields
        this.updateUnitTypeDependentFields();
      } catch (error) {
        Logger.error('Error handling surah preset:', error);
      }
    });
  },

  // Initialize setup toggle event listeners
  initSetupToggles() {
    // Unit type toggle
    const unitTypeToggle = DOMCache.getElementById('unit-type-toggle');
    if (unitTypeToggle) {
      unitTypeToggle.querySelectorAll('.toggle-option').forEach(btn => {
        btn.addEventListener('click', () => {
          const value = btn.getAttribute('data-value');
          unitTypeToggle.querySelectorAll('.toggle-option').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          // Update dependent fields
          this.updateUnitTypeDependentFields();
        });
      });
    }

    // Language toggle - instant change
    const languageToggle = DOMCache.getElementById('setup-language-toggle');
    if (languageToggle) {
      languageToggle.querySelectorAll('.toggle-option').forEach(btn => {
        btn.addEventListener('click', () => {
          const value = btn.getAttribute('data-value');
          languageToggle.querySelectorAll('.toggle-option').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');

          // Instant language change
          i18n.init(value);
          i18n.translatePage();
          this.updateLanguageToggles();
        });
      });
    }

    // Theme toggle - instant change
    const themeToggle = DOMCache.getElementById('setup-theme-toggle');
    if (themeToggle) {
      themeToggle.querySelectorAll('.toggle-option').forEach(btn => {
        btn.addEventListener('click', () => {
          const value = btn.getAttribute('data-value');
          themeToggle.querySelectorAll('.toggle-option').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');

          // Instant theme change
          Theme.setTheme(value);
        });
      });
    }
  },

  // Generate stable ID for an item based on unit type, number, and date
  generateItemId(unitType, itemNumber, dateMemorized) {
    // Use stable, deterministic ID that doesn't change between language switches
    return `item-${unitType}-${itemNumber}-${dateMemorized}`;
  },

  // Find existing item by stable ID or legacy pattern
  findExistingItem(allItems, unitType, itemNumber, itemDateStr, stableId) {
    return allItems.find(
      item => item.id === stableId ||
        (item.date_memorized === itemDateStr &&
          item.status === ITEM_STATUS.ACTIVE &&
          // Check if it matches the pattern (for legacy items without stable IDs)
          (item.id.startsWith(`item-${unitType}-${itemNumber}-`) ||
            item.id.includes(`-${itemNumber}-${itemDateStr}`)))
    );
  },

  // Create or update an item, returning the item
  async createOrUpdateItem(unitType, itemNumber, itemDateStr, config, allItems) {
    const stableId = this.generateItemId(unitType, itemNumber, itemDateStr);
    // Calculate actual unit number with start page offset for pages
    let actualUnitNumber = itemNumber;
    if (unitType === 'page' && config && config.start_page) {
      actualUnitNumber = config.start_page + itemNumber - 1;
    }
    const contentRef = Algorithm.formatContentReference(unitType, actualUnitNumber);
    const existingItem = this.findExistingItem(allItems, unitType, itemNumber, itemDateStr, stableId);

    if (!existingItem) {
      // Create and save new item with stable ID
      const newItem = {
        id: stableId,
        content_reference: contentRef,
        date_memorized: itemDateStr,
        status: ITEM_STATUS.ACTIVE,
        progression_name: config.progression_name || DEFAULT_CONFIG.PROGRESSION_NAME,
        reviews_completed: [],
        reviews_missed: []
      };
      await Storage.saveItem(newItem);
      return newItem;
    } else {
      // Update existing item: ensure it has stable ID and current language content_reference
      if (existingItem.id !== stableId) {
        existingItem.id = stableId;
      }
      if (existingItem.content_reference !== contentRef) {
        existingItem.content_reference = contentRef;
      }
      // Update progression_name if it's missing
      if (!existingItem.progression_name && config.progression_name) {
        existingItem.progression_name = config.progression_name;
      }
      await Storage.saveItem(existingItem);
      return existingItem;
    }
  },

  // Clean up duplicate items based on stable ID pattern
  async cleanupDuplicateItems(config) {
    if (!config) return;

    const allItems = await Storage.getAllItems();
    const unitType = config.unit_type || 'page';
    const startDate = new Date(config.start_date);
    const totalUnits = config.total_units || 30;
    const seen = new Map(); // Map of stableId -> item
    const itemsToKeep = [];

    // First, process all items and group by stable ID
    allItems.forEach(item => {
      if (item.status !== 'active') {
        itemsToKeep.push(item);
        return;
      }

      // Try to determine the item's stable ID
      let stableId = null;

      // If item already has stable ID format, use it
      if (item.id && item.id.startsWith(`item-${unitType}-`)) {
        const idParts = item.id.split('-');
        if (idParts.length >= 6) {
          // Format: item-{unitType}-{number}-{YYYY}-{MM}-{DD}
          stableId = item.id;
        }
      }

      // If no stable ID, try to infer from date_memorized
      if (!stableId && item.date_memorized) {
        // Calculate which item number this should be based on date
        const itemDate = DateUtils.normalizeDate(item.date_memorized);
        const normalizedStartDate = DateUtils.normalizeDate(startDate);
        const daysDiff = DateUtils.daysDifference(itemDate, normalizedStartDate);
        if (daysDiff >= 0 && daysDiff < totalUnits) {
          const itemNumber = daysDiff + 1;
          stableId = this.generateItemId(unitType, itemNumber, item.date_memorized);
        }
      }

      if (stableId) {
        if (seen.has(stableId)) {
          // Duplicate found - merge reviews and keep the one with stable ID
          const existingItem = seen.get(stableId);
          const mergedReviewsCompleted = [...new Set([
            ...(existingItem.reviews_completed || []),
            ...(item.reviews_completed || [])
          ])];
          const mergedReviewsMissed = [...new Set([
            ...(existingItem.reviews_missed || []),
            ...(item.reviews_missed || [])
          ])];

          existingItem.reviews_completed = mergedReviewsCompleted;
          existingItem.reviews_missed = mergedReviewsMissed;
          // Keep the content_reference from the most recent item (current language)
          existingItem.content_reference = item.content_reference;
        } else {
          // First occurrence - ensure it has stable ID and add to seen
          item.id = stableId;
          seen.set(stableId, item);
          itemsToKeep.push(item);
        }
      } else {
        // Can't determine stable ID, keep as-is
        itemsToKeep.push(item);
      }
    });

    // Save cleaned up items
    if (itemsToKeep.length !== allItems.length) {
      await StorageAdapter.set('quran_memorization_items', JSON.stringify(itemsToKeep));
    }
  },

  // Update navbar label based on current date
  updateNavbarLabel(date = null) {
    const navLabel = document.querySelector('#nav-today .nav-label'); // Use querySelector for complex selector
    if (!navLabel) return;

    const targetDate = date || this.currentDate || new Date();
    const today = DateUtils.normalizeDate(new Date());
    const target = DateUtils.normalizeDate(targetDate);
    const isToday = DateUtils.isSameLocalDay(targetDate, today);

    if (isToday) {
      // Reset to "Today" translation
      navLabel.setAttribute('data-i18n', 'nav.today');
      navLabel.textContent = i18n.t('nav.today');
    } else {
      // Show day name - use data attribute to mark it as a day name so translatePage doesn't overwrite it
      const dayOfWeek = targetDate.getDay();
      const dayName = i18n.t(`calendar.weekdays.${dayOfWeek}`);
      navLabel.removeAttribute('data-i18n'); // Remove data-i18n so it doesn't get overwritten by translatePage
      navLabel.setAttribute('data-day-name', 'true'); // Mark as day name
      navLabel.textContent = dayName;
    }
  },

  // Render today view (unified task list)
  async renderTodayView(targetDate = null) {
    const config = await Storage.getConfig();
    if (!config) {
      await this.showView('setup-view');
      return;
    }

    // If no target date specified, use today
    // This ensures that when the today tab is clicked or page is reloaded,
    // it always shows today's tasks
    const today = new Date();
    const date = targetDate !== null && targetDate !== undefined ? targetDate : today;
    this.currentDate = date;
    const dateStr = DateUtils.getLocalDateString(date);

    // Update navbar label to show day name if not today
    this.updateNavbarLabel(date);

    // Determine if this is a selected date (not real-time today)
    const normalizedToday = DateUtils.normalizeDate(new Date());
    const target = DateUtils.normalizeDate(date);
    const isSelectedDate = targetDate !== null || target.getTime() !== normalizedToday.getTime();

    // Clean up any duplicate items before processing
    await this.cleanupDuplicateItems(config);

    // Get all items
    let allItems = await Storage.getAllItems();

    // Save new items first (before generating schedule to avoid duplicates)
    const startDate = DateUtils.normalizeDate(config.start_date);
    const daysSinceStart = DateUtils.daysDifference(date, startDate);

    // Create items for all days up to and including target date (1 unit per day)
    // This ensures all units that should exist are created, so their reviews can be scheduled
    const totalUnits = config.total_units || DEFAULT_CONFIG.TOTAL_UNITS;
    const unitType = config.unit_type || DEFAULT_CONFIG.UNIT_TYPE;

    // Create items for all days from start_date up to target date (or totalUnits, whichever is smaller)
    const daysToCreate = Math.min(daysSinceStart + 1, totalUnits);
    for (let day = 0; day < daysToCreate; day++) {
      const itemDate = new Date(startDate);
      itemDate.setDate(itemDate.getDate() + day);
      const itemDateStr = DateUtils.getLocalDateString(itemDate);
      const itemNumber = day + 1;

      const item = await this.createOrUpdateItem(unitType, itemNumber, itemDateStr, config, allItems);
      // Add to allItems if it's a new item (not already in array)
      if (!allItems.find(i => i.id === item.id)) {
        allItems.push(item);
      }
    }

    // Generate schedule with storage check function
    // Pass isSelectedDate to indicate if we're viewing a manually selected date
    const schedule = Algorithm.getDailySchedule(
      dateStr,
      allItems,
      config,
      async (id, station, date) => await Storage.isReviewCompleted(id, station, date),
      isSelectedDate
    );

    // Combine all tasks with priorities
    const allTasks = [];

    // New memorization - Priority 1
    schedule.new_memorization.forEach(item => {
      allTasks.push({
        item,
        priority: (window.PRIORITY ? window.PRIORITY.NEW : 1),
        station: item.dueStation || (window.STATIONS ? window.STATIONS.STATION_1 : 1)
      });
    });

    // Yesterday's review - Priority 2
    schedule.yesterday_review.forEach(item => {
      allTasks.push({
        item,
        priority: (window.PRIORITY ? window.PRIORITY.YESTERDAY : 2),
        station: item.dueStation || (window.STATIONS ? window.STATIONS.STATION_3 : 3)
      });
    });

    // Spaced review - Priority 3
    schedule.spaced_review.forEach(item => {
      allTasks.push({
        item,
        priority: (window.PRIORITY ? window.PRIORITY.SPACED : 3),
        station: item.dueStation || null
      });
    });

    // Deduplicate tasks: same item.id + station combination should only appear once
    // Use Map with composite key to track unique tasks
    const uniqueTasksMap = new Map();
    allTasks.forEach(task => {
      const station = task.station || (window.STATIONS ? window.STATIONS.STATION_1 : 1);
      const taskKey = `${task.item.id}-${station}-${dateStr}`;

      // If we haven't seen this task before, or if this one has lower priority number (higher priority), keep it
      const existing = uniqueTasksMap.get(taskKey);
      if (!existing || task.priority < existing.priority) {
        uniqueTasksMap.set(taskKey, task);
      }
    });

    // Convert back to array
    const uniqueTasks = Array.from(uniqueTasksMap.values());

    // Mark tasks as completed or not
    for (const task of uniqueTasks) {
      const station = task.station || (window.STATIONS ? window.STATIONS.STATION_1 : 1);
      task.isCompleted = await Storage.isReviewCompleted(task.item.id, station, dateStr);
    }

    // Sort: unchecked first (by priority, then content), then checked (by priority, then content)
    uniqueTasks.sort((a, b) => {
      // First, separate completed and uncompleted
      if (a.isCompleted !== b.isCompleted) {
        return a.isCompleted ? 1 : -1; // Uncompleted first (false comes before true)
      }
      // Within same completion status, sort by priority
      if (a.priority !== b.priority) {
        return a.priority - b.priority;
      }
      // Then by content reference
      return a.item.content_reference.localeCompare(b.item.content_reference);
    });

    // Render quick stats
    const statsContainer = DOMCache.getElementById('today-stats');
    if (statsContainer) {
      const total = uniqueTasks.length;
      // Count completed in single loop instead of filter
      let completed = 0;
      for (const task of uniqueTasks) {
        if (task.isCompleted) completed++;
      }

      const stats = UIComponents.createQuickStats(total, completed);
      // Use DocumentFragment for batch DOM updates
      const fragment = document.createDocumentFragment();
      fragment.appendChild(stats);
      statsContainer.replaceChildren(); // Safe clear
      statsContainer.appendChild(fragment);
    }

    // Render unified task list
    const tasksContainer = DOMCache.getElementById('today-tasks');
    if (tasksContainer) {
      // Clear container first to prevent duplicates
      tasksContainer.replaceChildren(); // Safe clear

      // Use DocumentFragment for batch DOM updates
      const fragment = document.createDocumentFragment();

      if (uniqueTasks.length === 0) {
        const empty = UIComponents.createEmptyState(i18n.t('dashboard.noItems'));
        fragment.appendChild(empty);
      } else {
        uniqueTasks.forEach(({ item, priority, station, isCompleted }) => {
          const taskCard = UIComponents.createTaskCard(item, station, priority, isCompleted, config.unit_type);
          fragment.appendChild(taskCard);
        });
      }

      tasksContainer.appendChild(fragment);
    }
  },

  // Create all planned items upfront
  async createAllPlannedItems(config) {
    if (!config || !config.start_date) return;

    // Clean up duplicates first
    await this.cleanupDuplicateItems(config);

    const startDate = DateUtils.normalizeDate(config.start_date);
    const totalUnits = config.total_units || DEFAULT_CONFIG.TOTAL_UNITS;
    const unitType = config.unit_type || DEFAULT_CONFIG.UNIT_TYPE;
    const allItems = await Storage.getAllItems();

    // Create items for all planned units
    for (let day = 0; day < totalUnits; day++) {
      const itemDate = new Date(startDate);
      itemDate.setDate(itemDate.getDate() + day);
      const itemDateStr = DateUtils.getLocalDateString(itemDate);
      const itemNumber = day + 1;

      await this.createOrUpdateItem(unitType, itemNumber, itemDateStr, config, allItems);
    }
  },

  // Render progress view (timeline)
  async renderProgressView() {
    const config = await Storage.getConfig();
    if (!config) {
      await this.showView('setup-view');
      return;
    }

    // Ensure all planned items exist
    await this.createAllPlannedItems(config);

    let allItems = await Storage.getActiveItems();
    const timelineContainer = DOMCache.getElementById('progress-timeline');
    if (!timelineContainer) return;

    // --- Consistency Map (Activity Heatmap) ---
    let heatmapContainer = document.getElementById('consistency-map-container');
    if (!heatmapContainer) {
      heatmapContainer = document.createElement('div');
      heatmapContainer.id = 'consistency-map-container';
      timelineContainer.parentNode.insertBefore(heatmapContainer, timelineContainer);
    }
    heatmapContainer.replaceChildren();
    heatmapContainer.appendChild(UIComponents.createConsistencyMap(allItems));

    // --- Progression Filter Logic ---
    // 1. Get unique progression names
    const progressionNames = [...new Set(allItems.map(i => i.progression_name || 'Default'))].sort();

    // Only show filter if we have specific filter UI container (or inject it)
    // For now, we'll assume we can inject a filter bar at the top of timelineContainer if needed
    // But ideally, index.html should have a slot. We will prepend it to timelineContainer.

    // Check if filter bar exists or create it
    let filterBar = document.getElementById('progression-filter-bar');
    if (!filterBar) {
      filterBar = document.createElement('div');
      filterBar.id = 'progression-filter-bar';
      filterBar.style.cssText = 'padding: 1rem; display: flex; gap: 0.5rem; flex-wrap: wrap; align-items: center; border-bottom: 1px solid var(--border-color); margin-bottom: 1rem;';
      // Insert before timeline content
      timelineContainer.parentNode.insertBefore(filterBar, timelineContainer);
    }

    filterBar.replaceChildren();

    // Select Dropdown
    const select = document.createElement('select');
    select.className = 'input';
    select.style.flex = '1';

    const allOption = document.createElement('option');
    allOption.value = 'ALL';
    allOption.textContent = i18n.t('progress.allProgressions');
    select.appendChild(allOption);

    progressionNames.forEach(name => {
      const option = document.createElement('option');
      option.value = name;
      option.textContent = name;
      select.appendChild(option);
    });

    // Check if we have a saved filter preference
    const savedFilter = localStorage.getItem('progression_filter') || 'ALL';
    select.value = savedFilter;

    select.addEventListener('change', async (e) => {
      localStorage.setItem('progression_filter', e.target.value);
      await this.renderProgressView(); // re-render
    });

    filterBar.appendChild(select);

    // Filter items
    if (savedFilter !== 'ALL') {
      allItems = allItems.filter(i => (i.progression_name || 'Default') === savedFilter);

      // Add Edit Button only when a specific progression is selected
      const editBtn = document.createElement('button');
      editBtn.className = 'btn btn-outline btn-sm';
      // Edit Icon
      if (window.SVGUtils) {
        editBtn.appendChild(SVGUtils.createEditIcon());
      } else {
        editBtn.textContent = '✎';
      }
      editBtn.setAttribute('aria-label', i18n.t('common.edit'));

      editBtn.addEventListener('click', () => {
        // Infer configuration from the first item of this progression
        // We know they should share unit type, start date, etc. somewhat.
        // But simplified: we use the MAIN config if it matches, otherwise we might guess?
        // Current architecture: SINGLE main config but MULTIPLE items.
        // If we have mixed progressions, 'config' object might not handle them all.
        // NOTE: The app currently seems to support ONE active 'config' but multiple items in 'Storage'.
        // If we edit a 'progression' that is NOT the active main config, we might overwrite main config?
        // Assumption: Users want to edit the active parameters that generated these items.
        // We will pass the global config if it matches names, or try to reconstruct.

        // Reconstruct from items if needed, but for now use global config as base
        // and override with progression-specifics if we can find them.
        const progressionItems = allItems;
        let firstItem = progressionItems[0];

        // Try to find if this progression matches current global config
        let targetConfig = { ...config };
        if (config.progression_name !== savedFilter) {
          // We are editing a "legacy" or "other" progression
          // We need to guess its parameters.
          // This is tricky. Let's assume Unit Type from content ref check?
          // Actually, `createOrUpdateItem` uses config.unit_type.
          // If we don't store unit_type on item, we can't easily know.
          // BUT, we can make the user choose.
          targetConfig.progression_name = savedFilter;
          // Guess start date from oldest item
          const oldest = progressionItems.reduce((a, b) => a.date_memorized < b.date_memorized ? a : b);
          targetConfig.start_date = oldest.date_memorized;
          targetConfig.total_units = progressionItems.length; // Approximate
        }

        Dialog.showEditProgressionModal(targetConfig, (newData) => {
          // CONFIRMATION ALERT with MIGRATION logic
          Dialog.showShadcnAlert(
            i18n.t('progress.saveChanges'),
            i18n.t('progress.migrationWarning'),
            () => {
              this.migrateProgression(savedFilter, newData);
            },
            () => { } // Cancel does nothing
          );
        });
      });
      filterBar.appendChild(editBtn);
    }

    // Use DocumentFragment for batch DOM updates
    const fragment = document.createDocumentFragment();

    if (allItems.length === 0) {
      const empty = UIComponents.createEmptyState(i18n.t('dashboard.noItems'));
      fragment.appendChild(empty);
    } else {
      // Sort items by memorization date (oldest first)
      const sortedItems = [...allItems].sort((a, b) => {
        const dateA = new Date(a.date_memorized);
        const dateB = new Date(b.date_memorized);
        return dateA - dateB; // Oldest first
      });

      sortedItems.forEach(item => {
        const timelineItem = UIComponents.createProgressTimelineItem(item);
        fragment.appendChild(timelineItem);
      });
    }

    timelineContainer.replaceChildren();
    timelineContainer.appendChild(fragment);
  },

  // Legacy method for backward compatibility
  renderDailySchedule(targetDate = null) {
    this.renderTodayView(targetDate);
  },

  // Render a schedule section
  async renderScheduleSection(containerId, items, defaultStation) {
    const container = DOMCache.getElementById(containerId);
    if (!container) return;

    // Use DocumentFragment for batch DOM updates
    const fragment = document.createDocumentFragment();

    if (items.length === 0) {
      const empty = UIComponents.createEmptyState(i18n.t('dashboard.noItems'));
      fragment.appendChild(empty);
    } else {
      // Calculate isCompleted for each legacy schedule item
      const date = this.currentDate || new Date();
      const dateStr = DateUtils.getLocalDateString(date);

      for (const item of items) {
        const station = item.dueStation || defaultStation;
        const isCompleted = await Storage.isReviewCompleted(item.id, station, dateStr);
        const scheduleItem = UIComponents.createScheduleItem(item, station, isCompleted);
        fragment.appendChild(scheduleItem);
      }
    }

    container.replaceChildren();
    container.appendChild(fragment);
  },

  // Render settings view
  async renderSettingsView() {
    const config = await Storage.getConfig();
    if (!config) {
      await this.showView('setup-view');
      return;
    }

    // Initialize language toggle
    const languageToggle = DOMCache.getElementById('settings-language-toggle');
    if (languageToggle) {
      const selectedValue = config.language || DEFAULT_CONFIG.LANGUAGE;
      languageToggle.querySelectorAll('.toggle-option').forEach(btn => {
        if (btn.getAttribute('data-value') === selectedValue) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });
    }

    // Initialize theme toggle
    const themeToggle = DOMCache.getElementById('settings-theme-toggle');
    if (themeToggle) {
      const selectedValue = config.theme || DEFAULT_CONFIG.THEME;
      themeToggle.querySelectorAll('.toggle-option').forEach(btn => {
        if (btn.getAttribute('data-value') === selectedValue) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });
    }

    // Set time inputs
    const morningHourInput = DOMCache.getElementById('settings-morning-hour');
    const eveningHourInput = DOMCache.getElementById('settings-evening-hour');

    if (morningHourInput) {
      const morningHour = config.morning_hour !== undefined ? config.morning_hour : DEFAULT_CONFIG.MORNING_HOUR;
      morningHourInput.value = `${String(morningHour).padStart(2, '0')}:00`;
    }

    if (eveningHourInput) {
      const eveningHour = config.evening_hour !== undefined ? config.evening_hour : DEFAULT_CONFIG.EVENING_HOUR;
      eveningHourInput.value = `${String(eveningHour).padStart(2, '0')}:00`;
    }

    // Initialize toggle event listeners
    this.initSettingsToggles();
  },

  // Initialize settings toggle event listeners
  initSettingsToggles() {
    // Language toggle
    const languageToggle = DOMCache.getElementById('settings-language-toggle');
    if (languageToggle) {
      languageToggle.querySelectorAll('.toggle-option').forEach(btn => {
        btn.addEventListener('click', async () => {
          const value = btn.getAttribute('data-value');
          languageToggle.querySelectorAll('.toggle-option').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');

          const config = await Storage.getConfig();
          if (config) {
            config.language = value;
            await Storage.saveConfig(config);
            i18n.init(value);
            i18n.translatePage();
            this.updateLanguageToggles();
            await this.renderSettingsView();
          }
        });
      });
    }

    // Theme toggle
    const themeToggle = DOMCache.getElementById('settings-theme-toggle');
    if (themeToggle) {
      themeToggle.querySelectorAll('.toggle-option').forEach(btn => {
        btn.addEventListener('click', async () => {
          const value = btn.getAttribute('data-value');
          themeToggle.querySelectorAll('.toggle-option').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');

          const config = await Storage.getConfig();
          if (config) {
            config.theme = value;
            await Storage.saveConfig(config);
            await Theme.setTheme(value);
          }
        });
      });
    }

  },

  // Initialize UI event listeners
  initEventListeners() {
    // Setup form submission
    const setupForm = DOMCache.getElementById('setup-form');
    if (setupForm) {
      setupForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Get values from toggles
        const unitTypeToggle = DOMCache.getElementById('unit-type-toggle');
        const languageToggle = DOMCache.getElementById('setup-language-toggle');
        const themeToggle = DOMCache.getElementById('setup-theme-toggle');

        const unitType = unitTypeToggle?.querySelector('.toggle-option.active')?.getAttribute('data-value') || DEFAULT_CONFIG.UNIT_TYPE;
        const language = languageToggle?.querySelector('.toggle-option.active')?.getAttribute('data-value') || DEFAULT_CONFIG.LANGUAGE;
        const theme = themeToggle?.querySelector('.toggle-option.active')?.getAttribute('data-value') || DEFAULT_CONFIG.THEME;

        const startPageInput = document.getElementById('start-page');
        const startPage = (unitType === 'page' && startPageInput)
          ? parseInt(startPageInput.value) || 1
          : 1;

        const config = {
          unit_type: unitType,
          total_units: parseInt(document.getElementById('total-units').value) || 30,
          start_date: document.getElementById('start-date').value,
          progression_name: document.getElementById('progression-name').value || '',
          language: language,
          theme: theme,
          morning_hour: DEFAULT_CONFIG.MORNING_HOUR,
          evening_hour: DEFAULT_CONFIG.EVENING_HOUR,
          start_page: startPage
        };

        await Storage.saveConfig(config);

        // Create all items upfront so they appear in progress view
        await this.createAllPlannedItems(config);

        await Theme.setTheme(theme);
        i18n.init(language);
        i18n.translatePage();
        this.initTabNavigation();
        await this.showView('today-view');

        // Set current date to start_date so tasks for that day are shown
        // This ensures tasks are created for the selected day regardless of current time
        const startDate = new Date(config.start_date);
        this.currentDate = startDate;
        await this.renderTodayView(startDate);
      });
    }

    // Settings time inputs - save on change
    const morningHourInput = DOMCache.getElementById('settings-morning-hour');
    const eveningHourInput = DOMCache.getElementById('settings-evening-hour');

    if (morningHourInput) {
      morningHourInput.addEventListener('change', async () => {
        const config = await Storage.getConfig();
        if (config) {
          const morningTime = morningHourInput.value;
          config.morning_hour = parseInt(morningTime.split(':')[0]);
          await Storage.saveConfig(config);

          if (typeof Notifications !== 'undefined') {
            Notifications.schedule();
          }
        }
      });
    }

    if (eveningHourInput) {
      eveningHourInput.addEventListener('change', async () => {
        const config = await Storage.getConfig();
        if (config) {
          const eveningTime = eveningHourInput.value;
          config.evening_hour = parseInt(eveningTime.split(':')[0]);
          await Storage.saveConfig(config);

          if (typeof Notifications !== 'undefined') {
            Notifications.schedule();
          }
        }
      });
    }

    // Privacy Policy button
    const privacyBtn = DOMCache.getElementById('settings-privacy-btn');
    if (privacyBtn) {
      privacyBtn.addEventListener('click', () => {
        this.showView('privacy-view');
      });
    }

    // Privacy Policy back button
    const privacyBackBtn = DOMCache.getElementById('privacy-back-btn');
    if (privacyBackBtn) {
      privacyBackBtn.addEventListener('click', () => {
        this.showView('settings-view');
      });
    }

    // Export button
    const exportBtn = DOMCache.getElementById('settings-export-btn');
    if (exportBtn) {
      exportBtn.addEventListener('click', async () => {
        const data = await Storage.exportData();
        if (!data) return;

        const fileName = `quran-memorization-backup-${DateUtils ? DateUtils.getLocalDateString(new Date()) : new Date().toISOString().split('T')[0]}.json`;

        // Check if running in a Capacitor environment
        if (window.Capacitor && window.Capacitor.isNativePlatform()) {
          try {
            const { Filesystem } = Capacitor.Plugins;
            const { Share } = Capacitor.Plugins;

            if (!Filesystem || !Share) {
              throw new Error('Capacitor plugins not available. Ensure they are installed and synced.');
            }

            // Save the data to a temporary file
            const result = await Filesystem.writeFile({
              path: fileName,
              data: data,
              directory: 'CACHE', // Use CACHE directory for sharing
              encoding: 'utf8'
            });

            // Share the file
            await Share.share({
              title: i18n.t('settings.exportData'),
              text: 'Monthly Quran Backup',
              url: result.uri,
              dialogTitle: i18n.t('settings.exportData')
            });

          } catch (error) {
            Logger.error('Native export failed:', error);
            // Fallback to standard download if plugin fails or is missing
            this.handleBrowserDownload(data, fileName);
          }
        } else {
          // Standard browser download for PWA/Web
          this.handleBrowserDownload(data, fileName);
        }
      });
    }

    // Import button
    const importBtn = DOMCache.getElementById('settings-import-btn');
    if (importBtn) {
      importBtn.addEventListener('click', () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'application/json';
        input.addEventListener('change', (e) => {
          const file = e.target.files[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = async (event) => {
              Dialog.showImportConfirm(async () => {
                const success = await Storage.importData(event.target.result);
                if (success) {
                  const config = await Storage.getConfig();
                  if (config) {
                    await Theme.setTheme(config.theme || 'light');
                    i18n.init(config.language || 'en');
                    i18n.translatePage();
                    this.updateLanguageToggles();
                    await this.showView('today-view');
                    await this.renderTodayView();
                  }
                }
              });
            };
            reader.readAsText(file);
          }
        });
        input.click();
      });
    }

    // Reset button
    const resetBtn = DOMCache.getElementById('settings-reset-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        Dialog.showResetConfirm(async () => {
          await Storage.clearAll();
          await Theme.init();
          i18n.init(DEFAULT_CONFIG.LANGUAGE);
          i18n.translatePage();
          await this.showView('setup-view');
          await this.renderSetupView();
        });
      });
    }

    // Progress add button
    const progressAddBtn = DOMCache.getElementById('progress-add-btn');
    if (progressAddBtn) {
      progressAddBtn.addEventListener('click', () => {
        Dialog.showAddMemorizationModal(async (data) => {
          const { unitType, totalUnits, startDate, progressionName, startPage } = data;
          const config = await Storage.getConfig();

          if (config) {
            // Update config with new values (following the same logic as startup wizard)
            // This allows adding new memorization plans with different parameters
            config.unit_type = unitType;
            config.total_units = totalUnits;
            config.start_date = startDate;
            config.progression_name = progressionName;
            config.start_page = startPage || 1;
            await Storage.saveConfig(config);

            // Create all items upfront so they appear in progress view
            await this.createAllPlannedItems(config);

            await this.renderProgressView();
            await this.renderTodayView();
            if (window.Calendar) {
              Calendar.render();
            }
          }
        });
      });
    }

    // Theme toggles (all views) - use querySelectorAll for complex selector
    const themeToggles = document.querySelectorAll('#theme-toggle, #theme-toggle-progress, #theme-toggle-calendar, #theme-toggle-settings, #theme-toggle-credits');
    themeToggles.forEach(toggle => {
      toggle.addEventListener('click', () => {
        Theme.toggle();
      });
    });

    // Language toggles (all views) - use querySelectorAll for complex selector
    const languageToggles = document.querySelectorAll('#language-toggle, #language-toggle-progress, #language-toggle-calendar, #language-toggle-settings, #language-toggle-credits');
    languageToggles.forEach(toggle => {
      toggle.addEventListener('click', async () => {
        const config = await Storage.getConfig();
        if (config) {
          const currentLang = i18n.getLanguage();
          const newLang = currentLang === LANGUAGES.ENGLISH ? LANGUAGES.ARABIC : LANGUAGES.ENGLISH;
          config.language = newLang;
          await Storage.saveConfig(config);
          i18n.init(newLang);
          this.updateLanguageToggles();
          i18n.translatePage();
          // Re-render current view to update all text
          const activeView = document.querySelector('.view:not(.hidden)');
          if (activeView) {
            const viewId = activeView.id;
            if (viewId === 'today-view') {
              await this.renderTodayView();
            } else if (viewId === 'progress-view') {
              await this.renderProgressView();
            } else if (viewId === 'settings-view') {
              await this.renderSettingsView();
            } else if (viewId === 'credits-view') {
              // Credits view doesn't need special rendering, just translate
            } else if (viewId === 'calendar-view' && window.Calendar) {
              Calendar.setupNavigationButtons();
              Calendar.render();
            }
          }
          // Update navbar label after language change
          this.updateNavbarLabel();
        }
      });
    });
    this.updateLanguageToggles();

    // Calendar navigation is handled by Calendar.setupNavigationButtons()
    // which respects RTL/LTR language direction
  },

  // Update language toggle button text (all views)
  updateLanguageToggles() {
    // Use querySelectorAll for complex selector
    const languageToggles = document.querySelectorAll('#language-toggle, #language-toggle-progress, #language-toggle-calendar, #language-toggle-settings, #language-toggle-credits');
    const currentLang = i18n.getLanguage();
    languageToggles.forEach(toggle => {
      const langText = toggle.querySelector('.lang-text');
      if (langText) {
        langText.textContent = currentLang === LANGUAGES.ENGLISH ? 'AR' : 'EN';
      }
    });
  },

  // Legacy method for backward compatibility
  updateLanguageToggle: function () {
    this.updateLanguageToggles();
  },

  // Migrate Progression
  migrateProgression: async function (oldName, newData) {
    try {
      var allItems = await Storage.getAllItems();
      var oldItems = allItems.filter(function (i) { return (i.progression_name || 'Default') === oldName; }).sort(function (a, b) { return new Date(a.date_memorized) - new Date(b.date_memorized); });

      var startDate = DateUtils.normalizeDate(newData.start_date);
      var newItems = [];

      for (var i = 0; i < newData.total_units; i++) {
        var itemDate = new Date(startDate);
        itemDate.setDate(itemDate.getDate() + i);
        var itemDateStr = DateUtils.getLocalDateString(itemDate);
        var itemNumber = i + 1;

        var stableId = this.generateItemId(newData.unit_type, itemNumber, itemDateStr);

        var actualUnitNumber = itemNumber;
        if (newData.unit_type === 'page' && newData.start_page) {
          actualUnitNumber = newData.start_page + itemNumber - 1;
        }
        var contentRef = Algorithm.formatContentReference(newData.unit_type, actualUnitNumber);

        var newItem = {
          id: stableId,
          content_reference: contentRef,
          date_memorized: itemDateStr,
          status: ITEM_STATUS.ACTIVE,
          progression_name: newData.progression_name,
          reviews_completed: [],
          reviews_missed: []
        };

        if (i < oldItems.length) {
          var oldItem = oldItems[i];
          newItem.reviews_completed = (oldItem.reviews_completed || []).slice();
          newItem.reviews_missed = (oldItem.reviews_missed || []).slice();
        }

        newItems.push(newItem);
      }

      for (var j = 0; j < oldItems.length; j++) {
        await Storage.deleteItem(oldItems[j].id);
      }
      for (var k = 0; k < newItems.length; k++) {
        await Storage.saveItem(newItems[k]);
      }

      var currentConfig = await Storage.getConfig();
      if (currentConfig && (currentConfig.progression_name || 'Default') === oldName) {
        var mergedConfig = {};
        for (var key in currentConfig) { mergedConfig[key] = currentConfig[key]; }
        for (var key in newData) { mergedConfig[key] = newData[key]; }
        await Storage.saveConfig(mergedConfig);
      }

      localStorage.setItem('progression_filter', newData.progression_name);
      await this.renderProgressView();
      Dialog.showShadcnAlert(i18n.t('common.success'), i18n.t('progress.updateSuccess'), null, null, i18n.t('common.ok'), '', 'default');

    } catch (e) {
      Logger.error('Migration failed', e);
      Dialog.showShadcnAlert(i18n.t('common.error'), i18n.t('progress.updateError') + ': ' + e.message, null, null, i18n.t('common.ok'), '', 'destructive');
    }
  },

  // Helper for standard browser download
  handleBrowserDownload(data, fileName) {
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
};
