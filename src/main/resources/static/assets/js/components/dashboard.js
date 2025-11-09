// Dashboard Component
class DashboardComponent {
  constructor() {
    this.charts = {};
    this.refreshInterval = null;
    this.autoRefreshEnabled = false;
    
    this.init();
  }

  /**
   * Initialize dashboard component
   */
  init() {
    this.setupEventListeners();
    this.loadDashboardData();
    this.setupAutoRefresh();
    
    console.log('Dashboard component initialized');
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Refresh button
    const refreshBtn = document.getElementById('refreshDashboardBtn');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => {
        this.refreshDashboard();
      });
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
      timeRangeSelector.addEventListener('change', (e) => {
        this.changeTimeRange(e.target.value);
      });
    }

    // Export buttons
    document.querySelectorAll('.export-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const format = e.target.dataset.format;
        const dataType = e.target.dataset.dataType;
        this.exportData(format, dataType);
      });
    });
  }

  /**
   * Load dashboard data
   */
  async loadDashboardData() {
    try {
      showLoading();
      
      // Load all dashboard data in parallel
      const [
        stats,
        recentActivities,
        performanceData,
        trendsData
      ] = await Promise.all([
        this.loadStats(),
        this.loadRecentActivities(),
        this.loadPerformanceData(),
        this.loadTrendsData()
      ]);

      // Render all dashboard components
      this.renderStats(stats);
      this.renderRecentActivities(recentActivities);
      this.renderPerformanceChart(performanceData);
      this.renderTrendsChart(trendsData);
      this.renderQuickActions();

      hideLoading();
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      showError('Failed to load dashboard data');
      hideLoading();
    }
  }

  /**
   * Load statistics
   * @returns {Object} Statistics data
   */
  async loadStats() {
    try {
      const [
        studentsStats,
        coursesStats,
        examsStats,
        questionsStats,
        attemptsStats,
        choicesStats
      ] = await Promise.all([
        studentsAPI.getStats(),
        coursesAPI.getStats(),
        examsAPI.getStats(),
        questionsAPI.getStats(),
        attemptsAPI.getStats(),
        choicesAPI.getStats()
      ]);

      return {
        students: studentsStats,
        courses: coursesStats,
        exams: examsStats,
        questions: questionsStats,
        attempts: attemptsStats,
        choices: choicesStats,
        summary: this.calculateSummaryStats({
          students: studentsStats,
          courses: coursesStats,
          exams: examsStats,
          questions: questionsStats,
          attempts: attemptsStats,
          choices: choicesStats
        })
      };
    } catch (error) {
      console.error('Failed to load stats:', error);
      return {};
    }
  }

  /**
   * Calculate summary statistics
   * @param {Object} stats - Individual service stats
   * @returns {Object} Summary statistics
   */
  calculateSummaryStats(stats) {
    const totalStudents = stats.students?.totalCount || 0;
    const totalAttempts = stats.attempts?.totalCount || 0;
    const averageScore = stats.attempts?.averageScore || 0;
    const passRate = stats.attempts?.passRate || 0;

    return {
      totalStudents,
      totalAttempts,
      averageScore,
      passRate,
      activeStudents: stats.students?.activeCount || 0,
      completedExams: stats.exams?.completedCount || 0,
      totalQuestions: stats.questions?.totalCount || 0,
      correctAnswers: stats.choices?.correctCount || 0
    };
  }

  /**
   * Load recent activities
   * @returns {Array} Recent activities
   */
  async loadRecentActivities() {
    try {
      const [
        recentStudents,
        recentAttempts,
        recentExams,
        recentQuestions
      ] = await Promise.all([
        studentsAPI.getAll({ page: 1, size: 5, sort: 'createdAt,desc' }),
        attemptsAPI.getAll({ page: 1, size: 5, sort: 'endTime,desc' }),
        examsAPI.getAll({ page: 1, size: 5, sort: 'createdAt,desc' }),
        questionsAPI.getAll({ page: 1, size: 5, sort: 'createdAt,desc' })
      ]);

      const activities = [];

      // Add student activities
      if (recentStudents.content) {
        recentStudents.content.forEach(student => {
          activities.push({
            type: 'student',
            title: `New student registered`,
            description: `${student.firstName} ${student.lastName}`,
            time: student.createdAt,
            icon: 'fa-user-plus',
            color: 'primary',
            action: 'view',
            actionData: { type: 'student', id: student.id }
          });
        });
      }

      // Add attempt activities
      if (recentAttempts.content) {
        recentAttempts.content.forEach(attempt => {
          activities.push({
            type: 'attempt',
            title: `Exam attempt completed`,
            description: `Score: ${attempt.score}%`,
            time: attempt.endTime,
            icon: attempt.score >= 60 ? 'fa-check-circle' : 'fa-times-circle',
            color: attempt.score >= 60 ? 'success' : 'error',
            action: 'view',
            actionData: { type: 'attempt', id: attempt.id }
          });
        });
      }

      // Add exam activities
      if (recentExams.content) {
        recentExams.content.forEach(exam => {
          activities.push({
            type: 'exam',
            title: `New exam created`,
            description: exam.title,
            time: new Date().toISOString(),
            icon: 'fa-file-alt',
            color: 'warning',
            action: 'view',
            actionData: { type: 'exam', id: exam.id }
          });
        });
      }

      // Add question activities
      if (recentQuestions.content) {
        recentQuestions.content.forEach(question => {
          activities.push({
            type: 'question',
            title: `New question added`,
            description: question.questionText.substring(0, 50) + '...',
            time: question.createdAt,
            icon: 'fa-question-circle',
            color: 'info',
            action: 'view',
            actionData: { type: 'question', id: question.id }
          });
        });
      }

      // Sort by time (newest first)
      activities.sort((a, b) => new Date(b.time) - new Date(a.time));

      return activities.slice(0, 10);
    } catch (error) {
      console.error('Failed to load recent activities:', error);
      return [];
    }
  }

  /**
   * Load performance data
   * @returns {Object} Performance data
   */
  async loadPerformanceData() {
    try {
      // Load performance metrics
      const attempts = await attemptsAPI.getAll({ page: 1, size: 100 });
      
      if (!attempts.content) return {};

      // Calculate performance metrics
      const scores = attempts.content.map(attempt => attempt.score);
      const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
      const highestScore = Math.max(...scores);
      const lowestScore = Math.min(...scores);
      const passRate = (scores.filter(score => score >= 60).length / scores.length) * 100;

      // Group by score ranges
      const scoreRanges = {
        '90-100': scores.filter(score => score >= 90).length,
        '80-89': scores.filter(score => score >= 80 && score < 90).length,
        '70-79': scores.filter(score => score >= 70 && score < 80).length,
        '60-69': scores.filter(score => score >= 60 && score < 70).length,
        '50-59': scores.filter(score => score >= 50 && score < 60).length,
        '0-49': scores.filter(score => score < 50).length
      };

      return {
        averageScore: Math.round(averageScore),
        highestScore,
        lowestScore,
        passRate: Math.round(passRate),
        totalAttempts: scores.length,
        scoreDistribution: scoreRanges
      };
    } catch (error) {
      console.error('Failed to load performance data:', error);
      return {};
    }
  }

  /**
   * Load trends data
   * @returns {Object} Trends data
   */
  async loadTrendsData() {
    try {
      // Load trends data for the last 30 days
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);

      // Get attempts for the date range
      const attempts = await attemptsAPI.getAll({
        page: 1,
        size: 1000,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      });

      if (!attempts.content) return {};

      // Group by date
      const dailyData = {};
      attempts.content.forEach(attempt => {
        const date = new Date(attempt.endTime).toISOString().split('T')[0];
        if (!dailyData[date]) {
          dailyData[date] = { attempts: 0, totalScore: 0, passed: 0 };
        }
        dailyData[date].attempts++;
        dailyData[date].totalScore += attempt.score;
        if (attempt.score >= 60) {
          dailyData[date].passed++;
        }
      });

      // Calculate daily averages
      const trends = Object.keys(dailyData).map(date => ({
        date,
        attempts: dailyData[date].attempts,
        averageScore: Math.round(dailyData[date].totalScore / dailyData[date].attempts),
        passRate: Math.round((dailyData[date].passed / dailyData[date].attempts) * 100)
      }));

      return {
        dailyTrends: trends,
        totalAttempts: attempts.content.length,
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
   * Render statistics
   * @param {Object} stats - Statistics data
   */
  renderStats(stats) {
    const statsContainer = document.getElementById('dashboard-stats');
    if (!statsContainer) return;

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
        title: 'Total Exams',
        value: formatNumber(stats.exams?.totalCount || 0),
        icon: 'fa-file-alt',
        color: 'warning',
        change: '+8%',
        description: 'Completed exams',
        subValue: formatNumber(stats.summary?.completedExams || 0)
      },
      {
        title: 'Average Score',
        value: `${stats.summary?.averageScore || 0}%`,
        icon: 'fa-chart-line',
        color: 'success',
        change: '+5%',
        description: 'Pass rate',
        subValue: `${stats.summary?.passRate || 0}%`
      },
      {
        title: 'Total Questions',
        value: formatNumber(stats.summary?.totalQuestions || 0),
        icon: 'fa-question-circle',
        color: 'info',
        change: '+15%',
        description: 'Correct answers',
        subValue: formatNumber(stats.summary?.correctAnswers || 0)
      }
    ];

    statsContainer.innerHTML = statCards.map(card => this.createStatCard(card)).join('');
  }

  /**
   * Create statistics card
   * @param {Object} card - Card data
   * @returns {string} HTML for stat card
   */
  createStatCard(card) {
    return `
      <div class="stat-card">
        <div class="stat-card-header">
          <div class="stat-card-icon stat-card-icon-${card.color}">
            <i class="fas ${card.icon}"></i>
          </div>
          <div class="stat-card-change ${card.change.startsWith('+') ? 'positive' : 'negative'}">
            ${card.change}
          </div>
        </div>
        <div class="stat-card-body">
          <div class="stat-card-value">${card.value}</div>
          <div class="stat-card-title">${card.title}</div>
          <div class="stat-card-description">
            ${card.description}: <span class="stat-card-sub-value">${card.subValue}</span>
          </div>
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
      activitiesContainer.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-inbox"></i>
          <h3>No Recent Activities</h3>
          <p>No recent activities to display.</p>
        </div>
      `;
      return;
    }

    activitiesContainer.innerHTML = activities.map(activity => `
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
   * Handle activity action
   * @param {string} action - Action type
   * @param {Object} actionData - Action data
   */
  handleActivityAction(action, actionData) {
    switch (action) {
      case 'view':
        this.viewItem(actionData.type, actionData.id);
        break;
      default:
        console.warn('Unknown activity action:', action);
    }
  }

  /**
   * View item
   * @param {string} type - Item type
   * @param {string} id - Item ID
   */
  viewItem(type, id) {
    // Navigate to the appropriate section
    if (window.app) {
      window.app.navigateToSection(type === 'student' ? 'students' : type + 's');
    }
    showToast(`Viewing ${type} with ID: ${id}`, 'info');
  }

  /**
   * Render performance chart
   * @param {Object} performanceData - Performance data
   */
  renderPerformanceChart(performanceData) {
    const chartContainer = document.getElementById('performance-chart');
    if (!chartContainer) return;

    if (!performanceData.scoreDistribution) {
      chartContainer.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-chart-bar"></i>
          <h3>No Performance Data</h3>
          <p>No exam attempts to analyze.</p>
        </div>
      `;
      return;
    }

    // Create performance metrics display
    const metrics = [
      { label: 'Average Score', value: `${performanceData.averageScore}%`, color: 'primary' },
      { label: 'Highest Score', value: `${performanceData.highestScore}%`, color: 'success' },
      { label: 'Lowest Score', value: `${performanceData.lowestScore}%`, color: 'error' },
      { label: 'Pass Rate', value: `${performanceData.passRate}%`, color: 'warning' }
    ];

    const scoreRanges = Object.entries(performanceData.scoreDistribution).map(([range, count]) => ({
      range,
      count,
      percentage: Math.round((count / performanceData.totalAttempts) * 100)
    }));

    chartContainer.innerHTML = `
      <div class="performance-metrics">
        ${metrics.map(metric => `
          <div class="metric-card">
            <div class="metric-label">${metric.label}</div>
            <div class="metric-value metric-value-${metric.color}">${metric.value}</div>
          </div>
        `).join('')}
      </div>
      <div class="score-distribution">
        <h4>Score Distribution</h4>
        ${scoreRanges.map(item => `
          <div class="distribution-bar">
            <div class="distribution-label">${item.range}</div>
            <div class="distribution-progress">
              <div class="distribution-fill" style="width: ${item.percentage}%"></div>
            </div>
            <div class="distribution-value">${item.count} (${item.percentage}%)</div>
          </div>
        `).join('')}
      </div>
    `;
  }

  /**
   * Render trends chart
   * @param {Object} trendsData - Trends data
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

    // Create trends visualization
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
            <div class="trend-label">Avg Score</div>
            <div class="trend-value">${Math.round(latestTrends.reduce((sum, day) => sum + day.averageScore, 0) / latestTrends.length)}%</div>
          </div>
          <div class="trend-stat">
            <div class="trend-label">Avg Pass Rate</div>
            <div class="trend-value">${Math.round(latestTrends.reduce((sum, day) => sum + day.passRate, 0) / latestTrends.length)}%</div>
          </div>
        </div>
      </div>
      <div class="trends-chart-container">
        <h4>Daily Trends</h4>
        <div class="trends-chart-bars">
          ${latestTrends.map(trend => `
            <div class="trend-bar">
              <div class="trend-bar-fill" style="height: ${trend.averageScore}%"></div>
              <div class="trend-bar-label">${new Date(trend.date).toLocaleDateString('en-US', { weekday: 'short' })}</div>
              <div class="trend-bar-value">${trend.averageScore}%</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  /**
   * Render quick actions
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

    actionsContainer.innerHTML = quickActions.map(action => `
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
   * Handle quick action
   * @param {string} action - Action type
   * @param {string} actionData - Action data
   */
  handleQuickAction(action, actionData) {
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
    }
  }

  /**
   * Refresh dashboard
   */
  async refreshDashboard() {
    try {
      showLoading();
      await this.loadDashboardData();
      showToast('Dashboard refreshed successfully', 'success');
      hideLoading();
    } catch (error) {
      console.error('Failed to refresh dashboard:', error);
      showError('Failed to refresh dashboard');
      hideLoading();
    }
  }

  /**
   * Setup auto refresh
   */
  setupAutoRefresh() {
    // Check if auto-refresh is enabled from localStorage
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
   * @param {boolean} enabled - Whether to enable auto-refresh
   */
  toggleAutoRefresh(enabled) {
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
   * Change time range
   * @param {string} range - Time range (7d, 30d, 90d, 1y)
   */
  async changeTimeRange(range) {
    try {
      showLoading();
      
      // Store current time range
      localStorage.setItem('timeRange', range);
      
      // Reload data with new time range
      await this.loadDashboardData();
      
      showToast(`Time range changed to ${range}`, 'info');
      hideLoading();
    } catch (error) {
      console.error('Failed to change time range:', error);
      showError('Failed to change time range');
      hideLoading();
    }
  }

  /**
   * Export data
   * @param {string} format - Export format (csv, pdf, json)
   * @param {string} dataType - Data type to export
   */
  async exportData(format, dataType) {
    try {
      showLoading();
      
      // Get data based on type
      let data;
      switch (dataType) {
        case 'students':
          data = await studentsAPI.getAll({ page: 1, size: 1000 });
          break;
        case 'exams':
          data = await examsAPI.getAll({ page: 1, size: 1000 });
          break;
        case 'attempts':
          data = await attemptsAPI.getAll({ page: 1, size: 1000 });
          break;
        case 'reports':
          // Generate report data
          data = await this.generateReportData();
          break;
        default:
          throw new Error(`Unknown data type: ${dataType}`);
      }

      // Export based on format
      switch (format) {
        case 'csv':
          this.exportToCSV(data, dataType);
          break;
        case 'pdf':
          this.exportToPDF(data, dataType);
          break;
        case 'json':
          this.exportToJSON(data, dataType);
          break;
        default:
          throw new Error(`Unknown export format: ${format}`);
      }

      showToast(`${dataType} exported as ${format.toUpperCase()} successfully`, 'success');
      hideLoading();
    } catch (error) {
      console.error('Export failed:', error);
      showError('Export failed');
      hideLoading();
    }
  }

  /**
   * Generate report data
   * @returns {Object} Report data
   */
  async generateReportData() {
    const [
      stats,
      students,
      exams,
      attempts
    ] = await Promise.all([
      this.loadStats(),
      studentsAPI.getAll({ page: 1, size: 100 }),
      examsAPI.getAll({ page: 1, size: 100 }),
      attemptsAPI.getAll({ page: 1, size: 100 })
    ]);

    return {
      summary: stats.summary,
      students: students.content || [],
      exams: exams.content || [],
      attempts: attempts.content || [],
      generatedAt: new Date().toISOString()
    };
  }

  /**
   * Export to CSV
   * @param {Object} data - Data to export
   * @param {string} filename - Filename
   */
  exportToCSV(data, filename) {
    // Simple CSV export implementation
    const csvContent = this.convertToCSV(data);
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  /**
   * Export to JSON
   * @param {Object} data - Data to export
   * @param {string} filename - Filename
   */
  exportToJSON(data, filename) {
    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  /**
   * Export to PDF
   * @param {Object} data - Data to export
   * @param {string} filename - Filename
   */
  exportToPDF(data, filename) {
    // This would require a PDF library like jsPDF
    // For now, we'll show a message
    showToast('PDF export requires additional setup. Please implement PDF library.', 'warning');
  }

  /**
   * Convert data to CSV format
   * @param {Object} data - Data to convert
   * @returns {string} CSV content
   */
  convertToCSV(data) {
    if (!data.content || data.content.length === 0) return '';
    
    const headers = Object.keys(data.content[0]);
    const csvRows = [headers.join(',')];
    
    data.content.forEach(item => {
      const values = headers.map(header => {
        const value = item[header];
        return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
      });
      csvRows.push(values.join(','));
    });
    
    return csvRows.join('\n');
  }
}

// Utility functions
function formatNumber(num) {
  return new Intl.NumberFormat().format(num);
}

function formatTimeAgo(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  return `${Math.floor(diffInSeconds / 86400)} days ago`;
}

function showLoading() {
  const loadingOverlay = document.getElementById('loadingOverlay');
  if (loadingOverlay) {
    loadingOverlay.classList.add('active');
  }
}

function hideLoading() {
  const loadingOverlay = document.getElementById('loadingOverlay');
  if (loadingOverlay) {
    loadingOverlay.classList.remove('active');
  }
}

function showToast(message, type = 'info') {
  if (window.showToast) {
    window.showToast(message, type);
  } else {
    console.log(`Toast: ${message} (${type})`);
  }
}

function showError(message) {
  showToast(message, 'error');
}

// Initialize dashboard component when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.dashboardComponent = new DashboardComponent();
  });
} else {
  window.dashboardComponent = new DashboardComponent();
}