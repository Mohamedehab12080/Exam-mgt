// Charts Component
class ChartsComponent {
  constructor(containerId, options = {}) {
    this.containerId = containerId;
    this.container = document.getElementById(containerId);
    this.options = {
      type: 'line', // line, bar, pie, doughnut, radar, polarArea
      data: {},
      options: {},
      responsive: true,
      maintainAspectRatio: false,
      animation: true,
      plugins: [],
      ...options
    };
    
    this.chart = null;
    this.isVisible = false;
    
    this.init();
  }

  /**
   * Initialize charts component
   */
  init() {
    if (!this.container) {
      console.error(`Container with ID '${this.containerId}' not found`);
      return;
    }
    
    this.render();
    this.createChart();
    
    console.log(`Charts component initialized for ${this.containerId}`);
  }

  /**
   * Render chart container
   */
  render() {
    this.container.innerHTML = `
      <div class="chart-container">
        <canvas id="${this.containerId}-canvas"></canvas>
      </div>
    `;
  }

  /**
   * Create chart instance
   */
  createChart() {
    const canvas = document.getElementById(`${this.containerId}-canvas`);
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    
    // Chart.js configuration
    const chartConfig = {
      type: this.options.type,
      data: this.processData(this.options.data),
      options: this.getChartOptions()
    };

    // Create chart instance
    this.chart = new Chart(ctx, chartConfig);
    this.isVisible = true;
  }

  /**
   * Process chart data
   * @param {Object} data - Raw data
   * @returns {Object} Processed data
   */
  processData(data) {
    const processedData = {
      labels: data.labels || [],
      datasets: []
    };

    // Process datasets
    if (data.datasets) {
      processedData.datasets = data.datasets.map((dataset, index) => ({
        label: dataset.label || `Dataset ${index + 1}`,
        data: dataset.data || [],
        backgroundColor: dataset.backgroundColor || this.getDefaultColor(index, 'background'),
        borderColor: dataset.borderColor || this.getDefaultColor(index, 'border'),
        borderWidth: dataset.borderWidth || 2,
        fill: dataset.fill !== undefined ? dataset.fill : false,
        tension: dataset.tension || 0.4,
        pointRadius: dataset.pointRadius || 4,
        pointHoverRadius: dataset.pointHoverRadius || 6,
        ...dataset
      }));
    }

    return processedData;
  }

  /**
   * Get chart options
   * @returns {Object} Chart options
   */
  getChartOptions() {
    const baseOptions = {
      responsive: this.options.responsive,
      maintainAspectRatio: this.options.maintainAspectRatio,
      animation: this.options.animation,
      plugins: {
        legend: {
          position: 'top',
          labels: {
            usePointStyle: true,
            padding: 20
          }
        },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          titleColor: '#fff',
          bodyColor: '#fff',
          borderColor: '#666',
          borderWidth: 1,
          cornerRadius: 6,
          displayColors: true
        }
      }
    };

