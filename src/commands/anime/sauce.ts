import {Command} from 'discord-akairo';
import {Message} from 'discord.js';
import axios from 'axios';
import * as helpers from '../../utils/helpers';
import {MBEmbed} from '../../utils/messageGenerator';

export default class SauceCommand extends Command {
    constructor() {
        super('sauce', {
            aliases: ['sauce', 'identify', 'find'],
            description: {
                'fields': [
                    {
                        'name': '<url or attachment>',
                        'value': 'Determine where an image is from.\n' +
                            '**Note**: Works with anime screenshots and artwork.\n' +
                            'Best used on uncropped images.'
                    }
                ]
            },
            clientPermissions: ['SEND_MESSAGES'],
            cooldown: 15000,
            ratelimit: 3,
            typing: true,
            args: [
                {
                    id: 'url',
                    match: 'content',
                    type: 'url'
                }
            ]
        });
    }

    async exec(message: Message, {url}: { url: string }) {
        if (!url && message.attachments.size == 0) {
            return await message.channel.send('Please provide an url or an attachment.');
        }
        if (!url) {
            url = message.attachments.first()!.url;
        }
        axios({
            url: `https://saucenao.com/search.php?db=999&api_key=${process.env.SAUCENAO_TOKEN}&output_type=2&numres=1&url=${encodeURIComponent(url)}`,
            timeout: this.client.config.defaultTimeout,
            method: 'get'
        }).then(resp => {
            if (resp.data.header.status < 0) {
                return message.channel.send('There\'s an issue with processing your image.');
            }
            if (resp.data.results.length == 0) {
                return message.channel.send('There are no possible matches to your image.');
            }
            const result = resp.data.results[0];
            const embed = new MBEmbed({
                title: `Here's the sauce, ${message.author.username}#${message.author.discriminator}.`
            })
                .setThumbnail(result.header.thumbnail)
                .addField('Similarity', `${result.header.similarity}%`, false);
            for (const key in result.data) {
                // Hand picked blacklist
                if (['ext_urls', 'est_time', 'pawoo_user_acct'].includes(key) || key.endsWith('id')) {
                    continue;
                }
                embed.addField(key.split('_').map(el => helpers.capitalize(el)).join(' '), result.data[key] ? result.data[key] : 'Unknown', true);
            }
            embed.addField('Link', result.data.ext_urls[0], false);
            return message.channel.send(embed);
        }).catch(err => {
            console.log('ERROR', 'sauce', `Network failure on ${err}`);
            return message.channel.send(':timer: Request failed or timed out for `sauce`.');
        });
    }
}
