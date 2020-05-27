import {Listener, Command} from 'discord-akairo';
import {Message} from 'discord.js';

export default class CommandFinishedListener extends Listener {
    constructor() {
        super('commandFinished', {
            emitter: 'commandHandler',
            event: 'commandFinished'
        });
    }

    // TODO add counter metrics
    async exec(_: Message, _command: Command) {
        // console.log('INFO', 'commandFinished', command.id);
    }
}