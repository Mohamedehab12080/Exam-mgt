// Storage Utility Functions

/**
 * Set localStorage item with expiration
 * @param {string} key - Storage key
 * @param {*} value - Value to store
 * @param {number} expiration - Expiration time in minutes (optional)
 */
export function setLocalStorage(key, value, expiration = null) {
  try {
    const item = {
      value: value,
      timestamp: Date.now()
    };
    
    if (expiration) {
      item.expiration = expiration * 60 * 1000; // Convert minutes to milliseconds
    }
    
    localStorage.setItem(key, JSON.stringify(item));
  } catch (error) {
    console.warn('Failed to set localStorage item:', error);
  }
}

/**
 * Get localStorage item
 * @param {string} key - Storage key
 * @param {*} defaultValue - Default value if not found or expired
 * @returns {*} Stored value or default
 */
export function getLocalStorage(key, defaultValue = null) {
  try {
    const itemStr = localStorage.getItem(key);
    if (!itemStr) return defaultValue;
    
    const item = JSON.parse(itemStr);
    
    // Check if item has expired
    if (item.expiration && (Date.now() - item.timestamp) > item.expiration) {
      localStorage.removeItem(key);
      return defaultValue;
    }
    
    return item.value;
  } catch (error) {
    console.warn('Failed to get localStorage item:', error);
    return defaultValue;
  }
}

/**
 * Remove localStorage item
 * @param {string} key - Storage key
 */
export function removeLocalStorage(key) {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.warn('Failed to remove localStorage item:', error);
  }
}

/**
 * Clear all localStorage items
 */
export function clearLocalStorage() {
  try {
    localStorage.clear();
  } catch (error) {
    console.warn('Failed to clear localStorage:', error);
  }
}

/**
 * Set sessionStorage item
 * @param {string} key - Storage key
 * @param {*} value - Value to store
 */
export function setSessionStorage(key, value) {
  try {
    sessionStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn('Failed to set sessionStorage item:', error);
  }
}

/**
 * Get sessionStorage item
 * @param {string} key - Storage key
 * @param {*} defaultValue - Default value if not found
 * @returns {*} Stored value or default
 */
export function getSessionStorage(key, defaultValue = null) {
  try {
    const itemStr = sessionStorage.getItem(key);
    if (!itemStr) return defaultValue;
    
    return JSON.parse(itemStr);
  } catch (error) {
    console.warn('Failed to get sessionStorage item:', error);
    return defaultValue;
  }
}

/**
 * Remove sessionStorage item
 * @param {string} key - Storage key
 */
export function removeSessionStorage(key) {
  try {
    sessionStorage.removeItem(key);
  } catch (error) {
    console.warn('Failed to remove sessionStorage item:', error);
  }
}

/**
 * Clear all sessionStorage items
 */
export function clearSessionStorage() {
  try {
    sessionStorage.clear();
  } catch (error) {
    console.warn('Failed to clear sessionStorage:', error);
  }
}

/**
 * Set cookie
 * @param {string} name - Cookie name
 * @param {string} value - Cookie value
 * @param {Object} options - Cookie options
 */
export function setCookie(name, value, options = {}) {
  try {
    let cookieString = `${name}=${encodeURIComponent(value)}`;
    
    if (options.expires) {
      const expires = options.expires instanceof Date 
        ? options.expires 
        : new Date(Date.now() + options.expires * 24 * 60 * 60 * 1000);
      cookieString += `; expires=${expires.toUTCString()}`;
    }
    
    if (options.path) {
      cookieString += `; path=${options.path}`;
    }
    
    if (options.domain) {
      cookieString += `; domain=${options.domain}`;
    }
    
    if (options.secure) {
      cookieString += '; secure';
    }
    
    if (options.sameSite) {
      cookieString += `; samesite=${options.sameSite}`;
    }
    
    document.cookie = cookieString;
  } catch (error) {
    console.warn('Failed to set cookie:', error);
  }
}

/**
 * Get cookie
 * @param {string} name - Cookie name
 * @returns {string|null} Cookie value or null
 */
export function getCookie(name) {
  try {
    const cookies = document.cookie.split(';');
    
    for (let cookie of cookies) {
      cookie = cookie.trim();
      if (cookie.startsWith(`${name}=`)) {
        return decodeURIComponent(cookie.substring(name.length + 1));
      }
    }
    
    return null;
  } catch (error) {
    console.warn('Failed to get cookie:', error);
    return null;
  }
}

/**
 * Remove cookie
 * @param {string} name - Cookie name
 * @param {Object} options - Cookie options
 */
