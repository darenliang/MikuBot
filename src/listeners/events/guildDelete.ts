import {Listener} from 'discord-akairo';
import {Guild} from 'discord.js';
import tracer from 'tracer';

export default class GuildDeleteListener extends Listener {
    constructor() {
        super('guildDelete', {
            emitter: 'client',
            event: 'guildDelete'
        });
    }

    async exec(guild: Guild) {
        this.client.prefixDatabase.removeGuild(guild);
        tracer.console().info(this.client.options.shards, `Removed ${guild.name} - ${guild.id}`);
    }
}