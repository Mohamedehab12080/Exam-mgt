import { API_CONFIG } from '/config';
import { api, showToast } from '/config.js';
import './types.js'
// Attempts API Client - Only includes endpoints from Swagger specification
class AttemptsAPI {
  constructor() {
    this.endpoint = API_CONFIG.ENDPOINTS.ATTEMPTS;
  }

  /**
   * Get all attempts with optional filtering and pagination
   * @param {Object} params - Query parameters
   * @param {number} params.page - Page number (default: 0)
   * @param {number} params.size - Page size (default: 20, min: 1, max: 100)
   * @param {string} params.studentSsn - Filter by student SSN
   * @param {number} params.examId - Filter by exam ID
   * @param {string} params.attemptDate - Filter by attempt date (ISO format YYYY-MM-DD)
   * @param {string} params.sortBy - Sort by field (attemptId, studentSsn, studentName, examId, examTitle, attemptDate, grade)
   * @param {string} params.sortDir - Sort direction (ASC, DESC)
   * @returns {Promise<Object>} Response data
   */
  async getAll(params = {}) {
    try {
      // Build query parameters according to Swagger spec
      const queryParams = this.buildQueryParams(params);

      const response = await api.get(this.endpoint, queryParams);
      return this.handleAPIResponse(response, 'Attempts loaded successfully');
    } catch (error) {
      return this.handleAPIError(error, 'Failed to load attempts');
    }
  }

  /**
   * Get a single attempt by ID
   * @param {number} attemptId - Attempt ID
   * @returns {Promise<Object>} Attempt data
   */
  async getById(attemptId) {
    try {
      const response = await api.get(`${this.endpoint}/${attemptId}`);
      return this.handleAPIResponse(response, 'Attempt loaded successfully');
    } catch (error) {
      return this.handleAPIError(error, 'Failed to load attempt');
    }
  }

  /**
   * Count attempts with filters
   * @param {Object} params - Query parameters for filtering
   * @param {string} params.studentSsn - Filter by student SSN
   * @param {number} params.examId - Filter by exam ID
   * @returns {Promise<Object>} Attempt count
   */
  async countAttempts(params = {}) {
    try {
      const response = await api.get(`${this.endpoint}/count`, params);
      return this.handleAPIResponse(response, 'Attempt count loaded successfully');
    } catch (error) {
      return this.handleAPIError(error, 'Failed to load attempt count');
    }
  }

