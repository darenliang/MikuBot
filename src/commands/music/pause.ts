import {Command} from 'discord-akairo';
import {Message} from 'discord.js';
import {Client} from '../../bot';

// Taken from https://github.com/iCrawl/discord-music-bot
export default class PauseCommand extends Command {
    constructor() {
        super('pause', {
            aliases: ['pause', 'freeze'],
            description: {
                'fields': [
                    {
                        'name': '',
                        'value': 'Pause music.'
                    }
                ]
            },
            cooldown: 3000,
            channel: 'guild'
        });
    }

    async exec(message: Message) {
        const serverQueue = (this.client as Client).musicQueue.get(message.guild!.id);
        if (serverQueue && serverQueue.playing) {
            serverQueue.playing = false;
            serverQueue.connection!.dispatcher.pause();
            return message.channel.send('Paused music.');
        }
        return message.channel.send('There is nothing playing.');
    }
}