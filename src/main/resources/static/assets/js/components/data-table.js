// Data Table Component
class DataTableComponent {
  constructor(containerId, options = {}) {
    this.containerId = containerId;
    this.container = document.getElementById(containerId);
    this.options = {
      pageSize: 10,
      pageSizes: [5, 10, 25, 50, 100],
      sortable: true,
      searchable: true,
      filterable: true,
      exportable: true,
      bulkActions: true,
      responsive: true,
      ...options
    };
    
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
    
    this.init();
  }

  /**
   * Initialize data table component
   */
  init() {
    if (!this.container) {
      console.error(`Container with ID '${this.containerId}' not found`);
      return;
    }
    
    this.setupEventListeners();
    this.renderTable();
    
    console.log(`DataTable component initialized for ${this.containerId}`);
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Search functionality
    if (this.options.searchable) {
      const searchInput = document.getElementById(`${this.containerId}-search`);
      if (searchInput) {
        searchInput.addEventListener('input', this.debounce((e) => {
          this.searchQuery = e.target.value;
          this.currentPage = 1;
          this.filterData();
        }, 300));
      }
    }

    // Page size change
    const pageSizeSelect = document.getElementById(`${this.containerId}-pageSize`);
    if (pageSizeSelect) {
      pageSizeSelect.addEventListener('change', (e) => {
        this.pageSize = parseInt(e.target.value);
        this.currentPage = 1;
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

      // Bulk action buttons
      document.querySelectorAll(`[data-table="${this.containerId}"][data-bulk-action]`).forEach(btn => {
        btn.addEventListener('click', (e) => {
          const action = e.target.dataset.bulkAction;
          this.handleBulkAction(action);
        });
      });
    }

    // Export buttons
    if (this.options.exportable) {
      document.querySelectorAll(`[data-table="${this.containerId}"][data-export]`).forEach(btn => {
        btn.addEventListener('click', (e) => {
          const format = e.target.dataset.export;
          this.exportData(format);
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
  }

  /**
   * Set data for the table
   * @param {Array} data - Array of data objects
   * @param {Array} columns - Array of column definitions
   */
  setData(data, columns) {
    this.data = data;
    this.columns = columns;
    this.currentPage = 1;
    this.selectedRows.clear();
    this.filterData();
  }

  /**
   * Set columns for the table
   * @param {Array} columns - Array of column definitions
   */
  setColumns(columns) {
    this.columns = columns;
    this.renderTable();
  }

  /**
   * Filter data based on search query and filters
   */
  filterData() {
    this.filteredData = [...this.data];

    // Apply search filter
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      this.filteredData = this.filteredData.filter(row => {
        return this.columns.some(column => {
          const value = this.getCellValue(row, column.key);
          return String(value).toLowerCase().includes(query);
        });
      });
    }

    // Apply column filters
    Object.keys(this.filters).forEach(filterKey => {
      const filterValue = this.filters[filterKey];
      if (filterValue) {
        this.filteredData = this.filteredData.filter(row => {
          const cellValue = this.getCellValue(row, filterKey);
          return String(cellValue).toLowerCase() === String(filterValue).toLowerCase();
        });
      }
    });

    // Apply sorting
    if (this.sortColumn) {
      this.filteredData.sort((a, b) => {
        const aValue = this.getCellValue(a, this.sortColumn);
        const bValue = this.getCellValue(b, this.sortColumn);
        
        let comparison = 0;
        if (aValue > bValue) comparison = 1;
        else if (aValue < bValue) comparison = -1;
        
        return this.sortDirection === 'asc' ? comparison : -comparison;
      });
    }

    this.renderTable();
  }

  /**
   * Get cell value from row data
   * @param {Object} row - Row data
   * @param {string} key - Column key
   * @returns {*} Cell value
   */
  getCellValue(row, key) {
    const keys = key.split('.');
    let value = row;
    
    for (const k of keys) {
      value = value?.[k];
    }
    
    return value;
  }

  /**
   * Render the table
   */
  renderTable() {
    if (!this.container) return;

    const totalPages = Math.ceil(this.filteredData.length / this.pageSize);
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    const currentPageData = this.filteredData.slice(startIndex, endIndex);

    this.container.innerHTML = `
      <div class="data-table-container">
        ${this.renderToolbar()}
        ${this.renderTableHeader()}
        ${this.renderTableBody(currentPageData)}
        ${this.renderPagination(totalPages)}
      </div>
    `;

    this.setupTableEventListeners();
  }

  /**
   * Render table toolbar
   * @returns {string} Toolbar HTML
   */
  renderToolbar() {
    return `
      <div class="data-table-toolbar">
        <div class="toolbar-left">
          ${this.options.searchable ? `
            <div class="search-box">
              <input type="text" 
                     id="${this.containerId}-search" 
                     class="form-control" 
                     placeholder="Search..." 
                     value="${this.searchQuery}">
              <i class="fas fa-search"></i>
            </div>
          ` : ''}
          
          ${this.options.filterable ? this.renderFilters() : ''}
        </div>
        
        <div class="toolbar-right">
          ${this.options.bulkActions && this.selectedRows.size > 0 ? `
            <div class="bulk-actions">
              <span class="selected-count">${this.selectedRows.size} selected</span>
              <button class="btn btn-sm btn-outline" data-table="${this.containerId}" data-bulk-action="delete">
                <i class="fas fa-trash"></i> Delete
              </button>
              <button class="btn btn-sm btn-outline" data-table="${this.containerId}" data-bulk-action="export">
                <i class="fas fa-download"></i> Export
              </button>
            </div>
          ` : ''}
          
          <div class="page-size-selector">
            <select id="${this.containerId}-pageSize" class="form-control">
              ${this.options.pageSizes.map(size => `
                <option value="${size}" ${size === this.pageSize ? 'selected' : ''}>${size} per page</option>
              `).join('')}
            </select>
          </div>
          
          ${this.options.exportable ? `
            <div class="export-buttons">
              <button class="btn btn-sm btn-outline" data-table="${this.containerId}" data-export="csv">
                <i class="fas fa-file-csv"></i> CSV
              </button>
              <button class="btn btn-sm btn-outline" data-table="${this.containerId}" data-export="json">
                <i class="fas fa-file-code"></i> JSON
              </button>
            </div>
          ` : ''}
          
          <button class="btn btn-sm btn-outline" id="${this.containerId}-refresh">
            <i class="fas fa-sync-alt"></i>
          </button>
        </div>
      </div>
    `;
  }

  /**
   * Render filters
   * @returns {string} Filters HTML
   */
  renderFilters() {
    // This would be customized based on available filters
    return `
      <div class="table-filters">
        <button class="btn btn-sm btn-outline" data-table="${this.containerId}" data-filter="status" data-filter-value="active">
          Active
        </button>
        <button class="btn btn-sm btn-outline" data-table="${this.containerId}" data-filter="status" data-filter-value="inactive">
          Inactive
        </button>
        <button class="btn btn-sm btn-outline" data-table="${this.containerId}" data-filter="clear">
          Clear Filters
        </button>
      </div>
    `;
  }

  /**
   * Render table header
   * @returns {string} Header HTML
   */
  renderTableHeader() {
    return `
      <div class="table-header">
        <table class="data-table">
          <thead>
            <tr>
              ${this.options.bulkActions ? `
                <th class="checkbox-column">
                  <input type="checkbox" id="${this.containerId}-selectAll">
                </th>
              ` : ''}
              
              ${this.columns.map(column => `
                <th class="${column.class || ''} ${this.options.sortable && column.sortable !== false ? 'sortable' : ''}"
                    data-column="${column.key}"
                    data-sort="${this.sortColumn === column.key ? this.sortDirection : 'none'}">
                  ${column.title}
                  ${this.options.sortable && column.sortable !== false ? `
                    <span class="sort-indicator">
                      ${this.sortColumn === column.key ? 
                        (this.sortDirection === 'asc' ? '<i class="fas fa-sort-up"></i>' : '<i class="fas fa-sort-down"></i>') : 
                        '<i class="fas fa-sort"></i>'}
                    </span>
                  ` : ''}
                </th>
              `).join('')}
              
              <th class="actions-column">Actions</th>
            </tr>
          </thead>
        </table>
      </div>
    `;
  }

  /**
   * Render table body
   * @param {Array} data - Current page data
   * @returns {string} Body HTML
   */
  renderTableBody(data) {
    if (data.length === 0) {
      return `
        <div class="table-body">
          <div class="empty-state">
            <i class="fas fa-inbox"></i>
            <h3>No Data Found</h3>
            <p>No data matches your current filters.</p>
          </div>
        </div>
      `;
    }

    return `
      <div class="table-body">
        <table class="data-table">
          <tbody>
            ${data.map((row, index) => this.renderTableRow(row, index)).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  /**
   * Render table row
   * @param {Object} row - Row data
   * @param {number} index - Row index
   * @returns {string} Row HTML
   */
  renderTableRow(row, index) {
    const rowId = this.getRowId(row);
    const isSelected = this.selectedRows.has(rowId);

    return `
      <tr class="${isSelected ? 'selected' : ''}" data-row-id="${rowId}">
        ${this.options.bulkActions ? `
          <td class="checkbox-column">
            <input type="checkbox" 
                   class="row-checkbox" 
                   data-row-id="${rowId}" 
                   ${isSelected ? 'checked' : ''}>
          </td>
        ` : ''}
        
        ${this.columns.map(column => `
          <td class="${column.class || ''}">
            ${this.renderCell(row, column)}
          </td>
        `).join('')}
        
        <td class="actions-column">
          <div class="row-actions">
            <button class="btn btn-sm btn-outline action-btn" 
                    data-action="view" 
                    data-row-id="${rowId}"
                    title="View">
              <i class="fas fa-eye"></i>
            </button>
            <button class="btn btn-sm btn-outline action-btn" 
                    data-action="edit" 
                    data-row-id="${rowId}"
                    title="Edit">
              <i class="fas fa-edit"></i>
            </button>
            <button class="btn btn-sm btn-outline action-btn" 
                    data-action="delete" 
                    data-row-id="${rowId}"
                    title="Delete">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }

  /**
   * Render cell content
   * @param {Object} row - Row data
   * @param {Object} column - Column definition
   * @returns {string} Cell HTML
   */
  renderCell(row, column) {
    const value = this.getCellValue(row, column.key);
    
    // Handle custom render function
    if (column.render && typeof column.render === 'function') {
      return column.render(value, row);
    }
    
    // Handle different data types
    if (value === null || value === undefined) {
      return '<span class="text-muted">-</span>';
    }
    
    if (column.type === 'date') {
      return this.formatDate(value);
    }
    
    if (column.type === 'datetime') {
      return this.formatDateTime(value);
    }
    
    if (column.type === 'number') {
      return this.formatNumber(value);
    }
    
    if (column.type === 'currency') {
      return this.formatCurrency(value);
    }
    
    if (column.type === 'boolean') {
      return this.formatBoolean(value);
    }
    
    if (column.type === 'badge') {
      return this.formatBadge(value, column.badgeMap);
    }
    
    if (column.type === 'status') {
      return this.formatStatus(value);
    }
    
    return String(value);
  }

  /**
   * Render pagination
   * @param {number} totalPages - Total number of pages
   * @returns {string} Pagination HTML
   */
  renderPagination(totalPages) {
    if (totalPages <= 1) return '';

    const startPage = Math.max(1, this.currentPage - 2);
    const endPage = Math.min(totalPages, this.currentPage + 2);

    return `
      <div class="data-table-pagination">
        <div class="pagination-info">
          Showing ${(this.currentPage - 1) * this.pageSize + 1} to ${Math.min(this.currentPage * this.pageSize, this.filteredData.length)} of ${this.filteredData.length} entries
        </div>
        
        <div class="pagination-controls">
          <button class="btn btn-sm btn-outline ${this.currentPage === 1 ? 'disabled' : ''}" 
                  data-action="first" 
                  data-page="1">
            <i class="fas fa-angle-double-left"></i>
          </button>
          
          <button class="btn btn-sm btn-outline ${this.currentPage === 1 ? 'disabled' : ''}" 
                  data-action="prev" 
                  data-page="${this.currentPage - 1}">
            <i class="fas fa-angle-left"></i>
          </button>
          
          ${Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i).map(page => `
            <button class="btn btn-sm ${page === this.currentPage ? 'btn-primary' : 'btn-outline'}" 
                    data-action="page" 
                    data-page="${page}">
              ${page}
            </button>
          `).join('')}
          
          <button class="btn btn-sm btn-outline ${this.currentPage === totalPages ? 'disabled' : ''}" 
                  data-action="next" 
                  data-page="${this.currentPage + 1}">
            <i class="fas fa-angle-right"></i>
          </button>
          
          <button class="btn btn-sm btn-outline ${this.currentPage === totalPages ? 'disabled' : ''}" 
                  data-action="last" 
                  data-page="${totalPages}">
            <i class="fas fa-angle-double-right"></i>
          </button>
        </div>
      </div>
    `;
  }

  /**
   * Setup table event listeners
   */
  setupTableEventListeners() {
    // Row checkboxes
    this.container.querySelectorAll('.row-checkbox').forEach(checkbox => {
      checkbox.addEventListener('change', (e) => {
        const rowId = e.target.dataset.rowId;
        this.toggleRowSelection(rowId, e.target.checked);
      });
    });

    // Action buttons
    this.container.querySelectorAll('.action-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const action = e.target.dataset.action;
        const rowId = e.target.dataset.rowId;
        this.handleRowAction(action, rowId);
      });
    });

    // Sortable columns
    if (this.options.sortable) {
      this.container.querySelectorAll('th.sortable').forEach(th => {
        th.addEventListener('click', () => {
          const column = th.dataset.column;
          this.sortByColumn(column);
        });
      });
    }

    // Pagination buttons
    this.container.querySelectorAll('[data-action]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const action = e.target.dataset.action;
        const page = parseInt(e.target.dataset.page);
        
        switch (action) {
          case 'first':
            this.goToPage(1);
            break;
          case 'prev':
            this.goToPage(this.currentPage - 1);
            break;
          case 'next':
            this.goToPage(this.currentPage + 1);
            break;
          case 'last':
            const totalPages = Math.ceil(this.filteredData.length / this.pageSize);
            this.goToPage(totalPages);
            break;
          case 'page':
            this.goToPage(page);
            break;
        }
      });
    });
  }

