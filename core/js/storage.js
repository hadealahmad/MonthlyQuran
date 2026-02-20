// Storage layer for cross-platform storage operations
// Uses StorageAdapter for abstraction across web/extension/mobile platforms

const STORAGE_KEYS = {
  CONFIG: 'quran_memorization_config',
  ITEMS: 'quran_memorization_items',
  CURRENT_VIEW: 'quran_memorization_current_view',
  INSTALL_PROMPT_SHOWN: 'quran_memorization_install_prompt_shown',
  SURAH_METADATA: 'quran_surah_metadata'
};

// User Configuration Management
const Storage = {
  /**
   * Save user configuration
   * @param {Object} config - Configuration object
   * @returns {Promise<boolean>} True if successful, false otherwise
   */
  async saveConfig(config) {
    try {
      const configData = {
        unit_type: config.unit_type || DEFAULT_CONFIG.UNIT_TYPE,
        total_units: config.total_units !== undefined ? config.total_units : DEFAULT_CONFIG.TOTAL_UNITS,
        start_date: config.start_date,
        progression_name: config.progression_name || DEFAULT_CONFIG.PROGRESSION_NAME,
        language: config.language || DEFAULT_CONFIG.LANGUAGE,
        theme: config.theme || DEFAULT_CONFIG.THEME,
        morning_hour: config.morning_hour !== undefined ? config.morning_hour : DEFAULT_CONFIG.MORNING_HOUR,
        evening_hour: config.evening_hour !== undefined ? config.evening_hour : DEFAULT_CONFIG.EVENING_HOUR,
        start_page: config.start_page !== undefined ? config.start_page : 1,
        unit_size: config.unit_type === 'page' && config.unit_size != null ? config.unit_size : null,
        enable_haptics: config.enable_haptics !== undefined ? config.enable_haptics : DEFAULT_CONFIG.ENABLE_HAPTICS,
        updated_at: new Date().toISOString()
      };
      await StorageAdapter.set(STORAGE_KEYS.CONFIG, JSON.stringify(configData));
      return true;
    } catch (error) {
      Logger.error('Error saving config:', error);
      return false;
    }
  },

  /**
   * Get user configuration
   * @returns {Promise<Object|null>} Configuration object or null if not found
   */
  async getConfig() {
    try {
      const configStr = await StorageAdapter.get(STORAGE_KEYS.CONFIG);
      if (!configStr) return null;
      const config = JSON.parse(configStr);
      return (config && typeof config === 'object') ? config : null;
    } catch (error) {
      Logger.error('Error getting config:', error);
      return null;
    }
  },

  /**
   * Save or update a memorized item
   * @param {Object} item - Item object with id, content_reference, date_memorized, etc.
   * @returns {Promise<boolean>} True if successful, false otherwise
   */
  async saveItem(item) {
    try {
      const items = await this.getAllItems();
      // First check by ID
      let existingIndex = items.findIndex(i => i.id === item.id);

      // If not found by ID, check by date_memorized and stable ID pattern to prevent duplicates
      if (existingIndex < 0 && item.date_memorized && item.id && item.id.startsWith('item-')) {
        const idParts = item.id.split('-');
        if (idParts.length >= 6) {
          const unitType = idParts[1];
          const itemNumber = idParts[2];

          existingIndex = items.findIndex(i =>
            i.date_memorized === item.date_memorized &&
            i.status === ITEM_STATUS.ACTIVE &&
            i.id.startsWith(`item-${unitType}-${itemNumber}-`)
          );
        }
      }

      if (existingIndex >= 0) {
        const existingItem = items[existingIndex];
        items[existingIndex] = {
          ...existingItem,
          ...item,
          reviews_completed: item.reviews_completed || existingItem.reviews_completed || [],
          reviews_missed: item.reviews_missed || existingItem.reviews_missed || []
        };
      } else {
        items.push(item);
      }

      await StorageAdapter.set(STORAGE_KEYS.ITEMS, JSON.stringify(items));
      return true;
    } catch (error) {
      Logger.error('Error saving item:', error);
      return false;
    }
  },

  /**
   * Get all items (active and archived)
   * @returns {Promise<Array>} Array of all items
   */
  async getAllItems() {
    try {
      const itemsStr = await StorageAdapter.get(STORAGE_KEYS.ITEMS);
      if (!itemsStr) return [];
      const items = JSON.parse(itemsStr);
      return Array.isArray(items) ? items : [];
    } catch (error) {
      Logger.error('Error getting items:', error);
      return [];
    }
  },

  /**
   * Get only active items
   * @returns {Promise<Array>} Array of active items
   */
  async getActiveItems() {
    const items = await this.getAllItems();
    return items.filter(item => item.status === ITEM_STATUS.ACTIVE);
  },

  /**
   * Get item by ID
   * @param {string} id - Item ID
   * @returns {Promise<Object|null>} Item object or null if not found
   */
  async getItemById(id) {
    const items = await this.getAllItems();
    return items.find(item => item.id === id) || null;
  },

  /**
   * Mark a review as complete
   * @param {string} itemId - Item ID
   * @param {number} stationNumber - Station number (1-7)
   * @param {string} date - Date string (optional, defaults to today)
   * @returns {Promise<boolean>} True if successful, false otherwise
   */
  async markReviewComplete(itemId, stationNumber, date) {
    try {
      const item = await this.getItemById(itemId);
      if (!item) return false;

      const reviewDate = date || (DateUtils ? DateUtils.getLocalDateString(new Date()) : new Date().toISOString().split('T')[0]);

      if (!item.reviews_completed) {
        item.reviews_completed = [];
      }
      if (!item.reviews_missed) {
        item.reviews_missed = [];
      }

      const reviewKey = `${stationNumber}-${reviewDate}`;
      if (!item.reviews_completed.includes(reviewKey)) {
        item.reviews_completed.push(reviewKey);
      }

      item.reviews_missed = item.reviews_missed.filter(
        missed => missed !== reviewKey
      );

      return await this.saveItem(item);
    } catch (error) {
      Logger.error('Error marking review complete:', error);
      return false;
    }
  },

  /**
   * Unmark a review as complete
   * @param {string} itemId - Item ID
   * @param {number} stationNumber - Station number (1-7)
   * @param {string} date - Date string (optional, defaults to today)
   * @returns {Promise<boolean>} True if successful, false otherwise
   */
  async unmarkReviewComplete(itemId, stationNumber, date) {
    try {
      const item = await this.getItemById(itemId);
      if (!item) return false;

      const reviewDate = date || (DateUtils ? DateUtils.getLocalDateString(new Date()) : new Date().toISOString().split('T')[0]);
      const reviewKey = `${stationNumber}-${reviewDate}`;

      if (!item.reviews_completed) {
        item.reviews_completed = [];
      }

      item.reviews_completed = item.reviews_completed.filter(
        completed => completed !== reviewKey
      );

      return await this.saveItem(item);
    } catch (error) {
      Logger.error('Error unmarking review complete:', error);
      return false;
    }
  },

  /**
   * Mark a review as missed
   * @param {string} itemId - Item ID
   * @param {number} stationNumber - Station number (1-7)
   * @param {string} date - Date string (optional, defaults to today)
   * @returns {Promise<boolean>} True if successful, false otherwise
   */
  async markReviewMissed(itemId, stationNumber, date) {
    try {
      const item = await this.getItemById(itemId);
      if (!item) return false;

      const reviewDate = date || (DateUtils ? DateUtils.getLocalDateString(new Date()) : new Date().toISOString().split('T')[0]);

      if (!item.reviews_completed) {
        item.reviews_completed = [];
      }
      if (!item.reviews_missed) {
        item.reviews_missed = [];
      }

      const reviewKey = `${stationNumber}-${reviewDate}`;
      if (!item.reviews_missed.includes(reviewKey)) {
        item.reviews_missed.push(reviewKey);
      }

      return await this.saveItem(item);
    } catch (error) {
      Logger.error('Error marking review missed:', error);
      return false;
    }
  },

  /**
   * Check if a review is completed
   * @param {string} itemId - Item ID
   * @param {number} stationNumber - Station number (1-7)
   * @param {string} date - Date string (optional, defaults to today)
   * @returns {Promise<boolean>} True if completed, false otherwise
   */
  async isReviewCompleted(itemId, stationNumber, date) {
    const item = await this.getItemById(itemId);
    if (!item || !item.reviews_completed) return false;

    const reviewDate = date || new Date().toISOString().split('T')[0];
    const reviewKey = `${stationNumber}-${reviewDate}`;
    return item.reviews_completed.includes(reviewKey);
  },

  /**
   * Archive an item
   * @param {string} itemId - Item ID
   * @returns {Promise<boolean>} True if successful, false otherwise
   */
  async archiveItem(itemId) {
    try {
      const item = await this.getItemById(itemId);
      if (!item) return false;

      item.status = ITEM_STATUS.ARCHIVED;
      item.archived_at = new Date().toISOString();
      return await this.saveItem(item);
    } catch (error) {
      Logger.error('Error archiving item:', error);
      return false;
    }
  },

  /**
   * Delete an item
   * @param {string} itemId - Item ID
   * @returns {Promise<boolean>} True if successful, false otherwise
   */
  async deleteItem(itemId) {
    try {
      const items = await this.getAllItems();
      const filtered = items.filter(item => item.id !== itemId);
      await StorageAdapter.set(STORAGE_KEYS.ITEMS, JSON.stringify(filtered));
      return true;
    } catch (error) {
      Logger.error('Error deleting item:', error);
      return false;
    }
  },

  /**
   * Delete all items
   * @returns {Promise<boolean>} True if successful, false otherwise
   */
  async deleteAllItems() {
    try {
      await StorageAdapter.set(STORAGE_KEYS.ITEMS, JSON.stringify([]));
      return true;
    } catch (error) {
      Logger.error('Error deleting all items:', error);
      return false;
    }
  },

  /**
   * Clear all data
   * @returns {Promise<boolean>} True if successful, false otherwise
   */
  async clearAll() {
    try {
      await StorageAdapter.remove(STORAGE_KEYS.CONFIG);
      await StorageAdapter.remove(STORAGE_KEYS.ITEMS);
      return true;
    } catch (error) {
      Logger.error('Error clearing data:', error);
      return false;
    }
  },

  /**
   * Export all data as JSON string
   * @returns {Promise<string|null>} JSON string or null on error
   */
  async exportData() {
    try {
      const data = {
        config: await this.getConfig(),
        items: await this.getAllItems(),
        exported_at: new Date().toISOString()
      };
      return JSON.stringify(data, null, 2);
    } catch (error) {
      Logger.error('Error exporting data:', error);
      return null;
    }
  },

  /**
   * Import data from JSON string
   * @param {string} dataString - JSON string containing config and items
   * @returns {Promise<boolean>} True if successful, false otherwise
   */
  async importData(dataString) {
    try {
      const data = JSON.parse(dataString);

      if (data.config) {
        await this.saveConfig(data.config);
      }

      if (data.items && Array.isArray(data.items)) {
        await StorageAdapter.set(STORAGE_KEYS.ITEMS, JSON.stringify(data.items));
      }

      return true;
    } catch (error) {
      Logger.error('Error importing data:', error);
      return false;
    }
  },

  /**
   * Save current view
   * @param {string} viewId - View ID
   * @returns {Promise<boolean>} True if successful, false otherwise
   */
  async saveCurrentView(viewId) {
    try {
      await StorageAdapter.set(STORAGE_KEYS.CURRENT_VIEW, viewId);
      return true;
    } catch (error) {
      Logger.error('Error saving current view:', error);
      return false;
    }
  },

  /**
   * Get current view
   * @returns {Promise<string|null>} View ID or null
   */
  async getCurrentView() {
    try {
      return await StorageAdapter.get(STORAGE_KEYS.CURRENT_VIEW);
    } catch (error) {
      Logger.error('Error getting current view:', error);
      return null;
    }
  },

  /**
   * Check if install prompt has been shown
   * @returns {Promise<boolean>} True if shown, false otherwise
   */
  async hasInstallPromptBeenShown() {
    try {
      const value = await StorageAdapter.get(STORAGE_KEYS.INSTALL_PROMPT_SHOWN);
      return value === 'true';
    } catch (error) {
      Logger.error('Error checking install prompt status:', error);
      return false;
    }
  },

  /**
   * Mark install prompt as shown
   * @returns {Promise<boolean>} True if successful, false otherwise
   */
  async markInstallPromptShown() {
    try {
      await StorageAdapter.set(STORAGE_KEYS.INSTALL_PROMPT_SHOWN, 'true');
      return true;
    } catch (error) {
      Logger.error('Error marking install prompt as shown:', error);
      return false;
    }
  },

  /**
   * Save surah metadata
   * @param {Object} metadata - Surah metadata object
   * @returns {Promise<boolean>} True if successful, false otherwise
   */
  async saveSurahMetadata(metadata) {
    try {
      await StorageAdapter.set(STORAGE_KEYS.SURAH_METADATA, JSON.stringify(metadata));
      return true;
    } catch (error) {
      Logger.error('Error saving surah metadata:', error);
      return false;
    }
  },

  /**
   * Get surah metadata
   * @returns {Promise<Object|null>} Metadata object or null
   */
  async getSurahMetadata() {
    try {
      const metadataStr = await StorageAdapter.get(STORAGE_KEYS.SURAH_METADATA);
      if (!metadataStr) return null;
      return JSON.parse(metadataStr);
    } catch (error) {
      Logger.error('Error getting surah metadata:', error);
      return null;
    }
  }
};
