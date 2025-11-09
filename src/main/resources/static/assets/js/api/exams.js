// Add at top:
import { API_CONFIG } from './config.js';
import { api, handleAPIResponse, handleAPIError } from './config.js';
import './types.js'
class ExamsAPI {
  constructor() {
    this.endpoint = API_CONFIG.ENDPOINTS.EXAMS;
  }

  /**
   * Get all exams with optional filtering and pagination
   * @param {Object} params - Query parameters
   * @param {number} params.page - Page number (default: 0)
   * @param {number} params.size - Page size (default: 20)
   * @param {string} params.title - Filter by title
   * @param {number} params.courseId - Filter by course ID
   * @param {number} params.duration - Filter by duration
   * @param {number} params.numMcq - Filter by number of MCQ questions
   * @param {number} params.numTf - Filter by number of True/False questions
   * @param {boolean} params.noPagination - Disable pagination
   * @param {string} params.sortBy - Sort by field (title, courseId, duration, numMcq, numTf)
   * @param {string} params.sortDir - Sort direction (ASC, DESC)
   * @returns {Promise<Object>} Response data
   */
  async getAll(params = {}) {
    try {
      const response = await api.get(this.endpoint, params);
      return handleAPIResponse(response, 'Exams loaded successfully');
    } catch (error) {
      return handleAPIError(error, 'Failed to load exams');
    }
  }

  /**
   * Get a single exam by ID
   * @param {number} examId - Exam ID
   * @returns {Promise<Object>} Exam data
   */
  async getById(examId) {
    try {
      const response = await api.get(`${this.endpoint}/${examId}`);
      return handleAPIResponse(response, 'Exam loaded successfully');
    } catch (error) {
      return handleAPIError(error, 'Failed to load exam');
    }
  }

  /**
   * Create a new exam
   * @param {Object} examData - Exam data
   * @param {string} examData.title - Exam title
   * @param {number} examData.courseId - Course ID
   * @param {number} examData.duration - Duration in minutes
   * @param {number} examData.numMcq - Number of MCQ questions
   * @param {number} examData.numTf - Number of True/False questions
   * @returns {Promise<Object>} Created exam data
   */
  async create(examData) {
    try {
      const response = await api.post(this.endpoint, examData);
      return handleAPIResponse(response, 'Exam created successfully');
    } catch (error) {
      return handleAPIError(error, 'Failed to create exam');
    }
  }

  /**
   * Update an existing exam
   * @param {number} examId - Exam ID
   * @param {Object} examData - Updated exam data
   * @returns {Promise<Object>} Updated exam data
   */
  async update(examId, examData) {
    try {
      const response = await api.put(`${this.endpoint}/${examId}`, examData);
      return handleAPIResponse(response, 'Exam updated successfully');
    } catch (error) {
      return handleAPIError(error, 'Failed to update exam');
    }
  }

  /**
   * Delete an exam
   * @param {number} examId - Exam ID
   * @returns {Promise<void>}
   */
  async delete(examId) {
    try {
      const response = await api.delete(`${this.endpoint}/${examId}`);
      return handleAPIResponse(response, 'Exam deleted successfully');
    } catch (error) {
      return handleAPIError(error, 'Failed to delete exam');
    }
  }

  /**
   * Get active exams
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Active exams
   */
  // async getActiveExams(params = {}) {
  //   try {
  //     const response = await api.get(`${this.endpoint}/active`, params);
  //     return handleAPIResponse(response, 'Active exams loaded successfully');
  //   } catch (error) {
  //     return handleAPIError(error, 'Failed to load active exams');
  //   }
  // }

  /**
   * Get exams by course
   * @param {number} courseId - Course ID
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Course exams
   */
  // async getExamsByCourse(courseId, params = {}) {
  //   try {
  //     const response = await api.get(`${this.endpoint}/course/${courseId}`, params);
  //     return handleAPIResponse(response, 'Course exams loaded successfully');
  //   } catch (error) {
  //     return handleAPIError(error, 'Failed to load course exams');
  //   }
  // }

  /**
   * Get exams by difficulty
   * @param {string} difficulty - Difficulty level (EASY, MEDIUM, HARD)
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Exams by difficulty
   */
  // async getExamsByDifficulty(difficulty, params = {}) {
  //   try {
  //     const response = await api.get(`${this.endpoint}/difficulty/${difficulty}`, params);
  //     return handleAPIResponse(response, 'Exams by difficulty loaded successfully');
  //   } catch (error) {
  //     return handleAPIError(error, 'Failed to load exams by difficulty');
  //   }
  // }

