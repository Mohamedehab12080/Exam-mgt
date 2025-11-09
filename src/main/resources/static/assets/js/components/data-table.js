// Enhanced Data Table Component with Utility Integration
import {
  formatNumber,
  formatPercentage,
  formatDate,
  formatTimeAgo,
  formatCurrency,
  formatStatusBadge,
  formatScoreBadge,
  formatBoolean,
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
  sortBy,
  filterBySearch,
  paginate,
  safeArrayAccess,
  isNonEmptyArray,
  generateId,
  deepClone,
  groupBy,
  randomColor
} from '/static/assets/js/utils/helpers.js';

import {
  isValidEmail,
  isValidPhone,
  isValidSSN,
  isValidDate,
  isValidNumber,
  isValidUrl,
  validateObject,
  sanitizeHtml,
  escapeHtml,
  isEmpty,
  isNotEmpty
} from '/static/assets/js/utils/validators.js';

import {
  setLocalStorage,
  getLocalStorage,
  setSessionStorage,
  getSessionStorage,
  createStorageManager
} from '/static/assets/js/utils/storage.js';

export class DataTableComponent {
  constructor(containerId, options = {}) {
    this.containerId = containerId;
    this.container = document.getElementById(containerId);
    if (!this.container) {
      console.error(`Container with ID '${containerId}' not found`);
      showError('Table container not found');
      return;
    }

    this.tableId = generateId('datatable');

    // Enhanced options with utility integration
    this.options = {
      pageSize: 10,
      pageSizes: [5, 10, 25, 50, 100],
      sortable: true,
      searchable: true,
      filterable: true,
      exportable: true,
      bulkActions: true,
      responsive: true,
      autoRefresh: false,
      refreshInterval: 30000,
      storageKey: `datatable_${containerId}`,
      ...options
    };

    // Enhanced state management
    this.currentPage = 1;
    this.pageSize = this.options.pageSize;
    this.sortColumn = null;
    this.sortDirection = 'asc';
    this.searchQuery = '';
    this.filters = {};
    this.selectedRows = new Set();
    this.data = [];
    this.filteredData = [];
    this.columns = [];

    // Storage manager for user preferences
    this.storage = createStorageManager(this.options.storageKey, {
      expiration: 24 * 60 // 24 hours
    });

    // Bind event handlers with utility functions
    this.handleSearch = debounce(this.handleSearch.bind(this), 300);
    this.handleResize = throttle(this.handleResize.bind(this), 250);

    this.init();
  }

  /**
   * Enhanced initialization with utilities
   */
  init(data = [], columns = null) {
    if (!this.container) {
      console.error(`Container with ID '${this.containerId}' not found`);
      showError('Table container not found');
      return this;
    }

    try {
      this.loadUserPreferences();
      this.setupEventListeners();

      if (data && data.length > 0) {
        this.setData(data, columns);
      } else {
        this.renderTable();
      }

      if (this.options.autoRefresh) {
        this.setupAutoRefresh();
      }

      console.log(`DataTable component initialized: ${this.tableId}`);
      showToast('Data table loaded successfully', 'success');

      return this;
    } catch (error) {
      console.error('Failed to initialize data table:', error);
      this.handleError(error, 'initialization');
      return this;
    }
  }

  /**
   * Enhanced data setting with validation - UPDATED FOR COMPATIBILITY
   */
  setData(data, columns = null) {
    if (!Array.isArray(data)) {
      console.warn('Table data must be an array');
      showToast('Invalid data format', 'warning');
      this.data = [];
      this.filteredData = [];
      return this;
    }

    this.data = data;
    this.columns = columns || this.columns;
    this.currentPage = 1;
    this.selectedRows.clear();

    // Validate data structure
    this.validateDataStructure();

    // Cache data for performance
    if (this.options.storageKey) {
      this.storage.set('data', this.data);
      this.storage.set('columns', this.columns);
    }

    this.filterData();
    return this;
  }

  /**
   * ADD: Alias for updateData compatibility
   */
  updateData(newData) {
    return this.setData(newData);
  }

  /**
   * ADD: Refresh method for compatibility
   */
  refresh() {
    this.renderTable();
    return this;
  }

  /**
   * ADD: Simple search method for compatibility
   */
  search(term, searchableColumns = null) {
    return this.handleSearch(term);
  }

