// Attempts API Client
class AttemptsAPI {
  constructor() {
    this.endpoint = API_CONFIG.ENDPOINTS.ATTEMPTS;
  }

  /**
   * Get all attempts with optional filtering and pagination
   * @param {Object} params - Query parameters
   * @param {number} params.page - Page number (default: 0)
   * @param {number} params.size - Page size (default: 20)
   * @param {string} params.studentSsn - Filter by student SSN
   * @param {number} params.examId - Filter by exam ID
   * @param {string} params.attemptDate - Filter by attempt date (ISO format)
   * @param {boolean} params.noPagination - Disable pagination
   * @param {string} params.sortBy - Sort by field (attemptId, studentSsn, examId, attemptDate, grade)
   * @param {string} params.sortDir - Sort direction (ASC, DESC)
   * @returns {Promise<Object>} Response data
   */
  async getAll(params = {}) {
    try {
      const response = await api.get(this.endpoint, params);
      return handleAPIResponse(response, 'Attempts loaded successfully');
    } catch (error) {
      return handleAPIError(error, 'Failed to load attempts');
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
      return handleAPIResponse(response, 'Attempt loaded successfully');
    } catch (error) {
      return handleAPIError(error, 'Failed to load attempt');
    }
  }

  /**
   * Create a new attempt
   * @param {Object} attemptData - Attempt data
   * @param {number} attemptData.studentId - Student ID
   * @param {number} attemptData.examId - Exam ID
   * @param {number} attemptData.score - Score (0-100)
   * @param {string} attemptData.status - Status (IN_PROGRESS, COMPLETED, ABANDONED)
   * @param {string} attemptData.startTime - Start time (ISO format)
   * @param {string} attemptData.endTime - End time (ISO format)
   * @returns {Promise<Object>} Created attempt data
   */
  async create(attemptData) {
    try {
      const response = await api.post(this.endpoint, attemptData);
      return handleAPIResponse(response, 'Attempt created successfully');
    } catch (error) {
      return handleAPIError(error, 'Failed to create attempt');
    }
  }

  /**
   * Update an existing attempt
   * @param {number} attemptId - Attempt ID
   * @param {Object} attemptData - Updated attempt data
   * @returns {Promise<Object>} Updated attempt data
   */
  async update(attemptId, attemptData) {
    try {
      const response = await api.put(`${this.endpoint}/${attemptId}`, attemptData);
      return handleAPIResponse(response, 'Attempt updated successfully');
    } catch (error) {
      return handleAPIError(error, 'Failed to update attempt');
    }
  }

  /**
   * Delete an attempt
   * @param {number} attemptId - Attempt ID
   * @returns {Promise<void>}
   */
  async delete(attemptId) {
    try {
      const response = await api.delete(`${this.endpoint}/${attemptId}`);
      return handleAPIResponse(response, 'Attempt deleted successfully');
    } catch (error) {
      return handleAPIError(error, 'Failed to delete attempt');
    }
  }

  /**
   * Get attempts by student
   * @param {number} studentId - Student ID
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Student attempts
   */
  async getAttemptsByStudent(studentId, params = {}) {
    try {
      const response = await api.get(`${this.endpoint}/student/${studentId}`, params);
      return handleAPIResponse(response, 'Student attempts loaded successfully');
    } catch (error) {
      return handleAPIError(error, 'Failed to load student attempts');
    }
  }

  /**
   * Get attempts by exam
   * @param {number} examId - Exam ID
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Exam attempts
   */
  async getAttemptsByExam(examId, params = {}) {
    try {
      const response = await api.get(`${this.endpoint}/exam/${examId}`, params);
      return handleAPIResponse(response, 'Exam attempts loaded successfully');
    } catch (error) {
      return handleAPIError(error, 'Failed to load exam attempts');
    }
  }

  /**
   * Get completed attempts
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Completed attempts
   */
  async getCompletedAttempts(params = {}) {
    try {
      const response = await api.get(`${this.endpoint}/completed`, params);
      return handleAPIResponse(response, 'Completed attempts loaded successfully');
    } catch (error) {
      return handleAPIError(error, 'Failed to load completed attempts');
    }
  }

