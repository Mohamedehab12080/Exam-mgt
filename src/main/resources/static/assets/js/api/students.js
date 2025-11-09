// Students API Client
import './types.js'
class StudentsAPI {
  constructor() {
    this.endpoint = API_CONFIG.ENDPOINTS.STUDENTS;
  }

  /**
   * Get all students with optional filtering and pagination
   * @param {Object} params - Query parameters
   * @param {number} params.page - Page number (default: 0)
   * @param {number} params.size - Page size (default: 20)
   * @param {string} params.firstName - Filter by first name
   * @param {string} params.lastName - Filter by last name
   * @param {string} params.email - Filter by email
   * @param {string} params.city - Filter by city
   * @param {number} params.graduationYear - Filter by graduation year
   * @param {string} params.gender - Filter by gender
   * @param {number} params.minAge - Minimum age filter
   * @param {number} params.maxAge - Maximum age filter
   * @param {boolean} params.noPagination - Disable pagination
   * @param {string} params.sortBy - Sort by field (ssn, firstName, lastName, email, city, graduationYear, gender, birthdate, phone)
   * @param {string} params.sortDir - Sort direction (ASC, DESC)
   * @returns {Promise<Object>} Response data
   */
  async async getAll(params = {})  {
    try {
      const response = await api.get(this.endpoint, params);
      return handleAPIResponse(response, 'Students loaded successfully');
    } catch (error) {
      return handleAPIError(error, 'Failed to load students');
    }
  }

  /**
   * Get a single student by SSN
   * @param {string} ssn - Student SSN
   * @returns {Promise<Object>} Student data
   */
  async getById(ssn) {
    try {
      // Validate SSN format before making the API call
      if (!ssn || !/^\d{14}$/.test(ssn)) {
        console.error(`Invalid SSN format in getById: "${ssn}" (must be exactly 14 digits)`);
        throw new Error('SSN must be exactly 14 digits');
      }
      
      const response = await api.get(`${this.endpoint}/${ssn}`);
      return handleAPIResponse(response, 'Student loaded successfully');
    } catch (error) {
      return handleAPIError(error, 'Failed to load student');
    }
  }

  /**
   * Create a new student
   * @param {Object} studentData - Student data
   * @param {string} studentData.ssn - Student SSN
   * @param {string} studentData.name - Student name
   * @param {string} studentData.email - Student email
   * @param {number} studentData.age - Student age
   * @param {string} studentData.gender - Student gender
   * @param {string} studentData.city - Student city
   * @param {number} studentData.graduationYear - Graduation year
   * @returns {Promise<Object>} Created student data
   */
  async create(studentData) {
    try {
      const response = await api.post(this.endpoint, studentData);
      return handleAPIResponse(response, 'Student created successfully');
    } catch (error) {
      return handleAPIError(error, 'Failed to create student');
    }
  }

  /**
   * Update an existing student
   * @param {string} ssn - Student SSN
   * @param {Object} studentData - Updated student data
   * @returns {Promise<Object>} Updated student data
   */
  async update(ssn, studentData) {
    try {
      // Validate SSN format before making the API call
      if (!ssn || !/^\d{14}$/.test(ssn)) {
        console.error(`Invalid SSN format in update: "${ssn}" (must be exactly 14 digits)`);
        throw new Error('SSN must be exactly 14 digits');
      }
      
      const response = await api.put(`${this.endpoint}/${ssn}`, studentData);
      return handleAPIResponse(response, 'Student updated successfully');
    } catch (error) {
      return handleAPIError(error, 'Failed to update student');
    }
  }

  /**
   * Delete a student
   * @param {string} ssn - Student SSN
   * @returns {Promise<void>}
   */
  async delete(ssn) {
    try {
      // Validate SSN format before making the API call
      if (!ssn || !/^\d{14}$/.test(ssn)) {
        console.error(`Invalid SSN format in delete: "${ssn}" (must be exactly 14 digits)`);
        throw new Error('SSN must be exactly 14 digits');
      }
      
      const response = await api.delete(`${this.endpoint}/${ssn}`);
      return handleAPIResponse(response, 'Student deleted successfully');
    } catch (error) {
      return handleAPIError(error, 'Failed to delete student');
    }
  }

  /**
   * Get students by course
   * @param {number} courseId - Course ID
   * @param {Object} params - Additional query parameters
   * @returns {Promise<Object>} Students in course
   */
  // async getByCourse(courseId, params = {}) {
  //   try {
  //     const response = await api.get(`${this.endpoint}/course/${courseId}`, params);
  //     return handleAPIResponse(response, 'Course students loaded successfully');
  //   } catch (error) {
  //     return handleAPIError(error, 'Failed to load course students');
  //   }
  // }

