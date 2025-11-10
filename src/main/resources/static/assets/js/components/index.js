// Components Index - Export all components for easy importing with Utility Integration
import {
  showToast,
  showError,
  showLoading,
  hideLoading
} from '/static/assets/js/utils/ui.js';

import {
  generateId,
  deepClone
} from '/static/assets/js/utils/helpers.js';

// Core Components - Fixed import paths
export { DataTableComponent } from '/data-table.js';
export { ModalComponent } from '/modal.js';
export { FormComponent } from '/form.js';
export { ChartsComponent, ChartUtils } from '/charts.js';
export { DashboardComponent } from '/static/assets/js/dashboard.js';

// Import API services for component integration
import {
  studentsAPI,
  coursesAPI,
  examsAPI,
  questionsAPI,
  attemptsAPI,
  choicesAPI
} from '/static/assets/js/api/index.js';

// Component Registry for global access with enhanced functionality
window.Components = {
  DataTableComponent,
  ModalComponent,
  FormComponent,
  ChartsComponent,
  ChartUtils,
  DashboardComponent,

  // API services for component usage
  APIs: {
    students: studentsAPI,
    courses: coursesAPI,
    exams: examsAPI,
    questions: questionsAPI,
    attempts: attemptsAPI,
    choices: choicesAPI
  },

  // Utility methods for components
  utils: {
    showToast,
    showError,
    generateId,
    deepClone
  }
};

// Enhanced component initialization helper
window.initializeComponents = function(options = {}) {
  console.log('🚀 Initializing all components...');

  try {
    showLoading('Initializing components...');

    const initOptions = {
      enableDataTables: true,
      enableModals: true,
      enableForms: true,
      enableCharts: true,
      enableDashboard: true,
      autoInitialize: true,
      ...options
    };

    // Initialize components based on options
    if (initOptions.enableDataTables) initializeDataTables();
    if (initOptions.enableModals) initializeModals();
    if (initOptions.enableForms) initializeForms();
    if (initOptions.enableCharts) initializeCharts();
    if (initOptions.enableDashboard) initializeDashboard();

    // Auto-initialize components with data attributes
    if (initOptions.autoInitialize) {
      autoInitializeComponents();
    }

    hideLoading();
    console.log('✅ All components initialized successfully');
    showToast('Components initialized successfully', 'success');

  } catch (error) {
    console.error('❌ Component initialization failed:', error);
    hideLoading();
    showError('Failed to initialize components');
    throw error;
  }
};

// Enhanced DataTable initialization
function initializeDataTables() {
  try {
    // Global DataTable configurations
    window.dataTableDefaults = {
      pageSize: 10,
      searchable: true,
      sortable: true,
      exportable: true,
      responsive: true,
      autoRefresh: false
    };

    console.log('✅ DataTable components ready with enhanced configuration');
  } catch (error) {
    console.error('DataTable initialization error:', error);
    throw error;
  }
}

// Enhanced Modal initialization
function initializeModals() {
  try {
    // Global Modal configurations
    window.modalDefaults = {
      backdrop: true,
      keyboard: true,
      centered: true,
      showCloseButton: true,
      showFooter: true
    };

    console.log('✅ Modal components ready with enhanced configuration');
  } catch (error) {
    console.error('Modal initialization error:', error);
    throw error;
  }
}

// Enhanced Form initialization
function initializeForms() {
  try {
    // Global Form configurations
    window.formDefaults = {
      validateOnSubmit: true,
      validateOnBlur: true,
      showCancelButton: true,
      layout: 'vertical'
    };

    console.log('✅ Form components ready with enhanced configuration');
  } catch (error) {
    console.error('Form initialization error:', error);
    throw error;
  }
}

// Enhanced Charts initialization
function initializeCharts() {
  try {
    // Global Charts configurations
    window.chartDefaults = {
      responsive: true,
      maintainAspectRatio: false,
      showTooltips: true,
      animation: true
    };

    console.log('✅ Charts components ready with enhanced configuration');
  } catch (error) {
    console.error('Charts initialization error:', error);
    throw error;
  }
}

// Dashboard initialization
function initializeDashboard() {
  try {
    // Global Dashboard configurations
    window.dashboardDefaults = {
      autoRefresh: false,
      refreshInterval: 30000,
      timeRange: '30d'
    };

    console.log('✅ Dashboard components ready with enhanced configuration');
  } catch (error) {
    console.error('Dashboard initialization error:', error);
    throw error;
  }
}

