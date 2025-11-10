// Questions API Client
import '/types.js'
import { API_CONFIG } from '/config.js';
import { api, handleAPIResponse, handleAPIError } from '/config.js';
class QuestionsAPI {
  constructor() {
    this.endpoint = API_CONFIG.ENDPOINTS.QUESTIONS;
  }

  /**
   * Get all questions with optional filtering and pagination
   * @param {Object} params - Query parameters
   * @param {number} params.page - Page number (default: 0)
   * @param {number} params.size - Page size (default: 20)
   * @param {string} params.questionText - Filter by question text
   * @param {string} params.type - Filter by type (MCQ, TF)
   * @param {number} params.courseId - Filter by course ID
   * @param {boolean} params.noPagination - Disable pagination
   * @param {string} params.sortBy - Sort by field (questionId, courseId, type, questionText)
   * @param {string} params.sortDir - Sort direction (ASC, DESC)
   * @returns {Promise<Object>} Response data
   */
  async getAll(params = {}) {
    try {
      const response = await api.get(this.endpoint, params);
      return handleAPIResponse(response, 'Questions loaded successfully');
    } catch (error) {
      return handleAPIError(error, 'Failed to load questions');
    }
  }

  /**
   * Get a single question by ID
   * @param {number} questionId - Question ID
   * @returns {Promise<Object>} Question data
   */
  async getById(questionId) {
    try {
      const response = await api.get(`${this.endpoint}/${questionId}`);
      return handleAPIResponse(response, 'Question loaded successfully');
    } catch (error) {
      return handleAPIError(error, 'Failed to load question');
    }
  }

  /**
   * Create a new question
   * @param {Object} questionData - Question data
   * @param {string} questionData.questionText - Question text
   * @param {string} questionData.type - Question type (MCQ, TF)
   * @param {number} questionData.courseId - Course ID
   * @returns {Promise<Object>} Created question data
   */
  async create(questionData) {
    try {
      const response = await api.post(this.endpoint, questionData);
      return handleAPIResponse(response, 'Question created successfully');
    } catch (error) {
      return handleAPIError(error, 'Failed to create question');
    }
  }

  /**
   * Update an existing question
   * @param {number} questionId - Question ID
   * @param {Object} questionData - Updated question data
   * @returns {Promise<Object>} Updated question data
   */
  // async update(questionId, questionData) {
  //   try {
  //     const response = await api.put(`${this.endpoint}/${questionId}`, questionData);
  //     return handleAPIResponse(response, 'Question updated successfully');
  //   } catch (error) {
  //     return handleAPIError(error, 'Failed to update question');
  //   }
  // }

  /**
   * Delete a question
   * @param {number} questionId - Question ID
   * @returns {Promise<void>}
   */
  async delete(questionId) {
    try {
      const response = await api.delete(`${this.endpoint}/${questionId}`);
      return handleAPIResponse(response, 'Question deleted successfully');
    } catch (error) {
      return handleAPIError(error, 'Failed to delete question');
    }
  }

  /**
   * Get questions by course
   * @param {number} courseId - Course ID
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Course questions
   */
  // async getQuestionsByCourse(courseId, params = {}) {
  //   try {
  //     const response = await api.get(`${this.endpoint}/course/${courseId}`, params);
  //     return handleAPIResponse(response, 'Course questions loaded successfully');
  //   } catch (error) {
  //     return handleAPIError(error, 'Failed to load course questions');
  //   }
  // }

  /**
   * Get questions by exam
   * @param {number} examId - Exam ID
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Exam questions
   */
  // async getQuestionsByExam(examId, params = {}) {
  //   try {
  //     const response = await api.get(`${this.endpoint}/exam/${examId}`, params);
  //     return handleAPIResponse(response, 'Exam questions loaded successfully');
  //   } catch (error) {
  //     return handleAPIError(error, 'Failed to load exam questions');
  //   }
  // }

