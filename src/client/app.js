/**
 * Skysplitter - Frontend Application Logic
 * Handles text splitting, link detection, and interaction with Bluesky API
 */

import { BlueskyClient } from '/api/bluesky.js';

const MAX_POST_LENGTH = 300;
const RATE_LIMIT_DELAY = 2000;

class SkySplitter {
    constructor() {
        this.client = new BlueskyClient();
        this.setupEventListeners();
        this.links = new Set();
        this.embeds = new Map();
    }

    setupEventListeners() {
        // Auth form handling
        document.getElementById('auth-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleLogin(e);
        });

        // Text input handling
        const contentArea = document.getElementById('content');
        contentArea.addEventListener('input', () => {
            this.handleTextChange(contentArea.value);
        });

        // Split and post button
        document.getElementById('splitButton').addEventListener('click', () => {
            this.handleSplitAndPost();
        });
    }

    async handleLogin(event) {
        const username = document.getElementById('username').value;
        const appPassword = document.getElementById('appPassword').value;

        event.preventDefault();

        try {
            if (!username || !appPassword) {
                throw new Error('Both username and app password are required');
            }

            console.log('Attempting to log in with:', username);
            
            await this.client.login(username, appPassword);
            
            document.getElementById('loginForm').classList.add('hidden');
            document.getElementById('textInput').classList.remove('hidden');
            this.showNotification('Login successful!', 'success');
            
        } catch (error) {
            console.error('Login error:', error);
            this.showNotification(`Login error: ${error.message}`, 'error');
            
            document.getElementById('username').value = username;
            document.getElementById('appPassword').value = appPassword;
        }
    }

    async handleTextChange(text) {
        const links = this.detectLinks(text);
        await this.updateLinkSection(links);
        this.updateCharCount(text);
    }

    detectLinks(text) {
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        return text.match(urlRegex) || [];
    }

    async updateLinkSection(links) {
        const linkSection = document.getElementById('linkSection');
        const linkList = document.getElementById('linkList');

        if (links.length === 0) {
            linkSection.classList.add('hidden');
            return;
        }

        linkSection.classList.remove('hidden');
        linkList.innerHTML = '';

        for (const link of links) {
            if (!this.links.has(link)) {
                this.links.add(link);
                const embed = await this.fetchEmbed(link);
                if (embed) {
                    this.embeds.set(link, embed);
                }
            }

            const linkEl = this.createLinkElement(link);
            linkList.appendChild(linkEl);
        }
    }

    createLinkElement(link) {
        const div = document.createElement('div');
        div.className = 'flex items-center justify-between bg-gray-50 p-2 rounded';
        
        const linkText = document.createElement('span');
        linkText.className = 'truncate flex-1 mr-4';
        linkText.textContent = link;
        
        const removeBtn = document.createElement('button');
        removeBtn.className = 'text-red-600 hover:text-red-800';
        removeBtn.textContent = 'Remove from text';
        removeBtn.onclick = () => this.removeLink(link);
        
        div.appendChild(linkText);
        div.appendChild(removeBtn);
        return div;
    }

    removeLink(link) {
        const contentArea = document.getElementById('content');
        contentArea.value = contentArea.value.replace(link, '');
        this.handleTextChange(contentArea.value);
    }

    async fetchEmbed(url) {
        try {
            const response = await fetch(url);
            const html = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            
            return {
                url,
                title: doc.querySelector('meta[property="og:title"]')?.content || doc.title,
                description: doc.querySelector('meta[property="og:description"]')?.content || '',
                thumbnail: doc.querySelector('meta[property="og:image"]')?.content
            };
        } catch (error) {
            console.error('Failed to fetch embed:', error);
            return null;
        }
    }

    updateCharCount(text) {
        const count = text.length;
        document.getElementById('charCount').textContent = `${count} characters`;
        
        const splitButton = document.getElementById('splitButton');
        splitButton.disabled = count === 0;
    }

    async handleSplitAndPost() {
        const text = document.getElementById('content').value;
        if (!text) return;

        const posts = this.splitText(text);
        await this.showPreview(posts);

        try {
            let rootPost = null;
            let parentPost = null;

            for (let i = 0; i < posts.length; i++) {
                const post = posts[i];
                const links = this.detectLinks(post);
                const embeds = links.map(link => this.embeds.get(link)).filter(Boolean);
                
                let reply = null;
                if (rootPost) {
                    reply = {
                        root: rootPost,
                        post: parentPost
                    };
                }

                const response = await this.client.createPost(
                    post, 
                    embeds[0], // Use first embed if available
                    reply
                );

                // Save reference to first post as root for the thread
                if (i === 0) {
                    rootPost = {
                        uri: response.uri,
                        cid: response.cid
                    };
                }
                
                // Update parent reference for next reply
                parentPost = {
                    uri: response.uri,
                    cid: response.cid
                };

                await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_DELAY));
                this.updateProgress(i + 1, posts.length);
            }
            
            this.showNotification('All posts created successfully!', 'success');
        } catch (error) {
            this.showNotification(`Error: ${error.message}`, 'error');
        }
    }

    splitText(text) {
        const words = text.split(' ');
        let posts = [];
        let currentPost = '';
        
        // First pass: Split into approximate posts, keeping track of length including potential continuation marker
        for (let i = 0; i < words.length; i++) {
            const word = words[i];
            const potentialPostNumber = posts.length + 1;
            const maxContinuationLength = ` (cont ${potentialPostNumber}/?)`.length;
            
            // Check if adding this word would exceed the limit
            if (currentPost.length + 1 + word.length + maxContinuationLength <= MAX_POST_LENGTH) {
                currentPost += (currentPost ? ' ' : '') + word;
            } else {
                if (currentPost) {
                    posts.push(currentPost);
                    currentPost = word;
                } else {
                    // If a single word is too long, we need to split it
                    const availableLength = MAX_POST_LENGTH - maxContinuationLength;
                    posts.push(word.substring(0, availableLength));
                    currentPost = word.substring(availableLength);
                }
            }
        }
        
        // Add the last post if there's anything left
        if (currentPost) {
            posts.push(currentPost);
        }

        // Second pass: Add continuation markers now that we know total count
        return posts.map((post, index) => {
            if (posts.length > 1) {
                return post + ` (cont ${index + 1}/${posts.length})`;
            }
            return post;
        });
    }

    async showPreview(posts) {
        const previewArea = document.getElementById('previewArea');
        const postPreviews = document.getElementById('postPreviews');
        
        previewArea.classList.remove('hidden');
        postPreviews.innerHTML = '';

        posts.forEach((post, index) => {
            const preview = document.createElement('div');
            preview.className = 'bg-gray-50 p-4 rounded mb-4';

            // Split the post content and continuation marker
            const contMatch = post.match(/ \(cont \d+\/\d+\)$/);
            const mainContent = contMatch ? post.slice(0, -contMatch[0].length) : post;
            const continuation = contMatch ? contMatch[0] : '';

            preview.innerHTML = `
                <div class="font-medium mb-2">Post ${index + 1} of ${posts.length}</div>
                <div class="mt-2 border-l-4 border-blue-500 pl-3">${mainContent}</div>
                ${continuation ? `<div class="text-blue-600 font-medium mt-2">${continuation}</div>` : ''}
                <div class="text-sm text-gray-500 mt-2">${post.length} characters</div>
            `;
            postPreviews.appendChild(preview);
        });
    }

    updateProgress(current, total) {
        const progress = document.getElementById('progress');
        if (progress) {
            progress.textContent = `Posted ${current} of ${total}`;
        }
    }

    showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `fixed bottom-4 right-4 p-4 rounded-lg ${
            type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 5000);
    }
}

// Initialize application
document.addEventListener('DOMContentLoaded', () => {
    window.app = new SkySplitter();
});