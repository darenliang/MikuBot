import {Command} from 'discord-akairo';
import {Message, MessageAttachment, User} from 'discord.js';
import tracer from 'tracer';
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
            const resp = await nekolife('baka');
            const ext = resp.data.url.split('.').pop();
            const embed = new MBEmbed({
                title: user ? `${message.author.username} bakas at ${user.username}` : 'Baka!'
            })
                .setImage(`attachment://baka.${ext}`)
                .attachFiles(
                    [new MessageAttachment(resp.data.url,
                        `baka.${ext}`)]);
            return message.channel.send(embed);
        } catch (e: any) {
            tracer.console().error(this.client.options.shards, `Network failure on ${e.toString()}`);
            return message.channel.send(':timer: Request timed out for `baka`.');
        }
    }
}
