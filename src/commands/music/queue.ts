import {Command} from 'discord-akairo';
import {Message} from 'discord.js';
import * as helpers from '../../utils/helpers';
import {MBEmbed} from '../../utils/messageGenerator';

export default class QueueCommand extends Command {
    constructor() {
        super('queue', {
            aliases: ['queue', 'list'],
            description: {
                'fields': [
                    {
                        'name': '<optional page number>',
                        'value': 'Show queue.'
                    }
                ]
            },
            clientPermissions: ['SEND_MESSAGES'],
            channel: 'guild',
            args: [
                {
                    id: 'page',
                    type: 'integer',
                    default: 1
                }
            ]
        });
    }

    async exec(message: Message, {page}: { page: number }) {
        if (page < 1) return await message.channel.send('Please enter a positive integer as the page number.');
        const serverQueue = this.client.musicQueue.get(message.guild!.id);
        if (!serverQueue) return message.channel.send('There is nothing playing.');
        const queuedSongs = serverQueue.songs.slice((page - 1) * 10, page * 10);
        if (queuedSongs.length == 0) return await message.channel.send(`Your page number is too large. The last page number is ${Math.ceil(queuedSongs.length / 25)}.`);
        const embed = new MBEmbed({
            title: 'Music Queue'
        })
            .setDescription('')
            .setThumbnail(serverQueue.songs[0].thumbnail)
            .setFooter(`Page ${page} | Total # of songs queued: ${serverQueue.songs.length}`);
        for (const [idx, song] of queuedSongs.entries()) {
            embed.description += `\`${helpers.pad('  ', (idx + 1).toString(), true)}\` ${song.title}\n`;
        }
        return message.channel.send(embed);
    }
}