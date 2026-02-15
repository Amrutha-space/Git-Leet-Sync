// Content Script for LeetCode GitHub Sync
// Monitors LeetCode pages for accepted submissions and triggers sync

class LeetCodeMonitor {
  constructor() {
    this.isMonitoring = false;
    this.lastSubmissionId = null;
    this.syncButton = null;
    this.notificationContainer = null;
    this.debounceTimer = null;
    
    this.init();
  }

  async init() {
    console.log('LeetCode GitHub Sync: Content script initialized');
    
    // Wait for page to fully load
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setup());
    } else {
      this.setup();
    }
  }

  setup() {
    this.createSyncButton();
    this.createNotificationContainer();
    this.startMonitoring();
    this.setupMutationObserver();
  }

  // Create floating sync button
  createSyncButton() {
    if (this.syncButton) return;

    this.syncButton = document.createElement('div');
    this.syncButton.id = 'leetcode-sync-button';
    this.syncButton.innerHTML = '⚡';
    this.syncButton.title = 'Sync to GitHub';
    
    // Add click handler
    this.syncButton.addEventListener('click', () => this.handleManualSync());
    
    // Style will be applied via CSS
    document.body.appendChild(this.syncButton);
  }

  // Create notification container
  createNotificationContainer() {
    if (this.notificationContainer) return;

    this.notificationContainer = document.createElement('div');
    this.notificationContainer.id = 'leetcode-sync-notifications';
    document.body.appendChild(this.notificationContainer);
  }

  // Start monitoring for submission changes
  startMonitoring() {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    console.log('LeetCode GitHub Sync: Started monitoring');
    
    // Check for existing accepted submissions
    this.checkCurrentSubmission();
    
    // Set up periodic checking
    setInterval(() => {
      this.checkCurrentSubmission();
    }, 2000);
  }

  // Setup MutationObserver for dynamic UI changes
  setupMutationObserver() {
    const observer = new MutationObserver((mutations) => {
      let shouldCheck = false;
      
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          // Look for submission result changes
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              if (node.matches('[data-e2e-locator="submission-result"]') ||
                  node.querySelector('[data-e2e-locator="submission-result"]') ||
                  node.classList?.contains('success') ||
                  node.textContent?.includes('Accepted')) {
                shouldCheck = true;
              }
            }
          });
        }
      });

      if (shouldCheck) {
        this.debounceCheck();
      }
    });

    // Observe the main content area
    const contentArea = document.querySelector('[data-theme="dark"]') || 
                       document.querySelector('.main-content') || 
                       document.body;
    
    if (contentArea) {
      observer.observe(contentArea, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['class', 'data-e2e-locator']
      });
    }
  }

  // Debounce submission checks
  debounceCheck() {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
    
    this.debounceTimer = setTimeout(() => {
      this.checkCurrentSubmission();
    }, 500);
  }

  // Check current submission status
  async checkCurrentSubmission() {
    try {
      const submissionData = this.extractSubmissionData();
      
      if (!submissionData) {
        return;
      }

      // Check if submission is accepted
      if (!submissionData.isAccepted) {
        return;
      }

      // Prevent duplicate syncs
      const submissionId = this.generateSubmissionId(submissionData);
      if (submissionId === this.lastSubmissionId) {
        return;
      }

      this.lastSubmissionId = submissionId;
      
      // Show success notification and trigger sync
      this.showNotification('Solution Accepted! Syncing to GitHub...', 'success');
      
      // Trigger sync after a short delay
      setTimeout(() => {
        this.syncToGitHub(submissionData);
      }, 1000);

    } catch (error) {
      console.error('Error checking submission:', error);
    }
  }

  // Extract submission data from page
  extractSubmissionData() {
    try {
      // Multiple fallback strategies for finding submission status
      const statusSelectors = [
        '[data-e2e-locator="submission-result"]',
        '.success',
        '[data-status="accepted"]',
        '.submission-result',
        '.e2e-locator-submission-result'
      ];

      let statusElement = null;
      let isAccepted = false;

      for (const selector of statusSelectors) {
        statusElement = document.querySelector(selector);
        if (statusElement) {
          const text = statusElement.textContent?.toLowerCase() || '';
          const className = statusElement.className?.toLowerCase() || '';
          
          if (text.includes('accepted') || 
              className.includes('success') || 
              className.includes('accepted')) {
            isAccepted = true;
            break;
          }
        }
      }

      if (!isAccepted) {
        return null;
      }

      // Extract problem information
      const problemTitle = this.extractProblemTitle();
      const difficulty = this.extractDifficulty();
      const slug = this.extractProblemSlug();
      const language = this.extractLanguage();
      const code = this.extractCode();

      if (!problemTitle || !language || !code) {
        console.warn('Missing required submission data');
        return null;
      }

      return {
        problemTitle,
        difficulty,
        slug,
        language,
        code,
        url: window.location.href,
        timestamp: Date.now(),
        isAccepted: true
      };

    } catch (error) {
      console.error('Error extracting submission data:', error);
      return null;
    }
  }

  // Extract problem title with fallbacks
  extractProblemTitle() {
    const selectors = [
      '[data-e2e-locator="question-title"]',
      '.question-title',
      'h1',
      '.css-v3d350',
      '[data-cy="question-title"]'
    ];

    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element && element.textContent.trim()) {
        return element.textContent.trim();
      }
    }

    // Fallback to page title
    const pageTitle = document.title;
    if (pageTitle && pageTitle.includes('LeetCode')) {
      return pageTitle.replace(' - LeetCode', '').trim();
    }

    return null;
  }

  // Extract difficulty with fallbacks
  extractDifficulty() {
    const selectors = [
      '[data-e2e-locator="question-difficulty"]',
      '.difficulty',
      '.css-t42afm',
      '[data-difficulty]'
    ];

    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element) {
        const text = element.textContent?.toLowerCase() || '';
        if (text.includes('easy')) return 'Easy';
        if (text.includes('medium')) return 'Medium';
        if (text.includes('hard')) return 'Hard';
      }
    }

    // Try to extract from URL or page content
    const pageText = document.body.textContent.toLowerCase();
    if (pageText.includes('difficulty: easy')) return 'Easy';
    if (pageText.includes('difficulty: medium')) return 'Medium';
    if (pageText.includes('difficulty: hard')) return 'Hard';

    return 'Medium'; // Default fallback
  }

  // Extract problem slug from URL
  extractProblemSlug() {
    const urlMatch = window.location.pathname.match(/\/problems\/([^\/]+)/);
    return urlMatch ? urlMatch[1] : 'unknown-problem';
  }

  // Extract programming language with fallbacks
  extractLanguage() {
    const selectors = [
      '[data-e2e-locator="editor-language"]',
      '.editor-language',
      '.language-selector',
      '.cm-editor'
    ];

    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element) {
        const text = element.textContent?.toLowerCase() || '';
        const languages = ['python', 'javascript', 'java', 'cpp', 'c++', 'c', 'c#', 'go', 'rust', 'typescript', 'sql'];
        
        for (const lang of languages) {
          if (text.includes(lang)) {
            return lang === 'c++' ? 'cpp' : lang;
          }
        }
      }
    }

    // Try to detect from code content
    const code = this.extractCode();
    if (code) {
      if (code.includes('def ') && code.includes(':')) return 'python';
      if (code.includes('function ') || code.includes('const ')) return 'javascript';
      if (code.includes('public class')) return 'java';
      if (code.includes('#include')) return 'cpp';
    }

    return 'python'; // Default fallback
  }

  // Extract code from Monaco editor with multiple fallbacks
  extractCode() {
    try {
      // Strategy 1: Monaco Editor direct access
      const monacoEditors = document.querySelectorAll('.monaco-editor');
      for (const editor of monacoEditors) {
        const model = editor.querySelector('.view-lines');
        if (model) {
          const lines = model.querySelectorAll('.view-line');
          if (lines.length > 0) {
            const code = Array.from(lines)
              .map(line => line.textContent)
              .join('\n')
              .trim();
            
            if (code && code.length > 10) {
              return code;
            }
          }
        }
      }

      // Strategy 2: Try to get from textarea
      const textareas = document.querySelectorAll('textarea');
      for (const textarea of textareas) {
        if (textarea.value && textarea.value.length > 10) {
          return textarea.value.trim();
        }
      }

      // Strategy 3: Look for code in pre elements
      const preElements = document.querySelectorAll('pre');
      for (const pre of preElements) {
        const code = pre.textContent?.trim();
        if (code && code.length > 10) {
          return code;
        }
      }

      // Strategy 4: Try to access Monaco Editor model directly
      if (window.monaco) {
        const editor = window.monaco.editor.getModels()[0];
        if (editor && editor.getValue()) {
          return editor.getValue().trim();
        }
      }

      console.warn('Could not extract code from editor');
      return null;

    } catch (error) {
      console.error('Error extracting code:', error);
      return null;
    }
  }

  // Generate unique submission ID
  generateSubmissionId(submissionData) {
    return `${submissionData.slug}-${submissionData.language}`;
  }

  // Handle manual sync button click
  async handleManualSync() {
    try {
      const submissionData = this.extractSubmissionData();
      
      if (!submissionData) {
        this.showNotification('No accepted solution found to sync', 'warning');
        return;
      }

      this.showNotification('Manually syncing to GitHub...', 'success');
      await this.syncToGitHub(submissionData);

    } catch (error) {
      console.error('Manual sync error:', error);
      this.showNotification('Sync failed: ' + error.message, 'error');
    }
  }

  // Sync solution to GitHub via background script
  async syncToGitHub(submissionData) {
  try {

    // ✅ CRITICAL SAFETY CHECK (Prevents undefined crash)
    if (typeof chrome === "undefined" || !chrome.runtime?.sendMessage) {
      console.error("Chrome runtime not available");
      this.showNotification('Extension context not ready', 'error');
      return;
    }

    const response = await chrome.runtime.sendMessage({
      action: 'syncSolution',
      data: submissionData
    });

    if (response?.success) {
      this.showNotification('Successfully synced to GitHub!', 'success');

      if (this.syncButton) {
        this.syncButton.classList.add('sync-success');
        setTimeout(() => this.syncButton.classList.remove('sync-success'), 2000);
      }

    } else {
      throw new Error(response?.error || 'Unknown sync error');
    }

  } catch (error) {
    console.error('GitHub sync error:', error);
    this.showNotification('Sync failed: ' + error.message, 'error');
  }
}

  // Show custom notification
  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `leetcode-notification leetcode-notification-${type}`;
    notification.textContent = message;

    this.notificationContainer.appendChild(notification);

    // Trigger animation
    setTimeout(() => {
      notification.classList.add('show');
    }, 10);

    // Auto remove after 4 seconds
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 4000);
  }
}

// Initialize the monitor when the script loads
const leetcodeMonitor = new LeetCodeMonitor();
