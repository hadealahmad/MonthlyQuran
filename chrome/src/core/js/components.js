// shadcn-inspired UI Elements Library
// Note: Named UIComponents to avoid collision with Firefox's deprecated internal objects.

const UIComponents = {
  // Create a button element
  createButton(text, variant = 'default', size = 'default', onClick = null) {
    const button = document.createElement('button');
    button.className = `btn btn-${variant} btn-${size}`;
    button.textContent = text;

    if (onClick) {
      button.addEventListener('click', onClick);
    }

    return button;
  },

  // Create a task card with priority badge
  createTaskCard(item, stationNumber = null, priority = 1, isCompleted = false, unitType = 'page', unitSize = null, config = null) {
    const card = document.createElement('div');
    card.className = 'schedule-item';
    card.dataset.itemId = item.id;

    // Use current date from UI context (using local date)
    const currentDate = window.UI && window.UI.currentDate
      ? (DateUtils ? DateUtils.getLocalDateString(window.UI.currentDate) : window.UI.currentDate.toISOString().split('T')[0])
      : (DateUtils ? DateUtils.getLocalDateString(new Date()) : new Date().toISOString().split('T')[0]);

    // stationNumber or default to 1 for checking completion
    const station = stationNumber || 1;
    // isCompleted is now passed as an argument to avoid async calls during rendering

    if (isCompleted) {
      card.classList.add('completed');
    }

    const content = document.createElement('div');
    content.className = 'schedule-item-content';

    const info = document.createElement('div');
    info.className = 'schedule-item-info';

    const title = document.createElement('h3');
    title.className = 'schedule-item-title';

    // Dynamic title: show page range when unit_size > 1 (e.g. "Page 1–4½"), else single unit label
    if (item.id && item.id.startsWith('item-')) {
      const parts = item.id.split('-');
      if (parts.length >= 3) {
        const idUnitType = parts[1];
        const itemNumber = parseInt(parts[2], 10);
        if (!isNaN(itemNumber)) {
          const size = unitSize != null ? parseFloat(unitSize) : 1;
          if (idUnitType === 'page' && size > 1 && config && config.start_page != null) {
            const startPage = (config.start_page || 1) + (itemNumber - 1) * size;
            const endPage = startPage + size;
            title.textContent = Algorithm.formatPageRangeLabel(idUnitType, startPage, endPage);
          } else {
            const actualNumber = typeof Algorithm.calculateActualUnitNumber === 'function'
              ? Algorithm.calculateActualUnitNumber(idUnitType, itemNumber, config)
              : itemNumber;
            title.textContent = Algorithm.formatContentReference(idUnitType, actualNumber, config);
          }
        } else {
          title.textContent = item.content_reference;
        }
      } else {
        title.textContent = item.content_reference;
      }
    } else {
      title.textContent = item.content_reference;
    }
    info.appendChild(title);

    const meta = document.createElement('div');
    meta.className = 'schedule-item-meta';

    // Priority badge
    const badge = document.createElement('span');
    let priorityClass = 'priority-spaced';
    let priorityText = i18n.t('today.prioritySpaced');

    // Use priority constants safely (fall back to numeric values if global object missing)
    const PRIORITY_NEW = (window.PRIORITY && window.PRIORITY.NEW) || 1;
    const PRIORITY_YESTERDAY = (window.PRIORITY && window.PRIORITY.YESTERDAY) || 2;

    if (priority === PRIORITY_NEW) {
      priorityClass = 'priority-new';
      priorityText = i18n.t('today.priorityNew');
    } else if (priority === PRIORITY_YESTERDAY) {
      priorityClass = 'priority-yesterday';
      priorityText = i18n.t('today.priorityYesterday');
    }

    badge.className = `priority-badge ${priorityClass}`;
    badge.textContent = priorityText;
    meta.appendChild(badge);

    // Station label
    const stationLabel = document.createElement('span');
    stationLabel.className = 'station-label';
    stationLabel.textContent = i18n.t(`stations.${station}`);
    meta.appendChild(stationLabel);

    info.appendChild(meta);
    content.appendChild(info);

    const actions = document.createElement('div');
    actions.className = 'schedule-item-actions';

    // Checkbox
    const checkbox = document.createElement('button');
    checkbox.type = 'button';
    checkbox.className = `checkbox ${isCompleted ? 'checked' : ''}`;
    checkbox.disabled = false;
    checkbox.tabIndex = 0;
    const ariaLabel = isCompleted ? i18n.t('aria.markIncomplete') : i18n.t('aria.markComplete');
    checkbox.setAttribute('aria-label', ariaLabel);

    // Use SVG utils instead of innerHTML
    if (typeof SVGUtils !== 'undefined') {
      const svgIcon = isCompleted ? SVGUtils.createCheckboxChecked() : SVGUtils.createCheckboxUnchecked();
      checkbox.appendChild(svgIcon);
    } else {
      checkbox.textContent = isCompleted ? '✓' : '';
    }

    // Use arrow function to preserve context
    checkbox.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();

      // Ensure Storage is available and has the method
      if (!Storage || typeof Storage.isReviewCompleted !== 'function') {
        Logger.error('Storage not available or missing method');
        return;
      }

      // Determine current completion status for animation
      const uiDate = window.UI && window.UI.currentDate ? window.UI.currentDate : new Date();
      const currentDateStr = (typeof DateUtils !== 'undefined' && DateUtils.getLocalDateString)
        ? DateUtils.getLocalDateString(uiDate)
        : uiDate.toISOString().split('T')[0];
      const station = stationNumber || 1;
      const currentlyCompleted = await Storage.isReviewCompleted(item.id, station, currentDateStr);

      // Add appropriate animation class
      if (currentlyCompleted) {
        card.classList.add('unchecking');
      } else {
        card.classList.add('checking');
      }

      // Wait for animation to complete
      setTimeout(async () => {
        if (currentlyCompleted) {
          if (typeof HapticsService !== 'undefined') HapticsService.light();
          await Storage.unmarkReviewComplete(item.id, station, currentDateStr);
        } else {
          if (typeof HapticsService !== 'undefined') HapticsService.success();
          await Storage.markReviewComplete(item.id, station, currentDateStr);
        }

        // Re-render the view, preserving the current date context
        if (window.UI && window.UI.renderTodayView) {
          await window.UI.renderTodayView(uiDate);
        }
      }, 300); // 300ms matches CSS transition duration
    });

    // Add checkbox first
    actions.appendChild(checkbox);

    // Read icon button (if online and unit type is page) - placed on opposite side from checkbox
    if (navigator.onLine && unitType === 'page') {
      // Extract page number from content_reference (handles fractional numbers like "3½" or "3.5")
      // Try to match fractional notation first (e.g., "3½", "1¼", "2¾")
      let pageNumber = null;
      const fractionalMatch = item.content_reference.match(/(\d+)([½¼¾])/);
      if (fractionalMatch) {
        const whole = parseInt(fractionalMatch[1]);
        const fraction = fractionalMatch[2];
        if (fraction === '½') pageNumber = whole + 0.5;
        else if (fraction === '¼') pageNumber = whole + 0.25;
        else if (fraction === '¾') pageNumber = whole + 0.75;
      } else {
        // Try decimal format (e.g., "3.5")
        const decimalMatch = item.content_reference.match(/(\d+\.?\d*)/);
        if (decimalMatch) {
          pageNumber = parseFloat(decimalMatch[1]);
        } else {
          // Fallback to integer
          const intMatch = item.content_reference.match(/\d+/);
          if (intMatch) {
            pageNumber = parseInt(intMatch[0]);
          }
        }
      }
      
      if (pageNumber !== null) {
        const readIconBtn = document.createElement('button');
        readIconBtn.type = 'button';
        readIconBtn.className = 'btn-icon';
        readIconBtn.setAttribute('aria-label', i18n.t('today.readText'));
        readIconBtn.style.cssText = 'margin-left: 0.5rem;';
        readIconBtn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          UIComponents.showReadingModal(item.id, station, currentDate, pageNumber, 'page', unitSize);
        });

        // Add book icon
        if (typeof SVGUtils !== 'undefined') {
          const bookIcon = SVGUtils.createBookIcon();
          bookIcon.style.cssText = 'width: 1.25rem; height: 1.25rem;';
          readIconBtn.appendChild(bookIcon);
        } else {
          readIconBtn.textContent = '📖';
        }

        // Insert before checkbox (so it appears on the left in LTR, right in RTL)
        actions.insertBefore(readIconBtn, checkbox);
      }
    }

    content.appendChild(actions);
    card.appendChild(content);

    return card;
  },

  // Create quick stats component
  createQuickStats(total, completed) {
    const stats = document.createElement('div');
    stats.className = 'quick-stats';

    const content = document.createElement('div');
    content.className = 'quick-stats-content';

    const text = document.createElement('div');
    text.className = 'quick-stats-text';
    const statsText = i18n.t('today.stats', { total, completed });
    // Use textContent instead of innerHTML for safety
    text.textContent = statsText.replace(/\{\{total\}\}/g, total).replace(/\{\{completed\}\}/g, completed);

    content.appendChild(text);
    stats.appendChild(content);

    return stats;
  },

  // Create progress timeline item
  createProgressTimelineItem(item, config = null) {
    const timelineItem = document.createElement('div');
    timelineItem.className = 'timeline-item';
    timelineItem.dataset.itemId = item.id;

    const header = document.createElement('div');
    header.className = 'timeline-item-header';

    const title = document.createElement('h3');
    title.className = 'timeline-item-title';
    title.textContent = item.content_reference;
    header.appendChild(title);

    // Calculate current station and next review date
    const memDate = DateUtils ? DateUtils.normalizeDate(item.date_memorized) : new Date(item.date_memorized);
    const today = DateUtils ? DateUtils.normalizeDate(new Date()) : (() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; })();
    const daysPassed = DateUtils ? DateUtils.daysDifference(today, memDate) : Math.floor((today - memDate) / (1000 * 60 * 60 * 24));

    const reviewDates = Algorithm.calculateReviewDates(item.date_memorized);
    let currentStation = 0;
    let nextReviewDate = null;

    // Find current station
    for (let i = reviewDates.length - 1; i >= 0; i--) {
      const reviewDateObj = DateUtils ? DateUtils.normalizeDate(reviewDates[i].date) : (() => { const d = new Date(reviewDates[i].date); d.setHours(0, 0, 0, 0); return d; })();
      const reviewKey = `${reviewDates[i].station}-${reviewDates[i].date}`;
      const isCompleted = item.reviews_completed && item.reviews_completed.includes(reviewKey);

      if (reviewDateObj <= today && isCompleted) {
        currentStation = reviewDates[i].station;
        // Find next review
        if (i < reviewDates.length - 1) {
          nextReviewDate = reviewDates[i + 1];
        }
        break;
      } else if (reviewDateObj <= today && !isCompleted) {
        currentStation = reviewDates[i].station;
        nextReviewDate = reviewDates[i];
        break;
      }
    }

    // If no current station, it's new (station 0)
    if (currentStation === 0 && daysPassed >= 0) {
      currentStation = 1;
      nextReviewDate = reviewDates[0];
    }

    const meta = document.createElement('div');
    meta.className = 'timeline-item-meta';
    if (nextReviewDate) {
      const nextReview = document.createElement('div');
      const nextReviewText = i18n.t('progress.nextReview', { date: new Date(nextReviewDate.date).toLocaleDateString() });
      nextReview.textContent = nextReviewText.replace(/\{\{date\}\}/g, new Date(nextReviewDate.date).toLocaleDateString());
      meta.appendChild(nextReview);
    }
    const currentStationText = document.createElement('div');
    const stationText = i18n.t('progress.currentStation', { station: currentStation });
    currentStationText.textContent = stationText.replace(/\{\{station\}\}/g, currentStation);
    meta.appendChild(currentStationText);

    // Station indicators (clickable to expand step details)
    const stationsContainer = document.createElement('div');
    stationsContainer.className = 'timeline-item-stations';

    const stepDetailContainer = document.createElement('div');
    stepDetailContainer.className = 'timeline-step-detail';
    stepDetailContainer.setAttribute('aria-live', 'polite');

    for (let i = 1; i <= 7; i++) {
      const reviewDate = reviewDates[i - 1];
      const reviewKey = `${reviewDate.station}-${reviewDate.date}`;
      const isCompleted = item.reviews_completed && item.reviews_completed.includes(reviewKey);
      const reviewDateObj = DateUtils ? DateUtils.normalizeDate(reviewDate.date) : (() => { const d = new Date(reviewDate.date); d.setHours(0, 0, 0, 0); return d; })();
      const isPast = reviewDateObj <= today;

      const indicator = this.createStationIndicator(i, isCompleted, i === currentStation, !isPast && i > currentStation);
      indicator.setAttribute('role', 'button');
      indicator.setAttribute('tabindex', '0');
      indicator.setAttribute('aria-label', i18n.t(`stations.${i}`) + (isCompleted ? ' – ' + (i18n.t('progress.completed') || 'Completed') : ''));
      indicator.setAttribute('aria-expanded', 'false');

      const payload = { item, reviewDate, isCompleted, config };
      indicator.addEventListener('click', () => {
        const wasExpanded = indicator.classList.contains('expanded');
        timelineItem.querySelectorAll('.station-indicator').forEach(ind => {
          ind.classList.remove('expanded');
          ind.setAttribute('aria-expanded', 'false');
        });
        stepDetailContainer.replaceChildren();
        stepDetailContainer.classList.remove('is-visible');
        if (!wasExpanded) {
          const detailRow = this.createStepDetailRow(payload.item, payload.reviewDate, payload.isCompleted, payload.config);
          stepDetailContainer.appendChild(detailRow);
          stepDetailContainer.classList.add('is-visible');
          indicator.classList.add('expanded');
          indicator.setAttribute('aria-expanded', 'true');
        }
      });
      indicator.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          indicator.click();
        }
      });

      if (i > 1) {
        const line = document.createElement('div');
        line.className = `station-progress-line ${isCompleted ? 'completed' : ''}`;
        stationsContainer.appendChild(line);
      }

      stationsContainer.appendChild(indicator);
    }

    timelineItem.appendChild(header);
    timelineItem.appendChild(meta);
    timelineItem.appendChild(stationsContainer);
    timelineItem.appendChild(stepDetailContainer);

    return timelineItem;
  },

  // Compact row for expanded station step: date + quick read button (for incomplete, page-type only)
  createStepDetailRow(item, reviewDate, isCompleted, config = null) {
    const row = document.createElement('div');
    row.className = 'step-detail-row';

    const dateStr = new Date(reviewDate.date).toLocaleDateString(undefined, { dateStyle: 'medium' });
    const dateEl = document.createElement('span');
    dateEl.className = 'step-detail-date';
    dateEl.textContent = dateStr;
    row.appendChild(dateEl);

    const actions = document.createElement('div');
    actions.className = 'step-detail-actions';

    if (isCompleted) {
      const doneLabel = document.createElement('span');
      doneLabel.className = 'step-detail-done';
      doneLabel.textContent = i18n.t('progress.completed') || 'Done';
      if (typeof SVGUtils !== 'undefined') {
        const check = SVGUtils.createCheckboxChecked();
        check.style.cssText = 'width: 1rem; height: 1rem;';
        doneLabel.insertBefore(check, doneLabel.firstChild);
      } else {
        doneLabel.textContent = '✓ ' + (i18n.t('progress.completed') || 'Done');
      }
      actions.appendChild(doneLabel);
    } else {
      const unitType = (config && config.unit_type) || 'page';
      const unitSize = (config && config.unit_size != null) ? config.unit_size : null;
      if (navigator.onLine && unitType === 'page') {
        let pageNumber = null;
        const fractionalMatch = item.content_reference && item.content_reference.match(/(\d+)([½¼¾])/);
        if (fractionalMatch) {
          const whole = parseInt(fractionalMatch[1], 10);
          const fraction = fractionalMatch[2];
          if (fraction === '½') pageNumber = whole + 0.5;
          else if (fraction === '¼') pageNumber = whole + 0.25;
          else if (fraction === '¾') pageNumber = whole + 0.75;
        } else {
          const decimalMatch = item.content_reference && item.content_reference.match(/(\d+\.?\d*)/);
          if (decimalMatch) pageNumber = parseFloat(decimalMatch[1]);
          else {
            const intMatch = item.content_reference && item.content_reference.match(/\d+/);
            if (intMatch) pageNumber = parseInt(intMatch[0], 10);
          }
        }
        if (pageNumber !== null) {
          const readBtn = document.createElement('button');
          readBtn.type = 'button';
          readBtn.className = 'btn btn-sm btn-outline step-detail-read';
          readBtn.setAttribute('aria-label', i18n.t('today.readText'));
          readBtn.textContent = i18n.t('today.readText') || 'Read';
          readBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            UIComponents.showReadingModal(item.id, reviewDate.station, reviewDate.date, pageNumber, 'page', unitSize);
          });
          if (typeof SVGUtils !== 'undefined') {
            const bookIcon = SVGUtils.createBookIcon();
            bookIcon.style.cssText = 'width: 1rem; height: 1rem; margin-right: 0.25rem;';
            readBtn.insertBefore(bookIcon, readBtn.firstChild);
          }
          actions.appendChild(readBtn);
        }
      }
    }

    row.appendChild(actions);
    return row;
  },

  // Create station indicator
  createStationIndicator(stationNumber, completed, isCurrent, isUpcoming) {
    const indicator = document.createElement('div');
    indicator.className = 'station-indicator';

    if (completed) {
      indicator.classList.add('completed');
    } else if (isCurrent) {
      indicator.classList.add('current');
    } else if (isUpcoming) {
      indicator.classList.add('upcoming');
    }

    indicator.textContent = stationNumber;
    indicator.setAttribute('title', i18n.t(`stations.${stationNumber}`));

    return indicator;
  },

  // Create a schedule item card (legacy, for backward compatibility)
  createScheduleItem(item, stationNumber = null, isCompleted = false) {
    const card = document.createElement('div');
    card.className = 'schedule-item';
    card.dataset.itemId = item.id;

    // Get current date from the date input (using local date)
    const dateInput = document.getElementById('current-date');
    const currentDate = dateInput ? dateInput.value : (DateUtils ? DateUtils.getLocalDateString(new Date()) : new Date().toISOString().split('T')[0]);

    if (isCompleted) {
      card.classList.add('completed');
    }

    const content = document.createElement('div');
    content.className = 'schedule-item-content';

    const title = document.createElement('h3');
    title.className = 'schedule-item-title';
    title.textContent = item.content_reference;
    content.appendChild(title);

    if (stationNumber) {
      const station = document.createElement('span');
      station.className = 'schedule-item-station';
      station.textContent = i18n.t(`stations.${stationNumber}`);
      content.appendChild(station);
    }

    const actions = document.createElement('div');
    actions.className = 'schedule-item-actions';

    // Checkbox
    const checkbox = document.createElement('button');
    checkbox.type = 'button';
    checkbox.className = `checkbox ${isCompleted ? 'checked' : ''}`;
    const ariaLabel = isCompleted ? i18n.t('aria.markIncomplete') : i18n.t('aria.markComplete');
    checkbox.setAttribute('aria-label', ariaLabel);
    if (typeof SVGUtils !== 'undefined') {
      if (isCompleted) {
        checkbox.appendChild(SVGUtils.createCheckboxChecked());
      } else {
        checkbox.appendChild(SVGUtils.createCheckboxUnchecked());
      }
    } else {
      checkbox.textContent = isCompleted ? '✓' : '';
    }

    checkbox.addEventListener('click', async (e) => {
      // Determine current completion status for animation
      const dateInput = document.getElementById('current-date');
      const currentDateStr = dateInput ? dateInput.value : new Date().toISOString().split('T')[0];
      const station = stationNumber || 1;
      const currentlyCompleted = await Storage.isReviewCompleted(item.id, station, currentDateStr);

      // Add appropriate animation class
      if (currentlyCompleted) {
        card.classList.add('unchecking');
      } else {
        card.classList.add('checking');
      }

      // Wait for animation to complete
      setTimeout(async () => {
        if (currentlyCompleted) {
          // Uncheck - remove from completed
          if (typeof HapticsService !== 'undefined') HapticsService.light();
          await Storage.unmarkReviewComplete(item.id, station, currentDateStr);
        } else {
          // Mark as complete
          if (typeof HapticsService !== 'undefined') HapticsService.success();
          await Storage.markReviewComplete(item.id, station, currentDateStr);
        }

        // Re-render the schedule
        if (window.UI && window.UI.renderDailySchedule) {
          const date = dateInput ? new Date(dateInput.value) : new Date();
          await window.UI.renderDailySchedule(date);
        }
      }, 300);
    });

    actions.appendChild(checkbox);
    content.appendChild(actions);
    card.appendChild(content);

    return card;
  },

  // Create an empty state message
  createEmptyState(message) {
    const empty = document.createElement('div');
    empty.className = 'empty-state';
    empty.textContent = message;
    return empty;
  },

  // Create a badge/chip
  createBadge(text, variant = 'default') {
    const badge = document.createElement('span');
    badge.className = `badge badge-${variant}`;
    badge.textContent = text;
    return badge;
  },

  // Show reading modal
  async showReadingModal(itemId, stationNumber, date, unitNumber, unitType = 'page', unitSize = null) {
    // Create modal overlay
    const overlay = document.createElement('div');
    overlay.className = 'dialog-overlay';
    overlay.dataset.modalType = 'reading'; // For easier identification
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.7);
      backdrop-filter: blur(4px);
      z-index: 2000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
    `;

    // Create modal container
    const modal = document.createElement('div');
    modal.className = 'dialog';
    modal.style.cssText = `
      background-color: var(--card-bg);
      border: 1px solid var(--border-color);
      border-radius: var(--radius);
      max-width: 500px;
      width: 100%;
      height: 80vh;
      display: flex;
      flex-direction: column;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
      overflow: hidden;
      animation: dialog-appear 0.2s ease-out;
    `;

    // Header
    const header = document.createElement('div');
    header.style.cssText = `
      padding: 1rem;
      border-bottom: 1px solid var(--border-color);
      display: flex;
      align-items: center;
      justify-content: space-between;
    `;

    const title = document.createElement('h3');
    title.style.cssText = 'font-size: 1.125rem; font-weight: 600; margin: 0; color: var(--fg);';
    const size = unitSize != null ? parseFloat(unitSize) : 1;
    if (unitType === 'page' && size > 1) {
      const endPage = unitNumber + size;
      title.textContent = Algorithm.formatPageRangeLabel(unitType, unitNumber, endPage);
    } else {
      title.textContent = Algorithm.formatContentReference(unitType, unitNumber);
    }
    header.appendChild(title);

    const closeBtn = document.createElement('button');
    closeBtn.className = 'btn-icon';
    closeBtn.appendChild(SVGUtils.createCloseIcon());
    closeBtn.style.cssText = 'width: 2rem; height: 2rem; font-size: 1.25rem;';
    closeBtn.onclick = () => overlay.remove();
    header.appendChild(closeBtn);

    modal.appendChild(header);

    // Content area
    const content = document.createElement('div');
    content.className = 'reading-content';
    content.style.cssText = `
      flex: 1;
      overflow-y: auto;
      padding: 1.5rem;
      direction: rtl; /* Quran text is always RTL */
      line-height: 2.2;
      font-size: 1.35rem;
      font-family: 'Amiri', serif;
      color: var(--fg);
    `;

    // Add loading state
    content.textContent = i18n.t('reading.loading');
    modal.appendChild(content);

    // Footer
    const footer = document.createElement('div');
    footer.style.cssText = `
      padding: 1rem;
      border-top: 1px solid var(--border-color);
      display: flex;
      align-items: center;
      justify-content: center;
    `;

    // Completion toggle button
    const isCompleted = await Storage.isReviewCompleted(itemId, stationNumber, date);
    const toggleCompletionBtn = document.createElement('button');
    toggleCompletionBtn.className = `btn ${isCompleted ? 'btn-success' : 'btn-outline-success'}`;
    toggleCompletionBtn.style.cssText = 'width: 100%;';
    toggleCompletionBtn.textContent = i18n.t('reading.markAsRead');

    toggleCompletionBtn.addEventListener('click', async () => {
      const isCompleted = await Storage.isReviewCompleted(itemId, stationNumber, date);

      if (isCompleted) {
        if (typeof HapticsService !== 'undefined') HapticsService.light();
        await Storage.unmarkReviewComplete(itemId, stationNumber, date);
      } else {
        if (typeof HapticsService !== 'undefined') HapticsService.success();
        await Storage.markReviewComplete(itemId, stationNumber, date);
      }

      toggleCompletionBtn.className = `btn ${!isCompleted ? 'btn-success' : 'btn-outline-success'}`;

      if (window.UI?.renderTodayView) {
        const uiDate = window.UI.currentDate || new Date();
        await window.UI.renderTodayView(uiDate);
      }
    });

    footer.appendChild(toggleCompletionBtn);

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    // Close on overlay click
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.remove();
    });

    // Fetch text data
    try {
      let textData = null;
      if (unitType === 'page') {
        const size = unitSize != null ? parseFloat(unitSize) : 1;
        if (size > 1) {
          // Multi-page unit: fetch range from unitNumber to unitNumber + size
          const endPage = unitNumber + size;
          textData = await QuranAPI.fetchPageRange(unitNumber, endPage);
        } else {
          // Single page or fractional page (e.g. 3.5 = half of 3 + half of 4)
          textData = await QuranAPI.fetchPageText(unitNumber);
        }
      } else {
        // Fallback for other unit types
        content.textContent = 'Units other than "Page" are coming soon to the reader.';
        return;
      }

      if (textData && textData.data && textData.data.ayahs) {
        content.replaceChildren();

        // Group by surah for better display
        let currentSurah = null;

        textData.data.ayahs.forEach(ayah => {
          if (currentSurah !== ayah.surah.number) {
            currentSurah = ayah.surah.number;
            const surahTitle = document.createElement('div');
            surahTitle.style.cssText = `
              text-align: center;
              background-color: var(--muted-bg);
              padding: 0.5rem;
              margin: 1.5rem 0 1rem 0;
              border-radius: var(--radius);
              font-size: 1.1rem;
              color: var(--primary-bg);
              font-weight: bold;
            `;
            surahTitle.textContent = `${ayah.surah.name}`;
            content.appendChild(surahTitle);
          }

          const ayahSpan = document.createElement('span');
          ayahSpan.className = 'ayah-text';
          ayahSpan.textContent = ayah.text + ' ';

          const badge = document.createElement('span');
          badge.style.cssText = `
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 1.8rem;
            height: 1.8rem;
            border: 1px solid var(--border-color);
            border-radius: 50%;
            font-size: 0.75rem;
            margin: 0 0.5rem;
            color: var(--muted-fg);
            vertical-align: middle;
          `;
          badge.textContent = ayah.numberInSurah;

          ayahSpan.appendChild(badge);
          content.appendChild(ayahSpan);
        });

        modal.appendChild(footer);
      } else {
        content.textContent = i18n.t('reading.error');
      }
    } catch (error) {
      console.error('Error in reading modal:', error);
      content.textContent = i18n.t('reading.error');
    }
  },

  // Create a 365-day activity heatmap (Consistency Map)
  createConsistencyMap(items) {
    const container = document.createElement('div');
    container.className = 'consistency-map';

    // --- Aggregate daily counts from reviews_completed ---
    
    const dailyCounts = {};
    (items || []).forEach(item => {
      (item.reviews_completed || []).forEach(entry => {
        // Format: "station-YYYY-MM-DD"
        const datePart = entry.substring(entry.indexOf('-') + 1);
        dailyCounts[datePart] = (dailyCounts[datePart] || 0) + 1;
      });
    });

    // --- Header ---
    const header = document.createElement('div');
    header.className = 'consistency-map-header';
    const title = document.createElement('span');
    title.className = 'consistency-map-title';
    title.textContent = i18n.t('progress.consistencyMap');
    header.appendChild(title);
    container.appendChild(header);

    // --- Build grid dates ---
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayDay = today.getDay(); // 0=Sun

    // End on today, start 52 weeks + remaining days back to Sunday
    const totalDays = 52 * 7 + todayDay + 1; // fill last partial week
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - totalDays + 1);

    // Total weeks (columns)
    const totalWeeks = Math.ceil(totalDays / 7);

    // --- Scrollable wrapper ---
    const scrollWrapper = document.createElement('div');
    scrollWrapper.className = 'consistency-map-scroll';

    const grid = document.createElement('div');
    grid.className = 'consistency-map-grid';
    grid.style.gridTemplateColumns = `auto repeat(${totalWeeks}, 12px)`;
    grid.style.gridTemplateRows = `auto repeat(7, 12px)`;

    // --- Month labels (row 1) ---
    // Empty cell for day-label column
    const cornerCell = document.createElement('div');
    grid.appendChild(cornerCell);

    const monthNames = i18n.currentLanguage === 'ar'
      ? ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر']
      : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const dayLabels = i18n.currentLanguage === 'ar'
      ? ['أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت']
      : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // Determine which month label goes in which column
    const monthPositions = new Map();
    for (let week = 0; week < totalWeeks; week++) {
      const weekStart = new Date(startDate);
      weekStart.setDate(weekStart.getDate() + week * 7);
      const month = weekStart.getMonth();
      if (!monthPositions.has(month + '-' + weekStart.getFullYear())) {
        monthPositions.set(month + '-' + weekStart.getFullYear(), { col: week, month });
      }
    }

    for (let week = 0; week < totalWeeks; week++) {
      const monthLabel = document.createElement('div');
      monthLabel.className = 'consistency-map-month-label';
      for (const [key, val] of monthPositions) {
        if (val.col === week) {
          monthLabel.textContent = monthNames[val.month];
          break;
        }
      }
      grid.appendChild(monthLabel);
    }

    // --- Tooltip element ---
    const tooltip = document.createElement('div');
    tooltip.className = 'consistency-map-tooltip';
    container.appendChild(tooltip);

    const showTooltip = (cell, date, count) => {
      const dateStr = date.toLocaleDateString(i18n.currentLanguage === 'ar' ? 'ar-SA' : 'en-US', {
        day: 'numeric', month: 'short', year: 'numeric'
      });
      const countText = count > 0
        ? i18n.t('progress.tasksCompleted', { count })
        : i18n.t('progress.noActivity');
      tooltip.textContent = `${dateStr}: ${countText}`;
      tooltip.classList.add('visible');

      const rect = cell.getBoundingClientRect();
      tooltip.style.left = `${rect.left + rect.width / 2 - tooltip.offsetWidth / 2}px`;
      tooltip.style.top = `${rect.top - tooltip.offsetHeight - 6}px`;
    };

    const hideTooltip = () => {
      tooltip.classList.remove('visible');
    };

    // Dismiss tooltip when tapping anywhere else on mobile
    document.addEventListener('touchstart', (e) => {
      if (!e.target.classList.contains('consistency-map-cell')) {
        hideTooltip();
      }
    });

    // --- Day cells (rows 1-7 for each week column) ---
    for (let day = 0; day < 7; day++) {
      // Day label column
      const dayLabel = document.createElement('div');
      dayLabel.className = 'consistency-map-day-label';
      // Show labels for Mon (1), Wed (3), Fri (5)
      if (day === 1 || day === 3 || day === 5) {
        dayLabel.textContent = dayLabels[day];
      }
      grid.appendChild(dayLabel);

      for (let week = 0; week < totalWeeks; week++) {
        const cellDate = new Date(startDate);
        cellDate.setDate(cellDate.getDate() + week * 7 + day);

        const cell = document.createElement('div');
        cell.className = 'consistency-map-cell';

        // Don't render future dates
        if (cellDate > today) {
          cell.style.visibility = 'hidden';
          grid.appendChild(cell);
          continue;
        }

        const dateKey = DateUtils
          ? DateUtils.getLocalDateString(cellDate)
          : cellDate.toISOString().split('T')[0];
        const count = dailyCounts[dateKey] || 0;

        if (count >= 6) cell.classList.add('level-3');
        else if (count >= 3) cell.classList.add('level-2');
        else if (count >= 1) cell.classList.add('level-1');

        cell.dataset.date = dateKey;
        cell.dataset.count = count;

        // Tooltip events
        const capturedDate = new Date(cellDate);
        const capturedCount = count;
        cell.addEventListener('mouseenter', () => showTooltip(cell, capturedDate, capturedCount));
        cell.addEventListener('mouseleave', hideTooltip);
        cell.addEventListener('click', () => {
          showTooltip(cell, capturedDate, capturedCount);
        });

        grid.appendChild(cell);
      }
    }

    scrollWrapper.appendChild(grid);
    container.appendChild(scrollWrapper);

    // --- Legend ---
    const legend = document.createElement('div');
    legend.className = 'consistency-map-legend';

    const lessLabel = document.createElement('span');
    lessLabel.textContent = i18n.t('progress.less');
    legend.appendChild(lessLabel);

    for (let level = 0; level <= 3; level++) {
      const swatch = document.createElement('div');
      swatch.className = `consistency-map-legend-cell level-${level}`;
      legend.appendChild(swatch);
    }

    const moreLabel = document.createElement('span');
    moreLabel.textContent = i18n.t('progress.more');
    legend.appendChild(moreLabel);

    container.appendChild(legend);

    return container;
  }
};

// Expose UIComponents to window for use in other modules
window.UIComponents = UIComponents;
