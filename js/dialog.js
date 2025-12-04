// Dialog Component for Delete Choices

const Dialog = {
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
  showAddMemorizationModal(onSubmit) {
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
    ['page', 'verse', 'hizb', 'juz'].forEach(unit => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'toggle-option';
      if (unit === 'page') btn.classList.add('active');
      btn.setAttribute('data-value', unit);
      btn.textContent = i18n.t(`units.${unit}`);
      btn.addEventListener('click', () => {
        unitTypeToggle.querySelectorAll('.toggle-option').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
      unitTypeToggle.appendChild(btn);
    });
    unitTypeGroup.appendChild(unitTypeToggle);
    form.appendChild(unitTypeGroup);

    // Total units
    const totalUnitsGroup = document.createElement('div');
    totalUnitsGroup.className = 'form-group';
    const totalUnitsLabel = document.createElement('label');
    totalUnitsLabel.setAttribute('for', 'add-memorization-total-units');
    totalUnitsLabel.textContent = i18n.t('setup.totalUnits');
    totalUnitsGroup.appendChild(totalUnitsLabel);

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

    form.appendChild(buttons);
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const unitType = unitTypeToggle.querySelector('.toggle-option.active')?.getAttribute('data-value') || 'page';
      const totalUnits = parseInt(totalUnitsInput.value) || 30;
      const startDate = startDateInput.value;
      const progressionName = progressionNameInput.value || '';
      
      overlay.remove();
      if (onSubmit) onSubmit({ unitType, totalUnits, startDate, progressionName });
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
      i18n.setLanguage = function(language) {
        const result = originalSetLanguage.call(this, language);
        if (window._installPromptUpdateTranslations) {
          window._installPromptUpdateTranslations();
        }
        return result;
      };
    }
  }
};

