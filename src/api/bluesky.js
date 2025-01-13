/**
 * Skysplitter - Bluesky API Client
 * Handles authentication and posting to Bluesky using App Passwords
 * Includes session persistence using sessionStorage
 * 
 * @author Christian Gillinger
 * @version 1.2.1
 * @license MIT
 * 
 * Copyright (c) 2024 Christian Gillinger
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 */

import { BskyAgent } from 'https://esm.sh/@atproto/api';

export class BlueskyClient {
    constructor() {
        // Initialize the Bluesky agent with the default service endpoint
        this.agent = new BskyAgent({
            service: 'https://bsky.social'
        });
        this.isAuthenticated = false;
    }

    /**
     * Check for existing session in sessionStorage and attempt to restore it
     * @returns {Promise<boolean>} Whether a valid session was restored
     */
    async checkSession() {
        const credentials = sessionStorage.getItem('bluesky_credentials');
        if (credentials) {
            try {
                const { identifier, password } = JSON.parse(credentials);
                console.log('Found stored credentials for:', identifier);
                
                await this.agent.login({
                    identifier,
                    password
                });
                
                this.isAuthenticated = true;
                console.log('Successfully restored session');
                return true;
            } catch (error) {
                console.error('Session restore failed:', error);
                sessionStorage.removeItem('bluesky_credentials');
                this.isAuthenticated = false;
                return false;
            }
        }
        return false;
    }

    /**
     * Log in to Bluesky and store credentials in sessionStorage
     * @param {string} identifier - Username or email
     * @param {string} appPassword - App-specific password
     * @returns {Promise<boolean>} Whether login was successful
     */
    async login(identifier, appPassword) {
        try {
            await this.agent.login({
                identifier,
                password: appPassword
            });
            
            this.isAuthenticated = true;
            
            // Store credentials in sessionStorage (persists until browser/tab is closed)
            sessionStorage.setItem('bluesky_credentials', JSON.stringify({
                identifier,
                password: appPassword
            }));
            
            console.log('Login successful and credentials stored');
            return true;
        } catch (error) {
            console.error('Login failed:', error);
            this.isAuthenticated = false;
            throw new Error(`Login failed: ${error.message}`);
        }
    }

    /**
     * Log out and clear stored credentials
     */
    async logout() {
        this.isAuthenticated = false;
        sessionStorage.removeItem('bluesky_credentials');
    }

    /**
     * Create a new post on Bluesky
     * @param {string} text - The post content
     * @param {Object} embed - Optional embed data (external link, image, etc.)
     * @param {Object} reply - Optional reply data for threading
     * @returns {Promise<Object>} Post creation result
     */
    async createPost(text, embed = null, reply = null) {
        if (!this.isAuthenticated) {
            throw new Error('Not authenticated');
        }

        try {
            const post = {
                text,
                createdAt: new Date().toISOString(),
                langs: ['en']
            };

            if (embed) {
                post.embed = await this.createEmbed(embed);
            }

            if (reply) {
                post.reply = {
                    root: reply.root || reply.post,
                    parent: reply.post
                };
            }

            const response = await this.agent.post(post);
            return {
                success: true,
                uri: response.uri,
                cid: response.cid
            };
        } catch (error) {
            console.error('Post failed:', error);
            throw new Error(`Post failed: ${error.message}`);
        }
    }

    /**
     * Create an embed object for external content
     * @param {Object} embed - Embed data including URL, title, description, and thumbnail
     * @returns {Promise<Object>} Formatted embed object for Bluesky
     */
    async createEmbed(embed) {
        const embedData = {
            $type: 'app.bsky.embed.external',
            external: {
                uri: embed.url,
                title: embed.title,
                description: embed.description
            }
        };

        if (embed.thumb) {
            const response = await fetch(embed.thumb);
            const blob = await response.blob();
            const upload = await this.agent.uploadBlob(blob, {
                encoding: 'image/jpeg'
            });

            embedData.external.thumb = {
                $type: 'blob',
                ref: upload.data.blob,
                mimeType: 'image/jpeg',
                size: blob.size
            };
        }

        return embedData;
    }
}