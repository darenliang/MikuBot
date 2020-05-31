import {Listener} from 'discord-akairo';
import {Guild} from 'discord.js';

export default class GuildDeleteListener extends Listener {
    constructor() {
        super('guildDelete', {
            emitter: 'client',
            event: 'guildDelete'
        });
    }

    async exec(guild: Guild) {
        this.client.prefixDatabase.removeGuild(guild);
        console.log('INFO', 'guildDelete', `Removed ${guild.name} - ${guild.id}`);
    }
}