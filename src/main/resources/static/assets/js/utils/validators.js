// Validation Utility Functions

/**
 * Check if value is empty
 * @param {*} value - Value to check
 * @returns {boolean} Whether value is empty
 */
export function isEmpty(value) {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string' && value.trim() === '') return true;
  if (Array.isArray(value) && value.length === 0) return true;
  if (typeof value === 'object' && Object.keys(value).length === 0) return true;
  return false;
}

/**
 * Check if value is not empty
 * @param {*} value - Value to check
 * @returns {boolean} Whether value is not empty
 */
export function isNotEmpty(value) {
  return !isEmpty(value);
}

/**
 * Validate email address
 * @param {string} email - Email to validate
 * @returns {boolean} Whether email is valid
 */
export function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false;
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

/**
 * Validate phone number
 * @param {string} phone - Phone number to validate
 * @param {string} format - Format type
 * @returns {boolean} Whether phone number is valid
 */
export function isValidPhone(phone, format = 'US') {
  if (!phone || typeof phone !== 'string') return false;
  
  const cleaned = phone.replace(/\D/g, '');
  
  if (format === 'US') {
    return cleaned.length === 10 || (cleaned.length === 11 && cleaned.startsWith('1'));
  }
  
  return cleaned.length >= 7;
}

/**
 * Validate URL
 * @param {string} url - URL to validate
 * @returns {boolean} Whether URL is valid
 */
