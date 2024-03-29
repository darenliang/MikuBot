import {Command} from 'discord-akairo';
import {Message} from 'discord.js';

export default class StopCommand extends Command {
    constructor() {
        super('stop', {
            aliases: ['stop', 'leave', 'disconnect'],
            description: {
                'fields': [
                    {
                        'name': '',
                        'value': 'Stop music. Clear queue and leave voice channel.'
                    }
                ]
            },
            clientPermissions: ['SEND_MESSAGES'],
            channel: 'guild'
        });
    }

    async exec(message: Message) {
        const {channel} = message.member!.voice;
        if (!channel) return message.channel.send('You have to be in the same voice channel to stop music.');
        const serverQueue = this.client.musicQueue.get(message.guild!.id);
        if (!serverQueue) return message.channel.send('There is nothing playing.');
        serverQueue.songs = [];
        if (serverQueue.connection && serverQueue.connection.dispatcher) {
            serverQueue.connection.disconnect();
        }
        return await message.channel.send('Stopped music. Queue cleared.');
    }
}
