import {Command} from 'discord-akairo';
import {Message, MessageReaction} from 'discord.js';
import {Client} from '../../bot';
import axios from 'axios';
import * as anilist from '../../utils/anilist';
import * as helpers from '../../utils/helpers';
import moment from 'moment';
import {MBEmbed} from '../../utils/messageGenerator';

const he = require('he');

export default class MangaCommand extends Command {
    constructor() {
        super('manga', {
            aliases: ['manga'],
            description: {
                'fields': [
                    {
                        'name': '<manga name>',
                        'value': `Get manga information.`
                    }
                ]
            },
            cooldown: 15000,
            ratelimit: 2,
            args: [
                {
                    id: 'query',
                    match: 'content',
                    type: 'string',
                    prompt: {
                        start: (message: Message) => `${message.author.username}, you did not enter an manga. Please enter an manga to continue or type \`cancel\` to cancel.`,
                        timeout: ':timer: Waiting too long, aborting `manga` command.',
                        cancel: ':no_entry_sign: Cancelled `manga` command.'
                    }
                }
            ]
        });
    }

    async exec(message: Message, {query}: { query: string }) {
        const client = this.client as Client;
        axios({
            url: 'https://graphql.anilist.co',
            timeout: client.config.defaultTimeout,
            method: 'post',
            data: anilist.anilistMangaSearchQuery(query, 5)
        }).then(resp => {
            if (resp.data.data.Page.media.length == 0) return message.channel.send(':thinking: Sorry, manga not found.');
            const selection = new MBEmbed({
                title: `Manga search results for ${query.substring(0, 30)}${query.length > 30 ? '...' : ''}`
            }).setDescription('');
            const mangas = resp.data.data.Page.media;
            for (const [idx, manga] of mangas.entries()) {
                selection.description += `${helpers.getEmojiNumber(idx + 1)} ${manga.title.userPreferred}\n`;
            }
            message.channel.send(selection).then((msg) => {
                [...Array(mangas.length)].reduce((p: Promise<MessageReaction>, _, i) =>
                    p.then(_ => msg.react(helpers.getEmojiNumber(i + 1))).catch(_ => _), Promise.resolve());
                msg.awaitReactions((reaction, user) => {
                    const idx = helpers.getValueFromEmoji(reaction.emoji.name);
                    return 1 <= idx && idx <= mangas.length && user.id == message.author.id;
                }, {
                    max: 1,
                    time: 60000,
                    errors: ['time']
                }).then(collected => {
                    const reaction = collected.first();
                    if (typeof reaction === 'undefined') {
                        console.log('ERROR', 'manga', 'Weird emoji ERROR');
                        return message.channel.send(':thinking: Huh, that\s really weird. We got invalid emoji.');
                    }
                    const manga = mangas[helpers.getValueFromEmoji(reaction.emoji.toString()) - 1];
                    const volumes = manga.volumes ? manga.volumes.toString() : 'Unknown';
                    let published: string;
                    if (!manga.startDate.day) {
                        published = 'Unknown';
                    } else {
                        published = moment(new Date(manga.startDate.year, manga.startDate.month - 1, manga.startDate.day)).format('MMM D, YYYY');
                        if (manga.endDate.day) published += ' to ' + moment(new Date(manga.endDate.year, manga.endDate.month - 1, manga.endDate.day)).format('MMM D, YYYY');
                    }
                    const genres = manga.genres.length != 0 ? manga.genres.join(', ') : 'Unknown';
                    const staffArr: Array<any> = manga.staff.edges
                        .map((staff: { node: { name: { full: string; }; }; }) => staff.node.name.full);
                    const staff = staffArr.length != 0 ? staffArr.join(', ') : 'Unknown';
                    const score = manga.averageScore ? `${manga.averageScore}/100` : 'Unknown';
                    const color = manga.coverImage.color ? parseInt(manga.coverImage.color.slice(1), 16) : client.config.color;
                    const malLink = manga.idMal ? `https://myanimelist.net/manga/${manga.idMal}` : 'Unknown';
                    const embed = new MBEmbed({
                        title: manga.title.userPreferred,
                        url: manga.siteUrl,
                        color: color
                    })
                        .setThumbnail(manga.coverImage.extraLarge)
                        .setDescription(he.decode(manga.description.replace(/(<([^>]+)>)/g, '')))
                        .setImage(manga.bannerImage)
                        .addFields(
                            {name: 'Type', value: anilist.mapFormats(manga.format), inline: true},
                            {name: 'Volumes', value: volumes, inline: true},
                            {name: 'Status', value: helpers.capitalize(manga.status.split('_').join(' ').toLowerCase()), inline: true},
                            {name: 'Published', value: published, inline: false},
                            {name: 'Genres', value: genres, inline: false},
                            {name: 'Staff', value: staff, inline: true},
                            {
                                name: 'Source',
                                value: anilist.mapFormats(manga.source),
                                inline: true
                            },
                            {name: 'Score', value: score, inline: true},
                            {name: 'MAL Link', value: malLink, inline: false}
                        );
                    return message.channel.send(embed);
                }).catch(_ => {
                    return message.channel.send(':timer: Failed to get a response for `manga`.');
                }).finally(() => {
                    return msg.delete();
                });
            });
        }).catch(err => {
            console.log('ERROR', 'manga', `Network failure on ${err}`);
            return message.channel.send(':timer: Request timed out for `manga`.');
        });
    }
}