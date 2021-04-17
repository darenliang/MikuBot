import {Command} from 'discord-akairo';
import {Message} from 'discord.js';

export default class InviteCommand extends Command {
    constructor() {
        super('invite', {
            aliases: ['invite'],
            description: {
                'fields': [
                    {
                        'name': '',
                        'value': 'Get link to invite bots.'
                    }
                ]
            },
            clientPermissions: ['SEND_MESSAGES'],
        });
    }

    async exec(message: Message) {
        return message.channel.send(`Invite link: https://discord.com/api/oauth2/authorize?client_id=${this.client.user?.id}&permissions=8&scope=bot`);
    }
}
