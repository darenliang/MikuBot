import {Listener, Command} from 'discord-akairo';
import {Message} from 'discord.js';

export default class CommandBlockedListener extends Listener {
    constructor() {
        super('commandBlocked', {
            emitter: 'commandHandler',
            event: 'commandBlocked'
        });
    }

    async exec(message: Message, command: Command, reason: string) {
        console.log('INFO', 'commandBlocked', command.id);
        switch (reason) {
            case 'guild':
                return await message.channel
                    .send(`:octagonal_sign: The \`${command.id}\` command is blocked in private messages.`)
                    .catch(err => console.log('ERROR', 'commandBlocked', 'Failed to send message: ' + err));
        }
        return;
    }
}