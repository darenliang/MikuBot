import {Listener} from 'discord-akairo';
import DBL from 'dblapi.js';

export default class ReadyListener extends Listener {
    constructor() {
        super('ready', {
            emitter: 'client',
            event: 'ready'
        });
    }

    async exec() {
        const setPresence = () => {
            this.client.user!.setPresence({activity: {name: `@${this.client.config.name} help`}, status: 'online'});
        };

        // Set every minute
        setPresence();
        setInterval(() => {
            setPresence();
        }, 60000);

        for (const guild of this.client.guilds.cache.array()) {
            if (!this.client.prefixDatabase.checkGuild(guild)) {
                this.client.prefixDatabase.createGuild(guild);
                console.log('INFO', 'ready', `Added ${guild.name} - ${guild.id}`);
            }
        }

        if (process.env.PRODUCTION == 'true') {
            const dbl = new DBL(process.env.DBL_TOKEN!, this.client);

            const postAndGetStats = () => {
                dbl.postStats(
                    this.client.guilds.cache.size,
                    this.client.options.shards as number,
                    this.client.options.shardCount);

                dbl.getStats(this.client.user!.id).then(bot => {
                    this.client.guildCount = bot.server_count;
                });
            };

            postAndGetStats();
            setInterval(() => {
                postAndGetStats();
            }, 1800000);
        }

        console.log('INFO', 'ready', `${this.client.config.name} ${this.client.config.version}`);
        console.log('INFO', 'ready', `Serving ${this.client.guilds.cache.size} servers`);
    }
}