    // Type-specific options
    switch (this.options.type) {
      case 'line':
      case 'bar':
        return {
          ...baseOptions,
          scales: {
            x: {
              grid: {
                display: false
              },
              ticks: {
                color: '#666'
              }
            },
            y: {
              beginAtZero: true,
              grid: {
                color: 'rgba(0, 0, 0, 0.1)'
              },
              ticks: {
                color: '#666'
              }
            }
          }
        };
        
      case 'pie':
      case 'doughnut':
        return {
          ...baseOptions,
          plugins: {
            ...baseOptions.plugins,
            legend: {
              position: 'bottom',
              labels: {
                usePointStyle: true,
                padding: 20
              }
            }
          }
        };
        
      default:
        return baseOptions;
    }
  }

  /**
   * Get default color
   * @param {number} index - Dataset index
   * @param {string} type - Color type (background, border)
   * @returns {string} Color
   */
  getDefaultColor(index, type = 'background') {
    const colors = [
      { background: 'rgba(54, 162, 235, 0.2)', border: 'rgb(54, 162, 235)' },
      { background: 'rgba(255, 99, 132, 0.2)', border: 'rgb(255, 99, 132)' },
      { background: 'rgba(255, 205, 86, 0.2)', border: 'rgb(255, 205, 86)' },
      { background: 'rgba(75, 192, 192, 0.2)', border: 'rgb(75, 192, 192)' },
      { background: 'rgba(153, 102, 255, 0.2)', border: 'rgb(153, 102, 255)' },
      { background: 'rgba(255, 159, 64, 0.2)', border: 'rgb(255, 159, 64)' }
    ];
    
    const color = colors[index % colors.length];
    return color[type];
  }

  /**
   * Update chart data
   * @param {Object} newData - New data
   */
  updateData(newData) {
    if (!this.chart) return;
    
    this.options.data = { ...this.options.data, ...newData };
    this.chart.data = this.processData(this.options.data);
    this.chart.update('active');
  }

  /**
   * Update chart type
   * @param {string} newType - New chart type
   */
  updateType(newType) {
    if (!this.chart) return;
    
    this.options.type = newType;
    this.chart.config.type = newType;
    this.chart.update('active');
  }

  /**
   * Add dataset
   * @param {Object} dataset - New dataset
   */
  addDataset(dataset) {
    if (!this.chart) return;
    
    const processedDataset = {
      label: dataset.label || `Dataset ${this.chart.data.datasets.length + 1}`,
      data: dataset.data || [],
      backgroundColor: dataset.backgroundColor || this.getDefaultColor(this.chart.data.datasets.length, 'background'),
      borderColor: dataset.borderColor || this.getDefaultColor(this.chart.data.datasets.length, 'border'),
      ...dataset
    };
    
    this.chart.data.datasets.push(processedDataset);
    this.chart.update('active');
  }

  /**
   * Remove dataset
   * @param {number} index - Dataset index to remove
   */
  removeDataset(index) {
    if (!this.chart) return;
    
    this.chart.data.datasets.splice(index, 1);
    this.chart.update('active');
  }

  /**
   * Update dataset
   * @param {number} index - Dataset index
   * @param {Object} updates - Dataset updates
   */
  updateDataset(index, updates) {
    if (!this.chart) return;
    
    Object.assign(this.chart.data.datasets[index], updates);
    this.chart.update('active');
  }

  /**
   * Set chart options
   * @param {Object} options - New options
   */
  setOptions(options) {
    if (!this.chart) return;
    
    this.options.options = { ...this.options.options, ...options };
    this.chart.options = this.getChartOptions();
    this.chart.update('active');
  }

  /**
   * Resize chart
   */
  resize() {
    if (!this.chart) return;
    
    this.chart.resize();
  }

  /**
   * Destroy chart
   */
  destroy() {
    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
      this.isVisible = false;
    }
    
    if (this.container) {
      this.container.innerHTML = '';
    }
  }

  /**
   * Show chart
   */
  show() {
    if (this.container) {
      this.container.style.display = 'block';
      this.isVisible = true;
      
      // Resize chart after showing
      setTimeout(() => {
        this.resize();
      }, 100);
    }
  }

  /**
   * Hide chart
   */
  hide() {
    if (this.container) {
      this.container.style.display = 'none';
      this.isVisible = false;
    }
  }

  /**
   * Export chart as image
   * @param {string} format - Image format (png, jpg, svg)
   * @param {Object} options - Export options
   * @returns {string} Image data URL
   */
  exportAsImage(format = 'png', options = {}) {
    if (!this.chart) return null;
    
    return this.chart.toBase64Image();
  }

  /**
   * Get chart data as JSON
   * @returns {Object} Chart data
   */
  getChartData() {
    if (!this.chart) return null;
    
    return {
      type: this.chart.config.type,
      data: this.chart.data,
      options: this.chart.options
    };
  }
}

