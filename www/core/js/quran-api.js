// Quran API Integration Module

const QuranAPI = {
  API_BASE_URL: 'https://api.alquran.cloud/v1',
  STORAGE_KEY: 'quran_surah_metadata',

  // ===== Audio (EveryAyah) =====
  EVERYAYAH_BASE_URL: 'https://www.everyayah.com/data',
  DEFAULT_RECITER: 'Alafasy_128kbps',
  AUDIO_CACHE_PREFIX: 'ayah_audio_',


  /* ===========================
   *        METADATA
   * =========================== */

  async fetchSurahMetadata() {
    const cached = await StorageAdapter.get(this.STORAGE_KEY);
    if (cached) {
      try {
        const data = JSON.parse(cached);
        if (data?.data?.surahs) return data;
      } catch (e) {
        Logger.error('Error parsing cached surah metadata:', e);
      }
    }

    if (!navigator.onLine) return null;

    try {
      const res = await fetch(`${this.API_BASE_URL}/meta`);
      const data = await res.json();
      await StorageAdapter.set(this.STORAGE_KEY, JSON.stringify(data));
      return data;
    } catch (e) {
      Logger.error('Error fetching surah metadata:', e);
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
    const s = metadata.data.surahs;
    if (Array.isArray(s.references)) return s.references;
    if (Array.isArray(s)) return s;
    if (typeof s === 'object') return Object.values(s);
    return [];
  },

  /* ===========================
   *        TEXT FETCHING
   * =========================== */

  async fetchPageText(pageNumber, edition = 'quran-uthmani') {
    if (!navigator.onLine) return null;

    if (pageNumber % 1 !== 0) {
      return this.fetchFractionalPageText(pageNumber, edition);
    }

    try {
      const res = await fetch(`${this.API_BASE_URL}/page/${Math.floor(pageNumber)}/${edition}`);
      return await res.json();
    } catch (e) {
      Logger.error('Error fetching page text:', e);
      return null;
    }
  },

  async fetchFractionalPageText(fractionalPage, edition = 'quran-uthmani') {
    const floor = Math.floor(fractionalPage);
    const ceil = Math.ceil(fractionalPage);
    const frac = fractionalPage - floor;

    const [p1, p2] = await Promise.all([
      this.fetchPageText(floor, edition),
      this.fetchPageText(ceil, edition)
    ]);

    if (!p1 || !p2) return p1 || p2;

    const ayahs = [
      ...(p1.data?.ayahs || []),
      ...(p2.data?.ayahs || []).slice(0, Math.ceil((p2.data.ayahs.length) * frac))
    ];

    return {
      ...p1,
      data: { ...p1.data, ayahs }
    };
  },

  async fetchPageRange(startPage, endPage, edition = 'quran-uthmani') {
    const combinedAyahs = [];
    let template = null;

    const startFloor = Math.floor(startPage);
    const endFloor = Math.floor(endPage);

    for (let p = startFloor; p <= endFloor; p++) {
      const page = await this.fetchPageText(p, edition);
      if (!page?.data?.ayahs) continue;
      if (!template) template = page;
      combinedAyahs.push(...page.data.ayahs);
    }

    if (!template) return null;

    return {
      ...template,
      data: { ...template.data, ayahs: combinedAyahs }
    };
  },

  /* ===========================
   *        AUDIO (EveryAyah)
   * =========================== */

  /**
   * Build EveryAyah audio URL
   * @param {number} surah
   * @param {number} ayah
   * @param {string} reciter
   */
  getAyahAudioUrl(surah, ayah, reciter = this.DEFAULT_RECITER) {
    const s = String(surah).padStart(3, '0');
    const a = String(ayah).padStart(3, '0');
    return `${this.EVERYAYAH_BASE_URL}/${reciter}/${s}${a}.mp3`;
  },

  /**
   * Fetch & cache ayah audio
   */
  async fetchAyahAudio(surah, ayah, reciter = this.DEFAULT_RECITER) {
    const cacheKey = `${this.AUDIO_CACHE_PREFIX}${reciter}_${surah}_${ayah}`;

    const cached = await StorageAdapter.get(cacheKey);
    if (cached) return cached;

    const url = this.getAyahAudioUrl(surah, ayah, reciter);

    // Just cache the URL (audio streamed by browser)
    await StorageAdapter.set(cacheKey, url);
    return url;
  },

  /**
   * Get audio URLs for multiple ayahs
   */
  async fetchAyahsAudio(ayahs, reciter = this.DEFAULT_RECITER) {
    const results = [];
    for (const ayah of ayahs) {
      const url = await this.fetchAyahAudio(
        ayah.surah.number,
        ayah.numberInSurah,
        reciter
      );
      results.push({
        ...ayah,
        audio: url
      });
    }
    return results;
  },

  /* ===========================
   *        HELPERS
   * =========================== */

  getSurahName(surah, language = 'en') {
    if (!surah) return '';
    if (language === 'ar') return surah.name;
    return surah.englishName || surah.name;
  }
};

// Expose globally
window.QuranAPI = QuranAPI;
