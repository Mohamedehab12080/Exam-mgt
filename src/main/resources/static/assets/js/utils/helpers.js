// Helper Utility Functions

/**
 * Debounce function
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @param {boolean} immediate - Execute immediately
 * @returns {Function} Debounced function
 */
export function debounce(func, wait, immediate = false) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      timeout = null;
      if (!immediate) func.apply(this, args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(this, args);
  };
}

/**
 * Throttle function
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} Throttled function
 */
export function throttle(func, limit) {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Generate unique ID
 * @param {string} prefix - ID prefix
 * @returns {string} Unique ID
 */
export function generateId(prefix = 'id') {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Deep clone object
 * @param {Object} obj - Object to clone
 * @returns {Object} Cloned object
 */
export function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime());
  if (obj instanceof Array) return obj.map(item => deepClone(item));
  if (typeof obj === 'object') {
    const clonedObj = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }
}

/**
 * Deep merge objects
 * @param {Object} target - Target object
 * @param {Object} source - Source object
 * @returns {Object} Merged object
 */
export function deepMerge(target, source) {
  const result = { ...target };
  
  for (const key in source) {
    if (source.hasOwnProperty(key)) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = deepMerge(result[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    }
  }
  
  return result;
}

/**
 * Get nested object value
 * @param {Object} obj - Object
 * @param {string} path - Path to property
 * @param {*} defaultValue - Default value
 * @returns {*} Property value
 */
export function getNestedValue(obj, path, defaultValue = undefined) {
  const keys = path.split('.');
  let result = obj;
  
  for (const key of keys) {
    if (result && typeof result === 'object' && key in result) {
      result = result[key];
    } else {
      return defaultValue;
    }
  }
  
  return result;
}

/**
 * Set nested object value
 * @param {Object} obj - Object
 * @param {string} path - Path to property
 * @param {*} value - Value to set
 */
export function setNestedValue(obj, path, value) {
  const keys = path.split('.');
  let current = obj;
  
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (!(key in current) || typeof current[key] !== 'object') {
      current[key] = {};
    }
    current = current[key];
  }
  
  current[keys[keys.length - 1]] = value;
}

/**
 * Flatten object
 * @param {Object} obj - Object to flatten
 * @param {string} prefix - Key prefix
 * @returns {Object} Flattened object
 */
export function flattenObject(obj, prefix = '') {
  const flattened = {};
  
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const newKey = prefix ? `${prefix}.${key}` : key;
      
      if (obj[key] && typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
        Object.assign(flattened, flattenObject(obj[key], newKey));
      } else {
        flattened[newKey] = obj[key];
      }
    }
  }
  
  return flattened;
}

/**
 * Group array by key
 * @param {Array} array - Array to group
 * @param {string|Function} key - Grouping key
 * @returns {Object} Grouped object
 */
export function groupBy(array, key) {
  return array.reduce((result, item) => {
    const groupKey = typeof key === 'function' ? key(item) : item[key];
    
    if (!result[groupKey]) {
      result[groupKey] = [];
    }
    
    result[groupKey].push(item);
    return result;
  }, {});
}

/**
 * Sort array by key
 * @param {Array} array - Array to sort
 * @param {string|Function} key - Sorting key
 * @param {string} order - Sort order (asc/desc)
 * @returns {Array} Sorted array
 */
export function sortBy(array, key, order = 'asc') {
  return [...array].sort((a, b) => {
    const aValue = typeof key === 'function' ? key(a) : a[key];
    const bValue = typeof key === 'function' ? key(b) : b[key];
    
    if (aValue < bValue) return order === 'asc' ? -1 : 1;
    if (aValue > bValue) return order === 'asc' ? 1 : -1;
    return 0;
  });
}

/**
 * Filter array by search term
 * @param {Array} array - Array to filter
 * @param {string} searchTerm - Search term
 * @param {Array} keys - Keys to search in
 * @returns {Array} Filtered array
 */
export function filterBySearch(array, searchTerm, keys = []) {
  if (!searchTerm) return array;
  
  const term = searchTerm.toLowerCase();
  
  return array.filter(item => {
    if (keys.length === 0) {
      return JSON.stringify(item).toLowerCase().includes(term);
    }
    
    return keys.some(key => {
      const value = getNestedValue(item, key, '');
      return String(value).toLowerCase().includes(term);
    });
  });
}

