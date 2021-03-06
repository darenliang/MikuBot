import {Command} from 'discord-akairo';
import {Message, TextChannel} from 'discord.js';
import {MusicQueue} from '../../struct/client';

const youtubedl = require('youtube-dl');

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
        const {channel} = message.member!.voice;
        if (!channel) return message.channel.send('You need to be in a voice channel to play music.');
        const serverQueue = client.musicQueue.get(message.guild!.id);
        if (serverQueue && serverQueue.songs.length >= 100) {
            return message.channel.send('You can only queue a maximum of 100 songs at this moment.');
        }

        youtubedl.getInfo(query, [], async function (err: any, info: any) {
            if (err) {
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
                    queue!.voiceChannel.leave();
                    client.musicQueue.delete(message.guild!.id);
                    return;
                }
                // Delay audio for 1 second to improve stream smoothness
                const dispatcher = queue!.connection!.play(song.url, {highWaterMark: 50})
                    .on('finish', () => {
                        queue!.songs.shift();
                        play(queue!.songs[0]);
                    })
                    .on('error', error => console.log('ERROR', 'play', error));
                dispatcher.setVolumeLogarithmic(queue!.volume / 5);
                await queue!.textChannel.send(`Playing: **${song.title}**`);
            };

            try {
                queueConstruct.connection = await channel.join();
                await play(queueConstruct.songs[0]);
            } catch (error) {
                console.log('ERROR', 'play', error);
                client.musicQueue.delete(message.guild!.id);
                channel.leave();
                return message.channel.send('Cannot join voice channel');
            }
        });
    }
}