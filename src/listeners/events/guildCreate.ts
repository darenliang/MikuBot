import {Listener} from 'discord-akairo';
import {Guild, TextChannel} from 'discord.js';
import {Client} from '../../bot';

export default class GuildCreateListener extends Listener {
    constructor() {
        super('guildCreate', {
            emitter: 'client',
            event: 'guildCreate'
        });
    }

    async exec(guild: Guild) {
        let client = this.client as Client;
        client.prefixDatabase.createGuild(guild);
        console.log('INFO', 'guildCreate', `Added ${guild.name} - ${guild.id}`);

        const embed = {
            'title': `:tada: Thanks for inviting ${client.config.name}!`,
            'description': `You can always mention the bot @${client.config.name} to invoke commands. Anyways, here some few things you can do to get started.`,
            'color': client.config.color,
            'thumbnail': {
                'url': client.user?.displayAvatarURL()
            },
            'fields': [
                {
                    'name': `${client.config.defaultPrefix}help`,
                    'value': 'Returns the current prefix and directs you to the help website.'
                },
                {
                    'name': `${client.config.defaultPrefix}prefix <prefix>`,
                    'value': 'If you have manage guild privileges you can change the prefix.'
                },
                {
                    'name': `${client.config.defaultPrefix}musicquiz`,
                    'value': 'Play an anime music quiz!'
                },
                {
                    'name': `${client.config.defaultPrefix}sauce <url or attachment>`,
                    'value': 'Figure out where an image is from.'
                },
                {
                    'name': `${client.config.defaultPrefix}catgirl`,
                    'value': 'Get the tastiest catgirls!'
                },
                {
                    'name': `${client.config.defaultPrefix}waifu`,
                    'value': 'Get a never before seen waifu!'
                },
                {
                    'name': `${client.config.defaultPrefix}gif <url or attachment>`,
                    'value': 'Save your best gifs!'
                },
                {
                    'name': 'And much much more!',
                    'value': `Visit [MikuBot Documentation](${client.config.helpWebsite}) for a list of all the commands.`
                }
            ]
        };

        if (guild.systemChannel && guild.systemChannel.permissionsFor(guild.me!)!.has("SEND_MESSAGES")) {
            return await guild.systemChannel.send({embed})
        } else {
            const defaultChannel = guild.channels.cache.find(channel => channel.type == "text" && channel.permissionsFor(guild.me!)!.has("SEND_MESSAGES"));
            if (defaultChannel) return await (defaultChannel as TextChannel).send({embed});
        }
    }
}