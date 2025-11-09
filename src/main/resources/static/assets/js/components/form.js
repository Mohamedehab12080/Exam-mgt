// Form Component
class FormComponent {
  constructor(containerId, options = {}) {
    this.containerId = containerId;
    this.container = document.getElementById(containerId);
    this.options = {
      fields: [],
      layout: 'vertical', // vertical, horizontal, inline
      submitText: 'Submit',
      cancelText: 'Cancel',
      showCancelButton: true,
      validateOnSubmit: true,
      validateOnChange: false,
      validateOnBlur: true,
      autoSave: false,
      autoSaveDelay: 2000,
      ...options
    };
    
    this.formData = {};
    this.errors = {};
    this.touched = {};
    this.autoSaveTimer = null;
    this.isSubmitting = false;
    
    this.init();
  }

  /**
   * Initialize form component
   */
  init() {
    if (!this.container) {
      console.error(`Container with ID '${this.containerId}' not found`);
      return;
    }
    
    this.render();
    this.setupEventListeners();
    this.loadInitialData();
    
    console.log(`Form component initialized for ${this.containerId}`);
  }

  /**
   * Render form
   */
  render() {
    const formHTML = `
      <form class="form-component ${this.options.layout}" id="${this.containerId}-form">
        <div class="form-fields">
          ${this.options.fields.map(field => this.renderField(field)).join('')}
        </div>
        
        ${this.renderButtons()}
        
        ${this.options.autoSave ? `
          <div class="auto-save-indicator">
            <span class="auto-save-status">Changes saved</span>
          </div>
        ` : ''}
      </form>
    `;
    
    this.container.innerHTML = formHTML;
  }

  /**
   * Render form field
   * @param {Object} field - Field configuration
   * @returns {string} Field HTML
   */
  renderField(field) {
    const fieldId = `${this.containerId}-${field.name}`;
    const error = this.errors[field.name];
    const touched = this.touched[field.name];
    const value = this.formData[field.name] || field.defaultValue || '';
    
    return `
      <div class="form-group ${field.required ? 'required' : ''} ${error && touched ? 'has-error' : ''}">
        ${field.label ? `
          <label for="${fieldId}" class="form-label">
            ${field.label}
            ${field.required ? '<span class="required-indicator">*</span>' : ''}
          </label>
        ` : ''}
        
        <div class="form-field-wrapper">
          ${this.renderFieldInput(field, fieldId, value)}
          
          ${field.helpText ? `
            <div class="form-help-text">${field.helpText}</div>
          ` : ''}
          
          ${error && touched ? `
            <div class="form-error">${error}</div>
          ` : ''}
        </div>
      </div>
    `;
  }

  /**
   * Render field input based on type
   * @param {Object} field - Field configuration
   * @param {string} fieldId - Field ID
   * @param {*} value - Field value
   * @returns {string} Input HTML
   */
  renderFieldInput(field, fieldId, value) {
    const commonAttributes = `
      id="${fieldId}"
      name="${field.name}"
      class="form-control ${field.class || ''}"
      placeholder="${field.placeholder || ''}"
      ${field.required ? 'required' : ''}
      ${field.disabled ? 'disabled' : ''}
      ${field.readOnly ? 'readonly' : ''}
      ${field.multiple ? 'multiple' : ''}
    `;

    switch (field.type) {
      case 'text':
      case 'email':
      case 'password':
      case 'number':
      case 'tel':
      case 'url':
        return `<input type="${field.type}" ${commonAttributes} value="${value}">`;
        
      case 'textarea':
        return `<textarea ${commonAttributes} rows="${field.rows || 3}">${value}</textarea>`;
        
      case 'select':
        return `
          <select ${commonAttributes}>
            ${field.placeholder ? `<option value="">${field.placeholder}</option>` : ''}
            ${field.options.map(option => `
              <option value="${option.value}" ${option.value == value ? 'selected' : ''}>
                ${option.label}
              </option>
            `).join('')}
          </select>
        `;
        
      case 'checkbox':
        return `
          <label class="checkbox-label">
            <input type="checkbox" ${commonAttributes} ${value ? 'checked' : ''}>
            <span class="checkbox-custom"></span>
            ${field.checkboxLabel || ''}
          </label>
        `;
        
      case 'radio':
        return `
          <div class="radio-group">
            ${field.options.map(option => `
              <label class="radio-label">
                <input type="radio" name="${field.name}" value="${option.value}" ${option.value == value ? 'checked' : ''}>
                <span class="radio-custom"></span>
                ${option.label}
              </label>
            `).join('')}
          </div>
        `;
        
      case 'date':
        return `<input type="date" ${commonAttributes} value="${value}">`;
        
      case 'datetime-local':
        return `<input type="datetime-local" ${commonAttributes} value="${value}">`;
        
      case 'file':
        return `
          <div class="file-input-wrapper">
            <input type="file" ${commonAttributes} accept="${field.accept || ''}">
            <div class="file-input-display">
              <span class="file-input-text">${value || 'Choose file...'}</span>
              <button type="button" class="btn btn-outline btn-sm">Browse</button>
            </div>
          </div>
        `;
        
      case 'switch':
        return `
          <label class="switch">
            <input type="checkbox" ${commonAttributes} ${value ? 'checked' : ''}>
            <span class="switch-slider"></span>
          </label>
        `;
        
      default:
        return `<input type="text" ${commonAttributes} value="${value}">`;
    }
  }

