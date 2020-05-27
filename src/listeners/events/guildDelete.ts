import {Listener} from 'discord-akairo';
import {Guild} from 'discord.js';
import {Client} from '../../bot';

export default class GuildDeleteListener extends Listener {
    constructor() {
        super('guildDelete', {
            emitter: 'client',
            event: 'guildDelete'
        });
    }

    async exec(guild: Guild) {
        let client = this.client as Client;
        client.prefixDatabase.removeGuild(guild);
        console.log('INFO', 'guildDelete', `Removed ${guild.name} - ${guild.id}`);
    }
}