  /**
   * Toggle row selection
   * @param {string} rowId - Row ID
   * @param {boolean} selected - Whether row is selected
   */
  toggleRowSelection(rowId, selected) {
    if (selected) {
      this.selectedRows.add(rowId);
    } else {
      this.selectedRows.delete(rowId);
    }
    
    this.updateSelectAllCheckbox();
    this.renderToolbar();
  }

  /**
   * Toggle select all rows
   * @param {boolean} selectAll - Whether to select all rows
   */
  toggleSelectAll(selectAll) {
    if (selectAll) {
      this.filteredData.forEach(row => {
        const rowId = this.getRowId(row);
        this.selectedRows.add(rowId);
      });
    } else {
      this.selectedRows.clear();
    }
    
    this.renderTable();
  }

  /**
   * Update select all checkbox state
   */
  updateSelectAllCheckbox() {
    const selectAllCheckbox = document.getElementById(`${this.containerId}-selectAll`);
    if (selectAllCheckbox) {
      const allSelected = this.filteredData.length > 0 && 
                         this.filteredData.every(row => this.selectedRows.has(this.getRowId(row)));
      const someSelected = this.filteredData.some(row => this.selectedRows.has(this.getRowId(row)));
      
      selectAllCheckbox.checked = allSelected;
      selectAllCheckbox.indeterminate = someSelected && !allSelected;
    }
  }

