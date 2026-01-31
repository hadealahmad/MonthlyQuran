// Internationalization (i18n) System

const translations = {
  en: {
    app: {
      title: 'Monthly Quran',
      subtitle: 'Memorization Tracker'
    },
    setup: {
      title: 'Set up your memorization plan',
      unitType: 'Unit Type',
      dailyAmount: 'Daily Amount',
      totalUnits: 'Total Units',
      totalPages: 'Total Pages',
      totalVerses: 'Total Verses',
      totalHizbs: 'Total Hizbs',
      totalQuarterHizbs: 'Total Quarter Hizbs',
      totalJuzs: 'Total Juzs',
      startDate: 'Start Date',
      startPage: 'Start Page Number',
      progressionName: 'Progression Name',
      language: 'Language',
      startButton: 'Start Memorization',
      surahPreset: 'Big Surahs Preset (Optional)',
      surahPresetNone: 'None'
    },
    dashboard: {
      newMemorization: 'New Memorization',
      yesterdayReview: "Yesterday's Review",
      spacedReview: 'Spaced Review',
      today: 'Today',
      noItems: 'No items scheduled',
      markComplete: 'Mark as complete',
      markIncomplete: 'Mark as incomplete',
      calendar: 'Calendar',
      previousDay: 'Previous day',
      nextDay: 'Next day'
    },
    nav: {
      today: 'Today',
      progress: 'Progress',
      calendar: 'Calendar',
      settings: 'Settings',
      credits: 'Credits'
    },
    today: {
      stats: '{{total}} tasks today, {{completed}} completed',
      priorityNew: 'New',
      priorityYesterday: 'Yesterday',
      prioritySpaced: 'Review',
      readText: 'Read'
    },
    progress: {
      title: 'Memorization Progress',
      nextReview: 'Next review: {{date}}',
      currentStation: 'Station {{station}}',
      addNew: 'Add New',
      deleteItem: 'Delete Item',
      allProgressions: 'All Progressions',
      editProgression: 'Edit Progression',
      saveChanges: 'Save Changes?',
      migrationWarning: 'This will update the progression settings. Existing progress will be migrated where possible.',
      updateSuccess: 'Progression updated successfully.',
      updateError: 'Update failed'
    },
    settings: {
      title: 'Settings',
      configuration: 'Configuration',
      progress: 'Progress',
      saveChanges: 'Save Changes',
      totalItems: 'Total Items',
      completionRate: 'Completion Rate',
      back: 'Back',
      morningHour: 'Morning Review Hour',
      eveningHour: 'Evening Review Hour',
      resetApp: 'Reset Application',
      exportData: 'Export Data',
      importData: 'Import Data'
    },
    calendar: {
      close: 'Close',
      previousMonth: 'Previous month',
      nextMonth: 'Next month',
      filterAll: 'All Progressions',
      months: {
        0: 'January',
        1: 'February',
        2: 'March',
        3: 'April',
        4: 'May',
        5: 'June',
        6: 'July',
        7: 'August',
        8: 'September',
        9: 'October',
        10: 'November',
        11: 'December'
      },
      weekdays: {
        0: 'Sun',
        1: 'Mon',
        2: 'Tue',
        3: 'Wed',
        4: 'Thu',
        5: 'Fri',
        6: 'Sat'
      },
      newTaskCount: '{{count}} new memorization(s)',
      yesterdayTaskCount: '{{count}} yesterday review(s)',
      spacedTaskCount: '{{count}} spaced review(s)',
      legendNew: 'New Memorization',
      legendYesterday: "Yesterday's Review",
      legendSpaced: 'Spaced Review'
    },
    stations: {
      1: 'Station 1 (Morning)',
      2: 'Station 2 (Evening)',
      3: 'Station 3 (24-Hour Review)',
      4: 'Station 4 (First Gap)',
      5: 'Station 5 (Week Gap)',
      6: 'Station 6 (Fortnight Gap)',
      7: 'Station 7 (Monthly Seal)'
    },
    units: {
      page: 'Page',
      verse: 'Ayah',
      hizb: 'Hizb',
      quarter_hizb: 'Quarter',
      juz: 'Juz'
    },
    theme: {
      light: 'Light',
      dark: 'Dark'
    },
    common: {
      delete: 'Delete',
      deleteConfirm: 'Delete {{item}}?',
      deleteChoiceMessage: 'What would you like to delete?',
      deleteOne: 'Delete this item only',
      deleteAll: 'Delete all items',
      deleteAllConfirm: 'Are you sure you want to delete ALL items? This cannot be undone.',
      cancel: 'Cancel',
      confirm: 'Confirm',
      save: 'Save',
      edit: 'Edit',
      ok: 'OK',
      success: 'Success',
      error: 'Error',
      exportConfirm: 'Export will download all your data as a JSON file.',
      importConfirm: 'Importing will overwrite all current data. Are you sure?',
      resetConfirm: 'Are you sure you want to reset the application? This will delete all your data and cannot be undone.'
    },
    aria: {
      toggleLanguage: 'Toggle language',
      toggleTheme: 'Toggle theme',
      settings: 'Settings',
      deleteItem: 'Delete item',
      markComplete: 'Mark as complete',
      markIncomplete: 'Mark as incomplete'
    },
    credits: {
      title: 'Credits',
      name: 'Dr. Wafaa Orabi',
      role: 'Memorization Algorithm Creator',
      algorithmTitle: 'About the Algorithm',
      algorithmDescription: 'This application implements the 7-Station Spaced Repetition Algorithm for Quran memorization, developed by Dr. Wafaa Orabi. The algorithm is based on scientific principles of memory retention, specifically the Forgetting Curve discovered by Hermann Ebbinghaus. Instead of mass repetition (cramming), the system uses spaced repetition at calculated intervals to move content from short-term to long-term memory through 7 review stations over approximately one month.',
      methodologyTitle: 'The Methodology',
      methodologyDescription: 'The algorithm relies on reviewing the Quran through seven stations over approximately one month. Each station represents a calculated timing for repetition to enhance permanent memorization: repeating the text several hours after the initial memorization, then reviews after days and weeks. This transfers information from short-term to long-term memory, utilizing the forgetting curve and effective repetitive learning techniques.',
      contactTitle: 'Rights',
      telegramLink: 'To visit Dr. Wafaa Orabi\'s Telegram channel'
    },
    installPrompt: {
      title: 'Install App',
      message: 'Add this app to your home screen for quick access and a better experience.',
      installButton: 'Install',
      dismissButton: 'Not Now'
    },
    reading: {
      title: 'Quran Text',
      close: 'Close',
      loading: 'Loading...',
      error: 'Error loading text',
      markAsRead: 'Mark as Read',
    },
    privacy: {
      title: 'Privacy Policy',
      lastUpdated: 'Last updated: December 2025',
      storageTitle: 'Data Storage',
      storageText: 'This application is designed with an "Offline First" philosophy. All your memorization data, settings, and progress are stored exclusively on your device using LocalStorage/IndexedDB technologies.',
      collectionTitle: 'Data Collection',
      collectionText: 'We do not collect, transmit, or store any of your personal data on external servers. No analytics or tracking cookies are used within this application.',
      internetTitle: 'Internet Usage',
      internetText: 'Internet connection is only used for:',
      internetItem1: 'Initial download of Quran metadata/text',
      internetItem2: 'Playing Quran audio recitations',
      internetItem3: 'Updating the application'
    },
    notifications: {
      morningReminder: 'Time for your morning review!',
      eveningReminder: 'Time for your evening review!',
      title: 'Monthly Quran'
    }
  },
  ar: {
    app: {
      title: 'القرآن الشهري',
      subtitle: 'متتبع الحفظ'
    },
    setup: {
      title: 'قم بإعداد خطة الحفظ الخاصة بك',
      unitType: 'نوع الوحدة',
      dailyAmount: 'الكمية اليومية',
      totalUnits: 'إجمالي الوحدات',
      totalPages: 'إجمالي الصفحات',
      totalVerses: 'إجمالي الآيات',
      totalHizbs: 'إجمالي الأحزاب',
      totalQuarterHizbs: 'إجمالي أرباع الأحزاب',
      totalJuzs: 'إجمالي الأجزاء',
      startDate: 'تاريخ البدء',
      startPage: 'رقم الصفحة الأولى',
      progressionName: 'اسم التقدم',
      language: 'اللغة',
      startButton: 'بدء الحفظ',
      surahPreset: 'السور الكبيرة (اختياري)',
      surahPresetNone: 'لا شيء'
    },
    dashboard: {
      newMemorization: 'الحفظ الجديد',
      yesterdayReview: 'مراجعة الأمس',
      spacedReview: 'المراجعة المتتابعة',
      today: 'اليوم',
      noItems: 'لا توجد عناصر مجدولة',
      markComplete: 'تمييز كمكتمل',
      markIncomplete: 'إلغاء التمييز',
      calendar: 'التقويم',
      previousDay: 'اليوم السابق',
      nextDay: 'اليوم التالي'
    },
    nav: {
      today: 'اليوم',
      progress: 'التقدم',
      calendar: 'التقويم',
      settings: 'الإعدادات',
      credits: 'الخوارزمية'
    },
    today: {
      stats: '{{total}} مهمة اليوم، {{completed}} مكتملة',
      priorityNew: 'جديد',
      priorityYesterday: 'أمس',
      prioritySpaced: 'مراجعة',
      readText: 'قراءة'
    },
    progress: {
      title: 'تقدم الحفظ',
      nextReview: 'المراجعة القادمة: {{date}}',
      currentStation: 'المحطة {{station}}',
      addNew: 'إضافة جديد',
      deleteItem: 'حذف العنصر',
      allProgressions: 'جميع التقدمات',
      editProgression: 'تعديل التقدم',
      saveChanges: 'حفظ التغييرات؟',
      migrationWarning: 'سيؤدي هذا إلى تحديث إعدادات التقدم. سيتم نقل التقدم الحالي حيثما أمكن ذلك.',
      updateSuccess: 'تم تحديث التقدم بنجاح.',
      updateError: 'فشل التحديث'
    },
    settings: {
      title: 'الإعدادات',
      configuration: 'التكوين',
      progress: 'التقدم',
      saveChanges: 'حفظ التغييرات',
      totalItems: 'إجمالي العناصر',
      completionRate: 'معدل الإكمال',
      back: 'رجوع',
      morningHour: 'ساعة المراجعة الصباحية',
      eveningHour: 'ساعة المراجعة المسائية',
      resetApp: 'إعادة تعيين التطبيق',
      exportData: 'تصدير البيانات',
      importData: 'استيراد البيانات'
    },
    calendar: {
      close: 'إغلاق',
      previousMonth: 'الشهر السابق',
      nextMonth: 'الشهر التالي',
      filterAll: 'جميع التقدمات',
      months: {
        0: 'يناير',
        1: 'فبراير',
        2: 'مارس',
        3: 'أبريل',
        4: 'مايو',
        5: 'يونيو',
        6: 'يوليو',
        7: 'أغسطس',
        8: 'سبتمبر',
        9: 'أكتوبر',
        10: 'نوفمبر',
        11: 'ديسمبر'
      },
      weekdays: {
        0: 'أحد',
        1: 'إثنين',
        2: 'ثلاثاء',
        3: 'أربعاء',
        4: 'خميس',
        5: 'جمعة',
        6: 'سبت'
      },
      newTaskCount: '{{count}} حفظ جديد',
      yesterdayTaskCount: '{{count}} مراجعة الأمس',
      spacedTaskCount: '{{count}} مراجعة متتابعة',
      legendNew: 'حفظ جديد',
      legendYesterday: 'مراجعة الأمس',
      legendSpaced: 'مراجعة متتابعة'
    },
    stations: {
      1: 'المحطة 1 (الصباح)',
      2: 'المحطة 2 (المساء)',
      3: 'المحطة 3 (مراجعة 24 ساعة)',
      4: 'المحطة 4 (الفجوة الأولى)',
      5: 'المحطة 5 (فجوة الأسبوع)',
      6: 'المحطة 6 (فجوة الأسبوعين)',
      7: 'المحطة 7 (الختم الشهري)'
    },
    units: {
      page: 'صفحة',
      verse: 'آية',
      hizb: 'حزب',
      quarter_hizb: 'ربع',
      juz: 'جزء'
    },
    theme: {
      light: 'فاتح',
      dark: 'داكن'
    },
    common: {
      delete: 'حذف',
      deleteConfirm: 'حذف {{item}}؟',
      deleteChoiceMessage: 'ماذا تريد حذفه؟',
      deleteOne: 'حذف هذا العنصر فقط',
      deleteAll: 'حذف جميع العناصر',
      deleteAllConfirm: 'هل أنت متأكد من حذف جميع العناصر؟ لا يمكن التراجع عن هذا الإجراء.',
      cancel: 'إلغاء',
      confirm: 'تأكيد',
      save: 'حفظ',
      edit: 'تعديل',
      ok: 'حسناً',
      success: 'تم بنجاح',
      error: 'خطأ',
      exportConfirm: 'سيقوم التصدير بتنزيل جميع بياناتك كملف JSON.',
      importConfirm: 'سيؤدي الاستيراد إلى استبدال جميع البيانات الحالية. هل أنت متأكد؟',
      resetConfirm: 'هل أنت متأكد من إعادة تعيين التطبيق؟ سيؤدي هذا إلى حذف جميع بياناتك ولا يمكن التراجع عنه.'
    },
    aria: {
      toggleLanguage: 'تبديل اللغة',
      toggleTheme: 'تبديل المظهر',
      settings: 'الإعدادات',
      deleteItem: 'حذف العنصر',
      markComplete: 'تمييز كمكتمل',
      markIncomplete: 'إلغاء التمييز'
    },
    credits: {
      title: 'الخوارزمية',
      name: 'د. وفاء عرابي',
      role: 'مبتكرة خوارزمية الحفظ',
      algorithmTitle: 'الخوارزمية',
      algorithmDescription: 'يُطبق هذا التطبيق خوارزمية المراجعة المتتابعة ذات المحطات السبع لحفظ القرآن الكريم، التي طورتها د. وفاء عرابي. تعتمد الخوارزمية على المبادئ العلمية للاحتفاظ بالذاكرة، وتحديداً منحنى النسيان الذي اكتشفه هيرمان إبنجهاوس. بدلاً من التكرار الجماعي (الحشو)، يستخدم النظام المراجعة المتتابعة على فترات محسوبة لنقل المحتوى من الذاكرة قصيرة المدى إلى الذاكرة طويلة المدى من خلال 7 محطات مراجعة على مدار شهر تقريباً.',
      methodologyTitle: 'المنهجية',
      methodologyDescription: 'تعتمد الخوارزمية على مراجعة القرآن عبر سبع محطات خلال حوالي شهر. كل محطة تمثل توقيتاً مدروساً لتكرار المراجعة بهدف تعزيز الحفظ الدائم: تكرار النص بعد عدة ساعات من الحفظ الأولي، ثم مراجعات بعد أيام وأسابيع. بذلك يتم نقل المعلومات من الذاكرة قصيرة المدى إلى طويلة المدى، عبر الاستفادة من منحنى النسيان وتقنيات التعلم التكراري الفعال.',
      contactTitle: 'الحقوق',
      telegramLink: 'للزيارة قناة التلجرام للدكتورة وفاء عرابي'
    },
    installPrompt: {
      title: 'تثبيت التطبيق',
      message: 'أضف هذا التطبيق إلى الشاشة الرئيسية للوصول السريع وتجربة أفضل.',
      installButton: 'تثبيت',
      dismissButton: 'ليس الآن'
    },
    reading: {
      title: 'نص القرآن',
      close: 'إغلاق',
      loading: 'جاري التحميل...',
      error: 'خطأ في تحميل النص',
      markAsRead: 'تم القراءة',
    },
    privacy: {
      title: 'سياسة الخصوصية',
      lastUpdated: 'آخر تحديث: ديسمبر 2025',
      storageTitle: 'تخزين البيانات',
      storageText: 'تم تصميم هذا التطبيق بفلسفة "أوفلاين أولاً". يتم تخزين جميع بيانات الحفظ والإعدادات والتقدم حصرياً على جهازك باستخدام تقنيات LocalStorage/IndexedDB.',
      collectionTitle: 'جمع البيانات',
      collectionText: 'نحن لا نجمع أو ننقل أو نخزن أي من بياناتك الشخصية على خوادم خارجية. لا يتم استخدام أي ملفات تعريف ارتباط للتحليل أو التتبع داخل هذا التطبيق.',
      internetTitle: 'استخدام الإنترنت',
      internetText: 'يتم استخدام اتصال الإنترنت فقط من أجل:',
      internetItem1: 'التنزيل الأولي لبيانات القرآن الكريم',
      internetItem2: 'تشغيل التلاوات الصوتية للقرآن',
      internetItem3: 'تحديث التطبيق'
    },
    notifications: {
      morningReminder: 'حان وقت المراجعة الصباحية!',
      eveningReminder: 'حان وقت المراجعة المسائية!',
      title: 'القرآن الشهري'
    }
  }
};

