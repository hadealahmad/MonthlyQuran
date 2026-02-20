// Backlog Detection and Redistribution Engine

const Backlog = {

  /**
   * Detect all overdue reviews across all active items.
   * An overdue review = a station (3-7) where daysPassed > offset
   * AND that station's review key is NOT in item.reviews_completed.
   *
   * @param {Array} allItems - All storage items
   * @param {string} todayStr - Today's date string YYYY-MM-DD
   * @returns {Array} Sorted overdue entries (by station priority, then days overdue)
   */
  detectOverdueReviews(allItems, todayStr) {
    const today = DateUtils.normalizeDate(todayStr);
    const overdue = [];

    for (const item of allItems) {
      if (item.status !== ITEM_STATUS.ACTIVE || !item.date_memorized) continue;

      const memDate = DateUtils.normalizeDate(item.date_memorized);
      const daysPassed = DateUtils.daysDifference(today, memDate);

      REVIEW_OFFSETS.forEach((offset, index) => {
        const station = index + 1;

        // Only stations 3-7 can become backlog (1 & 2 are day-0 memorization tasks)
        if (station <= 2) return;

        // Skip stations that haven't come due yet or are exactly due today
        if (daysPassed <= offset) return;

        // Build the expected review key for the original due date
        const reviewDate = new Date(memDate);
        reviewDate.setDate(reviewDate.getDate() + offset);
        const reviewDateStr = DateUtils.getLocalDateString(reviewDate);
        const reviewKey = `${station}-${reviewDateStr}`;

        // Skip if already completed
        if (item.reviews_completed && item.reviews_completed.includes(reviewKey)) return;

        const daysOverdue = daysPassed - offset;

        overdue.push({
          item_id: item.id,
          station,
          original_due_date: reviewDateStr,
          days_overdue: daysOverdue,
          station_priority: BACKLOG_STATION_PRIORITY[station] || 99
        });
      });
    }

    // Sort: station priority first (3 before 4 before 5...), then by days overdue ascending
    overdue.sort((a, b) => {
      if (a.station_priority !== b.station_priority) {
        return a.station_priority - b.station_priority;
      }
      return a.days_overdue - b.days_overdue;
    });

    return overdue;
  },

  /**
   * Determine whether the backlog banner should be shown.
   * @param {Array} overdueItems - From detectOverdueReviews()
   * @returns {boolean}
   */
  shouldShowBanner(overdueItems) {
    if (!overdueItems || overdueItems.length === 0) return false;
    return overdueItems.some(e => e.days_overdue >= BACKLOG_OVERDUE_THRESHOLD_DAYS);
  },

  /**
   * Build a backlog queue by distributing overdue items across future days.
   * @param {Array} overdueItems - Sorted overdue entries
   * @param {string} todayStr - Today's date YYYY-MM-DD
   * @param {number} spreadDays - How many future days to spread over (3, 5, or 7)
   * @param {number} dailyCapacity - Max items per day
   * @returns {Object} The backlog_queue object
   */
  buildQueue(overdueItems, todayStr, spreadDays, dailyCapacity) {
    dailyCapacity = dailyCapacity || BACKLOG_DAILY_CAPACITY;
    const today = DateUtils.normalizeDate(todayStr);
    const queueItems = [];

    // Build date slots starting from tomorrow
    const slots = [];
    for (let i = 0; i < spreadDays; i++) {
      const slotDate = new Date(today);
      slotDate.setDate(slotDate.getDate() + 1 + i);
      slots.push({ date: DateUtils.getLocalDateString(slotDate), count: 0 });
    }

    let slotIndex = 0;
    for (const entry of overdueItems) {
      // Find next slot with capacity
      while (slotIndex < slots.length && slots[slotIndex].count >= dailyCapacity) {
        slotIndex++;
      }
      if (slotIndex >= slots.length) break;

      const slot = slots[slotIndex];
      queueItems.push({
        item_id: entry.item_id,
        station: entry.station,
        original_due_date: entry.original_due_date,
        rescheduled_date: slot.date,
        status: 'pending'
      });
      slot.count++;
    }

    return {
      version: 1,
      created_at: new Date().toISOString(),
      spread_days: spreadDays,
      daily_capacity: dailyCapacity,
      items: queueItems
    };
  },

  /**
   * Get pending backlog tasks for a specific date.
   * @param {Object} queue - The stored backlog_queue object
   * @param {string} targetDateStr - The date to get tasks for
   * @param {Array} allItems - All storage items (for item lookup)
   * @returns {Array} Array of { item, station, originalDueDate, isCatchup: true }
   */
  getTasksForDate(queue, targetDateStr, allItems) {
    if (!queue || !queue.items) return [];

    const itemsMap = new Map(allItems.map(i => [i.id, i]));
    const results = [];

    for (const entry of queue.items) {
      if (entry.rescheduled_date !== targetDateStr) continue;
      if (entry.status !== 'pending') continue;

      const item = itemsMap.get(entry.item_id);
      if (!item) continue;

      results.push({
        item,
        station: entry.station,
        originalDueDate: entry.original_due_date,
        isCatchup: true
      });
    }

    return results;
  },

  /**
   * Count remaining pending items in the queue.
   * @param {Object} queue - The stored backlog_queue object
   * @returns {{ total: number, remaining: number }}
   */
  getQueueStats(queue) {
    if (!queue || !queue.items) return { total: 0, remaining: 0 };
    const total = queue.items.length;
    const remaining = queue.items.filter(e => e.status === 'pending').length;
    return { total, remaining };
  },

  /**
   * Remove completed and stale entries from the queue.
   * Stale = rescheduled_date is in the past and still pending.
   * @param {Object} queue - The stored backlog_queue object
   * @param {string} todayStr - Today's date
   * @returns {Object} Cleaned queue
   */
  pruneQueue(queue, todayStr) {
    if (!queue || !queue.items) return queue;
    queue.items = queue.items.filter(e => {
      if (e.status === 'completed') return false;
      if (e.status === 'pending' && e.rescheduled_date < todayStr) return false;
      return true;
    });
    return queue;
  }
};

window.Backlog = Backlog;
