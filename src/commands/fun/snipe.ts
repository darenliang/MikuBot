import {Command} from 'discord-akairo';
import {Message, MessageEmbed} from 'discord.js';

export default class EightBallCommand extends Command {
    constructor() {
        super('snipe', {
            aliases: ['snipe'],
            description: {
                'fields': [
                    {
                        'name': '',
                        'value': 'Snipe a deleted message'
                    }
                ]
            },
            clientPermissions: ['SEND_MESSAGES'],
        });
    }

    async exec(message: Message) {
        const deletedMessage = this.client.deleteCache.get(message.channel.id);
        if (deletedMessage === undefined) {
            return await message.channel.send('There is nothing to snipe.');
        }

        let color = this.client.config.color;
        if (deletedMessage.guild) {
            color = deletedMessage.guild.member(deletedMessage.author)?.displayColor;
        }

        const embed = new MessageEmbed()
            .setColor(color)
            .setAuthor(deletedMessage.author.username, deletedMessage.author.displayAvatarURL())
            .setTimestamp(deletedMessage.createdTimestamp);

        if (deletedMessage.content) {
            embed.setDescription(deletedMessage.content);
        }

        if (deletedMessage.attachments.size > 0) {
            const url = deletedMessage.attachments.first()!.proxyURL;
            embed.setImage(url);
            embed.addField('Attachment', url);
        }

        return await message.channel.send(embed);
    }
}