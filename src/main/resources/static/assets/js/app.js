// Main Application Entry Point - Enhanced with Components & Utilities
import DashboardComponent from '/dashboard.js';
import { DataTableComponent } from '/static/assets/js/components/data-table.js';
import { FormComponent } from '/static/assets/js/components/form.js';
import { ModalComponent } from '/static/assets/js/components/modal.js';

// Import utility functions
import {
  // Helper functions
  safeArrayAccess,
  isNonEmptyArray,
  normalizeApiResponse,
  extractPaginationInfo,
  debounce,
  throttle,
  generateId,
  deepClone,
  deepMerge,
  getNestedValue,
  setNestedValue,
  flattenObject,
  groupBy,
  sortBy,
  filterBySearch,
  paginate,
  waitFor,
  retry,
  randomString,
  randomNumber,
  randomColor,
  arrayToObject,
  objectToArray,
  removeDuplicates,
  chunk,
  getUrlParams,
  buildUrl,

  // Network functions
  isOnline,
  getConnectionInfo,
  request,
  jsonRequest,
  get,
  getJSON,
  post,
  postJSON,
  put,
  putJSON,
  deleteRequest,
  deleteJSON,
  uploadFile,
  downloadFile,
  createWebSocket,
  checkAPIHealth,
  addRequestInterceptor,
  addResponseInterceptor,

  // UI functions
  showToast,
  hideToast,
  showLoading,
  hideLoading,
  showConfirm,
  showAlert,
  showPrompt,
  showBanner,
  hideBanner,
  showProgress,
  hideProgress,
  scrollToElement,
  scrollToTop,
  addClassWithAnimation,
  toggleDarkMode,
  initializeDarkMode,
  getViewportDimensions,
  isElementInViewport,
  animateCounter,

  // Storage functions
  setLocalStorage,
  getLocalStorage,
  removeLocalStorage,
  clearLocalStorage,
  setSessionStorage,
  getSessionStorage,
  removeSessionStorage,
  clearSessionStorage,
  setCookie,
  getCookie,
  removeCookie,
  getAllCookies,
  setCache,
  getCache,
  removeCache,
  clearCache,
  setComplexStorage,
  getComplexStorage,
  isStorageAvailable,
  getStorageQuota,
  createStorageManager,

  // Validation functions
  isEmpty,
  isNotEmpty,
  isValidEmail,
  isValidPhone,
  isValidUrl,
  isValidDate,
  isValidNumber,
  isValidLength,
  isValidPattern,
  isValidPassword,
  isValidFile,
  isValidArray,
  validateObject,
  sanitizeHtml,
  escapeHtml,
  stripHtml,
  validateForm,
  getValidationMessage,
  isFormValid
} from '/static/assets/js/utils/index.js';

export class ExamManagementApp {
  constructor() {
    this.currentSection = 'dashboard';
    this.isLoading = false;
    this.currentFilters = {};
    this.currentPage = 1;
    this.pageSize = 10;
    this.autoRefreshInterval = null;
    this.autoRefreshEnabled = false;
    this.currentTimeRange = '7d';

    // Initialize enhanced managers with components
    this.modalManager = {
      show: (config) => {
        if (config.type === 'confirm') {
          return ModalComponent.confirm(config.content, config);
        } else if (config.type === 'prompt') {
          return ModalComponent.prompt(config.content, config.defaultValue, config);
        } else if (config.type === 'form') {
          return ModalComponent.form(config.formConfig, config);
        } else if (config.type === 'alert') {
          return ModalComponent.alert(config.content, config);
        } else {
          // Custom modal
          const modal = new ModalComponent(config);
          return modal.show();
        }
      },
      hide: () => {
        // ModalComponent handles its own hiding
      },
      loading: (message) => {
        return ModalComponent.loading(message);
      }
    };

    // Enhanced loading manager
    this.loadingManager = {
      show: (message = 'Loading...', containerId = null) => showLoading(message, containerId),
      hide: (containerId = null) => hideLoading(containerId)
    };

    // Enhanced toast manager
    this.toastManager = {
      show: (message, type = 'info', duration = 3000) => showToast(message, type, duration),
      hide: () => hideToast()
    };

    // Dashboard component
    this.dashboardComponent = null;

    // Data table instances
    this.tableInstances = new Map();

    // Form instances
    this.formInstances = new Map();

    // Initialize dark mode
    initializeDarkMode();

    // Setup network monitoring
    this.setupNetworkMonitoring();

    this.init();
  }

  /**
   * Initialize the application with enhanced error handling
   */
  async init() {
    try {
      console.log('Initializing Exam Management App...');
      showLoading('Initializing application...');

      // Wait for DOM to be ready
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => this.setupApp());
      } else {
        await this.setupApp();
      }

