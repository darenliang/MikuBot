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

    /**
     * Bot routine
     */
    botRoutine() {
        // Set presence
        this.client.user!.setPresence({activity: {name: `@${this.client.config.name} help`}, status: 'online'});

        // Set broadcast values
        const promises = [
            this.client.shard!.fetchClientValues('guilds.cache.size'),
            this.client.shard!.broadcastEval('this.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0)'),
        ];

        Promise.all(promises)
            .then(results => {
                this.client.guildCount = results[0].reduce((acc, guildCount) => acc + guildCount, 0);
                this.client.userCount = results[1].reduce((acc, userCount) => acc + userCount, 0);
            })
            .catch(err => {
                tracer.console().error(this.client.options.shards, `Broadcast failed: ${err.toString()}`);
            });
    }

    async exec() {
        // Wait some time for other shards to startup
        setTimeout(() => {
            this.botRoutine();
        }, 60000);

        // Set every 15 minutes
        setInterval(() => {
            this.botRoutine();
        }, 900000);

        // Backfill added guilds to logs
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
            };

            // Set every 30 minutes
            postAndGetStats();
            setInterval(() => {
                postAndGetStats();
            }, 1800000);
        }

        tracer.console().info(this.client.options.shards, `${this.client.config.name} ${this.client.config.version} ready`);
        tracer.console().info(this.client.options.shards, `Serving ${this.client.guilds.cache.size} servers`);
    }
}
