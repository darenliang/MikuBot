import {Command} from 'discord-akairo';
import {Message, MessageAttachment, User} from 'discord.js';
import {MBEmbed} from '../../utils/messageGenerator';
import {nekolife} from '../../utils/nekolife';

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
        nekolife('pat')
            .then(resp => {
                const ext = resp.data.url.split('.').pop();
                const embed = new MBEmbed({
                    title: user ? `${message.author.username} headpats ${user.username}` : 'Here\'s your headpat.'
                })
                    .setImage(`attachment://headpat.${ext}`)
                    .attachFiles(
                        [new MessageAttachment(resp.data.url,
                            `headpat.${ext}`)]);
                return message.channel.send(embed);
            })
            .catch(err => {
                console.log('ERROR', 'headpat', `Network failure on ${err}`);
                return message.channel.send(':timer: Request timed out for `headpat`.');
            });
    }
}