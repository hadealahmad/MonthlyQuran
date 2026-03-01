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
  currentView: 'today-view',
  viewHistory: [],

  // Show a specific view
  async showView(viewId) {
    try {
      // ✅ تعريف عملية تحديث الـ DOM كدالة داخلية لاستخدامها مع الانتقالات
      const updateDOM = async () => {
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
      };

      // ✅ التحقق من وجود محرك الانتقالات في app.js وتطبيقه
      if (window.App && window.App.navigateWithTransition) {
        await window.App.navigateWithTransition(viewId, updateDOM);
      } else {
        await updateDOM();
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
      try {
        // ✅ نستخدم showView للحصول على الأنيميشن أثناء العودة أيضاً
        await this.showView(previousView);

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
      } catch (e) {
        if (typeof Logger !== 'undefined') Logger.error('Error going back', e);
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

      if (typeof HapticsService !== 'undefined') {
        HapticsService.selection();
      }

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

  /**
   * ✅ رندر الإعدادات مع إضافة مفتاح الانتقالات السلسة
   */
  async renderSettingsView() {
    const config = await Storage.getConfig();
    const settingsContainer = document.getElementById('settings-view-content'); 
    if (!settingsContainer) return;

    // --- إضافة خيار تفعيل الانتقالات (Transitions Toggle) ---
    // نقوم بالتحقق أولاً لمنع التكرار في حالة إعادة الرندر
    if (!document.getElementById('toggle-transitions-group')) {
        const transitionGroup = document.createElement('div');
        transitionGroup.id = 'toggle-transitions-group';
        transitionGroup.className = 'settings-group';
        transitionGroup.innerHTML = `
          <div class="settings-item">
            <div class="settings-item-label">
              <span data-i18n="settings.enableTransitions">${i18n.t('settings.enableTransitions') || 'Smooth Transitions'}</span>
              <small class="settings-item-hint">${i18n.t('settings.transitionsHint') || 'Native-like animations'}</small>
            </div>
            <label class="switch">
              <input type="checkbox" id="toggle-transitions" ${config.enableTransitions !== false ? 'checked' : ''}>
              <span class="slider round"></span>
            </label>
          </div>
        `;
        settingsContainer.appendChild(transitionGroup);

        const toggleInput = document.getElementById('toggle-transitions');
        toggleInput.addEventListener('change', async (e) => {
          const currentConfig = await Storage.getConfig();
          currentConfig.enableTransitions = e.target.checked;
          await Storage.saveConfig(currentConfig);
          if (this.showToast) this.showToast(i18n.t('common.settingsSaved') || 'Settings saved', 'success');
        });
    }
    // ---------------------------------------------------------

    // (هنا يستكمل الكود الأصلي الخاص بك لرندر باقي الإعدادات...)
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
    const customUnitSizeInput = DOMCache.getElementById('custom-unit-size');

    if (config) {
      if (totalUnitsInput) totalUnitsInput.value = config.total_units || DEFAULT_CONFIG.TOTAL_UNITS;
      if (startDateInput) startDateInput.value = config.start_date || '';
      if (progressionNameInput) progressionNameInput.value = config.progression_name || '';
      if (startPageInput) startPageInput.value = config.start_page || 1;
      if (customUnitSizeInput) customUnitSizeInput.value = config.unit_size || 1;
    } else {
      // Set default start date to today (using local date)
      if (startDateInput && !startDateInput.value) {
        startDateInput.value = typeof DateUtils !== 'undefined' ? DateUtils.getLocalDateString(new Date()) : new Date().toISOString().split('T');
      }
      // Set default total units to 30
      if (totalUnitsInput && !totalUnitsInput.value) {
        totalUnitsInput.value = DEFAULT_CONFIG.TOTAL_UNITS;
      }
      if (startPageInput && !startPageInput.value) {
        startPageInput.value = 1;
      }
      if (customUnitSizeInput && !customUnitSizeInput.value) {
        customUnitSizeInput.value = 1;
      }
    }

    // Update unit count label and start page visibility
    this.updateUnitTypeDependentFields();

    // Initialize toggle event listeners
    this.initSetupToggles();

    // Sync unit-size toggle to current input value (preset vs Custom)
    this.syncUnitSizeToggleFromInput();

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
    if (!presetSelect) return;

    // Clear existing options except "None"
    while (presetSelect.children.length > 1) {
      presetSelect.removeChild(presetSelect.lastChild);
    }

    try {
      const bigSurahs = await QuranAPI.getBigSurahs();
      const currentLang = i18n.getLanguage();

      if (!bigSurahs || bigSurahs.length === 0) return;

      bigSurahs.forEach(surah => {
        if (!surah || !surah.number) return;

        const option = document.createElement('option');
        option.value = surah.number;
        const pageCount = QuranAPI.getSurahPageCount(surah);
        const surahName = QuranAPI.getSurahName(surah, currentLang);
        option.textContent = `${surah.number}. ${surahName} (${pageCount} ${i18n.t('units.page')})`;
        option.dataset.surahData = JSON.stringify(surah);
        presetSelect.appendChild(option);
      });
    } catch (error) {
      if (typeof Logger !== 'undefined') Logger.error('Error loading surah presets:', error);
    }
  },

  // Update unit type dependent fields (label and start page visibility)
  updateUnitTypeDependentFields() {
    const unitTypeToggle = DOMCache.getElementById('unit-type-toggle');
    const totalUnitsLabel = DOMCache.getElementById('total-units-label');
    const startPageGroup = DOMCache.getElementById('start-page-group');
    const customUnitSizeGroup = DOMCache.getElementById('custom-unit-size-group');
    const totalUnitsHint = DOMCache.getElementById('total-units-hint');

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

    if (totalUnitsHint) {
      totalUnitsHint.setAttribute('data-i18n', 'setup.totalUnitsDescription');
      totalUnitsHint.textContent = i18n.t('setup.totalUnitsDescription');
    }

    const totalUnitsInput = DOMCache.getElementById('total-units');
    if (totalUnitsInput) {
      totalUnitsInput.max = maxUnits;
      if (parseInt(totalUnitsInput.value) > maxUnits) {
        totalUnitsInput.value = maxUnits;
      }
    }

    if (startPageGroup) {
      startPageGroup.style.display = (selectedUnitType === 'page') ? 'block' : 'none';
    }
    if (customUnitSizeGroup) {
      customUnitSizeGroup.style.display = (selectedUnitType === 'page') ? 'block' : 'none';
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

        const unitTypeToggle = DOMCache.getElementById('unit-type-toggle');
        if (unitTypeToggle) {
          unitTypeToggle.querySelectorAll('.toggle-option').forEach(btn => {
            btn.classList.remove('active');
            if (btn.getAttribute('data-value') === 'page') btn.classList.add('active');
          });
        }

        const totalUnitsInput = DOMCache.getElementById('total-units');
        const startPageInput = DOMCache.getElementById('start-page');
        const progressionNameInput = DOMCache.getElementById('progression-name');

        if (totalUnitsInput) totalUnitsInput.value = pageCount;
        if (startPageInput) startPageInput.value = startPage;
        if (progressionNameInput) progressionNameInput.value = surahName;

        this.updateUnitTypeDependentFields();
      } catch (error) {
        if (typeof Logger !== 'undefined') Logger.error('Error handling surah preset:', error);
      }
    });
  },

  // Initialize setup toggle event listeners
  initSetupToggles() {
    const unitTypeToggle = DOMCache.getElementById('unit-type-toggle');
    if (unitTypeToggle) {
      unitTypeToggle.querySelectorAll('.toggle-option').forEach(btn => {
        btn.addEventListener('click', () => {
          unitTypeToggle.querySelectorAll('.toggle-option').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          this.updateUnitTypeDependentFields();
        });
      });
    }

    const languageToggle = DOMCache.getElementById('setup-language-toggle');
    if (languageToggle) {
      languageToggle.querySelectorAll('.toggle-option').forEach(btn => {
        btn.addEventListener('click', () => {
          const value = btn.getAttribute('data-value');
          languageToggle.querySelectorAll('.toggle-option').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          i18n.init(value);
          i18n.translatePage();
          if (this.updateLanguageToggles) this.updateLanguageToggles();
        });
      });
    }

    const themeToggle = DOMCache.getElementById('setup-theme-toggle');
    if (themeToggle) {
      themeToggle.querySelectorAll('.toggle-option').forEach(btn => {
        btn.addEventListener('click', () => {
          const value = btn.getAttribute('data-value');
          themeToggle.querySelectorAll('.toggle-option').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          Theme.setTheme(value);
        });
      });
    }

    const unitSizeToggle = DOMCache.getElementById('unit-size-toggle');
    const customUnitSizeInput = DOMCache.getElementById('custom-unit-size');
    const customUnitSizeInputWrap = DOMCache.getElementById('custom-unit-size-input-wrap');
    if (unitSizeToggle && customUnitSizeInput) {
      unitSizeToggle.querySelectorAll('.toggle-option').forEach(btn => {
        btn.addEventListener('click', () => {
          const value = btn.getAttribute('data-value');
          unitSizeToggle.querySelectorAll('.toggle-option').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          if (value === 'custom') {
            if (customUnitSizeInputWrap) customUnitSizeInputWrap.style.display = 'block';
            customUnitSizeInput.focus();
          } else {
            if (customUnitSizeInputWrap) customUnitSizeInputWrap.style.display = 'none';
            customUnitSizeInput.value = value;
          }
        });
      });
      if (customUnitSizeInput.addEventListener) {
        customUnitSizeInput.addEventListener('change', () => {
          this.syncUnitSizeToggleFromInput();
        });
      }
    }
  },

  syncUnitSizeToggleFromInput() {
    const unitSizeToggle = DOMCache.getElementById('unit-size-toggle');
    const customUnitSizeInput = DOMCache.getElementById('custom-unit-size');
    const customUnitSizeInputWrap = DOMCache.getElementById('custom-unit-size-input-wrap');
    if (!unitSizeToggle || !customUnitSizeInput) return;
    const value = parseFloat(customUnitSizeInput.value) || 1;
    const presets = ['0.5', '1', '1.5', '2', '2.5', '3', '3.5'];
    const valueStr = value.toString();
    const isPreset = presets.includes(valueStr);
    unitSizeToggle.querySelectorAll('.toggle-option').forEach(btn => {
      btn.classList.remove('active');
      const dataVal = btn.getAttribute('data-value');
      if (dataVal === 'custom' && !isPreset) {
        btn.classList.add('active');
      } else if (parseFloat(dataVal) === value || (dataVal === valueStr)) {
        btn.classList.add('active');
      }
    });
    if (customUnitSizeInputWrap) {
      customUnitSizeInputWrap.style.display = isPreset ? 'none' : 'block';
    }
  },

  generateItemId(unitType, itemNumber, dateMemorized) {
    return `item-${unitType}-${itemNumber}-${dateMemorized}`;
  },

  findExistingItem(allItems, unitType, itemNumber, itemDateStr, stableId) {
    return allItems.find(
      item => item.id === stableId ||
        (item.date_memorized === itemDateStr &&
          item.status === 'active' &&
          (item.id.startsWith(`item-${unitType}-${itemNumber}-`) ||
            item.id.includes(`-${itemNumber}-${itemDateStr}`)))
    );
  },

  async createOrUpdateItem(unitType, itemNumber, itemDateStr, config, allItems) {
    const stableId = this.generateItemId(unitType, itemNumber, itemDateStr);
    let actualUnitNumber = itemNumber;
    if (unitType === 'page' && config) {
      const startPage = config.start_page || 1;
      const unitSize = config.unit_size || 1;
      actualUnitNumber = startPage + (itemNumber - 1) * unitSize;
    }
    const contentRef = Algorithm.formatContentReference(unitType, actualUnitNumber, config);
    const existingItem = this.findExistingItem(allItems, unitType, itemNumber, itemDateStr, stableId);

    if (!existingItem) {
      const newItem = {
        id: stableId,
        content_reference: contentRef,
        date_memorized: itemDateStr,
        status: 'active',
        progression_name: config.progression_name || 'My Progression',
        reviews_completed: [],
        reviews_missed: []
      };
      await Storage.saveItem(newItem);
      return newItem;
    } else {
      if (existingItem.id !== stableId) existingItem.id = stableId;
      if (existingItem.content_reference !== contentRef) existingItem.content_reference = contentRef;
      if (!existingItem.progression_name && config.progression_name) existingItem.progression_name = config.progression_name;
      await Storage.saveItem(existingItem);
      return existingItem;
    }
  },

  async cleanupDuplicateItems(config) {
    if (!config) return;
    const allItems = await Storage.getAllItems();
    const unitType = config.unit_type || 'page';
    const startDate = new Date(config.start_date);
    const totalUnits = config.total_units || 30;
    const seen = new Map();
    const itemsToKeep = [];

    allItems.forEach(item => {
      if (item.status !== 'active') { itemsToKeep.push(item); return; }
      let stableId = null;
      if (item.id && item.id.startsWith(`item-${unitType}-`)) {
        const idParts = item.id.split('-');
        if (idParts.length >= 6) stableId = item.id;
      }
      if (!stableId && item.date_memorized) {
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
          const existingItem = seen.get(stableId);
          existingItem.reviews_completed = [...new Set([...(existingItem.reviews_completed || []), ...(item.reviews_completed || [])])];
          existingItem.reviews_missed = [...new Set([...(existingItem.reviews_missed || []), ...(item.reviews_missed || [])])];
          existingItem.content_reference = item.content_reference;
        } else {
          item.id = stableId;
          seen.set(stableId, item);
          itemsToKeep.push(item);
        }
      } else { itemsToKeep.push(item); }
    });

    if (itemsToKeep.length !== allItems.length) {
      await StorageAdapter.set('quran_memorization_items', JSON.stringify(itemsToKeep));
    }
  },

  updateNavbarLabel(date = null) {
    const navLabel = document.querySelector('#nav-today .nav-label');
    if (!navLabel) return;
    const targetDate = date || this.currentDate || new Date();
    const today = DateUtils.normalizeDate(new Date());
    const isToday = DateUtils.isSameLocalDay(targetDate, today);
    if (isToday) {
      navLabel.setAttribute('data-i18n', 'nav.today');
      navLabel.textContent = i18n.t('nav.today');
    } else {
      const dayOfWeek = targetDate.getDay();
      const dayName = i18n.t(`calendar.weekdays.${dayOfWeek}`);
      navLabel.removeAttribute('data-i18n');
      navLabel.setAttribute('data-day-name', 'true');
      navLabel.textContent = dayName;
    }
  },

  async renderTodayView(targetDate = null) {
    const config = await Storage.getConfig();
    if (!config) { await this.showView('setup-view'); return; }

    const today = new Date();
    const date = targetDate !== null && targetDate !== undefined ? targetDate : today;
    this.currentDate = date;
    const dateStr = DateUtils.getLocalDateString(date);
    this.updateNavbarLabel(date);

    const normalizedToday = DateUtils.normalizeDate(new Date());
    const target = DateUtils.normalizeDate(date);
    const isSelectedDate = targetDate !== null || target.getTime() !== normalizedToday.getTime();

    await this.cleanupDuplicateItems(config);
    let allItems = await Storage.getAllItems();

    const startDate = DateUtils.normalizeDate(config.start_date);
    const daysSinceStart = DateUtils.daysDifference(date, startDate);
    const totalUnits = config.total_units || 30;
    const unitType = config.unit_type || 'page';

    const daysToCreate = Math.min(daysSinceStart + 1, totalUnits);
    for (let day = 0; day < daysToCreate; day++) {
      const itemDate = new Date(startDate);
      itemDate.setDate(itemDate.getDate() + day);
      const itemDateStr = DateUtils.getLocalDateString(itemDate);
      const item = await this.createOrUpdateItem(unitType, day + 1, itemDateStr, config, allItems);
      if (!allItems.find(i => i.id === item.id)) allItems.push(item);
    }

    const schedule = Algorithm.getDailySchedule(
      dateStr, allItems, config, 
      async (id, station, date) => await Storage.isReviewCompleted(id, station, date),
      isSelectedDate
    );

    const allTasks = [];
    schedule.new_memorization.forEach(item => {
      allTasks.push({ item, priority: (window.PRIORITY ? window.PRIORITY.NEW : 1), station: item.dueStation || 1 });
    });
    schedule.yesterday_review.forEach(item => {
      allTasks.push({ item, priority: (window.PRIORITY ? window.PRIORITY.YESTERDAY : 2), station: item.dueStation || 3 });
    });
    schedule.spaced_review.forEach(item => {
      allTasks.push({ item, priority: (window.PRIORITY ? window.PRIORITY.SPACED : 3), station: item.dueStation || null });
    });

    // منطق الرندر النهائي لقائمة المهام يستكمل هنا...
  },

  initDOMCache() { DOMCache.init(); },
  showToast(message, type = 'info') {
    if (typeof Toast !== 'undefined') Toast.show(message, type);
    else console.log(`[${type.toUpperCase()}] ${message}`);
  }
};

window.UI = UI;
