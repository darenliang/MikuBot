import {Command} from 'discord-akairo';
import {Message, MessageAttachment} from 'discord.js';
import {MBEmbed} from '../../utils/messageGenerator';

export default class WaifuCommand extends Command {
    constructor() {
        super('waifu', {
            aliases: ['waifu', 'laifu'],
            description: {
                'fields': [
                    {
                        'name': '',
                        'value': 'Get an AI generated waifu.'
                    }
                ]
            },
            clientPermissions: ['SEND_MESSAGES'],
        });
    }

    async exec(message: Message) {
        const selection = Math.floor(Math.random() * Math.floor(100000));
        const embed = new MBEmbed({
            title: 'Here\'s your waifu.'
        })
            .setImage('attachment://waifu.jpg')
            .attachFiles(
                [new MessageAttachment(`mount/waifu/example-${selection}.jpg`,
                    'waifu.jpg')]);
        return await message.channel.send(embed);
    }
}