// Utility functions for creating common chart types
class ChartUtils {
  /**
   * Create line chart
   * @param {string} containerId - Container ID
   * @param {Object} data - Chart data
   * @param {Object} options - Chart options
   * @returns {ChartsComponent} Chart instance
   */
  static createLineChart(containerId, data, options = {}) {
    return new ChartsComponent(containerId, {
      type: 'line',
      data: data,
      ...options
    });
  }

  /**
   * Create bar chart
   * @param {string} containerId - Container ID
   * @param {Object} data - Chart data
   * @param {Object} options - Chart options
   * @returns {ChartsComponent} Chart instance
   */
  static createBarChart(containerId, data, options = {}) {
    return new ChartsComponent(containerId, {
      type: 'bar',
      data: data,
      ...options
    });
  }

  /**
   * Create pie chart
   * @param {string} containerId - Container ID
   * @param {Object} data - Chart data
   * @param {Object} options - Chart options
   * @returns {ChartsComponent} Chart instance
   */
  static createPieChart(containerId, data, options = {}) {
    return new ChartsComponent(containerId, {
      type: 'pie',
      data: data,
      ...options
    });
  }

  /**
   * Create doughnut chart
   * @param {string} containerId - Container ID
   * @param {Object} data - Chart data
   * @param {Object} options - Chart options
   * @returns {ChartsComponent} Chart instance
   */
  static createDoughnutChart(containerId, data, options = {}) {
    return new ChartsComponent(containerId, {
      type: 'doughnut',
      data: data,
      ...options
    });
  }

  /**
   * Create dashboard stats chart
   * @param {string} containerId - Container ID
   * @param {Array} stats - Stats data
   * @returns {ChartsComponent} Chart instance
   */
  static createStatsChart(containerId, stats) {
    const data = {
      labels: stats.map(stat => stat.label),
      datasets: [{
        label: 'Statistics',
        data: stats.map(stat => stat.value),
        backgroundColor: stats.map((_, index) => this.getDefaultColor(index, 'background')),
        borderColor: stats.map((_, index) => this.getDefaultColor(index, 'border')),
        borderWidth: 2
      }]
    };

    return new ChartsComponent(containerId, {
      type: 'bar',
      data: data,
      options: {
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }

  /**
   * Create trend chart
   * @param {string} containerId - Container ID
   * @param {Array} trends - Trend data
   * @returns {ChartsComponent} Chart instance
   */
  static createTrendChart(containerId, trends) {
    const data = {
      labels: trends.labels,
      datasets: trends.datasets.map((dataset, index) => ({
        label: dataset.label,
        data: dataset.data,
        backgroundColor: this.getDefaultColor(index, 'background'),
        borderColor: this.getDefaultColor(index, 'border'),
        borderWidth: 2,
        fill: false,
        tension: 0.4
      }))
    };

    return new ChartsComponent(containerId, {
      type: 'line',
      data: data,
      options: {
        plugins: {
          legend: {
            position: 'top'
          }
        },
        scales: {
          x: {
            grid: {
              display: false
            }
          },
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }

  /**
   * Get default color
   * @param {number} index - Color index
   * @param {string} type - Color type
   * @returns {string} Color
   */
  static getDefaultColor(index, type = 'background') {
    const colors = [
      { background: 'rgba(54, 162, 235, 0.2)', border: 'rgb(54, 162, 235)' },
      { background: 'rgba(255, 99, 132, 0.2)', border: 'rgb(255, 99, 132)' },
      { background: 'rgba(255, 205, 86, 0.2)', border: 'rgb(255, 205, 86)' },
      { background: 'rgba(75, 192, 192, 0.2)', border: 'rgb(75, 192, 192)' },
      { background: 'rgba(153, 102, 255, 0.2)', border: 'rgb(153, 102, 255)' },
      { background: 'rgba(255, 159, 64, 0.2)', border: 'rgb(255, 159, 64)' }
    ];
    
    const color = colors[index % colors.length];
    return color[type];
  }
}

// Export for use in other files
window.ChartsComponent = ChartsComponent;
window.ChartUtils = ChartUtils;