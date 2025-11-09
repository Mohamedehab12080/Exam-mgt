// Formatting Utility Functions

/**
 * Format date to readable string
 * @param {string|Date} date - Date to format
 * @param {string} format - Format pattern
 * @returns {string} Formatted date
 */
export function formatDate(date, format = 'MM/DD/YYYY') {
  if (!date) return '';
  
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');
  
  const formatMap = {
    'MM/DD/YYYY': `${month}/${day}/${year}`,
    'DD/MM/YYYY': `${day}/${month}/${year}`,
    'YYYY-MM-DD': `${year}-${month}-${day}`,
    'MMM DD, YYYY': d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    'MMMM DD, YYYY': d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
    'MM/DD/YYYY HH:mm': `${month}/${day}/${year} ${hours}:${minutes}`,
    'MM/DD/YYYY HH:mm:ss': `${month}/${day}/${year} ${hours}:${minutes}:${seconds}`,
    'HH:mm': `${hours}:${minutes}`,
    'HH:mm:ss': `${hours}:${minutes}:${seconds}`
  };
  
  return formatMap[format] || formatMap['MM/DD/YYYY'];
}

/**
 * Format time duration
 * @param {number} seconds - Duration in seconds
 * @param {string} format - Format type
 * @returns {string} Formatted duration
 */
