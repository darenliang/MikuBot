import {Command} from 'discord-akairo';
import {Message} from 'discord.js';

export default class OwofyCommand extends Command {
    constructor() {
        super('owofy', {
            aliases: ['owofy', 'owo'],
            description: {
                'fields': [
                    {
                        'name': '<message>',
                        'value': `Owofy a message :flushed: `
                    }
                ]
            },
            args: [
                {
                    id: 'msg',
                    match: 'content',
                    type: 'string'
                }
            ]
        });
    }

    async exec(message: Message, {msg}: { msg: string }) {
        if (!msg) return await message.channel
            .send('Please provide a message to owofy.')
            .catch(err => console.log('ERROR', 'owofy', 'Failed to send message: ' + err));

        return await message.channel
            .send(
                msg.replace(/(?:l|r)/g, 'w')
                    .replace(/(?:L|R)/g, 'W')
                    .replace(/n([aeiou])/g, 'ny$1')
                    .replace(/N([aeiou])/g, 'Ny$1')
                    .replace(/N([AEIOU])/g, 'Ny$1')
                    .replace(/ove/g, 'uv'))
            .catch(err => console.log('ERROR', 'owofy', 'Failed to send message: ' + err));
    }
}