  /**
   * Validate attempt filters for querying (not for creation/update)
   * @param {Object} filters - Filter criteria to validate
   * @returns {Object} Validation result
   */
  validateAttemptFilters(filters) {
    const errors = {};

    // Student SSN validation
    if (filters.studentSsn) {
      const normalizedSsn = String(filters.studentSsn).replace(/\D/g, '');
      if (!/^\d{14}$/.test(normalizedSsn)) {
        errors.studentSsn = 'Student SSN must be exactly 14 digits';
      }
    }

    // Exam ID validation
    if (filters.examId) {
      const examId = parseInt(filters.examId);
      if (isNaN(examId) || examId <= 0) {
        errors.examId = 'Exam ID must be a positive integer';
      }
    }

    // Attempt date validation
    if (filters.attemptDate && !this.isValidDate(filters.attemptDate)) {
      errors.attemptDate = 'Attempt date must be a valid date in YYYY-MM-DD format';
    }

    // Page size validation
    if (filters.size) {
      const size = parseInt(filters.size);
      if (isNaN(size) || size < 1 || size > 100) {
        errors.size = 'Page size must be between 1 and 100';
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  /**
   * Handle API response according to GeneratedApiResponse schema
   * @param {Object} response - API response
   * @param {string} successMessage - Success message
   * @returns {Object} Processed response
   */
  handleAPIResponse(response, successMessage = '') {
    // Check if response matches GeneratedApiResponse schema
    if (response && typeof response === 'object') {
      if (response.success === true) {
        if (successMessage) {
          this.showToast(successMessage, 'success');
        }
        return response.data || response;
      } else {
        throw new Error(response.message || 'API request failed');
      }
    }
    return response;
  }

  /**
   * Handle API error
   * @param {Error} error - Error object
   * @param {string} defaultMessage - Default error message
   * @returns {Object} Error response
   */
  handleAPIError(error, defaultMessage = 'API request failed') {
    console.error('API Error:', error);

    let message = defaultMessage;
    if (error.response && error.response.data) {
      message = error.response.data.message || defaultMessage;
    } else if (error.message) {
      message = error.message;
    }

    this.showToast(message, 'error');

    return {
      success: false,
      message: message,
      error: error
    };
  }

  /**
   * Show toast notification
   * @param {string} message - Message to show
   * @param {string} type - Type of toast (success, error, warning, info)
   */
  showToast(message, type = 'info') {
    if (typeof showToast === 'function') {
      showToast(message, type);
    } else if (typeof this.toastManager !== 'undefined' && this.toastManager.show) {
      this.toastManager.show(message, type);
    } else {
      console.log(`${type.toUpperCase()}: ${message}`);
    }
  }

  /**
   * Format date for API (YYYY-MM-DD)
   * @param {string} dateString - Date string
   * @returns {string} Formatted date
   */
  formatDateForAPI(dateString) {
    if (!dateString) return '';

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;

      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');

      return `${year}-${month}-${day}`;
    } catch (error) {
      return dateString;
    }
  }

  /**
   * Check if string is valid date
   * @param {string} dateString - Date string to validate
   * @returns {boolean} True if valid date
   */
  isValidDate(dateString) {
    if (!dateString) return false;

    // Check if it's already in YYYY-MM-DD format
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      const date = new Date(dateString + 'T00:00:00');
      return date instanceof Date && !isNaN(date.getTime());
    }

    // Check if it's a valid date string
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date.getTime());
  }

  /**
   * Format attempt data for display based on AttemptResponse schema
   * @param {Object} attempt - Raw attempt data from API
   * @returns {Object} Formatted attempt data
   */
  formatAttemptData(attempt) {
    if (!attempt) return null;

    return {
      ...attempt,
      // Ensure all fields from AttemptResponse schema are present
      attemptId: attempt.attemptId || attempt.id || null,
      studentSsn: attempt.studentSsn || '',
      studentName: attempt.studentName || '',
      examId: attempt.examId || null,
      examTitle: attempt.examTitle || '',
      attemptDate: attempt.attemptDate || '',
      grade: attempt.grade !== undefined ? attempt.grade : null,

      // UI formatting
      scoreBadge: this.formatScoreBadge(attempt.grade),
      statusBadge: this.formatStatusBadge(attempt.grade),
      formattedAttemptDate: this.formatDateForDisplay(attempt.attemptDate),
      gradeColor: this.getGradeColor(attempt.grade),
      isPassed: this.isPassed(attempt.grade)
    };
  }

  /**
   * Format score as badge
   * @param {number} grade - Grade (0-100)
   * @returns {string} Badge HTML
   */
  formatScoreBadge(grade) {
    if (grade === null || grade === undefined) {
      return '<span class="status-badge status-inactive">N/A</span>';
    }

    let scoreClass = 'status-error';
    let icon = 'fa-frown';

    if (grade >= 80) {
      scoreClass = 'status-success';
      icon = 'fa-smile';
    } else if (grade >= 60) {
      scoreClass = 'status-warning';
      icon = 'fa-meh';
    }

    return `<span class="status-badge ${scoreClass}"><i class="fas ${icon}"></i> ${grade}%</span>`;
  }

