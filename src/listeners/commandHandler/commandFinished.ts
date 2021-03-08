import axios from 'axios';
import {Command, Listener} from 'discord-akairo';
import {Message} from 'discord.js';
import tracer from 'tracer';

export default class CommandFinishedListener extends Listener {
    constructor() {
        super('commandFinished', {
            emitter: 'commandHandler',
            event: 'commandFinished'
        });
    }

    async exec(_: Message, _command: Command) {
        try {
            await axios.get(`https://counter.darenliang.com/hit/mikubot`, {
                timeout: this.client.config.defaultTimeout
            });
        } catch (e) {
            tracer.console().warn(this.client.options.shards, `Failed hit: ${e}`);
        }
    }
}