export function isValidUrl(url) {
  if (!url || typeof url !== 'string') return false;
  
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate date
 * @param {string|Date} date - Date to validate
 * @returns {boolean} Whether date is valid
 */
export function isValidDate(date) {
  if (!date) return false;
  
  const d = new Date(date);
  return !isNaN(d.getTime());
}

/**
 * Validate number
 * @param {*} value - Value to validate
 * @param {Object} options - Validation options
 * @returns {boolean} Whether number is valid
 */
export function isValidNumber(value, options = {}) {
  if (value === null || value === undefined) return false;
  
  const num = Number(value);
  if (isNaN(num)) return false;
  
  const { min, max, integer = false } = options;
  
  if (integer && !Number.isInteger(num)) return false;
  if (min !== undefined && num < min) return false;
  if (max !== undefined && num > max) return false;
  
  return true;
}

/**
 * Validate string length
 * @param {string} value - String to validate
 * @param {Object} options - Validation options
 * @returns {boolean} Whether string length is valid
 */
export function isValidLength(value, options = {}) {
  if (value === null || value === undefined) return false;
  
  const str = String(value);
  const { min, max, exact } = options;
  
  if (exact !== undefined && str.length !== exact) return false;
  if (min !== undefined && str.length < min) return false;
  if (max !== undefined && str.length > max) return false;
  
  return true;
}

/**
 * Validate against pattern
 * @param {string} value - Value to validate
 * @param {RegExp|string} pattern - Pattern to match
 * @returns {boolean} Whether value matches pattern
 */
export function isValidPattern(value, pattern) {
  if (!value || typeof value !== 'string') return false;
  
  const regex = pattern instanceof RegExp ? pattern : new RegExp(pattern);
  return regex.test(value);
}

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @param {Object} options - Validation options
 * @returns {Object} Validation result
 */
export function isValidPassword(password, options = {}) {
  const {
    minLength = 8,
    requireUppercase = true,
    requireLowercase = true,
    requireNumbers = true,
    requireSpecialChars = false
  } = options;
  
  const result = {
    valid: false,
    errors: []
  };
  
  if (!password || typeof password !== 'string') {
    result.errors.push('Password is required');
    return result;
  }
  
  if (password.length < minLength) {
    result.errors.push(`Password must be at least ${minLength} characters long`);
  }
  
  if (requireUppercase && !/[A-Z]/.test(password)) {
    result.errors.push('Password must contain at least one uppercase letter');
  }
  
  if (requireLowercase && !/[a-z]/.test(password)) {
    result.errors.push('Password must contain at least one lowercase letter');
  }
  
  if (requireNumbers && !/\d/.test(password)) {
    result.errors.push('Password must contain at least one number');
  }
  
  if (requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    result.errors.push('Password must contain at least one special character');
  }
  
  result.valid = result.errors.length === 0;
  return result;
}

/**
 * Validate file
 * @param {File} file - File to validate
 * @param {Object} options - Validation options
 * @returns {Object} Validation result
 */
export function isValidFile(file, options = {}) {
  const result = {
    valid: false,
    errors: []
  };
  
  if (!file) {
    result.errors.push('File is required');
    return result;
  }
  
  const { maxSize, allowedTypes, minSize } = options;
  
  if (maxSize && file.size > maxSize) {
    result.errors.push(`File size must not exceed ${maxSize / 1024 / 1024}MB`);
  }
  
  if (minSize && file.size < minSize) {
    result.errors.push(`File size must be at least ${minSize / 1024}KB`);
  }
  
  if (allowedTypes && allowedTypes.length > 0) {
    const fileType = file.type.toLowerCase();
    const fileExtension = file.name.split('.').pop().toLowerCase();
    
    const isValidType = allowedTypes.some(type => {
      if (type.startsWith('.')) {
        return fileExtension === type.slice(1);
      }
      return fileType === type.toLowerCase();
    });
    
    if (!isValidType) {
      result.errors.push(`File type must be one of: ${allowedTypes.join(', ')}`);
    }
  }
  
  result.valid = result.errors.length === 0;
  return result;
}

/**
 * Validate array
 * @param {Array} array - Array to validate
 * @param {Object} options - Validation options
 * @returns {boolean} Whether array is valid
 */
export function isValidArray(array, options = {}) {
  if (!Array.isArray(array)) return false;
  
  const { minLength, maxLength, required = false } = options;
  
  if (required && array.length === 0) return false;
  if (minLength !== undefined && array.length < minLength) return false;
  if (maxLength !== undefined && array.length > maxLength) return false;
  
  return true;
}

/**
 * Validate object
 * @param {Object} obj - Object to validate
 * @param {Object} schema - Validation schema
 * @returns {Object} Validation result
 */
export function validateObject(obj, schema) {
  const result = {
    valid: true,
    errors: {}
  };
  
  for (const [key, rules] of Object.entries(schema)) {
    const value = obj[key];
    const fieldErrors = [];
    
    // Required validation
    if (rules.required && isEmpty(value)) {
      fieldErrors.push(`${key} is required`);
    }
    
    // Type validation
    if (value !== null && value !== undefined && rules.type) {
      const type = Array.isArray(value) ? 'array' : typeof value;
      if (type !== rules.type) {
        fieldErrors.push(`${key} must be of type ${rules.type}`);
      }
    }
    
    // Length validation for strings/arrays
    if (value !== null && value !== undefined && rules.length) {
      const length = Array.isArray(value) ? value.length : String(value).length;
      
      if (rules.length.min !== undefined && length < rules.length.min) {
        fieldErrors.push(`${key} must be at least ${rules.length.min} characters long`);
      }
      
      if (rules.length.max !== undefined && length > rules.length.max) {
        fieldErrors.push(`${key} must not exceed ${rules.length.max} characters`);
      }
    }
    
    // Pattern validation
    if (value !== null && value !== undefined && rules.pattern) {
      if (!isValidPattern(value, rules.pattern)) {
        fieldErrors.push(`${key} format is invalid`);
      }
    }
    
    // Custom validation
    if (rules.validate && typeof rules.validate === 'function') {
      const customResult = rules.validate(value, obj);
      if (customResult !== true) {
        fieldErrors.push(customResult || `${key} validation failed`);
      }
    }
    
    if (fieldErrors.length > 0) {
      result.errors[key] = fieldErrors;
      result.valid = false;
    }
  }
  
  return result;
}

/**
 * Sanitize HTML
 * @param {string} html - HTML to sanitize
 * @returns {string} Sanitized HTML
 */
export function sanitizeHtml(html) {
  if (!html || typeof html !== 'string') return '';
  
  const div = document.createElement('div');
  div.textContent = html;
  return div.innerHTML;
}

/**
 * Escape HTML
 * @param {string} text - Text to escape
 * @returns {string} Escaped text
 */
export function escapeHtml(text) {
  if (!text || typeof text !== 'string') return '';
  
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  
  return text.replace(/[&<>"']/g, m => map[m]);
}

/**
 * Strip HTML tags
 * @param {string} html - HTML to strip
 * @returns {string} Plain text
 */
export function stripHtml(html) {
  if (!html || typeof html !== 'string') return '';
  
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.textContent || div.innerText || '';
}

/**
 * Validate form data
 * @param {FormData|Object} formData - Form data to validate
 * @param {Object} rules - Validation rules
 * @returns {Object} Validation result
 */
export function validateForm(formData, rules) {
  const data = formData instanceof FormData ? Object.fromEntries(formData) : formData;
  return validateObject(data, rules);
}

/**
 * Get validation message
 * @param {Object} validationResult - Validation result
 * @param {string} field - Field name
 * @returns {string} Validation message
 */
export function getValidationMessage(validationResult, field) {
  if (!validationResult.errors || !validationResult.errors[field]) return '';
  
  return validationResult.errors[field][0] || 'Validation failed';
}

/**
 * Check if form is valid
 * @param {Object} validationResult - Validation result
 * @returns {boolean} Whether form is valid
 */
export function isFormValid(validationResult) {
  return validationResult && validationResult.valid === true;
}