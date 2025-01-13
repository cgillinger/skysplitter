/**
 * Skysplitter - Express Server
 * Simple server to serve the static files and handle compression
 */

const express = require('express');
const compression = require('compression');
const path = require('path');
const app = express();

// Enable compression for all responses
app.use(compression());

// Serve static files from the client directory
app.use('/client', express.static(path.join(__dirname, 'client')));
app.use('/api', express.static(path.join(__dirname, 'api')));
app.use(express.json());

// Basic error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// Serve the main application
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'index.html'));
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).send('OK');
});

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
    console.log(`
    🚀 Skysplitter is running!
    🌐 Server listening on port ${PORT}
    📝 Access the application at http://localhost:${PORT}
    `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});