  /**
   * Get exam statistics
   * @returns {Promise<Object>} Exam statistics
   */
  async getStats() {
    try {
      const response = await api.get(`${this.endpoint}/count`);
      return handleAPIResponse(response, 'Exam statistics loaded successfully');
    } catch (error) {
      return handleAPIError(error, 'Failed to load exam statistics');
    }
  }

  /**
   * Submit an exam
   * @param {string} ssn - Student SSN
   * @param {number} examId - Exam ID
   * @param {Array} answers - Array of answers
   * @returns {Promise<Object>} Exam submission result
   */
  async submitExam(ssn, examId, answers) {
    try {
      // Validate SSN format before making the API call
      if (!ssn || !/^\d{14}$/.test(ssn)) {
        console.error(`Invalid SSN format in submitExam: "${ssn}" (must be exactly 14 digits)`);
        throw new Error('SSN must be exactly 14 digits');
      }
      
      const submissionData = {
        ssn: ssn,
        examId: examId,
        answers: answers
      };
      const response = await api.post(`${this.endpoint}/submit`, submissionData);
      return handleAPIResponse(response, 'Exam submitted successfully');
      
    } catch (error) {
      return handleAPIError(error, 'Failed to submit exam');
    }
  }

  /**
   * Count exams with filters
   * @param {Object} params - Query parameters for filtering
   * @returns {Promise<Object>} Exam count
   */
  async countExams(params = {}) {
    try {
      const response = await api.get(`${this.endpoint}/count`, params);
      return handleAPIResponse(response, 'Exam count loaded successfully');
    } catch (error) {
      return handleAPIError(error, 'Failed to load exam count');
    }
  }

