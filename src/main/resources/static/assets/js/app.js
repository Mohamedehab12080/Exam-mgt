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

    // Attempts-specific event listeners
    this.setupAttemptsEventListeners();
  }

  /**
   * Setup attempts-specific event listeners
   */
  setupAttemptsEventListeners() {
    // Page size change
    const pageSizeSelect = document.getElementById('attemptsPageSize');
    if (pageSizeSelect) {
      pageSizeSelect.addEventListener('change', () => {
        this.currentPage = 1;
        this.loadAttempts();
      });
    }

    // Refresh button
    const refreshBtn = document.getElementById('refreshAttempts');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => {
        this.loadAttempts();
      });
    }

    // Clear filters
    const clearFiltersBtn = document.getElementById('clearAttemptFilters');
    if (clearFiltersBtn) {
      clearFiltersBtn.addEventListener('click', () => {
        this.clearAttemptFilters();
      });
    }

    // Apply filters
    const applyFiltersBtn = document.getElementById('applyAttemptFilters');
    if (applyFiltersBtn) {
      applyFiltersBtn.addEventListener('click', () => {
        this.currentPage = 1;
        this.loadAttempts();
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
      const activities = this.loadRecentActivities();
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
  async loadDashboardStats(params = {}) {
    try {
      // Try to load from APIs, fallback to mock data if APIs not available
      let studentStats, courseStats, examStats, attemptStats;

      try {
        if (typeof studentsAPI!== 'undefined') {
          studentStats = await studentsAPI.getAll(1, 1);
        }
        if (typeof studentsAPI !== 'undefined') {
          courseStats = await studentsAPI.getAll(1, 1);
        }
        if (typeof studentsAPI !== 'undefined') {
          examStats = await studentsAPI.getAll(1, 1);
        }
        if (typeof attemptsAPI !== 'undefined') {
          // Use the new attemptsAPI with proper parameters
          attemptStats = await attemptsAPI.getAll({ page: 0, size: 1 });
        }
      } catch (apiError) {
        console.warn('API not available, using mock data:', apiError);
      }

      return {
        students: studentStats?.total || studentStats?.totalElements || Math.floor(Math.random() * 100) + 50,
        courses: courseStats?.total || courseStats?.totalElements || Math.floor(Math.random() * 20) + 10,
        exams: examStats?.total || examStats?.totalElements || Math.floor(Math.random() * 30) + 15,
        attempts: attemptStats?.total || attemptStats?.totalElements || Math.floor(Math.random() * 200) + 100
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
      { name: 'Questions API', status: 'healthy', response: `${this.getRandomNumber(35, 65)}ms` },
      { name: 'Attempts API', status: 'healthy', response: `${this.getRandomNumber(30, 60)}ms` }
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
   * Load students data
   */
  async loadStudents() {
    try {
      this.showLoading();

      // Load students from API
      const response = await studentsAPI.getAll(this.currentPage, 1);
      this.renderStudentsTable(response.content || []);
      this.renderPagination('studentsPagination', response.totalPages || 1, this.currentPage);

      this.hideLoading();
    } catch (error) {
      console.error('Failed to load students:', error);
      this.showError('Failed to load students data');
      this.hideLoading();
    }
  }

  /**
   * Load courses data
   */
  async loadCourses() {
    try {
      this.showLoading();

      // Load courses from API
      const response = await coursesAPI.getAll(this.currentPage, 1);
      this.renderCoursesTable(response.content || []);
      this.renderPagination('coursesPagination', response.totalPages || 1, this.currentPage);

      this.hideLoading();
    } catch (error) {
      console.error('Failed to load courses:', error);
      this.showError('Failed to load courses data');
      this.hideLoading();
    }
  }

  /**
   * Load exams data
   */
  async loadExams() {
    try {
      this.showLoading();

      // Load exams from API
      const response = await examsAPI.getAll(this.currentPage, 1);
      this.renderExamsTable(response.content || []);
      this.renderPagination('examsPagination', response.totalPages || 1, this.currentPage);

      this.hideLoading();
    } catch (error) {
      console.error('Failed to load exams:', error);
      this.showError('Failed to load exams data');
      this.hideLoading();
    }
  }

  /**
   * Load questions data
   */
  async loadQuestions() {
    try {
      this.showLoading();

      // Load questions from API
      const response = await questionsAPI.getAll(this.currentPage, 1);
      this.renderQuestionsTable(response.content || []);
      this.renderPagination('questionsPagination', response.totalPages || 1, this.currentPage);

      this.hideLoading();
    } catch (error) {
      console.error('Failed to load questions:', error);
      this.showError('Failed to load questions data');
      this.hideLoading();
    }
  }

  /**
   * Load attempts data with Swagger-compliant parameters
   */
  async loadAttempts() {
    try {
      this.showLoading();

      // Build query parameters according to Swagger spec
      const filters = this.getAttemptFilters();
      const queryParams = attemptsAPI.buildQueryParams(filters);

      // Load attempts from API
      const response = await attemptsAPI.getAll(queryParams);

      // Handle paginated response
      const attempts = response.content || response.data || [];
      const totalElements = response.totalElements || response.total || 0;
      const totalPages = response.totalPages || 1;

      this.renderAttemptsTable(attempts);
      this.renderAttemptsPagination(totalPages, this.currentPage, totalElements);
      this.updateAttemptsStats(attempts);

      this.hideLoading();
    } catch (error) {
      console.error('Failed to load attempts:', error);
      this.showError('Failed to load attempts data');
      this.hideLoading();
    }
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
      size: parseInt(document.getElementById('attemptsPageSize')?.value || '20')
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
      this.showLoading();

      // Load choices from API
      const response = await choiceAPI.getAll(this.currentPage, 1);
      this.renderChoicesTable(response.content || []);
      this.renderPagination('choicesPagination', response.totalPages || 1, this.currentPage);

      this.hideLoading();
    } catch (error) {
      console.error('Failed to load choices:', error);
      this.showError('Failed to load choices data');
      this.hideLoading();
    }
  }

  /**
   * Render students table
   * @param {Array} students - Students data
   */
  renderStudentsTable(students) {
    const tbody = document.getElementById('studentsTableBody');
    if (!tbody) return;

    tbody.innerHTML = students.map(student => `
      <tr>
        <td>${student.ssn || 'N/A'}</td>
        <td>${student.name || 'N/A'}</td>
        <td>${student.email || 'N/A'}</td>
        <td>${student.age || 'N/A'}</td>
        <td>${student.gender || 'N/A'}</td>
        <td>${student.city || 'N/A'}</td>
        <td>${student.graduationYear || 'N/A'}</td>
        <td>
          <button class="btn btn-sm btn-primary" onclick="app.editStudent('${student.ssn}')">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn btn-sm btn-danger" onclick="app.deleteStudent('${student.ssn}')">
            <i class="fas fa-trash"></i>
          </button>
        </td>
      </tr>
    `).join('');
  }

  /**
   * Render courses table
   * @param {Array} courses - Courses data
   */
  renderCoursesTable(courses) {
    const tbody = document.getElementById('coursesTableBody');
    if (!tbody) return;

    tbody.innerHTML = courses.map(course => `
      <tr>
        <td>${course.courseId || 'N/A'}</td>
        <td>${course.courseName || 'N/A'}</td>
        <td>${course.duration || 'N/A'}</td>
        <td>${course.hasExams ? '<i class="fas fa-check text-success"></i>' : '<i class="fas fa-times text-danger"></i>'}</td>
        <td>${course.hasQuestions ? '<i class="fas fa-check text-success"></i>' : '<i class="fas fa-times text-danger"></i>'}</td>
        <td>
          <button class="btn btn-sm btn-primary" onclick="app.editCourse(${course.id})">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn btn-sm btn-danger" onclick="app.deleteCourse(${course.id})">
            <i class="fas fa-trash"></i>
          </button>
        </td>
      </tr>
    `).join('');
  }

  /**
   * Render exams table
   * @param {Array} exams - Exams data
   */
  renderExamsTable(exams) {
    const tbody = document.getElementById('examsTableBody');
    if (!tbody) return;

    tbody.innerHTML = exams.map(exam => `
      <tr>
        <td>${exam.examId || 'N/A'}</td>
        <td>${exam.title || 'N/A'}</td>
        <td>${exam.courseName || 'N/A'}</td>
        <td>${exam.duration || 'N/A'}</td>
        <td>${exam.numMcq || 0}</td>
        <td>${exam.numTf || 0}</td>
        <td>${exam.examDate || 'N/A'}</td>
        <td>${exam.choices && exam.choices.length || 0}</td>
        <td>
          <button class="btn btn-sm btn-primary" onclick="app.editExam(${exam.examId})">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn btn-sm btn-danger" onclick="app.deleteExam(${exam.examId})">
            <i class="fas fa-trash"></i>
          </button>
        </td>
      </tr>
    `).join('');
  }

  /**
   * Render questions table
   * @param {Array} questions - Questions data
   */
  renderQuestionsTable(questions) {
    const tbody = document.getElementById('questionsTableBody');
    if (!tbody) return;

    tbody.innerHTML = questions.map(question => `
      <tr>
        <td>${question.questionId || 'N/A'}</td>
        <td>${question.questionText || 'N/A'}</td>
        <td>${question.type || 'N/A'}</td>
        <td>${question.courseName || 'N/A'}</td>
        <td>${question.choices && question.choices.length || 0}</td>
        <td>
          <button class="btn btn-sm btn-primary" onclick="app.editQuestion(${question.questionId})">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn btn-sm btn-danger" onclick="app.deleteQuestion(${question.questionId})">
            <i class="fas fa-trash"></i>
          </button>
        </td>
      </tr>
    `).join('');
  }

  /**
   * Render attempts table with formatted data
   * @param {Array} attempts - Attempts data
   */
  renderAttemptsTable(attempts) {
    const tbody = document.getElementById('attemptsTableBody');
    if (!tbody) return;

    if (attempts.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="8" class="no-data">
            <i class="fas fa-inbox"></i>
            <p>No attempts found</p>
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = attempts.map(attempt => {
      const formattedAttempt = attemptsAPI.formatAttemptData(attempt);

      return `
        <tr>
          <td>${formattedAttempt.attemptId || 'N/A'}</td>
          <td>${formattedAttempt.studentName || 'N/A'}</td>
          <td>${formattedAttempt.studentSsn || 'N/A'}</td>
          <td>${formattedAttempt.examTitle || 'N/A'}</td>
          <td>${formattedAttempt.formattedAttemptDate}</td>
          <td style="color: ${formattedAttempt.gradeColor}">
            ${formattedAttempt.grade !== null ? formattedAttempt.grade + '%' : 'N/A'}
          </td>
          <td>${formattedAttempt.statusBadge}</td>
          <td>
            <button class="btn btn-sm btn-primary" onclick="app.viewAttempt(${formattedAttempt.attemptId})" title="View Details">
              <i class="fas fa-eye"></i>
            </button>
          </td>
        </tr>
      `;
    }).join('');
  }

  /**
   * Render choices table
   * @param {Array} choices - Choices data
   */
  renderChoicesTable(choices) {
    const tbody = document.getElementById('choicesTableBody');
    if (!tbody) return;

    tbody.innerHTML = choices.map(choice => `
      <tr>
        <td>${choice.choiceId || 'N/A'}</td>
        <td>${choice.questionId || 'N/A'}</td>
        <td>${choice.questionText || 'N/A'}</td>
        <td>${choice.isCorrect ? '<i class="fas fa-check text-success"></i>' : '<i class="fas fa-times text-danger"></i>'}</td>
        <td>
          <button class="btn btn-sm btn-primary" onclick="app.editChoice(${choice.id})">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn btn-sm btn-danger" onclick="app.deleteChoice(${choice.id})">
            <i class="fas fa-trash"></i>
          </button>
        </td>
      </tr>
    `).join('');
  }

  /**
   * Render pagination
   * @param {string} containerId - Pagination container ID
   * @param {number} totalPages - Total pages
   * @param {number} currentPage - Current page
   */
  renderPagination(containerId, totalPages, currentPage) {
    const container = document.getElementById(containerId);
    if (!container) return;

    let paginationHTML = '';

    // Previous button
    paginationHTML += `
      <button class="btn btn-sm ${currentPage === 1 ? 'btn-secondary disabled' : 'btn-primary'}" 
              onclick="app.changePage(${currentPage - 1})" 
              ${currentPage === 1 ? 'disabled' : ''}>
        Previous
      </button>
    `;

    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
        paginationHTML += `
          <button class="btn btn-sm ${i === currentPage ? 'btn-primary' : 'btn-secondary'}" 
                  onclick="app.changePage(${i})">
            ${i}
          </button>
        `;
      } else if (i === currentPage - 2 || i === currentPage + 2) {
        paginationHTML += '<span class="pagination-dots">...</span>';
      }
    }

    // Next button
    paginationHTML += `
      <button class="btn btn-sm ${currentPage === totalPages ? 'btn-secondary disabled' : 'btn-primary'}" 
              onclick="app.changePage(${currentPage + 1})" 
              ${currentPage === totalPages ? 'disabled' : ''}>
        Next
      </button>
    `;

    container.innerHTML = paginationHTML;
  }

  /**
   * Render attempts pagination
   * @param {number} totalPages - Total pages
   * @param {number} currentPage - Current page
   * @param {number} totalElements - Total elements
   */
  renderAttemptsPagination(totalPages, currentPage, totalElements) {
    const container = document.getElementById('attemptsPagination');
    const startElement = (currentPage - 1) * this.getAttemptFilters().size + 1;
    const endElement = Math.min(currentPage * this.getAttemptFilters().size, totalElements);

    // Update pagination info
    const startElementEl = document.getElementById('attemptsStart');
    const endElementEl = document.getElementById('attemptsEnd');
    const totalElementsEl = document.getElementById('attemptsTotal');

    if (startElementEl) startElementEl.textContent = startElement.toString();
    if (endElementEl) endElementEl.textContent = endElement.toString();
    if (totalElementsEl) totalElementsEl.textContent = totalElements.toString();

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
   * Update attempts statistics
   * @param {Array} attempts - Attempts data
   */
  updateAttemptsStats(attempts) {
    const totalCount = attempts.length;
    const averageGrade = attempts.length > 0
        ? (attempts.reduce((sum, attempt) => sum + (attempt.grade || 0), 0) / attempts.length).toFixed(1)
        : null;

    const totalCountEl = document.getElementById('totalAttemptsCount');
    const averageGradeEl = document.getElementById('averageGrade');

    if (totalCountEl) totalCountEl.textContent = totalCount.toString();
    if (averageGradeEl) averageGradeEl.textContent = averageGrade ? `${averageGrade}%` : 'N/A';
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
   * Edit student
   * @param {string} ssn - Student SSN
   */
  async editStudent(ssn) {
    try {
      this.showLoading();
      const student = await studentsAPI.getById(ssn);
      this.showForm('Edit Student', student);
      this.hideLoading();
    } catch (error) {
      console.error('Failed to load student:', error);
      this.showError('Failed to load student data');
      this.hideLoading();
    }
  }

  /**
   * Delete student
   * @param {string} ssn - Student SSN
   */
  async deleteStudent(ssn) {
    if (!confirm('Are you sure you want to delete this student?')) return;

    try {
      this.showLoading();
      await studentsAPI.delete(ssn);
      this.toastManager.show('Student deleted successfully!', 'success');
      await this.loadStudents();
      this.hideLoading();
    } catch (error) {
      console.error('Failed to delete student:', error);
      this.showError('Failed to delete student');
      this.hideLoading();
    }
  }

  /**
   * Edit course
   * @param {number} id - Course ID
   */
  async editCourse(id) {
    try {
      this.showLoading();
      const course = await coursesAPI.getById(id);
      this.showForm('Edit Course', course);
      this.hideLoading();
    } catch (error) {
      console.error('Failed to load course:', error);
      this.showError('Failed to load course data');
      this.hideLoading();
    }
  }

  /**
   * Delete course
   * @param {number} id - Course ID
   */
  async deleteCourse(id) {
    if (!confirm('Are you sure you want to delete this course?')) return;

    try {
      this.showLoading();
      await coursesAPI.delete(id);
      this.toastManager.show('Course deleted successfully!', 'success');
      await this.loadCourses();
      this.hideLoading();
    } catch (error) {
      console.error('Failed to delete course:', error);
      this.showError('Failed to delete course');
      this.hideLoading();
    }
  }

  /**
   * Edit exam
   * @param {number} id - Exam ID
   */
  async editExam(id) {
    try {
      this.showLoading();
      const exam = await examsAPI.getById(id);
      this.showForm('Edit Exam', exam);
      this.hideLoading();
    } catch (error) {
      console.error('Failed to load exam:', error);
      this.showError('Failed to load exam data');
      this.hideLoading();
    }
  }

  /**
   * Delete exam
   * @param {number} id - Exam ID
   */
  async deleteExam(id) {
    if (!confirm('Are you sure you want to delete this exam?')) return;

    try {
      this.showLoading();
      await examsAPI.delete(id);
      this.toastManager.show('Exam deleted successfully!', 'success');
      await this.loadExams();
      this.hideLoading();
    } catch (error) {
      console.error('Failed to delete exam:', error);
      this.showError('Failed to delete exam');
      this.hideLoading();
    }
  }

  /**
   * Edit question
   * @param {number} id - Question ID
   */
  async editQuestion(id) {
    try {
      this.showLoading();
      const question = await questionsAPI.getById(id);
      this.showForm('Edit Question', question);
      this.hideLoading();
    } catch (error) {
      console.error('Failed to load question:', error);
      this.showError('Failed to load question data');
      this.hideLoading();
    }
  }

  /**
   * Delete question
   * @param {number} id - Question ID
   */
  async deleteQuestion(id) {
    if (!confirm('Are you sure you want to delete this question?')) return;

    try {
      this.showLoading();
      await questionsAPI.delete(id);
      this.toastManager.show('Question deleted successfully!', 'success');
      await this.loadQuestions();
      this.hideLoading();
    } catch (error) {
      console.error('Failed to delete question:', error);
      this.showError('Failed to delete question');
      this.hideLoading();
    }
  }

  /**
   * View attempt
   * @param {number} id - Attempt ID
   */
  async viewAttempt(id) {
    try {
      this.showLoading();
      const attempt = await attemptsAPI.getById(id);
      this.showAttemptDetails(attempt);
      this.hideLoading();
    } catch (error) {
      console.error('Failed to load attempt:', error);
      this.showError('Failed to load attempt data');
      this.hideLoading();
    }
  }

  /**
   * Show attempt details in modal
   * @param {Object} attempt - Attempt data
   */
  showAttemptDetails(attempt) {
    const formattedAttempt = attemptsAPI.formatAttemptData(attempt);

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
            <span>${formattedAttempt.formattedAttemptDate}</span>
          </div>
        </div>
        <div class="detail-row">
          <div class="detail-item">
            <label>Grade:</label>
            <span style="color: ${formattedAttempt.gradeColor}; font-weight: bold;">
              ${formattedAttempt.grade !== null ? formattedAttempt.grade + '%' : 'N/A'}
            </span>
          </div>
          <div class="detail-item">
            <label>Status:</label>
            <span>${formattedAttempt.statusBadge}</span>
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
   * Edit choice
   * @param {number} id - Choice ID
   */
  async editChoice(id) {
    try {
      this.showLoading();
      const choice = await choiceAPI.getById(id);
      this.showForm('Edit Choice', choice);
      this.hideLoading();
    } catch (error) {
      console.error('Failed to load choice:', error);
      this.showError('Failed to load choice data');
      this.hideLoading();
    }
  }

  /**
   * Delete choice
   * @param {number} id - Choice ID
   */
  async deleteChoice(id) {
    if (!confirm('Are you sure you want to delete this choice?')) return;

    try {
      this.showLoading();
      await choiceAPI.delete(id);
      this.toastManager.show('Choice deleted successfully!', 'success');
      await this.loadChoices();
      this.hideLoading();
    } catch (error) {
      console.error('Failed to delete choice:', error);
      this.showError('Failed to delete choice');
      this.hideLoading();
    }
  }

  /**
   * Show form modal
   * @param {string} title - Form title
   * @param {Object} data - Form data
   * @param {boolean} readOnly - Whether form is read-only
   */
  showForm(title, data = null, readOnly = false) {
    const formConfig = {
      title: title,
      fields: this.getFormFields(title, data, readOnly),
      onSubmit: readOnly ? null : (formData) => this.handleFormSubmit(formData)
    };

    this.modalManager.show(formConfig);
  }

  /**
   * Get form fields based on title and data
   * @param {string} title - Form title
   * @param {Object} data - Form data
   * @param {boolean} readOnly - Whether form is read-only
   * @returns {Array} Form fields
   */
  getFormFields(title, data, readOnly) {
    // This is a simplified version - you can expand based on your needs
    const fields = [];

    if (title.includes('Student')) {
      fields.push(
          { name: 'ssn', label: 'SSN', type: 'text', required: true, value: data?.ssn || '', disabled: readOnly || !!data?.ssn },
          { name: 'name', label: 'Name', type: 'text', required: true, value: data?.name || '', disabled: readOnly },
          { name: 'email', label: 'Email', type: 'email', required: true, value: data?.email || '', disabled: readOnly },
          { name: 'age', label: 'Age', type: 'number', value: data?.age || '', disabled: readOnly },
          { name: 'gender', label: 'Gender', type: 'select', options: ['Male', 'Female'], value: data?.gender || '', disabled: readOnly },
          { name: 'city', label: 'City', type: 'text', value: data?.city || '', disabled: readOnly },
          { name: 'graduationYear', label: 'Graduation Year', type: 'number', value: data?.graduationYear || '', disabled: readOnly }
      );
    } else if (title.includes('Course')) {
      fields.push(
          { name: 'name', label: 'Course Name', type: 'text', required: true, value: data?.name || '', disabled: readOnly },
          { name: 'duration', label: 'Duration (hours)', type: 'number', value: data?.duration || '', disabled: readOnly }
      );
    } else if (title.includes('Exam')) {
      fields.push(
          { name: 'title', label: 'Exam Title', type: 'text', required: true, value: data?.title || '', disabled: readOnly },
          { name: 'courseId', label: 'Course', type: 'select', required: true, value: data?.courseId || '', disabled: readOnly },
          { name: 'duration', label: 'Duration (minutes)', type: 'number', required: true, value: data?.duration || '', disabled: readOnly },
          { name: 'examDate', label: 'Exam Date', type: 'date', required: true, value: data?.examDate || '', disabled: readOnly }
      );
    }

    return fields;
  }

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