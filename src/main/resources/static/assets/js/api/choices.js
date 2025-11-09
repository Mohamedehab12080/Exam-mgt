// Choices API Client
class ChoicesAPI {
  constructor() {
    this.endpoint = API_CONFIG.ENDPOINTS.CHOICES;
  }

  /**
   * Get all choices with optional filtering and pagination
   * @param {Object} params - Query parameters
   * @param {number} params.page - Page number (default: 0)
   * @param {number} params.size - Page size (default: 20)
   * @param {string} params.choiceText - Filter by choice text
   * @param {number} params.questionId - Filter by question ID
   * @param {boolean} params.isCorrect - Filter by correctness
   * @param {boolean} params.noPagination - Disable pagination
   * @param {string} params.sortBy - Sort by field (choiceId, choiceText, questionId, isCorrect)
   * @param {string} params.sortDir - Sort direction (ASC, DESC)
   * @returns {Promise<Object>} Response data
   */
  async getAll(params = {}) {
    try {
      const response = await api.get(this.endpoint, params);
      return handleAPIResponse(response, 'Choices loaded successfully');
    } catch (error) {
      return handleAPIError(error, 'Failed to load choices');
    }
  }

  /**
   * Get a single choice by ID
   * @param {number} choiceId - Choice ID
   * @returns {Promise<Object>} Choice data
   */
  async getById(choiceId) {
    try {
      const response = await api.get(`${this.endpoint}/${choiceId}`);
      return handleAPIResponse(response, 'Choice loaded successfully');
    } catch (error) {
      return handleAPIError(error, 'Failed to load choice');
    }
  }

  /**
   * Create a new choice
   * @param {Object} choiceData - Choice data
   * @param {string} choiceData.choiceText - Choice text
   * @param {number} choiceData.questionId - Question ID
   * @param {boolean} choiceData.isCorrect - Whether this is the correct answer
   * @returns {Promise<Object>} Created choice data
   */
  async create(choiceData) {
    try {
      const response = await api.post(this.endpoint, choiceData);
      return handleAPIResponse(response, 'Choice created successfully');
    } catch (error) {
      return handleAPIError(error, 'Failed to create choice');
    }
  }

  /**
   * Update an existing choice
   * @param {number} choiceId - Choice ID
   * @param {Object} choiceData - Updated choice data
   * @returns {Promise<Object>} Updated choice data
   */
  async update(choiceId, choiceData) {
    try {
      const response = await api.put(`${this.endpoint}/${choiceId}`, choiceData);
      return handleAPIResponse(response, 'Choice updated successfully');
    } catch (error) {
      return handleAPIError(error, 'Failed to update choice');
    }
  }

  /**
   * Delete a choice
   * @param {number} choiceId - Choice ID
   * @returns {Promise<void>}
   */
  async delete(choiceId) {
    try {
      const response = await api.delete(`${this.endpoint}/${choiceId}`);
      return handleAPIResponse(response, 'Choice deleted successfully');
    } catch (error) {
      return handleAPIError(error, 'Failed to delete choice');
    }
  }

  /**
   * Get choices by question
   * @param {number} questionId - Question ID
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Question choices
   */
  async getChoicesByQuestion(questionId, params = {}) {
    try {
      const response = await api.get(`${this.endpoint}/question/${questionId}`, params);
      return handleAPIResponse(response, 'Question choices loaded successfully');
    } catch (error) {
      return handleAPIError(error, 'Failed to load question choices');
    }
  }

  /**
   * Get correct choices by question
   * @param {number} questionId - Question ID
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Correct choices
   */
  async getCorrectChoicesByQuestion(questionId, params = {}) {
    try {
      const response = await api.get(`${this.endpoint}/question/${questionId}/correct`, params);
      return handleAPIResponse(response, 'Correct choices loaded successfully');
    } catch (error) {
      return handleAPIError(error, 'Failed to load correct choices');
    }
  }

