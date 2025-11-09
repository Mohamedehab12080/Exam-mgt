// Table Component for data display and management

class TableComponent {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
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
    }

    init(data = []) {
        this.data = data;
        this.filteredData = [...data];
        this.render();
        this.attachEventListeners();
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
    }

    renderTable(data) {
        // This will be implemented based on specific table requirements
        console.log('TableComponent: renderTable with data:', data);
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
    }

    updateData(newData) {
        this.data = newData;
        this.filteredData = [...newData];
        this.currentPage = 1;
        this.render();
    }

    filterData(filterFunction) {
        this.filteredData = this.data.filter(filterFunction);
        this.currentPage = 1;
        this.render();
    }

    getSelectedRows() {
        const checkboxes = this.container.querySelectorAll('input[type="checkbox"]:checked');
        return Array.from(checkboxes).map(cb => cb.value);
    }
}

// Export for use in other files
window.TableComponent = TableComponent;