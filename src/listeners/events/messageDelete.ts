import {Listener} from 'discord-akairo';
import {Message} from 'discord.js';

export default class MessageDeleteListener extends Listener {
    constructor() {
        super('messageDelete', {
            emitter: 'client',
            event: 'messageDelete'
        });
    }

    async exec(message: Message) {
        if (message.author.bot) {
            return;
        }
        this.client.deleteCache.set(message.channel.id, message);
    }
}