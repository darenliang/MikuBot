import {Command} from 'discord-akairo';
import {Message, MessageAttachment} from 'discord.js';
import {MBEmbed} from '../../utils/messageGenerator';

export default class WaifuCommand extends Command {
    constructor() {
        super('waifu', {
            aliases: ['waifu', 'laifu'],
            typing: true,
            description: {
                'fields': [
                    {
                        'name': '',
                        'value': 'Get an AI generated waifu.'
                    }
                ]
            }
        });
    }

    async exec(message: Message) {
        const embed = new MBEmbed({
            title: 'Here\'s your waifu.'
        })
            .setImage('attachment://waifu.jpg')
            .attachFiles(
                [new MessageAttachment(`https://www.thiswaifudoesnotexist.net/example-${Math.floor(Math.random() * Math.floor(10001))}.jpg`,
                    'waifu.jpg')]);
        return await message.channel.send(embed);
    }
}