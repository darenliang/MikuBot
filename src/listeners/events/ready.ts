import {Listener} from 'discord-akairo';
import * as Topgg from '@top-gg/sdk';

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
            const api = new Topgg.Api(process.env.DBL_TOKEN!);

            const postAndGetStats = () => {
                api.postStats({
                    serverCount: this.client.guilds.cache.size,
                    shardId: this.client.options.shards as number,
                    shardCount: this.client.options.shardCount
                }).catch(_ => console.log('ERROR', 'ready', 'Failed to post stats'));

                api.getStats(this.client.user!.id).then(bot => {
                    if (bot.serverCount != null) {
                        this.client.guildCount = bot.serverCount;
                    } else {
                        this.client.guildCount = 0;
                    }
                }).catch(_ => console.log('ERROR', 'ready', 'Failed to get stats'));
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