// Utility Functions for LeetCode GitHub Sync
// Helper functions for common operations

class Utils {
  // Debounce function to limit function calls
  static debounce(func, wait) {
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

  // Throttle function to limit function calls to once per period
  static throttle(func, limit) {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  // Safe JSON parse with fallback
  static safeJSONParse(str, fallback = null) {
    try {
      return JSON.parse(str);
    } catch (error) {
      console.warn('JSON parse error:', error);
      return fallback;
    }
  }

  // Safe JSON stringify with error handling
  static safeJSONStringify(obj, fallback = '{}') {
    try {
      return JSON.stringify(obj, null, 2);
    } catch (error) {
      console.warn('JSON stringify error:', error);
      return fallback;
    }
  }

  // Generate unique ID
  static generateId(prefix = 'id') {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Format file size in human readable format
  static formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Sanitize filename for cross-platform compatibility
  static sanitizeFilename(name) {
    return name
      .replace(/[<>:"/\\|?*]/g, '_')
      .replace(/\s+/g, '-')
      .toLowerCase()
      .substring(0, 100);
  }

  // Extract language from file extension
  static getLanguageFromExtension(filename) {
    const ext = filename.split('.').pop().toLowerCase();
    const languageMap = {
      'py': 'python',
      'js': 'javascript',
      'ts': 'typescript',
      'java': 'java',
      'cpp': 'cpp',
      'c': 'c',
      'cs': 'c#',
      'go': 'go',
      'rs': 'rust',
      'sql': 'sql',
      'rb': 'ruby',
      'php': 'php',
      'swift': 'swift',
      'kt': 'kotlin',
      'scala': 'scala',
      'r': 'r',
      'dart': 'dart',
      'lua': 'lua',
      'perl': 'perl',
      'sh': 'bash',
      'html': 'html',
      'css': 'css',
      'xml': 'xml',
      'json': 'json'
    };
    return languageMap[ext] || 'text';
  }

  // Validate GitHub repository name
  static isValidRepoName(name) {
    const repoRegex = /^[a-zA-Z0-9._-]+$/;
    return repoRegex.test(name) && name.length >= 1 && name.length <= 100;
  }

  // Validate GitHub username
  static isValidUsername(username) {
    const usernameRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,38}[a-zA-Z0-9])?$/;
    return usernameRegex.test(username);
  }

  // Validate GitHub token format
  static isValidToken(token) {
    const tokenRegex = /^(ghp_|gho_|ghu_|ghs_|ghr_)[a-zA-Z0-9]{36}$/;
    return tokenRegex.test(token) || token.length >= 20;
  }

  // Format date for display
  static formatDate(date, format = 'ISO') {
    const d = new Date(date);
    
    switch (format) {
      case 'ISO':
        return d.toISOString();
      case 'local':
        return d.toLocaleString();
      case 'time':
        return d.toLocaleTimeString();
      case 'date':
        return d.toLocaleDateString();
      case 'relative':
        return this.getRelativeTime(d);
      default:
        return d.toLocaleString();
    }
  }

  // Get relative time string
  static getRelativeTime(date) {
    const now = new Date();
    const diff = now - date;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return 'Just now';
  }

  // Copy text to clipboard
  static async copyToClipboard(text) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        const result = document.execCommand('copy');
        textArea.remove();
        return result;
      }
    } catch (error) {
      console.error('Copy to clipboard failed:', error);
      return false;
    }
  }