export function removeCookie(name, options = {}) {
  try {
    const cookieOptions = {
      ...options,
      expires: new Date(0) // Expire immediately
    };
    setCookie(name, '', cookieOptions);
  } catch (error) {
    console.warn('Failed to remove cookie:', error);
  }
}

/**
 * Get all cookies
 * @returns {Object} All cookies as object
 */
export function getAllCookies() {
  try {
    const cookies = {};
    const cookieArray = document.cookie.split(';');
    
    for (let cookie of cookieArray) {
      cookie = cookie.trim();
      if (cookie) {
        const [name, value] = cookie.split('=');
        if (name && value) {
          cookies[name] = decodeURIComponent(value);
        }
      }
    }
    
    return cookies;
  } catch (error) {
    console.warn('Failed to get all cookies:', error);
    return {};
  }
}

/**
 * Cache data with expiration
 * @param {string} key - Cache key
 * @param {*} data - Data to cache
 * @param {number} expiration - Expiration time in minutes
 */
export function setCache(key, data, expiration = 60) {
  setLocalStorage(key, data, expiration);
}

/**
 * Get cached data
 * @param {string} key - Cache key
 * @param {*} defaultValue - Default value if not found or expired
 * @returns {*} Cached data or default
 */
export function getCache(key, defaultValue = null) {
  return getLocalStorage(key, defaultValue);
}

/**
 * Remove cached data
 * @param {string} key - Cache key
 */
export function removeCache(key) {
  removeLocalStorage(key);
}

/**
 * Clear all cached data
 */
export function clearCache() {
  clearLocalStorage();
}

/**
 * Store complex object with compression
 * @param {string} key - Storage key
 * @param {*} data - Data to store
 * @param {number} expiration - Expiration time in minutes
 */
export function setComplexStorage(key, data, expiration = null) {
  try {
    const compressed = btoa(JSON.stringify(data));
    setLocalStorage(key, compressed, expiration);
  } catch (error) {
    console.warn('Failed to set complex storage:', error);
    setLocalStorage(key, data, expiration);
  }
}

/**
 * Get complex object with decompression
 * @param {string} key - Storage key
 * @param {*} defaultValue - Default value if not found or expired
 * @returns {*} Stored data or default
 */
export function getComplexStorage(key, defaultValue = null) {
  try {
    const compressed = getLocalStorage(key);
    if (!compressed) return defaultValue;
    
    return JSON.parse(atob(compressed));
  } catch (error) {
    console.warn('Failed to get complex storage:', error);
    return getLocalStorage(key, defaultValue);
  }
}

/**
 * Check if storage is available
 * @param {string} type - Storage type (localStorage/sessionStorage)
 * @returns {boolean} Whether storage is available
 */
export function isStorageAvailable(type) {
  try {
    const storage = window[type];
    const test = '__storage_test__';
    storage.setItem(test, test);
    storage.removeItem(test);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Get storage quota information
 * @returns {Object} Storage quota information
 */
export function getStorageQuota() {
  if (!navigator.storage || !navigator.storage.estimate) {
    return {
      available: null,
      usage: null,
      quota: null
    };
  }
  
  return navigator.storage.estimate().then(estimate => ({
    available: estimate.quota ? estimate.quota - estimate.usage : null,
    usage: estimate.usage,
    quota: estimate.quota
  }));
}

/**
 * Create storage manager
 * @param {string} namespace - Storage namespace
 * @param {Object} options - Storage options
 * @returns {Object} Storage manager
 */
export function createStorageManager(namespace, options = {}) {
  const { type = 'localStorage', expiration = null } = options;
  
  const storage = type === 'sessionStorage' ? {
    set: setSessionStorage,
    get: getSessionStorage,
    remove: removeSessionStorage,
    clear: clearSessionStorage
  } : {
    set: (key, value) => setLocalStorage(key, value, expiration),
    get: getLocalStorage,
    remove: removeLocalStorage,
    clear: clearLocalStorage
  };
  
  return {
    set(key, value) {
      return storage.set(`${namespace}:${key}`, value);
    },
    get(key, defaultValue = null) {
      return storage.get(`${namespace}:${key}`, defaultValue);
    },
    remove(key) {
      return storage.remove(`${namespace}:${key}`);
    },
    clear() {
      // Clear only items with this namespace
      const keys = Object.keys(type === 'sessionStorage' ? sessionStorage : localStorage);
      keys.forEach(key => {
        if (key.startsWith(`${namespace}:`)) {
          storage.remove(key);
        }
      });
    },
    keys() {
      const keys = Object.keys(type === 'sessionStorage' ? sessionStorage : localStorage);
      return keys.filter(key => key.startsWith(`${namespace}:`)).map(key => key.replace(`${namespace}:`, ''));
    }
  };
}