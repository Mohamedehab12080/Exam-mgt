// Modal Component
class ModalComponent {
  constructor(options = {}) {
    this.options = {
      id: 'modal-' + Date.now(),
      title: '',
      content: '',
      size: 'md', // sm, md, lg, xl, fullscreen
      centered: true,
      backdrop: true,
      keyboard: true,
      showCloseButton: true,
      showFooter: true,
      footerButtons: [
        {
          text: 'Cancel',
          class: 'btn btn-secondary',
          action: 'close'
        },
        {
          text: 'Save',
          class: 'btn btn-primary',
          action: 'save'
        }
      ],
      ...options
    };
    
    this.element = null;
    this.isVisible = false;
    this.resolvers = {};
    
    this.init();
  }

  /**
   * Initialize modal component
   */
  init() {
    this.createModalElement();
    this.setupEventListeners();
    this.appendToBody();
  }

  /**
   * Create modal element
   */
  createModalElement() {
    const modalHTML = `
      <div class="modal fade" id="${this.options.id}" tabindex="-1" role="dialog" aria-hidden="true">
        <div class="modal-dialog ${this.getSizeClass()} ${this.options.centered ? 'modal-dialog-centered' : ''}" role="document">
          <div class="modal-content">
            ${this.options.showCloseButton || this.options.title ? this.renderHeader() : ''}
            <div class="modal-body">
              ${this.options.content}
            </div>
            ${this.options.showFooter ? this.renderFooter() : ''}
          </div>
        </div>
      </div>
    `;
    
    const modalWrapper = document.createElement('div');
    modalWrapper.innerHTML = modalHTML;
    this.element = modalWrapper.firstElementChild;
  }

  /**
   * Render modal header
   * @returns {string} Header HTML
   */
  renderHeader() {
    return `
      <div class="modal-header">
        <h5 class="modal-title">${this.options.title}</h5>
        ${this.options.showCloseButton ? `
          <button type="button" class="close" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        ` : ''}
      </div>
    `;
  }

  /**
   * Render modal footer
   * @returns {string} Footer HTML
   */
  renderFooter() {
    return `
      <div class="modal-footer">
        ${this.options.footerButtons.map(button => `
          <button type="button" class="${button.class}" data-action="${button.action}">
            ${button.text}
          </button>
        `).join('')}
      </div>
    `;
  }