/**
 * Paginate array
 * @param {Array} array - Array to paginate
 * @param {number} page - Page number
 * @param {number} pageSize - Page size
 * @returns {Object} Paginated result
 */
export function paginate(array, page = 1, pageSize = 10) {
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  
  return {
    items: array.slice(startIndex, endIndex),
    total: array.length,
    page,
    pageSize,
    totalPages: Math.ceil(array.length / pageSize),
    hasNext: endIndex < array.length,
    hasPrev: startIndex > 0
  };
}

/**
 * Wait for condition
 * @param {Function} condition - Condition function
 * @param {number} timeout - Timeout in milliseconds
 * @param {number} interval - Check interval in milliseconds
 * @returns {Promise<boolean>} Whether condition was met
 */
export function waitFor(condition, timeout = 5000, interval = 100) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    
    const check = () => {
      if (condition()) {
        resolve(true);
      } else if (Date.now() - startTime >= timeout) {
        resolve(false);
      } else {
        setTimeout(check, interval);
      }
    };
    
    check();
  });
}

/**
 * Retry function
 * @param {Function} fn - Function to retry
 * @param {number} maxRetries - Maximum retries
 * @param {number} delay - Delay between retries
 * @returns {*} Function result
 */
export async function retry(fn, maxRetries = 3, delay = 1000) {
  let lastError;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
}

/**
 * Generate random string
 * @param {number} length - String length
 * @param {string} charset - Character set
 * @returns {string} Random string
 */
export function randomString(length = 8, charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789') {
  let result = '';
  const charsetLength = charset.length;
  
  for (let i = 0; i < length; i++) {
    result += charset.charAt(Math.floor(Math.random() * charsetLength));
  }
  
  return result;
}

/**
 * Generate random number
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Random number
 */
export function randomNumber(min = 0, max = 100) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generate random color
 * @param {string} format - Color format (hex/rgb/hsl)
 * @returns {string} Random color
 */
export function randomColor(format = 'hex') {
  if (format === 'hex') {
    return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
  }
  
  if (format === 'rgb') {
    const r = randomNumber(0, 255);
    const g = randomNumber(0, 255);
    const b = randomNumber(0, 255);
    return `rgb(${r}, ${g}, ${b})`;
  }
  
  if (format === 'hsl') {
    const h = randomNumber(0, 360);
    const s = randomNumber(50, 90);
    const l = randomNumber(40, 70);
    return `hsl(${h}, ${s}%, ${l}%)`;
  }
  
  return randomColor('hex');
}

/**
 * Convert array to object
 * @param {Array} array - Array to convert
 * @param {string|Function} key - Key for object
 * @returns {Object} Converted object
 */
export function arrayToObject(array, key) {
  return array.reduce((obj, item) => {
    const objKey = typeof key === 'function' ? key(item) : item[key];
    obj[objKey] = item;
    return obj;
  }, {});
}

/**
 * Convert object to array
 * @param {Object} obj - Object to convert
 * @returns {Array} Converted array
 */
export function objectToArray(obj) {
  return Object.keys(obj).map(key => ({
    key,
    value: obj[key]
  }));
}

/**
 * Remove duplicates from array
 * @param {Array} array - Array to process
 * @param {string|Function} key - Key for uniqueness
 * @returns {Array} Array without duplicates
 */
export function removeDuplicates(array, key) {
  if (!key) return [...new Set(array)];
  
  const seen = new Set();
  return array.filter(item => {
    const value = typeof key === 'function' ? key(item) : item[key];
    if (seen.has(value)) return false;
    seen.add(value);
    return true;
  });
}

/**
 * Chunk array into smaller arrays
 * @param {Array} array - Array to chunk
 * @param {number} size - Chunk size
 * @returns {Array} Chunked array
 */
export function chunk(array, size) {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

/**
 * Get URL parameters
 * @param {string} url - URL to parse
 * @returns {Object} URL parameters
 */
export function getUrlParams(url = window.location.search) {
  const params = {};
  const searchParams = new URLSearchParams(url);
  
  for (const [key, value] of searchParams) {
    params[key] = value;
  }
  
  return params;
}

/**
 * Build URL with parameters
 * @param {string} baseUrl - Base URL
 * @param {Object} params - URL parameters
 * @returns {string} Built URL
 */
export function buildUrl(baseUrl, params = {}) {
  const url = new URL(baseUrl, window.location.origin);
  
  Object.keys(params).forEach(key => {
    if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
      url.searchParams.append(key, params[key]);
    }
  });
  
  return url.toString();
}