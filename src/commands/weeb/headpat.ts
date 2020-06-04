import {Command} from 'discord-akairo';
import {Message, MessageAttachment, User} from 'discord.js';
import {MBEmbed} from '../../utils/messageGenerator';

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
            typing: true,
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
                [new MessageAttachment(`https://gitlab.com/darenliang/gifs/-/raw/master/data/headpats/${Math.floor(Math.random() * 140) + 1}.gif`,
                    'headpat.gif')]);
        return message.channel.send(embed)
            .catch(err => console.log('ERROR', 'headpat', 'Failed to send message: ' + err));
    }
}