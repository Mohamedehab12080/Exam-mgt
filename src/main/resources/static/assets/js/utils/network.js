// Network Utility Functions

/**
 * Check if online
 * @returns {boolean} Whether online
 */
export function isOnline() {
  return navigator.onLine;
}

/**
 * Get network connection information
 * @returns {Object} Connection information
 */
export function getConnectionInfo() {
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  
  if (!connection) {
    return {
      type: 'unknown',
      effectiveType: 'unknown',
      downlink: null,
      rtt: null,
      saveData: false
    };
  }
  
  return {
    type: connection.type,
    effectiveType: connection.effectiveType,
    downlink: connection.downlink,
    rtt: connection.rtt,
    saveData: connection.saveData
  };
}

/**
 * Make HTTP request with retry logic
 * @param {string} url - Request URL
 * @param {Object} options - Request options
 * @returns {Promise} Response promise
 */
export async function request(url, options = {}) {
  const {
    method = 'GET',
    headers = {},
    body = null,
    timeout = 30000,
    retries = 3,
    retryDelay = 1000,
    onRetry = null
  } = options;
  
  let lastError;
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers
        },
        body: body ? (typeof body === 'string' ? body : JSON.stringify(body)) : null,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return response;
      
    } catch (error) {
      lastError = error;
      
      if (attempt < retries) {
        if (onRetry) {
          onRetry(attempt + 1, error);
        }
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, retryDelay * Math.pow(2, attempt)));
      }
    }
  }
  
  throw lastError;
}

/**
 * Make JSON request
 * @param {string} url - Request URL
 * @param {Object} options - Request options
 * @returns {Promise} JSON response
 */
export async function jsonRequest(url, options = {}) {
  const response = await request(url, options);
  return response.json();
}

/**
 * Make GET request
 * @param {string} url - Request URL
 * @param {Object} params - Query parameters
 * @param {Object} options - Request options
 * @returns {Promise} Response promise
 */
export async function get(url, params = {}, options = {}) {
  const urlObj = new URL(url, window.location.origin);
  
  Object.keys(params).forEach(key => {
    if (params[key] !== null && params[key] !== undefined) {
      urlObj.searchParams.append(key, params[key]);
    }
  });
  
  return request(urlObj.toString(), { ...options, method: 'GET' });
}

/**
 * Make JSON GET request
 * @param {string} url - Request URL
 * @param {Object} params - Query parameters
 * @param {Object} options - Request options
 * @returns {Promise} JSON response
 */
export async function getJSON(url, params = {}, options = {}) {
  const response = await get(url, params, options);
  return response.json();
}

/**
 * Make POST request
 * @param {string} url - Request URL
 * @param {*} data - Request body
 * @param {Object} options - Request options
 * @returns {Promise} Response promise
 */
export async function post(url, data, options = {}) {
  return request(url, {
    ...options,
    method: 'POST',
    body: data
  });
}

/**
 * Make JSON POST request
 * @param {string} url - Request URL
 * @param {*} data - Request body
 * @param {Object} options - Request options
 * @returns {Promise} JSON response
 */
export async function postJSON(url, data, options = {}) {
  const response = await post(url, data, options);
  return response.json();
}

/**
 * Make PUT request
 * @param {string} url - Request URL
 * @param {*} data - Request body
 * @param {Object} options - Request options
 * @returns {Promise} Response promise
 */
export async function put(url, data, options = {}) {
  return request(url, {
    ...options,
    method: 'PUT',
    body: data
  });
}

/**
 * Make JSON PUT request
 * @param {string} url - Request URL
 * @param {*} data - Request body
 * @param {Object} options - Request options
 * @returns {Promise} JSON response
 */
export async function putJSON(url, data, options = {}) {
  const response = await put(url, data, options);
  return response.json();
}

/**
 * Make DELETE request
 * @param {string} url - Request URL
 * @param {Object} options - Request options
 * @returns {Promise} Response promise
 */
export async function deleteRequest(url, options = {}) {
  return request(url, { ...options, method: 'DELETE' });
}

/**
 * Make JSON DELETE request
 * @param {string} url - Request URL
 * @param {Object} options - Request options
 * @returns {Promise} JSON response
 */
export async function deleteJSON(url, options = {}) {
  const response = await deleteRequest(url, options);
  return response.json();
}

/**
 * Upload file
 * @param {string} url - Upload URL
 * @param {File} file - File to upload
 * @param {Object} options - Upload options
 * @returns {Promise} Upload promise
 */
