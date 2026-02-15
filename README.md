--- LeetCode GitHub Sync – Chrome Extension

A Chrome Extension that automatically syncs accepted LeetCode solutions to a GitHub repository.

This tool detects successful submissions on LeetCode and pushes the solution file directly to GitHub using the **GitHub REST API**.

--- Features

✅ Auto-detect accepted LeetCode submissions  
✅ One-click manual sync  
✅ Supports multiple programming languages  
✅ Custom folder structures (Easy / Medium / Hard)  
✅ GitHub REST API integration  
✅ Manifest V3 compatible  

--- Tech Stack

- JavaScript (ES6+)
- Chrome Extension – Manifest V3
- GitHub REST API
- DOM MutationObserver
- Chrome Storage API

--- Folder Structure

├── manifest.json
├── background.js
├── contentScript.js
├── popup.html
├── popup.js
├── styles.css


--- Installation (Developer Mode)

Since this is a custom extension, install it manually:

### 1️⃣ Clone Repository
 - git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git
      Or download ZIP and extract.

2️⃣ Open Chrome Extensions Page
Open Chrome and navigate to:
- chrome://extensions

3️⃣ Enable Developer Mode
- Toggle Developer Mode (top right).

4️⃣ Load Extension
- Click:
Load unpacked
- Select the extension project folder.

--- GitHub Configuration
 To enable syncing, you must provide:
   - GitHub Username
    - Repository Name

--- Personal Access Token (Classic)
✅ Create GitHub Token
Go to:
- https://github.com/settings/tokens
- Create New Token (Classic) with:
✔ repo permission (Required)
Copy the token.

✅ Enter Credentials in Extension
Open the extension popup and provide:

- GitHub Username
- Repository Name
- Token
- Click Validate Token → Save Settings

-- How to run and Use the Extension:

- Open LeetCode
- Solve a problem
- Submit solution
- Upon Accepted, solution syncs automatically

--- How It Works

The extension:
- Observes LeetCode UI changes
- Detects accepted submissions
- Extracts code + metadata
- Communicates with background service worker
- Writes file via GitHub API

⚠️ Note:

- Repository must exist on GitHub
- Repository should be empty initially (recommended)
- Token must include repo permission

👩‍💻 Author --- AMRUTHA_MJ
Built as a learning + productivity tool for improving workflow and GitHub automation.
Feel free to modify any features and if you like project, give it a star 
