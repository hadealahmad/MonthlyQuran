// Quran API Integration Module

const QuranAPI = {
  API_BASE_URL: 'https://api.alquran.cloud/v1',
  STORAGE_KEY: 'quran_surah_metadata',

  // ==============================
  // 🎧 EveryAyah Audio Configuration
  // ==============================
  EVERYAYAH_BASE_URL: 'https://everyayah.com/data',
  DEFAULT_RECITER: 'Abdul_Basit_Murattal_64kbps',

  /**
   * Pad number with leading zeros (e.g. 1 -> 001)
   */
  _padNumber(num, size = 3) {
    return String(num).padStart(size, '0');
  },

  /**
   * Get EveryAyah audio URL for a specific ayah
   * @param {number} surahNumber
   * @param {number} ayahNumber
   * @param {string} reciter
   * @returns {string} Audio URL
   */
  getAyahAudioUrl(surahNumber, ayahNumber, reciter = this.DEFAULT_RECITER) {
    const s = this._padNumber(surahNumber);
    const a = this._padNumber(ayahNumber);
    return `${this.EVERYAYAH_BASE_URL}/${reciter}/${s}${a}.mp3`;
  },

  /**
   * Fetch surah metadata from API or storage
   * @returns {Promise<Object>} Metadata object
   */
  async fetchSurahMetadata() {
    const cached = await StorageAdapter.get(this.STORAGE_KEY);
    if (cached) {
      try {
        const data = JSON.parse(cached);
        if (data && data.data && data.data.surahs) {
          return data;
        }
      } catch (error) {
        Logger.error('Error parsing cached surah metadata:', error);
      }
    }

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
      if (data && data.data) {
        await StorageAdapter.set(this.STORAGE_KEY, JSON.stringify(data));
        return data;
      }

      return null;
    } catch (error) {
      Logger.error('Error fetching surah metadata:', error);
      return null;
    }
  },

  async getSurahByNumber(surahNumber) {
    const metadata = await this.fetchSurahMetadata();
    const surahs = this._getSurahsArray(metadata);
    return surahs.find(s => s.number === surahNumber) || null;
  },

  _getSurahsArray(metadata) {
    if (!metadata?.data?.surahs) return [];

    const surahsData = metadata.data.surahs;

    if (surahsData.references && Array.isArray(surahsData.references)) {
      return surahsData.references;
    }

    if (Array.isArray(surahsData)) return surahsData;
    if (typeof surahsData === 'object') return Object.values(surahsData);

    return [];
  },

  async fetchSurahText(surahNumber, edition = 'quran-uthmani') {
    if (!navigator.onLine) {
      Logger.warn('Offline: Cannot fetch surah text');
      return null;
    }

    try {
      const response = await fetch(
        `${this.API_BASE_URL}/surah/${surahNumber}/${edition}`
      );
      if (!response.ok) {
        throw new Error(`API response not ok: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      Logger.error('Error fetching surah text:', error);
      return null;
    }
  },

  async fetchPageText(pageNumber, edition = 'quran-uthmani') {
    if (!navigator.onLine) {
      Logger.warn('Offline: Cannot fetch page text');
      return null;
    }

    if (pageNumber % 1 !== 0) {
      return this.fetchFractionalPageText(pageNumber, edition);
    }

    try {
      const response = await fetch(
        `${this.API_BASE_URL}/page/${Math.floor(pageNumber)}/${edition}`
      );
      if (!response.ok) {
        throw new Error(`API response not ok: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      Logger.error('Error fetching page text:', error);
      return null;
    }
  },

  async fetchFractionalPageText(fractionalPage, edition) {
    const floorPage = Math.floor(fractionalPage);
    const ceilPage = Math.ceil(fractionalPage);
    const fraction = fractionalPage - floorPage;

    const [page1, page2] = await Promise.all([
      this.fetchPageText(floorPage, edition),
      this.fetchPageText(ceilPage, edition)
    ]);

    if (!page1 || !page2) return page1 || page2;

    const ayahs = [...page1.data.ayahs];
    const count = Math.ceil(page2.data.ayahs.length * fraction);
    ayahs.push(...page2.data.ayahs.slice(0, count));

    return {
      ...page1,
      data: { ...page1.data, ayahs }
    };
  },

  /**
   * Enrich ayah object with audioUrl (helper for UI)
   */
  attachAudioToAyahs(ayahs, reciter = this.DEFAULT_RECITER) {
    if (!Array.isArray(ayahs)) return ayahs;

    return ayahs.map(ayah => ({
      ...ayah,
      audioUrl: this.getAyahAudioUrl(
        ayah.surah.number,
        ayah.numberInSurah,
        reciter
      )
    }));
  }
};
