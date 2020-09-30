import {Command} from 'discord-akairo';
import {Message, MessageAttachment, User} from 'discord.js';
import {MBEmbed} from '../../utils/messageGenerator';
import {nekolife} from '../../utils/nekolife';

export default class SlapCommand extends Command {
    constructor() {
        super('slap', {
            aliases: ['slap'],
            description: {
                'fields': [
                    {
                        'name': '',
                        'value': 'Get a random slap.'
                    },
                    {
                        'name': '<user>',
                        'value': 'Slap user.'
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
        nekolife('slap')
            .then(resp => {
                const ext = resp.data.url.split('.').pop();
                const embed = new MBEmbed({
                    title: user ? `${message.author.username} slaps ${user.username}` : 'Slap!'
                })
                    .setImage(`attachment://slap.${ext}`)
                    .attachFiles(
                        [new MessageAttachment(resp.data.url,
                            `slap.${ext}`)]);
                return message.channel.send(embed);
            })
            .catch(err => {
                console.log('ERROR', 'slap', `Network failure on ${JSON.stringify(err)}`);
                return message.channel.send(':timer: Request timed out for `slap`.');
            });
    }
}