  /**
   * Get student statistics
   * @returns {Promise<Object>} Student statistics
   */
  async getStats() {
    try {
      const response = await api.get(`${this.endpoint}/count`);
      return handleAPIResponse(response, 'Student statistics loaded successfully');
    } catch (error) {
      return handleAPIError(error, 'Failed to load student statistics');
    }
  }

  /**
   * Check if student exists by SSN
   * @param {string} ssn - Student SSN
   * @returns {Promise<Object>} Existence check result
   */
  async existsBySsn(ssn) {
    try {
      // Validate SSN format before making the API call
      if (!ssn || !/^\d{14}$/.test(ssn)) {
        throw new Error('SSN must be exactly 14 digits');
      }
      
      const response = await api.get(`${this.endpoint}/${ssn}/exists`);
      return handleAPIResponse(response, 'Student existence checked successfully');
    } catch (error) {
      return handleAPIError(error, 'Failed to check student existence');
    }
  }

  /**
   * Get student progress information
   * @param {string} ssn - Student SSN
   * @returns {Promise<Object>} Student progress data
   */
  async getStudentProgress(ssn) {
    try {
      // Validate SSN format before making the API call
      if (!ssn || !/^\d{14}$/.test(ssn)) {
        throw new Error('SSN must be exactly 14 digits');
      }
      
      const response = await api.get(`${this.endpoint}/${ssn}/progress`);
      return handleAPIResponse(response, 'Student progress loaded successfully');
    } catch (error) {
      return handleAPIError(error, 'Failed to load student progress');
    }
  }

  /**
   * Get all students progress with filters
   * @param {Object} params - Query parameters for filtering
   * @returns {Promise<Object>} Students progress data
   */
  async getAllStudentsProgress(params = {}) {
    try {
      const response = await api.get(`${this.endpoint}/progress`, params);
      return handleAPIResponse(response, 'Students progress loaded successfully');
    } catch (error) {
      return handleAPIError(error, 'Failed to load students progress');
    }
  }

  /**
   * Get student exam history
   * @param {string} ssn - Student SSN
   * @returns {Promise<Object>} Student exam history
   */
  async getStudentExamHistory(ssn) {
    try {
      // Validate SSN format before making the API call
      if (!ssn || !/^\d{14}$/.test(ssn)) {
        throw new Error('SSN must be exactly 14 digits');
      }
      
      const response = await api.get(`${this.endpoint}/${ssn}/exam-history`);
      return handleAPIResponse(response, 'Student exam history loaded successfully');
    } catch (error) {
      return handleAPIError(error, 'Failed to load student exam history');
    }
  }

  /**
   * Count students with filters
   * @param {Object} params - Query parameters for filtering
   * @returns {Promise<Object>} Student count
   */
  async countStudents(params = {}) {
    try {
      const response = await api.get(`${this.endpoint}/count`, params);
      return handleAPIResponse(response, 'Student count loaded successfully');
    } catch (error) {
      return handleAPIError(error, 'Failed to load student count');
    }
  }

  /**
   * Validate student data
   * @param {Object} studentData - Student data to validate
   * @returns {Object} Validation result
   */
  validateStudentData(studentData) {
    const errors = {};

    // SSN validation
    if (!studentData.ssn) {
      errors.ssn = 'SSN is required';
    } else if (!/^\d{14}$/.test(studentData.ssn)) {
      errors.ssn = 'SSN must be 14 digits';
    }

    // Name validation
    if (!studentData.name) {
      errors.name = 'Name is required';
    } else if (studentData.name.length < 2) {
      errors.name = 'Name must be at least 2 characters';
    } else if (studentData.name.length > 100) {
      errors.name = 'Name must be less than 100 characters';
    }

    // Email validation
    if (!studentData.email) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(studentData.email)) {
      errors.email = 'Invalid email format';
    }

    // Age validation
    if (studentData.age === undefined || studentData.age === null) {
      errors.age = 'Age is required';
    } else if (!Number.isInteger(studentData.age) || studentData.age < 16 || studentData.age > 100) {
      errors.age = 'Age must be between 16 and 100';
    }

    // Gender validation
    if (!studentData.gender) {
      errors.gender = 'Gender is required';
    } else if (!['Male', 'Female', 'Other'].includes(studentData.gender)) {
      errors.gender = 'Gender must be Male, Female, or Other';
    }

