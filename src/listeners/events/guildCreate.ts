import {Listener} from 'discord-akairo';
import {Guild, TextChannel} from 'discord.js';
import tracer from 'tracer';

export default class GuildCreateListener extends Listener {
    constructor() {
        super('guildCreate', {
            emitter: 'client',
            event: 'guildCreate'
        });
    }

    async exec(guild: Guild) {
        this.client.prefixDatabase.createGuild(guild);
        tracer.console().info(this.client.options.shards, `Added ${guild.name} - ${guild.id}`);

        const embed = {
            'title': `:tada: Thanks for inviting ${this.client.config.name}!`,
            'description': `You can always mention the bot @${this.client.config.name} to invoke commands. Anyways, here some few things you can do to get started.`,
            'color': this.client.config.color,
            'thumbnail': {
                'url': this.client.user?.displayAvatarURL()
            },
            'fields': [
                {
                    'name': `${this.client.config.defaultPrefix}help`,
                    'value': 'Returns the current prefix and directs you to the help website.'
                },
                {
                    'name': `${this.client.config.defaultPrefix}prefix <prefix>`,
                    'value': 'If you have manage guild privileges you can change the prefix.'
                },
                {
                    'name': `${this.client.config.defaultPrefix}musicquiz`,
                    'value': 'Play an anime music quiz!'
                },
                {
                    'name': `${this.client.config.defaultPrefix}sauce <url or attachment>`,
                    'value': 'Figure out where an image is from.'
                },
                {
                    'name': `${this.client.config.defaultPrefix}catgirl`,
                    'value': 'Get the tastiest catgirls!'
                },
                {
                    'name': `${this.client.config.defaultPrefix}waifu`,
                    'value': 'Get a never before seen waifu!'
                },
                {
                    'name': `${this.client.config.defaultPrefix}image <url or attachment>`,
                    'value': 'Save your best images!'
                },
                {
                    'name': 'And much much more!',
                    'value': `Visit [MikuBot Documentation](${this.client.config.helpWebsite}) for a list of all the commands.`
                }
            ]
        };

        if (guild.systemChannel && guild.systemChannel.permissionsFor(guild.me!)!.has('SEND_MESSAGES')) {
            return await guild.systemChannel.send({embed})
                .catch(err => {
                    tracer.console().error(this.client.options.shards, 'Failed to send message: ' + err);
                });
        } else {
            const defaultChannel = guild.channels.cache.find(channel => channel.type == 'text' && channel.permissionsFor(guild.me!)!.has('SEND_MESSAGES'));
            if (defaultChannel) return await (defaultChannel as TextChannel).send({embed})
                .catch(err => {
                    tracer.console().error(this.client.options.shards, 'Failed to send message: ' + err);
                });
        }
    }
}
