import {exec} from 'child_process';
import {Command} from 'discord-akairo';
import {Message, TextChannel} from 'discord.js';
import tracer from 'tracer';
import * as util from 'util';
import {MusicQueue} from '../../struct/client';
import {playArbitraryFFmpeg} from '../../utils/musicPlay';

export default class PlayCommand extends Command {
    constructor() {
        super('play', {
            aliases: ['play', 'add'],
            description: {
                'fields': [
                    {
                        'name': '<url or song name>',
                        'value': 'Add song to queue and play music.'
                    }
                ]
            },
            channel: 'guild',
            cooldown: 10000,
            ratelimit: 3,
            typing: true,
            clientPermissions: ['CONNECT', 'SPEAK', 'SEND_MESSAGES'],
            args: [
                {
                    id: 'query',
                    match: 'content',
                    type: 'string'
                }
            ]
        });
    }

    async exec(message: Message, {query}: { query: string }) {
        const client = this.client;
        if (!query) return await message.channel.send('Query is empty.');
        const {channel} = message.member!.voice;
        if (!channel) return message.channel.send('You need to be in a voice channel to play music.');
        const serverQueue = client.musicQueue.get(message.guild!.id);
        if (serverQueue && serverQueue.songs.length >= 100) {
            return message.channel.send('You can only queue a maximum of 100 songs at this moment.');
        }

        let info;
        try {
            // Favor audio extraction and increase output buffer to 10MB
            const {stdout} = await util.promisify(exec)(
                `yt-dlp --dump-json --default-search="auto" --extract-audio --no-playlist ${JSON.stringify(query)}`,
                {maxBuffer: 1024 * 1024 * 10}
            );
            info = JSON.parse(stdout);
        } catch (e) {
            tracer.console().warn(client.options.shards, e);
            return message.channel.send('Cannot find the song you are looking for.');
        }

        const song = {
            title: info.title,
            url: info.url,
            thumbnail: info.thumbnail
        };

        if (serverQueue) {
            serverQueue.songs.push(song);
            return message.channel.send(`**${song.title}** has been added to the queue.`);
        }
        const queueConstruct: MusicQueue = {
            textChannel: message.channel as TextChannel,
            voiceChannel: channel,
            connection: null,
            songs: [],
            volume: 5,
            playing: true
        };

        client.musicQueue.set(message.guild!.id, queueConstruct);
        queueConstruct.songs.push(song);

        const play = async (song: { url: string; title: any; }) => {
            const queue = client.musicQueue.get(message.guild!.id);
            if (!song) {
                queue!.connection!.disconnect();
                client.musicQueue.delete(message.guild!.id);
                return;
            }

            const arrFFmpegParams = [
                '-i', song.url
            ];

            const {child, dispatcher} = playArbitraryFFmpeg(
                queue!.connection!,
                arrFFmpegParams,
                {
                    bitrate: 'auto',
                    volume: false,
                    filter: 'audioonly',
                    highWaterMark: 1 << 25
                }
            );
            dispatcher.on('finish', () => {
                queue!.songs.shift();
                play(queue!.songs[0]);
            }).on('error', error => {
                tracer.console().error(client.options.shards, error);
                try {
                    child.kill();
                } catch (e) {
                    tracer.console().error(client.options.shards, e);
                }
            });

            dispatcher.setVolumeLogarithmic(queue!.volume / 5);
            await queue!.textChannel.send(`Playing: **${song.title}**`);
        };

        try {
            queueConstruct.connection = await channel.join();
            await play(queueConstruct.songs[0]);
        } catch (error) {
            tracer.console().error(client.options.shards, error);
            client.musicQueue.delete(message.guild!.id);
            channel.leave();
            return message.channel.send('Cannot join voice channel');
        }
    }
}
