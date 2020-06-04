import {Command} from 'discord-akairo';
import {Message, MessageAttachment} from 'discord.js';
import {MBEmbed} from '../../utils/messageGenerator';

export default class CatgirlCommand extends Command {
    constructor() {
        super('catgirl', {
            aliases: ['catgirl'],
            description: {
                'fields': [
                    {
                        'name': '',
                        'value': 'Get tasty catgirl.'
                    }
                ]
            },
            typing: true
        });
    }

    async exec(message: Message) {
        const fileName = this.client.catgirlDataset[Math.floor(Math.random() * this.client.catgirlDataset.length)];
        const ext = fileName.split('.').pop();
        const embed = new MBEmbed({
            title: 'Here\'s your catgirl.'
        })
            .setImage(`attachment://catgirl.${ext}`)
            .attachFiles(
                [new MessageAttachment(`https://gitlab.com/darenliang/cg/-/raw/master/data/${fileName}`,
                    `catgirl.${ext}`)]);
        return message.channel
            .send(embed)
            .catch(err => console.log('ERROR', 'catgirl', 'Failed to send message: ' + err));
    }
}