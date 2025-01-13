# Skysplitter

Skysplitter is a tool that helps you split long texts into multiple Bluesky posts. It retains links as preview cards (embeds) even if you remove the links from the text to save characters.

## What does it do?

1. Lets you write or paste long text
2. Automatically splits the text into appropriately sized posts for Bluesky
3. Marks each part with "(cont X/Y)" so followers can read in the right order
4. Saves characters by handling links smartly
5. Shows preview before publishing

## Installation

You need to have these installed on your computer:
- [Node.js](https://nodejs.org/) (version 16 or later)
- npm (comes with Node.js)

Steps to install:

1. Open terminal/command prompt
2. Run these commands:
   ```bash
   # Clone the project
   git clone [repository-url] skysplitter
   cd skysplitter

   # Install dependencies
   npm install

   # Start the server
   npm start
   ```
3. Open your web browser and go to `http://localhost:3000`

## Before using the service

You need an App Password from Bluesky. It's safer than using your regular password.

How to create an App Password:
1. Go to [Bluesky's App Passwords page](https://bsky.app/settings/app-passwords)
2. Click "Add App Password"
3. Give it a name (e.g. "Skysplitter")
4. Copy the generated password
5. Use this password along with your username in Skysplitter
6. **Important:** Delete the App Password from Bluesky when you're done

## Usage

1. Open the app in your browser
2. Log in with:
   - Your Bluesky username (e.g. @user.bsky.social)
   - Your App Password (NOT your regular password)
3. Paste or write your text
4. If there are links in your text you can:
   - See them listed below the text field
   - Choose to remove them from the text while keeping the preview
5. Click "Split & Post" to see preview
6. Verify everything looks good
7. Confirm to post

## Security Tips

- Always create a new App Password for each session
- Delete App Password from Bluesky when you're done
- Never share your App Password with anyone
- NEVER use your regular Bluesky password in this app

## Troubleshooting

If something isn't working:

1. Check that the server is running (terminal shows "Skysplitter is running!")
2. Verify your App Password is correctly copied
3. Check that your username is in the correct format (@user.bsky.social)

If problems persist, restart the server:
1. Press Ctrl+C in the terminal to stop the server
2. Run `npm start` again

## License

MIT License - Free to use, modify as you wish!