  /**
   * Render form buttons
   * @returns {string} Buttons HTML
   */
  renderButtons() {
    return `
      <div class="form-buttons">
        ${this.options.showCancelButton ? `
          <button type="button" class="btn btn-secondary" data-action="cancel">
            ${this.options.cancelText}
          </button>
        ` : ''}
        
        <button type="submit" class="btn btn-primary" data-action="submit">
          ${this.options.submitText}
        </button>
      </div>
    `;
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    const form = this.container.querySelector(`#${this.containerId}-form`);
    if (!form) return;

    // Form submission
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleSubmit();
    });

    // Cancel button
    const cancelBtn = form.querySelector('[data-action="cancel"]');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => this.handleCancel());
    }

    // Field change events
    if (this.options.validateOnChange || this.options.autoSave) {
      form.querySelectorAll('input, select, textarea').forEach(field => {
        field.addEventListener('change', () => this.handleFieldChange(field));
      });
    }

    // Field blur events
    if (this.options.validateOnBlur) {
      form.querySelectorAll('input, select, textarea').forEach(field => {
        field.addEventListener('blur', () => this.handleFieldBlur(field));
      });
    }

    // File input handling
    form.querySelectorAll('input[type="file"]').forEach(fileInput => {
      fileInput.addEventListener('change', (e) => this.handleFileChange(e));
    });

    // Auto-save functionality
    if (this.options.autoSave) {
      form.querySelectorAll('input, select, textarea').forEach(field => {
        field.addEventListener('input', () => this.scheduleAutoSave());
      });
    }
  }

  /**
   * Handle form submission
   */
  async handleSubmit() {
    if (this.isSubmitting) return;
    
    this.isSubmitting = true;
    this.showLoading();
    
    try {
      // Collect form data
      this.collectFormData();
      
      // Validate form
      if (this.options.validateOnSubmit) {
        const isValid = await this.validateForm();
        if (!isValid) {
          this.showValidationErrors();
          return;
        }
      }
      
      // Dispatch submit event
      const event = new CustomEvent('formSubmit', {
        detail: {
          formId: this.containerId,
          formData: this.formData,
          component: this
        }
      });
      
      document.dispatchEvent(event);
      
      // If no event listener prevented default, proceed with submission
      if (!event.defaultPrevented) {
        await this.submitForm();
      }
      
    } catch (error) {
      console.error('Form submission error:', error);
      this.showError('An error occurred during submission. Please try again.');
    } finally {
      this.isSubmitting = false;
      this.hideLoading();
    }
  }

  /**
   * Handle form cancellation
   */
  handleCancel() {
    // Dispatch cancel event
    const event = new CustomEvent('formCancel', {
      detail: {
        formId: this.containerId,
        component: this
      }
    });
    
    document.dispatchEvent(event);
    
    // Reset form if no event listener prevented default
    if (!event.defaultPrevented) {
      this.resetForm();
    }
  }

  /**
   * Handle field change
   * @param {HTMLElement} field - Field element
   */
  handleFieldChange(field) {
    this.updateFieldValue(field);
    
    if (this.options.validateOnChange) {
      this.validateField(field);
    }
    
    if (this.options.autoSave) {
      this.scheduleAutoSave();
    }
  }

  /**
   * Handle field blur
   * @param {HTMLElement} field - Field element
   */
  handleFieldBlur(field) {
    this.touched[field.name] = true;
    
    if (this.options.validateOnBlur) {
      this.validateField(field);
    }
  }

  /**
   * Handle file change
   * @param {Event} event - File input change event
   */
  handleFileChange(event) {
    const fileInput = event.target;
    const files = fileInput.files;
    
    if (files.length > 0) {
      // Update file display
      const display = fileInput.parentElement.querySelector('.file-input-text');
      if (display) {
        display.textContent = files.length === 1 ? files[0].name : `${files.length} files selected`;
      }
      
      // Update form data
      this.formData[fileInput.name] = files;
    }
  }

  /**
   * Collect form data from all fields
   */
  collectFormData() {
    const form = this.container.querySelector(`#${this.containerId}-form`);
    if (!form) return;
    
    const formData = new FormData(form);
    
    this.options.fields.forEach(field => {
      if (field.type === 'checkbox' || field.type === 'switch') {
        this.formData[field.name] = formData.has(field.name);
      } else if (field.type === 'file') {
        // File handling is done separately
      } else if (field.type === 'number') {
        const value = formData.get(field.name);
        this.formData[field.name] = value ? parseFloat(value) : null;
      } else {
        this.formData[field.name] = formData.get(field.name);
      }
    });
  }

  /**
   * Update field value
   * @param {HTMLElement} field - Field element
   */
  updateFieldValue(field) {
    if (field.type === 'checkbox' || field.type === 'switch') {
      this.formData[field.name] = field.checked;
    } else if (field.type === 'number') {
      this.formData[field.name] = field.value ? parseFloat(field.value) : null;
    } else {
      this.formData[field.name] = field.value;
    }
  }

  /**
   * Validate form
   * @returns {boolean} Validation result
   */
  async validateForm() {
    this.errors = {};
    
    for (const field of this.options.fields) {
      await this.validateFieldByName(field.name);
    }
    
    return Object.keys(this.errors).length === 0;
  }

  /**
   * Validate field by name
   * @param {string} fieldName - Field name
   */
  async validateFieldByName(fieldName) {
    const field = this.options.fields.find(f => f.name === fieldName);
    if (!field) return;
    
    const value = this.formData[fieldName];
    const errors = [];
    
    // Required validation
    if (field.required && this.isEmptyValue(value)) {
      errors.push(`${field.label || field.name} is required`);
    }
    
    // Custom validation
    if (field.validate && typeof field.validate === 'function') {
      try {
        const result = await field.validate(value, this.formData);
        if (result !== true) {
          errors.push(result);
        }
      } catch (error) {
        errors.push(error.message);
      }
    }
    
    // Pattern validation
    if (field.pattern && value && !new RegExp(field.pattern).test(value)) {
      errors.push(field.patternMessage || `${field.label || field.name} is invalid`);
    }
    
    // Min/Max validation
    if (field.type === 'number' && value !== null) {
      if (field.min !== undefined && value < field.min) {
        errors.push(`${field.label || field.name} must be at least ${field.min}`);
      }
      if (field.max !== undefined && value > field.max) {
        errors.push(`${field.label || field.name} must be at most ${field.max}`);
      }
    }
    
    if (errors.length > 0) {
      this.errors[fieldName] = errors[0];
    } else {
      delete this.errors[fieldName];
    }
    
    this.updateFieldErrorDisplay(fieldName);
  }

  /**
   * Validate field
   * @param {HTMLElement} field - Field element
   */
  validateField(field) {
    this.validateFieldByName(field.name);
  }

  /**
   * Check if value is empty
   * @param {*} value - Value to check
   * @returns {boolean} Whether value is empty
   */
  isEmptyValue(value) {
    return value === null || value === undefined || value === '';
  }

  /**
   * Update field error display
   * @param {string} fieldName - Field name
   */
  updateFieldErrorDisplay(fieldName) {
    const fieldElement = this.container.querySelector(`[name="${fieldName}"]`);
    const formGroup = fieldElement?.closest('.form-group');
    const errorElement = formGroup?.querySelector('.form-error');
    
    if (!formGroup) return;
    
    const error = this.errors[fieldName];
    const touched = this.touched[fieldName];
    
    if (error && touched) {
      formGroup.classList.add('has-error');
      if (errorElement) {
        errorElement.textContent = error;
      }
    } else {
      formGroup.classList.remove('has-error');
      if (errorElement) {
        errorElement.textContent = '';
      }
    }
  }

  /**
   * Show validation errors
   */
  showValidationErrors() {
    // Mark all fields as touched
    this.options.fields.forEach(field => {
      this.touched[field.name] = true;
      this.updateFieldErrorDisplay(field.name);
    });
    
    // Show error message
    const firstError = Object.keys(this.errors)[0];
    if (firstError) {
      const field = this.options.fields.find(f => f.name === firstError);
      this.showError(`Please fix the errors in the form. ${this.errors[firstError]}`);
      
      // Focus first field with error
      const firstErrorField = this.container.querySelector(`[name="${firstError}"]`);
      if (firstErrorField) {
        firstErrorField.focus();
      }
    }
  }

  /**
   * Submit form
   */
  async submitForm() {
    // This method should be overridden by specific implementations
    console.log('Form submitted:', this.formData);
    showToast('Form submitted successfully!', 'success');
  }

  /**
   * Schedule auto-save
   */
  scheduleAutoSave() {
    if (this.autoSaveTimer) {
      clearTimeout(this.autoSaveTimer);
    }
    
    this.autoSaveTimer = setTimeout(() => {
      this.autoSave();
    }, this.options.autoSaveDelay);
  }

  /**
   * Auto-save form data
   */
  async autoSave() {
    try {
      this.collectFormData();
      
      // Dispatch auto-save event
      const event = new CustomEvent('formAutoSave', {
        detail: {
          formId: this.containerId,
          formData: this.formData,
          component: this
        }
      });
      
      document.dispatchEvent(event);
      
      this.showAutoSaveStatus('Changes saved');
    } catch (error) {
      console.error('Auto-save error:', error);
      this.showAutoSaveStatus('Auto-save failed', 'error');
    }
  }

  /**
   * Show auto-save status
   * @param {string} message - Status message
   * @param {string} type - Status type (success, error)
   */
  showAutoSaveStatus(message, type = 'success') {
    const statusElement = this.container.querySelector('.auto-save-status');
    if (statusElement) {
      statusElement.textContent = message;
      statusElement.className = `auto-save-status ${type}`;
      
      setTimeout(() => {
        statusElement.textContent = 'Changes saved';
        statusElement.className = 'auto-save-status';
      }, 3000);
    }
  }

  /**
   * Load initial data
   */
  loadInitialData() {
    if (this.options.initialData) {
      this.setData(this.options.initialData);
    }
  }

  /**
   * Set form data
   * @param {Object} data - Form data
   */
  setData(data) {
    this.formData = { ...data };
    this.updateFormFields();
  }

  /**
   * Update form fields with current data
   */
  updateFormFields() {
    const form = this.container.querySelector(`#${this.containerId}-form`);
    if (!form) return;
    
    Object.keys(this.formData).forEach(fieldName => {
      const field = form.querySelector(`[name="${fieldName}"]`);
      if (field) {
        const value = this.formData[fieldName];
        
        if (field.type === 'checkbox' || field.type === 'switch') {
          field.checked = Boolean(value);
        } else {
          field.value = value || '';
        }
      }
    });
  }

  /**
   * Get form data
   * @returns {Object} Current form data
   */
  getData() {
    return { ...this.formData };
  }

  /**
   * Reset form
   */
  resetForm() {
    this.formData = {};
    this.errors = {};
    this.touched = {};
    
    const form = this.container.querySelector(`#${this.containerId}-form`);
    if (form) {
      form.reset();
    }
    
    this.loadInitialData();
    this.clearErrors();
  }

  /**
   * Clear all errors
   */
  clearErrors() {
    this.errors = {};
    this.options.fields.forEach(field => {
      this.updateFieldErrorDisplay(field.name);
    });
  }

  /**
   * Show loading state
   */
  showLoading() {
    const form = this.container.querySelector(`#${this.containerId}-form`);
    if (form) {
      form.classList.add('loading');
      
      const submitBtn = form.querySelector('[data-action="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
      }
    }
  }

  /**
   * Hide loading state
   */
  hideLoading() {
    const form = this.container.querySelector(`#${this.containerId}-form`);
    if (form) {
      form.classList.remove('loading');
      
      const submitBtn = form.querySelector('[data-action="submit"]');
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = this.options.submitText;
      }
    }
  }

  /**
   * Show error message
   * @param {string} message - Error message
   */
  showError(message) {
    showToast(message, 'error');
  }

  /**
   * Destroy form component
   */
  destroy() {
    if (this.autoSaveTimer) {
      clearTimeout(this.autoSaveTimer);
    }
    
    if (this.container) {
      this.container.innerHTML = '';
    }
  }
}

// Export for use in other files
window.FormComponent = FormComponent;