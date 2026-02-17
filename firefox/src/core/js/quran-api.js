// Quran API Integration Module

const QuranAPI = {
  API_BASE_URL: 'https://api.alquran.cloud/v1',
  STORAGE_KEY: 'quran_surah_metadata',

  /**
   * Fetch surah metadata from API or storage
   * @returns {Promise<Object>} Metadata object
   */
  async fetchSurahMetadata() {
    // Check storage first
    const cached = await StorageAdapter.get(this.STORAGE_KEY);
    if (cached) {
      try {
        const data = JSON.parse(cached);
        // Check if data is valid and has surahs (array or object)
        if (data && data.data && data.data.surahs && (Array.isArray(data.data.surahs) || typeof data.data.surahs === 'object')) {
          return data;
        }
      } catch (error) {
        Logger.error('Error parsing cached surah metadata:', error);
      }
    }

    // Fetch from API if not in cache or cache is invalid
    if (!navigator.onLine) {
      Logger.warn('Offline: Cannot fetch surah metadata');
      return null;
    }

    try {
      const response = await fetch(`${this.API_BASE_URL}/meta`);
      if (!response.ok) {
        throw new Error(`API response not ok: ${response.status}`);
      }
      const data = await response.json();

      // Validate response structure
      if (data && data.data) {
        // Log structure for debugging
        if (typeof Logger !== 'undefined') {
          Logger.info('API response structure:', {
            hasData: !!data.data,
            hasSurahs: !!data.data.surahs,
            surahsType: typeof data.data.surahs,
            isArray: Array.isArray(data.data.surahs),
            sampleKeys: data.data.surahs ? Object.keys(data.data.surahs).slice(0, 5) : []
          });
        }

        // Store in storage
        await StorageAdapter.set(this.STORAGE_KEY, JSON.stringify(data));
        return data;
      } else {
        Logger.error('Invalid API response structure:', data);
        return null;
      }
    } catch (error) {
      Logger.error('Error fetching surah metadata:', error);
      return null;
    }
  },

  /**
   * Get surah by number
   * @param {number} surahNumber - Surah number (1-114)
   * @returns {Object|null} Surah data or null
   */
  async getSurahByNumber(surahNumber) {
    const metadata = await this.fetchSurahMetadata();
    const surahs = this._getSurahsArray(metadata);

    if (!surahs || surahs.length === 0) {
      return null;
    }

    return surahs.find(s => s && s.number === surahNumber) || null;
  },

  /**
   * Get surahs array from metadata (handles API response structure)
   * @param {Object} metadata - Metadata object
   * @returns {Array} Array of surah objects
   */
  _getSurahsArray(metadata) {
    if (!metadata || !metadata.data || !metadata.data.surahs) {
      return [];
    }

    const surahsData = metadata.data.surahs;

    // API returns surahs in surahs.references array
    if (surahsData.references && Array.isArray(surahsData.references)) {
      return surahsData.references;
    }

    // Fallback: if it's already an array
    if (Array.isArray(surahsData)) {
      return surahsData;
    }

    // Fallback: if it's an object, convert to array
    if (typeof surahsData === 'object') {
      return Object.values(surahsData);
    }

    return [];
  },

  /**
   * Calculate page ranges for surahs from pages references
   * @param {Object} metadata - Metadata object
   * @returns {Map} Map of surah number to page range string (e.g., "1-2")
   */
  _calculateSurahPageRanges(metadata) {
    const pageRanges = new Map();

    if (!metadata || !metadata.data || !metadata.data.pages || !metadata.data.pages.references) {
      return pageRanges;
    }

    const pages = metadata.data.pages.references;
    const surahs = this._getSurahsArray(metadata);

    // Create a map of surah numbers to their page ranges
    surahs.forEach(surah => {
      const surahNumber = surah.number;
      let startPage = null;
      let endPage = null;

      // Find first page that starts with this surah
      for (let i = 0; i < pages.length; i++) {
        if (pages[i].surah === surahNumber) {
          if (startPage === null) {
            startPage = i + 1; // Page numbers are 1-indexed
          }
          endPage = i + 1;
        } else if (startPage !== null && pages[i].surah > surahNumber) {
          // We've passed this surah
          break;
        }
      }

      if (startPage !== null && endPage !== null) {
        pageRanges.set(surahNumber, `${startPage}-${endPage}`);
      }
    });

    return pageRanges;
  },

  /**
   * Get big surahs (>3 pages)
   * @returns {Promise<Array>} Array of surah objects with pages property added
   */
  async getBigSurahs() {
    const metadata = await this.fetchSurahMetadata();
    if (!metadata) {
      Logger.warn('No metadata available for big surahs');
      return [];
    }

    const surahs = this._getSurahsArray(metadata);

    if (!surahs || surahs.length === 0) {
      Logger.warn('No surahs found in metadata');
      return [];
    }

    // Calculate page ranges from pages references
    const pageRanges = this._calculateSurahPageRanges(metadata);

    // Add pages property to each surah and filter big surahs
    const bigSurahs = surahs
      .map(surah => {
        const pages = pageRanges.get(surah.number);
        return { ...surah, pages };
      })
      .filter(surah => {
        if (!surah || !surah.pages) return false;

        const pageRange = surah.pages.split('-');
        if (pageRange.length !== 2) return false;

        const startPage = parseInt(pageRange[0]);
        const endPage = parseInt(pageRange[1]);
        if (isNaN(startPage) || isNaN(endPage)) return false;

        const pageCount = endPage - startPage + 1;
        return pageCount > 3;
      });

    return bigSurahs.sort((a, b) => {
      const aPages = a.pages.split('-');
      const bPages = b.pages.split('-');
      const aStart = parseInt(aPages[0]);
      const bStart = parseInt(bPages[0]);
      return aStart - bStart;
    });
  },

  /**
   * Get page count for a surah
   * @param {Object} surah - Surah object
   * @returns {number} Page count
   */
  getSurahPageCount(surah) {
    if (!surah) return 0;

    let pagesField = surah.pages || surah.pageRange || surah.page_range;

    // Handle array format
    if (Array.isArray(pagesField)) {
      if (pagesField.length < 2) return 0;
      const startPage = parseInt(pagesField[0]);
      const endPage = parseInt(pagesField[pagesField.length - 1]);
      if (isNaN(startPage) || isNaN(endPage)) return 0;
      return endPage - startPage + 1;
    }

    // Handle string format
    if (typeof pagesField === 'string' && pagesField.includes('-')) {
      const pageRange = pagesField.split('-');
      if (pageRange.length !== 2) return 0;
      const startPage = parseInt(pageRange[0]);
      const endPage = parseInt(pageRange[1]);
      if (isNaN(startPage) || isNaN(endPage)) return 0;
      return endPage - startPage + 1;
    }

    return 0;
  },

  /**
   * Get start page for a surah
   * @param {Object} surah - Surah object
   * @returns {number} Start page number
   */
  getSurahStartPage(surah) {
    if (!surah) return 1;

    let pagesField = surah.pages || surah.pageRange || surah.page_range;

    // Handle array format
    if (Array.isArray(pagesField)) {
      if (pagesField.length === 0) return 1;
      const startPage = parseInt(pagesField[0]);
      return isNaN(startPage) ? 1 : startPage;
    }

    // Handle string format
    if (typeof pagesField === 'string' && pagesField.includes('-')) {
      const pageRange = pagesField.split('-');
      if (pageRange.length !== 2) return 1;
      const startPage = parseInt(pageRange[0]);
      return isNaN(startPage) ? 1 : startPage;
    }

    return 1;
  },

  /**
   * Fetch surah text for reading
   * @param {number} surahNumber - Surah number
   * @param {string} edition - Edition identifier (default: 'quran-uthmani')
   * @returns {Promise<Object|null>} Surah text data or null
   */
  async fetchSurahText(surahNumber, edition = 'quran-uthmani') {
    if (!navigator.onLine) {
      Logger.warn('Offline: Cannot fetch surah text');
      return null;
    }

    try {
      const response = await fetch(`${this.API_BASE_URL}/surah/${surahNumber}/${edition}`);
      if (!response.ok) {
        throw new Error(`API response not ok: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      Logger.error('Error fetching surah text:', error);
      return null;
    }
  },

  /**
   * Fetch page text for reading
   * @param {number} pageNumber - Page number (1-604) or fractional (e.g., 3.5)
   * @param {string} edition - Edition identifier (default: 'quran-uthmani')
   * @returns {Promise<Object|null>} Page text data or null
   */
  async fetchPageText(pageNumber, edition = 'quran-uthmani') {
    if (!navigator.onLine) {
      Logger.warn('Offline: Cannot fetch page text');
      return null;
    }

    // Handle fractional pages (e.g., 3.5 = half of page 3 + half of page 4)
    if (pageNumber % 1 !== 0) {
      return await this.fetchFractionalPageText(pageNumber, edition);
    }

    try {
      const response = await fetch(`${this.API_BASE_URL}/page/${Math.floor(pageNumber)}/${edition}`);
      if (!response.ok) {
        throw new Error(`API response not ok: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      Logger.error('Error fetching page text:', error);
      return null;
    }
  },

  /**
   * Fetch fractional page text (e.g., page 3.5 = half page 3 + half page 4)
   * @param {number} fractionalPage - Fractional page number (e.g., 3.5)
   * @param {string} edition - Edition identifier (default: 'quran-uthmani')
   * @returns {Promise<Object|null>} Combined page text data or null
   */
  async fetchFractionalPageText(fractionalPage, edition = 'quran-uthmani') {
    const floorPage = Math.floor(fractionalPage);
    const ceilPage = Math.ceil(fractionalPage);
    const fraction = fractionalPage - floorPage;

    // If fraction is 0, just return the floor page
    if (fraction === 0) {
      return await this.fetchPageText(floorPage, edition);
    }

    // Fetch both pages
    const [page1Data, page2Data] = await Promise.all([
      this.fetchPageText(floorPage, edition),
      this.fetchPageText(ceilPage, edition)
    ]);

    if (!page1Data || !page2Data) {
      Logger.error('Error fetching fractional page text: one or both pages failed');
      return page1Data || page2Data; // Return whichever succeeded, or null
    }

    // Combine ayahs: take all from first page, then fraction of second page
    const combinedAyahs = [];
    
    // Add all ayahs from first page
    if (page1Data.data && page1Data.data.ayahs) {
      combinedAyahs.push(...page1Data.data.ayahs);
    }

    // Add fraction of ayahs from second page
    if (page2Data.data && page2Data.data.ayahs) {
      const totalAyahs = page2Data.data.ayahs.length;
      const ayahsToTake = Math.ceil(totalAyahs * fraction);
      
      // Take the first portion of ayahs from second page
      combinedAyahs.push(...page2Data.data.ayahs.slice(0, ayahsToTake));
    }

    // Return combined data structure
    return {
      ...page1Data,
      data: {
        ...page1Data.data,
        ayahs: combinedAyahs
      }
    };
  },

  /**
   * Fetch a range of pages (for unit_size > 1, e.g. one unit = 3.5 pages)
   * @param {number} startPage - Start page (1-604), can be fractional (e.g. 4.5 = from middle of page 4)
   * @param {number} endPage - End page (exclusive end), can be fractional (e.g. 4.5 = up to middle of page 4)
   * @param {string} edition - Edition identifier (default: 'quran-uthmani')
   * @returns {Promise<Object|null>} Combined page text data or null
   */
  async fetchPageRange(startPage, endPage, edition = 'quran-uthmani') {
    if (!navigator.onLine) {
      Logger.warn('Offline: Cannot fetch page range');
      return null;
    }

    const combinedAyahs = [];
    let templateData = null;

    const startFloor = Math.floor(startPage);
    const startFrac = startPage % 1;
    const endFloor = Math.floor(endPage);
    const endFrac = endPage % 1;

    // Partial start: from (startFrac) to end of page startFloor
    if (startFrac > 0) {
      const pageData = await this.fetchPageText(startFloor, edition);
      if (!pageData || !pageData.data || !pageData.data.ayahs) {
        return null;
      }
      templateData = pageData;
      const ayahs = pageData.data.ayahs;
      const startIdx = Math.floor(startFrac * ayahs.length);
      combinedAyahs.push(...ayahs.slice(startIdx));
    }

    // Full pages: from firstFull to lastFull (inclusive)
    const firstFullPage = startFrac > 0 ? startFloor + 1 : startFloor;
    const lastFullPage = endFrac > 0 ? endFloor - 1 : endFloor;

    for (let p = firstFullPage; p <= lastFullPage; p++) {
      const pageData = await this.fetchPageText(p, edition);
      if (!pageData || !pageData.data || !pageData.data.ayahs) {
        return null;
      }
      if (!templateData) templateData = pageData;
      combinedAyahs.push(...pageData.data.ayahs);
    }

    // Partial end: from start of page endFloor up to (endFrac) of that page
    if (endFrac > 0) {
      const pageData = await this.fetchPageText(endFloor, edition);
      if (!pageData || !pageData.data || !pageData.data.ayahs) {
        return null;
      }
      if (!templateData) templateData = pageData;
      const ayahs = pageData.data.ayahs;
      const endIdx = Math.ceil(endFrac * ayahs.length);
      combinedAyahs.push(...ayahs.slice(0, endIdx));
    }

    if (!templateData || combinedAyahs.length === 0) {
      return null;
    }

    return {
      ...templateData,
      data: {
        ...templateData.data,
        ayahs: combinedAyahs
      }
    };
  },

  /**
   * Get surah name in current language
   * @param {Object} surah - Surah object
   * @param {string} language - Language code ('en' or 'ar')
   * @returns {string} Surah name
   */
  getSurahName(surah, language = 'en') {
    if (!surah) return '';
    if (language === 'ar' && surah.name) {
      return surah.name;
    }
    if (language === 'en' && surah.englishName) {
      return surah.englishName;
    }
    // Fallback
    return surah.name || surah.englishName || `Surah ${surah.number}`;
  }
};

