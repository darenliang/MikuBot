import axios, {AxiosResponse} from 'axios';
import {Guild, User} from 'discord.js';
import tracer from 'tracer';
// @ts-ignore
import secrets from '../../mount/secrets.json';
import Client from '../struct/client';

interface GifCache {
    [key: string]: GifAlbum
}

interface GifAlbum {
    id: string,
    data: GifImage[]
}

interface GifImage {
    id: string,
    title: string,
    link: string
}

export class GifDatabase {
    private client: Client;
    public cache: GifCache;

    constructor(client: Client) {
        this.client = client;
        this.cache = {};
    }

    /**
     * Get gif from cache
     * @param {Guild} guild
     * @return {GifImage | null}
     */
    getGif(guild: Guild): GifImage | null {
        if (!this.cache.hasOwnProperty(guild.id)) {
            return null;
        } else if (this.cache[guild.id].data.length == 0) {
            return null;
        } else {
            return this.cache[guild.id].data[Math.floor(Math.random() * this.cache[guild.id].data.length)];
        }
    }

    /**
     * Create album. If album exists, then do nothing.
     * @param {Guild} guild
     * @return {Promise<any>}
     */
    createAlbum(guild: Guild): Promise<any> {
        if (!this.cache.hasOwnProperty(guild.id)) {
            return axios({
                url: 'https://api.imgur.com/3/album/?',
                timeout: this.client.config.defaultTimeout,
                method: 'post',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${secrets.imgur.token}`
                },
                params: {
                    title: guild.id,
                    privacy: 'secret'
                }
            })
                .then(resp => {
                    this.cache[guild.id] = {
                        id: resp.data.data.id,
                        data: []
                    };
                });
        }
        return Promise.resolve();
    }

    /**
     * Upload gif.
     * @param {Guild} guild
     * @param {User} user
     * @param {string} imgURL
     * @return {Promise<any>}
     */
    uploadGif(guild: Guild, user: User, imgURL: string): Promise<any> {
        return axios({
            url: 'https://api.imgur.com/3/upload/?',
            timeout: this.client.config.defaultTimeout,
            method: 'post',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${secrets.imgur.token}`
            },
            params: {
                image: encodeURI(imgURL),
                album: this.cache[guild.id].id,
                type: 'url',
                title: user.id
            }
        }).then(resp => {
            this.cache[guild.id].data.push({
                id: resp.data.data.id,
                title: resp.data.data.title,
                link: resp.data.data.link
            });
        });
    };

    /**
     * Delete gif.
     * @param {Guild} guild
     * @param {string} hash
     * @return {Promise<any>}
     */
    deleteGif(guild: Guild, hash: string): Promise<any> {
        return axios({
            url: `https://api.imgur.com/3/image/${hash}`,
            timeout: this.client.config.defaultTimeout,
            method: 'delete',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${secrets.imgur.token}`
            }
        }).then(() => {
            let imageIdx = -1;
            for (const [idx, image] of this.cache[guild.id].data.entries()) {
                if (image.id) {
                    imageIdx = idx;
                    break;
                }
            }
            if (!(imageIdx < 0)) {
                this.cache[guild.id].data.splice(imageIdx, 1);
            }
        });
    }

    /**
     * Get album link.
     * @param {Guild} guild
     * @return {string | null}
     */
    getAlbumLink(guild: Guild): string | null {
        if (!this.cache.hasOwnProperty(guild.id)) return null;
        return `https://imgur.com/a/${this.cache[guild.id].id}`;
    }

    /**
     * Populate album cache.
     * @return {Promise<any>}
     */
    setAlbums(): Promise<any> {
        return axios({
            url: `https://api.imgur.com/3/account/${secrets.imgur.username}/albums/count`,
            timeout: this.client.config.defaultTimeout,
            method: 'get',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${secrets.imgur.token}`
            }
        }).then(async resp => {
            const pages = Math.ceil(resp.data.data / 50);
            for (let i = 0; i < pages; i++) {
                await this.setAlbumsPage(i);
            }
            tracer.console().info(this.client.options.shards, 'Set image albums complete');
        }).catch(err => {
            tracer.console().error(this.client.options.shards, `Failed to get albums: ${err.toString()}`);
        });
    }

    setAlbumsPage(page: number): Promise<any> {
        return axios({
            url: `https://api.imgur.com/3/account/${secrets.imgur.username}/albums/${page}`,
            timeout: this.client.config.defaultTimeout,
            method: 'get',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${secrets.imgur.token}`
            }
        }).then(resp => {
            [...Array(resp.data.data.length)].reduce((p: Promise<AxiosResponse>, _, i) =>
                p.then(async () => {
                    // Intentionally hang for 5 secs to prevent ratelimits
                    await new Promise(resolve => setTimeout(resolve, 5000));

                    axios({
                        url: `https://api.imgur.com/3/album/${resp.data.data[i].id}/images`,
                        timeout: this.client.config.defaultTimeout,
                        method: 'get',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${secrets.imgur.token}`
                        }
                    }).then(imagesResp => {
                        this.cache[resp.data.data[i].title] = {
                            id: resp.data.data[i].id,
                            data: imagesResp.data.data.map((image: GifImage) => {
                                return {
                                    id: image.id,
                                    title: image.title,
                                    link: image.link
                                };
                            })
                        };
                    }).catch(err => {
                        tracer.console().error(this.client.options.shards, `Failed to get images in an album: ${err.toString()}`);
                    });
                }), Promise.resolve());
        });
    }
}