import {Command} from 'discord-akairo';
import {Message} from 'discord.js';

export default class PrefixCommand extends Command {
    constructor() {
        super('prefix', {
            aliases: ['prefix'],
            description: {
                'fields': [
                    {
                        'name': '',
                        'value': 'Get prefix for server or private messages.'
                    },
                    {
                        'name': '<prefix>',
                        'value': 'To set a new prefix for a server.\n' +
                            '**Note:** you must have the `manage guild` permission.'
                    }
                ]
            },
            clientPermissions: ['SEND_MESSAGES'],
            cooldown: 10000,
            ratelimit: 2,
            args: [
                {
                    id: 'prefix',
                    type: 'string',
                    match: 'content'
                }
            ]
        });
    }

    async exec(message: Message, {prefix}: { prefix: string }) {
        if (!prefix) return await message.channel.send(`The current${message.guild ? ' server' : ''} prefix is: \`${this.client.prefixDatabase.getPrefix(message.guild)}\``);
        if (!message.guild) return await message.channel.send(`Cannot set prefix in private messages.`);
        if (!message.member!.hasPermission('MANAGE_GUILD')) return await message.channel.send(`You must have the \`manage guild\` permission to set prefix.`);
        if (!this.client.prefixDatabase.updateGuild(message.guild, prefix)) {
            console.log('ERROR', 'prefix', 'Failed to set prefix');
            return await message.channel.send(`Failed to set prefix to ${prefix}`);
        }
        return await message.channel.send(`The prefix has been set to ${prefix}`);
    }
}