  /**
   * Get in-progress attempts
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} In-progress attempts
   */
  async getInProgressAttempts(params = {}) {
    try {
      const response = await api.get(`${this.endpoint}/in-progress`, params);
      return handleAPIResponse(response, 'In-progress attempts loaded successfully');
    } catch (error) {
      return handleAPIError(error, 'Failed to load in-progress attempts');
    }
  }

  /**
   * Get passed attempts
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Passed attempts
   */
  async getPassedAttempts(params = {}) {
    try {
      const response = await api.get(`${this.endpoint}/passed`, params);
      return handleAPIResponse(response, 'Passed attempts loaded successfully');
    } catch (error) {
      return handleAPIError(error, 'Failed to load passed attempts');
    }
  }

  /**
   * Get failed attempts
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Failed attempts
   */
  async getFailedAttempts(params = {}) {
    try {
      const response = await api.get(`${this.endpoint}/failed`, params);
      return handleAPIResponse(response, 'Failed attempts loaded successfully');
    } catch (error) {
      return handleAPIError(error, 'Failed to load failed attempts');
    }
  }

  /**
   * Get attempt statistics
   * @returns {Promise<Object>} Attempt statistics
   */
  async getStats() {
    try {
      const response = await api.get(`${this.endpoint}/count`);
      return handleAPIResponse(response, 'Attempt statistics loaded successfully');
    } catch (error) {
      return handleAPIError(error, 'Failed to load attempt statistics');
    }
  }

  /**
   * Count attempts with filters
   * @param {Object} params - Query parameters for filtering
   * @returns {Promise<Object>} Attempt count
   */
  async countAttempts(params = {}) {
    try {
      const response = await api.get(`${this.endpoint}/count`, params);
      return handleAPIResponse(response, 'Attempt count loaded successfully');
    } catch (error) {
      return handleAPIError(error, 'Failed to load attempt count');
    }
  }

