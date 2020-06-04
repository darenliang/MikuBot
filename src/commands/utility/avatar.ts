import {Command} from 'discord-akairo';
import {Message, User} from 'discord.js';
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
        const embed = new MBEmbed({
            title: `Here is ${user.username}#${user.discriminator}'s profile picture.`,
            color: color
        }).setImage(user.displayAvatarURL({size: 4096, dynamic: true}));
        return await message.channel
            .send(embed)
            .catch(err => console.log('ERROR', 'avatar', 'Failed to send message: ' + err));
    }
}