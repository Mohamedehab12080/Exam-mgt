// Complete Dashboard Component with Utility Integration
import { studentsAPI, coursesAPI, examsAPI, questionsAPI, attemptsAPI, choicesAPI } from '/static/assets/js/api';

import {
  isOnline,
  getConnectionInfo,
  request,
  getJSON,
  postJSON,
  checkAPIHealth,
  addRequestInterceptor,
  addResponseInterceptor
} from '/static/assets/js/utils/network.js';

// Import all utility functions
import {
  formatNumber,
  formatPercentage,
  formatTimeAgo,
  formatDate,
  formatDuration,
  formatScoreBadge,
  formatStatusBadge,
  truncateText,
  capitalizeFirst
} from '/static/assets/js/utils/formatters.js';

import {
  showLoading,
  hideLoading,
  showToast,
  showError,
  showConfirm
} from '/static/assets/js/utils/ui.js';

import {
  debounce,
  throttle,
  groupBy,
  sortBy,
  safeArrayAccess,
  isNonEmptyArray,
  paginate,
  filterBySearch,
  generateId,
  deepClone,
  normalizeApiResponse,
  extractPaginationInfo,
  randomColor
} from '/static/assets/js/utils/helpers.js';

import {
  isValidEmail,
  isValidPhone,
  isValidSSN,
  isValidDate,
  isValidNumber,
  isValidLength,
  isValidUrl,
  validateObject,
  validateForm,
  isFormValid,
  getValidationMessage,
  isEmpty,
  isNotEmpty,
  sanitizeHtml,
  escapeHtml,
  stripHtml
} from '/static/assets/js/utils/validators.js';
import {getLocalStorage} from "./utils";

export class DashboardComponent {
  constructor() {
    this.charts = {};
    this.refreshInterval = null;
    this.autoRefreshEnabled = false;
    this.currentTimeRange = localStorage.getItem('timeRange') || '30d';
    this.dashboardId = generateId('dashboard');

    // Network monitoring
    this.networkStatus = {
      online: isOnline(),
      connectionInfo: getConnectionInfo(),
      apiHealth: 'unknown'
    };
    // Validation rules
    this.validationRules = {
      timeRange: {
        required: true,
        type: 'string',
        validate: (value) => {
          const validRanges = ['7d', '30d', '90d', '1y', 'all'];
          return validRanges.includes(value) || 'Invalid time range';
        }
      },
      searchQuery: {
        type: 'string',
        length: {min: 0, max: 100},
        validate: (value) => {
          if (!value) return true;
          const dangerousPatterns = [/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, /javascript:/gi];
          return !dangerousPatterns.some(pattern => pattern.test(value)) || 'Search term contains unsafe content';
        }
      }
    };
// Request interceptors
    this.requestInterceptorCleanup = null;
    this.responseInterceptorCleanup = null;
    this.handleOnline = this.handleOnline.bind(this);
    this.handleOffline = this.handleOffline.bind(this);
    this.handleConnectionChange = this.handleConnectionChange.bind(this);

    this.init();
  }

  /**
   * Initialize dashboard component with enhanced utilities
   */
  init() {
    try {
      this.setupNetworkInterceptors();
      this.setupNetworkMonitoring();
      this.checkInitialAPIHealth();

      this.setupEventListeners();
      this.loadDashboardData();
      this.setupAutoRefresh();

      this.setupNetworkMonitoring();
      this.checkInitialAPIHealth();
      this.loadCachedData();

      this.setupEventListeners();
      this.loadDashboardData();
      this.setupAutoRefresh();

      console.log('Dashboard component initialized successfully');
      showToast('Dashboard loaded successfully', 'success');
    } catch (error) {
      console.error('Failed to initialize dashboard:', error);
      this.handleError(error, 'initialization');
    }
  }

  loadCachedData() {
    try {
      const cachedStats = getLocalStorage('dashboard_stats');
      if (cachedStats) {
        this.renderStats(cachedStats);
      }
    } catch (error) {
      console.warn('Failed to load cached data:', error);
    }
  }

  cacheDashboardData(data) {
    try {
      if (data.stats) {
        setLocalStorage('dashboard_stats', data.stats, 60); // 60 minutes
      }
    } catch (error) {
      console.warn('Failed to cache data:', error);
    }
  }
  /**
   * Setup network request/response interceptors
   */
  setupNetworkInterceptors() {
    // Request interceptor - add auth headers, logging, etc.
    this.requestInterceptorCleanup = addRequestInterceptor(async (url, options) => {
      console.log(`🚀 Making request to: ${url}`);

      // Add authentication token if available
      const token = localStorage.getItem('authToken');
      if (token) {
        options.headers = {
          ...options.headers,
          'Authorization': `Bearer ${token}`
        };
      }

      // Add request timestamp for performance monitoring
      options.headers = {
        ...options.headers,
        'X-Request-Timestamp': Date.now().toString()
      };

      return [url, options];
    });

    // Response interceptor - handle errors, logging, etc.
    this.responseInterceptorCleanup = addResponseInterceptor(async (response) => {
      const requestTime = response.headers.get('X-Request-Timestamp');
      const responseTime = requestTime ? Date.now() - parseInt(requestTime) : 'unknown';

      console.log(`📨 Response from: ${response.url} (${response.status}) - ${responseTime}ms`);

      // Handle API errors consistently
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      return response;
    });
  }

  /**
   * Setup network status monitoring
   */
  setupNetworkMonitoring() {
    window.addEventListener('online', this.handleOnline);
    window.addEventListener('offline', this.handleOffline);

    if (navigator.connection) {
      navigator.connection.addEventListener('change', this.handleConnectionChange);
    }
  }
// ADD THESE 3 COMPLETE FUNCTIONS:
  handleOnline() {
    this.networkStatus.online = true;
    this.networkStatus.connectionInfo = getConnectionInfo();
    showToast('Connection restored', 'success');

    if (this.autoRefreshEnabled) {
      this.refreshDashboard();
    }
  }

  handleOffline() {
    this.networkStatus.online = false;
    showToast('No internet connection', 'warning');
  }

  handleConnectionChange() {
    this.networkStatus.connectionInfo = getConnectionInfo();
  }
  /**
   * Adapt dashboard behavior based on connection changes
   */
  adaptToConnectionChange(oldConnection, newConnection) {
    // If connection improved
    if (this.isConnectionImproved(oldConnection, newConnection)) {
      console.log('Connection improved, resuming normal operations');

      // Restart auto-refresh if it was enabled
      if (this.autoRefreshEnabled && !this.refreshInterval) {
        this.startAutoRefresh();
        showToast('Connection improved. Auto-refresh resumed.', 'success');
      }
    }

    // If connection degraded
    if (this.isConnectionDegraded(oldConnection, newConnection)) {
      console.warn('Connection degraded, optimizing for slower network...');

      // Reduce auto-refresh interval on slow connections
      if (this.autoRefreshEnabled) {
        this.stopAutoRefresh();
        this.startAutoRefresh(60000); // 1 minute instead of 30 seconds
        showToast('Slow connection detected. Adjusted refresh rate.', 'info');
      }

      // Reduce data loading for slow connections
      this.optimizeForSlowConnection();
    }
  }