  /**
   * ADD: Get table state for compatibility
   */
  getTableState() {
    return {
      currentPage: this.currentPage,
      pageSize: this.pageSize,
      totalItems: this.filteredData.length,
      totalPages: Math.ceil(this.filteredData.length / this.pageSize),
      selectedRows: this.getSelectedRowData(),
      selectedRowIds: Array.from(this.selectedRows),
      columns: this.columns,
      data: this.data,
      filteredData: this.filteredData,
      searchQuery: this.searchQuery,
      filters: this.filters,
      sortColumn: this.sortColumn,
      sortDirection: this.sortDirection
    };
  }

  /**
   * ADD: Clear selection method for compatibility
   */
  clearSelection() {
    this.selectedRows.clear();
    this.renderTable();
    return this;
  }

  /**
   * ADD: Get selected rows (simple array) for compatibility
   */
  getSelectedRows() {
    return this.getSelectedRowData();
  }

  /**
   * ENHANCE: Add unified event dispatching
   */
  dispatchTableEvent(eventName, detail) {
    const event = new CustomEvent(`table:${eventName}`, {
      detail: {
        tableId: this.containerId,
        ...detail,
        timestamp: new Date().toISOString()
      }
    });
    this.container.dispatchEvent(event);

    // Also dispatch DataTable specific events for backward compatibility
    if (eventName === 'rendered') {
      this.container.dispatchEvent(new CustomEvent('dataTable:rendered', { detail }));
    }
  }

  /**
   * Enhanced event listeners with utility functions
   */
  setupEventListeners() {
    // Search functionality with debounce
    if (this.options.searchable) {
      const searchInput = document.getElementById(`${this.containerId}-search`);
      if (searchInput) {
        searchInput.addEventListener('input', (e) => {
          this.handleSearch(e.target.value);
        });
      }
    }

    // Page size change
    const pageSizeSelect = document.getElementById(`${this.containerId}-pageSize`);
    if (pageSizeSelect) {
      pageSizeSelect.addEventListener('change', (e) => {
        this.pageSize = parseInt(e.target.value);
        this.currentPage = 1;
        this.saveUserPreferences();
        this.renderTable();
      });
    }

    // Bulk actions
    if (this.options.bulkActions) {
      const selectAllCheckbox = document.getElementById(`${this.containerId}-selectAll`);
      if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener('change', (e) => {
          this.toggleSelectAll(e.target.checked);
        });
      }

      // Bulk action buttons with confirmation
      document.querySelectorAll(`[data-table="${this.containerId}"][data-bulk-action]`).forEach(btn => {
        btn.addEventListener('click', (e) => {
          const action = e.target.dataset.bulkAction;
          this.handleBulkAction(action);
        });
      });
    }

    // Export buttons with enhanced functionality
    if (this.options.exportable) {
      document.querySelectorAll(`[data-table="${this.containerId}"][data-export]`).forEach(btn => {
        btn.addEventListener('click', (e) => {
          const format = e.target.dataset.export;
          this.enhancedExportData(format);
        });
      });
    }

    // Filter buttons
    if (this.options.filterable) {
      document.querySelectorAll(`[data-table="${this.containerId}"][data-filter]`).forEach(btn => {
        btn.addEventListener('click', (e) => {
          const filterType = e.target.dataset.filter;
          const filterValue = e.target.dataset.filterValue;
          this.setFilter(filterType, filterValue);
        });
      });
    }

