import {Command} from 'discord-akairo';
import {Message} from 'discord.js';

// Taken from https://github.com/iCrawl/discord-music-bot
export default class ResumeCommand extends Command {
    constructor() {
        super('resume', {
            aliases: ['resume', 'unfreeze'],
            description: {
                'fields': [
                    {
                        'name': '',
                        'value': 'Resume music.'
                    }
                ]
            },
            clientPermissions: ['SEND_MESSAGES'],
            cooldown: 2000,
            channel: 'guild'
        });
    }

    async exec(message: Message) {
        const serverQueue = this.client.musicQueue.get(message.guild!.id);
        if (serverQueue && !serverQueue.playing) {
            serverQueue.playing = true;
            serverQueue.connection!.dispatcher.resume();
            return message.channel.send('Resumed music.');
        }
        return message.channel.send('There is nothing playing or there is nothing to resume.');
    }
}