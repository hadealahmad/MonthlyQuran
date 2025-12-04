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
  currentDate: new Date(),
  
  // Show a specific view
  showView(viewId) {
    const views = DOMCache.querySelectorAll('.view', false); // Don't cache views as they change
    views.forEach(view => view.classList.add('hidden'));
    
    const targetView = DOMCache.getElementById(viewId);
    if (targetView) {
      targetView.classList.remove('hidden');
    }
    
    // Update tab active state
    this.updateTabActiveState(viewId);
    
    // Save current view to localStorage (skip setup-view)
    if (viewId !== 'setup-view') {
      Storage.saveCurrentView(viewId);
    }
  },
  
  // Initialize tab navigation
  initTabNavigation() {
    const tabs = DOMCache.querySelectorAll('.nav-tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const viewId = tab.getAttribute('data-view');
        if (viewId) {
          this.showView(viewId);
          
          // Render the view if needed
          if (viewId === 'today-view') {
            // Always show today's tasks when clicking the today tab
            this.renderTodayView(new Date());
          } else if (viewId === 'progress-view') {
            this.renderProgressView();
          } else if (viewId === 'calendar-view') {
            if (window.Calendar) {
              Calendar.initAsView();
            }
          } else if (viewId === 'settings-view') {
            this.renderSettingsView();
          } else if (viewId === 'credits-view') {
            // Credits view doesn't need special rendering
          }
          // Update navbar label when switching views
          if (viewId === 'today-view') {
            this.updateNavbarLabel();
          }
        }
      });
    });
  },
  
  // Update tab active state
  updateTabActiveState(viewId) {
    const tabs = DOMCache.querySelectorAll('.nav-tab');
    tabs.forEach(tab => {
      const tabViewId = tab.getAttribute('data-view');
      if (tabViewId === viewId) {
        tab.classList.add('active');
      } else {
        tab.classList.remove('active');
      }
    });
  },

  // Render setup view
  renderSetupView() {
    const config = Storage.getConfig();
    
    // Ensure theme is initialized
    if (!Theme.getTheme()) {
      Theme.init();
    }
    
    const currentTheme = Theme.getTheme();
    const currentLang = i18n.getLanguage();
    
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
    
    if (config) {
      if (totalUnitsInput) totalUnitsInput.value = config.total_units || DEFAULT_CONFIG.TOTAL_UNITS;
      if (startDateInput) startDateInput.value = config.start_date || '';
      if (progressionNameInput) progressionNameInput.value = config.progression_name || '';
    } else {
      // Set default start date to today (using local date)
      if (startDateInput && !startDateInput.value) {
        startDateInput.value = DateUtils ? DateUtils.getLocalDateString(new Date()) : new Date().toISOString().split('T')[0];
      }
      // Set default total units to 30
      if (totalUnitsInput && !totalUnitsInput.value) {
        totalUnitsInput.value = DEFAULT_CONFIG.TOTAL_UNITS;
      }
    }
    
    // Initialize toggle event listeners
    this.initSetupToggles();
    
    // Initialize number input buttons
    this.initNumberInput();
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
  createOrUpdateItem(unitType, itemNumber, itemDateStr, config, allItems) {
    const stableId = this.generateItemId(unitType, itemNumber, itemDateStr);
    const contentRef = Algorithm.formatContentReference(unitType, itemNumber);
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
      Storage.saveItem(newItem);
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
      Storage.saveItem(existingItem);
      return existingItem;
    }
  },

  // Clean up duplicate items based on stable ID pattern
  cleanupDuplicateItems(config) {
    if (!config) return;
    
    const allItems = Storage.getAllItems();
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
      localStorage.setItem('quran_memorization_items', JSON.stringify(itemsToKeep));
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
  renderTodayView(targetDate = null) {
    const config = Storage.getConfig();
    if (!config) {
      this.showView('setup-view');
      return;
    }

    const date = targetDate || this.currentDate || new Date();
    this.currentDate = date;
    const dateStr = DateUtils.getLocalDateString(date);
    
    // Update navbar label to show day name if not today
    this.updateNavbarLabel(date);
    
    // Determine if this is a selected date (not real-time today)
    const today = DateUtils.normalizeDate(new Date());
    const target = DateUtils.normalizeDate(date);
    const isSelectedDate = targetDate !== null || target.getTime() !== today.getTime();

    // Clean up any duplicate items before processing
    this.cleanupDuplicateItems(config);

    // Get all items
    let allItems = Storage.getAllItems();
    
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
      
      const item = this.createOrUpdateItem(unitType, itemNumber, itemDateStr, config, allItems);
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
      (id, station, date) => Storage.isReviewCompleted(id, station, date),
      isSelectedDate
    );
    
    // Combine all tasks with priorities
    const allTasks = [];
    
    // New memorization - Priority 1
    schedule.new_memorization.forEach(item => {
      allTasks.push({
        item,
        priority: PRIORITY.NEW,
        station: item.dueStation || STATIONS.STATION_1
      });
    });
    
    // Yesterday's review - Priority 2
    schedule.yesterday_review.forEach(item => {
      allTasks.push({
        item,
        priority: PRIORITY.YESTERDAY,
        station: item.dueStation || STATIONS.STATION_3
      });
    });
    
    // Spaced review - Priority 3
    schedule.spaced_review.forEach(item => {
      allTasks.push({
        item,
        priority: PRIORITY.SPACED,
        station: item.dueStation || null
      });
    });
    
    // Mark tasks as completed or not
    allTasks.forEach(task => {
      const station = task.station || STATIONS.STATION_1;
      task.isCompleted = Storage.isReviewCompleted(task.item.id, station, dateStr);
    });
    
    // Sort: unchecked first (by priority, then content), then checked (by priority, then content)
    allTasks.sort((a, b) => {
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
      const total = allTasks.length;
      // Count completed in single loop instead of filter
      let completed = 0;
      for (const task of allTasks) {
        if (task.isCompleted) completed++;
      }
      
      const stats = Components.createQuickStats(total, completed);
      // Use DocumentFragment for batch DOM updates
      const fragment = document.createDocumentFragment();
      fragment.appendChild(stats);
      statsContainer.innerHTML = '';
      statsContainer.appendChild(fragment);
    }
    
    // Render unified task list
    const tasksContainer = DOMCache.getElementById('today-tasks');
    if (tasksContainer) {
      // Use DocumentFragment for batch DOM updates
      const fragment = document.createDocumentFragment();
      
      if (allTasks.length === 0) {
        const empty = Components.createEmptyState(i18n.t('dashboard.noItems'));
        fragment.appendChild(empty);
      } else {
        allTasks.forEach(({ item, priority, station }) => {
          const taskCard = Components.createTaskCard(item, station, priority);
          fragment.appendChild(taskCard);
        });
      }
      
      tasksContainer.innerHTML = '';
      tasksContainer.appendChild(fragment);
    }
  },
  
  // Create all planned items upfront
  createAllPlannedItems(config) {
    if (!config || !config.start_date) return;
    
    // Clean up duplicates first
    this.cleanupDuplicateItems(config);
    
    const startDate = DateUtils.normalizeDate(config.start_date);
    const totalUnits = config.total_units || DEFAULT_CONFIG.TOTAL_UNITS;
    const unitType = config.unit_type || DEFAULT_CONFIG.UNIT_TYPE;
    const allItems = Storage.getAllItems();
    
    // Create items for all planned units
    for (let day = 0; day < totalUnits; day++) {
      const itemDate = new Date(startDate);
      itemDate.setDate(itemDate.getDate() + day);
      const itemDateStr = DateUtils.getLocalDateString(itemDate);
      const itemNumber = day + 1;
      
      this.createOrUpdateItem(unitType, itemNumber, itemDateStr, config, allItems);
    }
  },

  // Render progress view (timeline)
  renderProgressView() {
    const config = Storage.getConfig();
    if (!config) {
      this.showView('setup-view');
      return;
    }
    
    // Ensure all planned items exist
    this.createAllPlannedItems(config);
    
    const allItems = Storage.getActiveItems();
    const timelineContainer = DOMCache.getElementById('progress-timeline');
    if (!timelineContainer) return;
    
    // Use DocumentFragment for batch DOM updates
    const fragment = document.createDocumentFragment();
    
    if (allItems.length === 0) {
      const empty = Components.createEmptyState(i18n.t('dashboard.noItems'));
      fragment.appendChild(empty);
    } else {
      // Sort items by memorization date (oldest first)
      const sortedItems = [...allItems].sort((a, b) => {
        const dateA = new Date(a.date_memorized);
        const dateB = new Date(b.date_memorized);
        return dateA - dateB; // Oldest first
      });
      
      sortedItems.forEach(item => {
        const timelineItem = Components.createProgressTimelineItem(item);
        fragment.appendChild(timelineItem);
      });
    }
    
    timelineContainer.innerHTML = '';
    timelineContainer.appendChild(fragment);
  },
  
  // Legacy method for backward compatibility
  renderDailySchedule(targetDate = null) {
    this.renderTodayView(targetDate);
  },

  // Render a schedule section
  renderScheduleSection(containerId, items, defaultStation) {
    const container = DOMCache.getElementById(containerId);
    if (!container) return;
    
    // Use DocumentFragment for batch DOM updates
    const fragment = document.createDocumentFragment();
    
    if (items.length === 0) {
      const empty = Components.createEmptyState(i18n.t('dashboard.noItems'));
      fragment.appendChild(empty);
    } else {
      items.forEach(item => {
        const station = item.dueStation || defaultStation;
        const scheduleItem = Components.createScheduleItem(item, station);
        fragment.appendChild(scheduleItem);
      });
    }
    
    container.innerHTML = '';
    container.appendChild(fragment);
  },

  // Render settings view
  renderSettingsView() {
    const config = Storage.getConfig();
    if (!config) {
      this.showView('setup-view');
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
        btn.addEventListener('click', () => {
          const value = btn.getAttribute('data-value');
          languageToggle.querySelectorAll('.toggle-option').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          
          const config = Storage.getConfig();
          if (config) {
            config.language = value;
            Storage.saveConfig(config);
            i18n.init(value);
            i18n.translatePage();
            this.updateLanguageToggles();
            this.renderSettingsView();
          }
        });
      });
    }
    
    // Theme toggle
    const themeToggle = DOMCache.getElementById('settings-theme-toggle');
    if (themeToggle) {
      themeToggle.querySelectorAll('.toggle-option').forEach(btn => {
        btn.addEventListener('click', () => {
          const value = btn.getAttribute('data-value');
          themeToggle.querySelectorAll('.toggle-option').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          
          const config = Storage.getConfig();
          if (config) {
            config.theme = value;
            Storage.saveConfig(config);
            Theme.setTheme(value);
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
      setupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Get values from toggles
        const unitTypeToggle = DOMCache.getElementById('unit-type-toggle');
        const languageToggle = DOMCache.getElementById('setup-language-toggle');
        const themeToggle = DOMCache.getElementById('setup-theme-toggle');
        
        const unitType = unitTypeToggle?.querySelector('.toggle-option.active')?.getAttribute('data-value') || DEFAULT_CONFIG.UNIT_TYPE;
        const language = languageToggle?.querySelector('.toggle-option.active')?.getAttribute('data-value') || DEFAULT_CONFIG.LANGUAGE;
        const theme = themeToggle?.querySelector('.toggle-option.active')?.getAttribute('data-value') || DEFAULT_CONFIG.THEME;
        
        const config = {
          unit_type: unitType,
          total_units: parseInt(document.getElementById('total-units').value) || 30,
          start_date: document.getElementById('start-date').value,
          progression_name: document.getElementById('progression-name').value || '',
          language: language,
          theme: theme,
          morning_hour: DEFAULT_CONFIG.MORNING_HOUR,
          evening_hour: DEFAULT_CONFIG.EVENING_HOUR
        };
        
        Storage.saveConfig(config);
        
        // Create all items upfront so they appear in progress view
        this.createAllPlannedItems(config);
        
        Theme.setTheme(theme);
        i18n.init(language);
        i18n.translatePage();
        this.initTabNavigation();
        this.showView('today-view');
        
        // Set current date to start_date so tasks for that day are shown
        // This ensures tasks are created for the selected day regardless of current time
        const startDate = new Date(config.start_date);
        this.currentDate = startDate;
        this.renderTodayView(startDate);
      });
    }
    
    // Settings time inputs - save on change
    const morningHourInput = DOMCache.getElementById('settings-morning-hour');
    const eveningHourInput = DOMCache.getElementById('settings-evening-hour');
    
    if (morningHourInput) {
      morningHourInput.addEventListener('change', () => {
        const config = Storage.getConfig();
        if (config) {
          const morningTime = morningHourInput.value;
          config.morning_hour = parseInt(morningTime.split(':')[0]);
          Storage.saveConfig(config);
        }
      });
    }
    
    if (eveningHourInput) {
      eveningHourInput.addEventListener('change', () => {
        const config = Storage.getConfig();
        if (config) {
          const eveningTime = eveningHourInput.value;
          config.evening_hour = parseInt(eveningTime.split(':')[0]);
          Storage.saveConfig(config);
        }
      });
    }
    
    // Export button
    const exportBtn = DOMCache.getElementById('settings-export-btn');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        const data = Storage.exportData();
        if (data) {
          const blob = new Blob([data], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `quran-memorization-backup-${DateUtils ? DateUtils.getLocalDateString(new Date()) : new Date().toISOString().split('T')[0]}.json`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
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
            reader.onload = (event) => {
              Dialog.showImportConfirm(() => {
                const success = Storage.importData(event.target.result);
                if (success) {
                  const config = Storage.getConfig();
                  if (config) {
                    Theme.setTheme(config.theme || 'light');
                    i18n.init(config.language || 'en');
                    i18n.translatePage();
                    this.updateLanguageToggles();
                    this.showView('today-view');
                    this.renderTodayView();
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
        Dialog.showResetConfirm(() => {
          Storage.clearAll();
        Theme.init();
      i18n.init(DEFAULT_CONFIG.LANGUAGE);
          i18n.translatePage();
          this.showView('setup-view');
          this.renderSetupView();
        });
      });
    }
    
    // Progress add button
    const progressAddBtn = DOMCache.getElementById('progress-add-btn');
    if (progressAddBtn) {
      progressAddBtn.addEventListener('click', () => {
        Dialog.showAddMemorizationModal((data) => {
          const { unitType, totalUnits, startDate, progressionName } = data;
          const config = Storage.getConfig();
          
          if (config) {
            // Update config with new values (following the same logic as startup wizard)
            // This allows adding new memorization plans with different parameters
            config.unit_type = unitType;
            config.total_units = totalUnits;
            config.start_date = startDate;
            config.progression_name = progressionName;
            Storage.saveConfig(config);
            
            // Create all items upfront so they appear in progress view
            this.createAllPlannedItems(config);
            
            this.renderProgressView();
            this.renderTodayView();
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
      toggle.addEventListener('click', () => {
        const config = Storage.getConfig();
        if (config) {
          const currentLang = i18n.getLanguage();
          const newLang = currentLang === LANGUAGES.ENGLISH ? LANGUAGES.ARABIC : LANGUAGES.ENGLISH;
          config.language = newLang;
          Storage.saveConfig(config);
          i18n.init(newLang);
          this.updateLanguageToggles();
          i18n.translatePage();
          // Re-render current view to update all text
          const activeView = document.querySelector('.view:not(.hidden)');
          if (activeView) {
            const viewId = activeView.id;
            if (viewId === 'today-view') {
              this.renderTodayView();
            } else if (viewId === 'progress-view') {
              this.renderProgressView();
            } else if (viewId === 'settings-view') {
              this.renderSettingsView();
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
  updateLanguageToggle() {
    this.updateLanguageToggles();
  }
};