  /**
   * Get incorrect choices by question
   * @param {number} questionId - Question ID
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Incorrect choices
   */
  async getIncorrectChoicesByQuestion(questionId, params = {}) {
    try {
      const response = await api.get(`${this.endpoint}/question/${questionId}/incorrect`, params);
      return handleAPIResponse(response, 'Incorrect choices loaded successfully');
    } catch (error) {
      return handleAPIError(error, 'Failed to load incorrect choices');
    }
  }

  /**
   * Get choices statistics
   * @returns {Promise<Object>} Choices statistics
   */
  async getStats() {
    try {
      const response = await api.get(`${this.endpoint}/count`);
      return handleAPIResponse(response, 'Choices statistics loaded successfully');
    } catch (error) {
      return handleAPIError(error, 'Failed to load choices statistics');
    }
  }

  /**
   * Count choices with filters
   * @param {Object} params - Query parameters for filtering
   * @returns {Promise<Object>} Choice count
   */
  async countChoices(params = {}) {
    try {
      const response = await api.get(`${this.endpoint}/count`, params);
      return handleAPIResponse(response, 'Choice count loaded successfully');
    } catch (error) {
      return handleAPIError(error, 'Failed to load choice count');
    }
  }

  /**
   * Validate choice data
   * @param {Object} choiceData - Choice data to validate
   * @returns {Object} Validation result
   */
  validateChoiceData(choiceData) {
    const errors = {};

    // Choice text validation
    if (!choiceData.choiceText) {
      errors.choiceText = 'Choice text is required';
    } else if (choiceData.choiceText.length < 1) {
      errors.choiceText = 'Choice text must be at least 1 character';
    } else if (choiceData.choiceText.length > 500) {
      errors.choiceText = 'Choice text must be less than 500 characters';
    }

    // Question ID validation
    if (!choiceData.questionId) {
      errors.questionId = 'Question ID is required';
    } else if (!Number.isInteger(choiceData.questionId) || choiceData.questionId <= 0) {
      errors.questionId = 'Question ID must be a positive integer';
    }

    // Boolean fields validation
    if (choiceData.isCorrect !== undefined && typeof choiceData.isCorrect !== 'boolean') {
      errors.isCorrect = 'Is correct must be a boolean value';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  /**
   * Format choice data for display
   * @param {Object} choice - Raw choice data
   * @returns {Object} Formatted choice data
   */
  formatChoiceData(choice) {
    return {
      ...choice,
      isCorrectBadge: this.formatCorrectnessBadge(choice.isCorrect),
      displayText: this.formatDisplayText(choice.choiceText),
      correctnessIcon: this.getCorrectnessIcon(choice.isCorrect),
      correctnessColor: this.getCorrectnessColor(choice.isCorrect)
    };
  }

  /**
   * Format correctness as badge
   * @param {boolean} isCorrect - Whether choice is correct
   * @returns {string} Badge HTML
   */
  formatCorrectnessBadge(isCorrect) {
    if (isCorrect === true) {
      return '<span class="status-badge status-success"><i class="fas fa-check"></i> Correct</span>';
    } else if (isCorrect === false) {
      return '<span class="status-badge status-error"><i class="fas fa-times"></i> Incorrect</span>';
    }
    return '<span class="status-badge status-inactive">N/A</span>';
  }

  /**
   * Format display text
   * @param {string} text - Choice text
   * @returns {string} Formatted text
   */
  formatDisplayText(text) {
    if (!text) return 'No choice text';
    
    // Truncate if too long
    if (text.length > 100) {
      return text.substring(0, 100) + '...';
    }
    
    return text;
  }

  /**
   * Get correctness icon
   * @param {boolean} isCorrect - Whether choice is correct
   * @returns {string} Icon class
   */
  getCorrectnessIcon(isCorrect) {
    return isCorrect === true ? 'fa-check-circle' : 'fa-times-circle';
  }

  /**
   * Get correctness color
   * @param {boolean} isCorrect - Whether choice is correct
   * @returns {string} Color class
   */
  getCorrectnessColor(isCorrect) {
    return isCorrect === true ? 'var(--success-color)' : 'var(--error-color)';
  }

  /**
   * Get letter labels for choices (A, B, C, D, etc.)
   * @param {number} index - Choice index (0-based)
   * @returns {string} Letter label
   */
  getChoiceLetter(index) {
    return String.fromCharCode(65 + index); // 65 is ASCII code for 'A'
  }

  /**
   * Format choice with letter label
   * @param {Object} choice - Choice data
   * @param {number} index - Choice index
   * @returns {Object} Formatted choice with letter
   */
  formatChoiceWithLetter(choice, index) {
    return {
      ...this.formatChoiceData(choice),
      letter: this.getChoiceLetter(index),
      letterBadge: this.formatLetterBadge(this.getChoiceLetter(index), choice.isCorrect)
    };
  }

  /**
   * Format letter badge
   * @param {string} letter - Letter (A, B, C, etc.)
   * @param {boolean} isCorrect - Whether choice is correct
   * @returns {string} Badge HTML
   */
  formatLetterBadge(letter, isCorrect) {
    const badgeClass = isCorrect === true ? 'status-success' : 'status-primary';
    return `<span class="status-badge ${badgeClass}">${letter}</span>`;
  }

  /**
   * Build query parameters for filtering
   * @param {Object} filters - Filter criteria
   * @returns {Object} Query parameters
   */
  buildQueryParams(filters) {
    const params = {};
    
    if (filters.choiceText) params.choiceText = filters.choiceText.trim();
    if (filters.questionId) params.questionId = parseInt(filters.questionId);
    if (filters.isCorrect !== undefined && filters.isCorrect !== '') {
      params.isCorrect = filters.isCorrect === 'true';
    }
    if (filters.orderBy) params.orderBy = filters.orderBy;
    if (filters.orderDirection) params.orderDirection = filters.orderDirection;
    if (filters.page) params.page = parseInt(filters.page);
    if (filters.size) params.size = parseInt(filters.size);
    
    return params;
  }

  /**
   * Create multiple choices for a question
   * @param {number} questionId - Question ID
   * @param {Array} choices - Array of choice objects
   * @returns {Promise<Array>} Created choices
   */
  async createMultipleChoices(questionId, choices) {
    try {
      const results = [];
      for (const choice of choices) {
        const choiceData = {
          ...choice,
          questionId: questionId
        };
        const result = await this.create(choiceData);
        results.push(result);
      }
      return results;
    } catch (error) {
      return handleAPIError(error, 'Failed to create multiple choices');
    }
  }

  /**
   * Update multiple choices for a question
   * @param {number} questionId - Question ID
   * @param {Array} choices - Array of choice objects with IDs
   * @returns {Promise<Array>} Updated choices
   */
  async updateMultipleChoices(questionId, choices) {
    try {
      const results = [];
      for (const choice of choices) {
        if (choice.id) {
          const result = await this.update(choice.id, choice);
          results.push(result);
        }
      }
      return results;
    } catch (error) {
      return handleAPIError(error, 'Failed to update multiple choices');
    }
  }

  /**
   * Get choice options for dropdowns
   * @param {number} questionId - Question ID
   * @returns {Promise<Array>} Choice options
   */
  async getChoiceOptions(questionId) {
    try {
      const choices = await this.getChoicesByQuestion(questionId);
      return choices.content.map(choice => ({
        value: choice.id,
        label: choice.choiceText,
        isCorrect: choice.isCorrect
      }));
    } catch (error) {
      console.error('Failed to load choice options:', error);
      return [];
    }
  }

  /**
   * Get answer key for a question (correct choices)
   * @param {number} questionId - Question ID
   * @returns {Promise<Array>} Answer key
   */
  async getAnswerKey(questionId) {
    try {
      const correctChoices = await this.getCorrectChoicesByQuestion(questionId);
      return correctChoices.content.map(choice => ({
        id: choice.id,
        text: choice.choiceText,
        letter: this.getChoiceLetter(correctChoices.content.indexOf(choice))
      }));
    } catch (error) {
      return handleAPIError(error, 'Failed to load answer key');
    }
  }

  /**
   * Cache management for choices
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
const choicesAPI = new ChoicesAPI();
window.choicesAPI = choicesAPI;