// Utilities Index - Export all utility functions

// Import all utilities first
import {
  showToast,
  hideToast,
  showLoading,
  hideLoading
} from './ui.js';

import {
  formatDate,
  formatDateTime,
  formatTime,
  formatDuration,
  formatFileSize
} from './formatters.js';

import {
  debounce,
  throttle,
  deepClone,
  deepMerge
} from './helpers.js';

import {
  validateEmail,
  validatePhone,
  validateUrl,
  validateRequired
} from './validators.js';

import {
  localStorageUtil,
  sessionStorageUtil
} from './storage.js';

import {
  checkNetworkStatus,
  getNetworkInfo
} from './network.js';

// Export all utilities
export {
  showToast,
  hideToast,
  showLoading,
  hideLoading
} from './ui.js';

export {
  formatDate,
  formatDateTime,
  formatTime,
  formatDuration,
  formatFileSize
} from './formatters.js';

export {
  debounce,
  throttle,
  deepClone,
  deepMerge
} from './helpers.js';

export {
  validateEmail,
  validatePhone,
  validateUrl,
  validateRequired
} from './validators.js';

export {
  localStorageUtil,
  sessionStorageUtil
} from './storage.js';

export {
  checkNetworkStatus,
  getNetworkInfo
} from './network.js';

// Create global Utils object with all functions
const Utils = {
  // UI Utilities
  showToast,
  hideToast,
  showLoading,
  hideLoading,

  // Formatters
  formatDate,
  formatDateTime,
  formatTime,
  formatDuration,
  formatFileSize,

  // Helpers
  debounce,
  throttle,
  deepClone,
  deepMerge,

  // Validators
  validateEmail,
  validatePhone,
  validateUrl,
  validateRequired,

  // Storage
  localStorage: localStorageUtil,
  sessionStorage: sessionStorageUtil,

  // Network
  network: {
    checkStatus: checkNetworkStatus,
    getInfo: getNetworkInfo
  }
};

// Export all utilities to global scope for easy access
window.Utils = Utils;

// Utility initialization
window.initializeUtils = function() {
  console.log('Initializing utilities...');

  // Setup global error handlers
  setupGlobalErrorHandlers();

  // Setup network monitoring
  setupNetworkMonitoring();

  // Setup performance monitoring
  setupPerformanceMonitoring();

  console.log('Utilities initialized successfully');
};

// Global error handlers
function setupGlobalErrorHandlers() {
  window.addEventListener('error', function(event) {
    console.error('Global error:', event.error);
    Utils.showToast('An unexpected error occurred', 'error');
  });

  window.addEventListener('unhandledrejection', function(event) {
    console.error('Unhandled promise rejection:', event.reason);
    Utils.showToast('A network error occurred', 'error');
  });
}

// Network monitoring
function setupNetworkMonitoring() {
  let isOnline = navigator.onLine;

  window.addEventListener('online', function() {
    if (!isOnline) {
      isOnline = true;
      Utils.showToast('Connection restored', 'success');
    }
  });

  window.addEventListener('offline', function() {
    if (isOnline) {
      isOnline = false;
      Utils.showToast('No internet connection', 'warning');
    }
  });
}

// Performance monitoring
function setupPerformanceMonitoring() {
  // Monitor long tasks
  if ('PerformanceObserver' in window) {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.duration > 50) { // Long task threshold
          console.warn('Long task detected:', entry.duration + 'ms');
        }
      }
    });

    observer.observe({ entryTypes: ['longtask'] });
  }

  // Monitor memory usage (if available)
  if ('memory' in performance) {
    setInterval(() => {
      const memory = performance.memory;
      if (memory.usedJSHeapSize > memory.totalJSHeapSize * 0.9) {
        console.warn('High memory usage detected');
      }
    }, 30000); // Check every 30 seconds
  }
}

// Global utility functions
window.showGlobalLoading = function(message = 'Loading...') {
  Utils.showLoading(message);
};

window.hideGlobalLoading = function() {
  Utils.hideLoading();
};

window.showGlobalToast = function(message, type = 'info', duration = 3000) {
  Utils.showToast(message, type, duration);
};

// Initialize utilities on DOM ready
document.addEventListener('DOMContentLoaded', function() {
  if (typeof window.initializeUtils === 'function') {
    window.initializeUtils();
  }
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    ...Utils,
    initializeUtils: window.initializeUtils
  };
}

// Default export
export default Utils;