  /**
   * Get size class
   * @returns {string} Size CSS class
   */
  getSizeClass() {
    const sizeMap = {
      'sm': 'modal-sm',
      'md': '',
      'lg': 'modal-lg',
      'xl': 'modal-xl',
      'fullscreen': 'modal-fullscreen'
    };
    
    return sizeMap[this.options.size] || '';
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Close button
    const closeBtn = this.element.querySelector('.close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.hide());
    }

    // Footer buttons
    this.element.querySelectorAll('[data-action]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const action = e.target.dataset.action;
        this.handleAction(action);
      });
    });

    // Backdrop click
    if (this.options.backdrop) {
      this.element.addEventListener('click', (e) => {
        if (e.target === this.element) {
          this.hide();
        }
      });
    }

    // Keyboard events
    if (this.options.keyboard) {
      document.addEventListener('keydown', (e) => {
        if (this.isVisible && e.key === 'Escape') {
          this.hide();
        }
      });
    }
  }

  /**
   * Handle action
   * @param {string} action - Action name
   */
  handleAction(action) {
    switch (action) {
      case 'close':
        this.hide();
        break;
      case 'save':
        this.save();
        break;
      default:
        // Custom action
        if (this.resolvers[action]) {
          this.resolvers[action](this.getFormData());
        } else {
          this.dispatchCustomEvent('modalAction', { action, data: this.getFormData() });
        }
    }
  }

  /**
   * Show modal
   * @param {Object} options - Show options
   * @returns {Promise} Promise that resolves when modal is closed
   */
  show(options = {}) {
    return new Promise((resolve, reject) => {
      if (options.content) {
        this.setContent(options.content);
      }
      
      if (options.title) {
        this.setTitle(options.title);
      }

      this.resolvers = { resolve, reject };
      
      this.element.classList.add('show');
      this.element.style.display = 'block';
      document.body.classList.add('modal-open');
      
      this.isVisible = true;
      this.dispatchCustomEvent('modalShow', { modal: this });
      
      // Focus first input
      setTimeout(() => {
        const firstInput = this.element.querySelector('input, textarea, select');
        if (firstInput) {
          firstInput.focus();
        }
      }, 100);
    });
  }

  /**
   * Hide modal
   */
  hide() {
    this.element.classList.remove('show');
    this.element.style.display = 'none';
    document.body.classList.remove('modal-open');
    
    this.isVisible = false;
    this.dispatchCustomEvent('modalHide', { modal: this });
    
    if (this.resolvers.resolve) {
      this.resolvers.resolve(null);
      this.resolvers = {};
    }
  }

  /**
   * Save modal (trigger save action)
   */
  save() {
    const formData = this.getFormData();
    
    if (this.validateFormData(formData)) {
      if (this.resolvers.resolve) {
        this.resolvers.resolve(formData);
        this.resolvers = {};
      }
      
      this.dispatchCustomEvent('modalSave', { data: formData, modal: this });
      this.hide();
    }
  }

  /**
   * Set modal content
   * @param {string} content - New content
   */
  setContent(content) {
    const body = this.element.querySelector('.modal-body');
    if (body) {
      body.innerHTML = content;
    }
  }

  /**
   * Set modal title
   * @param {string} title - New title
   */
  setTitle(title) {
    const titleElement = this.element.querySelector('.modal-title');
    if (titleElement) {
      titleElement.textContent = title;
    }
  }

  /**
   * Get form data from modal
   * @returns {Object} Form data
   */
  getFormData() {
    const form = this.element.querySelector('form');
    if (!form) return {};

    const formData = new FormData(form);
    const data = {};

    for (let [key, value] of formData.entries()) {
      data[key] = value;
    }

    return data;
  }

  /**
   * Validate form data
   * @param {Object} data - Form data to validate
   * @returns {boolean} Validation result
   */
  validateFormData(data) {
    // Basic validation - can be overridden
    return true;
  }

  /**
   * Set footer buttons
   * @param {Array} buttons - Button configurations
   */
  setFooterButtons(buttons) {
    this.options.footerButtons = buttons;
    const footer = this.element.querySelector('.modal-footer');
    if (footer) {
      footer.innerHTML = buttons.map(button => `
        <button type="button" class="${button.class}" data-action="${button.action}">
          ${button.text}
        </button>
      `).join('');
      
      // Re-setup event listeners
      this.setupEventListeners();
    }
  }

  /**
   * Append modal to body
   */
  appendToBody() {
    document.body.appendChild(this.element);
  }

  /**
   * Remove modal from DOM
   */
  remove() {
    this.hide();
    setTimeout(() => {
      if (this.element && this.element.parentNode) {
        this.element.parentNode.removeChild(this.element);
      }
    }, 300);
  }

  /**
   * Dispatch custom event
   * @param {string} eventName - Event name
   * @param {Object} detail - Event detail
   */
  dispatchCustomEvent(eventName, detail) {
    const event = new CustomEvent(eventName, {
      detail: detail,
      bubbles: true,
      cancelable: true
    });
    
    document.dispatchEvent(event);
  }

  /**
   * Show loading state
   */
  showLoading() {
    const body = this.element.querySelector('.modal-body');
    if (body) {
      body.innerHTML = `
        <div class="loading-overlay">
          <div class="loading-spinner"></div>
          <p>Loading...</p>
        </div>
      `;
    }
  }

  /**
   * Hide loading state
   */
  hideLoading() {
    // This would be implemented based on how loading is shown
  }
}

// Static methods for common modal operations
ModalComponent.confirm = function(message, options = {}) {
  const modal = new ModalComponent({
    title: options.title || 'Confirm',
    content: `
      <div class="confirm-modal">
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
    ],
    ...options
  });
  
  return modal.show().then(result => {
    modal.remove();
    return result !== null; // Return true if confirmed, false if cancelled
  });
};

ModalComponent.alert = function(message, options = {}) {
  const modal = new ModalComponent({
    title: options.title || 'Alert',
    content: `
      <div class="alert-modal">
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
    ],
    ...options
  });
  
  return modal.show().then(() => {
    modal.remove();
  });
};

ModalComponent.prompt = function(message, defaultValue = '', options = {}) {
  const modal = new ModalComponent({
    title: options.title || 'Input',
    content: `
      <div class="prompt-modal">
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
    ],
    ...options
  });
  
  return modal.show().then(result => {
    const input = modal.element.querySelector('#prompt-input');
    const value = input ? input.value : null;
    modal.remove();
    return result !== null ? value : null;
  });
};

ModalComponent.loading = function(message = 'Loading...') {
  const modal = new ModalComponent({
    title: '',
    content: `
      <div class="loading-modal">
        <div class="loading-spinner"></div>
        <p>${message}</p>
      </div>
    `,
    showFooter: false,
    showCloseButton: false,
    backdrop: 'static',
    keyboard: false
  });
  
  modal.show();
  return modal;
};

// Export for use in other files
window.ModalComponent = ModalComponent;