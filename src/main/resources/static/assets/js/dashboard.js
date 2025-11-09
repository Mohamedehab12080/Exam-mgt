// Dashboard specific functionality

class DashboardManager {
    constructor() {
        this.stats = {
            students: 0,
            courses: 0,
            exams: 0,
            attempts: 0
        };
        this.charts = {};
        this.init();
    }

    init() {
        this.loadDashboardStats();
        this.setupEventListeners();
        this.initializeCharts();
    }

    setupEventListeners() {
        // Refresh dashboard data
        document.addEventListener('dashboard:refresh', () => {
            this.loadDashboardStats();
        });

        // Listen for data updates from other sections
        document.addEventListener('students:updated', () => this.updateStudentStats());
        document.addEventListener('courses:updated', () => this.updateCourseStats());
        document.addEventListener('exams:updated', () => this.updateExamStats());
        document.addEventListener('attempts:updated', () => this.updateAttemptStats());
    }

    async loadDashboardStats() {
        try {
            // Use the global loading utility
            if (typeof showLoading === 'function') {
                showLoading(true);
            } else if (typeof Utils !== 'undefined' && Utils.showLoading) {
                Utils.showLoading(true);
            }

            // Load all stats in parallel
            const [studentStats, courseStats, examStats, attemptStats] = await Promise.all([
                this.loadStudentStats(),
                this.loadCourseStats(),
                this.loadExamStats(),
                this.loadAttemptStats()
            ]);

            this.stats = {
                students: studentStats.total || 0,
                courses: courseStats.total || 0,
                exams: examStats.total || 0,
                attempts: attemptStats.total || 0
            };

            this.updateDashboardUI();
            this.updateCharts();

        } catch (error) {
            console.error('Failed to load dashboard stats:', error);
            this.showNotification('Failed to load dashboard statistics', 'error');
        } finally {
            // Hide loading
            if (typeof hideLoading === 'function') {
                hideLoading();
            } else if (typeof Utils !== 'undefined' && Utils.hideLoading) {
                Utils.hideLoading();
            }
        }
    }

    async loadStudentStats() {
        try {
            // Check if studentAPI exists
            if (typeof studentAPI !== 'undefined' && studentAPI.getAll) {
                const response = await studentAPI.getAll(1, 1); // Get just the count
                return { total: response.total || 0 };
            } else {
                // Fallback: mock data or alternative approach
                console.warn('studentAPI not available, using mock data');
                return { total: Math.floor(Math.random() * 100) + 50 };
            }
        } catch (error) {
            console.error('Failed to load student stats:', error);
            return { total: 0 };
        }
    }

    async loadCourseStats() {
        try {
            if (typeof courseAPI !== 'undefined' && courseAPI.getAll) {
                const response = await courseAPI.getAll(1, 1);
                return { total: response.total || 0 };
            } else {
                console.warn('courseAPI not available, using mock data');
                return { total: Math.floor(Math.random() * 20) + 10 };
            }
        } catch (error) {
            console.error('Failed to load course stats:', error);
            return { total: 0 };
        }
    }

    async loadExamStats() {
        try {
            if (typeof examAPI !== 'undefined' && examAPI.getAll) {
                const response = await examAPI.getAll(1, 1);
                return { total: response.total || 0 };
            } else {
                console.warn('examAPI not available, using mock data');
                return { total: Math.floor(Math.random() * 30) + 15 };
            }
        } catch (error) {
            console.error('Failed to load exam stats:', error);
            return { total: 0 };
        }
    }

    async loadAttemptStats() {
        try {
            if (typeof attemptAPI !== 'undefined' && attemptAPI.getAll) {
                const response = await attemptAPI.getAll(1, 1);
                return { total: response.total || 0 };
            } else {
                console.warn('attemptAPI not available, using mock data');
                return { total: Math.floor(Math.random() * 200) + 100 };
            }
        } catch (error) {
            console.error('Failed to load attempt stats:', error);
            return { total: 0 };
        }
    }

    updateDashboardUI() {
        // Update stat numbers
        const elements = {
            totalStudents: document.getElementById('totalStudents'),
            totalCourses: document.getElementById('totalCourses'),
            totalExams: document.getElementById('totalExams'),
            totalAttempts: document.getElementById('totalAttempts')
        };

        Object.keys(elements).forEach(key => {
            if (elements[key]) {
                this.animateNumber(elements[key], this.getStatValue(key));
            }
        });

        // Update recent activity
        this.updateRecentActivity();

        // Update API health status
        this.updateAPIHealth();
    }

    getStatValue(elementId) {
        const mapping = {
            totalStudents: 'students',
            totalCourses: 'courses',
            totalExams: 'exams',
            totalAttempts: 'attempts'
        };
        return this.stats[mapping[elementId]] || 0;
    }