export async function uploadFile(url, file, options = {}) {
  const {
    onProgress = null,
    onComplete = null,
    onError = null,
    additionalData = {}
  } = options;
  
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    
    // Add file
    formData.append('file', file);
    
    // Add additional data
    Object.keys(additionalData).forEach(key => {
      formData.append(key, additionalData[key]);
    });
    
    // Progress event
    if (onProgress) {
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const percentComplete = (event.loaded / event.total) * 100;
          onProgress(percentComplete);
        }
      });
    }
    
    // Complete event
    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const response = JSON.parse(xhr.responseText);
        if (onComplete) onComplete(response);
        resolve(response);
      } else {
        const error = new Error(`Upload failed: ${xhr.statusText}`);
        if (onError) onError(error);
        reject(error);
      }
    });
    
    // Error event
    xhr.addEventListener('error', () => {
      const error = new Error('Upload failed: Network error');
      if (onError) onError(error);
      reject(error);
    });
    
    // Abort event
    xhr.addEventListener('abort', () => {
      const error = new Error('Upload aborted');
      if (onError) onError(error);
      reject(error);
    });
    
    xhr.open('POST', url);
    xhr.send(formData);
  });
}

/**
 * Download file
 * @param {string} url - File URL
 * @param {string} filename - Filename for download
 * @param {Object} options - Download options
 */
export function downloadFile(url, filename, options = {}) {
  const {
    headers = {},
    onProgress = null
  } = options;
  
  fetch(url, { headers })
    .then(response => {
      if (!response.ok) {
        throw new Error(`Download failed: ${response.statusText}`);
      }
      
      const total = parseInt(response.headers.get('content-length') || '0');
      let loaded = 0;
      
      const reader = response.body.getReader();
      const chunks = [];
      
      function pump() {
        return reader.read().then(({ done, value }) => {
          if (done) {
            // Combine chunks
            const blob = new Blob(chunks);
            const url = URL.createObjectURL(blob);
            
            // Create download link
            const a = document.createElement('a');
            a.href = url;
            a.download = filename || 'download';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            return;
          }
          
          chunks.push(value);
          loaded += value.length;
          
          if (onProgress && total > 0) {
            onProgress((loaded / total) * 100);
          }
          
          return pump();
        });
      }
      
      return pump();
    })
    .catch(error => {
      console.error('Download error:', error);
    });
}

/**
 * Create WebSocket connection
 * @param {string} url - WebSocket URL
 * @param {Object} options - Connection options
 * @returns {WebSocket} WebSocket instance
 */
export function createWebSocket(url, options = {}) {
  const {
    protocols = [],
    reconnect = true,
    reconnectDelay = 3000,
    maxReconnects = 5,
    onOpen = null,
    onMessage = null,
    onClose = null,
    onError = null
  } = options;
  
  let ws;
  let reconnectAttempts = 0;
  let shouldReconnect = true;
  
  function connect() {
    try {
      ws = new WebSocket(url, protocols);
      
      ws.onopen = (event) => {
        reconnectAttempts = 0;
        if (onOpen) onOpen(event);
      };
      
      ws.onmessage = (event) => {
        if (onMessage) onMessage(event);
      };
      
      ws.onclose = (event) => {
        if (onClose) onClose(event);
        
        if (reconnect && shouldReconnect && reconnectAttempts < maxReconnects) {
          reconnectAttempts++;
          setTimeout(connect, reconnectDelay);
        }
      };
      
      ws.onerror = (error) => {
        if (onError) onError(error);
      };
      
    } catch (error) {
      if (onError) onError(error);
    }
  }
  
  connect();
  
  return {
    send: (data) => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(typeof data === 'string' ? data : JSON.stringify(data));
      }
    },
    close: () => {
      shouldReconnect = false;
      if (ws) {
        ws.close();
      }
    },
    getState: () => ws ? ws.readyState : WebSocket.CLOSED
  };
}

/**
 * Check API health
 * @param {string} url - Health check URL
 * @param {number} timeout - Timeout in milliseconds
 * @returns {Promise} Health status
 */
export async function checkAPIHealth(url, timeout = 5000) {
  try {
    const start = Date.now();
    await get(url, {}, { timeout });
    const responseTime = Date.now() - start;
    
    return {
      status: 'healthy',
      responseTime,
      timestamp: Date.now()
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error.message,
      timestamp: Date.now()
    };
  }
}

/**
 * Create request interceptor
 * @param {Function} interceptor - Interceptor function
 * @returns {Function} Cleanup function
 */
export function addRequestInterceptor(interceptor) {
  const originalFetch = window.fetch;
  
  window.fetch = async function(...args) {
    try {
      const modifiedArgs = await interceptor(...args);
      return originalFetch.apply(this, modifiedArgs || args);
    } catch (error) {
      return Promise.reject(error);
    }
  };
  
  // Return cleanup function
  return () => {
    window.fetch = originalFetch;
  };
}

/**
 * Create response interceptor
 * @param {Function} interceptor - Interceptor function
 * @returns {Function} Cleanup function
 */
export function addResponseInterceptor(interceptor) {
  const originalFetch = window.fetch;
  
  window.fetch = async function(...args) {
    try {
      const response = await originalFetch.apply(this, args);
      return interceptor(response) || response;
    } catch (error) {
      return Promise.reject(error);
    }
  };
  
  // Return cleanup function
  return () => {
    window.fetch = originalFetch;
  };
}