  /**
   * Get questions by type
   * @param {string} type - Question type (MULTIPLE_CHOICE, TRUE_FALSE, SHORT_ANSWER, ESSAY)
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Questions by type
   */
  // async getQuestionsByType(type, params = {}) {
  //   try {
  //     const response = await api.get(`${this.endpoint}/type/${type}`, params);
  //     return handleAPIResponse(response, 'Questions by type loaded successfully');
  //   } catch (error) {
  //     return handleAPIError(error, 'Failed to load questions by type');
  //   }
  // }

  /**
   * Get questions with choices
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Questions with choices
   */
  // async getQuestionsWithChoices(params = {}) {
  //   try {
  //     const response = await api.get(`${this.endpoint}/with-choices`, params);
  //     return handleAPIResponse(response, 'Questions with choices loaded successfully');
  //   } catch (error) {
  //     return handleAPIError(error, 'Failed to load questions with choices');
  //   }
  // }

  /**
   * Get question statistics
   * @returns {Promise<Object>} Question statistics
   */
  async getStats() {
    try {
      const response = await api.get(`${this.endpoint}/count`);
      return handleAPIResponse(response, 'Question statistics loaded successfully');
    } catch (error) {
      return handleAPIError(error, 'Failed to load question statistics');
    }
  }

  /**
   * Count questions with filters
   * @param {Object} params - Query parameters for filtering
   * @returns {Promise<Object>} Question count
   */
  // async countQuestions(params = {}) {
  //   try {
  //     const response = await api.get(`${this.endpoint}/count`, params);
  //     return handleAPIResponse(response, 'Question count loaded successfully');
  //   } catch (error) {
  //     return handleAPIError(error, 'Failed to load question count');
  //   }
  // }

