// Logging Utility
// Provides development/production aware logging

const Logger = {
  /**
   * Check if running in development mode
   * @returns {boolean} True if in development mode
   */
  isDevelopment() {
    return window.location.hostname === 'localhost' || 
           window.location.hostname === '127.0.0.1' ||
           window.location.hostname === '';
  },

  /**
   * Log an error message
   * @param {string} message - Error message
   * @param {Error|*} error - Error object or additional data
   */
  error(message, error) {
    if (this.isDevelopment()) {
      console.error(message, error || '');
    }
    // In production, could send to error tracking service
    // Example: if (window.errorTracker) window.errorTracker.track(error);
  },

  /**
   * Log a warning message
   * @param {string} message - Warning message
   * @param {*} data - Additional data
   */
  warn(message, data) {
    if (this.isDevelopment()) {
      console.warn(message, data || '');
    }
  },

  /**
   * Log an info message
   * @param {string} message - Info message
   * @param {*} data - Additional data
   */
  info(message, data) {
    if (this.isDevelopment()) {
      console.log(message, data || '');
    }
  },

  /**
   * Log a debug message (only in development)
   * @param {string} message - Debug message
   * @param {*} data - Additional data
   */
  debug(message, data) {
    if (this.isDevelopment()) {
      console.debug(message, data || '');
    }
  }
};

