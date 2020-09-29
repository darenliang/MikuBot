import Client from '../struct/client';
import axios, {AxiosResponse} from 'axios';
import {Guild, User} from 'discord.js';

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

    getGif(guild: Guild): GifImage | null {
        if (!this.cache.hasOwnProperty(guild.id)) {
            return null;
        } else if (this.cache[guild.id].data.length == 0) {
            return null;
        } else {
            return this.cache[guild.id].data[Math.floor(Math.random() * this.cache[guild.id].data.length)];
        }
    }

    createAlbum(guild: Guild): Promise<any> {
        if (!this.cache.hasOwnProperty(guild.id)) {
            return axios({
                url: 'https://api.imgur.com/3/album/?',
                timeout: this.client.config.defaultTimeout,
                method: 'post',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.IMGUR_TOKEN}`
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
        return new Promise((resolve => resolve()));
    }

    uploadGif(guild: Guild, user: User, imgURL: string): Promise<any> {
        return axios({
            url: 'https://api.imgur.com/3/upload/?',
            timeout: this.client.config.defaultTimeout,
            method: 'post',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.IMGUR_TOKEN}`
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


    deleteGif(guild: Guild, hash: string): Promise<any> {
        return axios({
            url: `https://api.imgur.com/3/image/${hash}`,
            timeout: this.client.config.defaultTimeout,
            method: 'delete',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.IMGUR_TOKEN}`
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

    getAlbumLink(guild: Guild): string | null {
        if (!this.cache.hasOwnProperty(guild.id)) return null;
        return `https://imgur.com/a/${this.cache[guild.id].id}`;
    }

    setAlbums(): Promise<any> {
        return axios({
            url: `https://api.imgur.com/3/account/${process.env.IMGUR_USERNAME}/albums`,
            timeout: this.client.config.defaultTimeout,
            method: 'get',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.IMGUR_TOKEN}`
            }
        }).then(resp => {
            [...Array(resp.data.data.length)].reduce((p: Promise<AxiosResponse>, _, i) =>
                p.then(() => {
                    axios({
                        url: `https://api.imgur.com/3/album/${resp.data.data[i].id}/images`,
                        timeout: this.client.config.defaultTimeout,
                        method: 'get',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${process.env.IMGUR_TOKEN}`
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
                    }).catch(err =>
                        console.log('ERROR', 'setAlbums', `Failed to get images in an album: ${err}`)
                    );
                }), Promise.resolve());
        }).catch(err =>
            console.log('ERROR', 'setAlbums', `Failed to get albums: ${err}`)
        );
    }
}