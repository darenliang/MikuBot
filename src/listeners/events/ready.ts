import {Listener} from 'discord-akairo';
import {Client} from '../../bot';

export default class ReadyListener extends Listener {
    constructor() {
        super('ready', {
            emitter: 'client',
            event: 'ready'
        });
    }

    async exec() {
        let client = this.client as Client;

        for (const guild of client.guilds.cache.array()) {
            if (!client.prefixDatabase.checkGuild(guild)) {
                client.prefixDatabase.createGuild(guild);
                console.log('INFO', 'ready', `Added ${guild.name} - ${guild.id}`);
            }
        }

        console.log('INFO', 'ready', `${client.config.name} ${client.config.version}`);
        console.log('INFO', 'ready', `Serving ${client.guilds.cache.size} servers`);
    }
}