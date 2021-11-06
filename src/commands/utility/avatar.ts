import {Command} from 'discord-akairo';
import {Message, MessageAttachment, User} from 'discord.js';
import tracer from 'tracer';
import {getUrlExtension} from '../../utils/helpers';
import {MBEmbed} from '../../utils/messageGenerator';

export default class AvatarCommand extends Command {
    constructor() {
        super('avatar', {
            aliases: ['avatar', 'pfp'],
            description: {
                'fields': [
                    {
                        'name': '',
                        'value': 'Get your own profile picture.'
                    },
                    {
                        'name': '<user or member>',
                        'value': 'Get a user\'s profile picture.'
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
        let color = this.client.config.color;
        if (!user) {
            user = message.author;
        }
        if (message.guild) {
            color = message.guild.member(user)?.displayColor;
        }

        const url = user.displayAvatarURL({size: 1024, dynamic: true});

        const embed = new MBEmbed({
            title: `Here is ${user.username}#${user.discriminator}'s profile picture.`,
            color: color
        });

        try {
            const ext = getUrlExtension(url);

            embed
                .setImage(`attachment://${user.id}.${ext}`)
                .attachFiles(
                    [new MessageAttachment(url,
                        `${user.id}.${ext}`)]);

            return message.channel.send(embed);
        } catch (e: any) {
            tracer.console().error(this.client.options.shards, `Network failure on ${e.toString()}`);
            return message.channel.send(':timer: Request timed out for `avatar`.');
        }
    }
}
