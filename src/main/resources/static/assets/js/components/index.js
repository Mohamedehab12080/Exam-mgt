// Components Index - Export all components for easy importing

// Core Components
export { DataTableComponent } from './data-table.js';
export { ModalComponent } from './modal.js';
export { FormComponent } from './form.js';
export { ChartsComponent, ChartUtils } from './charts.js';

// Component Registry for global access
window.Components = {
  DataTableComponent,
  ModalComponent,
  FormComponent,
  ChartsComponent,
  ChartUtils
};

// Component initialization helper
window.initializeComponents = function() {
  console.log('Initializing all components...');
  
  // Initialize any component-specific functionality
  initializeDataTables();
  initializeModals();
  initializeForms();
  initializeCharts();
  
  console.log('All components initialized successfully');
};

// DataTable initialization
function initializeDataTables() {
  // Add any global DataTable configurations or enhancements
  console.log('DataTable components ready');
}

// Modal initialization
function initializeModals() {
  // Add any global Modal configurations or enhancements
  console.log('Modal components ready');
}

// Form initialization
function initializeForms() {
  // Add any global Form configurations or enhancements
  console.log('Form components ready');
}

// Charts initialization
function initializeCharts() {
  // Add any global Charts configurations or enhancements
  console.log('Charts components ready');
}

// Utility function to create component instances
window.createComponent = function(type, containerId, options = {}) {
  switch (type) {
    case 'datatable':
      return new DataTableComponent(containerId, options);
    case 'modal':
      return new ModalComponent(options);
    case 'form':
      return new FormComponent(containerId, options);
    case 'chart':
      return new ChartsComponent(containerId, options);
    default:
      console.error(`Unknown component type: ${type}`);
      return null;
  }
};

// Component validation helper
window.validateComponentOptions = function(type, options) {
  const requiredFields = {
    datatable: ['containerId'],
    modal: [],
    form: ['containerId', 'fields'],
    chart: ['containerId', 'data']
  };
  
  const required = requiredFields[type] || [];
  const missing = required.filter(field => !options[field]);
  
  if (missing.length > 0) {
    console.error(`Missing required options for ${type}: ${missing.join(', ')}`);
    return false;
  }
  
  return true;
};

// Global component event handlers
document.addEventListener('DOMContentLoaded', function() {
  // Initialize components when DOM is ready
  if (typeof window.initializeComponents === 'function') {
    window.initializeComponents();
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
    initializeComponents: window.initializeComponents,
    createComponent: window.createComponent,
    validateComponentOptions: window.validateComponentOptions
  };
}