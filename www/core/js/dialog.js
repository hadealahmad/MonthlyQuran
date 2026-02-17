// Dialog Component for Delete Choices

const Dialog = {
  // Close the last opened dialog (for back button)
  closeLast() {
    const overlays = document.querySelectorAll('.dialog-overlay');
    if (overlays.length > 0) {
      const lastOverlay = overlays[overlays.length - 1];
      lastOverlay.remove();
      return true; // handled
    }
    return false; // nothing to close
  },

  // Show delete choice dialog
  showDeleteChoice(itemReference, onDeleteOne, onDeleteAll) {
    // Create modal overlay
    const overlay = document.createElement('div');
    overlay.className = 'dialog-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(4px);
      z-index: 2000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
    `;

    // Create dialog
    const dialog = document.createElement('div');
    dialog.className = 'dialog';
    dialog.style.cssText = `
      background-color: var(--card-bg);
      border: 1px solid var(--border-color);
      border-radius: var(--radius);
      padding: 1.5rem;
      max-width: 28rem;
      width: 100%;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    `;

    // Title
    const title = document.createElement('h3');
    title.className = 'dialog-title';
    title.style.cssText = 'font-size: 1.25rem; font-weight: 600; margin: 0 0 1rem 0; color: var(--fg);';
    title.textContent = i18n.t('common.deleteConfirm', { item: itemReference });
    dialog.appendChild(title);

    // Message
    const message = document.createElement('p');
    message.className = 'dialog-message';
    message.style.cssText = 'font-size: 0.875rem; color: var(--muted-fg); margin: 0 0 1.5rem 0;';
    message.textContent = i18n.t('common.deleteChoiceMessage');
    dialog.appendChild(message);

    // Buttons container
    const buttons = document.createElement('div');
    buttons.className = 'dialog-buttons';
    buttons.style.cssText = 'display: flex; flex-direction: column; gap: 0.75rem;';

    // Delete one button
    const deleteOneBtn = document.createElement('button');
    deleteOneBtn.className = 'btn btn-outline';
    deleteOneBtn.style.cssText = 'width: 100%;';
    deleteOneBtn.textContent = i18n.t('common.deleteOne');
    deleteOneBtn.addEventListener('click', () => {
      overlay.remove();
      if (onDeleteOne) onDeleteOne();
    });
    buttons.appendChild(deleteOneBtn);

    // Delete all button
    const deleteAllBtn = document.createElement('button');
    deleteAllBtn.className = 'btn btn-destructive';
    deleteAllBtn.style.cssText = 'width: 100%;';
    deleteAllBtn.textContent = i18n.t('common.deleteAll');
    deleteAllBtn.addEventListener('click', () => {
      overlay.remove();
      if (onDeleteAll) onDeleteAll();
    });
    buttons.appendChild(deleteAllBtn);

    // Cancel button
    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'btn btn-ghost';
    cancelBtn.style.cssText = 'width: 100%;';
    cancelBtn.textContent = i18n.t('common.cancel');
    cancelBtn.addEventListener('click', () => {
      overlay.remove();
    });
    buttons.appendChild(cancelBtn);

    dialog.appendChild(buttons);
    overlay.appendChild(dialog);

    // Close on overlay click
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.remove();
      }
    });

    document.body.appendChild(overlay);

    // Focus first button
    deleteOneBtn.focus();
  },

  // Show reset confirmation dialog
  showResetConfirm(onConfirm) {
    const overlay = document.createElement('div');
    overlay.className = 'dialog-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(4px);
      z-index: 2000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
    `;

    const dialog = document.createElement('div');
    dialog.className = 'dialog';
    dialog.style.cssText = `
      background-color: var(--card-bg);
      border: 1px solid var(--border-color);
      border-radius: var(--radius);
      padding: 1.5rem;
      max-width: 28rem;
      width: 100%;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    `;

    const title = document.createElement('h3');
    title.className = 'dialog-title';
    title.style.cssText = 'font-size: 1.25rem; font-weight: 600; margin: 0 0 1rem 0; color: var(--fg);';
    title.textContent = i18n.t('settings.resetApp');
    dialog.appendChild(title);

    const message = document.createElement('p');
    message.className = 'dialog-message';
    message.style.cssText = 'font-size: 0.875rem; color: var(--muted-fg); margin: 0 0 1.5rem 0;';
    message.textContent = i18n.t('common.resetConfirm');
    dialog.appendChild(message);

    const buttons = document.createElement('div');
    buttons.className = 'dialog-buttons';
    buttons.style.cssText = 'display: flex; flex-direction: column; gap: 0.75rem;';

    const confirmBtn = document.createElement('button');
    confirmBtn.className = 'btn btn-destructive';
    confirmBtn.style.cssText = 'width: 100%;';
    confirmBtn.textContent = i18n.t('common.confirm');
    confirmBtn.addEventListener('click', () => {
      overlay.remove();
      if (onConfirm) onConfirm();
    });
    buttons.appendChild(confirmBtn);

    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'btn btn-ghost';
    cancelBtn.style.cssText = 'width: 100%;';
    cancelBtn.textContent = i18n.t('common.cancel');
    cancelBtn.addEventListener('click', () => {
      overlay.remove();
    });
    buttons.appendChild(cancelBtn);

    dialog.appendChild(buttons);
    overlay.appendChild(dialog);

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.remove();
      }
    });

    document.body.appendChild(overlay);
    confirmBtn.focus();
  },

  // Show import confirmation dialog
  showImportConfirm(onConfirm) {
    const overlay = document.createElement('div');
    overlay.className = 'dialog-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(4px);
      z-index: 2000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
    `;

    const dialog = document.createElement('div');
    dialog.className = 'dialog';
    dialog.style.cssText = `
      background-color: var(--card-bg);
      border: 1px solid var(--border-color);
      border-radius: var(--radius);
      padding: 1.5rem;
      max-width: 28rem;
      width: 100%;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    `;

    const title = document.createElement('h3');
    title.className = 'dialog-title';
    title.style.cssText = 'font-size: 1.25rem; font-weight: 600; margin: 0 0 1rem 0; color: var(--fg);';
    title.textContent = i18n.t('settings.importData');
    dialog.appendChild(title);

    const message = document.createElement('p');
    message.className = 'dialog-message';
    message.style.cssText = 'font-size: 0.875rem; color: var(--muted-fg); margin: 0 0 1.5rem 0;';
    message.textContent = i18n.t('common.importConfirm');
    dialog.appendChild(message);

    const buttons = document.createElement('div');
    buttons.className = 'dialog-buttons';
    buttons.style.cssText = 'display: flex; flex-direction: column; gap: 0.75rem;';

    const confirmBtn = document.createElement('button');
    confirmBtn.className = 'btn btn-primary';
    confirmBtn.style.cssText = 'width: 100%;';
    confirmBtn.textContent = i18n.t('common.confirm');
    confirmBtn.addEventListener('click', () => {
      overlay.remove();
      if (onConfirm) onConfirm();
    });
    buttons.appendChild(confirmBtn);

    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'btn btn-ghost';
    cancelBtn.style.cssText = 'width: 100%;';
    cancelBtn.textContent = i18n.t('common.cancel');
    cancelBtn.addEventListener('click', () => {
      overlay.remove();
    });
    buttons.appendChild(cancelBtn);

    dialog.appendChild(buttons);
    overlay.appendChild(dialog);

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.remove();
      }
    });

    document.body.appendChild(overlay);
    confirmBtn.focus();
  },

  // Show add memorization modal (similar to setup wizard but without theme/language)
  async showAddMemorizationModal(onSubmit) {
    const overlay = document.createElement('div');
    overlay.className = 'dialog-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(4px);
      z-index: 2000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
      overflow-y: auto;
    `;

    const dialog = document.createElement('div');
    dialog.className = 'dialog';
    dialog.style.cssText = `
      background-color: var(--card-bg);
      border: 1px solid var(--border-color);
      border-radius: var(--radius);
      padding: 1.5rem;
      max-width: 28rem;
      width: 100%;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    `;

    const title = document.createElement('h3');
    title.className = 'card-title';
    title.style.cssText = 'font-size: 1.5rem; font-weight: 600; margin: 0 0 0.5rem 0;';
    title.textContent = i18n.t('progress.addNew');
    dialog.appendChild(title);

    const form = document.createElement('form');
    form.style.cssText = 'margin-top: 1.5rem;';

    // Surah preset
    const surahPresetGroup = document.createElement('div');
    surahPresetGroup.className = 'form-group';
    const surahPresetLabel = document.createElement('label');
    surahPresetLabel.setAttribute('for', 'add-memorization-surah-preset');
    surahPresetLabel.textContent = i18n.t('setup.surahPreset');
    surahPresetGroup.appendChild(surahPresetLabel);

    const surahPresetSelect = document.createElement('select');
    surahPresetSelect.id = 'add-memorization-surah-preset';
    surahPresetSelect.className = 'input';
    const noneOption = document.createElement('option');
    noneOption.value = '';
    noneOption.textContent = i18n.t('setup.surahPresetNone');
    surahPresetSelect.appendChild(noneOption);

    // Load big surahs
    const bigSurahs = await QuranAPI.getBigSurahs();
    const currentLang = i18n.getLanguage();
    bigSurahs.forEach(surah => {
      const option = document.createElement('option');
      option.value = surah.number;
      option.textContent = `${surah.number}. ${QuranAPI.getSurahName(surah, currentLang)} (${QuranAPI.getSurahPageCount(surah)} ${i18n.t('units.page')})`;
      option.dataset.surahData = JSON.stringify(surah);
      surahPresetSelect.appendChild(option);
    });
    surahPresetGroup.appendChild(surahPresetSelect);
    form.appendChild(surahPresetGroup);

    // Unit type toggle
    const unitTypeGroup = document.createElement('div');
    unitTypeGroup.className = 'form-group';
    const unitTypeLabel = document.createElement('label');
    unitTypeLabel.textContent = i18n.t('setup.unitType');
    unitTypeLabel.style.cssText = 'display: block; font-size: 0.875rem; font-weight: 500; margin-bottom: 0.5rem; color: var(--fg);';
    unitTypeGroup.appendChild(unitTypeLabel);

    const unitTypeToggle = document.createElement('div');
    unitTypeToggle.className = 'toggle-options';
    unitTypeToggle.id = 'add-memorization-unit-type-toggle';
    ['page', 'verse', 'quarter_hizb', 'hizb', 'juz'].forEach(unit => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'toggle-option';
      if (unit === 'page') btn.classList.add('active');
      btn.setAttribute('data-value', unit);
      btn.textContent = i18n.t(`units.${unit}`);
      btn.addEventListener('click', () => {
        unitTypeToggle.querySelectorAll('.toggle-option').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        updateUnitTypeDependentFields();
      });
      unitTypeToggle.appendChild(btn);
    });
    unitTypeGroup.appendChild(unitTypeToggle);
    form.appendChild(unitTypeGroup);

    // Start page (conditional, only for pages)
    const startPageGroup = document.createElement('div');
    startPageGroup.className = 'form-group';
    startPageGroup.id = 'add-memorization-start-page-group';
    startPageGroup.style.display = 'none';
    const startPageLabel = document.createElement('label');
    startPageLabel.setAttribute('for', 'add-memorization-start-page');
    startPageLabel.textContent = i18n.t('setup.startPage');
    startPageGroup.appendChild(startPageLabel);
    const startPageInput = document.createElement('input');
    startPageInput.type = 'number';
    startPageInput.id = 'add-memorization-start-page';
    startPageInput.className = 'input';
    startPageInput.min = '1';
    startPageInput.max = '604';
    startPageInput.value = '1';
    startPageGroup.appendChild(startPageInput);
    form.appendChild(startPageGroup);

    // Custom unit size (conditional, only for pages)
    const customUnitSizeGroup = document.createElement('div');
    customUnitSizeGroup.className = 'form-group';
    customUnitSizeGroup.id = 'add-memorization-custom-unit-size-group';
    customUnitSizeGroup.style.display = 'none';
    const customUnitSizeLabel = document.createElement('label');
    customUnitSizeLabel.setAttribute('for', 'add-memorization-custom-unit-size');
    customUnitSizeLabel.textContent = i18n.t('setup.customUnitSize');
    customUnitSizeGroup.appendChild(customUnitSizeLabel);
    const customUnitSizeHint = document.createElement('p');
    customUnitSizeHint.className = 'form-hint';
    customUnitSizeHint.style.cssText = 'font-size: 0.875rem; color: var(--muted-fg); margin: 0.25rem 0 0.75rem 0;';
    customUnitSizeHint.textContent = i18n.t('setup.customUnitSizeDescription');
    customUnitSizeGroup.appendChild(customUnitSizeHint);
    const customUnitSizeInput = document.createElement('input');
    customUnitSizeInput.type = 'number';
    customUnitSizeInput.id = 'add-memorization-custom-unit-size';
    customUnitSizeInput.className = 'input';
    customUnitSizeInput.min = '0.5';
    customUnitSizeInput.max = '10';
    customUnitSizeInput.step = '0.5';
    customUnitSizeInput.value = '1';
    customUnitSizeGroup.appendChild(customUnitSizeInput);
    form.appendChild(customUnitSizeGroup);

    // Total units
    const totalUnitsGroup = document.createElement('div');
    totalUnitsGroup.className = 'form-group';
    const totalUnitsLabel = document.createElement('label');
    totalUnitsLabel.setAttribute('for', 'add-memorization-total-units');
    totalUnitsLabel.id = 'add-memorization-total-units-label';
    totalUnitsLabel.textContent = i18n.t('setup.totalUnits');
    totalUnitsGroup.appendChild(totalUnitsLabel);

    // Function to update unit type dependent fields
    const updateUnitTypeDependentFields = () => {
      const selectedUnitType = unitTypeToggle.querySelector('.toggle-option.active')?.getAttribute('data-value') || 'page';

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

      totalUnitsLabel.textContent = i18n.t(labelKey);

      // Update max attribute and validate current value
      if (totalUnitsInput) {
        totalUnitsInput.max = maxUnits;
        if (parseInt(totalUnitsInput.value) > maxUnits) {
          totalUnitsInput.value = maxUnits;
        }
      }

      // Show/hide start page field and custom unit size field
      if (selectedUnitType === 'page') {
        startPageGroup.style.display = 'block';
        customUnitSizeGroup.style.display = 'block';
      } else {
        startPageGroup.style.display = 'none';
        customUnitSizeGroup.style.display = 'none';
      }
    };

    const numberInputGroup = document.createElement('div');
    numberInputGroup.className = 'number-input-group';
    const decreaseBtn = document.createElement('button');
    decreaseBtn.type = 'button';
    decreaseBtn.className = 'number-input-btn';
    decreaseBtn.id = 'add-memorization-total-units-decrease';
    // Use SVG utils instead of innerHTML
    const minusIcon = SVGUtils.createMinusIcon();
    decreaseBtn.appendChild(minusIcon);
    numberInputGroup.appendChild(decreaseBtn);

    const totalUnitsInput = document.createElement('input');
    totalUnitsInput.type = 'number';
    totalUnitsInput.id = 'add-memorization-total-units';
    totalUnitsInput.className = 'input number-input';
    totalUnitsInput.min = '1';
    totalUnitsInput.value = '30';
    totalUnitsInput.required = true;
    numberInputGroup.appendChild(totalUnitsInput);

    const increaseBtn = document.createElement('button');
    increaseBtn.type = 'button';
    increaseBtn.className = 'number-input-btn';
    increaseBtn.id = 'add-memorization-total-units-increase';
    // Use SVG utils instead of innerHTML
    const plusIcon = SVGUtils.createPlusIcon();
    increaseBtn.appendChild(plusIcon);
    numberInputGroup.appendChild(increaseBtn);

    decreaseBtn.addEventListener('click', () => {
      const currentValue = parseInt(totalUnitsInput.value) || 30;
      const newValue = Math.max(1, currentValue - 1);
      totalUnitsInput.value = newValue;
    });

    increaseBtn.addEventListener('click', () => {
      const currentValue = parseInt(totalUnitsInput.value) || 30;
      totalUnitsInput.value = currentValue + 1;
    });

    totalUnitsGroup.appendChild(numberInputGroup);
    form.appendChild(totalUnitsGroup);

    // Start date
    const startDateGroup = document.createElement('div');
    startDateGroup.className = 'form-group';
    const startDateLabel = document.createElement('label');
    startDateLabel.setAttribute('for', 'add-memorization-start-date');
    startDateLabel.textContent = i18n.t('setup.startDate');
    startDateGroup.appendChild(startDateLabel);

    const startDateInput = document.createElement('input');
    startDateInput.type = 'date';
    startDateInput.id = 'add-memorization-start-date';
    startDateInput.className = 'input';
    startDateInput.value = DateUtils ? DateUtils.getLocalDateString(new Date()) : new Date().toISOString().split('T')[0];
    startDateInput.required = true;
    startDateGroup.appendChild(startDateInput);
    form.appendChild(startDateGroup);

    // Progression name
    const progressionNameGroup = document.createElement('div');
    progressionNameGroup.className = 'form-group';
    const progressionNameLabel = document.createElement('label');
    progressionNameLabel.setAttribute('for', 'add-memorization-progression-name');
    progressionNameLabel.textContent = i18n.t('setup.progressionName');
    progressionNameGroup.appendChild(progressionNameLabel);

    const progressionNameInput = document.createElement('input');
    progressionNameInput.type = 'text';
    progressionNameInput.id = 'add-memorization-progression-name';
    progressionNameInput.className = 'input';
    progressionNameInput.placeholder = 'e.g. Juz 1, Surah Al-Baqarah';
    progressionNameInput.required = true;
    progressionNameGroup.appendChild(progressionNameInput);
    form.appendChild(progressionNameGroup);

    // Buttons
    const buttons = document.createElement('div');
    buttons.style.cssText = 'display: flex; flex-direction: column; gap: 0.75rem; margin-top: 1.5rem;';

    const submitBtn = document.createElement('button');
    submitBtn.type = 'submit';
    submitBtn.className = 'btn btn-primary btn-default btn-full';
    submitBtn.textContent = i18n.t('setup.startButton');
    buttons.appendChild(submitBtn);

    const cancelBtn = document.createElement('button');
    cancelBtn.type = 'button';
    cancelBtn.className = 'btn btn-ghost btn-full';
    cancelBtn.textContent = i18n.t('common.cancel');
    cancelBtn.addEventListener('click', () => {
      overlay.remove();
    });
    buttons.appendChild(cancelBtn);

    // Handle surah preset selection
    surahPresetSelect.addEventListener('change', (e) => {
      const selectedValue = e.target.value;
      if (!selectedValue) return;

      const option = e.target.querySelector(`option[value="${selectedValue}"]`);
      if (!option || !option.dataset.surahData) return;

      try {
        const surah = JSON.parse(option.dataset.surahData);
        const startPage = QuranAPI.getSurahStartPage(surah);
        const pageCount = QuranAPI.getSurahPageCount(surah);
        const surahName = QuranAPI.getSurahName(surah, currentLang);

        // Set unit type to page
        unitTypeToggle.querySelectorAll('.toggle-option').forEach(btn => {
          btn.classList.remove('active');
          if (btn.getAttribute('data-value') === 'page') {
            btn.classList.add('active');
          }
        });

        // Update fields
        totalUnitsInput.value = pageCount;
        startPageInput.value = startPage;
        progressionNameInput.value = surahName;

        // Update dependent fields
        updateUnitTypeDependentFields();
      } catch (error) {
        Logger.error('Error handling surah preset:', error);
      }
    });

    form.appendChild(buttons);
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const unitType = unitTypeToggle.querySelector('.toggle-option.active')?.getAttribute('data-value') || 'page';
      const totalUnits = parseInt(totalUnitsInput.value) || 30;
      const startDate = startDateInput.value;
      const progressionName = progressionNameInput.value || '';
      const startPage = (unitType === 'page') ? parseInt(startPageInput.value) || 1 : 1;
      const unitSize = (unitType === 'page' && customUnitSizeInput) ? parseFloat(customUnitSizeInput.value) || 1 : null;

      overlay.remove();
      if (onSubmit) onSubmit({ unitType, totalUnits, startDate, progressionName, startPage, unit_size: unitSize });
    });

    dialog.appendChild(form);
    overlay.appendChild(dialog);

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.remove();
      }
    });

    document.body.appendChild(overlay);
    totalUnitsInput.focus();
  },

  // Show PWA install prompt (bottom-stuck banner)
  showInstallPrompt(deferredPrompt) {
    // Check if already shown
    if (Storage.hasInstallPromptBeenShown()) {
      return;
    }

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true) {
      return;
    }

    // Check if banner already exists
    if (document.getElementById('install-prompt-banner')) {
      return;
    }

    // Create bottom banner
    const banner = document.createElement('div');
    banner.id = 'install-prompt-banner';
    banner.className = 'install-prompt-banner';

    // Content wrapper
    const content = document.createElement('div');
    content.style.cssText = 'flex: 1; min-width: 0;';

    const title = document.createElement('div');
    title.style.cssText = 'font-size: 0.875rem; font-weight: 600; color: var(--fg); margin-bottom: 0.25rem;';
    title.textContent = i18n.t('installPrompt.title');
    content.appendChild(title);

    const message = document.createElement('div');
    message.style.cssText = 'font-size: 0.8125rem; color: var(--muted-fg); line-height: 1.4;';
    message.textContent = i18n.t('installPrompt.message');
    content.appendChild(message);

    banner.appendChild(content);

    // Buttons container
    const buttons = document.createElement('div');
    buttons.style.cssText = 'display: flex; gap: 0.5rem; flex-shrink: 0;';

    // Install button
    const installBtn = document.createElement('button');
    installBtn.className = 'btn btn-primary btn-sm';
    installBtn.textContent = i18n.t('installPrompt.installButton');
    installBtn.addEventListener('click', async () => {
      if (deferredPrompt) {
        try {
          deferredPrompt.prompt();
          const { outcome } = await deferredPrompt.userChoice;
          if (outcome === 'accepted') {
            Storage.markInstallPromptShown();
          }
        } catch (error) {
          Logger.error('Error showing install prompt:', error);
        }
        if (window.App) {
          window.App.deferredPrompt = null;
        }
      }
      banner.remove();
      const bottomNav = document.getElementById('bottom-nav');
      if (bottomNav) {
        bottomNav.style.paddingBottom = '';
      }
      Storage.markInstallPromptShown();
    });
    buttons.appendChild(installBtn);

    // Dismiss button
    const dismissBtn = document.createElement('button');
    dismissBtn.className = 'btn btn-ghost btn-sm';
    dismissBtn.textContent = i18n.t('installPrompt.dismissButton');
    dismissBtn.addEventListener('click', () => {
      banner.remove();
      const bottomNav = document.getElementById('bottom-nav');
      if (bottomNav) {
        bottomNav.style.paddingBottom = '';
      }
      Storage.markInstallPromptShown();
    });
    buttons.appendChild(dismissBtn);

    banner.appendChild(buttons);

    // Add padding to bottom nav if it exists
    const bottomNav = document.getElementById('bottom-nav');
    if (bottomNav) {
      bottomNav.style.paddingBottom = 'calc(env(safe-area-inset-bottom, 0) + 5.5rem)';
    }

    document.body.appendChild(banner);

    // Update translations when language changes
    const updateTranslations = () => {
      if (document.getElementById('install-prompt-banner')) {
        title.textContent = i18n.t('installPrompt.title');
        message.textContent = i18n.t('installPrompt.message');
        installBtn.textContent = i18n.t('installPrompt.installButton');
        dismissBtn.textContent = i18n.t('installPrompt.dismissButton');
      }
    };

    // Store update function for language changes
    if (!window._installPromptUpdateTranslations) {
      window._installPromptUpdateTranslations = updateTranslations;
      const originalSetLanguage = i18n.setLanguage;
      i18n.setLanguage = function (language) {
        const result = originalSetLanguage.call(this, language);
        if (window._installPromptUpdateTranslations) {
          window._installPromptUpdateTranslations();
        }
        return result;
      };
    }
  },

  // Show Shadcn Alert
  showShadcnAlert: function (titleText, messageText, onConfirm, onCancel, confirmText, cancelText, variant) {
    if (!confirmText) confirmText = i18n.t('common.confirm');
    if (!cancelText) cancelText = i18n.t('common.cancel');
    if (!variant) variant = 'default';
    var overlay = document.createElement('div');
    overlay.className = 'dialog-overlay';
    overlay.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background-color: rgba(0, 0, 0, 0.5); backdrop-filter: blur(4px); z-index: 2100; display: flex; align-items: center; justify-content: center; padding: 1rem;';

    var dialog = document.createElement('div');
    dialog.className = 'dialog alert-dialog';
    dialog.style.cssText = 'background-color: var(--card-bg); border: 1px solid var(--border-color); border-radius: var(--radius); padding: 1.5rem; max-width: 32rem; width: 100%; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);';

    var title = document.createElement('h3');
    title.className = 'dialog-title';
    title.style.cssText = 'font-size: 1.125rem; font-weight: 600; margin: 0 0 0.5rem 0; color: var(--fg);';
    title.textContent = titleText;
    dialog.appendChild(title);

    var message = document.createElement('div');
    message.className = 'dialog-message';
    message.style.cssText = 'font-size: 0.875rem; color: var(--muted-fg); margin-bottom: 1.5rem; line-height: 1.5;';
    message.textContent = messageText;
    dialog.appendChild(message);

    var footer = document.createElement('div');
    footer.className = 'dialog-footer';
    footer.style.cssText = 'display: flex; justify-content: flex-end; gap: 0.75rem;';

    var btnCancel = document.createElement('button');
    btnCancel.className = 'btn btn-outline';
    btnCancel.textContent = cancelText;
    btnCancel.addEventListener('click', function () {
      overlay.remove();
      if (onCancel) onCancel();
    });
    footer.appendChild(btnCancel);

    var btnConfirm = document.createElement('button');
    btnConfirm.className = 'btn ' + (variant === 'destructive' ? 'btn-destructive' : 'btn-primary');
    btnConfirm.textContent = confirmText;
    btnConfirm.addEventListener('click', function () {
      overlay.remove();
      if (onConfirm) onConfirm();
    });
    footer.appendChild(btnConfirm);

    dialog.appendChild(footer);
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);
    btnConfirm.focus();
  },

  // Show Edit Progression Modal
  // Show Edit Progression Modal
  showEditProgressionModal: function (currentConfig, onSubmit) {
    var overlay = document.createElement('div');
    overlay.className = 'dialog-overlay';
    overlay.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background-color: rgba(0, 0, 0, 0.5); backdrop-filter: blur(4px); z-index: 2000; display: flex; align-items: center; justify-content: center; padding: 1rem; overflow-y: auto;';

    var dialog = document.createElement('div');
    dialog.className = 'dialog';
    dialog.style.cssText = 'background-color: var(--card-bg); border: 1px solid var(--border-color); border-radius: var(--radius); padding: 1.5rem; max-width: 28rem; width: 100%; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);';

    var title = document.createElement('h3');
    title.className = 'card-title';
    title.style.cssText = 'font-size: 1.5rem; font-weight: 600; margin: 0 0 0.5rem 0;';
    title.textContent = i18n.t('progress.editProgression', 'Edit Progression');
    dialog.appendChild(title);

    var form = document.createElement('form');
    form.style.cssText = 'margin-top: 1.5rem;';

    var unitTypeGroup = document.createElement('div');
    unitTypeGroup.className = 'form-group';
    var unitTypeLabel = document.createElement('label');
    unitTypeLabel.textContent = i18n.t('setup.unitType');
    unitTypeGroup.appendChild(unitTypeLabel);

    var unitTypeToggle = document.createElement('div');
    unitTypeToggle.className = 'toggle-options';
    var units = ['page', 'verse', 'quarter_hizb', 'hizb', 'juz'];
    for (var i = 0; i < units.length; i++) {
      (function (unit) {
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'toggle-option';
        if (unit === (currentConfig.unit_type || 'page')) btn.classList.add('active');
        btn.setAttribute('data-value', unit);
        btn.textContent = i18n.t('units.' + unit);
        btn.addEventListener('click', function () {
          var options = unitTypeToggle.querySelectorAll('.toggle-option');
          for (var j = 0; j < options.length; j++) { options[j].classList.remove('active'); }
          btn.classList.add('active');
          updateFields();
        });
        unitTypeToggle.appendChild(btn);
      })(units[i]);
    }
    unitTypeGroup.appendChild(unitTypeToggle);
    form.appendChild(unitTypeGroup);

    var totalUnitsGroup = document.createElement('div');
    totalUnitsGroup.className = 'form-group';
    var totalUnitsLabel = document.createElement('label');
    totalUnitsLabel.textContent = i18n.t('setup.totalUnits');
    totalUnitsGroup.appendChild(totalUnitsLabel);

    var totalUnitsInput = document.createElement('input');
    totalUnitsInput.type = 'number';
    totalUnitsInput.className = 'input';
    totalUnitsInput.min = '1';
    totalUnitsInput.value = currentConfig.total_units || 30;
    totalUnitsInput.required = true;
    totalUnitsGroup.appendChild(totalUnitsInput);
    form.appendChild(totalUnitsGroup);

    var nameGroup = document.createElement('div');
    nameGroup.className = 'form-group';
    var nameLabel = document.createElement('label');
    nameLabel.textContent = i18n.t('setup.progressionName');
    nameGroup.appendChild(nameLabel);

    var nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.className = 'input';
    nameInput.value = currentConfig.progression_name || '';
    nameInput.required = true;
    nameGroup.appendChild(nameInput);
    form.appendChild(nameGroup);

    var dateGroup = document.createElement('div');
    dateGroup.className = 'form-group';
    var dateLabel = document.createElement('label');
    dateLabel.textContent = i18n.t('setup.startDate');
    dateGroup.appendChild(dateLabel);

    var dateInput = document.createElement('input');
    dateInput.type = 'date';
    dateInput.className = 'input';
    dateInput.value = currentConfig.start_date || '';
    dateInput.required = true;
    dateInput.style.cssText = 'display: block; width: 100%;';
    dateGroup.appendChild(dateInput);
    form.appendChild(dateGroup);

    var startPageGroup = document.createElement('div');
    startPageGroup.className = 'form-group';
    startPageGroup.style.display = 'none';
    var startPageLabel = document.createElement('label');
    startPageLabel.textContent = i18n.t('setup.startPage');
    startPageGroup.appendChild(startPageLabel);

    var startPageInput = document.createElement('input');
    startPageInput.type = 'number';
    startPageInput.className = 'input';
    startPageInput.min = '1';
    startPageInput.max = '604';
    startPageInput.value = currentConfig.start_page || 1;
    startPageGroup.appendChild(startPageInput);
    form.appendChild(startPageGroup);

    var customUnitSizeGroup = document.createElement('div');
    customUnitSizeGroup.className = 'form-group';
    customUnitSizeGroup.style.display = 'none';
    var customUnitSizeLabel = document.createElement('label');
    customUnitSizeLabel.textContent = i18n.t('setup.customUnitSize');
    customUnitSizeGroup.appendChild(customUnitSizeLabel);
    var customUnitSizeHint = document.createElement('p');
    customUnitSizeHint.className = 'form-hint';
    customUnitSizeHint.style.cssText = 'font-size: 0.875rem; color: var(--muted-fg); margin: 0.25rem 0 0.75rem 0;';
    customUnitSizeHint.textContent = i18n.t('setup.customUnitSizeDescription');
    customUnitSizeGroup.appendChild(customUnitSizeHint);
    var customUnitSizeInput = document.createElement('input');
    customUnitSizeInput.type = 'number';
    customUnitSizeInput.className = 'input';
    customUnitSizeInput.min = '0.5';
    customUnitSizeInput.max = '10';
    customUnitSizeInput.step = '0.5';
    customUnitSizeInput.value = currentConfig.unit_size || 1;
    customUnitSizeGroup.appendChild(customUnitSizeInput);
    form.appendChild(customUnitSizeGroup);

    var updateFields = function () {
      var activeOpt = unitTypeToggle.querySelector('.active');
      var type = activeOpt ? activeOpt.getAttribute('data-value') : 'page';
      var labelKey = 'setup.totalUnits';
      var maxUnits = 604;
      if (type === 'page') { labelKey = 'setup.totalPages'; maxUnits = 604; }
      else if (type === 'verse') { labelKey = 'setup.totalVerses'; maxUnits = 6349; }
      else if (type === 'quarter_hizb') { labelKey = 'setup.totalQuarterHizbs'; maxUnits = 240; }
      else if (type === 'hizb') { labelKey = 'setup.totalHizbs'; maxUnits = 60; }
      else if (type === 'juz') { labelKey = 'setup.totalJuzs'; maxUnits = 30; }
      totalUnitsLabel.textContent = i18n.t(labelKey);
      totalUnitsInput.max = maxUnits;
      if (parseInt(totalUnitsInput.value) > maxUnits) totalUnitsInput.value = maxUnits;
      startPageGroup.style.display = (type === 'page') ? 'block' : 'none';
      customUnitSizeGroup.style.display = (type === 'page') ? 'block' : 'none';
    };

    updateFields();

    var buttons = document.createElement('div');
    buttons.style.cssText = 'display: flex; gap: 0.75rem; margin-top: 1.5rem; justify-content: flex-end;';

    var cancelBtn = document.createElement('button');
    cancelBtn.type = 'button';
    cancelBtn.className = 'btn btn-ghost';
    cancelBtn.textContent = i18n.t('common.cancel');
    cancelBtn.addEventListener('click', function () { overlay.remove(); });
    buttons.appendChild(cancelBtn);

    var saveBtn = document.createElement('button');
    saveBtn.type = 'submit';
    saveBtn.className = 'btn btn-primary';
    saveBtn.textContent = i18n.t('common.save', 'Save');
    buttons.appendChild(saveBtn);

    form.appendChild(buttons);

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var activeOpt = unitTypeToggle.querySelector('.active');
      var type = activeOpt ? activeOpt.getAttribute('data-value') : 'page';
      var newData = {};
      for (var key in currentConfig) { newData[key] = currentConfig[key]; }
      newData.unit_type = type;
      newData.total_units = parseInt(totalUnitsInput.value);
      newData.progression_name = nameInput.value;
      newData.start_date = dateInput.value;
      newData.start_page = type === 'page' ? parseInt(startPageInput.value) : 1;
      newData.unit_size = type === 'page' ? parseFloat(customUnitSizeInput.value) || 1 : null;

      overlay.remove();
      if (onSubmit) onSubmit(newData);
    });

    dialog.appendChild(form);
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);
  }
};
