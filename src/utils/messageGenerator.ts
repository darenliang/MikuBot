import {MessageEmbed} from 'discord.js';
import config from '../config.json';

interface MBParams {
    title: string,
    url?: string,
    color?: number
}

export class MBEmbed extends MessageEmbed {
    constructor(params: MBParams) {
        super();
        if (typeof params.color === 'undefined') {
            this.setColor(config.color);
        } else {
            this.setColor(params.color);
        }
        this.setAuthor(params.title, undefined, params.url);
    }
}