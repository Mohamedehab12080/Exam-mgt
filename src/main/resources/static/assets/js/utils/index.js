// Utilities Index - Export all utility functions as ES6 modules

// Import all utilities
import * as UI from '/ui.js';
import * as Formatters from '/formatters.js';
import * as Helpers from '/helpers.js';
import * as Validators from '/validators.js';
import * as Storage from '/storage.js';
import * as Network from '/network.js';

// Export all utilities individually
export * from '/ui.js';
export * from '/formatters.js';
export * from '/helpers.js';
export * from '/validators.js';
export * from '/storage.js';
export * from '/network.js';

// Create global Utils object with all functions
const Utils = {
  // UI Utilities
  ...UI,

  // Formatters
  ...Formatters,

  // Helpers
  ...Helpers,

  // Validators
  ...Validators,

  // Storage
  storage: Storage,

  // Network
  network: Network
};

// Global utility functions for easy access
window.showToast = UI.showToast;
window.hideToast = UI.hideToast;
window.showLoading = UI.showLoading;
window.hideLoading = UI.hideLoading;
window.Utils = Utils;

// Utility initialization
window.initializeUtils = function() {
  console.log('Initializing utilities...');

  // Add CSS animations
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
      from { transform: translateX(0); opacity: 1; }
      to { transform: translateX(100%); opacity: 0; }
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);

  // Setup global error handlers
  setupGlobalErrorHandlers();

  // Setup network monitoring
  setupNetworkMonitoring();

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

// Initialize utilities on DOM ready
document.addEventListener('DOMContentLoaded', function() {
  if (typeof window.initializeUtils === 'function') {
    window.initializeUtils();
  }
});

// Default export
export default Utils;

export class initializeUtils {
}