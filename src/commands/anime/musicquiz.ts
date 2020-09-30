import {Command} from 'discord-akairo';
import {Message, MessageAttachment} from 'discord.js';
import axios from 'axios';
import * as anilist from '../../utils/anilist';
import * as helpers from '../../utils/helpers';
import {MBEmbed} from '../../utils/messageGenerator';

export default class MusicQuizCommand extends Command {
    constructor() {
        super('musicquiz', {
            aliases: ['musicquiz', 'mq', 'quiz'],
            description: {
                'fields': [
                    {
                        'name': '',
                        'value': 'Start an anime music quiz.'
                    },
                    {
                        'name': '<guess>',
                        'value': `Guess anime.`
                    },
                    {
                        'name': 'hint',
                        'value': `Get hints.`
                    },
                    {
                        'name': 'giveup',
                        'value': `To giveup on current quiz.`
                    }
                ]
            },
            clientPermissions: ['SEND_MESSAGES'],
            cooldown: 10000,
            ratelimit: 3,
            args: [
                {
                    id: 'guess',
                    match: 'content',
                    type: 'string'
                }
            ]
        });
    }

    async exec(message: Message, {guess}: { guess: string }) {
        if (guess) {
            const entry = this.client.musicQuizSession.load(message.channel);
            if (!entry) {
                return await message.channel.send('There is no active quiz currently in this channel.');
            }
            switch (guess) {
                case 'giveup':
                    entry.embed.author!.name = `Answer: ${entry.embed.author!.name}`;
                    entry.embed.color = 16007990;
                    this.client.musicQuizSession.delete(message.channel);
                    return await message.channel.send(entry.embed);
                case 'hint':
                    return await message.channel.send(entry.hintEmbed);
                default:
                    axios({
                        url: 'https://graphql.anilist.co',
                        timeout: this.client.config.defaultTimeout,
                        method: 'post',
                        data: anilist.anilistAnimeSearchQuery(guess, 5)
                    }).then(resp => {
                        if (resp.data.data.Page.media.length == 0) return message.channel.send('Sorry, anime not found.');
                        const answers = resp.data.data.Page.media.map((result: { title: { userPreferred: any; }; }) => result.title.userPreferred);
                        if (entry.nameCache.some(r => answers.indexOf(r) >= 0)) {
                            entry.embed.author!.name = `Correct: ${entry.embed.author!.name}`;
                            entry.embed.color = 5025616;
                            const score = this.client.musicQuizDatabase.getScore(message.author);
                            if (score.musicScore == 0 && score.totalAttempts == 0) {
                                this.client.musicQuizDatabase.createScore(message.author, {
                                    musicScore: 1,
                                    totalAttempts: 0
                                });
                            } else {
                                this.client.musicQuizDatabase.updateScore(message.author, {
                                    musicScore: score.musicScore + 1,
                                    totalAttempts: score.totalAttempts
                                });
                            }
                            this.client.musicQuizSession.delete(message.channel);
                            return message.channel.send(entry.embed);
                        } else {
                            return message.channel.send('You are incorrect. Please try again.');
                        }
                    }).catch(err => {
                        console.log('ERROR', 'musicquiz', `Network failure on ${err.toString()}`);
                        return message.channel.send('Sorry, anime not found.');
                    });
            }
        } else {
            if (this.client.musicQuizSession.load(message.channel)) {
                return await message.channel.send('You haven\'t gave an answer to the current music quiz.');
            }
            const scores = this.client.musicQuizDatabase.getScore(message.author);
            if (scores.musicScore == 0 && scores.totalAttempts == 0) {
                this.client.musicQuizDatabase.createScore(message.author, {
                    musicScore: 0,
                    totalAttempts: 1
                });
            } else {
                this.client.musicQuizDatabase.updateScore(message.author, {
                    musicScore: scores.musicScore,
                    totalAttempts: scores.totalAttempts + 1
                });
            }
            const anime = this.client.musicQuizDataset[Math.floor(Math.random() * this.client.musicQuizDataset.length)];
            axios({
                url: 'https://graphql.anilist.co',
                timeout: this.client.config.defaultTimeout,
                method: 'post',
                data: anilist.anilistAnimeSearchQuery(anime.name, 5)
            }).then(resp => {
                if (resp.data.data.Page.media.length == 0) return message.channel.send('Sorry, anime not found.');
                const results = resp.data.data.Page.media;
                const song = anime.songs[Math.floor(Math.random() * anime.songs.length)];
                const answerEmbed = new MBEmbed({
                    title: anime.name,
                    url: anime.idMal ? `https://myanimelist.net/anime/${anime.idMal}` : undefined
                })
                    .setThumbnail(results[0].coverImage.extraLarge)
                    .addField('Song', song.songname, true);

                const studiosArr: Array<any> = results[0].studios.edges
                    .filter((studio: { node: { isAnimationStudio: boolean; }; }) => studio.node.isAnimationStudio)
                    .map((studio: { node: { name: string; }; }) => studio.node.name);
                const studios = studiosArr.length != 0 ? studiosArr.join(', ') : 'Unknown';

                const hintEmbed = new MBEmbed({
                    title: 'Hints for Music Quiz',
                    color: results[0].coverImage.color ? parseInt(results[0].coverImage.color.slice(1), 16) : this.client.config.color
                })
                    .addFields(
                        {
                            name: 'Type',
                            value: anilist.mapFormats(results[0].format),
                            inline: true
                        },
                        {
                            name: 'Season',
                            value: (results[0].season && results[0].seasonYear) ? `${helpers.capitalize(results[0].season.toLowerCase())} ${results[0].seasonYear}` : 'Unknown',
                            inline: true
                        }, {
                            name: 'Genres',
                            value: results[0].genres.length != 0 ? results[0].genres.join(', ') : 'Unknown'
                        }, {
                            name: 'Studios',
                            value: studios
                        });
                this.client.musicQuizSession.store(message.channel, {
                    nameCache: results.map((result: { title: { userPreferred: any; }; }) => result.title.userPreferred),
                    embed: answerEmbed,
                    hintEmbed: hintEmbed
                });
                const prefix = this.client.prefixDatabase.getPrefix(message.guild);
                const attachment = new MessageAttachment(
                    `https://gitlab.com/darenliang/mq2/-/raw/master/data/${song.url}`,
                    Math.random().toString(36).substring(2, 15) + '.mp3');
                return message.channel.send(
                    `\`${prefix}musicquiz <guess>\` to guess anime, \`${prefix}musicquiz hint\` to get hints or \`${prefix}musicquiz giveup\` to give up.`,
                    attachment);
            }).catch(err => {
                console.log('ERROR', 'musicquiz', `Network failure on ${err.toString()}`);
                return message.channel.send('Sorry, anime not found.');
            });
        }
    }
}