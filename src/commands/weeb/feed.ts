import {Command} from 'discord-akairo';
import {Message, MessageAttachment, User} from 'discord.js';
import {MBEmbed} from '../../utils/messageGenerator';
import {nekolife} from '../../utils/nekolife';

export default class FeedCommand extends Command {
    constructor() {
        super('feed', {
            aliases: ['feed', 'food', 'eat'],
            description: {
                'fields': [
                    {
                        'name': '',
                        'value': 'Get a random feed.'
                    },
                    {
                        'name': '<user>',
                        'value': 'Feed user.'
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
        nekolife('feed')
            .then(resp => {
                const ext = resp.data.url.split('.').pop();
                const embed = new MBEmbed({
                    title: user ? `${message.author.username} feeds ${user.username}` : ':yum: Food. Yummy...'
                })
                    .setImage(`attachment://feed.${ext}`)
                    .attachFiles(
                        [new MessageAttachment(resp.data.url,
                            `feed.${ext}`)]);
                return message.channel.send(embed);
            })
            .catch(err => {
                console.log('ERROR', 'feed', `Network failure on ${err}`);
                return message.channel.send(':timer: Request timed out for `feed`.');
            });
    }
}