  // Sleep function for async delays
  static sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Retry function with exponential backoff
  static async retry(fn, maxAttempts = 3, delay = 1000) {
    let lastError;
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        console.warn(`Attempt ${attempt} failed:`, error.message);
        
        if (attempt < maxAttempts) {
          await this.sleep(delay * attempt); // Exponential backoff
        }
      }
    }
    
    throw lastError;
  }

  // Extract error message from various error types
  static extractErrorMessage(error) {
    if (typeof error === 'string') return error;
    if (error?.message) return error.message;
    if (error?.error) return error.error;
    if (error?.statusText) return error.statusText;
    return 'Unknown error occurred';
  }

  // Check if running in development mode
  static isDevelopment() {
    return !('update_url' in chrome.runtime.getManifest());
  }

  // Get extension version
  static getVersion() {
    return chrome.runtime.getManifest().version;
  }

  // Create a safe HTML element
  static createElement(tag, attributes = {}, textContent = '') {
    const element = document.createElement(tag);
    
    Object.entries(attributes).forEach(([key, value]) => {
      if (key === 'className') {
        element.className = value;
      } else if (key === 'innerHTML') {
        element.innerHTML = value;
      } else if (key.startsWith('data-')) {
        element.setAttribute(key, value);
      } else {
        element[key] = value;
      }
    });
    
    if (textContent) {
      element.textContent = textContent;
    }
    
    return element;
  }

  // Wait for element to appear in DOM
  static waitForElement(selector, timeout = 10000) {
    return new Promise((resolve, reject) => {
      const element = document.querySelector(selector);
      if (element) {
        resolve(element);
        return;
      }

      const observer = new MutationObserver((mutations, obs) => {
        const element = document.querySelector(selector);
        if (element) {
          obs.disconnect();
          resolve(element);
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true
      });

      setTimeout(() => {
        observer.disconnect();
        reject(new Error(`Element ${selector} not found within ${timeout}ms`));
      }, timeout);
    });
  }

  // Check if element is visible in viewport
  static isElementVisible(element) {
    if (!element) return false;
    
    const rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  }

  // Generate color from string (for consistent avatars, etc.)
  static stringToColor(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    const hue = hash % 360;
    return `hsl(${hue}, 70%, 50%)`;
  }

  // Format code for display with syntax highlighting hint
  static formatCode(code, language) {
    // Basic code formatting - in a real implementation, you might use a library like Prism.js
    const lines = code.split('\n');
    const maxLength = Math.max(...lines.map(line => line.length));
    
    return {
      lines,
      maxLength,
      lineNumbers: lines.map((_, i) => i + 1),
      language: language || 'text'
    };
  }

  // Validate LeetCode problem URL
  static isValidLeetCodeURL(url) {
    const leetcodeRegex = /^https:\/\/leetcode\.com\/problems\/[^\/]+(\/.*)?$/;
    return leetcodeRegex.test(url);
  }

  // Extract problem slug from LeetCode URL
  static extractProblemSlug(url) {
    const match = url.match(/\/problems\/([^\/]+)/);
    return match ? match[1] : null;
  }

  // Create a simple event emitter
  static createEventEmitter() {
    const events = {};
    
    return {
      on(event, callback) {
        if (!events[event]) {
          events[event] = [];
        }
        events[event].push(callback);
      },
      
      off(event, callback) {
        if (events[event]) {
          events[event] = events[event].filter(cb => cb !== callback);
        }
      },
      
      emit(event, ...args) {
        if (events[event]) {
          events[event].forEach(callback => callback(...args));
        }
      }
    };
  }

  // Local storage wrapper with error handling
  static storage = {
    async get(key, defaultValue = null) {
      try {
        const result = await chrome.storage.local.get(key);
        return result[key] !== undefined ? result[key] : defaultValue;
      } catch (error) {
        console.error('Storage get error:', error);
        return defaultValue;
      }
    },

    async set(key, value) {
      try {
        await chrome.storage.local.set({ [key]: value });
        return true;
      } catch (error) {
        console.error('Storage set error:', error);
        return false;
      }
    },

    async remove(key) {
      try {
        await chrome.storage.local.remove(key);
        return true;
      } catch (error) {
        console.error('Storage remove error:', error);
        return false;
      }
    },

    async clear() {
      try {
        await chrome.storage.local.clear();
        return true;
      } catch (error) {
        console.error('Storage clear error:', error);
        return false;
      }
    }
  };
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Utils;
}
