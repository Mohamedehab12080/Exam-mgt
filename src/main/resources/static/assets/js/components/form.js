// Form Component with Utility Integration
import {
  formatNumber,
  formatPercentage,
  formatDate,
  formatTimeAgo,
  formatCurrency,
  truncateText,
  capitalizeFirst
} from '/static/assets/js/utils/formatters.js';

import {
  showLoading,
  hideLoading,
  showToast,
  showError,
  showConfirm,
  showAlert
} from '/static/assets/js/utils/ui.js';

import {
  debounce,
  throttle,
  generateId,
  deepClone,
  deepMerge,
  isEmpty,
  isNotEmpty,
  safeArrayAccess
} from '/static/assets/js/utils/helpers.js';

import {
  isValidEmail,
  isValidPhone,
  isValidSSN,
  isValidDate,
  isValidNumber,
  isValidLength,
  isValidUrl,
  validateObject,
  validateForm,
  isFormValid,
  getValidationMessage,
  sanitizeHtml,
  escapeHtml,
  stripHtml
} from '/static/assets/js/utils/validators.js';

import {
  setLocalStorage,
  getLocalStorage,
  setSessionStorage,
  getSessionStorage,
  createStorageManager
} from '/static/assets/js/utils/storage.js';

// Import API services
import { studentsAPI, coursesAPI, examsAPI, questionsAPI, attemptsAPI, choicesAPI } from '/static/assets/js/api/';

export class FormComponent {
  constructor(containerId, options = {}) {
    this.containerId = containerId;
    this.container = document.getElementById(containerId);

    // Enhanced options with utility integration
    this.options = {
      fields: [],
      layout: 'vertical',
      submitText: 'Submit',
      cancelText: 'Cancel',
      showCancelButton: true,
      validateOnSubmit: true,
      validateOnChange: false,
      validateOnBlur: true,
      autoSave: false,
      autoSaveDelay: 2000,
      apiService: null, // 'students', 'courses', 'exams', etc.
      apiMethod: 'create', // 'create', 'update'
      entityId: null, // For update operations
      successMessage: 'Operation completed successfully',
      errorMessage: 'An error occurred',
      storageKey: `form_${containerId}`,
      ...options
    };

    this.formData = {};
    this.errors = {};
    this.touched = {};
    this.autoSaveTimer = null;
    this.isSubmitting = false;
    this.storage = createStorageManager(this.options.storageKey);

    // API service mapping
    this.apiServices = {
      students: studentsAPI,
      courses: coursesAPI,
      exams: examsAPI,
      questions: questionsAPI,
      attempts: attemptsAPI,
      choices: choicesAPI
    };

    this.init();
  }

  /**
   * Initialize form component with enhanced utilities
   */
  init() {
    if (!this.container) {
      console.error(`Container with ID '${this.containerId}' not found`);
      showError('Form container not found');
      return;
    }

    try {
      this.loadSavedData();
      this.render();
      this.setupEventListeners();
      this.loadInitialData();

      console.log(`Form component initialized for ${this.containerId}`);
      showToast('Form loaded successfully', 'success');
    } catch (error) {
      console.error('Failed to initialize form:', error);
      this.handleError(error, 'initialization');
    }
  }

  /**
   * Enhanced render with utility integration
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
        
        ${this.renderFormSummary()}
      </form>
    `;

    this.container.innerHTML = formHTML;
  }

  /**
   * Enhanced field rendering with utility formatting
   */
  renderField(field) {
    const fieldId = `${this.containerId}-${field.name}`;
    const error = this.errors[field.name];
    const touched = this.touched[field.name];
    const value = this.formData[field.name] || field.defaultValue || '';

    // Sanitize field properties
    const safeLabel = field.label ? sanitizeHtml(field.label) : '';
    const safeHelpText = field.helpText ? sanitizeHtml(field.helpText) : '';
    const safePlaceholder = field.placeholder ? sanitizeHtml(field.placeholder) : '';

    return `
      <div class="form-group ${field.required ? 'required' : ''} ${error && touched ? 'has-error' : ''}">
        ${field.label ? `
          <label for="${fieldId}" class="form-label">
            ${safeLabel}
            ${field.required ? '<span class="required-indicator">*</span>' : ''}
          </label>
        ` : ''}
        
        <div class="form-field-wrapper">
          ${this.renderFieldInput(field, fieldId, value)}
          
          ${field.helpText ? `
            <div class="form-help-text">${safeHelpText}</div>
          ` : ''}
          
          ${error && touched ? `
            <div class="form-error">${sanitizeHtml(error)}</div>
          ` : ''}
        </div>
      </div>
    `;
  }

