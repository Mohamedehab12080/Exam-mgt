// Import utilities at the top
import {
  formatNumber,
  formatPercentage,
  formatCurrency,
  debounce,
  generateId,
  randomColor,
  showToast,
  showLoading,
  hideLoading
} from 'static/assets/js/utils/index.js';

export class ChartsComponent {
  constructor(containerId, options = {}) {
    this.containerId = containerId;
    this.container = document.getElementById(containerId);
    this.chartId = generateId('chart');

    this.options = {
      type: 'line',
      data: {},
      options: {},
      responsive: true,
      maintainAspectRatio: false,
      animation: true,
      plugins: [],
      // Enhanced options with utility integration
      formatValues: true,
      showTooltips: true,
      autoResize: true,
      ...options
    };

    this.chart = null;
    this.isVisible = false;
    this.resizeHandler = null;

    this.init();
  }

  /**
   * Initialize charts component with enhanced utilities
   */
  init() {
    if (!this.container) {
      console.error(`Container with ID '${this.containerId}' not found`);
      showToast('Chart container not found', 'error');
      return;
    }

    try {
      showLoading();
      this.render();
      this.createChart();
      this.setupEventListeners();

      console.log(`Charts component initialized for ${this.containerId}`);
      showToast('Chart loaded successfully', 'success');
    } catch (error) {
      console.error('Failed to initialize chart:', error);
      showToast('Failed to load chart', 'error');
    } finally {
      hideLoading();
    }
  }

  /**
   * Enhanced render with utility classes
   */
  render() {
    this.container.innerHTML = `
      <div class="chart-container" id="${this.chartId}">
        <div class="chart-header">
          <h3 class="chart-title">${this.options.title || 'Chart'}</h3>
          <div class="chart-actions">
            <button class="btn btn-sm btn-outline" onclick="chartsComponent.exportAsImage('png')">
              <i class="fas fa-download"></i> Export
            </button>
            <button class="btn btn-sm btn-outline" onclick="chartsComponent.toggleFullscreen()">
              <i class="fas fa-expand"></i> Expand
            </button>
          </div>
        </div>
        <div class="chart-wrapper">
          <canvas id="${this.chartId}-canvas"></canvas>
        </div>
        <div class="chart-footer">
          <div class="chart-stats" id="${this.chartId}-stats"></div>
        </div>
      </div>
    `;
  }

  /**
   * Enhanced chart creation with utility integration
   */
  createChart() {
    const canvas = document.getElementById(`${this.chartId}-canvas`);
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    const chartConfig = {
      type: this.options.type,
      data: this.processData(this.options.data),
      options: this.getEnhancedChartOptions()
    };

    this.chart = new Chart(ctx, chartConfig);
    this.isVisible = true;

    // Update stats display
    this.updateStatsDisplay();
  }

