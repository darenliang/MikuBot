import {Command} from 'discord-akairo';
import {Message, MessageAttachment, User} from 'discord.js';
import {MBEmbed} from '../../utils/messageGenerator';
// @ts-ignore
import secrets from '../../../mount/secrets.json';

export default class HeadpatCommand extends Command {
    constructor() {
        super('headpat', {
            aliases: ['headpat', 'pat'],
            description: {
                'fields': [
                    {
                        'name': '',
                        'value': 'Get a random headpat.'
                    },
                    {
                        'name': '<user>',
                        'value': 'Headpat user.'
                    }
                ]
            },
            clientPermissions: ['SEND_MESSAGES'],
            args: [
                {
                    id: 'user',
                    type: 'relevant'
                }
            ]
        });
    }

    async exec(message: Message, {user}: { user: User }) {
        const embed = new MBEmbed({
            title: user ? `${message.author.username} headpats ${user.username}` : 'Here\'s your headpat.'
        })
            .setImage(`attachment://headpat.gif`)
            .attachFiles(
                [new MessageAttachment(`mount/gifs/headpats/${Math.floor(Math.random() * secrets.gifs.headpatsLimit) + 1}.gif`,
                    'headpat.gif')]);
        return message.channel.send(embed);
    }
}