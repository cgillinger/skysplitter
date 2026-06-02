# Skysplitter

Skysplitter is a web application that helps you split long texts into multiple posts for Bluesky, maintaining proper threading and handling links intelligently. It features a clean, modern interface and session persistence for convenience.

> This is a personal hobby project I build for my own use and publish in case it's useful to someone else. I work on it in my spare time, so issues and PRs are welcome but replies may be slow. Use at your own risk.

## Features

- Split long text into properly threaded Bluesky posts
- Automatic character counting and post preview
- Smart link detection and handling
- Session persistence (stays logged in until browser/tab is closed)
- Dark mode support
- Responsive design for mobile and desktop
- Modern, clean interface

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm (comes with Node.js)
- A Bluesky account with an App Password

### Installation

1. Clone the repository:
```bash
git clone https://github.com/cgillinger/skysplitter.git
cd skysplitter
```

2. Install dependencies:
```bash
npm install
```

3. Start the server:
```bash
node src/server.js
```

4. Open your browser and navigate to:
```
http://localhost:3000
```

### Setting Up Your Bluesky App Password

For security reasons, Skysplitter requires an App Password rather than your main Bluesky password. To create one:

1. Go to [Bluesky App Passwords](https://bsky.app/settings/app-passwords)
2. Click "Add App Password"
3. Name it "Skysplitter" (or any name you prefer)
4. Copy the generated password - you'll need it to log in to Skysplitter

## Project Structure

```
skysplitter/
├── src/
│   ├── client/
│   │   ├── app.js         # Main application logic
│   │   ├── styles.css     # Application styling
│   │   └── index.html     # Main HTML file
│   ├── api/
│   │   └── bluesky.js     # Bluesky API client
│   └── server.js          # Express server
├── public/                # Static files
└── package.json          # Project configuration
```

### File Descriptions

#### src/client/app.js
The main application logic. Handles:
- Text splitting and preview
- Link detection
- User interface interactions
- Session management
- Post creation and threading

#### src/api/bluesky.js
The Bluesky API client. Manages:
- Authentication with Bluesky
- Session persistence
- Post creation and threading
- Embed handling for links

#### src/client/styles.css
Contains all styling for the application, including:
- Modern, clean interface design
- Dark mode support
- Responsive layout
- Animations and transitions

#### src/server.js
Simple Express server that:
- Serves static files
- Handles compression
- Provides basic error handling
- Sets up proper routing

#### src/client/index.html
The main HTML file that:
- Sets up the application structure
- Includes necessary scripts and styles
- Provides the login and text input interfaces

## Usage

1. Log in with your Bluesky username and App Password
2. Enter or paste your text in the input area
3. Click "Split" to see how your text will be divided
4. Review the preview
5. Click "Post Thread" to post to Bluesky

Your session will remain active until you either:
- Click the Logout button
- Close the browser/tab
- Clear your browser data

## Important Notes

- The maximum post length is 300 characters
- When splitting text into multiple posts, Skysplitter automatically adds numbering (e.g., "1/4")
- Links are detected automatically and can be removed if needed
- The app requires a modern browser with JavaScript enabled
- Use an App Password instead of your main Bluesky password
- The app maintains your login only until you close the browser/tab

## Troubleshooting

### Common Issues

1. **Login Failed**
   - Make sure you're using an App Password, not your main Bluesky password
   - Check your internet connection
   - Verify your username is correct

2. **Posts Not Threading**
   - Wait a few seconds between posts (rate limiting)
   - Make sure you're still logged in
   - Check your internet connection

3. **Session Lost**
   - This is normal if you closed the browser/tab
   - Log in again using your App Password

### Error Messages

- "Not authenticated": You need to log in again
- "Login failed": Check your credentials
- "Post failed": Usually due to rate limiting, wait a moment and try again

## Security Considerations

- Your App Password is stored only in your browser's session storage
- The session is cleared when you close the browser/tab
- No data is permanently stored on the server
- Always use HTTPS in production

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Author

Christian Gillinger

## Acknowledgments

- Bluesky API documentation and team
- All contributors and users providing feedback

For the latest updates and more information, visit the [GitHub repository](https://github.com/cgillinger/skysplitter).