  /**
   * Check if connection improved
   */
  isConnectionImproved(oldConnection, newConnection) {
    const connectionHierarchy = ['slow-2g', '2g', '3g', '4g'];
    const oldIndex = connectionHierarchy.indexOf(oldConnection.effectiveType);
    const newIndex = connectionHierarchy.indexOf(newConnection.effectiveType);

    return newIndex > oldIndex ||
        (newConnection.downlink > oldConnection.downlink && newConnection.downlink > 1);
  }


  /**
   * Check if connection degraded
   */
  isConnectionDegraded(oldConnection, newConnection) {
    const connectionHierarchy = ['slow-2g', '2g', '3g', '4g'];
    const oldIndex = connectionHierarchy.indexOf(oldConnection.effectiveType);
    const newIndex = connectionHierarchy.indexOf(newConnection.effectiveType);

    return newIndex < oldIndex ||
        newConnection.effectiveType === 'slow-2g' ||
        newConnection.effectiveType === '2g';
  }

  /**
   * Optimize dashboard for slow connections
   */
  optimizeForSlowConnection() {
    console.log('Optimizing dashboard for slow connection...');

    // Reduce data load for statistics
    this.statsLoadSize = 5; // Instead of default 10 or more

    // Disable heavy charts or reduce their data points
    if (this.charts.trends) {
      this.charts.trends.updateOptions({
        animation: false,
        responsive: false
      });
    }

    // Cache data more aggressively
    this.enableAggressiveCaching();
  }

  /**
   * Enable aggressive caching for slow connections
   */
  enableAggressiveCaching() {
    const now = Date.now();
    const cacheDuration = 5 * 60 * 1000; // 5 minutes for slow connections

    // Store cache settings
    localStorage.setItem('aggressiveCaching', 'true');
    localStorage.setItem('cacheExpiry', (now + cacheDuration).toString());
  }

  /**
   * Get network status for display
   */
  getNetworkStatus() {
    return {
      online: this.networkStatus.online,
      connectionType: this.networkStatus.connectionInfo.effectiveType,
      downlink: this.networkStatus.connectionInfo.downlink,
      apiHealth: this.networkStatus.apiHealth,
      timestamp: Date.now()
    };
  }


  /**
   * Check API health on startup
   */
  async checkInitialAPIHealth() {
    try {
      const health = await checkAPIHealth('/api/health');
      this.networkStatus.apiHealth = health.status;
    } catch (error) {
      this.networkStatus.apiHealth = 'unhealthy';
    }
  }
  /**
   * Enhanced API calls with network awareness
   */
  async makeAPICall(apiCall, context, options = {}) {
    const {
      retryOnFailure = true,
      showLoading = true,
      showErrors = true,
      useCache = false
    } = options;

    // Check network status before making request
    if (!this.networkStatus.online) {
      const error = new Error('No internet connection. Please check your network and try again.');
      if (showErrors) {
        showToast(error.message, 'warning');
      }
      throw error;
    }

    // Check cache for slow connections
    if (useCache || this.networkStatus.connectionInfo.effectiveType === 'slow-2g') {
      const cachedData = this.getCachedData(context);
      if (cachedData) {
        console.log(`Using cached data for ${context}`);
        return cachedData;
      }
    }

    if (showLoading) {
      showLoading(`Loading ${context}...`);
    }

    try {
      const result = await apiCall();

      // Cache result for slow connections
      if (this.networkStatus.connectionInfo.effectiveType === 'slow-2g' ||
          this.networkStatus.connectionInfo.effectiveType === '2g') {
        this.cacheData(context, result);
      }

      if (showLoading) {
        hideLoading();
      }

      return result;

    } catch (error) {
      if (showLoading) {
        hideLoading();
      }

      this.handleApiError(error, context, showErrors);
      throw error;
    }
  }

  /**
   * Get cached data
   */
  getCachedData(key) {
    try {
      const cached = localStorage.getItem(`cache_${key}`);
      const expiry = localStorage.getItem(`cache_expiry_${key}`);

      if (cached && expiry && Date.now() < parseInt(expiry)) {
        return JSON.parse(cached);
      }

      // Clean up expired cache
      if (cached && expiry && Date.now() >= parseInt(expiry)) {
        localStorage.removeItem(`cache_${key}`);
        localStorage.removeItem(`cache_expiry_${key}`);
      }

      return null;
    } catch (error) {
      console.error('Error reading cache:', error);
      return null;
    }
  }

  /**
   * Cache data
   */
  cacheData(key, data) {
    try {
      const cacheDuration = this.getCacheDuration();
      const expiry = Date.now() + cacheDuration;

      localStorage.setItem(`cache_${key}`, JSON.stringify(data));
      localStorage.setItem(`cache_expiry_${key}`, expiry.toString());
    } catch (error) {
      console.error('Error caching data:', error);
    }
  }

  /**
   * Get cache duration based on connection type
   */
  getCacheDuration() {
    const connectionType = this.networkStatus.connectionInfo.effectiveType;

    switch (connectionType) {
      case 'slow-2g':
        return 10 * 60 * 1000; // 10 minutes
      case '2g':
        return 5 * 60 * 1000;  // 5 minutes
      case '3g':
        return 2 * 60 * 1000;  // 2 minutes
      default:
        return 60 * 1000;      // 1 minute
    }
  }

  /**
   * Handle API errors with network context
   */
  handleApiError(error, context, showErrors = true) {
    // Enhanced error handling based on error type and network status
    if (error.name === 'AbortError') {
      console.warn(`Request timeout for ${context}`);
      if (showErrors) {
        showToast(`Request timeout for ${context}. Please try again.`, 'warning');
      }
    } else if (error.message.includes('Failed to fetch')) {
      console.error(`Network error for ${context}:`, error);
      if (showErrors) {
        if (!this.networkStatus.online) {
          showToast('No internet connection. Please check your network.', 'error');
        } else {
          showToast('Network error. Please check your connection.', 'error');
        }
      }
    } else if (error.message.includes('HTTP 5')) {
      console.error(`Server error for ${context}:`, error);
      if (showErrors) {
        showToast('Server error. Please try again later.', 'error');
      }
    } else {
      console.error(`API error for ${context}:`, error);
      if (showErrors) {
        showToast(`Failed to load ${context}: ${error.message}`, 'error');
      }
    }
  }

