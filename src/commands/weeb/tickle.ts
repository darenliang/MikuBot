import {Command} from 'discord-akairo';
import {Message, MessageAttachment, User} from 'discord.js';
import tracer from 'tracer';
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
            const resp = await nekolife('tickle');
            const ext = resp.data.url.split('.').pop();
            const embed = new MBEmbed({
                title: user ? `${message.author.username} tickles ${user.username}` : 'Here\'s your tickle!'
            })
                .setImage(`attachment://tickle.${ext}`)
                .attachFiles(
                    [new MessageAttachment(resp.data.url,
                        `tickle.${ext}`)]);
            return message.channel.send(embed);
        } catch (e: any) {
            tracer.console().error(this.client.options.shards, `Network failure on ${e.toString()}`)
            return message.channel.send(':timer: Request timed out for `tickle`.');
        }
    }
}
