// dashboard.js - Complete imports section
import {
    formatNumber,
    formatTimeAgo,
    formatPercentage
} from '/static/assets/js/utils/formatters.js';

import {
    showLoading,
    hideLoading,
    showToast,
    showError
} from '/static/assets/js/utils/ui.js';

// API services (if using ES6 imports)
import {
    studentsAPI,
    coursesAPI,
    examsAPI,
    questionsAPI,
    attemptsAPI,
    choicesAPI
} from '/static/assets/js/api';