import {Command, Listener} from 'discord-akairo';
import {Message} from 'discord.js';
import tracer from 'tracer';

export default class CooldownListener extends Listener {
    constructor() {
        super('cooldown', {
            emitter: 'commandHandler',
            event: 'cooldown'
        });
    }

    async exec(message: Message, command: Command, remaining: number) {
        tracer.console().info(this.client.options.shards, `${command.id}:${remaining}ms`);
        return await message.channel.send(`:timer: You must wait another ${(remaining / 1000).toFixed(2)} seconds before using the \`${command.id}\` command.`);
    }
}