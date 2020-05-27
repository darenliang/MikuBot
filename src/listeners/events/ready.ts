import {Listener} from 'discord-akairo';
import {Client} from '../../bot';
import DBL from 'dblapi.js'

export default class ReadyListener extends Listener {
    constructor() {
        super('ready', {
            emitter: 'client',
            event: 'ready'
        });
    }

    async exec() {
        let client = this.client as Client;

        // Set every minute
        setInterval(() => {
            client.user!.setPresence({activity: {name: `@${client.config.name} help`}, status: 'online'})
        }, 60000);

        for (const guild of client.guilds.cache.array()) {
            if (!client.prefixDatabase.checkGuild(guild)) {
                client.prefixDatabase.createGuild(guild);
                console.log('INFO', 'ready', `Added ${guild.name} - ${guild.id}`);
            }
        }

        if (process.env.PRODUCTION == "true") {
            const dbl = new DBL(process.env.DBL_TOKEN!, client);

            setInterval(() => {
                dbl.postStats(client.guilds.cache.size);
            }, 1800000);
        }

        console.log('INFO', 'ready', `${client.config.name} ${client.config.version}`);
        console.log('INFO', 'ready', `Serving ${client.guilds.cache.size} servers`);
    }
}