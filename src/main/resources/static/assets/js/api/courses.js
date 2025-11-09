// Courses API Client
class CoursesAPI {
  constructor() {
    this.endpoint = API_CONFIG.ENDPOINTS.COURSES;
  }

  /**
   * Get all courses with optional filtering and pagination
   * @param {Object} params - Query parameters
   * @param {number} params.page - Page number (default: 0)
   * @param {number} params.size - Page size (default: 20)
   * @param {string} params.courseName - Filter by course name
   * @param {number} params.minDuration - Minimum duration filter
   * @param {number} params.maxDuration - Maximum duration filter
   * @param {boolean} params.noPagination - Disable pagination
   * @param {string} params.sortBy - Sort by field (courseName, duration)
   * @param {string} params.sortDir - Sort direction (ASC, DESC)
   * @returns {Promise<Object>} Response data
   */
  async getAll(params = {}) {
    try {
      const response = await api.get(this.endpoint, params);
      return handleAPIResponse(response, 'Courses loaded successfully');
    } catch (error) {
      return handleAPIError(error, 'Failed to load courses');
    }
  }

  /**
   * Get a single course by ID
   * @param {number} courseId - Course ID
   * @returns {Promise<Object>} Course data
   */
  async getById(courseId) {
    try {
      const response = await api.get(`${this.endpoint}/${courseId}`);
      return handleAPIResponse(response, 'Course loaded successfully');
    } catch (error) {
      return handleAPIError(error, 'Failed to load course');
    }
  }

  /**
   * Create a new course
   * @param {Object} courseData - Course data
   * @param {string} courseData.courseName - Course name
   * @param {number} courseData.duration - Course duration in hours
   * @param {boolean} courseData.hasExams - Whether course has exams
   * @param {boolean} courseData.hasQuestions - Whether course has questions
   * @returns {Promise<Object>} Created course data
   */
  async create(courseData) {
    try {
      const response = await api.post(this.endpoint, courseData);
      return handleAPIResponse(response, 'Course created successfully');
    } catch (error) {
      return handleAPIError(error, 'Failed to create course');
    }
  }

  /**
   * Update an existing course
   * @param {number} courseId - Course ID
   * @param {Object} courseData - Updated course data
   * @returns {Promise<Object>} Updated course data
   */
  async update(courseId, courseData) {
    try {
      const response = await api.put(`${this.endpoint}/${courseId}`, courseData);
      return handleAPIResponse(response, 'Course updated successfully');
    } catch (error) {
      return handleAPIError(error, 'Failed to update course');
    }
  }

  /**
   * Delete a course
   * @param {number} courseId - Course ID
   * @returns {Promise<void>}
   */
  async delete(courseId) {
    try {
      const response = await api.delete(`${this.endpoint}/${courseId}`);
      return handleAPIResponse(response, 'Course deleted successfully');
    } catch (error) {
      return handleAPIError(error, 'Failed to delete course');
    }
  }

  /**
   * Get courses with exams
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Courses with exams
   */
  async getCoursesWithExams(params = {}) {
    try {
      const response = await api.get(`${this.endpoint}/with-exams`, params);
      return handleAPIResponse(response, 'Courses with exams loaded successfully');
    } catch (error) {
      return handleAPIError(error, 'Failed to load courses with exams');
    }
  }

  /**
   * Get courses with questions
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Courses with questions
   */
  async getCoursesWithQuestions(params = {}) {
    try {
      const response = await api.get(`${this.endpoint}/with-questions`, params);
      return handleAPIResponse(response, 'Courses with questions loaded successfully');
    } catch (error) {
      return handleAPIError(error, 'Failed to load courses with questions');
    }
  }

  /**
   * Get course statistics
   * @returns {Promise<Object>} Course statistics
   */
  async getStats() {
    try {
      const response = await api.get(`${this.endpoint}/count`);
      return handleAPIResponse(response, 'Course statistics loaded successfully');
    } catch (error) {
      return handleAPIError(error, 'Failed to load course statistics');
    }
  }

  /**
   * Count courses with filters
   * @param {Object} params - Query parameters for filtering
   * @returns {Promise<Object>} Course count
   */
  async countCourses(params = {}) {
    try {
      const response = await api.get(`${this.endpoint}/count`, params);
      return handleAPIResponse(response, 'Course count loaded successfully');
    } catch (error) {
      return handleAPIError(error, 'Failed to load course count');
    }
  }

