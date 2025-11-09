// Modal Component with Utility Integration
import {
  showToast,
  showError,
  showLoading,
  hideLoading,
  showConfirm
} from '/static/assets/js/utils/ui.js';

import {
  sanitizeHtml,
  escapeHtml
} from '/static/assets/js/utils/validators.js';

import {
  generateId,
} from '/static/assets/js/utils/helpers.js';

import { FormComponent } from '/static/assets/js/components/form.js';

export class ModalComponent {
  constructor(options = {}) {
    // Enhanced options with utility integration
    this.options = {
      id: 'modal-' + generateId(),
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
      formConfig: null, // Integration with FormComponent
      validationRules: {}, // Enhanced validation
      successMessage: 'Operation completed successfully',
      errorMessage: 'An error occurred',
      ...options
    };

    this.element = null;
    this.isVisible = false;
    this.resolvers = {};
    this.formComponent = null;
    this.isSubmitting = false;

    this.init();
  }

  /**
   * Initialize modal component with enhanced utilities
   */
  init() {
    try {
      this.createModalElement();
      this.setupEventListeners();
      this.appendToBody();

      console.log(`Modal component initialized: ${this.options.id}`);
    } catch (error) {
      console.error('Failed to initialize modal:', error);
      this.handleError(error, 'initialization');
    }
  }

  /**
   * Create modal element with enhanced content
   */
  createModalElement() {
    const safeTitle = sanitizeHtml(this.options.title);
    const safeContent = this.sanitizeContent(this.options.content);

    const modalHTML = `
            <div class="modal fade" id="${this.options.id}" tabindex="-1" role="dialog" aria-hidden="true">
                <div class="modal-dialog ${this.getSizeClass()} ${this.options.centered ? 'modal-dialog-centered' : ''}" role="document">
                    <div class="modal-content">
                        ${this.options.showCloseButton || this.options.title ? this.renderHeader(safeTitle) : ''}
                        <div class="modal-body">
                            ${safeContent}
                        </div>
                        ${this.options.showFooter ? this.renderFooter() : ''}
                    </div>
                </div>
            </div>
        `;

    const modalWrapper = document.createElement('div');
    modalWrapper.innerHTML = modalHTML;
    this.element = modalWrapper.firstElementChild;

    // Initialize FormComponent if form config provided
    if (this.options.formConfig) {
      this.initializeFormComponent();
    }
  }

  /**
   * Sanitize modal content for security
   */
  sanitizeContent(content) {
    if (typeof content === 'string') {
      return sanitizeHtml(content);
    }
    return content;
  }

  /**
   * Render modal header with enhanced security
   */
  renderHeader(title) {
    return `
            <div class="modal-header">
                <h5 class="modal-title">${title}</h5>
                ${this.options.showCloseButton ? `
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                ` : ''}
            </div>
        `;
  }

  /**
   * Render modal footer with enhanced buttons
   */
  renderFooter() {
    const safeButtons = this.options.footerButtons.map(button => ({
      ...button,
      text: sanitizeHtml(button.text)
    }));

    return `
            <div class="modal-footer">
                ${safeButtons.map(button => `
                    <button type="button" class="${button.class}" data-action="${button.action}" ${this.isSubmitting && button.action === 'save' ? 'disabled' : ''}>
                        ${button.text}
                        ${this.isSubmitting && button.action === 'save' ? ' <i class="fas fa-spinner fa-spin"></i>' : ''}
                    </button>
                `).join('')}
            </div>
        `;
  }

  /**
   * Get size class
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
   * Initialize FormComponent if form config provided
   */
  initializeFormComponent() {
    const modalBody = this.element.querySelector('.modal-body');
    if (!modalBody) return;

    // Create form container
    const formContainer = document.createElement('div');
    formContainer.id = `form-${this.options.id}`;
    modalBody.appendChild(formContainer);

    // Initialize FormComponent
    this.formComponent = new FormComponent(formContainer.id, {
      ...this.options.formConfig,
      onSubmit: (formData) => this.handleFormSubmit(formData),
      onCancel: () => this.hide()
    });

    // Initialize with any provided data
    if (this.options.initialData) {
      this.formComponent.setData(this.options.initialData);
    }
  }

