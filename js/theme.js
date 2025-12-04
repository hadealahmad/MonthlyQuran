// Theme Management (Light/Dark Mode)

const Theme = {
  currentTheme: 'light',

  // Initialize theme from storage or system preference
  init() {
    const config = Storage.getConfig();
    const savedTheme = config?.theme;
    
    if (savedTheme) {
      this.setTheme(savedTheme);
    } else {
      // Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.setTheme(prefersDark ? 'dark' : 'light');
    }

    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!Storage.getConfig()?.theme) {
        this.setTheme(e.matches ? 'dark' : 'light');
      }
    });
  },

  // Set theme
  setTheme(theme) {
    if (theme !== 'light' && theme !== 'dark') {
      theme = 'light';
    }

    this.currentTheme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    
    // Save to config
    const config = Storage.getConfig();
    if (config) {
      config.theme = theme;
      Storage.saveConfig(config);
    }

    // Update theme toggle icon
    this.updateThemeToggle();
  },

  // Toggle between light and dark
  toggle() {
    const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
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
    icon.innerHTML = '';
    
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

