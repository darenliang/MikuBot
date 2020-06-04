import {Command} from 'discord-akairo';
import {Message} from 'discord.js';
import {MBEmbed} from '../../utils/messageGenerator';

// Taken from https://github.com/iCrawl/discord-music-bot
export default class NowPlayingCommand extends Command {
    constructor() {
        super('nowplaying', {
            aliases: ['nowplaying', 'np'],
            description: {
                'fields': [
                    {
                        'name': '',
                        'value': 'Get current song.'
                    }
                ]
            },
            channel: 'guild'
        });
    }

    async exec(message: Message) {
        const serverQueue = this.client.musicQueue.get(message.guild!.id);
        if (!serverQueue) return message.channel.send('There is nothing playing.');
        const embed = new MBEmbed({
            title: 'Now playing'
        })
            .setDescription(`:musical_note: ${serverQueue.songs[0].title}`)
            .setThumbnail(serverQueue.songs[0].thumbnail);
        return message.channel.send(embed);
    }
}