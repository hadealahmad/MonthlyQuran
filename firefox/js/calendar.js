// Calendar Component

const Calendar = {
  currentMonth: new Date().getMonth(),
  currentYear: new Date().getFullYear(),
  selectedDate: null,
  selectedProgression: 'all', // 'all' or progression ID
  lastProgressionList: null, // Track progression list to avoid unnecessary updates

  // Initialize calendar
  init() {
    // Get current date from UI context or use today
    if (window.UI && window.UI.currentDate) {
      this.selectedDate = new Date(window.UI.currentDate);
    } else {
      this.selectedDate = new Date();
    }
    this.currentMonth = this.selectedDate.getMonth();
    this.currentYear = this.selectedDate.getFullYear();
  },

  // Initialize calendar as a view (replaces modal open)
  async initAsView() {
    this.init();
    this.setupNavigationButtons();
    // Initialize progression list tracking
    const allItems = await Storage.getAllItems();
    this.lastProgressionList = this.getProgressionList(allItems);
    await this.updateProgressionFilter();
    await this.render();
  },

  // Set up navigation buttons based on language direction (RTL/LTR)
  setupNavigationButtons() {
    const calendarPrevMonth = document.getElementById('calendar-prev-month');
    const calendarNextMonth = document.getElementById('calendar-next-month');

    if (!calendarPrevMonth || !calendarNextMonth) {
      return;
    }

    // Remove existing event listeners by cloning elements
    const newPrevMonth = calendarPrevMonth.cloneNode(true);
    const newNextMonth = calendarNextMonth.cloneNode(true);
    calendarPrevMonth.parentNode.replaceChild(newPrevMonth, calendarPrevMonth);
    calendarNextMonth.parentNode.replaceChild(newNextMonth, calendarNextMonth);

    // Check if current language is RTL (Arabic)
    const isRTL = i18n.getLanguage() === 'ar';

    // In RTL: left button (visually right) goes to next month, right button (visually left) goes to prev month
    // In LTR: left button goes to prev month, right button goes to next month
    if (isRTL) {
      // Debounce navigation to prevent rapid clicks
      const debouncedNextMonth = debounce(() => {
        if (window.Calendar) {
          Calendar.nextMonth();
        }
      }, 150);
      const debouncedPrevMonth = debounce(() => {
        if (window.Calendar) {
          Calendar.prevMonth();
        }
      }, 150);

      newPrevMonth.addEventListener('click', debouncedNextMonth);
      newNextMonth.addEventListener('click', debouncedPrevMonth);
    } else {
      // Debounce navigation to prevent rapid clicks
      const debouncedPrevMonth = debounce(() => {
        if (window.Calendar) {
          Calendar.prevMonth();
        }
      }, 150);
      const debouncedNextMonth = debounce(() => {
        if (window.Calendar) {
          Calendar.nextMonth();
        }
      }, 150);

      newPrevMonth.addEventListener('click', debouncedPrevMonth);
      newNextMonth.addEventListener('click', debouncedNextMonth);
    }
  },

  // Legacy methods for backward compatibility
  open() {
    if (window.UI) {
      window.UI.showView('calendar-view');
      this.initAsView();
    }
  },

  close() {
    // Calendar is now a view, so closing means navigating away
    // This is handled by tab navigation
  },

  // Render calendar for current month
  async render() {
    const config = await Storage.getConfig();
    const allItems = config ? await Storage.getAllItems() : [];

    // Update progression filter only if progression list has changed
    const currentProgressionList = this.getProgressionList(allItems);
    if (JSON.stringify(currentProgressionList) !== JSON.stringify(this.lastProgressionList)) {
      this.lastProgressionList = currentProgressionList;
      await this.updateProgressionFilter();
    }

    // Update month/year header
    const monthYearEl = document.getElementById('calendar-month-year');
    if (monthYearEl) {
      // Get month names from i18n
      const monthNames = [
        i18n.t('calendar.months.0'), i18n.t('calendar.months.1'), i18n.t('calendar.months.2'),
        i18n.t('calendar.months.3'), i18n.t('calendar.months.4'), i18n.t('calendar.months.5'),
        i18n.t('calendar.months.6'), i18n.t('calendar.months.7'), i18n.t('calendar.months.8'),
        i18n.t('calendar.months.9'), i18n.t('calendar.months.10'), i18n.t('calendar.months.11')
      ];
      const monthName = monthNames[this.currentMonth] || `Month ${this.currentMonth + 1}`;
      monthYearEl.textContent = `${monthName} ${this.currentYear}`;
    }

    // Get first day of month and number of days
    const firstDay = new Date(this.currentYear, this.currentMonth, 1);
    const lastDay = new Date(this.currentYear, this.currentMonth + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    // Get task counts for this month (empty if no config)
    const taskCounts = config ? this.getTaskCountsForMonth(allItems, config, this.currentYear, this.currentMonth) : {};

    // Render calendar grid
    const grid = document.getElementById('calendar-grid');
    if (!grid) {
      Logger.error('Calendar grid element not found');
      return;
    }

    // Use DocumentFragment for batch DOM updates
    const fragment = document.createDocumentFragment();

    // Day headers
    const weekdays = [
      i18n.t('calendar.weekdays.0'), i18n.t('calendar.weekdays.1'), i18n.t('calendar.weekdays.2'),
      i18n.t('calendar.weekdays.3'), i18n.t('calendar.weekdays.4'), i18n.t('calendar.weekdays.5'),
      i18n.t('calendar.weekdays.6')
    ];
    weekdays.forEach(day => {
      const header = document.createElement('div');
      header.className = 'calendar-day-header';
      header.textContent = day;
      fragment.appendChild(header);
    });

    // Empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      const empty = document.createElement('div');
      empty.className = 'calendar-day empty';
      fragment.appendChild(empty);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(this.currentYear, this.currentMonth, day);
      const dateStr = DateUtils ? DateUtils.getLocalDateString(date) : date.toISOString().split('T')[0];

      const dayEl = document.createElement('div');
      dayEl.className = 'calendar-day';

      const isToday = this.isToday(date);

      // Check if this is the selected date (from UI context)
      const selectedDateStr = window.UI && window.UI.currentDate
        ? (DateUtils ? DateUtils.getLocalDateString(window.UI.currentDate) : window.UI.currentDate.toISOString().split('T')[0])
        : null;
      const isSelected = selectedDateStr === dateStr;

      if (isToday) {
        dayEl.classList.add('today');
      }
      if (isSelected) {
        dayEl.classList.add('selected');
      }

      // Day number
      const dayNumber = document.createElement('div');
      dayNumber.className = 'calendar-day-number';
      dayNumber.textContent = day;
      dayEl.appendChild(dayNumber);

      // Task indicators (colored circles at bottom)
      const taskData = taskCounts[dateStr];
      if (taskData) {
        const taskIndicators = document.createElement('div');
        taskIndicators.className = 'calendar-task-indicators';

        // New memorization (Priority 1 - Blue)
        if (taskData.new_memorization > 0) {
          const indicator = document.createElement('div');
          indicator.className = 'calendar-task-indicator calendar-task-indicator-new';
          indicator.textContent = taskData.new_memorization;
          indicator.title = i18n.t('calendar.newTaskCount', { count: taskData.new_memorization });
          taskIndicators.appendChild(indicator);
        }

        // Yesterday review (Priority 2 - Orange)
        if (taskData.yesterday_review > 0) {
          const indicator = document.createElement('div');
          indicator.className = 'calendar-task-indicator calendar-task-indicator-yesterday';
          indicator.textContent = taskData.yesterday_review;
          indicator.title = i18n.t('calendar.yesterdayTaskCount', { count: taskData.yesterday_review });
          taskIndicators.appendChild(indicator);
        }

        // Spaced review (Priority 3 - Green)
        if (taskData.spaced_review > 0) {
          const indicator = document.createElement('div');
          indicator.className = 'calendar-task-indicator calendar-task-indicator-spaced';
          indicator.textContent = taskData.spaced_review;
          indicator.title = i18n.t('calendar.spacedTaskCount', { count: taskData.spaced_review });
          taskIndicators.appendChild(indicator);
        }

        dayEl.appendChild(taskIndicators);
      }

      // Click handler
      dayEl.addEventListener('click', () => {
        this.selectDate(date);
      });

      fragment.appendChild(dayEl);
    }

    // Batch update DOM
    grid.replaceChildren();
    grid.appendChild(fragment);
  },

  // Get task counts for a specific month (by type)
  getTaskCountsForMonth(allItems, config, year, month) {
    const taskCountsByDate = {};
    const startDate = new Date(config.start_date);

    // Get all active items
    let activeItems = allItems.filter(item => item.status === 'active');

    // Filter by selected progression if needed
    if (this.selectedProgression !== 'all') {
      activeItems = activeItems.filter(item => item.progression_name === this.selectedProgression);
    }

    // Calculate task counts for each day in the month
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(year, month, day);
      const dateStr = DateUtils ? DateUtils.getLocalDateString(date) : date.toISOString().split('T')[0];

      // Get schedule for this day using the algorithm
      // For calendar view, treat all dates as selected dates (show all tasks)
      const schedule = Algorithm.getDailySchedule(
        dateStr,
        activeItems,
        config,
        async (id, station, date) => await Storage.isReviewCompleted(id, station, date),
        true // isSelectedDate = true for calendar view
      );

      // Count tasks by type for this day
      const newMemCount = schedule.new_memorization.length;
      const yesterdayCount = schedule.yesterday_review.length;
      const spacedCount = schedule.spaced_review.length;

      if (newMemCount > 0 || yesterdayCount > 0 || spacedCount > 0) {
        taskCountsByDate[dateStr] = {
          new_memorization: newMemCount,
          yesterday_review: yesterdayCount,
          spaced_review: spacedCount
        };
      }
    }

    return taskCountsByDate;
  },

  // Get list of progression names from items
  getProgressionList(allItems) {
    const progressionNames = new Set();
    allItems.forEach(item => {
      if (item.progression_name && item.progression_name.trim()) {
        progressionNames.add(item.progression_name);
      }
    });
    return Array.from(progressionNames).sort();
  },

  // Update progression filter dropdown
  async updateProgressionFilter() {
    const filterSelect = document.getElementById('calendar-progression-filter');
    if (!filterSelect) {
      Logger.warn('Calendar progression filter element not found');
      return;
    }

    const allItems = await Storage.getAllItems();

    // Get unique progression names
    const sortedNames = this.getProgressionList(allItems);

    // Store current selection before updating
    const currentSelection = this.selectedProgression;

    // Check if options need to be updated by comparing with existing options
    const existingOptions = Array.from(filterSelect.options).map(opt => opt.value);
    const newOptions = ['all', ...sortedNames];
    const optionsChanged = JSON.stringify(existingOptions) !== JSON.stringify(newOptions);

    if (optionsChanged) {
      // Clear existing options
      // Clear existing options
      while (filterSelect.firstChild) {
        filterSelect.removeChild(filterSelect.firstChild);
      }

      // Add "All" option
      const allOption = document.createElement('option');
      allOption.value = 'all';
      allOption.textContent = i18n.t('calendar.filterAll');
      filterSelect.appendChild(allOption);

      // Add progression name options
      sortedNames.forEach(name => {
        const option = document.createElement('option');
        option.value = name;
        option.textContent = name;
        filterSelect.appendChild(option);
      });
    }

    // Set selected value, defaulting to 'all' if the selected progression doesn't exist
    if (currentSelection === 'all' || sortedNames.includes(currentSelection)) {
      filterSelect.value = currentSelection;
      this.selectedProgression = currentSelection;
    } else {
      filterSelect.value = 'all';
      this.selectedProgression = 'all';
    }

    // Only set up event listener if it doesn't exist (check by data attribute)
    if (!filterSelect.dataset.listenerAttached) {
      filterSelect.dataset.listenerAttached = 'true';
      filterSelect.addEventListener('change', (e) => {
        this.selectedProgression = e.target.value;
        this.render();
      });
    }
  },

  // Select a date
  selectDate(date) {
    this.selectedDate = date;

    // Update UI current date and navigate to Today view
    if (window.UI) {
      window.UI.currentDate = date;
      window.UI.showView('today-view');
      window.UI.renderTodayView(date);
      // updateNavbarLabel is called inside renderTodayView
    }
  },

  // Navigate to previous month
  async prevMonth() {
    this.currentMonth--;
    if (this.currentMonth < 0) {
      this.currentMonth = 11;
      this.currentYear--;
    }
    await this.render();
  },

  // Navigate to next month
  async nextMonth() {
    this.currentMonth++;
    if (this.currentMonth > 11) {
      this.currentMonth = 0;
      this.currentYear++;
    }
    await this.render();
  },

  // Check if date is today (using device local time)
  isToday(date) {
    const today = new Date();
    return DateUtils ? DateUtils.isSameLocalDay(date, today) : this.isSameDay(date, today);
  },

  // Check if two dates are the same day (using device local time)
  isSameDay(date1, date2) {
    if (DateUtils) {
      return DateUtils.isSameLocalDay(date1, date2);
    }
    return date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate();
  }
};

// Expose Calendar to window for use in other modules
window.Calendar = Calendar;