  /**
   * Enhanced event listeners with utility integration
   */
  setupEventListeners() {
    // Close button
    const closeBtn = this.element.querySelector('.close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.hide());
    }

    // Footer buttons with enhanced handling
    this.element.querySelectorAll('[data-action]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const action = e.target.dataset.action;
        this.handleAction(action);
      });
    });

    // Enhanced backdrop click
    if (this.options.backdrop) {
      this.element.addEventListener('click', (e) => {
        if (e.target === this.element) {
          this.handleBackdropClick();
        }
      });
    }

    // Enhanced keyboard events
    if (this.options.keyboard) {
      document.addEventListener('keydown', (e) => {
        if (this.isVisible && e.key === 'Escape') {
          this.handleEscapeKey();
        }
      });
    }
  }

  /**
   * Enhanced action handling
   */
  async handleAction(action) {
    if (this.isSubmitting) return;

    try {
      switch (action) {
        case 'close':
          await this.handleClose();
          break;
        case 'save':
          await this.handleSave();
          break;
        default:
          await this.handleCustomAction(action);
      }
    } catch (error) {
      console.error(`Modal action error (${action}):`, error);
      this.handleError(error, `action: ${action}`);
    }
  }

  /**
   * Enhanced close handling with confirmation
   */
  async handleClose() {
    if (this.hasUnsavedChanges()) {
      const confirmed = await showConfirm(
          'Unsaved Changes',
          'You have unsaved changes. Are you sure you want to close?',
          'Yes, close',
          'Continue editing'
      );
      if (!confirmed) return;
    }

    this.hide();
  }

  /**
   * Enhanced save handling with validation
   */
  async handleSave() {
    this.isSubmitting = true;
    this.updateFooterButtons();

    try {
      showLoading('Saving...');

      // Use FormComponent if available, otherwise use basic form data
      const formData = this.formComponent
          ? await this.handleFormSubmission()
          : this.getEnhancedFormData();

      if (formData) {
        if (this.resolvers.resolve) {
          this.resolvers.resolve(formData);
        }

        this.dispatchCustomEvent('modalSave', {
          data: formData,
          modal: this,
          formComponent: this.formComponent
        });

        showToast(this.options.successMessage, 'success');
        this.hide();
      }
    } catch (error) {
      throw error;
    } finally {
      this.isSubmitting = false;
      this.updateFooterButtons();
      hideLoading();
    }
  }

  /**
   * Handle form submission with FormComponent
   */
  async handleFormSubmission() {
    if (!this.formComponent) return null;

    // Trigger form validation and submission
    const form = this.element.querySelector('form');
    if (form) {
      const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
      form.dispatchEvent(submitEvent);

      if (!submitEvent.defaultPrevented) {
        return this.formComponent.getData();
      }
    }

    return null;
  }

  /**
   * Handle custom actions
   */
  async handleCustomAction(action) {
    const formData = this.getEnhancedFormData();

    if (this.resolvers[action]) {
      this.resolvers[action](formData);
    } else {
      this.dispatchCustomEvent('modalAction', {
        action,
        data: formData,
        modal: this
      });
    }
  }

  /**
   * Enhanced backdrop click handling
   */
  async handleBackdropClick() {
    if (this.hasUnsavedChanges()) {
      const confirmed = await showConfirm(
          'Unsaved Changes',
          'You have unsaved changes. Are you sure you want to close?',
          'Yes, close',
          'Continue editing'
      );
      if (!confirmed) return;
    }

    this.hide();
  }

  /**
   * Enhanced escape key handling
   */
  async handleEscapeKey() {
    await this.handleBackdropClick();
  }

  /**
   * Check for unsaved changes
   */
  hasUnsavedChanges() {
    if (this.formComponent) {
      return this.formComponent.hasFormChanges();
    }

    // Basic check for form changes
    const form = this.element.querySelector('form');
    if (form) {
      const currentData = this.getEnhancedFormData();
      const initialData = this.options.initialData || {};
      return Object.keys(currentData).some(key =>
          currentData[key] !== initialData[key]
      );
    }

    return false;
  }

  /**
   * Enhanced form data collection
   */
  getEnhancedFormData() {
    const form = this.element.querySelector('form');
    if (!form) return {};

    const formData = new FormData(form);
    const data = {};

    for (let [key, value] of formData.entries()) {
      // Handle multiple values for same key
      if (data[key]) {
        if (Array.isArray(data[key])) {
          data[key].push(value);
        } else {
          data[key] = [data[key], value];
        }
      } else {
        data[key] = value;
      }
    }

    return data;
  }

  /**
   * Enhanced modal show method
   */
  show(options = {}) {
    return new Promise((resolve, reject) => {
      try {
        if (options.content) {
          this.setContent(options.content);
        }

        if (options.title) {
          this.setTitle(options.title);
        }

        if (options.initialData && this.formComponent) {
          this.formComponent.setData(options.initialData);
        }

        this.resolvers = { resolve, reject };

        this.element.classList.add('show');
        this.element.style.display = 'block';
        document.body.classList.add('modal-open');

        this.isVisible = true;

        this.dispatchCustomEvent('modalShow', {
          modal: this,
          options: options
        });

        // Enhanced focus management
        setTimeout(() => {
          this.focusFirstInput();
        }, 100);

      } catch (error) {
        console.error('Error showing modal:', error);
        reject(error);
      }
    });
  }

  /**
   * Enhanced focus management
   */
  focusFirstInput() {
    const firstInput = this.element.querySelector('input, textarea, select, button');
    if (firstInput) {
      firstInput.focus();
    }
  }

  /**
   * Enhanced modal hide method
   */
  hide() {
    try {
      this.element.classList.remove('show');
      this.element.style.display = 'none';
      document.body.classList.remove('modal-open');

      this.isVisible = false;

      this.dispatchCustomEvent('modalHide', {
        modal: this,
        hadChanges: this.hasUnsavedChanges()
      });

      if (this.resolvers.resolve) {
        this.resolvers.resolve(null);
        this.resolvers = {};
      }
    } catch (error) {
      console.error('Error hiding modal:', error);
      this.handleError(error, 'hiding');
    }
  }

  /**
   * Enhanced content setting
   */
  setContent(content) {
    const body = this.element.querySelector('.modal-body');
    if (body) {
      body.innerHTML = this.sanitizeContent(content);
    }
  }

  /**
   * Enhanced title setting
   */
  setTitle(title) {
    const titleElement = this.element.querySelector('.modal-title');
    if (titleElement) {
      titleElement.textContent = sanitizeHtml(title);
    }
  }

  /**
   * Update footer buttons state
   */
  updateFooterButtons() {
    const footer = this.element.querySelector('.modal-footer');
    if (footer) {
      footer.innerHTML = this.renderFooter();
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
   * Enhanced modal removal
   */
  remove() {
    try {
      this.hide();
      setTimeout(() => {
        if (this.element && this.element.parentNode) {
          this.element.parentNode.removeChild(this.element);
        }
        if (this.formComponent) {
          this.formComponent.destroy();
        }
      }, 300);

      console.log(`Modal component removed: ${this.options.id}`);
    } catch (error) {
      console.error('Error removing modal:', error);
      this.handleError(error, 'removal');
    }
  }

  /**
   * Enhanced custom event dispatching
   */
  dispatchCustomEvent(eventName, detail) {
    try {
      const event = new CustomEvent(eventName, {
        detail: {
          ...detail,
          timestamp: new Date().toISOString(),
          modalId: this.options.id
        },
        bubbles: true,
        cancelable: true
      });

      document.dispatchEvent(event);
    } catch (error) {
      console.error('Error dispatching modal event:', error);
    }
  }

  /**
   * Enhanced error handling
   */
  handleError(error, context) {
    console.error(`Modal error in ${context}:`, error);

    const safeMessage = sanitizeHtml(
        error.message || 'An unexpected error occurred'
    );

    showError(`Modal error: ${safeMessage}`);

    this.dispatchCustomEvent('modalError', {
      error: error,
      context: context,
      modal: this
    });
  }

  /**
   * Show enhanced loading state
   */
  showLoading(message = 'Loading...') {
    const body = this.element.querySelector('.modal-body');
    if (body) {
      const safeMessage = sanitizeHtml(message);
      body.innerHTML = `
                <div class="loading-overlay">
                    <div class="loading-spinner"></div>
                    <p>${safeMessage}</p>
                </div>
            `;
    }
  }

  /**
   * Hide loading state
   */
  hideLoading() {
    // Content will be restored when new content is set
  }
}

// Enhanced static methods with utility integration
ModalComponent.confirm = function(message, options = {}) {
  const safeMessage = sanitizeHtml(message);
  const safeTitle = sanitizeHtml(options.title || 'Confirm');

  const modal = new ModalComponent({
    title: safeTitle,
    content: `
            <div class="confirm-modal">
                <div class="confirm-icon">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <div class="confirm-message">
                    <p>${safeMessage}</p>
                </div>
            </div>
        `,
    footerButtons: [
      {
        text: options.cancelText || 'Cancel',
        class: 'btn btn-secondary',
        action: 'close'
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
    return result !== null;
  });
};

ModalComponent.alert = function(message, options = {}) {
  const safeMessage = sanitizeHtml(message);
  const safeTitle = sanitizeHtml(options.title || 'Alert');

  const modal = new ModalComponent({
    title: safeTitle,
    content: `
            <div class="alert-modal">
                <div class="alert-icon">
                    <i class="fas fa-info-circle"></i>
                </div>
                <div class="alert-message">
                    <p>${safeMessage}</p>
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
  const safeMessage = sanitizeHtml(message);
  const safeTitle = sanitizeHtml(options.title || 'Input');
  const safeDefaultValue = escapeHtml(defaultValue);

  const modal = new ModalComponent({
    title: safeTitle,
    content: `
            <div class="prompt-modal">
                <div class="prompt-message">
                    <p>${safeMessage}</p>
                </div>
                <div class="prompt-input">
                    <input type="text" class="form-control" value="${safeDefaultValue}" id="prompt-input">
                </div>
            </div>
        `,
    footerButtons: [
      {
        text: options.cancelText || 'Cancel',
        class: 'btn btn-secondary',
        action: 'close'
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
    const value = result !== null && input ? input.value : null;
    modal.remove();
    return value;
  });
};

ModalComponent.form = function(formConfig, options = {}) {
  const modal = new ModalComponent({
    title: options.title || 'Form',
    formConfig: formConfig,
    initialData: options.initialData,
    footerButtons: [
      {
        text: options.cancelText || 'Cancel',
        class: 'btn btn-secondary',
        action: 'close'
      },
      {
        text: options.submitText || 'Save',
        class: 'btn btn-primary',
        action: 'save'
      }
    ],
    successMessage: options.successMessage || 'Form submitted successfully',
    ...options
  });

  return modal.show().then(result => {
    modal.remove();
    return result;
  });
};

ModalComponent.loading = function(message = 'Loading...') {
  const modal = new ModalComponent({
    title: '',
    content: `
            <div class="loading-modal">
                <div class="loading-spinner"></div>
                <p>${sanitizeHtml(message)}</p>
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