export function formatDuration(seconds, format = 'auto') {
  if (!seconds && seconds !== 0) return '';
  
  const totalSeconds = Math.floor(seconds);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;
  
  if (format === 'auto') {
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  }
  
  if (format === 'hh:mm:ss') {
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
  
  if (format === 'mm:ss') {
    return `${String(hours * 60 + minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
  
  return `${totalSeconds}s`;
}

/**
 * Format relative time (e.g., "2 hours ago")
 * @param {string|Date} date - Date to format
 * @returns {string} Relative time string
 */
export function formatTimeAgo(date) {
  if (!date) return 'Unknown time';

  const d = new Date(date);
  if (isNaN(d.getTime())) return 'Invalid date';

  const now = new Date();
  const diffInSeconds = Math.floor((now - d) / 1000);

  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  }
  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  }
  if (diffInSeconds < 2592000) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }
  if (diffInSeconds < 31536000) {
    const months = Math.floor(diffInSeconds / 2592000);
    return `${months} month${months > 1 ? 's' : ''} ago`;
  }

  const years = Math.floor(diffInSeconds / 31536000);
  return `${years} year${years > 1 ? 's' : ''} ago`;
}

/**
 * Format SSN (14 digits)
 * @param {string} ssn - SSN to format
 * @returns {string} Formatted SSN
 */
export function formatSSN(ssn) {
  if (!ssn) return '';

  const cleaned = ssn.replace(/\D/g, '');
  if (cleaned.length !== 14) return ssn;

  return `${cleaned.substr(0, 3)} ${cleaned.substr(3, 3)} ${cleaned.substr(6, 4)} ${cleaned.substr(10, 4)}`;
}

/**
 * Format grade with status
 * @param {number} grade - Grade value
 * @param {number} passingGrade - Passing grade threshold
 * @returns {string} Formatted grade with status
 */
export function formatGradeWithStatus(grade, passingGrade = 60) {
  if (grade === null || grade === undefined) return 'N/A';

  const status = grade >= passingGrade ? 'Passed' : 'Failed';
  const color = grade >= passingGrade ? 'success' : 'danger';

  return `<span class="text-${color}">${grade}% (${status})</span>`;
}

/**
 * Format number with commas
 * @param {number} number - Number to format
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted number
 */
export function formatNumber(number, decimals = 0) {
  if (number === null || number === undefined || isNaN(number)) return '';
  
  return Number(number).toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
}

/**
 * Format currency
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code
 * @returns {string} Formatted currency
 */
export function formatCurrency(amount, currency = 'USD') {
  if (amount === null || amount === undefined || isNaN(amount)) return '';
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(amount);
}

/**
 * Format percentage
 * @param {number} value - Value to format
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted percentage
 */
export function formatPercentage(value, decimals = 1) {
  if (value === null || value === undefined || isNaN(value)) return '';
  
  return Number(value).toFixed(decimals) + '%';
}

/**
 * Format file size
 * @param {number} bytes - Size in bytes
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted file size
 */
export function formatFileSize(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
}

/**
 * Format phone number
 * @param {string} phone - Phone number to format
 * @param {string} format - Format type
 * @returns {string} Formatted phone number
 */
export function formatPhoneNumber(phone, format = 'US') {
  if (!phone) return '';
  
  const cleaned = phone.replace(/\D/g, '');
  
  if (format === 'US') {
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
      return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
    }
  }
  
  return phone;
}

/**
 * Format email address
 * @param {string} email - Email to format
 * @param {number} maxLength - Maximum length before truncation
 * @returns {string} Formatted email
 */
export function formatEmail(email, maxLength = 30) {
  if (!email) return '';
  
  if (email.length > maxLength) {
    const [local, domain] = email.split('@');
    if (local.length > maxLength - 10) {
      return local.substring(0, maxLength - 13) + '...' + '@' + domain;
    }
    return email;
  }
  
  return email;
}

/**
 * Format name (capitalize words)
 * @param {string} name - Name to format
 * @returns {string} Formatted name
 */
export function formatName(name) {
  if (!name) return '';
  
  return name
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Format address
 * @param {Object} address - Address object
 * @param {string} format - Format type
 * @returns {string} Formatted address
 */
export function formatAddress(address, format = 'single') {
  if (!address) return '';
  
  const { street, city, state, zipCode, country } = address;
  
  if (format === 'single') {
    const parts = [street, city, state, zipCode, country].filter(Boolean);
    return parts.join(', ');
  }
  
  if (format === 'multi') {
    return [
      street,
      `${city}, ${state} ${zipCode}`,
      country
    ].filter(Boolean).join('\n');
  }
  
  return '';
}

/**
 * Format boolean value
 * @param {boolean} value - Boolean value
 * @param {Object} options - Format options
 * @returns {string} Formatted boolean
 */
export function formatBoolean(value, options = {}) {
  if (value === null || value === undefined) return '';
  
  const { trueText = 'Yes', falseText = 'No', icon = false } = options;
  
  if (icon) {
    return value ? '<i class="fas fa-check text-success"></i>' : '<i class="fas fa-times text-danger"></i>';
  }
  
  return value ? trueText : falseText;
}

/**
 * Format status badge
 * @param {string} status - Status value
 * @param {Object} options - Format options
 * @returns {string} Formatted status badge
 */
export function formatStatusBadge(status, options = {}) {
  if (!status) return '';
  
  const { capitalize = true, showIcon = true } = options;
  
  const statusColors = {
    active: 'success',
    inactive: 'secondary',
    pending: 'warning',
    approved: 'success',
    rejected: 'danger',
    draft: 'info',
    published: 'success',
    archived: 'secondary',
    completed: 'success',
    failed: 'danger',
    passed: 'success',
    started: 'primary',
    submitted: 'info',
    graded: 'success'
  };
  
  const statusIcons = {
    active: 'fa-check-circle',
    inactive: 'fa-times-circle',
    pending: 'fa-clock',
    approved: 'fa-check-circle',
    rejected: 'fa-times-circle',
    draft: 'fa-edit',
    published: 'fa-globe',
    archived: 'fa-archive',
    completed: 'fa-check-circle',
    failed: 'fa-times-circle',
    passed: 'fa-check-circle',
    started: 'fa-play-circle',
    submitted: 'fa-paper-plane',
    graded: 'fa-check-circle'
  };
  
  const color = statusColors[status.toLowerCase()] || 'secondary';
  const displayText = capitalize ? formatName(status) : status;
  const icon = showIcon ? `<i class="fas ${statusIcons[status.toLowerCase()] || 'fa-circle'}"></i>` : '';
  
  return `<span class="badge badge-${color}">${icon} ${displayText}</span>`;
}

/**
 * Format score badge
 * @param {number} score - Score value
 * @param {number} maxScore - Maximum score
 * @param {Object} options - Format options
 * @returns {string} Formatted score badge
 */
export function formatScoreBadge(score, maxScore = 100, options = {}) {
  if (score === null || score === undefined) return '';
  
  const percentage = (score / maxScore) * 100;
  let color = 'danger';
  
  if (percentage >= 80) color = 'success';
  else if (percentage >= 60) color = 'warning';
  else if (percentage >= 40) color = 'info';
  
  return `<span class="badge badge-${color}">${score}/${maxScore} (${Math.round(percentage)}%)</span>`;
}

/**
 * Format difficulty badge
 * @param {string} difficulty - Difficulty level
 * @param {Object} options - Format options
 * @returns {string} Formatted difficulty badge
 */
export function formatDifficultyBadge(difficulty, options = {}) {
  if (!difficulty) return '';
  
  const difficultyColors = {
    easy: 'success',
    medium: 'warning',
    hard: 'danger'
  };
  
  const difficultyIcons = {
    easy: 'fa-smile',
    medium: 'fa-meh',
    hard: 'fa-frown'
  };
  
  const color = difficultyColors[difficulty.toLowerCase()] || 'secondary';
  const icon = difficultyIcons[difficulty.toLowerCase()] || 'fa-circle';
  
  return `<span class="badge badge-${color}"><i class="fas ${icon}"></i> ${formatName(difficulty)}</span>`;
}

/**
 * Format question type badge
 * @param {string} type - Question type
 * @param {Object} options - Format options
 * @returns {string} Formatted question type badge
 */
export function formatQuestionTypeBadge(type, options = {}) {
  if (!type) return '';
  
  const typeIcons = {
    multiple_choice: 'fa-list-ul',
    true_false: 'fa-check-square',
    short_answer: 'fa-edit',
    essay: 'fa-file-alt',
    fill_blank: 'fa-fill-drip',
    matching: 'fa-random'
  };
  
  const icon = typeIcons[type.toLowerCase().replace(/\s+/g, '_')] || 'fa-question';
  
  return `<span class="badge badge-info"><i class="fas ${icon}"></i> ${formatName(type.replace(/_/g, ' '))}</span>`;
}

/**
 * Truncate text
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @param {string} suffix - Suffix to add
 * @returns {string} Truncated text
 */
export function truncateText(text, maxLength = 50, suffix = '...') {
  if (!text) return '';
  
  if (text.length <= maxLength) return text;
  
  return text.substring(0, maxLength - suffix.length) + suffix;
}

/**
 * Capitalize first letter
 * @param {string} text - Text to capitalize
 * @returns {string} Capitalized text
 */
export function capitalizeFirst(text) {
  if (!text) return '';
  
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

/**
 * Format list items
 * @param {Array} items - Items to format
 * @param {string} separator - Separator
 * @returns {string} Formatted list
 */
export function formatList(items, separator = ', ') {
  if (!Array.isArray(items)) return '';
  
  return items.filter(item => item != null && item !== '').join(separator);
}

/**
 * Format range
 * @param {number} start - Start value
 * @param {number} end - End value
 * @param {string} unit - Unit
 * @returns {string} Formatted range
 */
export function formatRange(start, end, unit = '') {
  if (start === null || start === undefined || end === null || end === undefined) return '';
  
  const startStr = unit ? `${start} ${unit}` : String(start);
  const endStr = unit ? `${end} ${unit}` : String(end);
  
  return `${startStr} - ${endStr}`;
}