import {Command} from 'discord-akairo';
import {Message, MessageAttachment} from 'discord.js';
import {MBEmbed} from '../../utils/messageGenerator';

export default class ImageCommand extends Command {
    constructor() {
        super('image', {
            aliases: ['image', 'img', 'save', 'store', 'gif'],
            description: {
                'fields': [
                    {
                        'name': '',
                        'value': 'Get a random user submitted server gif.'
                    },
                    {
                        'name': '<url or attachment>',
                        'value': 'Store a media file.\n' +
                            '**Supported types**: Most image types.'
                    },
                    {
                        'name': 'delete',
                        'value': 'Get directions on how to delete images.\n' +
                            'Alias: `d`'
                    },
                    {
                        'name': 'delete <id>',
                        'value': 'Delete image by id.\n' +
                            'Alias: `d <id>`'
                    }
                ]
            },
            channel: 'guild',
            cooldown: 5000,
            ratelimit: 3,
            typing: true,
            args: [
                {
                    id: 'url',
                    match: 'content',
                    type: 'url'
                },
                {
                    id: 'del',
                    match: 'flag',
                    flag: ['delete', 'd']
                },
                {
                    id: 'id',
                    match: 'rest',
                    type: 'string'
                }
            ]
        });
    }

    async exec(message: Message, {url, del, id}: { url: string, del: boolean, id: string }) {
        if (del) {
            if (id) {
                if (/[0-9a-zA-Z]{7}/.test(id)) {
                    this.client.gifDatabase.deleteGif(message.guild!, id)
                        .then(() => {
                            return message.channel
                                .send('Deleted image.')
                                .catch(err => console.log('ERROR', 'image', 'Failed to send message: ' + err));
                        })
                        .catch(_ => {
                            return message.channel
                                .send('Failed to delete image. Please make sure that the id you have provided is valid.')
                                .catch(err => console.log('ERROR', 'image', 'Failed to send message: ' + err));
                        });
                } else {
                    return await message.channel
                        .send('Looks like you have an invalid image id.')
                        .catch(err => console.log('ERROR', 'image', 'Failed to send message: ' + err));
                }
            } else {
                const embed = new MBEmbed({
                    title: 'Directions for deleting images'
                }).setDescription('Go to the link provided and record the image id of a given image.\n**Example**: The image id of https://imgur.com/abcdefg is `abcdefg`.\nCall the command `image delete <hash>` to delete the given image.')
                    .addField('Album Link', this.client.gifDatabase.getAlbumLink(message.guild!));
                return await message.channel
                    .send(embed)
                    .catch(err => console.log('ERROR', 'image', 'Failed to send message: ' + err));
            }
        } else {
            if (!url && message.attachments.size == 0) {
                const gif = this.client.gifDatabase.getGif(message.guild!);
                if (gif == null) {
                    const prefix = this.client.prefixDatabase.getPrefix(message.guild);
                    return await message.channel
                        .send(`There are no images on this server currently. To add images: \`${prefix}image <url or attachment>\``)
                        .catch(err => console.log('ERROR', 'image', 'Failed to send message: ' + err));
                } else {
                    const ext = gif.link.split('.').pop();
                    const embed = new MBEmbed({
                        title: `Here's an image.`
                    })
                        .setDescription(`Courtesy of <@${gif.title}>`)
                        .setImage(`attachment://image.${ext}`)
                        .attachFiles(
                            [new MessageAttachment(gif.link,
                                `image.${ext}`)]);
                    return message.channel
                        .send(embed)
                        .catch(err => console.log('ERROR', 'image', 'Failed to send message: ' + err));
                }
            } else {
                if (!url) {
                    url = message.attachments.first()!.url;
                }
                this.client.gifDatabase.createAlbum(message.guild!)
                    .then(_ => {
                        this.client.gifDatabase.uploadGif(message.guild!, message.author, url)
                            .then(() => {
                                return message.channel
                                    .send('Image uploaded.')
                                    .catch(err => console.log('ERROR', 'image', 'Failed to send message: ' + err));
                            })
                            .catch(_ => {
                                return message.channel
                                    .send('Image failed to upload. You might want to try another image.')
                                    .catch(err => console.log('ERROR', 'image', 'Failed to send message: ' + err));
                            });
                    })
                    .catch(_ => {
                        console.log('ERROR', 'image', 'Failed to create album.');
                        return message.channel
                            .send('An unexpected error has occurred.')
                            .catch(err => console.log('ERROR', 'image', 'Failed to send message: ' + err));
                    })
                ;
            }
        }
    }
}