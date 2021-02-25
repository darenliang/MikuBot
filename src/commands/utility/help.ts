import {Command} from 'discord-akairo';
import {Message} from 'discord.js';
import tracer from 'tracer';
import * as helpers from '../../utils/helpers';
import {MBEmbed} from '../../utils/messageGenerator';

export default class HelpCommand extends Command {
    constructor() {
        super('help', {
            aliases: ['help', 'h', 'commands', 'cmds'],
            description: {
                'fields': [
                    {
                        'name': '',
                        'value': 'Get list of commands and a link to the comprehensive help website.'
                    },
                    {
                        'name': '<command>',
                        'value': 'Get help for a specific command.'
                    }
                ]
            },
            clientPermissions: ['SEND_MESSAGES'],
            args: [
                {
                    id: 'commandAlias',
                    type: 'commandAlias'
                }
            ]
        });
    }

    async exec(message: Message, {commandAlias}: { commandAlias: Command }) {
        let helpEmbed: any;
        if (!commandAlias) {
            const embed = new MBEmbed({
                title: 'Command List',
                url: this.client.config.helpWebsite
            }).setDescription(`To get the current prefix use \`@${this.client.config.name} prefix\`.\nTo get help for a specific command use \`@${this.client.config.name} help <command>\`.\n\n[Help Website](${this.client.config.helpWebsite})`);
            for (const category of this.handler.categories.values()) {
                embed.addField(helpers.capitalize(category.id), `\`\`\`\n${category.map(command => command.id).join(', ')}\n\`\`\``);
            }
            helpEmbed = embed;
        } else {
            const embed = JSON.parse(JSON.stringify(commandAlias.description));
            embed.author = {
                name: `${commandAlias.id}`,
                url: `${this.client.config.helpWebsite}/#/?id=${commandAlias.id}`
            };
            embed.color = this.client.config.color;
            embed.description = '';
            if (commandAlias.aliases.length > 1) embed.description += `Aliases: ${commandAlias.aliases.slice(1).map(alias => `\`${alias}\``).join(', ')}\n`;
            if (commandAlias.channel) embed.description += `Channel: \`${commandAlias.channel}\`\n`;
            if (commandAlias.userPermissions) embed.description += `Permissions: \`${helpers.perms(commandAlias.userPermissions as string[])}\`\n`;
            embed.description += `Ratelimit: \`${commandAlias.ratelimit} every ${((commandAlias.cooldown || this.handler.defaultCooldown) / 1000) | 0}s\`\n`;
            for (const field of embed.fields) {
                if (!field.name.startsWith('?')) {
                    field.name = `${commandAlias.id} ${field.name}`;
                } else {
                    field.name = field.name.substring(1);
                }
            }
            helpEmbed = {embed};
        }

        // Send to author
        try {
            await message.author.send(helpEmbed);

            if (message.guild) {
                await message.channel.send(`<@${message.author.id}>, please check your private messages.`);
            }

            return;
        } catch (e) {
            tracer.console().info(this.client.options.shards, 'Sending to author: ' + e);
        }

        // Send in channel if it is the only way
        try {
            await message.channel.send(helpEmbed);
        } catch (e) {
            tracer.console().error(this.client.options.shards, 'Sending in channel: ' + e);
        }
    }
}
