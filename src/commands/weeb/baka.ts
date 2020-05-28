import {Command} from 'discord-akairo';
import {Message, MessageAttachment, User} from 'discord.js';
import {MBEmbed} from '../../utils/messageGenerator';
import {nekolife} from '../../utils/nekolife';

export default class BakaCommand extends Command {
    constructor() {
        super('baka', {
            aliases: ['baka', 'idiot'],
            description: {
                'fields': [
                    {
                        'name': '',
                        'value': 'Get a random baka.'
                    },
                    {
                        'name': '<user>',
                        'value': 'Call user an idiot.'
                    }
                ]
            },
            cooldown: 5000,
            ratelimit: 2,
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
        nekolife('baka')
            .then(resp => {
                const ext = resp.data.url.split('.').pop();
                const embed = new MBEmbed({
                    title: user ? `${message.author.username} bakas at ${user.username}` : 'Baka!'
                })
                    .setImage(`attachment://baka.${ext}`)
                    .attachFiles(
                        [new MessageAttachment(resp.data.url,
                            `baka.${ext}`)]);
                return message.channel.send(embed);
            })
            .catch(err => {
                console.log('ERROR', 'baka', `Network failure on ${err}`);
                return message.channel.send(':timer: Request timed out for `baka`.');
            });
    }
}