  /**
   * Format status as badge (inferred from grade)
   * @param {number} grade - Grade
   * @returns {string} Badge HTML
   */
  formatStatusBadge(grade) {
    let status = 'UNKNOWN';
    if (grade !== undefined && grade !== null) {
      status = grade >= 60 ? 'PASSED' : 'FAILED';
    }

    const statusConfig = {
      'PASSED': { icon: 'fa-check-circle', class: 'status-success', text: 'Passed' },
      'FAILED': { icon: 'fa-times-circle', class: 'status-error', text: 'Failed' }
    };

    const config = statusConfig[status] || { icon: 'fa-question', class: 'status-inactive', text: 'Unknown' };

    return `<span class="status-badge ${config.class}"><i class="fas ${config.icon}"></i> ${config.text}</span>`;
  }

  /**
   * Format date for display
   * @param {string} dateString - Date string in YYYY-MM-DD format
   * @returns {string} Formatted date
   */
  formatDateForDisplay(dateString) {
    if (!dateString) return 'N/A';

    try {
      const date = new Date(dateString + 'T00:00:00'); // Add time to avoid timezone issues
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'N/A';
    }
  }

  /**
   * Get grade color
   * @param {number} grade - Grade (0-100)
   * @returns {string} Color class
   */
  getGradeColor(grade) {
    if (grade === null || grade === undefined) return 'var(--text-muted)';
    if (grade >= 80) return 'var(--success-color)';
    if (grade >= 60) return 'var(--warning-color)';
    return 'var(--error-color)';
  }

  /**
   * Check if attempt passed based on grade
   * @param {number} grade - Grade (0-100)
   * @returns {boolean} True if passed
   */
  isPassed(grade) {
    return grade !== null && grade !== undefined && grade >= 60;
  }

  /**
   * Get sort options for attempts table
   * @returns {Array} Sort options
   */
  getSortOptions() {
    return [
      { value: 'attemptDate', label: 'Attempt Date', defaultDir: 'DESC' },
      { value: 'grade', label: 'Grade', defaultDir: 'DESC' },
      { value: 'studentName', label: 'Student Name', defaultDir: 'ASC' },
      { value: 'examTitle', label: 'Exam Title', defaultDir: 'ASC' },
      { value: 'studentSsn', label: 'Student SSN', defaultDir: 'ASC' }
    ];
  }

  /**
   * Build query parameters for filtering
   * @param {Object} filters - Filter criteria
   * @returns {Object} Query parameters
   */
  buildQueryParams(filters) {
    const params = {};

    if (filters.studentId) params.studentId = parseInt(filters.studentId);
    if (filters.examId) params.examId = parseInt(filters.examId);
    if (filters.score) params.score = parseInt(filters.score);
    if (filters.minScore) params.minScore = parseInt(filters.minScore);
    if (filters.maxScore) params.maxScore = parseInt(filters.maxScore);
    if (filters.status) params.status = filters.status;
    if (filters.startTime) params.startTime = filters.startTime;
    if (filters.endTime) params.endTime = filters.endTime;
    if (filters.isPassed !== undefined && filters.isPassed !== '') {
      params.isPassed = filters.isPassed === 'true';
    }

    // SSN normalization and validation for attempts filter
    if (filters.studentSsn) {
      const normalizedSsn = String(filters.studentSsn).replace(/\D/g, '');
      if (normalizedSsn && /^\d{14}$/.test(normalizedSsn)) {
        params.studentSsn = normalizedSsn;
      } else {
        showToast('SSN must be exactly 14 digits', 'warning');
      }
    }

    if (filters.page) params.page = parseInt(filters.page);
    if (filters.size) params.size = parseInt(filters.size);

    return params;
  }

  /**
   * Cache management for attempts
   */
  cache = new Map();
  cacheTimeout = 5 * 60 * 1000; // 5 minutes

  /**
   * Get cached data
   * @param {string} key - Cache key
   * @returns {Object|null} Cached data
   */
  getCachedData(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }

  /**
   * Set cached data
   * @param {string} key - Cache key
   * @param {Object} data - Data to cache
   */
  setCachedData(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear();
  }
}

// Create and export singleton instance
const attemptsAPI = new AttemptsAPI();
window.attemptsAPI = attemptsAPI;