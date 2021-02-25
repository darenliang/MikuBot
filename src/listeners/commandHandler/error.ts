import {Command, Listener} from 'discord-akairo';
import {Message, User} from 'discord.js';
import tracer from 'tracer';

export default class ErrorListener extends Listener {
    constructor() {
        super('error', {
            emitter: 'commandHandler',
            event: 'error'
        });
    }

    async exec(error: Error, message: Message, command: Command) {
        tracer.console().info(this.client.options.shards, `${command.id}:${message}:${error}`);
        return await message.channel.send(`Command ${command.id} errored out. Please contact ${await this.client.fetchApplication().then(application => {
            const owner = application.owner as User;
            return `${owner.username}#${owner.discriminator}`;
        })} if this is a recurring issue.`);
    }
}