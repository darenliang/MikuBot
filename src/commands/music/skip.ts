import {Command} from 'discord-akairo';
import {Message} from 'discord.js';

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
        const {channel} = message.member!.voice;
        if (!channel) return message.channel
            .send('You have to be in the same voice channel to skip music.')
            .catch(err => console.log('ERROR', 'skip', 'Failed to send message: ' + err));
        const serverQueue = this.client.musicQueue.get(message.guild!.id);
        if (!serverQueue) return message.channel
            .send('There is nothing playing.')
            .catch(err => console.log('ERROR', 'skip', 'Failed to send message: ' + err));
        if (serverQueue.connection != null) {
            serverQueue.connection.dispatcher.end();
        }
        return await message.channel
            .send('Skipped music.')
            .catch(err => console.log('ERROR', 'skip', 'Failed to send message: ' + err));
    }
}