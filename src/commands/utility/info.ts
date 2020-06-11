import {Command} from 'discord-akairo';
import {Message, MessageEmbed, User} from 'discord.js';
import * as helpers from '../../utils/helpers';

const countapi = require('countapi-js');
const humanize = require('humanize-plus');

export default class InfoCommand extends Command {
    constructor() {
        super('info', {
            aliases: ['info', 'information'],
            description: {
                'fields': [
                    {
                        'name': '',
                        'value': 'Get info on the bot.'
                    }
                ]
            },
            clientPermissions: ['SEND_MESSAGES'],
        });
    }

    async exec(message: Message) {
        let commands = 'Unknown';
        await countapi.get(this.client.config.name, 'commands').then((res: { value: { toString: () => string; }; }) => {
            commands = humanize.intComma(res.value);
        });
        const embed = new MessageEmbed()
            .setColor(this.client.config.color)
            .setTitle(`${this.client.config.name} ${this.client.config.version}`)
            .setDescription('(づ｡◕‿‿◕｡)づ Made with :heart:.')
            .addField('Links',
                `[Invite Bot](https://discordapp.com/oauth2/authorize?client_id=${this.client.user?.id}&scope=bot&permissions=36817984)
                [Help Page](${this.client.config.helpWebsite})
                [Support Server](${this.client.config.supportServer})
                [GitHub Repository](https://github.com/${this.client.config.githubRepo})
                [Donate Link](https://www.paypal.me/DarenLiang)`, true)
            .addField(message.guild ? 'Server Prefix' : 'DM Prefix', this.client.prefixDatabase.getPrefix(message.guild), true)
            .addField('Created by', await this.client.fetchApplication().then(application => {
                const owner = application.owner as User;
                return `${owner.username}#${owner.discriminator}`;
            }))
            .addField('Commands Served', commands)
            .addField('Latency', `${this.client.ws.ping}ms`, true)
            .addField('Shard ID', this.client.options.shards, true)
            .addField('Shards', this.client.options.shardCount, true)
            .addField('Servers', this.client.guildCount, true)
            .addField('Uptime', helpers.msToTime(this.client.uptime!), true)
            .addField('Memory Usage', `${(process.memoryUsage().rss / 1048576) | 0}MiB`, true);
        return await message.channel.send(embed);
    }
}