      hideLoading();
    } catch (error) {
      console.error('Failed to initialize app:', error);
      this.handleError(error, 'initialization');
      hideLoading();
    }
  }

  /**
   * Setup the application with enhanced utilities
   */
  async setupApp() {
    try {
      this.setupEventListeners();
      this.setupNavigation();
      await this.loadDashboard();
      this.startHealthCheck();
      this.setupGlobalErrorHandling();

      console.log('Exam Management App initialized successfully');
      this.showToast('Application loaded successfully', 'success');
    } catch (error) {
      console.error('Failed to setup app:', error);
      this.handleError(error, 'setup');
    }
  }

  /**
   * Enhanced event listeners with utility integration
   */
  setupEventListeners() {
    // Navigation with enhanced event handling
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const section = e.currentTarget.getAttribute('data-section');
        if (section) {
          this.navigateToSection(section);
        }
      });
    });

    // Enhanced search functionality with debounce
    const globalSearch = document.getElementById('globalSearch');
    if (globalSearch) {
      globalSearch.addEventListener('input', debounce((e) => {
        this.handleSearch(e.target.value);
      }, 300));
    }

    // Filter buttons for all sections
    this.setupFilterButtons();

    // Add buttons with enhanced form handling
    this.setupAddButtons();

    // Modal functionality
    this.setupModalEvents();

    // Responsive sidebar toggle
    const sidebarToggle = document.getElementById('sidebarToggle');
    if (sidebarToggle) {
      sidebarToggle.addEventListener('click', () => {
        this.toggleSidebar();
      });
    }

    // Enhanced keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      this.handleKeyboardShortcuts(e);
    });

    // Close modal on backdrop click
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('modal')) {
        this.modalManager.hide();
      }
    });

    // Dark mode toggle
    const darkModeToggle = document.getElementById('darkModeToggle');
    if (darkModeToggle) {
      darkModeToggle.addEventListener('click', () => {
        this.toggleDarkMode();
      });
    }

    // Section-specific event listeners
    this.setupAttemptsEventListeners();
    this.setupStudentsEventListeners();
    this.setupCoursesEventListeners();
    this.setupExamsEventListeners();
    this.setupQuestionsEventListeners();
    this.setupChoicesEventListeners();
    this.setupDashboardEventListeners();

    // Network status monitoring
    window.addEventListener('online', () => this.handleOnlineStatus());
    window.addEventListener('offline', () => this.handleOfflineStatus());
  }

  /**
   * Setup network monitoring
   */
  setupNetworkMonitoring() {
    // Check network status periodically
    setInterval(() => {
      this.updateNetworkStatus();
    }, 30000);

    // Initial network status check
    this.updateNetworkStatus();
  }

  /**
   * Handle online status
   */
  handleOnlineStatus() {
    this.showToast('Connection restored', 'success');
    this.updateNetworkStatus();

    // Refresh data if auto-refresh is enabled
    if (this.autoRefreshEnabled) {
      this.refreshCurrentSection();
    }
  }

  /**
   * Handle offline status
   */
  handleOfflineStatus() {
    this.showToast('Connection lost - working offline', 'warning');
    this.updateNetworkStatus();
  }

  /**
   * Update network status display
   */
  updateNetworkStatus() {
    const networkStatus = document.getElementById('networkStatus');
    if (!networkStatus) return;

    const isConnected = isOnline();
    const connectionInfo = getConnectionInfo();

    const statusDot = networkStatus.querySelector('.status-dot');
    const statusText = networkStatus.querySelector('span:last-child');

    if (isConnected) {
      statusDot.className = 'status-dot online';
      statusText.textContent = connectionInfo.effectiveType === '4g' ? 'Online' : 'Slow Connection';
    } else {
      statusDot.className = 'status-dot error';
      statusText.textContent = 'Offline';
    }
  }

  /**
   * Setup dashboard-specific event listeners
   */
  setupDashboardEventListeners() {
    // Refresh button
    const refreshBtn = document.getElementById('refreshDashboard');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => {
        this.refreshDashboard();
      });
    }

    // Time range selector
    const timeRangeSelector = document.getElementById('timeRangeSelector');
    if (timeRangeSelector) {
      timeRangeSelector.addEventListener('change', (e) => {
        this.handleTimeRangeChange(e.target.value);
      });
    }

    // Auto-refresh toggle
    const autoRefreshToggle = document.getElementById('autoRefreshToggle');
    if (autoRefreshToggle) {
      autoRefreshToggle.addEventListener('change', (e) => {
        this.toggleAutoRefresh(e.target.checked);
      });
    }

    // Export buttons
    const exportButtons = document.querySelectorAll('[data-export]');
    exportButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const format = e.target.dataset.format || 'csv';
        const dataType = e.target.dataset.export;
        this.exportDashboardData(format, dataType);
      });
    });

    // Quick action buttons
    const quickActions = document.querySelectorAll('.quick-action');
    quickActions.forEach(action => {
      action.addEventListener('click', (e) => {
        const actionType = e.target.dataset.action;
        this.handleQuickAction(actionType);
      });
    });
  }

  /**
   * Setup filter buttons for all sections
   */
  setupFilterButtons() {
    const filterSections = ['students', 'courses', 'exams', 'questions', 'attempts', 'choices'];

    filterSections.forEach(section => {
      const applyBtn = document.getElementById(`apply${this.capitalizeFirst(section)}Filters`);
      const clearBtn = document.getElementById(`clear${this.capitalizeFirst(section)}Filters`);

      if (applyBtn) {
        applyBtn.addEventListener('click', () => {
          this.currentPage = 1;
          this[`load${this.capitalizeFirst(section)}`]();
        });
      }

      if (clearBtn) {
        clearBtn.addEventListener('click', () => {
          this[`clear${this.capitalizeFirst(section)}Filters`]();
        });
      }
    });
  }

  /**
   * Setup add buttons for all sections
   */
  setupAddButtons() {
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
  }

  /**
   * Setup modal events
   */
  setupModalEvents() {
    // These will be handled by your ModalComponent
    // Adding fallback for basic functionality
    const modalClose = document.querySelector('.modal-close, #modalClose');
    const modalCancel = document.querySelector('.modal-cancel, #modalCancel');
    const modalSave = document.querySelector('.modal-save, #modalSave');

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

    if (modalSave) {
      modalSave.addEventListener('click', () => {
        this.handleFormSubmit();
      });
    }
  }

  /**
   * Setup attempts-specific event listeners
   */
  setupAttemptsEventListeners() {
    // Refresh button
    const refreshBtn = document.getElementById('refreshAttempts');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => {
        this.loadAttempts();
      });
    }

    // Export button
    const exportBtn = document.getElementById('exportAttempts');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        this.exportAttempts();
      });
    }

    // Enter key in search fields
    const searchFields = ['attemptStudentSsn', 'attemptExamId'];
    searchFields.forEach(fieldId => {
      const field = document.getElementById(fieldId);
      if (field) {
        field.addEventListener('keypress', (e) => {
          if (e.key === 'Enter') {
            this.currentPage = 1;
            this.loadAttempts();
          }
        });
      }
    });
  }

  /**
   * Setup students-specific event listeners
   */
  setupStudentsEventListeners() {
    const exportBtn = document.getElementById('exportStudents');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        this.exportStudents();
      });
    }
  }

  /**
   * Setup courses-specific event listeners
   */
  setupCoursesEventListeners() {
    const exportBtn = document.getElementById('exportCourses');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        this.exportCourses();
      });
    }
  }

  /**
   * Setup exams-specific event listeners
   */
  setupExamsEventListeners() {
    const exportBtn = document.getElementById('exportExams');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        this.exportExams();
      });
    }
  }

  /**
   * Setup questions-specific event listeners
   */
  setupQuestionsEventListeners() {
    const exportBtn = document.getElementById('exportQuestions');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        this.exportQuestions();
      });
    }
  }

  /**
   * Setup choices-specific event listeners
   */
  setupChoicesEventListeners() {
    const exportBtn = document.getElementById('exportChoices');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        this.exportChoices();
      });
    }
  }

  /**
   * Setup navigation
   */
  setupNavigation() {
    // Set initial active state based on current section
    this.updateNavigationState();
  }

  /**
   * Navigate to a section
   * @param {string} section - Section name
   */
  async navigateToSection(section) {
    try {
      this.showLoading(`Loading ${section}...`);

      // Cleanup previous section resources
      this.cleanupSectionResources();

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
   * Cleanup section resources
   */
  cleanupSectionResources() {
    // Cleanup dashboard resources when navigating away
    if (this.currentSection === 'dashboard' && this.dashboardComponent) {
      this.dashboardComponent.destroy();
      this.dashboardComponent = null;
    }

    // Stop any ongoing processes
    this.stopAutoRefresh();
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
   * Enhanced dashboard loading with DashboardComponent integration
   */
  async loadDashboard() {
    try {
      this.showLoading('Loading dashboard...');

      // Initialize DashboardComponent if not already initialized
      if (!this.dashboardComponent) {
        try {
          this.dashboardComponent = new DashboardComponent();
          console.log('DashboardComponent initialized successfully');
        } catch (error) {
          console.error('Failed to initialize DashboardComponent:', error);
          this.dashboardComponent = null;
        }
      }

      // Load dashboard data using the DashboardComponent
      if (this.dashboardComponent) {
        await this.dashboardComponent.loadDashboardData();
      } else {
        // Fallback to basic dashboard
        await this.loadBasicDashboard();
      }

      // Update dashboard-specific UI elements
      this.updateDashboardUI();

      this.hideLoading();
    } catch (error) {
      console.error('Failed to load dashboard:', error);
      this.handleError(error, 'dashboard loading');
      this.hideLoading();
    }
  }

  /**
   * Basic dashboard fallback
   */
  async loadBasicDashboard() {
    try {
      // Load basic statistics
      const stats = await this.loadDashboardStats();
      this.renderBasicStats(stats);

      // Load recent activities
      const activities = await this.loadRecentActivities();
      this.renderRecentActivities(activities);

      // Update API health
      this.updateAPIHealth();

    } catch (error) {
      console.error('Failed to load basic dashboard:', error);
      throw error;
    }
  }

  /**
   * Load dashboard statistics
   * @returns {Object} Statistics data
   */
  async loadDashboardStats(params = {}) {
    try {
      let studentStats, courseStats, examStats, attemptStats;

      // Use the actual APIs with proper error handling
      if (window.studentsAPI && typeof window.studentsAPI.getStats === 'function') {
        studentStats = await window.studentsAPI.getStats();
      }

      if (window.coursesAPI && typeof window.coursesAPI.getStats === 'function') {
        courseStats = await window.coursesAPI.getStats();
      }

      if (window.examsAPI && typeof window.examsAPI.getStats === 'function') {
        examStats = await window.examsAPI.getStats();
      }

      if (window.attemptsAPI && typeof window.attemptsAPI.countAttempts === 'function') {
        attemptStats = await window.attemptsAPI.countAttempts();
      }

      return {
        students: studentStats?.data || studentStats?.total || 0,
        courses: courseStats?.data || courseStats?.total || 0,
        exams: examStats?.data || examStats?.total || 0,
        attempts: attemptStats?.data || attemptStats?.total || 0
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
   * Render basic statistics
   * @param {Object} stats - Statistics data
   */
  renderBasicStats(stats) {
    const statsContainer = document.getElementById('dashboard-stats');
    if (!statsContainer) return;

    statsContainer.innerHTML = `
      <div class="stat-card">
        <div class="stat-icon students">
          <i class="fas fa-user-graduate"></i>
        </div>
        <div class="stat-info">
          <h3>Total Students</h3>
          <p class="stat-number">${stats.students || 0}</p>
          <span class="stat-change positive">+12%</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon courses">
          <i class="fas fa-book"></i>
        </div>
        <div class="stat-info">
          <h3>Active Courses</h3>
          <p class="stat-number">${stats.courses || 0}</p>
          <span class="stat-change positive">+8%</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon exams">
          <i class="fas fa-file-alt"></i>
        </div>
        <div class="stat-info">
          <h3>Total Exams</h3>
          <p class="stat-number">${stats.exams || 0}</p>
          <span class="stat-change neutral">+5%</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon attempts">
          <i class="fas fa-clock"></i>
        </div>
        <div class="stat-info">
          <h3>Exam Attempts</h3>
          <p class="stat-number">${stats.attempts || 0}</p>
          <span class="stat-change positive">+15%</span>
        </div>
      </div>
    `;
  }

  /**
   * Render recent activities
   * @param {Array} activities - Activities data
   */
  renderRecentActivities(activities) {
    const activitiesContainer = document.getElementById('recent-activities');
    if (!activitiesContainer) return;

    if (activities.length === 0) {
      activitiesContainer.innerHTML = '<div class="no-activities">No recent activities</div>';
      return;
    }

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
    const apiStatusElement = document.getElementById('apiStatus');
    if (!apiStatusElement) return;

    // Check if APIs are available
    const apis = ['studentsAPI', 'coursesAPI', 'examsAPI', 'questionsAPI', 'choicesAPI', 'attemptsAPI'];
    const allApisAvailable = apis.every(api => window[api] !== undefined);

    const statusDot = apiStatusElement.querySelector('.status-dot');
    const statusText = apiStatusElement.querySelector('span:last-child');

    if (allApisAvailable) {
      statusDot.className = 'status-dot online';
      statusText.textContent = 'All Systems Online';
    } else {
      statusDot.className = 'status-dot error';
      statusText.textContent = 'API Issues Detected';
    }
  }

  /**
   * Update dashboard UI elements
   */
  updateDashboardUI() {
    // Update time range selector to match dashboard component
    const timeRangeSelector = document.getElementById('timeRangeSelector');
    if (timeRangeSelector && this.dashboardComponent) {
      timeRangeSelector.value = this.dashboardComponent.currentTimeRange;
    }

    // Update auto-refresh toggle
    const autoRefreshToggle = document.getElementById('autoRefreshToggle');
    if (autoRefreshToggle && this.dashboardComponent) {
      autoRefreshToggle.checked = this.dashboardComponent.autoRefreshEnabled;
    }

    // Render network status
    this.renderNetworkStatus();
  }

  /**
   * Render network status from dashboard component
   */
  renderNetworkStatus() {
    if (!this.dashboardComponent) return;

    const networkStatus = this.dashboardComponent.getNetworkStatus();
    const statusElement = document.getElementById('networkStatus');

    if (statusElement) {
      const statusDot = statusElement.querySelector('.status-dot');
      const statusText = statusElement.querySelector('span:last-child');

      if (networkStatus.online) {
        statusDot.className = 'status-dot online';
        statusText.textContent = networkStatus.apiHealth === 'healthy' ? 'All Systems Online' : 'API Issues';
      } else {
        statusDot.className = 'status-dot error';
        statusText.textContent = 'Offline';
      }
    }
  }

  /**
   * Enhanced refresh dashboard using DashboardComponent
   */
  async refreshDashboard() {
    try {
      if (this.dashboardComponent) {
        await this.dashboardComponent.refreshDashboard();
      } else {
        await this.loadDashboard();
      }
    } catch (error) {
      console.error('Failed to refresh dashboard:', error);
      this.showError('Failed to refresh dashboard');
    }
  }

  /**
   * Handle time range change with DashboardComponent integration
   */
  async handleTimeRangeChange(range) {
    try {
      if (this.dashboardComponent) {
        await this.dashboardComponent.changeTimeRange(range);
      } else {
        // Fallback to basic time range change
        this.currentTimeRange = range;
        localStorage.setItem('timeRange', range);
        await this.loadDashboard();
      }
    } catch (error) {
      console.error('Failed to change time range:', error);
      this.showError('Failed to change time range');
    }
  }

  /**
   * Toggle auto-refresh with DashboardComponent integration
   */
  toggleAutoRefresh(enabled) {
    if (this.dashboardComponent) {
      this.dashboardComponent.toggleAutoRefresh(enabled);
    } else {
      // Basic auto-refresh implementation
      this.autoRefreshEnabled = enabled;
      localStorage.setItem('autoRefresh', enabled);

      if (enabled) {
        this.autoRefreshInterval = setInterval(() => {
          this.refreshDashboard();
        }, 30000);
        this.showToast('Auto-refresh enabled', 'success');
      } else {
        this.stopAutoRefresh();
        this.showToast('Auto-refresh disabled', 'info');
      }
    }
  }

  /**
   * Stop auto refresh
   */
  stopAutoRefresh() {
    if (this.autoRefreshInterval) {
      clearInterval(this.autoRefreshInterval);
      this.autoRefreshInterval = null;
    }
  }

  /**
   * Enhanced search functionality with DashboardComponent integration
   */
  handleSearch(query) {
    if (this.dashboardComponent) {
      this.dashboardComponent.handleSearch(query);
    } else {
      // Basic search implementation
      this.performGlobalSearch(query);
    }
  }

  /**
   * Export data using DashboardComponent
   */
  async exportDashboardData(format, dataType) {
    try {
      if (this.dashboardComponent) {
        await this.dashboardComponent.exportData(format, dataType);
      } else {
        this.showToast('Export functionality requires dashboard component', 'warning');
      }
    } catch (error) {
      console.error('Export failed:', error);
      this.showError('Failed to export data');
    }
  }

  /**
   * Handle quick actions from dashboard
   */
  handleQuickAction(actionType) {
    switch (actionType) {
      case 'add-student':
        this.showStudentForm();
        break;
      case 'create-exam':
        this.showExamForm();
        break;
      case 'add-question':
        this.showQuestionForm();
        break;
      case 'view-reports':
        this.exportDashboardData('pdf', 'reports');
        break;
      default:
        console.warn('Unknown quick action:', actionType);
    }
  }

  /**
   * Enhanced table rendering with DataTableComponent
   */
  renderEnhancedTable(containerId, data, columns, options = {}) {
    const container = document.getElementById(containerId);
    if (!container) {
      console.error(`Container not found: ${containerId}`);
      return null;
    }

    const tableId = `${containerId}Table`;

    try {
      if (!this.tableInstances.has(tableId)) {
        const tableOptions = {
          pageSize: this.pageSize,
          sortable: true,
          searchable: true,
          filterable: true,
          exportable: true,
          bulkActions: true,
          responsive: true,
          storageKey: `${containerId}_prefs`,
          ...options
        };

        const tableInstance = new DataTableComponent(containerId, tableOptions);
        this.tableInstances.set(tableId, tableInstance);

        // Set up event listeners for table actions
        container.addEventListener('table:rowEdit', (e) => {
          this.handleTableRowEdit(containerId, e.detail);
        });

        container.addEventListener('table:rowDelete', (e) => {
          this.handleTableRowDelete(containerId, e.detail);
        });

        container.addEventListener('table:rowView', (e) => {
          this.handleTableRowView(containerId, e.detail);
        });

        console.log(`DataTable initialized: ${tableId}`);
      }

      const tableInstance = this.tableInstances.get(tableId);
      if (tableInstance) {
        tableInstance.setData(data, columns);
        return tableInstance;
      }
    } catch (error) {
      console.error(`Failed to initialize table ${tableId}:`, error);
      this.handleError(error, `table initialization: ${containerId}`);
    }

    return null;
  }

  /**
   * Enhanced form handling with FormComponent
   */
  async showEnhancedForm(formConfig, modalConfig = {}) {
    try {
      const result = await ModalComponent.form(formConfig, modalConfig);

      if (result) {
        // Refresh the relevant section
        await this.refreshCurrentSection();
        return result;
      }
    } catch (error) {
      console.error('Form operation failed:', error);
      this.handleError(error, 'form operation');
    }

    return null;
  }

  /**
   * Handle table row edit
   */
  handleTableRowEdit(tableType, detail) {
    const { rowId, rowData } = detail;

    switch (tableType) {
      case 'studentsTableContainer':
        this.editStudent(rowData.ssn);
        break;
      case 'coursesTableContainer':
        this.editCourse(rowData.courseId);
        break;
      case 'examsTableContainer':
        this.editExam(rowData.examId);
        break;
      case 'questionsTableContainer':
        this.editQuestion(rowData.questionId);
        break;
      case 'choicesTableContainer':
        this.editChoice(rowData.choiceId);
        break;
      default:
        console.warn('Unknown table type for edit:', tableType);
    }
  }

  /**
   * Handle table row delete
   */
  handleTableRowDelete(tableType, detail) {
    const { rowId, rowData } = detail;

    switch (tableType) {
      case 'studentsTableContainer':
        this.deleteStudent(rowData.ssn);
        break;
      case 'coursesTableContainer':
        this.deleteCourse(rowData.courseId);
        break;
      case 'examsTableContainer':
        this.deleteExam(rowData.examId);
        break;
      case 'questionsTableContainer':
        this.deleteQuestion(rowData.questionId);
        break;
      case 'choicesTableContainer':
        this.deleteChoice(rowData.choiceId);
        break;
      default:
        console.warn('Unknown table type for delete:', tableType);
    }
  }

  /**
   * Handle table row view
   */
  handleTableRowView(tableType, detail) {
    const { rowId, rowData } = detail;

    switch (tableType) {
      case 'attemptsTableContainer':
        this.viewAttempt(rowData.attemptId);
        break;
      default:
        console.log('View details for:', rowData);
    }
  }
// Email validation
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

// SSN validation (already defined but included for completeness)
  isValidSSN(ssn) {
    return /^\d{14}$/.test(ssn);
  }

// Phone validation
  isValidPhone(phone) {
    return /^\d{11}$/.test(phone);
  }

// Date validation for birthdate
  isValidBirthdate(date) {
    const birthDate = new Date(date);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    return age >= 16 && age <= 100;
  }
  /**
   * Enhanced student management methods
   */
  getStudentFormFields() {
    return [
      {
        name: 'ssn',
        label: 'SSN',
        type: 'text',
        required: true,
        pattern: '^\\d{14}$',
        validate: (value) => /^\d{14}$/.test(value) ? true : 'Please enter a valid 14-digit SSN',
        placeholder: 'Enter 14-digit SSN',
        maxLength: 14
      },
      {
        name: 'firstName',
        label: 'First Name',
        type: 'text',
        required: true,
        maxLength: 50,
        placeholder: 'Enter first name'
      },
      {
        name: 'lastName',
        label: 'Last Name',
        type: 'text',
        required: true,
        maxLength: 50,
        placeholder: 'Enter last name'
      },
      {
        name: 'gender',
        label: 'Gender',
        type: 'select',
        required: true,
        options: [
          { label: 'Male', value: 'M' },
          { label: 'Female', value: 'F' },
          { label: 'Other', value: 'O' }
        ],
        placeholder: 'Select gender',
        maxLength: 10
      },
      {
        name: 'birthdate',
        label: 'Birthdate',
        type: 'date',
        required: true,
        validate: (value) => {
          const birthDate = new Date(value);
          const today = new Date();
          const age = today.getFullYear() - birthDate.getFullYear();
          return age >= 16 && age <= 100 ? true : 'Age must be between 16 and 100 years';
        }
      },
      {
        name: 'email',
        label: 'Email',
        type: 'email',
        required: true,
        maxLength: 100,
        placeholder: 'Enter email address',
        validate: (value) => isValidEmail(value) ? true : 'Please enter a valid email address'
      },
      {
        name: 'phone',
        label: 'Phone',
        type: 'tel',
        required: true,
        pattern: '^\\d{11}$',
        placeholder: 'Enter 11-digit phone number',
        maxLength: 11,
        validate: (value) => /^\d{11}$/.test(value) ? true : 'Please enter a valid 11-digit phone number'
      },
      {
        name: 'graduationYear',
        label: 'Graduation Year',
        type: 'number',
        required: true,
        min: 2000,
        max: 2030,
        placeholder: 'Enter graduation year (2000-2030)'
      },
      {
        name: 'city',
        label: 'City',
        type: 'text',
        maxLength: 50,
        placeholder: 'Enter city'
      }
    ];
  }
  getCourseFormFields() {
    return [
      {
        name: 'courseName',
        label: 'Course Name',
        type: 'text',
        required: true,
        maxLength: 100,
        placeholder: 'Enter course name'
      },
      {
        name: 'duration',
        label: 'Duration (hours)',
        type: 'number',
        required: true,
        min: 1,
        step: 0.5,
        placeholder: 'Enter course duration in hours'
      }
    ];
  }
  getExamFormFields() {
    return [
      {
        name: 'title',
        label: 'Exam Title',
        type: 'text',
        required: true,
        placeholder: 'Enter exam title'
      },
      {
        name: 'courseId',
        label: 'Course',
        type: 'select',
        required: true,
        options: this.getCourseOptions(),
        placeholder: 'Select course',
        validate: (value) => value ? true : 'Please select a course'
      },
      {
        name: 'duration',
        label: 'Duration (minutes)',
        type: 'number',
        required: true,
        min: 11,
        placeholder: 'Enter exam duration in minutes (minimum 11)'
      },
      {
        name: 'numMcq',
        label: 'Number of MCQ Questions',
        type: 'number',
        required: true,
        min: 1,
        placeholder: 'Enter number of multiple choice questions'
      },
      {
        name: 'numTf',
        label: 'Number of True/False Questions',
        type: 'number',
        required: true,
        min: 1,
        placeholder: 'Enter number of true/false questions'
      }
    ];
  }
  getQuestionFormFields() {
    return [
      {
        name: 'questionText',
        label: 'Question Text',
        type: 'textarea',
        required: true,
        maxLength: 300,
        placeholder: 'Enter question text (max 300 characters)',
        rows: 4
      },
      {
        name: 'type',
        label: 'Question Type',
        type: 'select',
        required: true,
        options: [
          { label: 'Multiple Choice (MCQ)', value: 'MCQ' },
          { label: 'True/False', value: 'T/F' }
        ],
        placeholder: 'Select question type'
      },
      {
        name: 'courseId',
        label: 'Course',
        type: 'select',
        required: true,
        options: this.getCourseOptions(),
        placeholder: 'Select course',
        validate: (value) => value ? true : 'Please select a course'
      }
    ];
  }
  getChoiceFormFields() {
    return [
      {
        name: 'questionId',
        label: 'Question',
        type: 'select',
        required: true,
        options: this.getQuestionOptions(),
        placeholder: 'Select question',
        validate: (value) => value ? true : 'Please select a question'
      },
      {
        name: 'choiceText',
        label: 'Choice Text',
        type: 'text',
        required: true,
        maxLength: 300,
        placeholder: 'Enter choice text (max 300 characters)'
      },
      {
        name: 'isCorrect',
        label: 'Is Correct Answer',
        type: 'checkbox',
        defaultValue: false
      }
    ];
  }
  getExamSubmissionFormFields() {
    return [
      {
        name: 'ssn',
        label: 'Student SSN',
        type: 'text',
        required: true,
        pattern: '^\\d{14}$',
        placeholder: 'Enter your 14-digit SSN',
        validate: (value) => /^\d{14}$/.test(value) ? true : 'Please enter a valid 14-digit SSN'
      },
      {
        name: 'examId',
        label: 'Exam',
        type: 'select',
        required: true,
        options: this.getAvailableExamOptions(),
        placeholder: 'Select exam to take',
        validate: (value) => value ? true : 'Please select an exam'
      }
      // Answers would be dynamically generated based on selected exam
    ];
  }
  async getCourseOptions() {
    try {
      if (window.coursesAPI) {
        const response = await window.coursesAPI.getAll({ noPagination: true });
        const courses = normalizeApiResponse(response).data || [];
        return courses.map(course => ({
          label: course.courseName,
          value: course.courseId
        }));
      }
      return []; // Fallback empty array
    } catch (error) {
      console.error('Failed to load course options:', error);
      return [];
    }
  }
  async getQuestionOptions() {
    try {
      if (window.questionsAPI) {
        const response = await window.questionsAPI.getAll({ noPagination: true });
        const questions = normalizeApiResponse(response).data || [];
        return questions.map(question => ({
          label: `${question.questionId} - ${question.questionText.substring(0, 50)}...`,
          value: question.questionId
        }));
      }
      return []; // Fallback empty array
    } catch (error) {
      console.error('Failed to load question options:', error);
      return [];
    }
  }
  async getAvailableExamOptions() {
    try {
      if (window.examsAPI) {
        const response = await window.examsAPI.getAll();
        const exams = normalizeApiResponse(response).data || [];
        return exams.map(exam => ({
          label: `${exam.title} (${exam.courseName})`,
          value: exam.examId
        }));
      }
      return []; // Fallback empty array
    } catch (error) {
      console.error('Failed to load exam options:', error);
      return [];
    }
  }

// Student Form
  async showStudentForm(studentData = null) {
    const formConfig = {
      apiService: 'students',
      apiMethod: studentData ? 'update' : 'create',
      entityId: studentData?.ssn,
      fields: this.getStudentFormFields(),
      successMessage: studentData ? 'Student updated successfully' : 'Student created successfully'
    };

    const modalConfig = {
      title: studentData ? 'Edit Student' : 'Add New Student',
      initialData: studentData,
      size: 'lg'
    };

    return await this.showEnhancedForm(formConfig, modalConfig);
  }

// Course Form
  async showCourseForm(courseData = null) {
    const formConfig = {
      apiService: 'courses',
      apiMethod: courseData ? 'update' : 'create',
      entityId: courseData?.courseId,
      fields: this.getCourseFormFields(),
      successMessage: courseData ? 'Course updated successfully' : 'Course created successfully'
    };

    const modalConfig = {
      title: courseData ? 'Edit Course' : 'Add New Course',
      initialData: courseData,
      size: 'md'
    };

    return await this.showEnhancedForm(formConfig, modalConfig);
  }

// Exam Form
  async showExamForm(examData = null) {
    const formConfig = {
      apiService: 'exams',
      apiMethod: examData ? 'update' : 'create',
      entityId: examData?.examId,
      fields: this.getExamFormFields(),
      successMessage: examData ? 'Exam updated successfully' : 'Exam created successfully'
    };

    const modalConfig = {
      title: examData ? 'Edit Exam' : 'Add New Exam',
      initialData: examData,
      size: 'lg'
    };

    return await this.showEnhancedForm(formConfig, modalConfig);
  }

// Question Form
  async showQuestionForm(questionData = null) {
    const formConfig = {
      apiService: 'questions',
      apiMethod: questionData ? 'update' : 'create',
      entityId: questionData?.questionId,
      fields: this.getQuestionFormFields(),
      successMessage: questionData ? 'Question updated successfully' : 'Question created successfully'
    };

    const modalConfig = {
      title: questionData ? 'Edit Question' : 'Add New Question',
      initialData: questionData,
      size: 'lg'
    };

    return await this.showEnhancedForm(formConfig, modalConfig);
  }

// Choice Form
  async showChoiceForm(choiceData = null) {
    const formConfig = {
      apiService: 'choices',
      apiMethod: choiceData ? 'update' : 'create',
      entityId: choiceData?.choiceId,
      fields: this.getChoiceFormFields(),
      successMessage: choiceData ? 'Choice updated successfully' : 'Choice created successfully'
    };

    const modalConfig = {
      title: choiceData ? 'Edit Choice' : 'Add New Choice',
      initialData: choiceData,
      size: 'md'
    };

    return await this.showEnhancedForm(formConfig, modalConfig);
  }
  async editStudent(ssn) {
    try {
      this.showLoading('Loading student data...');
      const student = await window.studentsAPI.getById(ssn);
      await this.showStudentForm(student);
    } catch (error) {
      this.handleError(error, 'loading student');
    } finally {
      this.hideLoading();
    }
  }
  async editCourse(courseId) {
    try {
      this.showLoading('Loading course data...');
      const course = await window.coursesAPI.getById(courseId);
      await this.showCourseForm(course);
    } catch (error) {
      this.handleError(error, 'loading course');
    } finally {
      this.hideLoading();
    }
  }
  async editExam(examId) {
    try {
      this.showLoading('Loading exam data...');
      const exam = await window.examsAPI.getById(examId);
      await this.showExamForm(exam);
    } catch (error) {
      this.handleError(error, 'loading exam');
    } finally {
      this.hideLoading();
    }
  }
  async editQuestion(questionId) {
    try {
      this.showLoading('Loading question data...');
      const question = await window.questionsAPI.getById(questionId);
      await this.showQuestionForm(question);
    } catch (error) {
      this.handleError(error, 'loading question');
    } finally {
      this.hideLoading();
    }
  }
  async editChoice(choiceId) {
    try {
      this.showLoading('Loading choice data...');
      const choice = await window.choicesAPI.getById(choiceId);
      await this.showChoiceForm(choice);
    } catch (error) {
      this.handleError(error, 'loading choice');
    } finally {
      this.hideLoading();
    }
  }

  async deleteStudent(ssn) {
    const confirmed = await showConfirm(
        'Delete Student',
        'Are you sure you want to delete this student? This action cannot be undone.',
        'Delete',
        'Cancel'
    );

    if (confirmed) {
      try {
        this.showLoading('Deleting student...');
        await window.studentsAPI.delete(ssn);
        this.showToast('Student deleted successfully', 'success');
        await this.loadStudents();
      } catch (error) {
        this.handleError(error, 'deleting student');
      } finally {
        this.hideLoading();
      }
    }
  }

  /**
   * Enhanced students data loading
   */
  async loadStudents() {
    try {
      this.showLoading('Loading students...');

      if (!window.studentsAPI) {
        throw new Error('Students API not available');
      }

      const filters = this.getStudentFilters();
      const response = await retry(() => window.studentsAPI.getAll(filters), 3, 1000);

      const normalizedResponse = normalizeApiResponse(response);

      if (!normalizedResponse.success) {
        throw new Error(normalizedResponse.message || 'Failed to load students');
      }

      const students = safeArrayAccess(normalizedResponse.data?.content, 0, []) || normalizedResponse.data || [];
      const totalElements = normalizedResponse.data?.totalElements || students.length;

      // Define columns for DataTable
      const columns = [
        { key: 'ssn', title: 'SSN', sortable: true, searchable: true },
        { key: 'firstName', title: 'First Name', sortable: true, searchable: true },
        { key: 'lastName', title: 'Last Name', sortable: true, searchable: true },
        { key: 'email', title: 'Email', type: 'email', searchable: true },
        { key: 'age', title: 'Age', type: 'number', sortable: true },
        { key: 'gender', title: 'Gender', filterable: true },
        { key: 'city', title: 'City', filterable: true, searchable: true },
        { key: 'graduationYear', title: 'Graduation Year', type: 'number', sortable: true },
        {
          key: 'actions',
          title: 'Actions',
          sortable: false,
          searchable: false,
          render: (value, row) => this.renderStudentActions(row)
        }
      ];

      // Render enhanced table
      this.renderEnhancedTable('studentsTableContainer', students, columns);

      this.updateStudentStats(students, totalElements);
      this.hideLoading();
    } catch (error) {
      console.error('Failed to load students:', error);
      this.handleError(error, 'loading students');
      this.hideLoading();
    }
  }

  renderStudentActions(student) {
    return `
      <div class="action-buttons">
        <button class="btn btn-sm btn-primary" onclick="app.editStudent('${student.ssn}')" title="Edit">
          <i class="fas fa-edit"></i>
        </button>
        <button class="btn btn-sm btn-danger" onclick="app.deleteStudent('${student.ssn}')" title="Delete">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    `;
  }

  /**
   * Get student filters from UI
   * @returns {Object} Filters object
   */
  getStudentFilters() {
    return {
      firstName: document.getElementById('studentSearch')?.value || '',
      gender: document.getElementById('studentGenderFilter')?.value || '',
      minAge: document.getElementById('studentMinAge')?.value || '',
      maxAge: document.getElementById('studentMaxAge')?.value || '',
      graduationYear: document.getElementById('studentGraduationYear')?.value || '',
      page: this.currentPage - 1,
      size: this.pageSize,
      sortBy: document.getElementById('studentSortBy')?.value || 'firstName',
      sortDir: document.getElementById('studentSortDir')?.value || 'ASC'
    };
  }

  /**
   * Clear student filters
   */
  clearStudentFilters() {
    document.getElementById('studentSearch').value = '';
    document.getElementById('studentGenderFilter').value = '';
    document.getElementById('studentMinAge').value = '';
    document.getElementById('studentMaxAge').value = '';
    document.getElementById('studentGraduationYear').value = '';
    document.getElementById('studentSortBy').value = 'firstName';
    document.getElementById('studentSortDir').value = 'ASC';

    this.currentPage = 1;
    this.loadStudents();
  }

  /**
   * Load courses data
   */
  async loadCourses() {
    try {
      this.showLoading('Loading courses...');

      if (!window.coursesAPI) {
        throw new Error('Courses API not available');
      }

      const filters = this.getCourseFilters();
      const response = await retry(() => window.coursesAPI.getAll(filters), 3, 1000);

      const normalizedResponse = normalizeApiResponse(response);

      if (!normalizedResponse.success) {
        throw new Error(normalizedResponse.message || 'Failed to load courses');
      }

      const courses = safeArrayAccess(normalizedResponse.data?.content, 0, []) || normalizedResponse.data || [];
      const totalElements = normalizedResponse.data?.totalElements || courses.length;

      // Define columns for DataTable
      const columns = [
        { key: 'courseId', title: 'ID', sortable: true },
        { key: 'courseName', title: 'Course Name', sortable: true, searchable: true },
        { key: 'duration', title: 'Duration', sortable: true },
        { key: 'examCount', title: 'Exams', type: 'number', sortable: true },
        { key: 'questionCount', title: 'Questions', type: 'number', sortable: true },
        {
          key: 'actions',
          title: 'Actions',
          sortable: false,
          searchable: false,
          render: (value, row) => this.renderCourseActions(row)
        }
      ];

      // Render enhanced table
      this.renderEnhancedTable('coursesTableContainer', courses, columns);

      this.updateCourseStats(courses, totalElements);
      this.hideLoading();
    } catch (error) {
      console.error('Failed to load courses:', error);
      this.handleError(error, 'loading courses');
      this.hideLoading();
    }
  }

  renderCourseActions(course) {
    return `
      <div class="action-buttons">
        <button class="btn btn-sm btn-primary" onclick="app.editCourse('${course.courseId}')" title="Edit">
          <i class="fas fa-edit"></i>
        </button>
        <button class="btn btn-sm btn-danger" onclick="app.deleteCourse('${course.courseId}')" title="Delete">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    `;
  }

  /**
   * Get course filters from UI
   * @returns {Object} Filters object
   */
  getCourseFilters() {
    return {
      courseName: document.getElementById('courseSearch')?.value || '',
      minDuration: document.getElementById('courseMinDuration')?.value || '',
      maxDuration: document.getElementById('courseMaxDuration')?.value || '',
      page: this.currentPage - 1,
      size: this.pageSize,
      sortBy: document.getElementById('courseSortBy')?.value || 'courseName',
      sortDir: document.getElementById('courseSortDir')?.value || 'ASC'
    };
  }

  /**
   * Clear course filters
   */
  clearCourseFilters() {
    document.getElementById('courseSearch').value = '';
    document.getElementById('courseMinDuration').value = '';
    document.getElementById('courseMaxDuration').value = '';
    document.getElementById('courseSortBy').value = 'courseName';
    document.getElementById('courseSortDir').value = 'ASC';

    this.currentPage = 1;
    this.loadCourses();
  }

  /**
   * Load exams data
   */
  async loadExams() {
    try {
      this.showLoading('Loading exams...');

      if (!window.examsAPI) {
        throw new Error('Exams API not available');
      }

      const filters = this.getExamFilters();
      const response = await retry(() => window.examsAPI.getAll(filters), 3, 1000);

      const normalizedResponse = normalizeApiResponse(response);

      if (!normalizedResponse.success) {
        throw new Error(normalizedResponse.message || 'Failed to load exams');
      }

      const exams = safeArrayAccess(normalizedResponse.data?.content, 0, []) || normalizedResponse.data || [];
      const totalElements = normalizedResponse.data?.totalElements || exams.length;

      // Define columns for DataTable
      const columns = [
        { key: 'examId', title: 'ID', sortable: true },
        { key: 'title', title: 'Title', sortable: true, searchable: true },
        { key: 'courseName', title: 'Course', sortable: true, searchable: true },
        { key: 'duration', title: 'Duration', sortable: true },
        { key: 'numMcq', title: 'MCQ', type: 'number', sortable: true },
        { key: 'numTf', title: 'T/F', type: 'number', sortable: true },
        { key: 'examDate', title: 'Date', sortable: true },
        {
          key: 'actions',
          title: 'Actions',
          sortable: false,
          searchable: false,
          render: (value, row) => this.renderExamActions(row)
        }
      ];

      // Render enhanced table
      this.renderEnhancedTable('examsTableContainer', exams, columns);

      this.updateExamStats(exams, totalElements);
      this.hideLoading();
    } catch (error) {
      console.error('Failed to load exams:', error);
      this.handleError(error, 'loading exams');
      this.hideLoading();
    }
  }

  renderExamActions(exam) {
    return `
      <div class="action-buttons">
        <button class="btn btn-sm btn-primary" onclick="app.editExam('${exam.examId}')" title="Edit">
          <i class="fas fa-edit"></i>
        </button>
        <button class="btn btn-sm btn-danger" onclick="app.deleteExam('${exam.examId}')" title="Delete">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    `;
  }

  /**
   * Get exam filters from UI
   * @returns {Object} Filters object
   */
  getExamFilters() {
    return {
      title: document.getElementById('examSearch')?.value || '',
      courseId: document.getElementById('examCourseFilter')?.value || '',
      examDate: document.getElementById('examDateFilter')?.value || '',
      minDuration: document.getElementById('examMinDuration')?.value || '',
      maxDuration: document.getElementById('examMaxDuration')?.value || '',
      page: this.currentPage - 1,
      size: this.pageSize,
      sortBy: document.getElementById('examSortBy')?.value || 'title',
      sortDir: document.getElementById('examSortDir')?.value || 'DESC'
    };
  }

  /**
   * Clear exam filters
   */
  clearExamFilters() {
    document.getElementById('examSearch').value = '';
    document.getElementById('examCourseFilter').value = '';
    document.getElementById('examDateFilter').value = '';
    document.getElementById('examMinDuration').value = '';
    document.getElementById('examMaxDuration').value = '';
    document.getElementById('examSortBy').value = 'title';
    document.getElementById('examSortDir').value = 'DESC';

    this.currentPage = 1;
    this.loadExams();
  }

  /**
   * Load questions data
   */
  async loadQuestions() {
    try {
      this.showLoading('Loading questions...');

      if (!window.questionsAPI) {
        throw new Error('Questions API not available');
      }

      const filters = this.getQuestionFilters();
      const response = await retry(() => window.questionsAPI.getAll(filters), 3, 1000);

      const normalizedResponse = normalizeApiResponse(response);

      if (!normalizedResponse.success) {
        throw new Error(normalizedResponse.message || 'Failed to load questions');
      }

      const questions = safeArrayAccess(normalizedResponse.data?.content, 0, []) || normalizedResponse.data || [];
      const totalElements = normalizedResponse.data?.totalElements || questions.length;

      // Define columns for DataTable
      const columns = [
        { key: 'questionId', title: 'ID', sortable: true },
        { key: 'questionText', title: 'Question Text', sortable: true, searchable: true },
        { key: 'type', title: 'Type', filterable: true },
        { key: 'courseName', title: 'Course', sortable: true, searchable: true },
        { key: 'choiceCount', title: 'Choices', type: 'number', sortable: true },
        {
          key: 'actions',
          title: 'Actions',
          sortable: false,
          searchable: false,
          render: (value, row) => this.renderQuestionActions(row)
        }
      ];

      // Render enhanced table
      this.renderEnhancedTable('questionsTableContainer', questions, columns);

      this.updateQuestionStats(questions, totalElements);
      this.hideLoading();
    } catch (error) {
      console.error('Failed to load questions:', error);
      this.handleError(error, 'loading questions');
      this.hideLoading();
    }
  }

  renderQuestionActions(question) {
    return `
      <div class="action-buttons">
        <button class="btn btn-sm btn-primary" onclick="app.editQuestion('${question.questionId}')" title="Edit">
          <i class="fas fa-edit"></i>
        </button>
        <button class="btn btn-sm btn-danger" onclick="app.deleteQuestion('${question.questionId}')" title="Delete">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    `;
  }

  /**
   * Get question filters from UI
   * @returns {Object} Filters object
   */
  getQuestionFilters() {
    return {
      questionText: document.getElementById('questionSearch')?.value || '',
      type: document.getElementById('questionTypeFilter')?.value || '',
      courseId: document.getElementById('questionCourseFilter')?.value || '',
      hasChoices: document.getElementById('questionHasChoicesFilter')?.value || '',
      page: this.currentPage - 1,
      size: this.pageSize,
      sortBy: document.getElementById('questionSortBy')?.value || 'questionText',
      sortDir: document.getElementById('questionSortDir')?.value || 'ASC'
    };
  }

  /**
   * Clear question filters
   */
  clearQuestionFilters() {
    document.getElementById('questionSearch').value = '';
    document.getElementById('questionTypeFilter').value = '';
    document.getElementById('questionCourseFilter').value = '';
    document.getElementById('questionHasChoicesFilter').value = '';
    document.getElementById('questionSortBy').value = 'questionText';
    document.getElementById('questionSortDir').value = 'ASC';

    this.currentPage = 1;
    this.loadQuestions();
  }

  /**
   * Load attempts data with Swagger-compliant parameters
   */
  async loadAttempts() {
    try {
      this.showLoading('Loading attempts...');

      if (!window.attemptsAPI) {
        throw new Error('Attempts API not available');
      }

      // Build query parameters according to Swagger spec
      const filters = this.getAttemptFilters();
      const queryParams = window.attemptsAPI.buildQueryParams ? window.attemptsAPI.buildQueryParams(filters) : filters;

      // Load attempts from API
      const response = await retry(() => window.attemptsAPI.getAll(queryParams), 3, 1000);

      const normalizedResponse = normalizeApiResponse(response);

      if (!normalizedResponse.success) {
        throw new Error(normalizedResponse.message || 'Failed to load attempts');
      }

      const attempts = safeArrayAccess(normalizedResponse.data?.content, 0, []) || normalizedResponse.data || [];
      const totalElements = normalizedResponse.data?.totalElements || attempts.length;
      const totalPages = normalizedResponse.data?.totalPages || 1;

      // Define columns for DataTable
      const columns = [
        { key: 'attemptId', title: 'Attempt ID', sortable: true },
        { key: 'studentName', title: 'Student Name', sortable: true, searchable: true },
        { key: 'studentSsn', title: 'Student SSN', searchable: true },
        { key: 'examTitle', title: 'Exam Title', sortable: true, searchable: true },
        { key: 'attemptDate', title: 'Attempt Date', sortable: true },
        { key: 'grade', title: 'Grade', type: 'number', sortable: true },
        { key: 'status', title: 'Status', filterable: true },
        {
          key: 'actions',
          title: 'Actions',
          sortable: false,
          searchable: false,
          render: (value, row) => this.renderAttemptActions(row)
        }
      ];

      // Render enhanced table
      this.renderEnhancedTable('attemptsTableContainer', attempts, columns);

      this.renderAttemptsPagination(totalPages, this.currentPage, totalElements);
      this.updateAttemptsStats(attempts, totalElements);
      this.hideLoading();
    } catch (error) {
      console.error('Failed to load attempts:', error);
      this.handleError(error, 'loading attempts');
      this.hideLoading();
    }
  }

  renderAttemptActions(attempt) {
    return `
      <div class="action-buttons">
        <button class="btn btn-sm btn-primary" onclick="app.viewAttempt('${attempt.attemptId}')" title="View Details">
          <i class="fas fa-eye"></i>
        </button>
      </div>
    `;
  }

  /**
   * Get current attempt filters from UI
   * @returns {Object} Filters object
   */
  getAttemptFilters() {
    return {
      studentSsn: document.getElementById('attemptStudentSsn')?.value || '',
      examId: document.getElementById('attemptExamId')?.value || '',
      attemptDate: document.getElementById('attemptDateFilter')?.value || '',
      sortBy: document.getElementById('attemptSortBy')?.value || 'attemptDate',
      sortDir: document.getElementById('attemptSortDir')?.value || 'DESC',
      page: this.currentPage - 1, // Swagger uses 0-based indexing
      size: this.pageSize
    };
  }

  /**
   * Clear attempt filters
   */
  clearAttemptFilters() {
    document.getElementById('attemptStudentSsn').value = '';
    document.getElementById('attemptExamId').value = '';
    document.getElementById('attemptDateFilter').value = '';
    document.getElementById('attemptSortBy').value = 'attemptDate';
    document.getElementById('attemptSortDir').value = 'DESC';

    this.currentPage = 1;
    this.loadAttempts();
  }

  /**
   * Load choices data
   */
  async loadChoices() {
    try {
      this.showLoading('Loading choices...');

      if (!window.choicesAPI) {
        throw new Error('Choices API not available');
      }

      const filters = this.getChoiceFilters();
      const response = await retry(() => window.choicesAPI.getAll(filters), 3, 1000);

      const normalizedResponse = normalizeApiResponse(response);

      if (!normalizedResponse.success) {
        throw new Error(normalizedResponse.message || 'Failed to load choices');
      }

      const choices = safeArrayAccess(normalizedResponse.data?.content, 0, []) || normalizedResponse.data || [];
      const totalElements = normalizedResponse.data?.totalElements || choices.length;

      // Define columns for DataTable
      const columns = [
        { key: 'choiceId', title: 'ID', sortable: true },
        { key: 'questionId', title: 'Question ID', sortable: true },
        { key: 'choiceText', title: 'Choice Text', sortable: true, searchable: true },
        { key: 'isCorrect', title: 'Correct', filterable: true },
        {
          key: 'actions',
          title: 'Actions',
          sortable: false,
          searchable: false,
          render: (value, row) => this.renderChoiceActions(row)
        }
      ];

      // Render enhanced table
      this.renderEnhancedTable('choicesTableContainer', choices, columns);

      this.updateChoiceStats(choices, totalElements);
      this.hideLoading();
    } catch (error) {
      console.error('Failed to load choices:', error);
      this.handleError(error, 'loading choices');
      this.hideLoading();
    }
  }

  renderChoiceActions(choice) {
    return `
      <div class="action-buttons">
        <button class="btn btn-sm btn-primary" onclick="app.editChoice('${choice.choiceId}')" title="Edit">
          <i class="fas fa-edit"></i>
        </button>
        <button class="btn btn-sm btn-danger" onclick="app.deleteChoice('${choice.choiceId}')" title="Delete">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    `;
  }

  /**
   * Get choice filters from UI
   * @returns {Object} Filters object
   */
  getChoiceFilters() {
    return {
      questionId: document.getElementById('choiceQuestionSearch')?.value || '',
      choiceText: document.getElementById('choiceTextSearch')?.value || '',
      isCorrect: document.getElementById('choiceCorrectFilter')?.value || '',
      page: this.currentPage - 1,
      size: this.pageSize,
      sortBy: document.getElementById('choiceSortBy')?.value || 'choiceId',
      sortDir: document.getElementById('choiceSortDir')?.value || 'ASC'
    };
  }

  /**
   * Clear choice filters
   */
  clearChoiceFilters() {
    document.getElementById('choiceQuestionSearch').value = '';
    document.getElementById('choiceTextSearch').value = '';
    document.getElementById('choiceCorrectFilter').value = '';
    document.getElementById('choiceSortBy').value = 'choiceId';
    document.getElementById('choiceSortDir').value = 'ASC';

    this.currentPage = 1;
    this.loadChoices();
  }

  /**
   * Render attempts pagination
   * @param {number} totalPages - Total pages
   * @param {number} currentPage - Current page
   * @param {number} totalElements - Total elements
   */
  renderAttemptsPagination(totalPages, currentPage, totalElements) {
    const container = document.getElementById('attemptsPagination');
    if (!container) return;

    let paginationHTML = '';

    // Previous button
    paginationHTML += `
      <button class="btn btn-sm ${currentPage === 1 ? 'btn-secondary disabled' : 'btn-primary'}" 
              onclick="app.changePage(${currentPage - 1})" 
              ${currentPage === 1 ? 'disabled' : ''}>
        <i class="fas fa-chevron-left"></i>
      </button>
    `;

    // Page numbers
    const visiblePages = this.getVisiblePages(currentPage, totalPages);
    visiblePages.forEach(page => {
      if (page === '...') {
        paginationHTML += '<span class="pagination-dots">...</span>';
      } else {
        paginationHTML += `
          <button class="btn btn-sm ${page === currentPage ? 'btn-primary' : 'btn-secondary'}" 
                  onclick="app.changePage(${page})">
            ${page}
          </button>
        `;
      }
    });

    // Next button
    paginationHTML += `
      <button class="btn btn-sm ${currentPage === totalPages ? 'btn-secondary disabled' : 'btn-primary'}" 
              onclick="app.changePage(${currentPage + 1})" 
              ${currentPage === totalPages ? 'disabled' : ''}>
        <i class="fas fa-chevron-right"></i>
      </button>
    `;

    container.innerHTML = paginationHTML;
  }

  /**
   * Update student statistics
   * @param {Array} students - Students data
   * @param {number} total - Total count
   */
  updateStudentStats(students, total) {
    const totalCountEl = document.getElementById('studentsTotalCount');
    const averageAgeEl = document.getElementById('studentsAverageAge');
    const activeCountEl = document.getElementById('studentsActiveCount');

    if (totalCountEl) totalCountEl.textContent = total.toString();

    if (averageAgeEl && students.length > 0) {
      const avgAge = (students.reduce((sum, student) => sum + (student.age || 0), 0) / students.length).toFixed(1);
      averageAgeEl.textContent = `${avgAge} years`;
    }

    if (activeCountEl) {
      // For now, assume all students with graduation year in future are active
      const currentYear = new Date().getFullYear();
      const activeCount = students.filter(s => s.graduationYear > currentYear).length;
      activeCountEl.textContent = activeCount.toString();
    }
  }

  /**
   * Update course statistics
   * @param {Array} courses - Courses data
   * @param {number} total - Total count
   */
  updateCourseStats(courses, total) {
    const totalCountEl = document.getElementById('coursesTotalCount');
    const averageDurationEl = document.getElementById('coursesAverageDuration');
    const withExamsCountEl = document.getElementById('coursesWithExamsCount');

    if (totalCountEl) totalCountEl.textContent = total.toString();

    if (averageDurationEl && courses.length > 0) {
      const avgDuration = (courses.reduce((sum, course) => sum + (course.duration || 0), 0) / courses.length).toFixed(1);
      averageDurationEl.textContent = `${avgDuration} hours`;
    }

    if (withExamsCountEl) {
      const withExamsCount = courses.filter(c => c.examCount > 0).length;
      withExamsCountEl.textContent = withExamsCount.toString();
    }
  }

  /**
   * Update exam statistics
   * @param {Array} exams - Exams data
   * @param {number} total - Total count
   */
  updateExamStats(exams, total) {
    const totalCountEl = document.getElementById('examsTotalCount');
    const averageDurationEl = document.getElementById('examsAverageDuration');
    const activeCountEl = document.getElementById('examsActiveCount');

    if (totalCountEl) totalCountEl.textContent = total.toString();

    if (averageDurationEl && exams.length > 0) {
      const avgDuration = (exams.reduce((sum, exam) => sum + (exam.duration || 0), 0) / exams.length).toFixed(1);
      averageDurationEl.textContent = `${avgDuration} min`;
    }

    if (activeCountEl) {
      // For now, assume exams with future dates are active
      const today = new Date().toISOString().split('T')[0];
      const activeCount = exams.filter(e => e.examDate >= today).length;
      activeCountEl.textContent = activeCount.toString();
    }
  }

  /**
   * Update question statistics
   * @param {Array} questions - Questions data
   * @param {number} total - Total count
   */
  updateQuestionStats(questions, total) {
    const totalCountEl = document.getElementById('questionsTotalCount');
    const mcqCountEl = document.getElementById('questionsMcqCount');
    const tfCountEl = document.getElementById('questionsTfCount');

    if (totalCountEl) totalCountEl.textContent = total.toString();

    if (mcqCountEl) {
      const mcqCount = questions.filter(q => q.type === 'MCQ').length;
      mcqCountEl.textContent = mcqCount.toString();
    }

    if (tfCountEl) {
      const tfCount = questions.filter(q => q.type === 'T/F').length;
      tfCountEl.textContent = tfCount.toString();
    }
  }

  /**
   * Update attempts statistics
   * @param {Array} attempts - Attempts data
   * @param {number} total - Total count
   */
  updateAttemptsStats(attempts, total) {
    const totalCountEl = document.getElementById('totalAttemptsCount');
    const averageGradeEl = document.getElementById('averageGrade');
    const passRateEl = document.getElementById('passRate');

    if (totalCountEl) totalCountEl.textContent = total.toString();

    if (averageGradeEl && attempts.length > 0) {
      const validGrades = attempts.filter(a => a.grade != null).map(a => a.grade);
      if (validGrades.length > 0) {
        const avgGrade = (validGrades.reduce((sum, grade) => sum + grade, 0) / validGrades.length).toFixed(1);
        averageGradeEl.textContent = `${avgGrade}%`;
      } else {
        averageGradeEl.textContent = 'N/A';
      }
    }

    if (passRateEl && attempts.length > 0) {
      const passedCount = attempts.filter(a => a.grade >= 60).length;
      const passRate = ((passedCount / attempts.length) * 100).toFixed(1);
      passRateEl.textContent = `${passRate}%`;
    }
  }

  /**
   * Update choice statistics
   * @param {Array} choices - Choices data
   * @param {number} total - Total count
   */
  updateChoiceStats(choices, total) {
    const totalCountEl = document.getElementById('choicesTotalCount');
    const correctCountEl = document.getElementById('choicesCorrectCount');
    const incorrectCountEl = document.getElementById('choicesIncorrectCount');

    if (totalCountEl) totalCountEl.textContent = total.toString();

    if (correctCountEl) {
      const correctCount = choices.filter(c => c.isCorrect).length;
      correctCountEl.textContent = correctCount.toString();
    }

    if (incorrectCountEl) {
      const incorrectCount = choices.filter(c => !c.isCorrect).length;
      incorrectCountEl.textContent = incorrectCount.toString();
    }
  }

  /**
   * Get visible pages for pagination
   * @param {number} currentPage - Current page
   * @param {number} totalPages - Total pages
   * @returns {Array} Array of page numbers
   */
  getVisiblePages(currentPage, totalPages) {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  }

  /**
   * Change page
   * @param {number} page - New page number
   */
  async changePage(page) {
    if (page < 1) return;

    this.currentPage = page;
    await this.loadSectionData(this.currentSection);
  }


  /**
   * Delete course
   * @param {number} id - Course ID
   */
  async deleteCourse(id) {
    const confirmed = await showConfirm(
        'Delete Course',
        'Are you sure you want to delete this course? This action cannot be undone.',
        'Delete',
        'Cancel'
    );

    if (confirmed) {
      try {
        this.showLoading('Deleting course...');
        await window.coursesAPI.delete(id);
        this.showToast('Course deleted successfully', 'success');
        await this.loadCourses();
      } catch (error) {
        this.handleError(error, 'deleting course');
      } finally {
        this.hideLoading();
      }
    }
  }


  /**
   * Delete exam
   * @param {number} id - Exam ID
   */
  async deleteExam(id) {
    const confirmed = await showConfirm(
        'Delete Exam',
        'Are you sure you want to delete this exam? This action cannot be undone.',
        'Delete',
        'Cancel'
    );

    if (confirmed) {
      try {
        this.showLoading('Deleting exam...');
        await window.examsAPI.delete(id);
        this.showToast('Exam deleted successfully', 'success');
        await this.loadExams();
      } catch (error) {
        this.handleError(error, 'deleting exam');
      } finally {
        this.hideLoading();
      }
    }
  }


  /**
   * Delete question
   * @param {number} id - Question ID
   */
  async deleteQuestion(id) {
    const confirmed = await showConfirm(
        'Delete Question',
        'Are you sure you want to delete this question? This action cannot be undone.',
        'Delete',
        'Cancel'
    );

    if (confirmed) {
      try {
        this.showLoading('Deleting question...');
        await window.questionsAPI.delete(id);
        this.showToast('Question deleted successfully', 'success');
        await this.loadQuestions();
      } catch (error) {
        this.handleError(error, 'deleting question');
      } finally {
        this.hideLoading();
      }
    }
  }

  /**
   * View attempt
   * @param {number} id - Attempt ID
   */
  async viewAttempt(id) {
    try {
      this.showLoading('Loading attempt details...');
      const attempt = await window.attemptsAPI.getById(id);
      this.showAttemptDetails(attempt);
    } catch (error) {
      this.handleError(error, 'loading attempt');
    } finally {
      this.hideLoading();
    }
  }

  /**
   * Show attempt details in modal
   * @param {Object} attempt - Attempt data
   */
  showAttemptDetails(attempt) {
    const formattedAttempt = window.attemptsAPI?.formatAttemptData?.(attempt) || attempt;

    const content = `
      <div class="attempt-details">
        <div class="detail-row">
          <div class="detail-item">
            <label>Attempt ID:</label>
            <span>${formattedAttempt.attemptId || 'N/A'}</span>
          </div>
          <div class="detail-item">
            <label>Student:</label>
            <span>${formattedAttempt.studentName || 'N/A'} (${formattedAttempt.studentSsn || 'N/A'})</span>
          </div>
        </div>
        <div class="detail-row">
          <div class="detail-item">
            <label>Exam:</label>
            <span>${formattedAttempt.examTitle || 'N/A'}</span>
          </div>
          <div class="detail-item">
            <label>Attempt Date:</label>
            <span>${formattedAttempt.formattedAttemptDate || formattedAttempt.attemptDate || 'N/A'}</span>
          </div>
        </div>
        <div class="detail-row">
          <div class="detail-item">
            <label>Grade:</label>
            <span style="color: ${formattedAttempt.gradeColor || 'inherit'}; font-weight: bold;">
              ${formattedAttempt.grade !== null && formattedAttempt.grade !== undefined ? formattedAttempt.grade + '%' : 'N/A'}
            </span>
          </div>
          <div class="detail-item">
            <label>Status:</label>
            <span>${formattedAttempt.statusBadge || (formattedAttempt.grade >= 60 ? 'PASSED' : 'FAILED')}</span>
          </div>
        </div>
      </div>
    `;

    this.modalManager.show({
      title: 'Attempt Details',
      content: content,
      showFooter: false
    });
  }

  /**
   * Delete choice
   * @param {number} id - Choice ID
   */
  async deleteChoice(id) {
    const confirmed = await showConfirm(
        'Delete Choice',
        'Are you sure you want to delete this choice? This action cannot be undone.',
        'Delete',
        'Cancel'
    );

    if (confirmed) {
      try {
        this.showLoading('Deleting choice...');
        await window.choicesAPI.delete(id);
        this.showToast('Choice deleted successfully', 'success');
        await this.loadChoices();
      } catch (error) {
        this.handleError(error, 'deleting choice');
      } finally {
        this.hideLoading();
      }
    }
  }

  /**
   * Handle add button clicks
   * @param {string} buttonId - Button ID
   */
  handleAddButton(buttonId) {
    switch (buttonId) {
      case 'addStudentBtn':
        this.showStudentForm();
        break;
      case 'addCourseBtn':
        this.showCourseForm();
        break;
      case 'addExamBtn':
        this.showExamForm();
        break;
      case 'addQuestionBtn':
        this.showQuestionForm();
        break;
      case 'addChoiceBtn':
        this.showChoiceForm();
        break;
      default:
        console.warn('Unknown add button:', buttonId);
    }
  }
  /**
   * Handle form submission
   */
  async handleFormSubmit() {
    // This would handle actual form submission
    // For now, just show a success message
    this.showToast('Form submitted successfully!', 'success');
    this.modalManager.hide();
  }

  /**
   * Perform global search
   * @param {string} query - Search query
   */
  performGlobalSearch(query) {
    console.log('Performing global search for:', query);
    // Implement global search across all sections
    this.showToast(`Searching for: ${query}`, 'info');
  }

  /**
   * Refresh current section
   */
  async refreshCurrentSection() {
    await this.loadSectionData(this.currentSection);
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
   * Capitalize first letter
   * @param {string} string - String to capitalize
   * @returns {string} Capitalized string
   */
  capitalizeFirst(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
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

    // Ctrl/Cmd + / for help
    if ((e.ctrlKey || e.metaKey) && e.key === '/') {
      e.preventDefault();
      this.showHelp();
    }
  }

  /**
   * Show help dialog
   */
  showHelp() {
    showAlert(
        `<h3>Keyboard Shortcuts</h3>
        <ul>
          <li><kbd>Ctrl/Cmd + K</kbd> - Focus search</li>
          <li><kbd>Escape</kbd> - Close modal</li>
          <li><kbd>Ctrl/Cmd + /</kbd> - Show this help</li>
        </ul>`,
        { title: 'Help & Shortcuts' }
    );
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
        // Check if all APIs are available
        const apis = ['studentsAPI', 'coursesAPI', 'examsAPI', 'questionsAPI', 'choicesAPI', 'attemptsAPI'];
        const allApisAvailable = apis.every(api => window[api] !== undefined);

        const statusDot = healthStatus.querySelector('.status-dot');
        if (statusDot) {
          statusDot.className = `status-dot ${allApisAvailable ? 'online' : 'error'}`;
        }
      }
    } catch (error) {
      console.error('API health check failed:', error);
    }
  }

  /**
   * Enhanced error handling with utility integration
   */
  handleError(error, context) {
    console.error(`App error in ${context}:`, error);

    const errorMessage = error.message || error.response?.data?.message || 'An unexpected error occurred';
    const safeMessage = sanitizeHtml(errorMessage);

    this.showToast(`Error: ${safeMessage}`, 'error');

    // Log to console with context
    console.group(`Error Context: ${context}`);
    console.error('Error:', error);
    console.error('Context:', context);
    console.groupEnd();

    // Dispatch error event for external handling
    const event = new CustomEvent('appError', {
      detail: {
        error: error,
        context: context,
        timestamp: new Date().toISOString(),
        app: this
      }
    });
    document.dispatchEvent(event);
  }

  /**
   * Enhanced global error handling
   */
  setupGlobalErrorHandling() {
    window.addEventListener('error', (event) => {
      this.handleError(event.error, 'global');
    });

    window.addEventListener('unhandledrejection', (event) => {
      this.handleError(event.reason, 'unhandledPromise');
    });
  }

  /**
   * Enhanced utility method aliases for convenience
   */
  showLoading(message = 'Loading...', containerId = null) {
    this.loadingManager.show(message, containerId);
  }

  hideLoading(containerId = null) {
    this.loadingManager.hide(containerId);
  }

  showToast(message, type = 'info', duration = 3000) {
    this.toastManager.show(message, type, duration);
  }

  showError(message) {
    this.showToast(message, 'error');
  }

  toggleDarkMode() {
    toggleDarkMode();
  }

  toggleSidebar(force) {
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
      if (typeof force === 'boolean') {
        sidebar.classList.toggle('collapsed', force);
      } else {
        sidebar.classList.toggle('collapsed');
      }
    }
  }

  /**
   * Enhanced cleanup with utility integration
   */
  destroy() {
    // Cleanup dashboard resources
    if (this.dashboardComponent) {
      this.dashboardComponent.destroy();
      this.dashboardComponent = null;
    }

    // Cleanup table instances
    this.tableInstances.forEach((table, tableId) => {
      try {
        table.destroy();
      } catch (error) {
        console.error(`Error destroying table ${tableId}:`, error);
      }
    });
    this.tableInstances.clear();

    // Cleanup form instances
    this.formInstances.forEach((form, formId) => {
      try {
        form.destroy();
      } catch (error) {
        console.error(`Error destroying form ${formId}:`, error);
      }
    });
    this.formInstances.clear();

    // Stop auto refresh
    this.stopAutoRefresh();

    // Hide any active loading states
    this.hideLoading();

    // Hide any active toasts
    this.toastManager.hide();

    // Clear any active banners
    hideBanner();

    // Clear intervals
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }

    console.log('Application cleanup completed');
  }
}

// Enhanced initialization with error handling
document.addEventListener('DOMContentLoaded', async () => {
  try {
    // Check if required APIs are available
    const requiredAPIs = ['studentsAPI', 'coursesAPI', 'examsAPI', 'questionsAPI', 'choicesAPI', 'attemptsAPI'];
    const missingAPIs = requiredAPIs.filter(api => !window[api]);

    if (missingAPIs.length > 0) {
      console.warn('Missing required APIs:', missingAPIs);
      showToast('Some features may not work properly - missing APIs', 'warning');
    }

    // Initialize the application
    window.app = new ExamManagementApp();

    // Make utility functions globally available for debugging
    window.appUtils = {
      showToast,
      showLoading,
      hideLoading,
      showConfirm,
      showAlert,
      debounce,
      throttle,
      deepClone,
      normalizeApiResponse,
      retry
    };

  } catch (error) {
    console.error('Failed to initialize application:', error);
    await showAlert(
        'Application Initialization Failed',
        'The application failed to start properly. Please refresh the page or contact support if the problem persists.'
    );
  }
});

// Export for module usage if needed
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ExamManagementApp;
}