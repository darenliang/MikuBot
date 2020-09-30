import {Command} from 'discord-akairo';
import {Message, MessageReaction} from 'discord.js';
import axios from 'axios';
import * as anilist from '../../utils/anilist';
import * as helpers from '../../utils/helpers';
import moment from 'moment';
import {MBEmbed} from '../../utils/messageGenerator';

const he = require('he');

export default class AnimeCommand extends Command {
    constructor() {
        super('anime', {
            aliases: ['anime'],
            description: {
                'fields': [
                    {
                        'name': '<anime name>',
                        'value': `Get anime information.`
                    }
                ]
            },
            clientPermissions: ['SEND_MESSAGES'],
            cooldown: 15000,
            ratelimit: 2,
            args: [
                {
                    id: 'query',
                    match: 'content',
                    type: 'string',
                    prompt: {
                        start: (message: Message) => `${message.author.username}, you did not enter an anime. Please enter an anime to continue or type \`cancel\` to cancel.`,
                        timeout: ':timer: Waiting too long, aborting `anime` command.',
                        cancel: ':no_entry_sign: Cancelled `anime` command.'
                    }
                }
            ]
        });
    }

    async exec(message: Message, {query}: { query: string }) {
        axios({
            url: 'https://graphql.anilist.co',
            timeout: this.client.config.defaultTimeout,
            method: 'post',
            data: anilist.anilistAnimeSearchQuery(query, 5)
        }).then(resp => {
            if (resp.data.data.Page.media.length == 0) return message.channel.send(':thinking: We cannot find the anime you are looking for.');
            const selection = new MBEmbed({
                title: `Anime search results for ${query.substring(0, 30)}${query.length > 30 ? '...' : ''}`
            }).setDescription('');
            const animes = resp.data.data.Page.media;
            for (const [idx, anime] of animes.entries()) {
                selection.description += `${helpers.getEmojiNumber(idx + 1)} ${anime.title.userPreferred}\n`;
            }
            message.channel.send(selection).then((msg) => {
                [...Array(animes.length)].reduce((p: Promise<MessageReaction>, _, i) =>
                    p.then(_ => msg.react(helpers.getEmojiNumber(i + 1))).catch(_ => _), Promise.resolve());
                msg.awaitReactions((reaction, user) => {
                    const idx = helpers.getValueFromEmoji(reaction.emoji.name);
                    return 1 <= idx && idx <= animes.length && user.id == message.author.id;
                }, {
                    max: 1,
                    time: 60000,
                    errors: ['time']
                }).then(collected => {
                    const reaction = collected.first();
                    if (typeof reaction === 'undefined') {
                        console.log('ERROR', 'anime', 'Weird emoji ERROR');
                        return message.channel.send(':thinking: Huh, that\'s really weird. We got invalid emoji.');
                    }
                    const anime = animes[helpers.getValueFromEmoji(reaction.emoji.toString()) - 1];
                    const episodes = anime.episodes ? anime.episodes.toString() : 'Unknown';
                    let aired: string;
                    if (!anime.startDate.day) {
                        aired = 'Unknown';
                    } else {
                        aired = moment(new Date(anime.startDate.year, anime.startDate.month - 1, anime.startDate.day)).format('MMM D, YYYY');
                        if (anime.endDate.day) aired += ' to ' + moment(new Date(anime.endDate.year, anime.endDate.month - 1, anime.endDate.day)).format('MMM D, YYYY');
                    }
                    const genres = anime.genres.length != 0 ? anime.genres.join(', ') : 'Unknown';
                    const studiosArr: Array<any> = anime.studios.edges
                        .filter((studio: { node: { isAnimationStudio: boolean; }; }) => studio.node.isAnimationStudio)
                        .map((studio: { node: { name: string; }; }) => studio.node.name);
                    const studios = studiosArr.length != 0 ? studiosArr.join(', ') : 'Unknown';
                    const score = anime.averageScore ? `${anime.averageScore}/100` : 'Unknown';
                    const color = anime.coverImage.color ? parseInt(anime.coverImage.color.slice(1), 16) : this.client.config.color;
                    const malLink = anime.idMal ? `https://myanimelist.net/anime/${anime.idMal}` : 'Unknown';
                    const embed = new MBEmbed({
                        title: anime.title.userPreferred,
                        url: anime.siteUrl,
                        color: color
                    })
                        .setThumbnail(anime.coverImage.extraLarge)
                        .setDescription(he.decode(anime.description.replace(/(<([^>]+)>)/g, '')))
                        .setImage(anime.bannerImage)
                        .addFields(
                            {name: 'Type', value: anilist.mapFormats(anime.format), inline: true},
                            {name: 'Episodes', value: episodes, inline: true},
                            {
                                name: 'Status',
                                value: helpers.capitalize(anime.status.split('_').join(' ').toLowerCase()),
                                inline: true
                            },
                            {name: 'Aired', value: aired, inline: false},
                            {name: 'Genres', value: genres, inline: false},
                            {name: 'Studios', value: studios, inline: true},
                            {
                                name: 'Source',
                                value: anilist.mapFormats(anime.source),
                                inline: true
                            },
                            {name: 'Score', value: score, inline: true},
                            {name: 'MAL Link', value: malLink, inline: false}
                        );
                    return message.channel.send(embed);
                }).catch(_ => {
                    return message.channel.send(':timer: Failed to get a response for `anime`.');
                }).finally(() => {
                    return msg.delete();
                });
            });
        }).catch(err => {
            console.log('ERROR', 'anime', `Network failure on ${JSON.stringify(err)}`);
            return message.channel.send(':timer: Request timed out for `anime`.');
        });
    }
}