  /**
   * Enhanced event listeners with utility functions
   */
  setupEventListeners() {
    // Refresh button with debounce
    const refreshBtn = document.getElementById('refreshDashboardBtn');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', debounce(() => {
        this.refreshDashboard();
      }, 300));
    }

    // Auto-refresh toggle
    const autoRefreshToggle = document.getElementById('autoRefreshToggle');
    if (autoRefreshToggle) {
      autoRefreshToggle.addEventListener('change', (e) => {
        this.toggleAutoRefresh(e.target.checked);
      });
    }

    // Time range selector
    const timeRangeSelector = document.getElementById('timeRangeSelector');
    if (timeRangeSelector) {
      timeRangeSelector.value = this.currentTimeRange;
      timeRangeSelector.addEventListener('change', (e) => {
        this.changeTimeRange(e.target.value);
      });
    }

    // Search functionality with debounce
    const searchInput = document.getElementById('dashboardSearch');
    if (searchInput) {
      searchInput.addEventListener('input', debounce((e) => {
        this.handleSearch(e.target.value);
      }, 500));
    }

    // Export buttons
    document.querySelectorAll('.export-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const format = e.target.dataset.format;
        const dataType = e.target.dataset.dataType;
        this.exportData(format, dataType);
      });
    });

    // Responsive resize handler
    window.addEventListener('resize', throttle(() => {
      this.handleResize();
    }, 250));
  }

  /**
   * Enhanced dashboard data loading with validation
   */
  async loadDashboardData() {
    try {
      showLoading('Loading dashboard data...');

      // Load all dashboard data in parallel with error handling
      const [
        stats,
        recentActivities,
        performanceData,
        trendsData
      ] = await Promise.allSettled([
        this.loadStats(),
        this.loadRecentActivities(),
        this.loadPerformanceData(),
        this.loadTrendsData()
      ]);

      // Process results with validation
      const processedData = {
        stats: this.validateApiResult(stats, 'stats'),
        recentActivities: this.validateApiResult(recentActivities, 'recentActivities') || [],
        performanceData: this.validateApiResult(performanceData, 'performanceData') || {},
        trendsData: this.validateApiResult(trendsData, 'trendsData') || {}
      };

      this.cacheDashboardData(processedData);
      // Render all dashboard components
      this.renderStats(processedData.stats);
      this.renderRecentActivities(processedData.recentActivities);
      this.renderPerformanceChart(processedData.performanceData);
      this.renderTrendsChart(processedData.trendsData);
      this.renderQuickActions();

      hideLoading();
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      this.handleError(error, 'data loading');
      hideLoading();
    }
  }

  /**
   * Enhanced statistics loading with API normalization
   */
  /**
   * Enhanced statistics loading with network utilities
   */
  async loadStats() {
    return this.makeAPICall(async () => {
      const apiCalls = [
        studentsAPI.getStats(),
        coursesAPI.getStats(),
        examsAPI.getStats(),
        questionsAPI.getStats(),
        attemptsAPI.getStats(),
        choicesAPI.getStats()
      ];

      const results = await Promise.allSettled(apiCalls);

      // Use network utility for response normalization
      const normalizedResults = results.map(result =>
          result.status === 'fulfilled' ? normalizeApiResponse(result.value) : {success: false, data: null}
      );

      const [
        studentsStats,
        coursesStats,
        examsStats,
        questionsStats,
        attemptsStats,
        choicesStats
      ] = normalizedResults;

      return {
        students: studentsStats.data,
        courses: coursesStats.data,
        exams: examsStats.data,
        questions: questionsStats.data,
        attempts: attemptsStats.data,
        choices: choicesStats.data,
        summary: this.calculateSummaryStats(normalizedResults)
      };
    }, 'statistics');
  }

  /**
   * Display network status in UI
   */
  renderNetworkStatus() {
    const statusContainer = document.getElementById('network-status');
    if (!statusContainer) return;

    const status = this.getNetworkStatus();

    let statusText = 'Online';
    let statusClass = 'success';
    let icon = 'fa-wifi';

    if (!status.online) {
      statusText = 'Offline';
      statusClass = 'error';
      icon = 'fa-wifi-slash';
    } else if (status.connectionType === 'slow-2g' || status.connectionType === '2g') {
      statusText = 'Slow Connection';
      statusClass = 'warning';
      icon = 'fa-tachometer-alt-slow';
    } else if (status.apiHealth !== 'healthy') {
      statusText = 'API Issues';
      statusClass = 'warning';
      icon = 'fa-exclamation-triangle';
    }

    statusContainer.innerHTML = `
      <div class="network-status network-status-${statusClass}">
        <i class="fas ${icon}"></i>
        <span class="network-status-text">${statusText}</span>
        ${status.downlink ? `<span class="network-speed">${status.downlink} Mbps</span>` : ''}
      </div>
    `;
  }

  /**
   * Enhanced summary statistics calculation
   */
  calculateSummaryStats(stats) {
    const [
      studentsStats,
      coursesStats,
      examsStats,
      questionsStats,
      attemptsStats,
      choicesStats
    ] = stats;

    const totalStudents = studentsStats.data?.totalCount || 0;
    const totalAttempts = attemptsStats.data?.totalCount || 0;
    const averageScore = attemptsStats.data?.averageScore || 0;
    const passRate = attemptsStats.data?.passRate || 0;

    return {
      totalStudents: totalStudents,
      totalAttempts: totalAttempts,
      averageScore: averageScore,
      passRate: passRate,
      activeStudents: studentsStats.data?.activeCount || 0,
      completedExams: examsStats.data?.completedCount || 0,
      totalQuestions: questionsStats.data?.totalCount || 0,
      correctAnswers: choicesStats.data?.correctCount || 0,
      successRate: choicesStats.data?.successRate || 0
    };
  }

  /**
   * Enhanced recent activities with better formatting and validation
   */
  async loadRecentActivities() {
    try {
      const [
        recentStudents,
        recentAttempts,
        recentExams,
        recentQuestions
      ] = await Promise.allSettled([
        studentsAPI.getAll({page: 0, size: 5, sortBy: 'ssn', sortDir: 'DESC'}),
        attemptsAPI.getAll({page: 0, size: 5, sortBy: 'attemptDate', sortDir: 'DESC'}),
        examsAPI.getAll({page: 0, size: 5, sortBy: 'examDate', sortDir: 'DESC'}),
        questionsAPI.getAll({page: 0, size: 5, sortBy: 'questionId', sortDir: 'DESC'})
      ]);

      const activities = [];
      const currentTime = new Date().toISOString();

      // Process student activities with validation
      if (recentStudents.status === 'fulfilled' && recentStudents.value.data?.content) {
        recentStudents.value.data.content.forEach(student => {
          if (this.isValidStudent(student)) {
            activities.push({
              type: 'student',
              title: 'Student Registered',
              description: `${student.firstName} ${student.lastName}`,
              time: currentTime,
              icon: 'fa-user-plus',
              color: 'primary',
              status: 'active',
              action: 'view',
              actionData: {type: 'student', id: student.ssn},
              metadata: {
                ssn: student.ssn,
                email: student.email
              }
            });
          }
        });
      }

      // Process attempt activities with enhanced formatting
      if (recentAttempts.status === 'fulfilled' && recentAttempts.value.data?.content) {
        recentAttempts.value.data.content.forEach(attempt => {
          if (this.isValidAttempt(attempt)) {
            const passed = attempt.grade >= 60;
            activities.push({
              type: 'attempt',
              title: 'Exam Attempt Completed',
              description: `Score: ${formatPercentage(attempt.grade)} - ${passed ? 'Passed' : 'Failed'}`,
              time: attempt.attemptDate || currentTime,
              icon: passed ? 'fa-check-circle' : 'fa-times-circle',
              color: passed ? 'success' : 'error',
              status: passed ? 'completed' : 'failed',
              action: 'view',
              actionData: {type: 'attempt', id: attempt.attemptId},
              metadata: {
                grade: attempt.grade,
                passed: passed,
                duration: attempt.duration
              }
            });
          }
        });
      }

      // Process exam activities
      if (recentExams.status === 'fulfilled' && recentExams.value.data?.content) {
        recentExams.value.data.content.forEach(exam => {
          if (this.isValidExam(exam)) {
            activities.push({
              type: 'exam',
              title: 'Exam Created',
              description: exam.title,
              time: exam.examDate || currentTime,
              icon: 'fa-file-alt',
              color: 'warning',
              status: 'active',
              action: 'view',
              actionData: {type: 'exam', id: exam.examId},
              metadata: {
                title: exam.title,
                duration: exam.duration
              }
            });
          }
        });
      }

      // Process question activities
      if (recentQuestions.status === 'fulfilled' && recentQuestions.value.data?.content) {
        recentQuestions.value.data.content.forEach(question => {
          if (this.isValidQuestion(question)) {
            activities.push({
              type: 'question',
              title: 'Question Added',
              description: truncateText(question.questionText, 50),
              time: currentTime,
              icon: 'fa-question-circle',
              color: 'info',
              status: 'active',
              action: 'view',
              actionData: {type: 'question', id: question.questionId},
              metadata: {
                type: question.type,
                difficulty: question.difficulty
              }
            });
          }
        });
      }

      // Sort and limit activities
      const sortedActivities = sortBy(activities, 'time', 'desc');
      return safeArrayAccess(sortedActivities, 0, 10);

    } catch (error) {
      console.error('Failed to load recent activities:', error);
      return [];
    }
  }

  /**
   * Enhanced performance data with utility functions
   */
  async loadPerformanceData() {
    try {
      const attempts = await attemptsAPI.getAll({page: 0, size: 100});

      if (!isNonEmptyArray(attempts.data?.content)) {
        return {};
      }

      const grades = attempts.data.content.map(attempt => attempt.grade || 0);
      const averageGrade = grades.reduce((sum, grade) => sum + grade, 0) / grades.length;
      const highestGrade = Math.max(...grades);
      const lowestGrade = Math.min(...grades);
      const passRate = (grades.filter(grade => grade >= 60).length / grades.length) * 100;

      // Enhanced grade distribution with utility grouping
      const gradeDistribution = {
        'A (90-100%)': grades.filter(grade => grade >= 90).length,
        'B (80-89%)': grades.filter(grade => grade >= 80 && grade < 90).length,
        'C (70-79%)': grades.filter(grade => grade >= 70 && grade < 80).length,
        'D (60-69%)': grades.filter(grade => grade >= 60 && grade < 70).length,
        'F (Below 60)': grades.filter(grade => grade < 60).length
      };

      return {
        averageGrade: Math.round(averageGrade),
        highestGrade,
        lowestGrade,
        passRate: Math.round(passRate),
        totalAttempts: grades.length,
        gradeDistribution,
        trends: this.calculatePerformanceTrends(attempts.data.content)
      };
    } catch (error) {
      console.error('Failed to load performance data:', error);
      return {};
    }
  }

  /**
   * Load trends data with validation
   */
  async loadTrendsData() {
    try {
      // Load trends data for the selected time range
      const endDate = new Date();
      const startDate = new Date();

      // Calculate date range based on current time range
      switch (this.currentTimeRange) {
        case '7d':
          startDate.setDate(startDate.getDate() - 7);
          break;
        case '90d':
          startDate.setDate(startDate.getDate() - 90);
          break;
        case '1y':
          startDate.setFullYear(startDate.getFullYear() - 1);
          break;
        default: // 30d
          startDate.setDate(startDate.getDate() - 30);
      }

      // Validate date range
      if (!isValidDate(startDate) || !isValidDate(endDate)) {
        throw new Error('Invalid date range for trends data');
      }

      const attempts = await attemptsAPI.getAll({
        page: 0,
        size: 1000,
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0]
      });

      if (!attempts.data?.content) return {};

      // Group by date with validation
      const dailyData = {};
      attempts.data.content.forEach(attempt => {
        if (this.isValidAttempt(attempt)) {
          const date = attempt.attemptDate;
          if (!dailyData[date]) {
            dailyData[date] = {attempts: 0, totalGrade: 0, passed: 0};
          }
          dailyData[date].attempts++;
          dailyData[date].totalGrade += attempt.grade || 0;
          if (attempt.grade >= 60) {
            dailyData[date].passed++;
          }
        }
      });

      // Calculate daily averages with validation
      const trends = Object.keys(dailyData)
          .filter(date => isValidDate(date))
          .map(date => ({
            date,
            attempts: dailyData[date].attempts,
            averageGrade: dailyData[date].attempts > 0 ?
                Math.round(dailyData[date].totalGrade / dailyData[date].attempts) : 0,
            passRate: dailyData[date].attempts > 0 ?
                Math.round((dailyData[date].passed / dailyData[date].attempts) * 100) : 0
          }));

      // Sort by date
      trends.sort((a, b) => new Date(a.date) - new Date(b.date));

      return {
        dailyTrends: trends,
        totalAttempts: attempts.data.content.length,
        dateRange: {
          start: startDate.toISOString().split('T')[0],
          end: endDate.toISOString().split('T')[0]
        }
      };
    } catch (error) {
      console.error('Failed to load trends data:', error);
      return {};
    }
  }

  /**
   * Enhanced statistics rendering with formatted values
   */
  renderStats(stats) {
    const statsContainer = document.getElementById('dashboard-stats');
    if (!statsContainer || !stats) return;

    const statCards = [
      {
        title: 'Total Students',
        value: formatNumber(stats.summary?.totalStudents || 0),
        icon: 'fa-users',
        color: 'primary',
        change: '+12%',
        description: 'Active students',
        subValue: formatNumber(stats.summary?.activeStudents || 0)
      },
      {
        title: 'Total Courses',
        value: formatNumber(stats.courses?.totalCount || 0),
        icon: 'fa-book',
        color: 'warning',
        change: '+8%',
        description: 'Active courses',
        subValue: formatNumber(stats.courses?.totalCount || 0)
      },
      {
        title: 'Average Grade',
        value: formatPercentage(stats.summary?.averageScore || 0),
        icon: 'fa-chart-line',
        color: 'success',
        change: '+5%',
        description: 'Pass rate',
        subValue: formatPercentage(stats.summary?.passRate || 0)
      },
      {
        title: 'Total Questions',
        value: formatNumber(stats.summary?.totalQuestions || 0),
        icon: 'fa-question-circle',
        color: 'info',
        change: '+15%',
        description: 'MCQ questions',
        subValue: formatNumber(stats.questions?.mcqCount || 0)
      }
    ];

    statsContainer.innerHTML = statCards.map(card => this.createStatCard(card)).join('');
  }

  /**
   * Create statistics card with safe HTML
   */
  createStatCard(card) {
    const safeTitle = escapeHtml(card.title);
    const safeValue = escapeHtml(card.value);
    const safeDescription = escapeHtml(card.description);
    const safeSubValue = escapeHtml(card.subValue);
    const safeChange = escapeHtml(card.change);

    return `
      <div class="stat-card">
        <div class="stat-card-header">
          <div class="stat-card-icon stat-card-icon-${card.color}">
            <i class="fas ${card.icon}"></i>
          </div>
          <div class="stat-card-change ${card.change.startsWith('+') ? 'positive' : 'negative'}">
            ${safeChange}
          </div>
        </div>
        <div class="stat-card-body">
          <div class="stat-card-value">${safeValue}</div>
          <div class="stat-card-title">${safeTitle}</div>
          <div class="stat-card-description">
            ${safeDescription}: <span class="stat-card-sub-value">${safeSubValue}</span>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Enhanced recent activities rendering with sanitization
   */
  renderRecentActivities(activities) {
    const activitiesContainer = document.getElementById('recent-activities');
    if (!activitiesContainer) return;

    if (!isNonEmptyArray(activities)) {
      activitiesContainer.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-inbox"></i>
          <h3>No Recent Activities</h3>
          <p>No recent activities to display.</p>
        </div>
      `;
      return;
    }

    // Sanitize activity data
    const safeActivities = activities.map(activity => ({
      ...activity,
      title: sanitizeHtml(activity.title || ''),
      description: sanitizeHtml(activity.description || ''),
      time: activity.time
    }));

    activitiesContainer.innerHTML = safeActivities.map(activity => `
      <div class="activity-item" data-action="${activity.action}" data-action-data='${JSON.stringify(activity.actionData)}'>
        <div class="activity-icon activity-icon-${activity.color}">
          <i class="fas ${activity.icon}"></i>
        </div>
        <div class="activity-content">
          <div class="activity-title">${activity.title}</div>
          <div class="activity-description">${activity.description}</div>
          <div class="activity-time">${formatTimeAgo(activity.time)}</div>
        </div>
        <div class="activity-actions">
          <button class="btn btn-sm btn-outline activity-action-btn" data-action="view">
            <i class="fas fa-eye"></i>
          </button>
        </div>
      </div>
    `).join('');

    // Add event listeners for activity actions
    activitiesContainer.querySelectorAll('.activity-item').forEach(item => {
      item.addEventListener('click', (e) => {
        const action = e.target.closest('.activity-item').dataset.action;
        const actionData = JSON.parse(e.target.closest('.activity-item').dataset.actionData);
        this.handleActivityAction(action, actionData);
      });
    });
  }

  /**
   * Handle activity action with validation
   */
  handleActivityAction(action, actionData) {
    // Validate action data
    if (!actionData || !actionData.type || !actionData.id) {
      showError('Invalid activity action data');
      return;
    }

    switch (action) {
      case 'view':
        this.viewItem(actionData.type, actionData.id);
        break;
      default:
        console.warn('Unknown activity action:', action);
        showError('Unknown action requested');
    }
  }

  /**
   * View item with validation
   */
  viewItem(type, id) {
    // Validate type and ID
    const validTypes = ['student', 'exam', 'attempt', 'question'];
    if (!validTypes.includes(type)) {
      showError('Invalid item type');
      return;
    }

    if (!id || (typeof id !== 'string' && typeof id !== 'number')) {
      showError('Invalid item ID');
      return;
    }

    // Navigate to the appropriate section
    if (window.app) {
      window.app.navigateToSection(type === 'student' ? 'students' : type + 's');
    }
    showToast(`Viewing ${type} with ID: ${id}`, 'info');
  }

  /**
   * Enhanced performance chart rendering
   */
  renderPerformanceChart(performanceData) {
    const chartContainer = document.getElementById('performance-chart');
    if (!chartContainer) return;

    if (!performanceData || !performanceData.gradeDistribution) {
      chartContainer.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-chart-bar"></i>
          <h3>No Performance Data</h3>
          <p>No exam attempts to analyze.</p>
        </div>
      `;
      return;
    }

    // Enhanced metrics with utility formatting
    const metrics = [
      {
        label: 'Average Grade',
        value: formatPercentage(performanceData.averageGrade),
        color: 'primary',
        trend: performanceData.trends?.averageTrend || 0
      },
      {
        label: 'Highest Grade',
        value: formatPercentage(performanceData.highestGrade),
        color: 'success',
        trend: performanceData.trends?.highTrend || 0
      },
      {
        label: 'Lowest Grade',
        value: formatPercentage(performanceData.lowestGrade),
        color: 'error',
        trend: performanceData.trends?.lowTrend || 0
      },
      {
        label: 'Pass Rate',
        value: formatPercentage(performanceData.passRate),
        color: 'warning',
        trend: performanceData.trends?.passTrend || 0
      }
    ];

    const gradeRanges = Object.entries(performanceData.gradeDistribution).map(([range, count]) => ({
      range: sanitizeHtml(range),
      count: formatNumber(count),
      percentage: Math.round((count / performanceData.totalAttempts) * 100),
      formattedPercentage: formatPercentage(Math.round((count / performanceData.totalAttempts) * 100))
    }));

    chartContainer.innerHTML = `
      <div class="performance-metrics">
        ${metrics.map(metric => `
          <div class="metric-card">
            <div class="metric-label">${metric.label}</div>
            <div class="metric-value metric-value-${metric.color}">
              ${metric.value}
              ${metric.trend !== 0 ? `
                <span class="metric-trend ${metric.trend > 0 ? 'positive' : 'negative'}">
                  <i class="fas fa-arrow-${metric.trend > 0 ? 'up' : 'down'}"></i>
                  ${Math.abs(metric.trend)}%
                </span>
              ` : ''}
            </div>
          </div>
        `).join('')}
      </div>
      <div class="score-distribution">
        <h4>Grade Distribution</h4>
        ${gradeRanges.map(item => `
          <div class="distribution-bar">
            <div class="distribution-label">${item.range}</div>
            <div class="distribution-progress">
              <div class="distribution-fill" style="width: ${item.percentage}%"></div>
            </div>
            <div class="distribution-value">
              ${item.count} (${item.formattedPercentage})
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  /**
   * Enhanced trends chart rendering
   */
  renderTrendsChart(trendsData) {
    const chartContainer = document.getElementById('trends-chart');
    if (!chartContainer) return;

    if (!trendsData.dailyTrends || trendsData.dailyTrends.length === 0) {
      chartContainer.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-chart-line"></i>
          <h3>No Trends Data</h3>
          <p>No data available for trend analysis.</p>
        </div>
      `;
      return;
    }

    // Create trends visualization with safe data
    const latestTrends = trendsData.dailyTrends.slice(-7); // Last 7 days

    chartContainer.innerHTML = `
      <div class="trends-summary">
        <h4>Last 7 Days</h4>
        <div class="trends-stats">
          <div class="trend-stat">
            <div class="trend-label">Total Attempts</div>
            <div class="trend-value">${formatNumber(latestTrends.reduce((sum, day) => sum + day.attempts, 0))}</div>
          </div>
          <div class="trend-stat">
            <div class="trend-label">Avg Grade</div>
            <div class="trend-value">${Math.round(latestTrends.reduce((sum, day) => sum + day.averageGrade, 0) / latestTrends.length)}%</div>
          </div>
          <div class="trend-stat">
            <div class="trend-label">Avg Pass Rate</div>
            <div class="trend-value">${formatPercentage(Math.round(latestTrends.reduce((sum, day) => sum + day.passRate, 0) / latestTrends.length))}</div>
          </div>
        </div>
      </div>
      <div class="trends-chart-container">
        <h4>Daily Trends</h4>
        <div class="trends-chart-bars">
          ${latestTrends.map(trend => `
            <div class="trend-bar">
              <div class="trend-bar-fill" style="height: ${Math.min(trend.averageGrade, 100)}%"></div>
              <div class="trend-bar-label">${new Date(trend.date).toLocaleDateString('en-US', {weekday: 'short'})}</div>
              <div class="trend-bar-value">${trend.averageGrade}%</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  /**
   * Enhanced quick actions rendering
   */
  renderQuickActions() {
    const actionsContainer = document.getElementById('quick-actions');
    if (!actionsContainer) return;

    const quickActions = [
      {
        title: 'Add New Student',
        description: 'Register a new student',
        icon: 'fa-user-plus',
        color: 'primary',
        action: 'navigate',
        actionData: 'students'
      },
      {
        title: 'Create Exam',
        description: 'Create a new exam',
        icon: 'fa-file-alt',
        color: 'warning',
        action: 'navigate',
        actionData: 'exams'
      },
      {
        title: 'Add Question',
        description: 'Add a new question',
        icon: 'fa-question-circle',
        color: 'info',
        action: 'navigate',
        actionData: 'questions'
      },
      {
        title: 'View Reports',
        description: 'View detailed reports',
        icon: 'fa-chart-bar',
        color: 'success',
        action: 'export',
        actionData: 'reports'
      }
    ];

    // Sanitize action data
    const safeActions = quickActions.map(action => ({
      ...action,
      title: sanitizeHtml(action.title),
      description: sanitizeHtml(action.description)
    }));

    actionsContainer.innerHTML = safeActions.map(action => `
      <div class="quick-action-card" data-action="${action.action}" data-action-data="${action.actionData}">
        <div class="quick-action-icon quick-action-icon-${action.color}">
          <i class="fas ${action.icon}"></i>
        </div>
        <div class="quick-action-content">
          <div class="quick-action-title">${action.title}</div>
          <div class="quick-action-description">${action.description}</div>
        </div>
        <div class="quick-action-arrow">
          <i class="fas fa-arrow-right"></i>
        </div>
      </div>
    `).join('');

    // Add event listeners
    actionsContainer.querySelectorAll('.quick-action-card').forEach(card => {
      card.addEventListener('click', (e) => {
        const action = e.target.closest('.quick-action-card').dataset.action;
        const actionData = e.target.closest('.quick-action-card').dataset.actionData;
        this.handleQuickAction(action, actionData);
      });
    });
  }

  /**
   * Handle quick action with validation
   */
  handleQuickAction(action, actionData) {
    // Validate action and actionData
    if (!action || !actionData) {
      showError('Invalid quick action');
      return;
    }

    switch (action) {
      case 'navigate':
        if (window.app) {
          window.app.navigateToSection(actionData);
        }
        break;
      case 'export':
        this.exportData('pdf', 'reports');
        break;
      default:
        console.warn('Unknown quick action:', action);
        showError('Unknown action requested');
    }
  }

  /**
   * Enhanced search functionality
   */
  handleSearch(searchTerm) {
    // Validate search term safety
    if (searchTerm && !this.isValidSearchTerm(searchTerm)) {
      showToast('Search term contains invalid characters', 'warning');
      return;
    }

    if (!searchTerm || !searchTerm.trim()) {
      this.clearSearch();
      return;
    }

    // Sanitize search term to prevent XSS
    const sanitizedTerm = sanitizeHtml(searchTerm.trim());

    // Perform search across dashboard sections
    this.filterActivities(sanitizedTerm);
    this.filterStats(sanitizedTerm);
    this.filterCharts(sanitizedTerm);
  }

  /**
   * Clear search results and show all items
   */
  clearSearch() {
    // Show all activity items
    const activityItems = document.querySelectorAll('.activity-item');
    activityItems.forEach(item => {
      item.style.display = 'flex';
      this.removeHighlight(item);
    });

    // Show all stats cards
    const statCards = document.querySelectorAll('.stat-card');
    statCards.forEach(card => {
      card.style.display = 'block';
      this.removeHighlight(card);
    });

    // Show all charts
    const chartContainers = document.querySelectorAll('.chart-container');
    chartContainers.forEach(container => {
      container.style.display = 'block';
    });

    // Clear search input
    const searchInput = document.getElementById('dashboardSearch');
    if (searchInput) {
      searchInput.value = '';
    }

    // Remove any search indicators
    this.removeSearchIndicators();
  }

  /**
   * Filter activities based on search term
   */
  filterActivities(searchTerm) {
    const activityItems = document.querySelectorAll('.activity-item');
    const searchLower = searchTerm.toLowerCase();

    activityItems.forEach(item => {
      const text = item.textContent.toLowerCase();
      const matches = text.includes(searchLower);
      item.style.display = matches ? 'flex' : 'none';

      if (matches && searchTerm) {
        this.highlightText(item, searchTerm);
      } else {
        this.removeHighlight(item);
      }
    });
  }

  /**
   * Filter stats based on search term
   */
  filterStats(searchTerm) {
    const statCards = document.querySelectorAll('.stat-card');
    const searchLower = searchTerm.toLowerCase();

    statCards.forEach(card => {
      const text = card.textContent.toLowerCase();
      const matches = text.includes(searchLower);
      card.style.display = matches ? 'block' : 'none';

      if (matches && searchTerm) {
        this.highlightText(card, searchTerm);
      } else {
        this.removeHighlight(card);
      }
    });
  }

  /**
   * Filter charts based on search term
   */
  filterCharts(searchTerm) {
    const chartContainers = document.querySelectorAll('.chart-container');
    const searchLower = searchTerm.toLowerCase();

    chartContainers.forEach(container => {
      const text = container.textContent.toLowerCase();
      const matches = text.includes(searchLower);
      container.style.display = matches ? 'block' : 'none';
    });
  }

  /**
   * Highlight search term in element
   */
  highlightText(element, searchTerm) {
    const text = element.innerHTML;
    const regex = new RegExp(`(${this.escapeRegex(searchTerm)})`, 'gi');
    const highlighted = text.replace(regex, '<mark class="search-highlight">$1</mark>');
    element.innerHTML = highlighted;
  }

  /**
   * Remove highlighting from element
   */
  removeHighlight(element) {
    const text = element.innerHTML;
    const unhighlighted = text.replace(/<mark class="search-highlight">(.*?)<\/mark>/gi, '$1');
    element.innerHTML = unhighlighted;
  }

  /**
   * Escape special characters for regex
   */
  escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /**
   * Remove search indicators
   */
  removeSearchIndicators() {
    const highlights = document.querySelectorAll('.search-highlight');
    highlights.forEach(highlight => {
      highlight.outerHTML = highlight.innerHTML;
    });
  }

  /**
   * Enhanced refresh dashboard
   */
  async refreshDashboard() {
    try {
      showLoading('Refreshing dashboard...');
      await this.loadDashboardData();
      showToast('Dashboard refreshed successfully', 'success');
      hideLoading();
    } catch (error) {
      console.error('Failed to refresh dashboard:', error);
      this.handleError(error, 'dashboard refresh');
      hideLoading();
    }
  }

  /**
   * Setup auto refresh
   */
  setupAutoRefresh() {
    const autoRefreshEnabled = localStorage.getItem('autoRefresh') === 'true';
    const autoRefreshToggle = document.getElementById('autoRefreshToggle');

    if (autoRefreshToggle) {
      autoRefreshToggle.checked = autoRefreshEnabled;
    }

    this.autoRefreshEnabled = autoRefreshEnabled;

    if (autoRefreshEnabled) {
      this.startAutoRefresh();
    }
  }

  /**
   * Toggle auto refresh
   */
  toggleAutoRefresh(enabled) {
    // Validate input
    if (typeof enabled !== 'boolean') {
      showError('Invalid auto-refresh setting');
      return;
    }

    this.autoRefreshEnabled = enabled;
    localStorage.setItem('autoRefresh', enabled);

    if (enabled) {
      this.startAutoRefresh();
      showToast('Auto-refresh enabled', 'success');
    } else {
      this.stopAutoRefresh();
      showToast('Auto-refresh disabled', 'info');
    }
  }

  /**
   * Start auto refresh
   */
  startAutoRefresh() {
    // Refresh every 30 seconds
    this.refreshInterval = setInterval(() => {
      this.refreshDashboard();
    }, 30000);
  }

  /**
   * Stop auto refresh
   */
  stopAutoRefresh() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }
  }

  /**
   * Enhanced time range change with validation
   */
  async changeTimeRange(range) {
    try {
      // Validate time range
      if (!this.isValidTimeRange(range)) {
        showError('Invalid time range selected');
        return;
      }

      showLoading('Updating time range...');

      // Store current time range
      localStorage.setItem('timeRange', range);
      this.currentTimeRange = range;

      // Reload data with new time range
      await this.loadDashboardData();

      showToast(`Time range changed to ${range}`, 'info');
      hideLoading();
    } catch (error) {
      console.error('Failed to change time range:', error);
      this.handleError(error, 'time range change');
      hideLoading();
    }
  }

  /**
   * Enhanced export with validation
   */
  /**
   * Enhanced data export with network utilities
   */
  async exportData(format, dataType) {
    try {
      // Validate export parameters
      const exportValidation = this.validateExportParams(format, dataType);
      if (!exportValidation.valid) {
        showError(`Export validation failed: ${exportValidation.errors.join(', ')}`);
        return;
      }

      // Check network connection for large exports
      if (!this.networkStatus.online) {
        showError('No internet connection. Cannot export data.');
        return;
      }

      showLoading(`Exporting ${dataType} as ${format}...`);

      const confirmation = await showConfirm(
          `Export ${dataType} as ${format.toUpperCase()}?`,
          'This may take a few moments.'
      );

      if (!confirmation) {
        hideLoading();
        return;
      }

      const data = await this.generateExportData(dataType);

      // Validate export data
      if (!this.isValidExportData(data, dataType)) {
        throw new Error('Export data validation failed');
      }

      // Use network utilities for export
      switch (format) {
        case 'csv':
          await this.enhancedExportToCSV(data, dataType);
          break;
        case 'json':
          await this.enhancedExportToJSON(data, dataType);
          break;
        case 'pdf':
          this.exportToPDF(data, dataType);
          break;
        default:
          throw new Error(`Unsupported format: ${format}`);
      }

      showToast(`Successfully exported ${dataType} as ${format.toUpperCase()}`, 'success');
    } catch (error) {
      console.error('Export failed:', error);
      this.handleError(error, 'data export');
    } finally {
      hideLoading();
    }
  }

  /**
   * Enhanced CSV export with network utilities
   */
  async enhancedExportToCSV(data, filename) {
    const csvContent = this.convertToCSV(data);

    // Create blob and download
    const blob = new Blob([csvContent], {type: 'text/csv'});
    const url = URL.createObjectURL(blob);

    // Use network utility for download
    downloadFile(url, `${filename}-${new Date().toISOString().split('T')[0]}.csv`, {
      onProgress: (percent) => {
        console.log(`Download progress: ${percent}%`);
      }
    });

    // Clean up
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  /**
   * Enhanced JSON export with network utilities
   */
  async enhancedExportToJSON(data, filename) {
    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], {type: 'application/json'});
    const url = URL.createObjectURL(blob);

    downloadFile(url, `${filename}-${new Date().toISOString().split('T')[0]}.json`);

    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  /**
   * Generate report data with validation
   */
  async generateReportData() {
    const [
      stats,
      students,
      exams,
      attempts
    ] = await Promise.allSettled([
      this.loadStats(),
      studentsAPI.getAll({page: 0, size: 100}),
      examsAPI.getAll({page: 0, size: 100}),
      attemptsAPI.getAll({page: 0, size: 100})
    ]);

    return {
      summary: this.validateApiResult(stats, 'stats')?.summary || {},
      students: this.validateApiResult(students, 'students')?.data?.content || [],
      exams: this.validateApiResult(exams, 'exams')?.data?.content || [],
      attempts: this.validateApiResult(attempts, 'attempts')?.data?.content || [],
      generatedAt: new Date().toISOString()
    };
  }

  /**
   * Export to PDF
   */
  exportToPDF(data, filename) {
    showToast('PDF export requires additional setup. Please implement PDF library.', 'warning');
  }

  /**
   * Convert data to CSV format
   */
  convertToCSV(data) {
    const content = data.data?.content || data.content || [];
    if (content.length === 0) return '';

    const headers = Object.keys(content[0]);
    const csvRows = [headers.join(',')];

    content.forEach(item => {
      const values = headers.map(header => {
        const value = item[header];
        return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
      });
      csvRows.push(values.join(','));
    });

    return csvRows.join('\n');
  }

  /**
   * Handle resize with utility functions
   */
  handleResize() {
    // Re-render charts if they exist
    Object.values(this.charts).forEach(chart => {
      if (chart && typeof chart.resize === 'function') {
        chart.resize();
      }
    });

    // Adjust layout for mobile
    if (window.innerWidth < 768) {
      this.enableMobileLayout();
    } else {
      this.disableMobileLayout();
    }
  }

  // VALIDATION HELPER METHODS

  /**
   * Validate dashboard configuration
   */
  validateConfiguration() {
    const config = {
      timeRange: this.currentTimeRange,
      autoRefresh: this.autoRefreshEnabled
    };

    return validateObject(config, {
      timeRange: {
        required: true,
        type: 'string',
        validate: (value) => {
          const validRanges = ['7d', '30d', '90d', '1y', 'all'];
          return validRanges.includes(value) || 'Invalid time range';
        }
      },
      autoRefresh: {type: 'boolean'}
    });
  }

  /**
   * Validate search term
   */
  isValidSearchTerm(term) {
    if (!term || typeof term !== 'string') return true;

    const dangerousPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi
    ];

    return !dangerousPatterns.some(pattern => pattern.test(term));
  }

  /**
   * Validate time range
   */
  isValidTimeRange(range) {
    const validRanges = ['7d', '30d', '90d', '1y', 'all'];
    return validRanges.includes(range);
  }

  /**
   * Validate export parameters
   */
  validateExportParams(format, dataType) {
    const result = {
      valid: true,
      errors: []
    };

    const validFormats = ['csv', 'json', 'pdf'];
    if (!validFormats.includes(format)) {
      result.valid = false;
      result.errors.push(`Invalid export format: ${format}`);
    }

    const validDataTypes = ['students', 'exams', 'attempts', 'questions', 'reports'];
    if (!validDataTypes.includes(dataType)) {
      result.valid = false;
      result.errors.push(`Invalid data type: ${dataType}`);
    }

    return result;
  }

  /**
   * Validate export data
   */
  isValidExportData(data, dataType) {
    if (!data || typeof data !== 'object') {
      return false;
    }

    switch (dataType) {
      case 'students':
        return Array.isArray(data) && data.every(student =>
            student && typeof student === 'object' && student.ssn
        );
      case 'exams':
        return Array.isArray(data) && data.every(exam =>
            exam && typeof exam === 'object' && exam.examId
        );
      case 'attempts':
        return Array.isArray(data) && data.every(attempt =>
            attempt && typeof attempt === 'object' && attempt.attemptId
        );
      case 'reports':
        return data.summary && typeof data.summary === 'object';
      default:
        return true;
    }
  }

  /**
   * Validate API result
   */
  validateApiResult(result, context) {
    if (result.status === 'rejected') {
      console.warn(`API call rejected for ${context}:`, result.reason);
      return null;
    }

    if (!result.value || typeof result.value !== 'object') {
      console.warn(`Invalid API response for ${context}:`, result.value);
      return null;
    }

    return result.value;
  }

  /**
   * Validate student object
   */
  isValidStudent(student) {
    return student &&
        typeof student === 'object' &&
        student.ssn &&
        student.firstName &&
        student.lastName;
  }

  /**
   * Validate attempt object
   */
  isValidAttempt(attempt) {
    return attempt &&
        typeof attempt === 'object' &&
        attempt.attemptId &&
        isValidNumber(attempt.grade, {min: 0, max: 100});
  }

  /**
   * Validate exam object
   */
  isValidExam(exam) {
    return exam &&
        typeof exam === 'object' &&
        exam.examId &&
        exam.title;
  }

  /**
   * Validate question object
   */
  isValidQuestion(question) {
    return question &&
        typeof question === 'object' &&
        question.questionId &&
        question.questionText;
  }

  /**
   * Calculate performance trends
   */
  calculatePerformanceTrends(attempts) {
    if (!isNonEmptyArray(attempts)) return {};

    // Simple trend calculation (you can enhance this)
    const recentAttempts = attempts.slice(0, 10);
    const olderAttempts = attempts.slice(10, 20);

    if (!isNonEmptyArray(recentAttempts) || !isNonEmptyArray(olderAttempts)) {
      return {};
    }

    const recentAvg = recentAttempts.reduce((sum, a) => sum + (a.grade || 0), 0) / recentAttempts.length;
    const olderAvg = olderAttempts.reduce((sum, a) => sum + (a.grade || 0), 0) / olderAttempts.length;

    const trend = olderAvg > 0 ? ((recentAvg - olderAvg) / olderAvg) * 100 : 0;

    return {
      averageTrend: Math.round(trend),
      highTrend: Math.round(trend * 1.2),
      lowTrend: Math.round(trend * 0.8),
      passTrend: Math.round(trend * 1.1)
    };
  }

  /**
   * Enhanced error handling with network context
   */
  handleError(error, context) {
    if (!error || typeof error !== 'object') {
      console.error('Invalid error object received:', error);
      showError('An unexpected error occurred');
      return;
    }

    // Add network context to error
    const networkContext = this.getNetworkStatus();
    error.networkContext = networkContext;

    const safeMessage = sanitizeHtml(
        error.message || error.response?.data?.message || 'An error occurred'
    );

    console.error(`Error in ${context}:`, error, 'Network context:', networkContext);

    // Show appropriate message based on error type
    if (error.name === 'AbortError') {
      showToast('Request timeout. Please try again.', 'warning');
    } else if (error.message.includes('Failed to fetch')) {
      showToast('Network error. Please check your connection.', 'error');
    } else {
      showError(safeMessage);
    }
  }


  /**
   * Enable mobile layout
   */
  enableMobileLayout() {
    document.body.classList.add('mobile-layout');
  }

  /**
   * Disable mobile layout
   */
  disableMobileLayout() {
    document.body.classList.remove('mobile-layout');
  }

  /**
   * Enhanced cleanup with network resources
   */
  destroy() {
    // Cleanup network interceptors
    if (this.requestInterceptorCleanup) {
      this.requestInterceptorCleanup();
    }
    if (this.responseInterceptorCleanup) {
      this.responseInterceptorCleanup();
    }

    // Remove network event listeners
    window.removeEventListener('online', this.handleOnline);
    window.removeEventListener('offline', this.handleOffline);

    if (navigator.connection) {
      navigator.connection.removeEventListener('change', this.handleConnectionChange);
    }

    // Stop auto refresh
    this.stopAutoRefresh();

    // Cleanup charts
    Object.values(this.charts).forEach(chart => {
      if (chart && typeof chart.destroy === 'function') {
        chart.destroy();
      }
    });

    // Remove other event listeners
    window.removeEventListener('resize', this.handleResize);
    window.removeEventListener('online', this.handleOnline);
    window.removeEventListener('offline', this.handleOffline);

    console.log('Dashboard cleanup completed');
    showToast('Dashboard cleanup completed', 'info');
  }
}
// Initialize dashboard with error handling
function initializeDashboard() {
  try {
    if (window.dashboardComponent) {
      window.dashboardComponent.destroy();
    }

    window.dashboardComponent = new DashboardComponent();
  } catch (error) {
    console.error('Failed to initialize dashboard:', error);
    showError('Failed to initialize dashboard. Please refresh the page.');
  }
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeDashboard);
} else {
  initializeDashboard();
}

// Export for testing and manual initialization
window.initializeDashboard = initializeDashboard;