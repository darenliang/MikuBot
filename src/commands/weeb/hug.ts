import {Command} from 'discord-akairo';
import {Message, MessageAttachment, User} from 'discord.js';
import tracer from 'tracer';
import {MBEmbed} from '../../utils/messageGenerator';
import {nekolife} from '../../utils/nekolife';

export default class HugCommand extends Command {
    constructor() {
        super('hug', {
            aliases: ['hug'],
            description: {
                'fields': [
                    {
                        'name': '',
                        'value': 'Get a random hug.'
                    },
                    {
                        'name': '<user>',
                        'value': 'Hug user.'
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
            const resp = await nekolife('hug');
            const ext = resp.data.url.split('.').pop();
            const embed = new MBEmbed({
                title: user ? `${message.author.username} hugs ${user.username}` : 'Here\'s your hug.'
            })
                .setImage(`attachment://hug.${ext}`)
                .attachFiles(
                    [new MessageAttachment(resp.data.url,
                        `hug.${ext}`)]);
            return message.channel.send(embed);
        } catch (e) {
            tracer.console().error(this.client.options.shards, `Network failure on ${e.toString()}`)
            return message.channel.send(':timer: Request timed out for `hug`.');
        }
    }
}