// Theme Management (Light/Dark Mode)

const Theme = {
  currentTheme: 'light',

  // Initialize theme from storage or system preference
  async init() {
    const config = await Storage.getConfig();
    const savedTheme = config?.theme;

    if (savedTheme) {
      await this.setTheme(savedTheme, false); // Don't save on init
    } else {
      // Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      await this.setTheme(prefersDark ? 'dark' : 'light', false);
    }

    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', async (e) => {
      const config = await Storage.getConfig();
      if (!config?.theme) {
        await this.setTheme(e.matches ? 'dark' : 'light', false);
      }
    });
  },

  // Set theme
  async setTheme(theme, saveToConfig = true) {
    if (theme !== 'light' && theme !== 'dark') {
      theme = 'light';
    }

    this.currentTheme = theme;
    document.documentElement.setAttribute('data-theme', theme);

    // Save to config only if requested
    if (saveToConfig) {
      const config = await Storage.getConfig();
      if (config) {
        config.theme = theme;
        await Storage.saveConfig(config);
      }
    }

    // Update theme toggle icon
    this.updateThemeToggle();
  },

  // Toggle between light and dark
  async toggle() {
    const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
    await this.setTheme(newTheme, true);
  },

  // Get current theme
  getTheme() {
    return this.currentTheme;
  },

  // Update theme toggle button icon
  updateThemeToggle() {
    const toggleBtn = document.getElementById('theme-toggle');
    if (!toggleBtn) return;

    const icon = toggleBtn.querySelector('svg');
    if (!icon) return;

    // Clear existing content
    icon.replaceChildren();

    // Create new icon using SVG utils
    const newIcon = this.currentTheme === 'dark'
      ? SVGUtils.createSunIcon()
      : SVGUtils.createMoonIcon();

    // Copy children from new icon to existing icon
    while (newIcon.firstChild) {
      icon.appendChild(newIcon.firstChild);
    }
  }
};
