import {Command} from 'discord-akairo';
import {Message, MessageEmbed, User} from 'discord.js';
import {Client} from '../../bot';
import * as helpers from '../../utils/helpers';

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
            }
        });
    }

    async exec(message: Message) {
        const client = this.client as Client;
        const embed = new MessageEmbed()
            .setColor(client.config.color)
            .setTitle(`${client.config.name} ${client.config.version}`)
            .setDescription('(づ｡◕‿‿◕｡)づ Made with :heart:.')
            .addField('Links',
                `[Invite Bot](https://discord.com/oauth2/authorize?client_id=${client.user?.id}&scope=bot)
                [Help Page](${client.config.helpWebsite})
                [Support Server](${client.config.supportServer})
                [GitHub Repository](https://github.com/${client.config.githubRepo})
                [Donate Link](https://www.paypal.me/DarenLiang)`, true)
            .addField(message.guild ? 'Server Prefix' : 'DM Prefix', client.prefixDatabase.getPrefix(message.guild), true)
            .addField('Created by', await client.fetchApplication().then(application => {
                const owner = application.owner as User;
                return `${owner.username}#${owner.discriminator}`;
            }))
            .addField('Latency', `${client.ws.ping}ms`, true)
            .addField('Servers', client.guilds.cache.size, true)
            .addField('Users', client.guilds.cache.reduce((sum, guild) => sum + guild.members.cache.size, 0), true)
            .addField('Memory Usage', `${(process.memoryUsage().rss / 1048576) | 0}MiB`, true)
            .addField('Platform', process.platform, true)
            .addField('Uptime', `${helpers.msToTime(client.uptime!)}`, true);
        return await message.channel.send(embed);
    }
}