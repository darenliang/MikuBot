import {Command} from 'discord-akairo';
import {Message} from 'discord.js';
import {Client} from '../../bot';
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
            args: [
                {
                    id: 'commandAlias',
                    type: 'commandAlias'
                }
            ]
        });
    }

    async exec(message: Message, {commandAlias}: { commandAlias: Command }) {
        const client = this.client as Client;
        if (!commandAlias) {
            const embed = new MBEmbed({
                title: 'Command List',
                url: client.config.helpWebsite
            }).setDescription(`To get the current prefix use \`prefix\`.\nTo get help for a specific command use \`help <command>\`.`);
            for (const category of this.handler.categories.values()) {
                embed.addField(helpers.capitalize(category.id), `\`\`\`\n${category.map(command => command.id).join(', ')}\n\`\`\``);
            }
            await message.author.send(embed);
        } else {
            const embed = JSON.parse(JSON.stringify(commandAlias.description));
            embed.author = {
                name: `${commandAlias.id}`,
                url: `${client.config.helpWebsite}/#/?id=${commandAlias.id}`
            };
            embed.color = client.config.color;
            embed.description = '';
            if (commandAlias.aliases.length > 1) embed.description += `Aliases: ${commandAlias.aliases.slice(1).map(alias => `\`${alias}\``).join(', ')}\n`;
            if (commandAlias.channel) embed.description += `Channel: \`${commandAlias.channel}\`\n`;
            if (commandAlias.userPermissions) embed.description += `Permissions: \`${helpers.perms(commandAlias.userPermissions as string[])}\`\n`;
            embed.description += `Ratelimit: \`${commandAlias.ratelimit} every ${((commandAlias.cooldown || this.handler.defaultCooldown) / 1000) | 0}s\`\n`;
            for (const field of embed.fields) {
                field.name = `${commandAlias.id} ${field.name}`;
            }
            await message.author.send({embed});
        }
        if (message.guild) await message.channel.send(`​${message.author.username}, please check your private messages.`);
    }
}