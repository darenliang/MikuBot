import {Command} from 'discord-akairo';
import {Message, MessageAttachment, TextChannel} from 'discord.js';
import {MBEmbed} from '../../utils/messageGenerator';

export default class CatgirlCommand extends Command {
    constructor() {
        super('catgirl', {
            aliases: ['catgirl'],
            description: {
                'fields': [
                    {
                        'name': '',
                        'value': 'NSFW command.\nGet some tasty catgirls.'
                    }
                ]
            },
            clientPermissions: ['SEND_MESSAGES'],
        });
    }

    async exec(message: Message) {
        // NSFW filter
        if (message.guild && !(message.channel as TextChannel).nsfw) {
            return message.channel.send(`The catgirl command can only be used in a NSFW channel.`);
        }

        const fileName = this.client.catgirlDataset[Math.floor(Math.random() * this.client.catgirlDataset.length)];
        const ext = fileName.split('.').pop();
        const embed = new MBEmbed({
            title: 'Here\'s your catgirl.'
        })
            .setImage(`attachment://catgirl.${ext}`)
            .attachFiles(
                [new MessageAttachment(`mount/catgirl/${fileName}`,
                    `catgirl.${ext}`)]);
        return message.channel.send(embed);
    }
}