// Auto-initialize components based on data attributes
function autoInitializeComponents() {
  try {
    // Auto-initialize DataTables
    document.querySelectorAll('[data-datatable]').forEach(element => {
      const tableId = element.id;
      const options = JSON.parse(element.dataset.options || '{}');

      if (tableId && window.DataTableComponent) {
        window[`${tableId}Table`] = new DataTableComponent(tableId, {
          ...window.dataTableDefaults,
          ...options
        });
      }
    });

    // Auto-initialize Forms
    document.querySelectorAll('[data-form]').forEach(element => {
      const formId = element.id;
      const options = JSON.parse(element.dataset.options || '{}');

      if (formId && window.FormComponent) {
        window[`${formId}Form`] = new FormComponent(formId, {
          ...window.formDefaults,
          ...options
        });
      }
    });

    // Auto-initialize Charts
    document.querySelectorAll('[data-chart]').forEach(element => {
      const chartId = element.id;
      const options = JSON.parse(element.dataset.options || '{}');

      if (chartId && window.ChartsComponent) {
        window[`${chartId}Chart`] = new ChartsComponent(chartId, {
          ...window.chartDefaults,
          ...options
        });
      }
    });

    // Auto-initialize Dashboard
    const dashboardElement = document.getElementById('dashboard');
    if (dashboardElement && window.DashboardComponent) {
      window.dashboard = new DashboardComponent();
    }

    console.log('✅ Auto-initialized components from data attributes');
  } catch (error) {
    console.error('Auto-initialization error:', error);
  }
}

// Enhanced utility function to create component instances
window.createComponent = function(type, containerId, options = {}) {
  try {
    if (!validateComponentOptions(type, options)) {
      throw new Error(`Invalid options for ${type} component`);
    }

    let component;

    switch (type.toLowerCase()) {
      case 'datatable':
        component = new DataTableComponent(containerId, {
          ...window.dataTableDefaults,
          ...options
        });
        break;

      case 'modal':
        component = new ModalComponent({
          ...window.modalDefaults,
          ...options
        });
        break;

      case 'form':
        component = new FormComponent(containerId, {
          ...window.formDefaults,
          ...options
        });
        break;

      case 'chart':
        component = new ChartsComponent(containerId, {
          ...window.chartDefaults,
          ...options
        });
        break;

      case 'dashboard':
        component = new DashboardComponent(options);
        break;

      default:
        throw new Error(`Unknown component type: ${type}`);
    }

    console.log(`✅ Created ${type} component:`, component);
    return component;

  } catch (error) {
    console.error(`❌ Failed to create ${type} component:`, error);
    showError(`Failed to create ${type} component: ${error.message}`);
    throw error;
  }
};

// Enhanced component validation helper
window.validateComponentOptions = function(type, options) {
  const requiredFields = {
    datatable: ['containerId'],
    modal: [],
    form: ['containerId', 'fields'],
    chart: ['containerId'],
    dashboard: []
  };

  const required = requiredFields[type] || [];
  const missing = required.filter(field => !options[field] && options[field] !== 0);

  if (missing.length > 0) {
    console.error(`Missing required options for ${type}: ${missing.join(', ')}`);
    return false;
  }

  // Additional validation based on component type
  switch (type) {
    case 'form':
      if (!Array.isArray(options.fields)) {
        console.error('Form fields must be an array');
        return false;
      }
      break;

    case 'chart':
      if (!options.data && !options.url) {
        console.error('Chart requires either data or url option');
        return false;
      }
      break;
  }

  return true;
};

// Component lifecycle management
window.ComponentManager = {
  instances: new Map(),

  register(component, id) {
    this.instances.set(id, component);
    console.log(`📝 Registered component: ${id}`);
  },

  get(id) {
    return this.instances.get(id);
  },

  destroy(id) {
    const component = this.instances.get(id);
    if (component && typeof component.destroy === 'function') {
      component.destroy();
    }
    this.instances.delete(id);
    console.log(`🗑️ Destroyed component: ${id}`);
  },

  destroyAll() {
    this.instances.forEach((component, id) => {
      if (typeof component.destroy === 'function') {
        component.destroy();
      }
    });
    this.instances.clear();
    console.log('🧹 All components destroyed');
  }
};

// Global component event handlers with enhanced error handling
document.addEventListener('DOMContentLoaded', function() {
  console.log('📄 DOM Content Loaded - Initializing components...');

  // Initialize components when DOM is ready
  setTimeout(() => {
    if (typeof window.initializeComponents === 'function') {
      try {
        window.initializeComponents({
          autoInitialize: true
        });
      } catch (error) {
        console.error('Failed to initialize components on DOM ready:', error);
      }
    }
  }, 100);
});

// Error boundary for components
window.addEventListener('error', function(event) {
  console.error('Global component error:', event.error);

  // Show user-friendly error message
  if (event.error && event.error.message) {
    showError(`Component Error: ${event.error.message}`);
  }
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    DataTableComponent,
    ModalComponent,
    FormComponent,
    ChartsComponent,
    ChartUtils,
    DashboardComponent,
    initializeComponents: window.initializeComponents,
    createComponent: window.createComponent,
    validateComponentOptions: window.validateComponentOptions,
    ComponentManager: window.ComponentManager
  };
}

// Development helpers
if (process.env.NODE_ENV === 'development') {
  window.Components.debug = {
    listInstances: () => {
      console.log('📋 Active Component Instances:', window.ComponentManager.instances);
    },
    getInstance: (id) => {
      return window.ComponentManager.get(id);
    },
    reloadComponents: () => {
      window.ComponentManager.destroyAll();
      window.initializeComponents();
    }
  };
}

console.log('🎉 Components index loaded successfully');