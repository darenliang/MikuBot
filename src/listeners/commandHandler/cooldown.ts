import {Listener, Command} from 'discord-akairo';
import {Message} from 'discord.js';

export default class CooldownListener extends Listener {
    constructor() {
        super('cooldown', {
            emitter: 'commandHandler',
            event: 'cooldown'
        });
    }

    async exec(message: Message, command: Command, remaining: number) {
        console.log('INFO', 'cooldown', `${command.id}:${remaining}ms`);
        return await message.channel.send(`:timer: You must wait another ${(remaining / 1000).toFixed(2)} seconds before using the \`${command.id}\` command.`);
    }
}