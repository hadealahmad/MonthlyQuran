/* ===============================
   UI Components Library
   =============================== */

const UIComponents = {

  /* ---------- Buttons ---------- */
  createButton(text, variant = 'default', size = 'default', onClick = null) {
    const button = document.createElement('button');
    button.className = `btn btn-${variant} btn-${size}`;
    button.textContent = text;

    if (onClick) {
      button.addEventListener('click', onClick);
    }
    return button;
  },

  /* ---------- Task Card ---------- */
  createTaskCard(
    item,
    stationNumber = 1,
    priority = 1,
    isCompleted = false,
    unitType = 'page',
    unitSize = null,
    config = null,
    isCatchup = false,
    isOverdue = false,
    originalDueDate = null
  ) {
    const card = document.createElement('div');
    card.className = 'schedule-item';
    card.dataset.itemId = item.id;

    if (isCompleted) card.classList.add('completed');

    const content = document.createElement('div');
    content.className = 'schedule-item-content';

    /* ---------- Title ---------- */
    const info = document.createElement('div');
    info.className = 'schedule-item-info';

    const title = document.createElement('h3');
    title.className = 'schedule-item-title';
    title.textContent = item.content_reference || '';
    info.appendChild(title);

    /* ---------- Meta ---------- */
    const meta = document.createElement('div');
    meta.className = 'schedule-item-meta';

    const badge = document.createElement('span');
    badge.className = 'priority-badge';
    badge.textContent = priority === 1 ? 'New' : 'Review';
    meta.appendChild(badge);

    const stationLabel = document.createElement('span');
    stationLabel.className = 'station-label';
    stationLabel.textContent = `Station ${stationNumber}`;
    meta.appendChild(stationLabel);

    info.appendChild(meta);
    content.appendChild(info);

    /* ---------- Actions ---------- */
    const actions = document.createElement('div');
    actions.className = 'schedule-item-actions';

    const checkbox = document.createElement('button');
    checkbox.type = 'button';
    checkbox.className = `checkbox ${isCompleted ? 'checked' : ''}`;
    checkbox.setAttribute(
      'aria-label',
      isCompleted ? 'Mark incomplete' : 'Mark complete'
    );

    checkbox.textContent = isCompleted ? '✓' : '';

    checkbox.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();

      if (!window.Storage) return;

      const date = new Date().toISOString().split('T')[0];
      const completed = await Storage.isReviewCompleted(item.id, stationNumber, date);

      if (completed) {
        await Storage.unmarkReviewComplete(item.id, stationNumber, date);
      } else {
        await Storage.markReviewComplete(item.id, stationNumber, date);
      }

      if (window.UI?.renderTodayView) {
        window.UI.renderTodayView(new Date());
      }
    });

    actions.appendChild(checkbox);
    content.appendChild(actions);
    card.appendChild(content);

    return card;
  },

  /* ---------- Empty State ---------- */
  createEmptyState(message) {
    const div = document.createElement('div');
    div.className = 'empty-state';
    div.textContent = message;
    return div;
  },

  /* ---------- Badge ---------- */
  createBadge(text, variant = 'default') {
    const badge = document.createElement('span');
    badge.className = `badge badge-${variant}`;
    badge.textContent = text;
    return badge;
  },

  /* ---------- Reading Modal ---------- */
  async showReadingModal(
    itemId,
    stationNumber,
    date,
    unitNumber,
    unitType = 'page',
    unitSize = null
  ) {
    const overlay = document.createElement('div');
    overlay.className = 'dialog-overlay';

    const modal = document.createElement('div');
    modal.className = 'dialog';

    const header = document.createElement('div');
    header.className = 'dialog-header';

    const title = document.createElement('h3');
    title.textContent = `Page ${unitNumber}`;
    header.appendChild(title);

    const closeBtn = document.createElement('button');
    closeBtn.textContent = '✕';
    closeBtn.onclick = () => overlay.remove();
    header.appendChild(closeBtn);

    modal.appendChild(header);

    const content = document.createElement('div');
    content.className = 'reading-content';
    content.textContent = 'Loading...';
    modal.appendChild(content);

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    try {
      if (window.QuranAPI) {
        const data = await QuranAPI.fetchPageText(unitNumber);
        content.textContent = data?.data?.ayahs
          ?.map(a => a.text)
          .join(' ') || 'No data';
      } else {
        content.textContent = 'Quran API not available';
      }
    } catch (err) {
      content.textContent = 'Error loading text';
      console.error(err);
    }
  }
};

/* ---------- Export ---------- */
window.UIComponents = UIComponents;
