import {Command, Listener} from 'discord-akairo';
import {Message} from 'discord.js';

const countapi = require('countapi-js');

export default class CommandFinishedListener extends Listener {
    constructor() {
        super('commandFinished', {
            emitter: 'commandHandler',
            event: 'commandFinished'
        });
    }

    async exec(_: Message, _command: Command) {
        countapi.hit(this.client.config.name, 'commands')
            .catch((_: any) => _);
    }
}