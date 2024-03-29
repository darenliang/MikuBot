import axios from 'axios';
import {Command} from 'discord-akairo';
import {Message, MessageEmbed, User} from 'discord.js';
import tracer from 'tracer';
import * as helpers from '../../utils/helpers';

const humanize = require('humanize-plus');

export default class InfoCommand extends Command {
    constructor() {
        super('info', {
            aliases: ['info', 'information', 'stats'],
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
        try {
            const resp = await axios.get(`https://counter.darenliang.com/hit/mikubot`, {
                timeout: this.client.config.defaultTimeout
            });
            commands = humanize.intComma(resp.data.value);
        } catch (e) {
            tracer.console().warn(this.client.options.shards, `Failed hit: ${e}`);
        }
        const embed = new MessageEmbed()
            .setColor(this.client.config.color)
            .setTitle(`${this.client.config.name} ${this.client.config.version}`)
            .setDescription('Looking for maintainers and supporters!')
            .addField('Links',
                `[Invite Bot](https://discord.com/api/oauth2/authorize?client_id=${this.client.user?.id}&permissions=8&scope=bot)
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
            .addField('Servers', humanize.intComma(this.client.guildCount), true)
            .addField('Users', humanize.intComma(this.client.userCount), true)
            .addField('Uptime', helpers.msToTime(this.client.uptime!), true);
        return await message.channel.send(embed);
    }
}
