// Popup Script for LeetCode GitHub Sync
// Handles settings management and user interactions

class PopupManager {
  constructor() {
    this.elements = {};
    this.settings = {};
    this.isLoading = false;
    
    this.init();
  }

  async init() {
    this.cacheElements();
    this.attachEventListeners();
    await this.loadSettings();
    this.updateUI();
  }

  // Cache DOM elements
  cacheElements() {
    this.elements = {
      githubToken: document.getElementById('githubToken'),
      username: document.getElementById('username'),
      repository: document.getElementById('repository'),
      folderStructure: document.getElementById('folderStructure'),
      autoSync: document.getElementById('autoSync'),
      validateToken: document.getElementById('validateToken'),
      saveSettings: document.getElementById('saveSettings'),
      messageContainer: document.getElementById('messageContainer'),
      statusIndicator: document.getElementById('statusIndicator')
    };
  }

  // Attach event listeners
  attachEventListeners() {
    // Input validation on change
    this.elements.githubToken.addEventListener('input', () => this.validateTokenInput());
    this.elements.username.addEventListener('input', () => this.validateUsernameInput());
    this.elements.repository.addEventListener('input', () => this.validateRepositoryInput());

    // Button actions
    this.elements.validateToken.addEventListener('click', () => this.handleValidateToken());
    this.elements.saveSettings.addEventListener('click', () => this.handleSaveSettings());

    // Enter key support
    document.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !this.isLoading) {
        this.handleSaveSettings();
      }
    });

    // Settings change detection
    Object.values(this.elements).forEach(element => {
      if (element && (element.tagName === 'INPUT' || element.tagName === 'SELECT')) {
        element.addEventListener('change', () => this.markAsChanged());
      }
    });
  }

  // Load settings from storage
  async loadSettings() {
    try {
      const response = await chrome.runtime.sendMessage({ action: 'getSettings' });
      
      if (response.success) {
        this.settings = response.settings || this.getDefaultSettings();
        this.populateForm();
      } else {
        throw new Error(response.error || 'Failed to load settings');
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      this.showMessage('Failed to load settings', 'error');
      this.settings = this.getDefaultSettings();
      this.populateForm();
    }
  }

  // Get default settings
  getDefaultSettings() {
    return {
      githubToken: '',
      username: '',
      repository: '',
      folderStructure: 'difficulty',
      autoSync: true
    };
  }

  // Populate form with settings
  populateForm() {
    this.elements.githubToken.value = this.settings.githubToken || '';
    this.elements.username.value = this.settings.username || '';
    this.elements.repository.value = this.settings.repository || '';
    this.elements.folderStructure.value = this.settings.folderStructure || 'difficulty';
    this.elements.autoSync.checked = this.settings.autoSync !== false;
  }

  // Validate token input format
  validateTokenInput() {
    const token = this.elements.githubToken.value.trim();
    const isValid = token.length >= 20 && (token.startsWith('ghp_') || token.startsWith('gho_') || token.startsWith('ghu_') || token.startsWith('ghs_') || token.startsWith('ghr_'));
    
    this.elements.githubToken.classList.toggle('invalid', token && !isValid);
    return isValid;
  }

  // Validate username input
  validateUsernameInput() {
    const username = this.elements.username.value.trim();
    const isValid = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,38}[a-zA-Z0-9])?$/.test(username);
    
    this.elements.username.classList.toggle('invalid', username && !isValid);
    return isValid;
  }

  // Validate repository input
  validateRepositoryInput() {
    const repository = this.elements.repository.value.trim();
    const isValid = /^[a-zA-Z0-9._-]+$/.test(repository);
    
    this.elements.repository.classList.toggle('invalid', repository && !isValid);
    return isValid;
  }

  // Handle token validation
  async handleValidateToken() {
    const token = this.elements.githubToken.value.trim();
    
    if (!token) {
      this.showMessage('Please enter a GitHub token', 'warning');
      return;
    }

    if (!this.validateTokenInput()) {
      this.showMessage('Invalid token format', 'error');
      return;
    }

    this.setLoading(true, 'Validating token...');
    
    try {
      const response = await chrome.runtime.sendMessage({
        action: 'validateToken',
        token: token
      });

      if (response.valid) {
        this.showMessage('Token is valid!', 'success');
        
        // Auto-fill username if not set
        if (!this.elements.username.value && response.username) {
          this.elements.username.value = response.username;
          this.markAsChanged();
        }
      } else {
        this.showMessage(`Token validation failed: ${response.error}`, 'error');
      }
    } catch (error) {
      console.error('Token validation error:', error);
      this.showMessage('Token validation failed', 'error');
    } finally {
      this.setLoading(false);
    }
  }

  // Handle save settings
  async handleSaveSettings() {
    if (this.isLoading) return;

    // Validate all inputs
    const token = this.elements.githubToken.value.trim();
    const username = this.elements.username.value.trim();
    const repository = this.elements.repository.value.trim();

    if (!token) {
      this.showMessage('GitHub token is required', 'error');
      this.elements.githubToken.focus();
      return;
    }

    if (!username) {
      this.showMessage('GitHub username is required', 'error');
      this.elements.username.focus();
      return;
    }

    if (!repository) {
      this.showMessage('Repository name is required', 'error');
      this.elements.repository.focus();
      return;
    }

    if (!this.validateTokenInput()) {
      this.showMessage('Invalid token format', 'error');
      return;
    }

    if (!this.validateUsernameInput()) {
      this.showMessage('Invalid username format', 'error');
      return;
    }

    if (!this.validateRepositoryInput()) {
      this.showMessage('Invalid repository name format', 'error');
      return;
    }

    this.setLoading(true, 'Saving settings...');

    try {
      const newSettings = {
        githubToken: token,
        username: username,
        repository: repository,
        folderStructure: this.elements.folderStructure.value,
        autoSync: this.elements.autoSync.checked
      };

      const response = await chrome.runtime.sendMessage({
        action: 'saveSettings',
        settings: newSettings
      });

      if (response.success) {
        this.settings = newSettings;
        this.showMessage('Settings saved successfully!', 'success');
        this.updateStatusIndicator();
        this.clearChangedState();
      } else {
        throw new Error(response.error || 'Failed to save settings');
      }
    } catch (error) {
      console.error('Save settings error:', error);
      this.showMessage('Failed to save settings: ' + error.message, 'error');
    } finally {
      this.setLoading(false);
    }
  }

  // Update UI based on current settings
  updateUI() {
    this.updateStatusIndicator();
  }

  // Update status indicator
  updateStatusIndicator() {
    const isConfigured = this.settings.githubToken && 
                        this.settings.username && 
                        this.settings.repository;

    const statusDot = this.elements.statusIndicator.querySelector('.status-dot');
    const statusText = this.elements.statusIndicator.querySelector('.status-text');

    if (isConfigured) {
      statusDot.classList.add('configured');
      statusText.textContent = 'Configured';
    } else {
      statusDot.classList.remove('configured');
      statusText.textContent = 'Not configured';
    }
  }

  // Show message to user
  showMessage(text, type = 'info') {
    const message = document.createElement('div');
    message.className = `message message-${type}`;
    message.textContent = text;

    // Clear existing messages
    this.elements.messageContainer.innerHTML = '';
    this.elements.messageContainer.appendChild(message);

    // Trigger animation
    setTimeout(() => {
      message.classList.add('show');
    }, 10);

    // Auto hide after 4 seconds
    setTimeout(() => {
      message.classList.remove('show');
      setTimeout(() => {
        if (message.parentNode) {
          message.parentNode.removeChild(message);
        }
      }, 300);
    }, 4000);
  }

  // Set loading state
  setLoading(isLoading, message = '') {
    this.isLoading = isLoading;
    
    this.elements.saveSettings.disabled = isLoading;
    this.elements.validateToken.disabled = isLoading;

    if (isLoading) {
      this.elements.saveSettings.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 12a9 9 0 11-6.219-8.56"></path>
        </svg>
        ${message}
      `;
      this.elements.saveSettings.classList.add('loading');
    } else {
      this.elements.saveSettings.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
          <polyline points="17 21 17 13 7 13 7 21"></polyline>
          <polyline points="7 3 7 8 15 8"></polyline>
        </svg>
        Save Settings
      `;
      this.elements.saveSettings.classList.remove('loading');
    }
  }

  // Mark form as changed
  markAsChanged() {
    this.elements.saveSettings.classList.add('changed');
  }

  // Clear changed state
  clearChangedState() {
    this.elements.saveSettings.classList.remove('changed');
  }
}

// Initialize popup when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new PopupManager();
});