  /**
   * Validate exam data
   * @param {Object} examData - Exam data to validate
   * @returns {Object} Validation result
   */
  validateExamData(examData) {
    const errors = {};

    // Title validation
    if (!examData.title) {
      errors.title = 'Exam title is required';
    } else if (examData.title.length < 3) {
      errors.title = 'Exam title must be at least 3 characters';
    } else if (examData.title.length > 200) {
      errors.title = 'Exam title must be less than 200 characters';
    }

    // Course ID validation
    if (!examData.courseId) {
      errors.courseId = 'Course ID is required';
    } else if (!Number.isInteger(examData.courseId) || examData.courseId <= 0) {
      errors.courseId = 'Course ID must be a positive integer';
    }

    // Difficulty validation
    const validDifficulties = ['EASY', 'MEDIUM', 'HARD'];
    if (!examData.difficulty) {
      errors.difficulty = 'Difficulty level is required';
    } else if (!validDifficulties.includes(examData.difficulty)) {
      errors.difficulty = 'Difficulty must be one of: EASY, MEDIUM, HARD';
    }

    // Duration validation
    if (examData.duration === undefined || examData.duration === null) {
      errors.duration = 'Duration is required';
    } else if (!Number.isInteger(examData.duration) || examData.duration <= 0) {
      errors.duration = 'Duration must be a positive integer (minutes)';
    } else if (examData.duration > 300) {
      errors.duration = 'Duration must be less than 300 minutes (5 hours)';
    }

    // Question count validation
    if (examData.questionCount === undefined || examData.questionCount === null) {
      errors.questionCount = 'Question count is required';
    } else if (!Number.isInteger(examData.questionCount) || examData.questionCount <= 0) {
      errors.questionCount = 'Question count must be a positive integer';
    } else if (examData.questionCount > 200) {
      errors.questionCount = 'Question count must be less than 200';
    }

    // Boolean fields validation
    if (examData.isActive !== undefined && typeof examData.isActive !== 'boolean') {
      errors.isActive = 'Is active must be a boolean value';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  /**
   * Format exam data for display
   * @param {Object} exam - Raw exam data
   * @returns {Object} Formatted exam data
   */
  formatExamData(exam) {
    if (!exam) return null;

    return {
      ...exam,
      // Format display data
      formattedDuration: this.formatDuration(exam.duration),
      formattedExamDate: this.formatDateForDisplay(exam.examDate),
      displayTitle: this.formatDisplayTitle(exam.title),

      // Use the actual numMcq and numTf from the response
      questionCounts: {
        total: (exam.numMcq || 0) + (exam.numTf || 0),
        mcq: exam.numMcq || 0,
        tf: exam.numTf || 0
      },

      // UI badges using actual data
      hasQuestionsBadge: this.formatBooleanBadge((exam.numMcq || 0) + (exam.numTf || 0) > 0),
      questionCountBadge: `<span class="status-badge status-info">${(exam.numMcq || 0) + (exam.numTf || 0)} Questions</span>`,
      mcqCountBadge: exam.numMcq > 0 ?
          `<span class="status-badge status-primary">${exam.numMcq} MCQ</span>` : '',
      tfCountBadge: exam.numTf > 0 ?
          `<span class="status-badge status-secondary">${exam.numTf} T/F</span>` : '',

      // Additional formatting
      generatedQuestionsCount: exam.questions ? exam.questions.length : 0,
      hasGeneratedQuestions: exam.questions && exam.questions.length > 0
    };
  }
  /**
   * Format duration in minutes
   * @param {number} duration - Duration in minutes
   * @returns {string} Formatted duration
   */
  formatDuration(duration) {
    if (!duration || duration <= 0) return '0 min';
    
    if (duration === 1) return '1 min';
    if (duration < 60) return `${duration} min`;
    
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;
    
    if (minutes === 0) return hours === 1 ? '1 hour' : `${hours} hours`;
    
    return `${hours} hour${hours > 1 ? 's' : ''} ${minutes} min`;
  }

  /**
   * Format difficulty as badge
   * @param {string} difficulty - Difficulty level
   * @returns {string} Badge HTML
   */
  formatDifficultyBadge(difficulty) {
    const difficultyConfig = {
      EASY: { icon: 'fa-smile', class: 'status-success', text: 'Easy' },
      MEDIUM: { icon: 'fa-meh', class: 'status-warning', text: 'Medium' },
      HARD: { icon: 'fa-frown', class: 'status-error', text: 'Hard' }
    };

    const config = difficultyConfig[difficulty] || { icon: 'fa-question', class: 'status-inactive', text: 'Unknown' };
    
    return `<span class="status-badge ${config.class}"><i class="fas ${config.icon}"></i> ${config.text}</span>`;
  }

  /**
   * Format boolean as badge
   * @param {boolean} value - Boolean value
   * @returns {string} Badge HTML
   */
  formatBooleanBadge(value) {
    if (value === true) {
      return '<span class="status-badge status-active"><i class="fas fa-check"></i> Active</span>';
    } else if (value === false) {
      return '<span class="status-badge status-inactive"><i class="fas fa-times"></i> Inactive</span>';
    }
    return '<span class="status-badge status-inactive">N/A</span>';
  }

  /**
   * Get difficulty color
   * @param {string} difficulty - Difficulty level
   * @returns {string} Color class
   */
  getDifficultyColor(difficulty) {
    const colors = {
      EASY: 'var(--success-color)',
      MEDIUM: 'var(--warning-color)',
      HARD: 'var(--error-color)'
    };
    return colors[difficulty] || 'var(--text-muted)';
  }

  /**
   * Format display title
   * @param {string} title - Exam title
   * @returns {string} Formatted title
   */
  formatDisplayTitle(title) {
    if (!title) return 'Unknown Exam';
    return title
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

    // All Swagger parameters
    if (filters.title) params.title = filters.title.trim();
    if (filters.courseId) params.courseId = parseInt(filters.courseId);
    if (filters.examDate) params.examDate = filters.examDate;
    if (filters.startDate) params.startDate = filters.startDate;
    if (filters.endDate) params.endDate = filters.endDate;
    if (filters.duration) params.duration = parseInt(filters.duration);
    if (filters.minDuration) params.minDuration = parseInt(filters.minDuration);
    if (filters.maxDuration) params.maxDuration = parseInt(filters.maxDuration);

    // Sorting
    if (filters.sortBy) params.sortBy = filters.sortBy;
    if (filters.sortDir) params.sortDir = filters.sortDir;

    // Pagination
    if (filters.page !== undefined) params.page = parseInt(filters.page);
    if (filters.size !== undefined) params.size = parseInt(filters.size);

    return params;
  }
  /**
   * Get exam options for dropdowns
   * @returns {Promise<Array>} Exam options
   */
  async getExamOptions() {
    try {
      const exams = await this.getAll({ size: 1000, isActive: true }); // Get active exams
      return exams.content.map(exam => ({
        value: exam.id,
        label: exam.title,
        courseId: exam.courseId,
        difficulty: exam.difficulty,
        duration: exam.duration
      }));
    } catch (error) {
      console.error('Failed to load exam options:', error);
      return [];
    }
  }

  /**
   * Get difficulty options for forms
   * @returns {Array} Difficulty options
   */
  getDifficultyOptions() {
    return [
      { value: 'EASY', label: 'Easy', icon: 'fa-smile', color: 'var(--success-color)' },
      { value: 'MEDIUM', label: 'Medium', icon: 'fa-meh', color: 'var(--warning-color)' },
      { value: 'HARD', label: 'Hard', icon: 'fa-frown', color: 'var(--error-color)' }
    ];
  }

  /**
   * Cache management for exams
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
const examsAPI = new ExamsAPI();
window.examsAPI = examsAPI;