import {Command} from 'discord-akairo';
import {Message} from 'discord.js';

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
            clientPermissions: ['SEND_MESSAGES'],
            cooldown: 2000,
            channel: 'guild'
        });
    }

    async exec(message: Message) {
        const serverQueue = this.client.musicQueue.get(message.guild!.id);
        if (serverQueue && serverQueue.connection && serverQueue.playing) {
            serverQueue.playing = false;
            serverQueue.connection.dispatcher.pause();
            return message.channel.send('Paused music.');
        }
        return message.channel.send('There is nothing playing or there is nothing to pause.');
    }
}