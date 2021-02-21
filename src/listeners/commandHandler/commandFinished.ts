import {Command, Listener} from 'discord-akairo';
import {Message} from 'discord.js';
import tracer from 'tracer';

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
            .catch((e: any) => tracer.console().warn(this.client.options.shards, `Failed hit: ${e}`));
    }
}