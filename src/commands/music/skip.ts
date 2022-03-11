import {Command} from 'discord-akairo';
import {Message} from 'discord.js';
import tracer from 'tracer';
import {playArbitraryFFmpeg} from '../../utils/musicPlay';

export default class SkipCommand extends Command {
    constructor() {
        super('skip', {
            aliases: ['skip', 'next', 'pass'],
            description: {
                'fields': [
                    {
                        'name': '',
                        'value': 'Skip music.'
                    }
                ]
            },
            clientPermissions: ['SEND_MESSAGES'],
            channel: 'guild'
        });
    }

    async exec(message: Message) {
        const {channel} = message.member!.voice;
        if (!channel) return message.channel.send('You have to be in the same voice channel to skip music.');
        const serverQueue = this.client.musicQueue.get(message.guild!.id);
        if (!serverQueue) return message.channel.send('There is nothing playing.');
        if (serverQueue.connection && serverQueue.connection.dispatcher) {
            serverQueue.connection.dispatcher.destroy();
            await message.channel.send('Skipping music.');

            // TODO: this is gross; reuse this part of code with play in play.ts
            const play = async (song: { url: string; title: any; }) => {
                if (!song) {
                    serverQueue.connection!.disconnect();
                    this.client.musicQueue.delete(message.guild!.id);
                    return;
                }

                const arrFFmpegParams = [
                    '-i', song.url
                ];

                const {child, dispatcher} = playArbitraryFFmpeg(
                    serverQueue.connection!,
                    arrFFmpegParams,
                    {
                        bitrate: 'auto',
                        volume: false,
                        filter: 'audioonly',
                        highWaterMark: 1 << 25
                    }
                );
                dispatcher.on('finish', () => {
                    serverQueue.songs.shift();
                    play(serverQueue.songs[0]);
                }).on('error', error => {
                    tracer.console().error(this.client.options.shards, error);
                    try {
                        child.kill();
                    } catch (e) {
                        tracer.console().error(this.client.options.shards, e);
                    }
                });

                dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
                await serverQueue.textChannel.send(`Playing: **${song.title}**`);
            };

            try {
                serverQueue.songs.shift();
                await play(serverQueue.songs[0]);
            } catch (error) {
                tracer.console().error(this.client.options.shards, error);
                this.client.musicQueue.delete(message.guild!.id);
                channel.leave();
                return message.channel.send('Failed to skip.');
            }
        }
        return;
    }
}
