import {Command} from 'discord-akairo';
import {Message, TextChannel, Util} from 'discord.js';
import {Client, MusicQueue} from '../../bot';
import ytdl, {videoInfo} from 'ytdl-core';

// Taken from https://github.com/iCrawl/discord-music-bot
export default class PlayCommand extends Command {
    constructor() {
        super('play', {
            aliases: ['play', 'add'],
            description: {
                'fields': [
                    {
                        'name': '<url or song name>',
                        'value': 'Add song from YouTube to queue and play music.'
                    }
                ]
            },
            channel: 'guild',
            cooldown: 5000,
            typing: true,
            clientPermissions: ['CONNECT', 'SPEAK'],
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
        const client = this.client as Client;
        const {channel} = message.member!.voice;
        if (!channel) return message.channel.send('You need to be in a voice channel to play music.');
        const serverQueue = client.musicQueue.get(message.guild!.id);
        if (serverQueue && serverQueue.songs.length >= 100) {
            return message.channel.send('You can only queue a maximum of 100 songs at this moment.');
        }
        let songInfo: videoInfo;
        try {
            songInfo = await ytdl.getInfo(query.replace(/<(.+)>/g, '$1'));
        } catch {
            return message.channel.send('Cannot find the song you are looking for.');
        }
        const song = {
            id: songInfo.video_id,
            title: Util.escapeMarkdown(songInfo.title),
            url: songInfo.video_url
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
            volume: 2,
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
            const dispatcher = queue!.connection!.play(ytdl(song.url))
                .on('finish', () => {
                    queue!.songs.shift();
                    play(queue!.songs[0]);
                })
                .on('error', error => console.error('ERROR', 'play', error));
            dispatcher.setVolumeLogarithmic(queue!.volume / 5);
            await queue!.textChannel.send(`Playing: **${song.title}**`);
        };

        try {
            queueConstruct.connection = await channel.join();
            await play(queueConstruct.songs[0]);
        } catch (error) {
            console.error('ERROR', 'play', error);
            client.musicQueue.delete(message.guild!.id);
            channel.leave();
            return message.channel.send('Cannot join voice channel');
        }
    }
}