// Background Service Worker for LeetCode GitHub Sync
// Handles GitHub API communication and storage operations

class GitHubSyncService {
  constructor() {
    this.baseURL = 'https://api.github.com';
  }

  // Initialize default settings
  async initializeSettings() {
    const defaultSettings = {
      githubToken: '',
      username: '',
      repository: '',
      folderStructure: 'difficulty',
      autoSync: true
    };

    const stored = await chrome.storage.local.get(['settings']);
    if (!stored.settings) {
      await chrome.storage.local.set({ settings: defaultSettings });
    }
  }

  // Validate GitHub token
  async validateToken(token) {
    try {
      const response = await fetch(`${this.baseURL}/user`, {
        headers: {
          'Authorization': `token ${token}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });

      if (!response.ok) {
        throw new Error(`Token validation failed: ${response.status}`);
      }

      const userData = await response.json();
      return { valid: true, username: userData.login };
    } catch (error) {
      console.error('Token validation error:', error);
      return { valid: false, error: error.message };
    }
  }

  // Get file SHA from GitHub repository
  async getFileSHA(token, username, repo, path) {
    try {
      const response = await fetch(`${this.baseURL}/repos/${username}/${repo}/contents/${encodeURIComponent(path)}`, {
        headers: {
          'Authorization': `token ${token}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });

      if (response.status === 404) {
        return null; // File doesn't exist
      }

      if (!response.ok) {
        throw new Error(`Failed to get file SHA: ${response.status}`);
      }

      const data = await response.json();
      return data.sha;
    } catch (error) {
      console.error('Error getting file SHA:', error);
      throw error;
    }
  }

  // Create or update file in GitHub repository
  async createOrUpdateFile(token, username, repo, path, content, message, sha = null) {
    try {
      const body = {
        message: message,
        content: btoa(unescape(encodeURIComponent(content)))
      };

      if (sha) {
        body.sha = sha;
      }

      const response = await fetch(`${this.baseURL}/repos/${username}/${repo}/contents/${encodeURIComponent(path)}`, {
        method: 'PUT',
        headers: {
          'Authorization': `token ${token}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`GitHub API error: ${errorData.message || response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating/updating file:', error);
      throw error;
    }
  }

  // Sync solution to GitHub
  async syncSolution(solutionData) {
    const { settings } = await chrome.storage.local.get(['settings']);
    
    if (!settings.githubToken || !settings.username || !settings.repository) {
      throw new Error('GitHub credentials not configured');
    }

    const { problemTitle, difficulty, language, code, slug } = solutionData;
    
    // Generate file path based on folder structure
    const folderPath = this.generateFolderPath(settings.folderStructure, difficulty, slug);
    const fileName = this.generateFileName(slug, language);
    const filePath = `${folderPath}/${fileName}`;

    try {
      // Check if file already exists
      const existingSHA = await this.getFileSHA(
        settings.githubToken,
        settings.username,
        settings.repository,
        filePath
      );

      // Prepare file content with metadata
      const fileContent = this.prepareFileContent(solutionData, existingSHA);

      // Create or update file
      const commitMessage = existingSHA 
        ? `Update solution for ${problemTitle}` 
        : `Add solution for ${problemTitle}`;

      const result = await this.createOrUpdateFile(
        settings.githubToken,
        settings.username,
        settings.repository,
        filePath,
        fileContent,
        commitMessage,
        existingSHA
      );

      return { success: true, url: result.content.html_url };
    } catch (error) {
      console.error('Sync failed:', error);
      throw error;
    }
  }

  // Generate folder path based on structure preference
  generateFolderPath(structure, difficulty, slug) {
    switch (structure) {
      case 'difficulty':
        return difficulty.toLowerCase();
      case 'alphabetical':
        return slug.charAt(0).toUpperCase();
      case 'topics':
        return 'solutions';
      default:
        return 'solutions';
    }
  }

  // Generate filename with proper extension
  generateFileName(slug, language) {
    const extensions = {
      'python': 'py',
      'python3': 'py',
      'javascript': 'js',
      'java': 'java',
      'cpp': 'cpp',
      'c++': 'cpp',
      'c': 'c',
      'c#': 'cs',
      'go': 'go',
      'rust': 'rs',
      'typescript': 'ts',
      'sql': 'sql'
    };

    const ext = extensions[language.toLowerCase()] || 'txt';
    return `${slug}.${ext}`;
  }

  // Prepare file content with metadata header
  prepareFileContent(solutionData, existingSHA) {
    const { problemTitle, difficulty, slug, language, code, url, timestamp } = solutionData;
    
    const header = `/*
 * LeetCode Solution: ${problemTitle}
 * Difficulty: ${difficulty}
 * Language: ${language}
 * URL: ${url}
 * Date: ${new Date(timestamp).toLocaleString()}
 * Solution: ${existingSHA ? 'Updated' : 'Initial'}
 */

`;

    // If file exists and has multiple solutions, append new one
    if (existingSHA) {
      const solutionMarker = `// Solution ${Date.now()}`;
      return `${code}\n\n${solutionMarker}\n`;
    }

    return header + code;
  }
}

// Initialize service
const githubService = new GitHubSyncService();

// Handle messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  (async () => {
    try {
      switch (request.action) {
        case 'initializeSettings':
          await githubService.initializeSettings();
          sendResponse({ success: true });
          break;

        case 'validateToken':
          const result = await githubService.validateToken(request.token);
          sendResponse(result);
          break;

        case 'syncSolution':
          const syncResult = await githubService.syncSolution(request.data);
          sendResponse({ success: true, data: syncResult });
          break;

        case 'getSettings':
          const settings = await chrome.storage.local.get(['settings']);
          sendResponse({ success: true, settings: settings.settings });
          break;

        case 'saveSettings':
          await chrome.storage.local.set({ settings: request.settings });
          sendResponse({ success: true });
          break;

        default:
          sendResponse({ success: false, error: 'Unknown action' });
      }
    } catch (error) {
      console.error('Background script error:', error);
      sendResponse({ success: false, error: error.message });
    }
  })();

  return true; // Keep message channel open for async response
});

// Initialize on extension startup
chrome.runtime.onStartup.addListener(() => {
  githubService.initializeSettings();
});

chrome.runtime.onInstalled.addListener(() => {
  githubService.initializeSettings();
});