  /**
   * Validate attempt data
   * @param {Object} attemptData - Attempt data to validate
   * @returns {Object} Validation result
   */
  validateAttemptData(attemptData) {
    const errors = {};

    // Student ID validation
    if (!attemptData.studentId) {
      errors.studentId = 'Student ID is required';
    } else if (!Number.isInteger(attemptData.studentId) || attemptData.studentId <= 0) {
      errors.studentId = 'Student ID must be a positive integer';
    }

    // Exam ID validation
    if (!attemptData.examId) {
      errors.examId = 'Exam ID is required';
    } else if (!Number.isInteger(attemptData.examId) || attemptData.examId <= 0) {
      errors.examId = 'Exam ID must be a positive integer';
    }

    // Score validation
    if (attemptData.score !== undefined && attemptData.score !== null) {
      if (typeof attemptData.score !== 'number' || attemptData.score < 0 || attemptData.score > 100) {
        errors.score = 'Score must be a number between 0 and 100';
      }
    }

    // Status validation
    const validStatuses = ['IN_PROGRESS', 'COMPLETED', 'ABANDONED'];
    if (attemptData.status) {
      if (!validStatuses.includes(attemptData.status)) {
        errors.status = 'Status must be one of: IN_PROGRESS, COMPLETED, ABANDONED';
      }
    }

    // Start time validation
    if (attemptData.startTime) {
      if (!this.isValidISODate(attemptData.startTime)) {
        errors.startTime = 'Start time must be a valid ISO date string';
      }
    }

    // End time validation
    if (attemptData.endTime) {
      if (!this.isValidISODate(attemptData.endTime)) {
        errors.endTime = 'End time must be a valid ISO date string';
      }
      
      // Validate that end time is after start time if both are provided
      if (attemptData.startTime && this.isValidISODate(attemptData.startTime) && this.isValidISODate(attemptData.endTime)) {
        if (new Date(attemptData.endTime) <= new Date(attemptData.startTime)) {
          errors.endTime = 'End time must be after start time';
        }
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  /**
   * Check if string is valid ISO date
   * @param {string} dateString - Date string to validate
   * @returns {boolean} True if valid ISO date
   */
  isValidISODate(dateString) {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date.getTime()) && dateString.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
  }

  /**
   * Format attempt data for display
   * @param {Object} attempt - Raw attempt data
   * @returns {Object} Formatted attempt data
   */
  formatAttemptData(attempt) {
    return {
      ...attempt,
      scoreBadge: this.formatScoreBadge(attempt.score),
      statusBadge: this.formatStatusBadge(attempt.status),
      duration: this.calculateDuration(attempt.startTime, attempt.endTime),
      isPassedBadge: this.formatBooleanBadge(attempt.isPassed),
      formattedStartTime: this.formatDateTime(attempt.startTime),
      formattedEndTime: this.formatDateTime(attempt.endTime),
      scoreColor: this.getScoreColor(attempt.score)
    };
  }

  /**
   * Format score as badge
   * @param {number} score - Score (0-100)
   * @returns {string} Badge HTML
   */
  formatScoreBadge(score) {
    if (score === null || score === undefined) {
      return '<span class="status-badge status-inactive">N/A</span>';
    }

    let scoreClass = 'status-error'; // Default to red for low scores
    let icon = 'fa-frown';

    if (score >= 80) {
      scoreClass = 'status-success';
      icon = 'fa-smile';
    } else if (score >= 60) {
      scoreClass = 'status-warning';
      icon = 'fa-meh';
    }

    return `<span class="status-badge ${scoreClass}"><i class="fas ${icon}"></i> ${score}%</span>`;
  }

  /**
   * Format status as badge
   * @param {string} status - Attempt status
   * @returns {string} Badge HTML
   */
  formatStatusBadge(status) {
    const statusConfig = {
      IN_PROGRESS: { icon: 'fa-clock', class: 'status-warning', text: 'In Progress' },
      COMPLETED: { icon: 'fa-check-circle', class: 'status-success', text: 'Completed' },
      ABANDONED: { icon: 'fa-times-circle', class: 'status-error', text: 'Abandoned' }
    };

    const config = statusConfig[status] || { icon: 'fa-question', class: 'status-inactive', text: 'Unknown' };
    
    return `<span class="status-badge ${config.class}"><i class="fas ${config.icon}"></i> ${config.text}</span>`;
  }

  /**
   * Calculate duration between start and end time
   * @param {string} startTime - Start time (ISO format)
   * @param {string} endTime - End time (ISO format)
   * @returns {string} Formatted duration
   */
  calculateDuration(startTime, endTime) {
    if (!startTime || !endTime) return 'N/A';

    try {
      const start = new Date(startTime);
      const end = new Date(endTime);
      const durationMs = end - start;

      if (durationMs <= 0) return 'N/A';

      const minutes = Math.floor(durationMs / (1000 * 60));
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;

      if (hours > 0) {
        return `${hours}h ${remainingMinutes}m`;
      }
      return `${minutes}m`;
    } catch (error) {
      return 'N/A';
    }
  }

  /**
   * Format boolean as badge
   * @param {boolean} value - Boolean value
   * @returns {string} Badge HTML
   */
  formatBooleanBadge(value) {
    if (value === true) {
      return '<span class="status-badge status-success"><i class="fas fa-check"></i> Passed</span>';
    } else if (value === false) {
      return '<span class="status-badge status-error"><i class="fas fa-times"></i> Failed</span>';
    }
    return '<span class="status-badge status-inactive">N/A</span>';
  }

  /**
   * Format date/time
   * @param {string} dateTime - Date/time string
   * @returns {string} Formatted date/time
   */
  formatDateTime(dateTime) {
    if (!dateTime) return 'N/A';

    try {
      const date = new Date(dateTime);
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'N/A';
    }
  }

  /**
   * Get score color
   * @param {number} score - Score (0-100)
   * @returns {string} Color class
   */
  getScoreColor(score) {
    if (score === null || score === undefined) return 'var(--text-muted)';
    if (score >= 80) return 'var(--success-color)';
    if (score >= 60) return 'var(--warning-color)';
    return 'var(--error-color)';
  }

  /**
   * Get status options for forms
   * @returns {Array} Status options
   */
  getStatusOptions() {
    return [
      { value: 'IN_PROGRESS', label: 'In Progress', icon: 'fa-clock', color: 'var(--warning-color)' },
      { value: 'COMPLETED', label: 'Completed', icon: 'fa-check-circle', color: 'var(--success-color)' },
      { value: 'ABANDONED', label: 'Abandoned', icon: 'fa-times-circle', color: 'var(--error-color)' }
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