const i18n = {
  currentLanguage: DEFAULT_CONFIG.LANGUAGE,

  // Initialize i18n with language from config
  init(language) {
    this.currentLanguage = language || DEFAULT_CONFIG.LANGUAGE;
    this.updateDocumentDirection();
  },

  // Get translation for a key
  t(key, params = {}) {
    const keys = key.split('.');
    let value = translations[this.currentLanguage];

    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k];
      } else {
        return key; // Return key if translation not found
      }
    }

    if (typeof value === 'string') {
      // Simple parameter replacement
      return value.replace(/\{\{(\w+)\}\}/g, (match, paramKey) => {
        return params[paramKey] || match;
      });
    }

    return value || key;
  },

  // Set language
  setLanguage(language) {
    if (translations[language]) {
      this.currentLanguage = language;
      this.updateDocumentDirection();
      return true;
    }
    return false;
  },

  // Get current language
  getLanguage() {
    return this.currentLanguage;
  },

  // Update document direction based on language
  updateDocumentDirection() {
    const html = document.documentElement;
    if (this.currentLanguage === 'ar') {
      html.setAttribute('dir', 'rtl');
      html.setAttribute('lang', 'ar');
    } else {
      html.setAttribute('dir', 'ltr');
      html.setAttribute('lang', 'en');
    }
  },

  // Translate all elements with data-i18n attribute
  translatePage() {
    // Translate text content
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(element => {
      const key = element.getAttribute('data-i18n');
      const translation = this.t(key);

      if (element.tagName === 'INPUT' && element.type === 'submit') {
        element.value = translation;
      } else if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
        element.placeholder = translation;
      } else {
        element.textContent = translation;
      }
    });

    // Translate aria-labels
    const ariaElements = document.querySelectorAll('[data-i18n-aria]');
    ariaElements.forEach(element => {
      const key = element.getAttribute('data-i18n-aria');
      const translation = this.t(key);
      element.setAttribute('aria-label', translation);
    });

    // Re-update navbar label if it's showing a day name (not "Today")
    if (window.UI && window.UI.updateNavbarLabel) {
      const navLabel = document.querySelector('#nav-today .nav-label');
      if (navLabel && navLabel.getAttribute('data-day-name') === 'true') {
        window.UI.updateNavbarLabel();
      }
    }
  }
};

