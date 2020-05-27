import {Command} from 'discord-akairo';
import {Message} from 'discord.js';
import {Client} from '../../bot';

// Taken from https://github.com/iCrawl/discord-music-bot
export default class SkipCommand extends Command {
    constructor() {
        super('skip', {
            aliases: ['skip', 'next', 'pass'],
            description: {
                'fields': [
                    {
                        'name': '',
                        'value': 'Skip music.'
                    }
                ]
            },
            channel: 'guild'
        });
    }

    async exec(message: Message) {
        const client = this.client as Client;
        const {channel} = message.member!.voice;
        if (!channel) return message.channel.send('You have to be in the same voice channel to skip music.');
        const serverQueue = client.musicQueue.get(message.guild!.id);
        if (!serverQueue) return message.channel.send('There is nothing playing.');
        serverQueue.connection!.dispatcher.end('Skip music.');
    }
}