  /**
   * Get questions for a specific course
   * @param {number} courseId - Course ID
   * @param {Object} params - Query parameters for filtering
   * @returns {Promise<Object>} Course questions
   */
  async getCourseQuestions(courseId, params = {}) {
    try {
      const response = await api.get(`${this.endpoint}/${courseId}/questions`, params);
      return handleAPIResponse(response, 'Course questions loaded successfully');
    } catch (error) {
      return handleAPIError(error, 'Failed to load course questions');
    }
  }

  /**
   * Validate course data
   * @param {Object} courseData - Course data to validate
   * @returns {Object} Validation result
   */
  validateCourseData(courseData) {
    const errors = {};

    // Course name validation
    if (!courseData.courseName) {
      errors.courseName = 'Course name is required';
    } else if (courseData.courseName.length < 3) {
      errors.courseName = 'Course name must be at least 3 characters';
    } else if (courseData.courseName.length > 200) {
      errors.courseName = 'Course name must be less than 200 characters';
    }

    // Duration validation
    if (courseData.duration === undefined || courseData.duration === null) {
      errors.duration = 'Duration is required';
    } else if (!Number.isInteger(courseData.duration) || courseData.duration <= 0) {
      errors.duration = 'Duration must be a positive integer';
    } else if (courseData.duration > 1000) {
      errors.duration = 'Duration must be less than 1000 hours';
    }

    // Boolean fields validation
    if (courseData.hasExams !== undefined && typeof courseData.hasExams !== 'boolean') {
      errors.hasExams = 'Has exams must be a boolean value';
    }

    if (courseData.hasQuestions !== undefined && typeof courseData.hasQuestions !== 'boolean') {
      errors.hasQuestions = 'Has questions must be a boolean value';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  /**
   * Format course data for display
   * @param {Object} course - Raw course data
   * @returns {Object} Formatted course data
   */
  formatCourseData(course) {
    return {
      ...course,
      formattedDuration: this.formatDuration(course.duration),
      hasExamsBadge: this.formatBooleanBadge(course.hasExams),
      hasQuestionsBadge: this.formatBooleanBadge(course.hasQuestions),
      displayName: this.formatDisplayName(course.courseName)
    };
  }

  /**
   * Format duration in hours
   * @param {number} duration - Duration in hours
   * @returns {string} Formatted duration
   */
  formatDuration(duration) {
    if (!duration || duration <= 0) return '0 hours';
    
    if (duration === 1) return '1 hour';
    if (duration < 24) return `${duration} hours`;
    
    const days = Math.floor(duration / 24);
    const hours = duration % 24;
    
    if (hours === 0) return days === 1 ? '1 day' : `${days} days`;
    
    return `${days} day${days > 1 ? 's' : ''} ${hours} hour${hours > 1 ? 's' : ''}`;
  }

  /**
   * Format boolean as badge
   * @param {boolean} value - Boolean value
   * @returns {string} Badge HTML
   */
  formatBooleanBadge(value) {
    if (value === true) {
      return '<span class="status-badge status-active"><i class="fas fa-check"></i> Yes</span>';
    } else if (value === false) {
      return '<span class="status-badge status-inactive"><i class="fas fa-times"></i> No</span>';
    }
    return '<span class="status-badge status-inactive">N/A</span>';
  }

  /**
   * Format display name
   * @param {string} name - Course name
   * @returns {string} Formatted name
   */
  formatDisplayName(name) {
    if (!name) return 'Unknown Course';
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  /**
   * Build query parameters for filtering
   * @param {Object} filters - Filter criteria
   * @returns {Object} Query parameters
   */
  buildQueryParams(filters) {
    const params = {};
    
    if (filters.name) params.name = filters.name.trim();
    if (filters.minDuration) params.minDuration = parseInt(filters.minDuration);
    if (filters.maxDuration) params.maxDuration = parseInt(filters.maxDuration);
    if (filters.hasExams !== undefined && filters.hasExams !== '') {
      params.hasExams = filters.hasExams === 'true';
    }
    if (filters.hasQuestions !== undefined && filters.hasQuestions !== '') {
      params.hasQuestions = filters.hasQuestions === 'true';
    }
    if (filters.page) params.page = parseInt(filters.page);
    if (filters.size) params.size = parseInt(filters.size);
    
    return params;
  }

  /**
   * Get course options for dropdowns
   * @returns {Promise<Array>} Course options
   */
  async getCourseOptions() {
    try {
      const courses = await this.getAll({ size: 1000 }); // Get all courses
      return courses.content.map(course => ({
        value: course.id,
        label: course.courseName,
        duration: course.duration
      }));
    } catch (error) {
      console.error('Failed to load course options:', error);
      return [];
    }
  }

  /**
   * Cache management for courses
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
const coursesAPI = new CoursesAPI();
window.coursesAPI = coursesAPI;