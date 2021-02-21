import {Command} from 'discord-akairo';
import {Message, MessageAttachment, User} from 'discord.js';
import tracer from 'tracer';
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
        try {
            const resp = await nekolife('smug');
            const ext = resp.data.url.split('.').pop();
            const embed = new MBEmbed({
                title: user ? `${message.author.username} smugs at ${user.username}` : 'Hehe...'
            })
                .setImage(`attachment://smug.${ext}`)
                .attachFiles(
                    [new MessageAttachment(resp.data.url,
                        `smug.${ext}`)]);
            return message.channel.send(embed);
        } catch (e) {
            tracer.console().error(this.client.options.shards, `Network failure on ${e.toString()}`)
            return message.channel.send(':timer: Request timed out for `smug`.');
        }
    }
}