import {Listener} from 'discord-akairo';
import DBL from 'dblapi.js'

export default class ReadyListener extends Listener {
    constructor() {
        super('ready', {
            emitter: 'client',
            event: 'ready'
        });
    }

    async exec() {
        // Set every minute
        setInterval(() => {
            this.client.user!.setPresence({activity: {name: `@${this.client.config.name} help`}, status: 'online'})
        }, 60000);

        for (const guild of this.client.guilds.cache.array()) {
            if (!this.client.prefixDatabase.checkGuild(guild)) {
                this.client.prefixDatabase.createGuild(guild);
                console.log('INFO', 'ready', `Added ${guild.name} - ${guild.id}`);
            }
        }

        if (process.env.PRODUCTION == "true") {
            const dbl = new DBL(process.env.DBL_TOKEN!, this.client);

            setInterval(() => {
                dbl.postStats(this.client.guilds.cache.size);
            }, 1800000);
        }

        console.log('INFO', 'ready', `${this.client.config.name} ${this.client.config.version}`);
        console.log('INFO', 'ready', `Serving ${this.client.guilds.cache.size} servers`);
    }
}