  /**
   * Handle row action
   * @param {string} action - Action type
   * @param {string} rowId - Row ID
   */
  handleRowAction(action, rowId) {
    const row = this.data.find(r => this.getRowId(r) === rowId);
    
    if (!row) {
      console.error('Row not found:', rowId);
      return;
    }

    // Dispatch custom event
    const event = new CustomEvent('tableAction', {
      detail: {
        action: action,
        row: row,
        rowId: rowId,
        tableId: this.containerId
      }
    });
    
    document.dispatchEvent(event);
  }

  /**
   * Sort by column
   * @param {string} column - Column key
   */
  sortByColumn(column) {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    
    this.filterData();
  }

  /**
   * Set filter
   * @param {string} filterType - Filter type
   * @param {string} filterValue - Filter value
   */
  setFilter(filterType, filterValue) {
    if (filterType === 'clear') {
      this.filters = {};
    } else {
      this.filters[filterType] = filterValue;
    }
    
    this.currentPage = 1;
    this.filterData();
  }

  /**
   * Handle bulk action
   * @param {string} action - Bulk action type
   */
  handleBulkAction(action) {
    const selectedRows = Array.from(this.selectedRows).map(rowId => 
      this.data.find(r => this.getRowId(r) === rowId)
    ).filter(Boolean);

    if (selectedRows.length === 0) {
      showToast('No rows selected', 'warning');
      return;
    }

    // Dispatch custom event
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

  /**
   * Export data
   * @param {string} format - Export format (csv, json)
   */
  exportData(format) {
    const dataToExport = this.filteredData;
    
    switch (format) {
      case 'csv':
        this.exportToCSV(dataToExport);
        break;
      case 'json':
        this.exportToJSON(dataToExport);
        break;
      default:
        console.error('Unsupported export format:', format);
    }
  }

  /**
   * Export to CSV
   * @param {Array} data - Data to export
   */
  exportToCSV(data) {
    if (!data || data.length === 0) {
      showToast('No data to export', 'warning');
      return;
    }

    const headers = this.columns.map(col => col.title);
    const csvRows = [headers.join(',')];
    
    data.forEach(row => {
      const values = this.columns.map(column => {
        const value = this.getCellValue(row, column.key);
        const stringValue = String(value).replace(/"/g, '""');
        return `"${stringValue}"`;
      });
      csvRows.push(values.join(','));
    });
    
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${this.containerId}-export-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
    
    showToast('Data exported to CSV successfully', 'success');
  }

  /**
   * Export to JSON
   * @param {Array} data - Data to export
   */
  exportToJSON(data) {
    if (!data || data.length === 0) {
      showToast('No data to export', 'warning');
      return;
    }

    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${this.containerId}-export-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    window.URL.revokeObjectURL(url);
    
    showToast('Data exported to JSON successfully', 'success');
  }

  /**
   * Go to page
   * @param {number} page - Page number
   */
  goToPage(page) {
    const totalPages = Math.ceil(this.filteredData.length / this.pageSize);
    
    if (page < 1 || page > totalPages) {
      return;
    }
    
    this.currentPage = page;
    this.renderTable();
  }

  /**
   * Refresh table
   */
  refreshTable() {
    this.filterData();
    showToast('Table refreshed', 'success');
  }

  /**
   * Get row ID
   * @param {Object} row - Row data
   * @returns {string} Row ID
   */
  getRowId(row) {
    return row.id || row._id || JSON.stringify(row);
  }

  /**
   * Format date
   * @param {string} dateString - Date string
   * @returns {string} Formatted date
   */
  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  }

  /**
   * Format date and time
   * @param {string} dateString - Date string
   * @returns {string} Formatted date and time
   */
  formatDateTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString();
  }

