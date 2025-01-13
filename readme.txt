Project: Skysplitter
Version: 1.0.0
Description: A tool for splitting long text into multiple Bluesky posts
Author: [Your Name]
License: MIT

File Structure:
/
├── README.md
├── package.json
├── src/
│   ├── server.js
│   ├── client/
│   │   ├── index.html
│   │   ├── styles.css
│   │   └── app.js
│   └── api/
│       └── bluesky.js

Installation and Setup:
1. Clone repository
2. npm install
3. npm start

Requirements:
- Node.js 16+
- npm 7+

Security Notes:
- No environment variables or server-side secrets required
- Uses Bluesky App Passwords for secure authentication
- App Passwords should be created at https://bsky.app/settings/app-passwords and deleted after use