    // City validation
    if (!studentData.city) {
      errors.city = 'City is required';
    } else if (studentData.city.length < 2) {
      errors.city = 'City must be at least 2 characters';
    } else if (studentData.city.length > 50) {
      errors.city = 'City must be less than 50 characters';
    }

    // Graduation year validation
    if (studentData.graduationYear !== undefined && studentData.graduationYear !== null) {
      const currentYear = new Date().getFullYear();
      if (!Number.isInteger(studentData.graduationYear) || 
          studentData.graduationYear < 1900 || 
          studentData.graduationYear > currentYear + 10) {
        errors.graduationYear = 'Graduation year must be between 1900 and ' + (currentYear + 10);
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  /**
   * Format student data for display
   * @param {Object} student - Raw student data
   * @returns {Object} Formatted student data
   */
  formatStudentData(student) {
    if (!student) return null;

    return {
      ...student,
      // Basic formatting
      formattedSSN: this.formatSSN(student.ssn),
      displayName: `${student.firstName} ${student.lastName}`,
      formattedGraduationYear: student.graduationYear ? student.graduationYear.toString() : 'N/A',
      formattedBirthdate: this.formatDateForDisplay(student.birthdate),
        formattedPhone: this.formatPhone(student.phone),

      // Use the calculated age from backend
      formattedAge: student.age ? `${student.age} years` : 'N/A',

      // UI elements
      initials: this.getInitials(student.firstName, student.lastName),
      emailBadge: `<span class="status-badge status-info"><i class="fas fa-envelope"></i> ${student.email}</span>`,
      cityBadge: student.city ? `<span class="status-badge status-secondary"><i class="fas fa-city"></i> ${student.city}</span>` : '',

      // Attempt statistics
      attemptCount: student.attempts ? student.attempts.length : 0,
      hasAttempts: student.attempts && student.attempts.length > 0,
      attemptsBadge: student.attempts ?
          `<span class="status-badge status-primary">${student.attempts.length} Attempts</span>` :
          '<span class="status-badge status-inactive">No Attempts</span>'
    };
  }
  /**
   * Format SSN for display (add spaces)
   * @param {string} ssn - Raw SSN
   * @returns {string} Formatted SSN
   */
  formatSSN(ssn) {
    if (!ssn || ssn.length !== 14) return ssn;
    return `${ssn.substr(0, 3)} ${ssn.substr(3, 3)} ${ssn.substr(6, 4)} ${ssn.substr(10, 4)}`;
  }

  formatPhone(phone) {
    if (!phone || phone.length !== 11) return phone;
    return `${phone.substr(0, 3)}-${phone.substr(3, 4)}-${phone.substr(7, 4)}`;
  }
  /**
   * Get initials from full name
   * @param {string} firstName  - Full name
   * @param {string} lastName
   * @returns {string} Initials
   */
  getInitials(firstName, lastName) {
    if (!firstName && !lastName) return '?';
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  }

  formatDateForDisplay(dateString) {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString + 'T00:00:00');
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
   * Build query parameters for filtering
   * @param {Object} filters - Filter criteria
   * @returns {Object} Query parameters
   */
  buildQueryParams(filters) {
    const params = {};

    // Use Swagger parameter names
    if (filters.firstName) params.firstName = filters.firstName.trim();
    if (filters.lastName) params.lastName = filters.lastName.trim();
    if (filters.email) params.email = filters.email.trim();
    if (filters.gender) params.gender = filters.gender;
    if (filters.minAge) params.minAge = parseInt(filters.minAge);
    if (filters.maxAge) params.maxAge = parseInt(filters.maxAge);
    if (filters.city) params.city = filters.city.trim();
    if (filters.graduationYear) params.graduationYear = parseInt(filters.graduationYear);

    // Use Swagger pagination parameter names
    if (filters.pageNum !== undefined) params.pageNum = parseInt(filters.pageNum);
    if (filters.pageSize !== undefined) params.pageSize = parseInt(filters.pageSize);
    if (filters.noPagination !== undefined) params.noPagination = filters.noPagination === 'true';

    // ADD sorting parameters
    if (filters.sortBy) params.sortBy = filters.sortBy;
    if (filters.sortDir) params.sortDir = filters.sortDir;

    return params;
  }
  /**
   * Cache management for students
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
const studentsAPI = new StudentsAPI();
window.studentsAPI = studentsAPI;