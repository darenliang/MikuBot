import {Command} from 'discord-akairo';
import {Message} from 'discord.js';

export default class EightBallCommand extends Command {
    constructor() {
        super('8ball', {
            aliases: ['8ball', '8b', 'eightball'],
            description: {
                'fields': [
                    {
                        'name': '<question>',
                        'value': 'Get a response.\n' +
                            '**Note**: You most provide a message ending with `?` in order to get a response.'
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
            .send('Please provide a question.')
            .catch(err => console.log('ERROR', '8ball', 'Failed to send message: ' + err));
        if (!msg.endsWith('?')) return await message.channel
            .send('Are you sure that you are asking a question?')
            .catch(err => console.log('ERROR', '8ball', 'Failed to send message: ' + err));

        const responses = ['It is certain.', 'It is decidedly so.', 'Without a doubt.', 'Yes - definitely.',
            'You may rely on it.', 'As I see it, yes.', 'Most likely.', 'Outlook good.',
            'Yes.', 'Signs point to yes.', 'Reply hazy, try again.', 'Ask again later.',
            'Better not tell you now.', 'Cannot predict now.', 'Concentrate and ask again.',
            'Don\'t count on it.', 'My reply is no.', 'My sources say no.', 'Outlook not so good.',
            'Very doubtful.'];

        return await message.channel
            .send(responses[Math.floor(Math.random() * responses.length)])
            .catch(err => console.log('ERROR', '8ball', 'Failed to send message: ' + err));
    }
}