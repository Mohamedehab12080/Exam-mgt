// Table Component for data display and management - Enhanced with Unified Interface
class TableComponent {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            console.error(`Container with ID '${containerId}' not found`);
            return;
        }

        this.options = {
            pagination: true,
            search: true,
            actions: true,
            ...options
        };
        this.currentPage = 1;
        this.pageSize = options.pageSize || 10;
        this.data = [];
        this.filteredData = [];
        this.columns = [];
        this.selectedRows = new Set();
    }

    // ENHANCE: Support both simple and advanced initialization
    init(data = [], columns = null) {
        return this.setData(data, columns);
    }

    // UPDATE: Enhanced setData to handle both formats
    setData(data, columns = null) {
        if (!Array.isArray(data)) {
            console.warn('Table data must be an array');
            this.data = [];
            this.filteredData = [];
            return this;
        }

        this.data = data;

        // Handle column configuration
        if (columns) {
            this.columns = columns;
        } else if (!this.columns.length && data.length > 0) {
            // Auto-detect columns if not provided
            this.columns = Object.keys(data[0]).map(key => ({
                key: key,
                title: this.formatColumnTitle(key),
                sortable: true,
                searchable: true
            }));
        }

        this.filteredData = [...data];
        this.currentPage = 1;
        this.selectedRows.clear();
        this.render();
        return this;
    }

    // ADD: Column configuration support
    setColumns(columns) {
        this.columns = columns;
        if (this.data.length > 0) {
            this.render();
        }
        return this;
    }

    // ADD: Format column titles
    formatColumnTitle(key) {
        return key
            .replace(/_/g, ' ')
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, str => str.toUpperCase())
            .trim();
    }

    render() {
        if (!this.container) return;

        const startIndex = (this.currentPage - 1) * this.pageSize;
        const endIndex = startIndex + this.pageSize;
        const pageData = this.filteredData.slice(startIndex, endIndex);

        this.renderTable(pageData);
        if (this.options.pagination) {
            this.renderPagination();
        }

        this.dispatchTableEvent('rendered', {
            data: pageData,
            totalItems: this.filteredData.length
        });
    }

    // ENHANCE: Actual table rendering implementation
    renderTable(data) {
        if (!this.container) return;

        this.container.innerHTML = `
            <div class="table-container">
                ${this.generateTableHTML(data)}
                ${this.options.pagination ? '<div class="pagination"></div>' : ''}
            </div>
        `;

        this.attachEventListeners();
    }

    // ADD: Generate table HTML
    generateTableHTML(data) {
        return `
            <table class="table-component">
                ${this.generateTableHeader()}
                ${this.generateTableBody(data)}
            </table>
        `;
    }

    // ADD: Generate table header
    generateTableHeader() {
        if (!this.columns.length) return '<thead></thead>';

        return `
            <thead>
                <tr>
                    ${this.columns.map(column => `
                        <th class="${column.class || ''}" data-column="${column.key}">
                            ${column.title || column.key}
                        </th>
                    `).join('')}
                    ${this.options.actions ? '<th class="actions-column">Actions</th>' : ''}
                </tr>
            </thead>
        `;
    }

    // ADD: Generate table body
    generateTableBody(data) {
        if (!data.length) {
            return `
                <tbody>
                    <tr>
                        <td colspan="${this.columns.length + (this.options.actions ? 1 : 0)}" class="empty-state">
                            No data available
                        </td>
                    </tr>
                </tbody>
            `;
        }

        return `
            <tbody>
                ${data.map((row, index) => this.generateTableRow(row, index)).join('')}
            </tbody>
        `;
    }

    // ADD: Generate table row
    generateTableRow(row, index) {
        const rowId = this.getRowId(row, index);
        const isSelected = this.selectedRows.has(rowId);

        return `
            <tr class="table-row ${isSelected ? 'selected' : ''}" data-row-id="${rowId}">
                ${this.columns.map(column => `
                    <td class="${column.class || ''}" data-column="${column.key}">
                        ${this.formatCellValue(row[column.key], column)}
                    </td>
                `).join('')}
                ${this.options.actions ? `
                    <td class="actions-column">
                        <button class="btn-view" data-action="view" data-row-id="${rowId}">View</button>
                        <button class="btn-edit" data-action="edit" data-row-id="${rowId}">Edit</button>
                    </td>
                ` : ''}
            </tr>
        `;
    }

    // ADD: Format cell value
    formatCellValue(value, column) {
        if (value === null || value === undefined) return '<span class="text-muted">-</span>';

        // Basic formatting - can be enhanced based on column type
        return String(value);
    }

    // ADD: Generate row ID
    getRowId(row, index) {
        return row.id || row._id || `row-${index}`;
    }

    renderPagination() {
        const totalPages = Math.ceil(this.filteredData.length / this.pageSize);
        if (totalPages <= 1) return;

        const paginationContainer = this.container.querySelector('.pagination');
        if (!paginationContainer) return;

        let paginationHTML = '';

        // Previous button
        paginationHTML += `<button class="pagination-btn ${this.currentPage === 1 ? 'disabled' : ''}" data-page="${this.currentPage - 1}">Previous</button>`;

        // Page numbers
        for (let i = 1; i <= totalPages; i++) {
            paginationHTML += `<button class="pagination-btn ${i === this.currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
        }

        // Next button
        paginationHTML += `<button class="pagination-btn ${this.currentPage === totalPages ? 'disabled' : ''}" data-page="${this.currentPage + 1}">Next</button>`;

        paginationContainer.innerHTML = paginationHTML;
    }

    attachEventListeners() {
        // Pagination events
        const paginationContainer = this.container.querySelector('.pagination');
        if (paginationContainer) {
            paginationContainer.addEventListener('click', (e) => {
                if (e.target.classList.contains('pagination-btn') && !e.target.classList.contains('disabled')) {
                    const page = parseInt(e.target.dataset.page);
                    if (page > 0) {
                        this.currentPage = page;
                        this.render();
                    }
                }
            });
        }

        // Row selection and action events
        this.container.addEventListener('click', (e) => {
            const rowElement = e.target.closest('.table-row');
            if (!rowElement) return;

            const rowId = rowElement.dataset.rowId;

            // Row selection
            if (e.target.type === 'checkbox') {
                this.toggleRowSelection(rowId, e.target.checked);
            }

            // Action buttons
            if (e.target.dataset.action) {
                this.handleRowAction(e.target.dataset.action, rowId, rowElement);
            }
        });
    }

    // ADD: Row selection management
    toggleRowSelection(rowId, selected) {
        if (selected) {
            this.selectedRows.add(rowId);
        } else {
            this.selectedRows.delete(rowId);
        }
        this.dispatchTableEvent('selectionChange', {
            selectedRows: Array.from(this.selectedRows)
        });
    }

    // ADD: Row action handler
    handleRowAction(action, rowId, rowElement) {
        const rowData = this.findRowData(rowId);
        this.dispatchTableEvent('rowAction', {
            action,
            rowId,
            rowData,
            rowElement
        });
    }

    // ADD: Find row data by ID
    findRowData(rowId) {
        return this.data.find(row => this.getRowId(row, this.data.indexOf(row)) === rowId);
    }

    // ENHANCE: Better selection management
    getSelectedRows() {
        return Array.from(this.selectedRows).map(rowId =>
            this.findRowData(rowId)
        ).filter(Boolean);
    }

    // ADD: Get selected row IDs
    getSelectedRowIds() {
        return Array.from(this.selectedRows);
    }

    // ADD: Clear selections
    clearSelection() {
        this.selectedRows.clear();
        this.render();
        return this;
    }

    // UPDATE: Enhanced filter method
    filterData(filterFunction) {
        this.filteredData = this.data.filter(filterFunction);
        this.currentPage = 1;
        this.selectedRows.clear();
        this.render();
        return this;
    }

    // ADD: Search functionality
    search(term, searchableColumns = null) {
        if (!term) {
            this.filteredData = [...this.data];
        } else {
            const columnsToSearch = searchableColumns ||
                this.columns.filter(col => col.searchable !== false).map(col => col.key);

            this.filteredData = this.data.filter(row =>
                columnsToSearch.some(column =>
                    String(row[column] || '').toLowerCase().includes(term.toLowerCase())
                )
            );
        }

        this.currentPage = 1;
        this.selectedRows.clear();
        this.render();
        return this;
    }

    // ADD: Refresh method for compatibility
    refresh() {
        this.render();
        return this;
    }

    // ADD: Get table state
    getTableState() {
        return {
            currentPage: this.currentPage,
            pageSize: this.pageSize,
            totalItems: this.filteredData.length,
            totalPages: Math.ceil(this.filteredData.length / this.pageSize),
            selectedRows: this.getSelectedRows(),
            selectedRowIds: this.getSelectedRowIds(),
            columns: this.columns,
            data: this.data,
            filteredData: this.filteredData
        };
    }

    // ADD: Event dispatching for better integration
    dispatchTableEvent(eventName, detail) {
        const event = new CustomEvent(`table:${eventName}`, {
            detail: {
                tableId: this.container.id,
                ...detail,
                timestamp: new Date().toISOString()
            }
        });
        this.container.dispatchEvent(event);
    }

    // ADD: Destroy method for cleanup
    destroy() {
        this.selectedRows.clear();
        if (this.container) {
            this.container.innerHTML = '';
        }
        this.dispatchTableEvent('destroyed', {});
    }

    // Keep existing methods for backward compatibility
    updateData(newData) {
        return this.setData(newData);
    }
}

// Export for use in other files
window.TableComponent = TableComponent;