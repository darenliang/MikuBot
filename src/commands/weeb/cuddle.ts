import {Command} from 'discord-akairo';
import {Message, MessageAttachment, User} from 'discord.js';
import {MBEmbed} from '../../utils/messageGenerator';
import {nekolife} from '../../utils/nekolife';

export default class CuddleCommand extends Command {
    constructor() {
        super('cuddle', {
            aliases: ['cuddle'],
            description: {
                'fields': [
                    {
                        'name': '',
                        'value': 'Get a random cuddle.'
                    },
                    {
                        'name': '<user>',
                        'value': 'Cuddle with user.'
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
        nekolife('cuddle')
            .then(resp => {
                const ext = resp.data.url.split('.').pop();
                const embed = new MBEmbed({
                    title: user ? `${message.author.username} cuddles ${user.username}` : ':smirk: UwU...'
                })
                    .setImage(`attachment://cuddle.${ext}`)
                    .attachFiles(
                        [new MessageAttachment(resp.data.url,
                            `cuddle.${ext}`)]);
                return message.channel.send(embed);
            })
            .catch(err => {
                console.log('ERROR', 'cuddle', `Network failure on ${JSON.stringify(err)}`);
                return message.channel.send(':timer: Request timed out for `cuddle`.');
            });
    }
}