/**
 * Skysplitter - Bluesky API Client
 * Handles authentication and posting to Bluesky using App Passwords
 */

import { BskyAgent } from 'https://esm.sh/@atproto/api';

export class BlueskyClient {
    constructor() {
        this.agent = new BskyAgent({
            service: 'https://bsky.social'
        });
        this.isAuthenticated = false;
    }

    async login(identifier, appPassword) {
        try {
            await this.agent.login({
                identifier,
                password: appPassword
            });
            this.isAuthenticated = true;
            return true;
        } catch (error) {
            console.error('Login failed:', error);
            throw new Error(`Login failed: ${error.message}`);
        }
    }

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

    getRateLimitInfo() {
        return {
            maxPostsPerHour: 1666,
            maxApiCallsPer5Min: 3000
        };
    }
}