  /**
   * Validate question data
   * @param {Object} questionData - Question data to validate
   * @returns {Object} Validation result
   */
  validateQuestionData(questionData) {
    const errors = {};

    // Required fields from Swagger QuestionDTO
    if (!questionData.courseId) {
      errors.courseId = 'Course ID is required';
    } else if (!Number.isInteger(questionData.courseId) || questionData.courseId <= 0) {
      errors.courseId = 'Course ID must be a positive integer';
    }

    if (!questionData.type) {
      errors.type = 'Question type is required';
    } else if (!['MCQ', 'T/F'].includes(questionData.type)) { // FIX: Swagger enum values
      errors.type = 'Question type must be MCQ or T/F';
    }

    if (!questionData.questionText) {
      errors.questionText = 'Question text is required';
    } else if (questionData.questionText.length > 500) { // FIX: 500 from Swagger, not 1000
      errors.questionText = 'Question text must be less than 500 characters';
    }

    // REMOVE: These fields are not in QuestionDTO
    // difficulty, points, examId, correctAnswer

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  /**
   * Format question data for display
   * @param {Object} question - Raw question data
   * @returns {Object} Formatted question data
   */
  formatQuestionData(question) {
    return {
      ...question,
      typeBadge: this.formatTypeBadge(question.type),
      difficultyBadge: this.formatDifficultyBadge(question.difficulty),
      pointsBadge: this.formatPointsBadge(question.points),
      displayText: this.formatDisplayText(question.questionText),
      typeIcon: this.getTypeIcon(question.type),
      difficultyColor: this.getDifficultyColor(question.difficulty)
    };
  }

  /**
   * Format type as badge
   * @param {string} type - Question type
   * @returns {string} Badge HTML
   */
  formatTypeBadge(type) {
    const typeConfig = {
      'MCQ': { icon: 'fa-list', class: 'status-primary', text: 'Multiple Choice' },
      'T/F': { icon: 'fa-check-circle', class: 'status-success', text: 'True/False' }
    };

    const config = typeConfig[type] || { icon: 'fa-question', class: 'status-inactive', text: 'Unknown' };
    
    return `<span class="status-badge ${config.class}"><i class="fas ${config.icon}"></i> ${config.text}</span>`;
  }

  /**
   * Format difficulty as badge
   * @param {number} difficulty - Difficulty level (1-5)
   * @returns {string} Badge HTML
   */
  formatDifficultyBadge(difficulty) {
    const difficultyConfig = {
      1: { icon: 'fa-star', class: 'status-success', text: 'Very Easy' },
      2: { icon: 'fa-star', class: 'status-success', text: 'Easy' },
      3: { icon: 'fa-star', class: 'status-warning', text: 'Medium' },
      4: { icon: 'fa-star', class: 'status-error', text: 'Hard' },
      5: { icon: 'fa-star', class: 'status-error', text: 'Very Hard' }
    };

    const config = difficultyConfig[difficulty] || { icon: 'fa-question', class: 'status-inactive', text: 'Unknown' };
    
    return `<span class="status-badge ${config.class}"><i class="fas ${config.icon}"></i> ${config.text}</span>`;
  }

  /**
   * Format points as badge
   * @param {number} points - Points value
   * @returns {string} Badge HTML
   */
  formatPointsBadge(points) {
    const pointsClass = points >= 10 ? 'status-primary' : 
                       points >= 5 ? 'status-warning' : 'status-info';
    
    return `<span class="status-badge ${pointsClass}"><i class="fas fa-trophy"></i> ${points} pts</span>`;
  }

  /**
   * Format display text
   * @param {string} text - Question text
   * @returns {string} Formatted text
   */
  formatDisplayText(text) {
    if (!text) return 'No question text';
    
    // Truncate if too long
    if (text.length > 150) {
      return text.substring(0, 150) + '...';
    }
    
    return text;
  }

  /**
   * Get type icon
   * @param {string} type - Question type
   * @returns {string} Icon class
   */
  getTypeIcon(type) {
    const icons = {
      MULTIPLE_CHOICE: 'fa-list',
      TRUE_FALSE: 'fa-check-circle',
      SHORT_ANSWER: 'fa-edit',
      ESSAY: 'fa-file-alt'
    };
    return icons[type] || 'fa-question';
  }

  /**
   * Get difficulty color
   * @param {number} difficulty - Difficulty level (1-5)
   * @returns {string} Color class
   */
  getDifficultyColor(difficulty) {
    const colors = {
      1: 'var(--success-color)',
      2: 'var(--success-color)',
      3: 'var(--warning-color)',
      4: 'var(--error-color)',
      5: 'var(--error-color)'
    };
    return colors[difficulty] || 'var(--text-muted)';
  }

  /**
   * Get type options for forms
   * @returns {Array} Type options
   */
  getTypeOptions() {
    return [
      { value: 'MCQ', label: 'Multiple Choice', icon: 'fa-list' },
      { value: 'T/F', label: 'True/False', icon: 'fa-check-circle' }
    ];
  }

  /**
   * Get difficulty options for forms
   * @returns {Array} Difficulty options
   */
  getDifficultyOptions() {
    return [
      { value: 1, label: 'Very Easy (1)', icon: 'fa-star' },
      { value: 2, label: 'Easy (2)', icon: 'fa-star' },
      { value: 3, label: 'Medium (3)', icon: 'fa-star' },
      { value: 4, label: 'Hard (4)', icon: 'fa-star' },
      { value: 5, label: 'Very Hard (5)', icon: 'fa-star' }
    ];
  }

  /**
   * Build query parameters for filtering
   * @param {Object} filters - Filter criteria
   * @returns {Object} Query parameters
   */
  buildQueryParams(filters) {
    const params = {};

    if (filters.questionText) params.questionText = filters.questionText.trim();
    if (filters.type) params.type = filters.type;
    if (filters.courseId) params.courseId = parseInt(filters.courseId);
    if (filters.hasChoices !== undefined && filters.hasChoices !== '') {
      params.hasChoices = filters.hasChoices === 'true';
    }
    if (filters.minChoiceCount) params.minChoiceCount = parseInt(filters.minChoiceCount); // ADD

    // ADD sorting parameters
    if (filters.sortBy) params.sortBy = filters.sortBy;
    if (filters.sortDir) params.sortDir = filters.sortDir;

    if (filters.page !== undefined) params.page = parseInt(filters.page);
    if (filters.size !== undefined) params.size = parseInt(filters.size);

    return params;
  }
  /**
   * Cache management for questions
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
const questionsAPI = new QuestionsAPI();
window.questionsAPI = questionsAPI;