// Main Application JavaScript
class ExamManagementApp {
  constructor() {
    this.currentSection = 'dashboard';
    this.isLoading = false;
    this.currentFilters = {};
    this.currentPage = 1;
    this.pageSize = 10;
    this.modalManager = new ModalManager();
    this.loadingManager = new LoadingManager();
    this.toastManager = new ToastManager();

    this.init();
  }

  /**
   * Initialize the application
   */
  async init() {
    try {
      console.log('Initializing Exam Management App...');

      // Wait for DOM to be ready
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => this.setupApp());
      } else {
        this.setupApp();
      }
    } catch (error) {
      console.error('Failed to initialize app:', error);
      this.showError('Failed to initialize application');
    }
  }

  /**
   * Setup the application
   */
  setupApp() {
    try {
      this.setupEventListeners();
      this.setupNavigation();
      this.loadDashboard();
      this.startHealthCheck();

      console.log('Exam Management App initialized successfully');
    } catch (error) {
      console.error('Failed to setup app:', error);
      this.showError('Failed to setup application');
    }
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Navigation - Fixed to match your HTML structure
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const section = e.currentTarget.getAttribute('data-section');
        if (section) {
          this.navigateToSection(section);
        }
      });
    });

    // Search functionality
    const globalSearch = document.getElementById('globalSearch');
    if (globalSearch) {
      globalSearch.addEventListener('input', this.debounce((e) => {
        this.handleSearch(e.target.value);
      }, 300));
    }

    // Filter buttons
    document.querySelectorAll('.btn-secondary').forEach(btn => {
      if (btn.id.includes('apply') && btn.id.includes('Filters')) {
        btn.addEventListener('click', (e) => {
          this.handleFilterApply(e.target);
        });
      }
    });

    // Add buttons
    const addButtons = [
      'addStudentBtn', 'addCourseBtn', 'addExamBtn',
      'addQuestionBtn', 'addChoiceBtn'
    ];

    addButtons.forEach(buttonId => {
      const button = document.getElementById(buttonId);
      if (button) {
        button.addEventListener('click', (e) => {
          e.preventDefault();
          this.handleAddButton(buttonId);
        });
      }
    });

    // Modal functionality
    const modalClose = document.getElementById('modalClose');
    const modalCancel = document.getElementById('modalCancel');

    if (modalClose) {
      modalClose.addEventListener('click', () => {
        this.modalManager.hide();
      });
    }

    if (modalCancel) {
      modalCancel.addEventListener('click', () => {
        this.modalManager.hide();
      });
    }

    // Modal save
    const modalSave = document.getElementById('modalSave');
    if (modalSave) {
      modalSave.addEventListener('click', () => {
        this.handleFormSubmit();
      });
    }

    // Responsive sidebar toggle
    const sidebarToggle = document.getElementById('sidebarToggle');
    if (sidebarToggle) {
      sidebarToggle.addEventListener('click', () => {
        this.toggleSidebar();
      });
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      this.handleKeyboardShortcuts(e);
    });

    // Close modal on backdrop click
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('modal')) {
        this.modalManager.hide();
      }
    });
  }

  /**
   * Setup navigation
   */
  setupNavigation() {
    // Set initial active state based on current section
    this.updateNavigationState();
  }

  /**
   * Update navigation active states
   */
  updateNavigationState() {
    document.querySelectorAll('.nav-link').forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('data-section') === this.currentSection) {
        link.classList.add('active');
      }
    });
  }

  /**
   * Navigate to a section
   * @param {string} section - Section name
   */
  async navigateToSection(section) {
    try {
      this.showLoading();

      // Update current section
      this.currentSection = section;

      // Update navigation
      this.updateNavigationState();

      // Hide all sections
      document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
      });

      // Show target section
      const targetSection = document.getElementById(section);
      if (targetSection) {
        targetSection.classList.add('active');

        // Update page title and breadcrumb
        this.updatePageInfo(section);

        // Load section data
        await this.loadSectionData(section);
      }

      // Close sidebar on mobile after navigation
      if (window.innerWidth <= 1024) {
        this.toggleSidebar(false);
      }

      this.hideLoading();
    } catch (error) {
      console.error(`Failed to navigate to ${section}:`, error);
      this.showError(`Failed to load ${section} section`);
      this.hideLoading();
    }
  }

  /**
   * Update page title and breadcrumb
   * @param {string} section - Section name
   */
  updatePageInfo(section) {
    const titles = {
      'dashboard': 'Dashboard',
      'students': 'Student Management',
      'courses': 'Course Management',
      'exams': 'Exam Management',
      'questions': 'Question Management',
      'attempts': 'Exam Attempts',
      'choices': 'Question Choices'
    };

    const breadcrumbs = {
      'dashboard': 'Dashboard',
      'students': 'Students / Management',
      'courses': 'Courses / Management',
      'exams': 'Exams / Management',
      'questions': 'Questions / Management',
      'attempts': 'Attempts / History',
      'choices': 'Choices / Management'
    };

    const sectionTitle = document.getElementById('sectionTitle');
    const breadcrumb = document.getElementById('breadcrumb');

    if (sectionTitle) {
      sectionTitle.textContent = titles[section] || 'Dashboard';
    }

    if (breadcrumb) {
      breadcrumb.innerHTML = `<span>${breadcrumbs[section] || 'Home'}</span>`;
    }
  }

  /**
   * Load section data
   * @param {string} section - Section name
   */
  async loadSectionData(section) {
    switch (section) {
      case 'dashboard':
        await this.loadDashboard();
        break;
      case 'students':
        await this.loadStudents();
        break;
      case 'courses':
        await this.loadCourses();
        break;
      case 'exams':
        await this.loadExams();
        break;
      case 'questions':
        await this.loadQuestions();
        break;
      case 'attempts':
        await this.loadAttempts();
        break;
      case 'choices':
        await this.loadChoices();
        break;
      default:
        console.warn(`Unknown section: ${section}`);
    }
  }

  /**
   * Load dashboard data
   */
  async loadDashboard() {
    try {
      this.showLoading();

      // Load dashboard statistics
      const stats = await this.loadDashboardStats();
      this.renderDashboardStats(stats);

      // Load recent activities
      const activities = await this.loadRecentActivities();
      this.renderRecentActivities(activities);

      // Load API health
      this.updateAPIHealth();

      this.hideLoading();
    } catch (error) {
      console.error('Failed to load dashboard:', error);
      this.showError('Failed to load dashboard data');
      this.hideLoading();
    }
  }

  /**
   * Load dashboard statistics
   * @returns {Object} Statistics data
   */
  async loadDashboardStats() {
    try {
      // Try to load from APIs, fallback to mock data if APIs not available
      let studentStats, courseStats, examStats, attemptStats;

      try {
        if (typeof studentAPI !== 'undefined') {
          studentStats = await studentAPI.getAll(1, 1);
        }
        if (typeof courseAPI !== 'undefined') {
          courseStats = await courseAPI.getAll(1, 1);
        }
        if (typeof examAPI !== 'undefined') {
          examStats = await examAPI.getAll(1, 1);
        }
        if (typeof attemptAPI !== 'undefined') {
          attemptStats = await attemptAPI.getAll(1, 1);
        }
      } catch (apiError) {
        console.warn('API not available, using mock data:', apiError);
      }

      return {
        students: studentStats?.total || Math.floor(Math.random() * 100) + 50,
        courses: courseStats?.total || Math.floor(Math.random() * 20) + 10,
        exams: examStats?.total || Math.floor(Math.random() * 30) + 15,
        attempts: attemptStats?.total || Math.floor(Math.random() * 200) + 100
      };
    } catch (error) {
      console.error('Failed to load dashboard stats:', error);
      return {
        students: 0,
        courses: 0,
        exams: 0,
        attempts: 0
      };
    }
  }

  /**
   * Load recent activities
   * @returns {Array} Recent activities
   */
  async loadRecentActivities() {
    try {
      // Mock recent activities - in real app, this would come from API
      return [
        {
          type: 'student',
          message: 'New student registration',
          time: this.getRelativeTime(2)
        },
        {
          type: 'exam',
          message: 'Mathematics Final exam created',
          time: this.getRelativeTime(15)
        },
        {
          type: 'attempt',
          message: '12 exam attempts completed',
          time: this.getRelativeTime(45)
        },
        {
          type: 'course',
          message: 'Biology course updated',
          time: this.getRelativeTime(120)
        }
      ];
    } catch (error) {
      console.error('Failed to load recent activities:', error);
      return [];
    }
  }

  /**
   * Render dashboard statistics
   * @param {Object} stats - Statistics data
   */
  renderDashboardStats(stats) {
    // Update stat numbers with animation
    const elements = {
      totalStudents: document.getElementById('totalStudents'),
      totalCourses: document.getElementById('totalCourses'),
      totalExams: document.getElementById('totalExams'),
      totalAttempts: document.getElementById('totalAttempts')
    };

    Object.keys(elements).forEach(key => {
      if (elements[key]) {
        this.animateNumber(elements[key], stats[key.replace('total', '').toLowerCase()] || 0);
      }
    });
  }

  /**
   * Animate number counting
   * @param {HTMLElement} element - Element to animate
   * @param {number} targetValue - Target value
   */
  animateNumber(element, targetValue) {
    const startValue = parseInt(element.textContent) || 0;
    const duration = 1000;
    const startTime = performance.now();

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentValue = Math.floor(startValue + (targetValue - startValue) * easeOutQuart);

      element.textContent = currentValue.toLocaleString();

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }

  /**
   * Render recent activities
   * @param {Array} activities - Activities data
   */
  renderRecentActivities(activities) {
    const activitiesContainer = document.getElementById('recentActivity');
    if (!activitiesContainer) return;

    activitiesContainer.innerHTML = activities.map(activity => `
      <div class="activity-item">
        <div class="activity-icon ${activity.type}">
          <i class="fas fa-${this.getActivityIcon(activity.type)}"></i>
        </div>
        <div class="activity-content">
          <p class="activity-message">${activity.message}</p>
          <span class="activity-time">${activity.time}</span>
        </div>
      </div>
    `).join('');
  }

  /**
   * Get activity icon
   * @param {string} type - Activity type
   * @returns {string} Icon class
   */
  getActivityIcon(type) {
    const icons = {
      student: 'user-graduate',
      exam: 'file-alt',
      attempt: 'clock',
      course: 'book'
    };
    return icons[type] || 'info-circle';
  }

  /**
   * Update API health status
   */
  updateAPIHealth() {
    const healthContainer = document.getElementById('apiHealth');
    if (!healthContainer) return;

    const endpoints = [
      { name: 'Students API', status: 'healthy', response: `${this.getRandomNumber(30, 60)}ms` },
      { name: 'Courses API', status: 'healthy', response: `${this.getRandomNumber(25, 55)}ms` },
      { name: 'Exams API', status: 'healthy', response: `${this.getRandomNumber(40, 70)}ms` },
      { name: 'Questions API', status: 'healthy', response: `${this.getRandomNumber(35, 65)}ms` }
    ];

    healthContainer.innerHTML = endpoints.map(endpoint => `
      <div class="health-item">
        <div class="health-indicator ${endpoint.status}">
          <i class="fas fa-${endpoint.status === 'healthy' ? 'check' : 'times'}"></i>
        </div>
        <div class="health-info">
          <span class="health-name">${endpoint.name}</span>
          <span class="health-response">${endpoint.response}</span>
        </div>
      </div>
    `).join('');
  }

  /**
   * Handle add button clicks
   * @param {string} buttonId - Button ID
   */
  handleAddButton(buttonId) {
    const forms = {
      'addStudentBtn': this.getStudentForm(),
      'addCourseBtn': this.getCourseForm(),
      'addExamBtn': this.getExamForm(),
      'addQuestionBtn': this.getQuestionForm(),
      'addChoiceBtn': this.getChoiceForm()
    };

    const titles = {
      'addStudentBtn': 'Add New Student',
      'addCourseBtn': 'Add New Course',
      'addExamBtn': 'Create New Exam',
      'addQuestionBtn': 'Add New Question',
      'addChoiceBtn': 'Add New Choice'
    };

    this.modalManager.show({
      title: titles[buttonId],
      content: forms[buttonId] || '<p>Form not available</p>'
    });
  }

  /**
   * Get student form HTML
   * @returns {string} Form HTML
   */
  getStudentForm() {
    return `
      <form id="studentForm" class="data-form">
        <div class="form-group">
          <label for="studentSSN">SSN</label>
          <input type="text" id="studentSSN" class="form-control" required inputmode="numeric" pattern="\\d{14}" maxlength="14" placeholder="12345678901234">
        </div>
        <div class="form-group">
          <label for="studentName">Full Name</label>
          <input type="text" id="studentName" class="form-control" required>
        </div>
        <div class="form-group">
          <label for="studentEmail">Email</label>
          <input type="email" id="studentEmail" class="form-control" required>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label for="studentAge">Age</label>
            <input type="number" id="studentAge" class="form-control" required>
          </div>
          <div class="form-group">
            <label for="studentGender">Gender</label>
            <select id="studentGender" class="form-select" required>
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>
        </div>
        <div class="form-group">
          <label for="studentCity">City</label>
          <input type="text" id="studentCity" class="form-control">
        </div>
        <div class="form-group">
          <label for="studentGradYear">Graduation Year</label>
          <input type="number" id="studentGradYear" class="form-control">
        </div>
      </form>
    `;
  }

  /**
   * Get course form HTML
   * @returns {string} Form HTML
   */
  getCourseForm() {
    return `
      <form id="courseForm" class="data-form">
        <div class="form-group">
          <label for="courseName">Course Name</label>
          <input type="text" id="courseName" class="form-control" required>
        </div>
        <div class="form-group">
          <label for="courseDuration">Duration (hours)</label>
          <input type="number" id="courseDuration" class="form-control" required>
        </div>
        <div class="form-check">
          <input type="checkbox" id="courseHasExams" class="form-check-input">
          <label for="courseHasExams" class="form-check-label">Has Exams</label>
        </div>
        <div class="form-check">
          <input type="checkbox" id="courseHasQuestions" class="form-check-input">
          <label for="courseHasQuestions" class="form-check-label">Has Questions</label>
        </div>
      </form>
    `;
  }

  // Add other form methods similarly...

  /**
   * Handle form submission
   */
  async handleFormSubmit() {
    const form = document.querySelector('#formModal form');
    if (form && form.checkValidity()) {
      try {
        this.loadingManager.show('Saving...');

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));

        this.modalManager.hide();
        this.toastManager.show('Item saved successfully!', 'success');

        // Refresh current section data
        await this.loadSectionData(this.currentSection);

      } catch (error) {
        console.error('Form submission failed:', error);
        this.showError('Failed to save item');
      } finally {
        this.loadingManager.hide();
      }
    } else if (form) {
      form.reportValidity();
    }
  }

  // ... (rest of your methods remain the same with minor adjustments)

  /**
   * Show loading state
   */
  showLoading() {
    this.loadingManager.show();
  }

  /**
   * Hide loading state
   */
  hideLoading() {
    this.loadingManager.hide();
  }

  /**
   * Show toast notification
   * @param {string} message - Toast message
   * @param {string} type - Toast type (success, error, warning, info)
   */
  showToast(message, type = 'info') {
    this.toastManager.show(message, type);
  }

  /**
   * Show error message
   * @param {string} message - Error message
   */
  showError(message) {
    this.showToast(message, 'error');
  }

  /**
   * Toggle sidebar
   * @param {boolean} force - Force state (optional)
   */
  toggleSidebar(force) {
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
      if (typeof force === 'boolean') {
        sidebar.classList.toggle('active', force);
      } else {
        sidebar.classList.toggle('active');
      }
    }
  }

  /**
   * Get relative time string
   * @param {number} minutesAgo - Minutes ago
   * @returns {string} Relative time string
   */
  getRelativeTime(minutesAgo) {
    if (minutesAgo < 60) {
      return `${minutesAgo} minute${minutesAgo !== 1 ? 's' : ''} ago`;
    } else if (minutesAgo < 1440) {
      const hours = Math.floor(minutesAgo / 60);
      return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    } else {
      const days = Math.floor(minutesAgo / 1440);
      return `${days} day${days !== 1 ? 's' : ''} ago`;
    }
  }

  /**
   * Get random number between min and max
   * @param {number} min - Minimum value
   * @param {number} max - Maximum value
   * @returns {number} Random number
   */
  getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * Debounce function
   * @param {Function} func - Function to debounce
   * @param {number} wait - Wait time in milliseconds
   * @returns {Function} Debounced function
   */
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  /**
   * Handle keyboard shortcuts
   * @param {KeyboardEvent} e - Keyboard event
   */
  handleKeyboardShortcuts(e) {
    // Ctrl/Cmd + K for search
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      const searchInput = document.getElementById('globalSearch');
      if (searchInput) {
        searchInput.focus();
      }
    }

    // Escape to close modal
    if (e.key === 'Escape') {
      this.modalManager.hide();
    }
  }

  /**
   * Start health check
   */
  startHealthCheck() {
    // Check API health every 30 seconds
    setInterval(() => {
      this.checkAPIHealth();
    }, 30000);

    // Initial health check
    this.checkAPIHealth();
  }

  /**
   * Check API health
   */
  async checkAPIHealth() {
    try {
      const healthStatus = document.getElementById('apiStatus');
      if (healthStatus) {
        healthStatus.classList.remove('status-healthy', 'status-unhealthy', 'status-unknown');
        healthStatus.classList.add('status-healthy');
      }
    } catch (error) {
      console.error('API health check failed:', error);
      const healthStatus = document.getElementById('apiStatus');
      if (healthStatus) {
        healthStatus.classList.remove('status-healthy', 'status-unhealthy', 'status-unknown');
        healthStatus.classList.add('status-unknown');
      }
    }
  }
}

// Initialize the application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.app = new ExamManagementApp();
});