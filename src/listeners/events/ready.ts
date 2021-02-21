import * as Topgg from '@top-gg/sdk';
import {Listener} from 'discord-akairo';
import tracer from 'tracer';
// @ts-ignore
import secrets from '../../../mount/secrets.json';

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
                tracer.console().info(this.client.options.shards, `Added ${guild.name} - ${guild.id}`);
            }
        }

        if (secrets.production) {
            const api = new Topgg.Api(secrets.dblToken);

            const postAndGetStats = () => {
                api.postStats({
                    serverCount: this.client.guilds.cache.size,
                    shardId: this.client.options.shards as number,
                    shardCount: this.client.options.shardCount
                }).catch(_ => {
                    tracer.console().error(this.client.options.shards, 'Failed to post stats');
                });

                api.getStats(this.client.user!.id).then(bot => {
                    if (bot.serverCount != null) {
                        this.client.guildCount = bot.serverCount;
                    } else {
                        this.client.guildCount = 0;
                    }
                }).catch(_ => {
                    tracer.console().error(this.client.options.shards, 'Failed to get stats');
                });
            };

            postAndGetStats();
            setInterval(() => {
                postAndGetStats();
            }, 1800000);
        }

        tracer.console().info(this.client.options.shards, `${this.client.config.name} ${this.client.config.version}`);
        tracer.console().info(this.client.options.shards, `Serving ${this.client.guilds.cache.size} servers`);
    }
}