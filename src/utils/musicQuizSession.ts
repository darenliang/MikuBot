import {Channel} from 'discord.js';
import {MBEmbed} from './messageGenerator';

interface SessionCache {
    [key: string]: CacheItem
}

interface CacheItem {
    nameCache: string[]
    embed: MBEmbed
    hintEmbed: MBEmbed
}

export class MusicQuizSession {
    private cache: SessionCache;

    constructor() {
        this.cache = {};
    }

    load(channel: Channel | null): CacheItem | null {
        if (!channel || !this.cache.hasOwnProperty(channel.id)) return null;
        return this.cache[channel.id];
    }

    store(channel: Channel | null, item: CacheItem): boolean {
        if (!channel) return false;
        this.cache[channel.id] = item;
        return true;
    }

    delete(channel: Channel | null): boolean {
        if (!channel) return false;
        delete this.cache[channel.id];
        return true;
    }
}