import {Command} from 'discord-akairo';
import {Message, MessageAttachment, User} from 'discord.js';
import {MBEmbed} from '../../utils/messageGenerator';
import {nekolife} from '../../utils/nekolife';

export default class SmugCommand extends Command {
    constructor() {
        super('smug', {
            aliases: ['smug'],
            description: {
                'fields': [
                    {
                        'name': '',
                        'value': 'Get a random smug.'
                    },
                    {
                        'name': '<user>',
                        'value': 'Smug at user.'
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
        nekolife('smug')
            .then(resp => {
                const ext = resp.data.url.split('.').pop();
                const embed = new MBEmbed({
                    title: user ? `${message.author.username} smugs at ${user.username}` : 'Hehe...'
                })
                    .setImage(`attachment://smug.${ext}`)
                    .attachFiles(
                        [new MessageAttachment(resp.data.url,
                            `smug.${ext}`)]);
                return message.channel.send(embed);
            })
            .catch(err => {
                console.log('ERROR', 'smug', `Network failure on ${err}`);
                return message.channel.send(':timer: Request timed out for `smug`.');
            });
    }
}