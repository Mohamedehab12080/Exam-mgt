// API Configuration
const API_CONFIG = {
  BASE_URL: 'http://localhost:8080', // Update this to match your backend URL
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
  
  // API Endpoints
  ENDPOINTS: {
    STUDENTS: '/students',
    COURSES: '/courses',
    EXAMS: '/exams',
    QUESTIONS: '/questions',
    ATTEMPTS: '/attempts',
    CHOICES: '/choices'
  },
  
  // Default headers
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
};

// API Error Types
class APIError extends Error {
  constructor(message, status, data = null) {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.data = data;
  }
}

class NetworkError extends Error {
  constructor(message) {
    super(message);
    this.name = 'NetworkError';
  }
}

class TimeoutError extends Error {
  constructor(message) {
    super(message);
    this.name = 'TimeoutError';
  }
}

// Utility functions
function createTimeoutSignal(timeout) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  return { signal: controller.signal, timeoutId };
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function generateRequestId() {
  return Math.random().toString(36).substr(2, 9);
}

// API Request Handler
async function apiRequest(endpoint, options = {}) {
  const requestId = generateRequestId();
  const url = `${API_CONFIG.BASE_URL}${endpoint}`;
  
  // SSN validation for student endpoints and query parameters
  // This prevents any outgoing API call from sending invalid SSNs to the backend
  try {
    const endpointStr = typeof endpoint === 'string' ? endpoint : '';
    const [pathPart, queryPart] = endpointStr.split('?');
    const segments = pathPart.split('/').filter(Boolean);

    // Validate SSN in path e.g., /students/{ssn} or /students/{ssn}/...
    if (segments[0] === 'students' && /^\d+$/.test(segments[1] || '')) {
      const ssnCandidate = segments[1];
      if (!/^\d{14}$/.test(ssnCandidate)) {
        showToast('SSN must be exactly 14 digits', 'warning');
        throw new APIError('SSN must be exactly 14 digits', 422);
      }
    }

    // Validate SSN in query params (e.g., ?studentSsn=...)
    if (queryPart) {
      const qs = new URLSearchParams(queryPart);
      const ssnParam = qs.get('studentSsn');
      if (ssnParam && !/^\d{14}$/.test(ssnParam)) {
        showToast('SSN must be exactly 14 digits', 'warning');
        throw new APIError('SSN must be exactly 14 digits', 422);
      }
    }
  } catch (e) {
    // Block the request if validation fails
    throw e;
  }
  
  // Merge headers
  const headers = {
    ...API_CONFIG.DEFAULT_HEADERS,
    ...options.headers
  };
  
  // Create request config
  const config = {
    method: 'GET',
    headers,
    ...options
  };
  
  // Add timeout
  const { signal, timeoutId } = createTimeoutSignal(API_CONFIG.TIMEOUT);
  config.signal = signal;
  
  // Add request ID to headers for tracking
  headers['X-Request-ID'] = requestId;
  
  let attempts = 0;
  
  while (attempts < API_CONFIG.RETRY_ATTEMPTS) {
    try {
      console.log(`[API] Request ${requestId}: ${config.method} ${url}`);
      
      const response = await fetch(url, config);
      clearTimeout(timeoutId);
      
      // Handle response
      const responseData = await response.json().catch(() => null);
      
      if (!response.ok) {
        throw new APIError(
          responseData?.message || `HTTP ${response.status}`,
          response.status,
          responseData
        );
      }
      
      console.log(`[API] Response ${requestId}: Success`);
      return {
        data: responseData,
        status: response.status,
        headers: response.headers
      };
      
    } catch (error) {
      clearTimeout(timeoutId);
      attempts++;
      
      // Handle different error types
      if (error.name === 'AbortError') {
        throw new TimeoutError('Request timeout');
      }
      
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new NetworkError('Network connection failed');
      }
      
      // Don't retry on client errors (4xx)
      if (error instanceof APIError && error.status >= 400 && error.status < 500) {
        throw error;
      }
      
      // Retry on server errors (5xx) and network issues
      if (attempts < API_CONFIG.RETRY_ATTEMPTS) {
        console.log(`[API] Retry ${attempts}/${API_CONFIG.RETRY_ATTEMPTS} for request ${requestId}`);
        await delay(API_CONFIG.RETRY_DELAY * attempts);
        continue;
      }
      
      throw error;
    }
  }
}

// Helper functions for different HTTP methods
const api = {
  get: (endpoint, params = {}, options = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    return apiRequest(url, { method: 'GET', ...options });
  },
  
  post: (endpoint, data = {}, options = {}) => {
    return apiRequest(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
      ...options
    });
  },
  
  put: (endpoint, data = {}, options = {}) => {
    return apiRequest(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
      ...options
    });
  },
  
  patch: (endpoint, data = {}, options = {}) => {
    return apiRequest(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
      ...options
    });
  },
  
  delete: (endpoint, options = {}) => {
    return apiRequest(endpoint, { method: 'DELETE', ...options });
  }
};

// Utility function to handle API responses
function handleAPIResponse(response, successMessage = 'Operation successful') {
  if (response.data) {
    showToast(successMessage, 'success');
    return response.data;
  } else {
    throw new Error('Invalid response format');
  }
}

// Utility function to handle API errors
function handleAPIError(error, customMessage = null) {
  console.error('[API] Error:', error);
  
  let message = customMessage || 'An error occurred';
  let type = 'error';
  
  if (error instanceof APIError) {
    switch (error.status) {
      case 400:
        message = error.data?.message || 'Bad request. Please check your input.';
        break;
      case 401:
        message = 'Unauthorized. Please log in.';
        break;
      case 403:
        message = 'Forbidden. You don\'t have permission.';
        break;
      case 404:
        message = 'Resource not found.';
        break;
      case 409:
        message = error.data?.message || 'Conflict. Resource already exists.';
        break;
      case 422:
        message = error.data?.message || 'Validation error.';
        type = 'warning';
        break;
      case 500:
        message = 'Server error. Please try again later.';
        break;
      default:
        message = error.message || 'An unexpected error occurred.';
    }
  } else if (error instanceof NetworkError) {
    message = 'Network connection failed. Please check your connection.';
  } else if (error instanceof TimeoutError) {
    message = 'Request timeout. Please try again.';
  }
  
  showToast(message, type);
  throw error;
}

// Simple toast notification function (will be enhanced later)
function showToast(message, type = 'info') {
  console.log(`[Toast] ${type.toUpperCase()}: ${message}`);
  
  // Create toast element
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <i class="fas fa-${getToastIcon(type)}"></i>
    <span>${message}</span>
  `;
  
  // Add to page
  document.body.appendChild(toast);
  
  // Remove after delay
  setTimeout(() => {
    toast.style.animation = 'toastSlideOut 0.3s ease-out';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

function getToastIcon(type) {
  const icons = {
    success: 'check-circle',
    error: 'exclamation-circle',
    warning: 'exclamation-triangle',
    info: 'info-circle'
  };
  return icons[type] || 'info-circle';
}

// Add CSS for toast animations
const toastStyles = `
  @keyframes toastSlideOut {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
  }
`;

// Add styles to head
const styleSheet = document.createElement('style');
styleSheet.textContent = toastStyles;
document.head.appendChild(styleSheet);

// Export for use in other modules
window.API_CONFIG = API_CONFIG;
window.APIError = APIError;
window.NetworkError = NetworkError;
window.TimeoutError = TimeoutError;
window.api = api;
window.handleAPIResponse = handleAPIResponse;
window.handleAPIError = handleAPIError;
window.showToast = showToast;