  /**
   * Format number
   * @param {number} number - Number to format
   * @returns {string} Formatted number
   */
  formatNumber(number) {
    return new Intl.NumberFormat().format(number);
  }

  /**
   * Format currency
   * @param {number} amount - Amount to format
   * @returns {string} Formatted currency
   */
  formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  /**
   * Format boolean
   * @param {boolean} value - Boolean value
   * @returns {string} Formatted boolean
   */
  formatBoolean(value) {
    return value ? '<span class="badge badge-success">Yes</span>' : '<span class="badge badge-danger">No</span>';
  }

  /**
   * Format badge
   * @param {string} value - Value to format
   * @param {Object} badgeMap - Badge mapping
   * @returns {string} Formatted badge
   */
  formatBadge(value, badgeMap = {}) {
    const badge = badgeMap[value] || { text: value, color: 'secondary' };
    return `<span class="badge badge-${badge.color}">${badge.text}</span>`;
  }

  /**
   * Format status
   * @param {string} status - Status to format
   * @returns {string} Formatted status
   */
  formatStatus(status) {
    const statusMap = {
      'active': { text: 'Active', color: 'success' },
      'inactive': { text: 'Inactive', color: 'danger' },
      'pending': { text: 'Pending', color: 'warning' },
      'completed': { text: 'Completed', color: 'info' }
    };
    
    const statusBadge = statusMap[status.toLowerCase()] || { text: status, color: 'secondary' };
    return `<span class="badge badge-${statusBadge.color}">${statusBadge.text}</span>`;
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
   * Destroy the table
   */
  destroy() {
    if (this.container) {
      this.container.innerHTML = '';
    }
    
    // Clear any intervals or timeouts
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }
}

// Export for use in other files
window.DataTableComponent = DataTableComponent;