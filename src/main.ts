import {ShardingManager} from 'discord.js';
import tracer from 'tracer';

const manager = new ShardingManager('dist/bot.js');

manager.on('shardCreate', shard => {
    tracer.console().info(shard.id, 'Launched shard');
});
manager.spawn();