import {ShardingManager} from 'discord.js';
import tracer from 'tracer';
// @ts-ignore
import secrets from '../mount/secrets.json';

const manager = new ShardingManager('dist/bot.js', {
    totalShards: 'auto',
    token: secrets.discordToken
});

manager.on('shardCreate', shard => {
    tracer.console().info([shard.id], 'Launched shard');
});

const spawn = () => {
    manager.spawn().catch(e => {
        tracer.console().error('[manager]', 'Failed to spawn: ' + e);
        tracer.console().info('[manager]', 'Retrying to spawn shards');
        spawn();
    });
};

spawn();
