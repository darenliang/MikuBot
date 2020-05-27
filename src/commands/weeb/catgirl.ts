import {Command} from 'discord-akairo';
import {Message, MessageAttachment} from 'discord.js';
import {Client} from '../../bot';
import axios from 'axios';
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
            cooldown: 3000,
            typing: true
        });
    }

    async exec(message: Message) {
        const client = this.client as Client;
        axios({
            url: `https://danbooru.donmai.us/posts.json?login=${process.env.DANBOORU_USERNAME}&api_key=${process.env.DANBOORU_TOKEN}&random=true&limit=20&tags=${encodeURIComponent('cat_girl score:>=35 rating:safe')}`,
            timeout: client.config.defaultTimeout,
            method: 'get'
        }).then(resp => {
            let url = '';
            for (const result of resp.data) {
                if (result.hasOwnProperty('large_file_url')
                    && (result.large_file_url.endsWith('.jpg')
                        || result.large_file_url.endsWith('.png')
                        || result.large_file_url.endsWith('gif'))) {
                    url = result.large_file_url;
                }
            }
            if (!url) return message.channel.send('Sorry, failed to get tasty catgirl.');
            const ext = url.split('.').pop();
            const embed = new MBEmbed({
                title: 'Here\'s your catgirl.'
            })
                .setImage(`attachment://catgirl.${ext}`)
                .attachFiles(
                    [new MessageAttachment(url,
                        `catgirl.${ext}`)]);
            return message.channel.send(embed);
        }).catch(err => {
            console.log('ERROR', 'catgirl', `Network failure on ${err}`);
            return message.channel.send(':timer: Request timed out for `catgirl`.');
        });
    }
}