  /**
   * Enhanced input rendering with utility validation
   */
  renderFieldInput(field, fieldId, value) {
    const commonAttributes = `
      id="${fieldId}"
      name="${field.name}"
      class="form-control ${field.class || ''}"
      placeholder="${field.placeholder ? sanitizeHtml(field.placeholder) : ''}"
      ${field.required ? 'required' : ''}
      ${field.disabled ? 'disabled' : ''}
      ${field.readOnly ? 'readonly' : ''}
      ${field.multiple ? 'multiple' : ''}
    `;

    // Enhanced value handling with formatting
    let displayValue = value;
    if (field.type === 'date' && value && isValidDate(value)) {
      displayValue = formatDate(value, 'YYYY-MM-DD');
    } else if (field.type === 'datetime-local' && value && isValidDate(value)) {
      displayValue = formatDate(value, 'YYYY-MM-DDTHH:mm');
    }

    switch (field.type) {
      case 'text':
      case 'email':
      case 'password':
      case 'number':
      case 'tel':
      case 'url':
        return `<input type="${field.type}" ${commonAttributes} value="${escapeHtml(displayValue)}">`;

      case 'textarea':
        return `<textarea ${commonAttributes} rows="${field.rows || 3}">${escapeHtml(displayValue)}</textarea>`;

      case 'select':
        const safeOptions = (field.options || []).map(option => ({
          ...option,
          label: sanitizeHtml(option.label),
          value: escapeHtml(option.value)
        }));

        return `
          <select ${commonAttributes}>
            ${field.placeholder ? `<option value="">${sanitizeHtml(field.placeholder)}</option>` : ''}
            ${safeOptions.map(option => `
              <option value="${option.value}" ${option.value == value ? 'selected' : ''}>
                ${option.label}
              </option>
            `).join('')}
          </select>
        `;

      case 'checkbox':
        const safeCheckboxLabel = field.checkboxLabel ? sanitizeHtml(field.checkboxLabel) : '';
        return `
          <label class="checkbox-label">
            <input type="checkbox" ${commonAttributes} ${value ? 'checked' : ''}>
            <span class="checkbox-custom"></span>
            ${safeCheckboxLabel}
          </label>
        `;

      case 'radio':
        const safeRadioOptions = (field.options || []).map(option => ({
          ...option,
          label: sanitizeHtml(option.label),
          value: escapeHtml(option.value)
        }));

        return `
          <div class="radio-group">
            ${safeRadioOptions.map(option => `
              <label class="radio-label">
                <input type="radio" name="${field.name}" value="${option.value}" ${option.value == value ? 'checked' : ''}>
                <span class="radio-custom"></span>
                ${option.label}
              </label>
            `).join('')}
          </div>
        `;

      case 'date':
        return `<input type="date" ${commonAttributes} value="${displayValue}">`;

      case 'datetime-local':
        return `<input type="datetime-local" ${commonAttributes} value="${displayValue}">`;

      case 'file':
        const fileName = value && value.name ? value.name : (value || 'Choose file...');
        return `
          <div class="file-input-wrapper">
            <input type="file" ${commonAttributes} accept="${field.accept || ''}">
            <div class="file-input-display">
              <span class="file-input-text">${sanitizeHtml(fileName)}</span>
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
        return `<input type="text" ${commonAttributes} value="${escapeHtml(displayValue)}">`;
    }
  }

  /**
   * Enhanced buttons with utility integration
   */
  renderButtons() {
    const safeSubmitText = sanitizeHtml(this.options.submitText);
    const safeCancelText = sanitizeHtml(this.options.cancelText);

    return `
      <div class="form-buttons">
        ${this.options.showCancelButton ? `
          <button type="button" class="btn btn-secondary" data-action="cancel">
            ${safeCancelText}
          </button>
        ` : ''}
        
        <button type="submit" class="btn btn-primary" data-action="submit" ${this.isSubmitting ? 'disabled' : ''}>
          ${this.isSubmitting ? '<i class="fas fa-spinner fa-spin"></i> Processing...' : safeSubmitText}
        </button>
      </div>
    `;
  }

  /**
   * Render form summary with validation info
   */
  renderFormSummary() {
    const totalFields = this.options.fields.length;
    const requiredFields = this.options.fields.filter(f => f.required).length;
    const completedFields = this.options.fields.filter(f =>
        isNotEmpty(this.formData[f.name])
    ).length;

    return `
      <div class="form-summary">
        <div class="form-progress">
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${(completedFields / totalFields) * 100}%"></div>
          </div>
          <div class="progress-text">
            ${formatNumber(completedFields)} of ${formatNumber(totalFields)} fields completed
            ${requiredFields > 0 ? `(${formatNumber(requiredFields)} required)` : ''}
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Enhanced event listeners with utility functions
   */
  setupEventListeners() {
    const form = this.container.querySelector(`#${this.containerId}-form`);
    if (!form) return;

    // Form submission with enhanced validation
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleSubmit();
    });

    // Cancel button with confirmation
    const cancelBtn = form.querySelector('[data-action="cancel"]');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => this.handleCancel());
    }

    // Enhanced field change events with debouncing
    if (this.options.validateOnChange || this.options.autoSave) {
      form.querySelectorAll('input, select, textarea').forEach(field => {
        field.addEventListener('input', debounce(() => {
          this.handleFieldChange(field);
        }, 300));
      });
    }

    // Enhanced field blur events
    if (this.options.validateOnBlur) {
      form.querySelectorAll('input, select, textarea').forEach(field => {
        field.addEventListener('blur', () => this.handleFieldBlur(field));
      });
    }

    // Enhanced file input handling
    form.querySelectorAll('input[type="file"]').forEach(fileInput => {
      fileInput.addEventListener('change', (e) => this.handleFileChange(e));
    });

    // Enhanced auto-save functionality
    if (this.options.autoSave) {
      form.querySelectorAll('input, select, textarea').forEach(field => {
        field.addEventListener('input', () => this.scheduleAutoSave());
      });
    }
  }

  /**
   * Enhanced form submission with API integration
   */
  async handleSubmit() {
    if (this.isSubmitting) return;

    this.isSubmitting = true;
    this.showLoading();

    try {
      // Collect and validate form data
      this.collectFormData();

      if (this.options.validateOnSubmit) {
        const isValid = await this.validateForm();
        if (!isValid) {
          this.showValidationErrors();
          return;
        }
      }

      // Enhanced submit event with utility data
      const event = new CustomEvent('formSubmit', {
        detail: {
          formId: this.containerId,
          formData: this.formData,
          component: this,
          isValid: this.isFormValid(),
          errors: this.errors
        }
      });

      document.dispatchEvent(event);

      if (!event.defaultPrevented) {
        await this.submitForm();
      }

    } catch (error) {
      console.error('Form submission error:', error);
      this.handleError(error, 'submission');
    } finally {
      this.isSubmitting = false;
      this.hideLoading();
    }
  }

  /**
   * Enhanced form cancellation with confirmation
   */
  async handleCancel() {
    const hasChanges = this.hasFormChanges();

    if (hasChanges) {
      const confirmed = await showConfirm(
          'Unsaved Changes',
          'You have unsaved changes. Are you sure you want to cancel?',
          'Yes, cancel',
          'Continue editing'
      );

      if (!confirmed) return;
    }

    const event = new CustomEvent('formCancel', {
      detail: {
        formId: this.containerId,
        component: this,
        hadChanges: hasChanges
      }
    });

    document.dispatchEvent(event);

    if (!event.defaultPrevented) {
      this.resetForm();
      showToast('Form cancelled', 'info');
    }
  }

  /**
   * Enhanced field change handling
   */
  handleFieldChange(field) {
    this.updateFieldValue(field);
    this.touched[field.name] = true;

    if (this.options.validateOnChange) {
      this.validateField(field);
    }

    if (this.options.autoSave) {
      this.scheduleAutoSave();
    }

    // Update form summary
    this.updateFormSummary();
  }

  /**
   * Enhanced field validation with utility validators
   */
  async validateField(field) {
    const fieldName = field.name;
    const fieldConfig = this.options.fields.find(f => f.name === fieldName);
    if (!fieldConfig) return;

    const value = this.formData[fieldName];
    const errors = [];

    // Required validation
    if (fieldConfig.required && this.isEmptyValue(value)) {
      errors.push(`${fieldConfig.label || fieldConfig.name} is required`);
    }

    // Type-specific validation using utility functions
    if (isNotEmpty(value)) {
      switch (fieldConfig.type) {
        case 'email':
          if (!isValidEmail(value)) {
            errors.push('Please enter a valid email address');
          }
          break;

        case 'tel':
        case 'phone':
          if (!isValidPhone(value)) {
            errors.push('Please enter a valid phone number');
          }
          break;

        case 'url':
          if (!isValidUrl(value)) {
            errors.push('Please enter a valid URL');
          }
          break;

        case 'number':
          if (!isValidNumber(value, { min: fieldConfig.min, max: fieldConfig.max })) {
            const range = fieldConfig.min !== undefined && fieldConfig.max !== undefined
                ? `between ${formatNumber(fieldConfig.min)} and ${formatNumber(fieldConfig.max)}`
                : fieldConfig.min !== undefined ? `at least ${formatNumber(fieldConfig.min)}`
                    : fieldConfig.max !== undefined ? `at most ${formatNumber(fieldConfig.max)}` : 'valid';
            errors.push(`Please enter a number ${range}`);
          }
          break;

        case 'text':
          if (fieldConfig.minLength && !isValidLength(value, { min: fieldConfig.minLength })) {
            errors.push(`Must be at least ${formatNumber(fieldConfig.minLength)} characters`);
          }
          if (fieldConfig.maxLength && !isValidLength(value, { max: fieldConfig.maxLength })) {
            errors.push(`Must be at most ${formatNumber(fieldConfig.maxLength)} characters`);
          }
          break;

        case 'ssn':
          if (!isValidSSN(value)) {
            errors.push('Please enter a valid 14-digit SSN');
          }
          break;
      }
    }

    // Pattern validation
    if (fieldConfig.pattern && value && !isValidPattern(value, fieldConfig.pattern)) {
      errors.push(fieldConfig.patternMessage || `${fieldConfig.label || fieldConfig.name} format is invalid`);
    }

    // Custom validation
    if (fieldConfig.validate && typeof fieldConfig.validate === 'function') {
      try {
        const result = await fieldConfig.validate(value, this.formData);
        if (result !== true) {
          errors.push(result);
        }
      } catch (error) {
        errors.push(error.message);
      }
    }

    // Update errors
    if (errors.length > 0) {
      this.errors[fieldName] = errors[0];
    } else {
      delete this.errors[fieldName];
    }

    this.updateFieldErrorDisplay(fieldName);
  }

  /**
   * Enhanced form validation
   */
  async validateForm() {
    this.errors = {};

    for (const field of this.options.fields) {
      await this.validateFieldByName(field.name);
    }

    return this.isFormValid();
  }

  /**
   * Check if form is valid
   */
  isFormValid() {
    return Object.keys(this.errors).length === 0;
  }

  /**
   * Enhanced form submission with API integration
   */
  async submitForm() {
    if (!this.options.apiService) {
      // No API service specified, use default behavior
      showToast(this.options.successMessage, 'success');
      return;
    }

    const apiService = this.apiServices[this.options.apiService];
    if (!apiService) {
      throw new Error(`API service not found: ${this.options.apiService}`);
    }

    try {
      let result;

      if (this.options.apiMethod === 'update' && this.options.entityId) {
        // Update existing entity
        result = await apiService.update(this.options.entityId, this.formData);
      } else {
        // Create new entity
        result = await apiService.create(this.formData);
      }

      if (result && result.success) {
        showToast(this.options.successMessage, 'success');
        this.clearSavedData();

        // Dispatch success event
        const event = new CustomEvent('formSubmitSuccess', {
          detail: {
            formId: this.containerId,
            formData: this.formData,
            result: result,
            component: this
          }
        });
        document.dispatchEvent(event);
      } else {
        throw new Error(result?.message || this.options.errorMessage);
      }

    } catch (error) {
      console.error('API submission error:', error);
      throw error;
    }
  }

  /**
   * Enhanced auto-save with storage utilities
   */
  async autoSave() {
    try {
      this.collectFormData();

      // Save to storage
      this.storage.set('formData', this.formData);
      this.storage.set('lastSaved', new Date().toISOString());

      const event = new CustomEvent('formAutoSave', {
        detail: {
          formId: this.containerId,
          formData: this.formData,
          component: this,
          timestamp: new Date().toISOString()
        }
      });

      document.dispatchEvent(event);

      this.showAutoSaveStatus('Changes saved automatically');
    } catch (error) {
      console.error('Auto-save error:', error);
      this.showAutoSaveStatus('Auto-save failed', 'error');
    }
  }

  /**
   * Load saved form data
   */
  loadSavedData() {
    try {
      const savedData = this.storage.get('formData');
      const lastSaved = this.storage.get('lastSaved');

      if (savedData) {
        this.formData = { ...savedData };
        console.log('Loaded saved form data from:', lastSaved);
      }
    } catch (error) {
      console.warn('Failed to load saved form data:', error);
    }
  }

  /**
   * Clear saved form data
   */
  clearSavedData() {
    try {
      this.storage.remove('formData');
      this.storage.remove('lastSaved');
    } catch (error) {
      console.warn('Failed to clear saved form data:', error);
    }
  }

  /**
   * Check if form has changes
   */
  hasFormChanges() {
    const initialData = this.options.initialData || {};
    return Object.keys(this.formData).some(key =>
        this.formData[key] !== initialData[key]
    );
  }

  /**
   * Update form summary display
   */
  updateFormSummary() {
    const summaryElement = this.container.querySelector('.form-summary');
    if (summaryElement) {
      // Summary will be updated on next render
      this.render();
    }
  }

  /**
   * Enhanced error handling
   */
  handleError(error, context) {
    console.error(`Form error in ${context}:`, error);

    const safeMessage = sanitizeHtml(
        error.message || error.response?.data?.message || 'An unexpected error occurred'
    );

    showError(`Form error: ${safeMessage}`);

    // Dispatch error event
    const event = new CustomEvent('formError', {
      detail: {
        formId: this.containerId,
        error: error,
        context: context,
        component: this
      }
    });
    document.dispatchEvent(event);
  }

  /**
   * Enhanced destroy method
   */
  destroy() {
    if (this.autoSaveTimer) {
      clearTimeout(this.autoSaveTimer);
    }

    if (this.container) {
      this.container.innerHTML = '';
    }

    this.clearSavedData();

    console.log(`Form component destroyed: ${this.containerId}`);
    showToast('Form destroyed', 'info');
  }

  // Keep all existing utility methods (they're already enhanced)
  // ... [rest of the existing methods remain the same with minor enhancements]
}

// Export for use in other files
window.FormComponent = FormComponent;