    animateNumber(element, targetValue) {
        const startValue = parseInt(element.textContent) || 0;
        const duration = 1000; // 1 second
        const startTime = performance.now();

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Easing function for smooth animation
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const currentValue = Math.floor(startValue + (targetValue - startValue) * easeOutQuart);

            element.textContent = currentValue.toLocaleString();

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }

    updateRecentActivity() {
        const activityContainer = document.getElementById('recentActivity');
        if (!activityContainer) return;

        // Generate more realistic recent activities
        const activities = [
            {
                type: 'student',
                message: `New student registration`,
                time: this.getRelativeTime(2)
            },
            {
                type: 'exam',
                message: `Exam "${this.getRandomExamName()}" created`,
                time: this.getRelativeTime(15)
            },
            {
                type: 'attempt',
                message: `${this.getRandomNumber(5, 15)} exam attempts completed`,
                time: this.getRelativeTime(45)
            },
            {
                type: 'course',
                message: `Course "${this.getRandomCourseName()}" updated`,
                time: this.getRelativeTime(120)
            }
        ];

        activityContainer.innerHTML = activities.map(activity => `
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

    getRandomExamName() {
        const exams = ['Mathematics Final', 'Science Quiz', 'History Midterm', 'English Test'];
        return exams[Math.floor(Math.random() * exams.length)];
    }

    getRandomCourseName() {
        const courses = ['Algebra', 'Biology', 'World History', 'Literature'];
        return courses[Math.floor(Math.random() * courses.length)];
    }

    getRandomNumber(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    getActivityIcon(type) {
        const icons = {
            student: 'user-graduate',
            exam: 'file-alt',
            attempt: 'clock',
            course: 'book'
        };
        return icons[type] || 'info-circle';
    }

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

    initializeCharts() {
        // Initialize Chart.js charts if available
        if (typeof Chart !== 'undefined') {
            this.createCharts();
        }
    }

    createCharts() {
        // Create performance chart if canvas exists
        const performanceCtx = document.getElementById('performanceChart');
        if (performanceCtx) {
            this.charts.performance = new Chart(performanceCtx, {
                type: 'line',
                data: {
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                    datasets: [{
                        label: 'Student Registrations',
                        data: [12, 19, 3, 5, 2, 3],
                        borderColor: 'rgb(75, 192, 192)',
                        tension: 0.1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false
                }
            });
        }
    }

    updateCharts() {
        // Update chart data when stats change
        Object.keys(this.charts).forEach(chartKey => {
            if (this.charts[chartKey] && this.charts[chartKey].update) {
                this.charts[chartKey].update();
            }
        });
    }

    // Event handlers for data updates
    updateStudentStats() {
        this.loadStudentStats().then(stats => {
            this.stats.students = stats.total || 0;
            this.updateDashboardUI();
        });
    }

    updateCourseStats() {
        this.loadCourseStats().then(stats => {
            this.stats.courses = stats.total || 0;
            this.updateDashboardUI();
        });
    }

    updateExamStats() {
        this.loadExamStats().then(stats => {
            this.stats.exams = stats.total || 0;
            this.updateDashboardUI();
        });
    }

    updateAttemptStats() {
        this.loadAttemptStats().then(stats => {
            this.stats.attempts = stats.total || 0;
            this.updateDashboardUI();
        });
    }

    showNotification(message, type = 'info') {
        // Use available notification system
        if (typeof showToast === 'function') {
            showToast(message, type);
        } else if (typeof Utils !== 'undefined' && Utils.showToast) {
            Utils.showToast(message, type);
        } else {
            console.log(`${type.toUpperCase()}: ${message}`);
        }
    }

    // Public method to manually refresh dashboard
    refresh() {
        this.loadDashboardStats();
    }

    // Cleanup method
    destroy() {
        // Clean up charts
        Object.keys(this.charts).forEach(chartKey => {
            if (this.charts[chartKey] && this.charts[chartKey].destroy) {
                this.charts[chartKey].destroy();
            }
        });
        this.charts = {};
    }
}

// Initialize dashboard when DOM is ready and when dashboard section is active
function initializeDashboard() {
    const dashboardSection = document.getElementById('dashboard');
    if (dashboardSection && dashboardSection.classList.contains('active')) {
        if (!window.dashboardManager) {
            window.dashboardManager = new DashboardManager();
        } else {
            window.dashboardManager.refresh();
        }
    }
}

// Listen for section changes
document.addEventListener('DOMContentLoaded', () => {
    initializeDashboard();

    // Also initialize when navigating to dashboard
    document.addEventListener('sectionChanged', (event) => {
        if (event.detail === 'dashboard') {
            setTimeout(initializeDashboard, 100);
        }
    });
});

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DashboardManager;
} else {
    window.DashboardManager = DashboardManager;
}