  /**
   * Enhanced data processing with formatting utilities
   */
  processData(data) {
    const processedData = {
      labels: this.formatLabels(data.labels || []),
      datasets: []
    };

    if (data.datasets) {
      processedData.datasets = data.datasets.map((dataset, index) => ({
        label: dataset.label || `Dataset ${index + 1}`,
        data: this.formatDatasetValues(dataset.data || []),
        backgroundColor: dataset.backgroundColor || this.getEnhancedColor(index, 'background'),
        borderColor: dataset.borderColor || this.getEnhancedColor(index, 'border'),
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
   * Format labels using utility functions
   */
  formatLabels(labels) {
    return labels.map(label => {
      if (typeof label === 'string' && label.match(/^\d{4}-\d{2}-\d{2}/)) {
        return formatDate(label, 'MMM DD, YYYY');
      }
      return String(label);
    });
  }

  /**
   * Format dataset values based on options
   */
  formatDatasetValues(values) {
    if (!this.options.formatValues) return values;

    return values.map(value => {
      if (this.options.valueFormat === 'percentage') {
        return typeof value === 'number' ? value : parseFloat(value);
      }
      if (this.options.valueFormat === 'currency') {
        return typeof value === 'number' ? value : parseFloat(value);
      }
      return value;
    });
  }

  /**
   * Enhanced chart options with utility tooltips
   */
  getEnhancedChartOptions() {
    const baseOptions = {
      responsive: this.options.responsive,
      maintainAspectRatio: this.options.maintainAspectRatio,
      animation: this.options.animation,
      plugins: {
        legend: {
          position: 'top',
          labels: {
            usePointStyle: true,
            padding: 20,
            generateLabels: (chart) => this.generateEnhancedLabels(chart)
          }
        },
        tooltip: {
          enabled: this.options.showTooltips,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          titleColor: '#fff',
          bodyColor: '#fff',
          borderColor: '#666',
          borderWidth: 1,
          cornerRadius: 6,
          displayColors: true,
          callbacks: {
            label: (context) => this.formatTooltipLabel(context),
            title: (context) => this.formatTooltipTitle(context)
          }
        }
      },
      onClick: (event, elements) => this.handleChartClick(event, elements)
    };

    return this.mergeChartOptions(baseOptions);
  }

  /**
   * Format tooltip labels using utility functions
   */
  formatTooltipLabel(context) {
    const label = context.dataset.label || '';
    const value = context.parsed.y !== undefined ? context.parsed.y : context.parsed;

    if (this.options.valueFormat === 'percentage') {
      return `${label}: ${formatPercentage(value)}`;
    } else if (this.options.valueFormat === 'currency') {
      return `${label}: ${formatCurrency(value)}`;
    } else if (this.options.valueFormat === 'number') {
      return `${label}: ${formatNumber(value)}`;
    }

    return `${label}: ${value}`;
  }

  /**
   * Format tooltip title
   */
  formatTooltipTitle(context) {
    const label = context[0].label;
    if (this.options.type === 'pie' || this.options.type === 'doughnut') {
      return `Category: ${label}`;
    }
    return label;
  }

  /**
   * Enhanced color generation with utility functions
   */
  getEnhancedColor(index, type = 'background') {
    // Use provided colors or generate with utilities
    if (this.options.colorPalette && this.options.colorPalette[index]) {
      return this.options.colorPalette[index][type] || this.options.colorPalette[index];
    }

    // Use utility random colors as fallback
    const colors = [
      { background: 'rgba(54, 162, 235, 0.2)', border: 'rgb(54, 162, 235)' },
      { background: 'rgba(255, 99, 132, 0.2)', border: 'rgb(255, 99, 132)' },
      { background: 'rgba(255, 205, 86, 0.2)', border: 'rgb(255, 205, 86)' },
      { background: 'rgba(75, 192, 192, 0.2)', border: 'rgb(75, 192, 192)' },
      { background: randomColor('rgba').replace('rgb', 'rgba').replace(')', ', 0.2)'), border: randomColor('rgb') },
      { background: randomColor('rgba').replace('rgb', 'rgba').replace(')', ', 0.2)'), border: randomColor('rgb') }
    ];

    const color = colors[index % colors.length];
    return color[type];
  }

  /**
   * Update stats display with formatted values
   */
  updateStatsDisplay() {
    const statsContainer = document.getElementById(`${this.chartId}-stats`);
    if (!statsContainer || !this.chart) return;

    const stats = this.calculateStats();

    statsContainer.innerHTML = `
      <div class="stats-grid">
        ${stats.map(stat => `
          <div class="stat-item">
            <div class="stat-label">${stat.label}</div>
            <div class="stat-value ${stat.color ? `text-${stat.color}` : ''}">
              ${stat.formattedValue}
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  /**
   * Calculate chart statistics
   */
  calculateStats() {
    if (!this.chart || !this.chart.data.datasets.length) return [];

    const datasets = this.chart.data.datasets;
    const stats = [];

    datasets.forEach((dataset, index) => {
      const values = dataset.data.filter(val => typeof val === 'number');
      if (values.length > 0) {
        const sum = values.reduce((a, b) => a + b, 0);
        const avg = sum / values.length;
        const max = Math.max(...values);
        const min = Math.min(...values);

        stats.push(
            {
              label: `${dataset.label} Avg`,
              value: avg,
              formattedValue: this.formatValue(avg),
              color: 'primary'
            },
            {
              label: `${dataset.label} Max`,
              value: max,
              formattedValue: this.formatValue(max),
              color: 'success'
            }
        );
      }
    });

    return stats;
  }

  /**
   * Format value based on options
   */
  formatValue(value) {
    if (this.options.valueFormat === 'percentage') {
      return formatPercentage(value);
    } else if (this.options.valueFormat === 'currency') {
      return formatCurrency(value);
    } else if (this.options.valueFormat === 'number') {
      return formatNumber(value, 2);
    }
    return formatNumber(value);
  }

  /**
   * Enhanced update data with validation
   */
  updateData(newData) {
    if (!this.chart) {
      showToast('Chart not initialized', 'warning');
      return;
    }

    try {
      showLoading();
      this.options.data = { ...this.options.data, ...newData };
      this.chart.data = this.processData(this.options.data);
      this.chart.update('active');
      this.updateStatsDisplay();
      showToast('Chart data updated', 'success');
    } catch (error) {
      console.error('Failed to update chart data:', error);
      showToast('Failed to update chart data', 'error');
    } finally {
      hideLoading();
    }
  }

  /**
   * Setup event listeners with debounced resize
   */
  setupEventListeners() {
    if (this.options.autoResize) {
      this.resizeHandler = debounce(() => {
        this.resize();
      }, 250);

      window.addEventListener('resize', this.resizeHandler);
    }
  }

  /**
   * Toggle fullscreen mode
   */
  toggleFullscreen() {
    const chartContainer = document.getElementById(this.chartId);
    if (!chartContainer) return;

    if (!document.fullscreenElement) {
      chartContainer.requestFullscreen().catch(err => {
        showToast('Fullscreen not supported', 'warning');
      });
    } else {
      document.exitFullscreen();
    }
  }

  /**
   * Cleanup event listeners
   */
  destroy() {
    if (this.resizeHandler) {
      window.removeEventListener('resize', this.resizeHandler);
    }

    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
      this.isVisible = false;
    }

    if (this.container) {
      this.container.innerHTML = '';
    }

    showToast('Chart destroyed', 'info');
  }
}

// Enhanced ChartUtils with utility integration
export class ChartUtils {
  /**
   * Create performance chart with formatted data
   */
  static createPerformanceChart(containerId, performanceData) {
    const data = {
      labels: performanceData.labels,
      datasets: [{
        label: 'Performance',
        data: performanceData.values,
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgb(54, 162, 235)',
        borderWidth: 2,
        tension: 0.4,
        fill: true
      }]
    };

    return new ChartsComponent(containerId, {
      type: 'line',
      data: data,
      title: 'Performance Trend',
      valueFormat: 'percentage',
      formatValues: true
    });
  }

  /**
   * Create grade distribution chart
   */
  static createGradeDistributionChart(containerId, gradeData) {
    const data = {
      labels: gradeData.ranges,
      datasets: [{
        label: 'Number of Students',
        data: gradeData.counts,
        backgroundColor: gradeData.ranges.map((_, index) =>
            randomColor('rgba').replace('rgb', 'rgba').replace(')', ', 0.7)')
        ),
        borderColor: gradeData.ranges.map(() => randomColor('rgb')),
        borderWidth: 2
      }]
    };

    return new ChartsComponent(containerId, {
      type: 'bar',
      data: data,
      title: 'Grade Distribution',
      valueFormat: 'number'
    });
  }
}

// Export with utility integration
window.ChartsComponent = ChartsComponent;
window.ChartUtils = ChartUtils;