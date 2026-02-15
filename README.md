# LeetCode GitHub Sync

A production-ready Chrome Extension that automatically sync your accepted LeetCode solutions to GitHub repository.

## Features

✅ **Automatic Detection**: Detects when your LeetCode submission is "Accepted"  
✅ **Smart Code Extraction**: Extracts solution code from Monaco Editor with multiple fallback strategies  
✅ **GitHub Integration**: Seamlessly creates/updates files in your GitHub repository  
✅ **Modern UI**: Beautiful dark theme matching LeetCode's aesthetic  
✅ **Flexible Organization**: Choose folder structure (difficulty-based, alphabetical, or topics)  
✅ **Real-time Notifications**: Custom styled notifications for sync status  
✅ **Manual Sync**: Floating sync button for manual control  
✅ **Duplicate Prevention**: Smart handling of multiple solutions for same problem  
✅ **Metadata Headers**: Auto-generates solution metadata in files  

## Installation

### Prerequisites
- Chrome browser (latest version)
- GitHub account
- GitHub Personal Access Token with `repo` scope

### Steps

1. **Create GitHub Personal Access Token**
   - Go to [GitHub Settings > Developer settings > Personal access tokens](https://github.com/settings/tokens)
   - Click "Generate new token (classic)"
   - Give it a descriptive name (e.g., "LeetCode Sync")
   - Select the `repo` scope
   - Click "Generate token"
   - **Important**: Copy the token immediately as you won't see it again

2. **Install Extension**
   - Download or clone this repository
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top-right)
   - Click "Load unpacked"
   - Select the extension folder containing `manifest.json`

3. **Configure Extension**
   - Click the extension icon in Chrome toolbar
   - Enter your GitHub token, username, and repository name
   - Choose your preferred folder structure
   - Click "Save Settings"

## Usage

### Automatic Sync
1. Solve a LeetCode problem
2. Submit your solution
3. When you get "Accepted", the extension will automatically:
   - Extract your code
   - Create/update file in GitHub
   - Show success notification

### Manual Sync
- Click the ⚡ floating button on any LeetCode problem page
- Works even if auto-sync is disabled

### Folder Structure Options

**By Difficulty** (Default)
```
repository/
├── Easy/
│   └── two-sum.py
├── Medium/
│   └── add-two-numbers.py
└── Hard/
    └── median-of-two-sorted-arrays.py
```

**Alphabetical**
```
repository/
├── A/
│   └── add-two-numbers.py
├── M/
│   └── median-of-two-sorted-arrays.py
└── T/
    └── two-sum.py
```

**By Topics**
```
repository/
├── two-sum.py
├── add-two-numbers.py
└── median-of-two-sorted-arrays.py
```

## File Format

Each synced solution includes metadata:

```python
/*
 * LeetCode Solution: Two Sum
 * Difficulty: Easy
 * Language: Python
 * URL: https://leetcode.com/problems/two-sum/
 * Date: 2/14/2026, 10:41:30 PM
 * Solution: Initial
 */

class Solution:
    def twoSum(self, nums: List[int], target: int) -> List[int]:
        # Your solution code here
        pass
```

## Configuration Options

| Setting | Description | Default |
|---------|-------------|---------|
| GitHub Token | Personal access token with repo scope | Required |
| Username | GitHub username | Required |
| Repository | Target repository name | Required |
| Folder Structure | How to organize solutions | By Difficulty |
| Auto-sync | Automatically sync accepted solutions | Enabled |

## Troubleshooting

### Common Issues

**"Token validation failed"**
- Ensure token has `repo` scope
- Check token is copied correctly (starts with `ghp_`, `gho_`, etc.)
- Verify token hasn't expired

**"Could not extract code"**
- Make sure you're on a problem page (not discuss or explore)
- Try refreshing the page
- Use manual sync button as fallback

**"Sync failed"**
- Check repository exists and is accessible
- Verify repository name spelling
- Ensure you have write permissions

### Debug Mode

Open Chrome DevTools on LeetCode pages to see detailed logs:
- Press `F12` or `Cmd+Option+I` (Mac)
- Check Console tab for extension logs

## Security

- **Token Storage**: GitHub token is stored locally using Chrome's secure storage
- **No Data Collection**: Extension doesn't collect or transmit any personal data
- **Minimal Permissions**: Only requests necessary permissions for functionality
- **Open Source**: Full code is available for review

## Development

### Project Structure
```
leetcode-github-sync/
├── manifest.json          # Extension manifest
├── background.js          # Service worker for GitHub API
├── contentScript.js       # LeetCode page interaction
├── popup.html            # Settings popup UI
├── popup.js              # Popup functionality
├── styles.css            # Dark theme styling
├── utils.js              # Utility functions
└── README.md             # This file
```

### Technologies Used
- **Vanilla JavaScript (ES6+)** - No frameworks
- **Chrome Extension Manifest V3** - Latest extension platform
- **GitHub REST API v3** - Repository operations
- **MutationObserver** - Dynamic UI change detection
- **Chrome Storage API** - Settings persistence

### Building
No build process required - the extension runs directly from source files.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly on LeetCode
5. Submit a pull request

## License

MIT License - feel free to use, modify, and distribute.

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Verify your GitHub token and repository settings
3. Open an issue on the GitHub repository

## Changelog

### v1.0.0
- Initial release
- Automatic submission detection
- GitHub repository sync
- Modern dark theme UI
- Multiple folder structure options
- Manual sync capability

---

**Happy coding! 🚀**
