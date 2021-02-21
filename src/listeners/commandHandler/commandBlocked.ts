import {Command, Listener} from 'discord-akairo';
import {Message} from 'discord.js';
import tracer from 'tracer';

export default class CommandBlockedListener extends Listener {
    constructor() {
        super('commandBlocked', {
            emitter: 'commandHandler',
            event: 'commandBlocked'
        });
    }

    async exec(message: Message, command: Command, reason: string) {
        tracer.console().info(this.client.options.shards, command.id);
        switch (reason) {
            case 'guild':
                return await message.channel.send(`:octagonal_sign: The \`${command.id}\` command is blocked in private messages.`);
        }
        return;
    }
}