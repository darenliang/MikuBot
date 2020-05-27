import {Command} from 'discord-akairo';
import {Message, MessageAttachment, User} from 'discord.js';
import {MBEmbed} from '../../utils/messageGenerator';
import {nekolife} from '../../utils/nekolife';

export default class TickleCommand extends Command {
    constructor() {
        super('tickle', {
            aliases: ['tickle'],
            description: {
                'fields': [
                    {
                        'name': '',
                        'value': 'Get a random tickle.'
                    },
                    {
                        'name': '<user>',
                        'value': 'Tickle user.'
                    }
                ]
            },
            cooldown: 3000,
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
        nekolife('tickle')
            .then(resp => {
                const ext = resp.data.url.split('.').pop();
                const embed = new MBEmbed({
                    title: user ? `${message.author.username} tickles ${user.username}` : 'Here\'s your tickle!'
                })
                    .setImage(`attachment://tickle.${ext}`)
                    .attachFiles(
                        [new MessageAttachment(resp.data.url,
                            `tickle.${ext}`)]);
                return message.channel.send(embed);
            })
            .catch(err => {
                console.log('ERROR', 'tickle', `Network failure on ${err}`);
                return message.channel.send(':timer: Request timed out for `tickle`.');
            });
    }
}