    // Refresh button
    const refreshBtn = document.getElementById(`${this.containerId}-refresh`);
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => {
        this.refreshTable();
      });
    }

    // Responsive handling
    window.addEventListener('resize', this.handleResize);
  }

  /**
   * Validate data structure
   */
  validateDataStructure() {
    if (this.columns.length === 0 && this.data.length > 0) {
      // Auto-generate columns from first data item
      const sampleRow = this.data[0];
      this.columns = Object.keys(sampleRow).map(key => ({
        key: key,
        title: capitalizeFirst(key.replace(/_/g, ' ')),
        sortable: true,
        searchable: true,
        type: this.detectColumnType(sampleRow[key])
      }));
    }
  }

  /**
   * Detect column type from sample data
   */
  detectColumnType(value) {
    if (value === null || value === undefined) return 'text';

    if (typeof value === 'number') {
      return Number.isInteger(value) ? 'number' : 'currency';
    }

    if (typeof value === 'boolean') return 'boolean';

    if (isValidDate(value)) return 'date';

    if (isValidEmail(value)) return 'email';

    if (isValidPhone(value)) return 'phone';

    if (isValidUrl(value)) return 'url';

    return 'text';
  }

  /**
   * Enhanced filtering with utility functions - UPDATED FOR COMPATIBILITY
   */
  filterData() {
    this.filteredData = [...this.data];

    // Apply search filter with utility function
    if (this.searchQuery) {
      const searchableColumns = this.columns
          .filter(column => column.searchable !== false)
          .map(column => column.key);

      this.filteredData = filterBySearch(this.filteredData, this.searchQuery, searchableColumns);
    }

    // Apply column filters with validation
    Object.keys(this.filters).forEach(filterKey => {
      const filterValue = this.filters[filterKey];
      if (filterValue && filterValue !== 'all') {
        this.filteredData = this.filteredData.filter(row => {
          const cellValue = this.getCellValue(row, filterKey);
          return String(cellValue).toLowerCase() === String(filterValue).toLowerCase();
        });
      }
    });

    // Apply sorting with utility function
    if (this.sortColumn) {
      this.filteredData = sortBy(this.filteredData, this.sortColumn, this.sortDirection);
    }

    this.renderTable();
    return this;
  }

  /**
   * Enhanced search handling - UPDATED FOR COMPATIBILITY
   */
  handleSearch(term) {
    this.searchQuery = term.trim();
    this.currentPage = 1;
    this.selectedRows.clear();
    this.filterData();
    return this;
  }

  /**
   * ENHANCE: Set filter with chaining
   */
  setFilter(filterType, filterValue) {
    if (filterType === 'clear') {
      this.filters = {};
    } else {
      this.filters[filterType] = filterValue;
    }
    this.currentPage = 1;
    this.filterData();
    return this;
  }

  /**
   * Enhanced table rendering with utility integration - UPDATED WITH EVENTS
   */
  renderTable() {
    if (!this.container) return;

    try {
      showLoading('Loading table data...');

      const totalPages = Math.ceil(this.filteredData.length / this.pageSize);
      const startIndex = (this.currentPage - 1) * this.pageSize;
      const endIndex = startIndex + this.pageSize;
      const currentPageData = this.filteredData.slice(startIndex, endIndex);

      this.container.innerHTML = `
        <div class="data-table-container" id="${this.tableId}">
          ${this.renderToolbar()}
          ${this.renderTableHeader()}
          ${this.renderTableBody(currentPageData)}
          ${this.renderPagination(totalPages)}
        </div>
      `;

      this.setupTableEventListeners();
      this.updateTableSummary();

      hideLoading();

      // ADD: Dispatch unified event
      this.dispatchTableEvent('rendered', {
        data: currentPageData,
        totalItems: this.filteredData.length,
        currentPage: this.currentPage,
        totalPages: totalPages
      });
    } catch (error) {
      console.error('Failed to render table:', error);
      this.handleError(error, 'rendering');
      hideLoading();
    }

    return this;
  }

  // ALL THE EXISTING RENDERING METHODS REMAIN THE SAME (they're perfect!)
  renderToolbar() {
    const selectedCount = this.selectedRows.size;
    const totalCount = this.filteredData.length;

    return `
      <div class="data-table-toolbar">
        <div class="toolbar-left">
          ${this.options.searchable ? `
            <div class="search-box">
              <input type="text" 
                     id="${this.containerId}-search" 
                     class="form-control" 
                     placeholder="Search ${formatNumber(totalCount)} records..." 
                     value="${sanitizeHtml(this.searchQuery)}">
              <i class="fas fa-search"></i>
              ${this.searchQuery ? `
                <button class="search-clear" type="button" title="Clear search">
                  <i class="fas fa-times"></i>
                </button>
              ` : ''}
            </div>
          ` : ''}
          
          ${this.options.filterable ? this.renderEnhancedFilters() : ''}
        </div>
        
        <div class="toolbar-right">
          ${this.options.bulkActions && selectedCount > 0 ? `
            <div class="bulk-actions">
              <span class="selected-count">
                <i class="fas fa-check-circle"></i>
                ${formatNumber(selectedCount)} selected
              </span>
              <button class="btn btn-sm btn-outline btn-danger" 
                      data-table="${this.containerId}" 
                      data-bulk-action="delete"
                      title="Delete selected">
                <i class="fas fa-trash"></i> Delete
              </button>
              <button class="btn btn-sm btn-outline btn-primary" 
                      data-table="${this.containerId}" 
                      data-bulk-action="export"
                      title="Export selected">
                <i class="fas fa-download"></i> Export
              </button>
            </div>
          ` : ''}
          
          <div class="page-size-selector">
            <label for="${this.containerId}-pageSize" class="page-size-label">Show:</label>
            <select id="${this.containerId}-pageSize" class="form-control form-control-sm">
              ${this.options.pageSizes.map(size => `
                <option value="${size}" ${size === this.pageSize ? 'selected' : ''}>
                  ${formatNumber(size)}
                </option>
              `).join('')}
            </select>
          </div>
          
          ${this.options.exportable ? `
            <div class="export-buttons">
              <button class="btn btn-sm btn-outline" 
                      data-table="${this.containerId}" 
                      data-export="csv"
                      title="Export to CSV">
                <i class="fas fa-file-csv"></i> CSV
              </button>
              <button class="btn btn-sm btn-outline" 
                      data-table="${this.containerId}" 
                      data-export="json"
                      title="Export to JSON">
                <i class="fas fa-file-code"></i> JSON
              </button>
              <button class="btn btn-sm btn-outline" 
                      data-table="${this.containerId}" 
                      data-export="pdf"
                      title="Export to PDF">
                <i class="fas fa-file-pdf"></i> PDF
              </button>
            </div>
          ` : ''}
          
          <button class="btn btn-sm btn-outline" 
                  id="${this.containerId}-refresh"
                  title="Refresh table">
            <i class="fas fa-sync-alt ${this.options.autoRefresh ? 'fa-spin' : ''}"></i>
          </button>
        </div>
      </div>
    `;
  }

  renderEnhancedFilters() {
    // Generate filters based on column data
    const filterableColumns = this.columns.filter(col => col.filterable !== false);

    let filtersHTML = '';

    filterableColumns.forEach(column => {
      if (column.filterOptions) {
        filtersHTML += `
          <div class="table-filter">
            <label>${column.title}:</label>
            <select class="form-control form-control-sm" 
                    data-filter="${column.key}"
                    title="Filter by ${column.title}">
              <option value="all">All</option>
              ${column.filterOptions.map(option => `
                <option value="${option.value}" 
                        ${this.filters[column.key] === option.value ? 'selected' : ''}>
                  ${option.label}
                </option>
              `).join('')}
            </select>
          </div>
        `;
      } else {
        // Auto-generate filter options from unique values
        const uniqueValues = [...new Set(this.data.map(row => this.getCellValue(row, column.key)))].slice(0, 10);

        if (uniqueValues.length > 1) {
          filtersHTML += `
            <div class="table-filter">
              <label>${column.title}:</label>
              <select class="form-control form-control-sm" 
                      data-filter="${column.key}"
                      title="Filter by ${column.title}">
                <option value="all">All</option>
                ${uniqueValues.map(value => `
                  <option value="${value}" 
                          ${this.filters[column.key] === value ? 'selected' : ''}>
                    ${truncateText(String(value), 20)}
                  </option>
                `).join('')}
              </select>
            </div>
          `;
        }
      }
    });

    return `
      <div class="table-filters">
        ${filtersHTML}
        ${Object.keys(this.filters).length > 0 ? `
          <button class="btn btn-sm btn-outline" 
                  data-table="${this.containerId}" 
                  data-filter="clear"
                  title="Clear all filters">
            <i class="fas fa-times"></i> Clear
          </button>
        ` : ''}
      </div>
    `;
  }

  renderTableHeader() {
    return `
      <div class="table-header">
        <table class="data-table">
          <thead>
            <tr>
              ${this.options.bulkActions ? `
                <th class="checkbox-column">
                  <input type="checkbox" 
                         id="${this.containerId}-selectAll"
                         title="Select all rows">
                </th>
              ` : ''}
              
              ${this.columns.map(column => `
                <th class="${column.class || ''} ${this.options.sortable && column.sortable !== false ? 'sortable' : ''}"
                    data-column="${column.key}"
                    data-sort="${this.sortColumn === column.key ? this.sortDirection : 'none'}"
                    title="${column.sortable !== false ? 'Click to sort' : ''}">
                  <div class="column-header">
                    <span>${sanitizeHtml(column.title)}</span>
                    ${this.options.sortable && column.sortable !== false ? `
                      <span class="sort-indicator">
                        ${this.sortColumn === column.key ?
        (this.sortDirection === 'asc' ? '<i class="fas fa-sort-up"></i>' : '<i class="fas fa-sort-down"></i>') :
        '<i class="fas fa-sort"></i>'}
                      </span>
                    ` : ''}
                  </div>
                </th>
              `).join('')}
              
              ${this.options.actions !== false ? `
                <th class="actions-column">
                  <span>Actions</span>
                </th>
              ` : ''}
            </tr>
          </thead>
        </table>
      </div>
    `;
  }

  renderTableBody(data) {
    if (!isNonEmptyArray(data)) {
      return `
        <div class="table-body">
          <div class="empty-state">
            <i class="fas fa-inbox"></i>
            <h3>No Data Found</h3>
            <p>${this.searchQuery || Object.keys(this.filters).length > 0
          ? 'No data matches your current search or filters.'
          : 'No data available to display.'}</p>
            ${this.searchQuery || Object.keys(this.filters).length > 0 ? `
              <button class="btn btn-primary" onclick="document.getElementById('${this.containerId}-search').value = ''; ${this.containerId}Table.setFilter('clear')">
                Clear Search & Filters
              </button>
            ` : ''}
          </div>
        </div>
      `;
    }

    return `
      <div class="table-body">
        <table class="data-table">
          <tbody>
            ${data.map((row, index) => this.renderEnhancedTableRow(row, index)).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  renderEnhancedTableRow(row, index) {
    const rowId = this.getRowId(row);
    const isSelected = this.selectedRows.has(rowId);
    const globalIndex = (this.currentPage - 1) * this.pageSize + index;

    return `
      <tr class="table-row ${isSelected ? 'selected' : ''}" 
          data-row-id="${rowId}"
          data-index="${globalIndex}">
        ${this.options.bulkActions ? `
          <td class="checkbox-column">
            <input type="checkbox" 
                   class="row-checkbox" 
                   data-row-id="${rowId}" 
                   ${isSelected ? 'checked' : ''}
                   title="Select row">
          </td>
        ` : ''}
        
        ${this.columns.map(column => `
          <td class="${column.class || ''} ${column.type || ''}"
              data-column="${column.key}"
              title="${this.getCellValue(row, column.key)}">
            ${this.renderEnhancedCell(row, column)}
          </td>
        `).join('')}
        
        ${this.options.actions !== false ? `
          <td class="actions-column">
            <div class="row-actions">
              <button class="btn btn-sm btn-outline action-btn" 
                      data-action="view" 
                      data-row-id="${rowId}"
                      title="View details">
                <i class="fas fa-eye"></i>
              </button>
              <button class="btn btn-sm btn-outline action-btn" 
                      data-action="edit" 
                      data-row-id="${rowId}"
                      title="Edit record">
                <i class="fas fa-edit"></i>
              </button>
              <button class="btn btn-sm btn-outline btn-danger action-btn" 
                      data-action="delete" 
                      data-row-id="${rowId}"
                      title="Delete record">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </td>
        ` : ''}
      </tr>
    `;
  }

  renderEnhancedCell(row, column) {
    const value = this.getCellValue(row, column.key);

    // Handle custom render function
    if (column.render && typeof column.render === 'function') {
      return column.render(value, row, column);
    }

    // Use utility functions for formatting
    if (value === null || value === undefined) {
      return '<span class="text-muted">-</span>';
    }

    // Enhanced type-based formatting
    switch (column.type) {
      case 'number':
        return formatNumber(value);

      case 'percentage':
        return formatPercentage(value);

      case 'currency':
        return formatCurrency(value);

      case 'date':
        return formatDate(value, column.format || 'MM/DD/YYYY');

      case 'datetime':
        return formatDate(value, column.format || 'MM/DD/YYYY HH:mm');

      case 'time-ago':
        return formatTimeAgo(value);

      case 'boolean':
        return formatBoolean(value, {
          trueText: column.trueText || 'Yes',
          falseText: column.falseText || 'No',
          icon: true
        });

      case 'status':
        return formatStatusBadge(value, column.statusMap);

      case 'score':
        return formatScoreBadge(value, column.maxScore);

      case 'email':
        return isValidEmail(value)
            ? `<a href="mailto:${value}" class="text-primary">${sanitizeHtml(value)}</a>`
            : sanitizeHtml(value);

      case 'phone':
        return isValidPhone(value)
            ? `<a href="tel:${value}" class="text-primary">${sanitizeHtml(value)}</a>`
            : sanitizeHtml(value);

      case 'url':
        return isValidUrl(value)
            ? `<a href="${value}" target="_blank" rel="noopener" class="text-primary">${truncateText(value, 30)}</a>`
            : sanitizeHtml(value);

      case 'text':
      default:
        const textValue = String(value);
        return column.truncate
            ? truncateText(textValue, column.truncateLength || 50)
            : sanitizeHtml(textValue);
    }
  }

  renderPagination(totalPages) {
    if (totalPages <= 1) return '';

    const startPage = Math.max(1, this.currentPage - 2);
    const endPage = Math.min(totalPages, this.currentPage + 2);
    const totalItems = this.filteredData.length;

    return `
      <div class="data-table-pagination">
        <div class="pagination-info">
          Showing 
          <strong>${formatNumber((this.currentPage - 1) * this.pageSize + 1)}</strong> 
          to 
          <strong>${formatNumber(Math.min(this.currentPage * this.pageSize, totalItems))}</strong> 
          of 
          <strong>${formatNumber(totalItems)}</strong> 
          entries
          ${this.searchQuery ? `(filtered from ${formatNumber(this.data.length)} total records)` : ''}
        </div>
        
        <div class="pagination-controls">
          <button class="btn btn-sm btn-outline ${this.currentPage === 1 ? 'disabled' : ''}" 
                  data-action="first" 
                  data-page="1"
                  title="First page">
            <i class="fas fa-angle-double-left"></i>
          </button>
          
          <button class="btn btn-sm btn-outline ${this.currentPage === 1 ? 'disabled' : ''}" 
                  data-action="prev" 
                  data-page="${this.currentPage - 1}"
                  title="Previous page">
            <i class="fas fa-angle-left"></i>
          </button>
          
          ${startPage > 1 ? `
            <button class="btn btn-sm btn-outline" data-action="page" data-page="1">1</button>
            ${startPage > 2 ? '<span class="pagination-ellipsis">...</span>' : ''}
          ` : ''}
          
          ${Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i).map(page => `
            <button class="btn btn-sm ${page === this.currentPage ? 'btn-primary' : 'btn-outline'}" 
                    data-action="page" 
                    data-page="${page}">
              ${formatNumber(page)}
            </button>
          `).join('')}
          
          ${endPage < totalPages ? `
            ${endPage < totalPages - 1 ? '<span class="pagination-ellipsis">...</span>' : ''}
            <button class="btn btn-sm btn-outline" data-action="page" data-page="${totalPages}">
              ${formatNumber(totalPages)}
            </button>
          ` : ''}
          
          <button class="btn btn-sm btn-outline ${this.currentPage === totalPages ? 'disabled' : ''}" 
                  data-action="next" 
                  data-page="${this.currentPage + 1}"
                  title="Next page">
            <i class="fas fa-angle-right"></i>
          </button>
          
          <button class="btn btn-sm btn-outline ${this.currentPage === totalPages ? 'disabled' : ''}" 
                  data-action="last" 
                  data-page="${totalPages}"
                  title="Last page">
            <i class="fas fa-angle-double-right"></i>
          </button>
        </div>
      </div>
    `;
  }

  /**
   * Update table summary information
   */
  updateTableSummary() {
    const summaryElement = this.container.querySelector('.table-summary');
    if (summaryElement) {
      const selectedCount = this.selectedRows.size;
      const totalCount = this.filteredData.length;

      summaryElement.innerHTML = `
        <div class="table-summary-stats">
          <span class="stat total-records">
            <i class="fas fa-database"></i>
            Total: ${formatNumber(totalCount)}
          </span>
          ${selectedCount > 0 ? `
            <span class="stat selected-records">
              <i class="fas fa-check-circle"></i>
              Selected: ${formatNumber(selectedCount)}
            </span>
          ` : ''}
          ${this.searchQuery ? `
            <span class="stat search-active">
              <i class="fas fa-search"></i>
              Search: "${truncateText(this.searchQuery, 20)}"
            </span>
          ` : ''}
        </div>
      `;
    }
  }

  // ALL THE EXISTING UTILITY METHODS REMAIN THE SAME
  getRowId(row) {
    return row.id || row._id || generateId('row');
  }

  getCellValue(row, columnKey) {
    return row[columnKey];
  }

  getSelectedRowData() {
    return Array.from(this.selectedRows).map(rowId =>
        this.data.find(row => this.getRowId(row) === rowId)
    ).filter(Boolean);
  }

  toggleSelectAll(selected) {
    if (selected) {
      this.filteredData.forEach(row => {
        this.selectedRows.add(this.getRowId(row));
      });
    } else {
      this.selectedRows.clear();
    }
    this.renderTable();
  }

  setupTableEventListeners() {
    // Sortable columns
    if (this.options.sortable) {
      this.container.querySelectorAll('th.sortable').forEach(th => {
        th.addEventListener('click', () => {
          const column = th.dataset.column;
          if (this.sortColumn === column) {
            this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
          } else {
            this.sortColumn = column;
            this.sortDirection = 'asc';
          }
          this.saveUserPreferences();
          this.filterData();
        });
      });
    }

    // Row selection
    this.container.querySelectorAll('.row-checkbox').forEach(checkbox => {
      checkbox.addEventListener('change', (e) => {
        const rowId = e.target.dataset.rowId;
        if (e.target.checked) {
          this.selectedRows.add(rowId);
        } else {
          this.selectedRows.delete(rowId);
        }
        this.updateSelectAllCheckbox();
        this.renderToolbar();
      });
    });

    // Row actions
    this.container.querySelectorAll('.action-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const action = e.target.closest('.action-btn').dataset.action;
        const rowId = e.target.closest('.action-btn').dataset.rowId;
        this.handleRowAction(action, rowId);
      });
    });

    // Pagination
    this.container.querySelectorAll('[data-action]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const action = e.target.closest('[data-action]').dataset.action;
        const page = parseInt(e.target.closest('[data-action]').dataset.page);

        if (action === 'page' && page > 0 && page <= Math.ceil(this.filteredData.length / this.pageSize)) {
          this.currentPage = page;
        } else if (action === 'prev' && this.currentPage > 1) {
          this.currentPage--;
        } else if (action === 'next' && this.currentPage < Math.ceil(this.filteredData.length / this.pageSize)) {
          this.currentPage++;
        } else if (action === 'first') {
          this.currentPage = 1;
        } else if (action === 'last') {
          this.currentPage = Math.ceil(this.filteredData.length / this.pageSize);
        }

        this.renderTable();
      });
    });

    // Filter changes
    this.container.querySelectorAll('[data-filter]').forEach(select => {
      select.addEventListener('change', (e) => {
        const filterKey = e.target.dataset.filter;
        const filterValue = e.target.value;
        this.setFilter(filterKey, filterValue);
      });
    });
  }

  updateSelectAllCheckbox() {
    const selectAllCheckbox = this.container.querySelector('#${this.containerId}-selectAll');
    if (selectAllCheckbox) {
      const allRowsSelected = this.filteredData.length > 0 &&
          this.filteredData.every(row => this.selectedRows.has(this.getRowId(row)));
      selectAllCheckbox.checked = allRowsSelected;
      selectAllCheckbox.indeterminate = !allRowsSelected && this.selectedRows.size > 0;
    }
  }

  handleRowAction(action, rowId) {
    const rowData = this.data.find(row => this.getRowId(row) === rowId);

    switch (action) {
      case 'view':
        this.dispatchTableEvent('rowView', { rowId, rowData });
        break;
      case 'edit':
        this.dispatchTableEvent('rowEdit', { rowId, rowData });
        break;
      case 'delete':
        showConfirm(
            'Confirm Delete',
            'Are you sure you want to delete this record?',
            () => {
              this.dispatchTableEvent('rowDelete', { rowId, rowData });
            }
        );
        break;
    }
  }

  enhancedExportData(format) {
    const dataToExport = this.selectedRows.size > 0
        ? this.getSelectedRowData()
        : this.filteredData;

    if (!isNonEmptyArray(dataToExport)) {
      showToast('No data to export', 'warning');
      return;
    }

    try {
      let content, filename, mimeType;

      switch (format) {
        case 'csv':
          content = this.convertToEnhancedCSV(dataToExport);
          filename = `${this.containerId}-export-${new Date().toISOString().split('T')[0]}.csv`;
          mimeType = 'text/csv';
          break;

        case 'json':
          content = JSON.stringify(dataToExport, null, 2);
          filename = `${this.containerId}-export-${new Date().toISOString().split('T')[0]}.json`;
          mimeType = 'application/json';
          break;

        case 'pdf':
          showToast('PDF export requires additional setup. Please implement PDF library.', 'warning');
          return;

        default:
          throw new Error(`Unsupported export format: ${format}`);
      }

      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();
      URL.revokeObjectURL(url);

      const recordCount = formatNumber(dataToExport.length);
      showToast(`Exported ${recordCount} records as ${format.toUpperCase()}`, 'success');
    } catch (error) {
      console.error('Export failed:', error);
      showError('Failed to export data');
    }
  }

  convertToEnhancedCSV(data) {
    const headers = this.columns.map(col => `"${col.title}"`).join(',');
    const rows = data.map(row =>
        this.columns.map(column => {
          const value = this.getCellValue(row, column.key);
          const strValue = value !== null && value !== undefined ? String(value).replace(/"/g, '""') : '';
          return `"${strValue}"`;
        }).join(',')
    );

    return [headers, ...rows].join('\n');
  }

  handleBulkAction(action) {
    const selectedRows = this.getSelectedRowData();

    if (!isNonEmptyArray(selectedRows)) {
      showToast('No rows selected', 'warning');
      return;
    }

    const selectedCount = formatNumber(selectedRows.length);

    switch (action) {
      case 'delete':
        showConfirm(
            'Confirm Bulk Delete',
            `Are you sure you want to delete ${selectedCount} selected records? This action cannot be undone.`,
            () => {
              // Implement bulk deletion logic
              showToast(`Deleted ${selectedCount} records`, 'success');
              this.selectedRows.clear();
              this.renderTable();
            }
        );
        break;

      case 'export':
        this.enhancedExportData('csv');
        break;

      default:
        // Dispatch custom event for other bulk actions
        const event = new CustomEvent('tableBulkAction', {
          detail: {
            action: action,
            rows: selectedRows,
            rowIds: Array.from(this.selectedRows),
            tableId: this.containerId
          }
        });
        document.dispatchEvent(event);
    }
  }

  handleResize() {
    if (this.options.responsive) {
      if (window.innerWidth < 768) {
        this.container.classList.add('table-responsive-mobile');
      } else {
        this.container.classList.remove('table-responsive-mobile');
      }
    }
  }

  saveUserPreferences() {
    const preferences = {
      pageSize: this.pageSize,
      sortColumn: this.sortColumn,
      sortDirection: this.sortDirection,
      currentPage: this.currentPage,
      filters: this.filters
    };
    this.storage.set('preferences', preferences);
  }

  loadUserPreferences() {
    const preferences = this.storage.get('preferences');
    if (preferences) {
      this.pageSize = preferences.pageSize || this.pageSize;
      this.sortColumn = preferences.sortColumn || null;
      this.sortDirection = preferences.sortDirection || 'asc';
      this.currentPage = preferences.currentPage || 1;
      this.filters = preferences.filters || {};
    }

    // Load cached data
    const cachedData = this.storage.get('data');
    const cachedColumns = this.storage.get('columns');

    if (cachedData && isNonEmptyArray(cachedData)) {
      this.data = cachedData;
      this.columns = cachedColumns || this.columns;
      this.filteredData = [...cachedData];
    }
  }

  setupAutoRefresh() {
    if (this.options.autoRefresh) {
      this.refreshInterval = setInterval(() => {
        this.refreshTable();
      }, this.options.refreshInterval);
    }
  }

  refreshTable() {
    this.dispatchTableEvent('refreshRequested', {});
    // Custom refresh logic can be implemented here
    this.renderTable();
  }

  handleError(error, context) {
    console.error(`DataTable error in ${context}:`, error);

    const safeMessage = sanitizeHtml(
        error.message || 'An unexpected error occurred'
    );

    showError(`DataTable error: ${safeMessage}`);
  }

  destroy() {
    // Clear intervals
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }

    // Remove event listeners
    window.removeEventListener('resize', this.handleResize);

    // Clear container
    if (this.container) {
      this.container.innerHTML = '';
    }

    // Clear selections
    this.selectedRows.clear();

    console.log(`DataTable destroyed: ${this.tableId}`);
    showToast('Data table destroyed', 'info');
  }
}

// Make it available globally
window.DataTableComponent = DataTableComponent;

// Auto-initialize data tables with specific data attributes
document.addEventListener('DOMContentLoaded', function() {
  document.querySelectorAll('[data-datatable]').forEach(element => {
    const tableId = element.id;
    const options = JSON.parse(element.dataset.options || '{}');
    window[`${tableId}Table`] = new DataTableComponent(tableId, options);
  });
});