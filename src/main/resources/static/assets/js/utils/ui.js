// UI Utility Functions

/**
 * Show toast notification
 * @param {string} message - Message to display
 * @param {string} type - Toast type (success, error, warning, info)
 * @param {number} duration - Duration in milliseconds
 */
export function showToast(message, type = 'info', duration = 3000) {
  // Create toast container if it doesn't exist
  let toastContainer = document.getElementById('toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    toastContainer.className = 'toast-container';
    document.body.appendChild(toastContainer);
  }

  // Create toast element
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <div class="toast-content">
      <div class="toast-icon">
        <i class="fas ${getToastIcon(type)}"></i>
      </div>
      <div class="toast-message">${message}</div>
      <button class="toast-close" onclick="this.parentElement.parentElement.remove()">
        <i class="fas fa-times"></i>
      </button>
    </div>
    <div class="toast-progress"></div>
  `;

  // Add toast to container
  toastContainer.appendChild(toast);

  // Trigger animation
  setTimeout(() => {
    toast.classList.add('show');
  }, 10);

  // Auto remove toast
  setTimeout(() => {
    removeToast(toast);
  }, duration);

  // Progress bar animation
  const progressBar = toast.querySelector('.toast-progress');
  if (progressBar) {
    progressBar.style.animationDuration = duration + 'ms';
  }
}

/**
 * Remove toast element
 * @param {HTMLElement} toast - Toast element to remove
 */
function removeToast(toast) {
  toast.classList.remove('show');
  setTimeout(() => {
    if (toast.parentElement) {
      toast.parentElement.removeChild(toast);
    }
  }, 300);
}

/**
 * Get toast icon based on type
 * @param {string} type - Toast type
 * @returns {string} Icon class
 */
function getToastIcon(type) {
  const icons = {
    success: 'fa-check-circle',
    error: 'fa-exclamation-circle',
    warning: 'fa-exclamation-triangle',
    info: 'fa-info-circle'
  };
  return icons[type] || icons.info;
}

/**
 * Hide all toasts
 */
export function hideToast() {
  const toastContainer = document.getElementById('toast-container');
  if (toastContainer) {
    toastContainer.innerHTML = '';
  }
}

/**
 * Show loading overlay
 * @param {string} message - Loading message
 * @param {string} containerId - Container ID (optional, defaults to body)
 */
export function showLoading(message = 'Loading...', containerId = null) {
  const container = containerId ? document.getElementById(containerId) : document.body;
  if (!container) return;

  // Remove existing loading overlay
  hideLoading(containerId);

  const loadingOverlay = document.createElement('div');
  loadingOverlay.className = 'loading-overlay';
  loadingOverlay.innerHTML = `
    <div class="loading-content">
      <div class="loading-spinner"></div>
      <div class="loading-message">${message}</div>
    </div>
  `;

  container.appendChild(loadingOverlay);

  // Trigger animation
  setTimeout(() => {
    loadingOverlay.classList.add('show');
  }, 10);
}

/**
 * Hide loading overlay
 * @param {string} containerId - Container ID (optional)
 */
export function hideLoading(containerId = null) {
  const container = containerId ? document.getElementById(containerId) : document.body;
  if (!container) return;

  const loadingOverlay = container.querySelector('.loading-overlay');
  if (loadingOverlay) {
    loadingOverlay.classList.remove('show');
    setTimeout(() => {
      if (loadingOverlay.parentElement) {
        loadingOverlay.parentElement.removeChild(loadingOverlay);
      }
    }, 300);
  }
}

/**
 * Show confirmation dialog
 * @param {string} message - Confirmation message
 * @param {Object} options - Options
 * @returns {Promise<boolean>} Confirmation result
 */
export function showConfirm(message, options = {}) {
  return new Promise((resolve) => {
    const modal = new ModalComponent({
      title: options.title || 'Confirm',
      content: `
        <div class="confirm-dialog">
          <div class="confirm-icon">
            <i class="fas fa-exclamation-triangle"></i>
          </div>
          <div class="confirm-message">
            <p>${message}</p>
          </div>
        </div>
      `,
      footerButtons: [
        {
          text: options.cancelText || 'Cancel',
          class: 'btn btn-secondary',
          action: 'cancel'
        },
        {
          text: options.confirmText || 'Confirm',
          class: 'btn btn-danger',
          action: 'confirm'
        }
      ]
    });

    modal.show().then(result => {
      modal.remove();
      resolve(result !== null);
    });
  });
}

/**
 * Show alert dialog
 * @param {string} message - Alert message
 * @param {Object} options - Options
 * @returns {Promise<void>}
 */
export function showAlert(message, options = {}) {
  return new Promise((resolve) => {
    const modal = new ModalComponent({
      title: options.title || 'Alert',
      content: `
        <div class="alert-dialog">
          <div class="alert-icon">
            <i class="fas fa-info-circle"></i>
          </div>
          <div class="alert-message">
            <p>${message}</p>
          </div>
        </div>
      `,
      footerButtons: [
        {
          text: options.buttonText || 'OK',
          class: 'btn btn-primary',
          action: 'ok'
        }
      ]
    });

    modal.show().then(() => {
      modal.remove();
      resolve();
    });
  });
}

/**
 * Show prompt dialog
 * @param {string} message - Prompt message
 * @param {string} defaultValue - Default value
 * @param {Object} options - Options
 * @returns {Promise<string|null>} User input
 */
export function showPrompt(message, defaultValue = '', options = {}) {
  return new Promise((resolve) => {
    const modal = new ModalComponent({
      title: options.title || 'Input',
      content: `
        <div class="prompt-dialog">
          <div class="prompt-message">
            <p>${message}</p>
          </div>
          <div class="prompt-input">
            <input type="text" class="form-control" value="${defaultValue}" id="prompt-input">
          </div>
        </div>
      `,
      footerButtons: [
        {
          text: options.cancelText || 'Cancel',
          class: 'btn btn-secondary',
          action: 'cancel'
        },
        {
          text: options.confirmText || 'OK',
          class: 'btn btn-primary',
          action: 'ok'
        }
      ]
    });

    modal.show().then(result => {
      const input = modal.element.querySelector('#prompt-input');
      const value = result !== null && input ? input.value : null;
      modal.remove();
      resolve(value);
    });
  });
}

/**
 * Show notification banner
 * @param {string} message - Banner message
 * @param {string} type - Banner type (success, error, warning, info)
 * @param {Object} options - Options
 */
export function showBanner(message, type = 'info', options = {}) {
  // Remove existing banner
  hideBanner();

  const banner = document.createElement('div');
  banner.className = `banner banner-${type}`;
  banner.innerHTML = `
    <div class="banner-content">
      <div class="banner-icon">
        <i class="fas ${getToastIcon(type)}"></i>
      </div>
      <div class="banner-message">${message}</div>
      ${options.dismissible !== false ? `
        <button class="banner-close" onclick="this.parentElement.parentElement.remove()">
          <i class="fas fa-times"></i>
        </button>
      ` : ''}
    </div>
  `;

  document.body.appendChild(banner);

  // Auto-dismiss after timeout
  if (options.autoDismiss !== false && options.duration) {
    setTimeout(() => {
      hideBanner();
    }, options.duration);
  }
}

/**
 * Hide banner
 */
export function hideBanner() {
  const banner = document.querySelector('.banner');
  if (banner && banner.parentElement) {
    banner.parentElement.removeChild(banner);
  }
}

/**
 * Show progress bar
 * @param {number} progress - Progress percentage (0-100)
 * @param {string} message - Progress message
 * @param {string} containerId - Container ID
 */
export function showProgress(progress, message = '', containerId = null) {
  const container = containerId ? document.getElementById(containerId) : document.body;
  if (!container) return;

  let progressBar = container.querySelector('.progress-bar');
  if (!progressBar) {
    progressBar = document.createElement('div');
    progressBar.className = 'progress-bar';
    progressBar.innerHTML = `
      <div class="progress-fill"></div>
      <div class="progress-text"></div>
    `;
    container.appendChild(progressBar);
  }

  const fill = progressBar.querySelector('.progress-fill');
  const text = progressBar.querySelector('.progress-text');

  fill.style.width = progress + '%';
  text.textContent = message || `${progress}%`;

  if (progress >= 100) {
    setTimeout(() => {
      hideProgress(containerId);
    }, 1000);
  }
}

/**
 * Hide progress bar
 * @param {string} containerId - Container ID
 */
export function hideProgress(containerId = null) {
  const container = containerId ? document.getElementById(containerId) : document.body;
  if (!container) return;

  const progressBar = container.querySelector('.progress-bar');
  if (progressBar && progressBar.parentElement) {
    progressBar.parentElement.removeChild(progressBar);
  }
}

/**
 * Scroll to element with animation
 * @param {string} elementId - Element ID
 * @param {Object} options - Scroll options
 */
export function scrollToElement(elementId, options = {}) {
  const element = document.getElementById(elementId);
  if (!element) return;

  const scrollOptions = {
    behavior: 'smooth',
    block: 'start',
    inline: 'nearest',
    ...options
  };

  element.scrollIntoView(scrollOptions);
}

/**
 * Smooth scroll to top
 */
export function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
}

/**
 * Add CSS class with animation
 * @param {HTMLElement} element - Element
 * @param {string} className - CSS class
 * @param {number} duration - Animation duration
 */
export function addClassWithAnimation(element, className, duration = 300) {
  element.classList.add(className);
  setTimeout(() => {
    element.classList.remove(className);
  }, duration);
}

/**
 * Toggle dark mode
 * @param {boolean} enable - Enable dark mode
 */
export function toggleDarkMode(enable = null) {
  const body = document.body;
  const isDarkMode = enable !== null ? enable : !body.classList.contains('dark-mode');
  
  if (isDarkMode) {
    body.classList.add('dark-mode');
    localStorage.setItem('darkMode', 'enabled');
  } else {
    body.classList.remove('dark-mode');
    localStorage.setItem('darkMode', 'disabled');
  }
  
  // Dispatch custom event
  const event = new CustomEvent('darkModeChanged', {
    detail: { isDarkMode }
  });
  document.dispatchEvent(event);
}

/**
 * Initialize dark mode from localStorage
 */
export function initializeDarkMode() {
  const darkMode = localStorage.getItem('darkMode');
  if (darkMode === 'enabled') {
    document.body.classList.add('dark-mode');
  }
}

/**
 * Get viewport dimensions
 * @returns {Object} Viewport dimensions
 */
export function getViewportDimensions() {
  return {
    width: window.innerWidth,
    height: window.innerHeight,
    scrollX: window.scrollX,
    scrollY: window.scrollY
  };
}

/**
 * Check if element is in viewport
 * @param {HTMLElement} element - Element to check
 * @returns {boolean} Whether element is in viewport
 */
export function isElementInViewport(element) {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

/**
 * Animate counter
 * @param {HTMLElement} element - Element to animate
 * @param {number} start - Start value
 * @param {number} end - End value
 * @param {number} duration - Animation duration
 * @param {Function} formatter - Value formatter function
 */
export function animateCounter(element, start, end, duration = 2000, formatter = null) {
  const startTime = performance.now();
  const difference = end - start;
  
  function updateCounter(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    // Easing function
    const easeOutQuart = 1 - Math.pow(1 - progress, 4);
    const current = start + (difference * easeOutQuart);
    
    element.textContent = formatter ? formatter(current) : Math.round(current);
    
    if (progress < 1) {
      requestAnimationFrame(updateCounter);
    }
  }
  
  requestAnimationFrame(updateCounter);
}

// Initialize dark mode on page load
document.addEventListener('DOMContentLoaded', initializeDarkMode);