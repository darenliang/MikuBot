import {Command} from 'discord-akairo';
import {Message, MessageAttachment, User} from 'discord.js';
import {MBEmbed} from '../../utils/messageGenerator';
import {nekolife} from '../../utils/nekolife';

export default class KissCommand extends Command {
    constructor() {
        super('kiss', {
            aliases: ['kiss'],
            description: {
                'fields': [
                    {
                        'name': '',
                        'value': 'Get a random kiss.'
                    },
                    {
                        'name': '<user>',
                        'value': 'Kiss user.'
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
        try {
            const resp = await nekolife('kiss');
            const ext = resp.data.url.split('.').pop();
            const embed = new MBEmbed({
                title: user ? `${message.author.username} kisses ${user.username}` : ':flushed: OwO...'
            })
                .setImage(`attachment://kiss.${ext}`)
                .attachFiles(
                    [new MessageAttachment(resp.data.url,
                        `kiss.${ext}`)]);
            return message.channel.send(embed);
        } catch (e) {
            console.log('ERROR', 'kiss', `Network failure on ${e.toString()}`);
            return message.channel.send(':timer: Request timed out for `kiss`.');
        }
    }
}