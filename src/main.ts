import {ShardingManager} from 'discord.js';
import Topgg from 'topgg-autoposter';

const manager = new ShardingManager('dist/bot.js');

manager.on('shardCreate', shard => console.log(`Launched shard ${shard.id}`));

if (process.env.PRODUCTION == 'true') {
    Topgg(process.env.DBL_TOKEN!, manager);
}

manager.spawn();