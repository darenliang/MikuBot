import {Command} from 'discord-akairo';
import {Message, MessageEmbed} from 'discord.js';
import * as anilist from '../../utils/anilist';
import {anilistRequest, createSelectionEmbed} from '../../utils/anilist';
import {parseAired, parseColor} from '../../utils/anime';
import * as helpers from '../../utils/helpers';
import {MBEmbed} from '../../utils/messageGenerator';
import {collectSelection, sendSelectionEmojis} from '../../utils/selection';
import tracer from 'tracer';

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
            clientPermissions: ['SEND_MESSAGES'],
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

    /**
     * Create manga embed
     * @param manga
     * @return {MessageEmbed}
     */
    createMangaEmbed(manga: any): MessageEmbed {
        return new MBEmbed({
            title: manga.title.userPreferred,
            url: manga.siteUrl,
            color: parseColor(manga.coverImage.color, this.client.config.color)
        })
            .setThumbnail(manga.coverImage.extraLarge)
            .setDescription(he.decode((manga.description ? manga.description : 'No description.').replace(/(<([^>]+)>)/g, '')))
            .setImage(manga.bannerImage)
            .addFields(
                {name: 'Type', value: anilist.mapFormats(manga.format), inline: true},
                {name: 'Volumes', value: manga.volumes ? manga.volumes.toString() : 'Unknown', inline: true},
                {
                    name: 'Status',
                    value: helpers.capitalize(manga.status.split('_').join(' ').toLowerCase()),
                    inline: true
                },
                {name: 'Published', value: parseAired(manga), inline: false},
                {name: 'Genres', value: manga.genres.length != 0 ? manga.genres.join(', ') : 'Unknown', inline: false},
                {
                    name: 'Staff', value: (() => {
                        const staffArr: Array<any> = manga.staff.edges
                            .map((staff: { node: { name: { full: string; }; }; }) => staff.node.name.full);
                        return staffArr.length != 0 ? staffArr.join(', ') : 'Unknown';
                    })(), inline: true
                },
                {
                    name: 'Source',
                    value: anilist.mapFormats(manga.source),
                    inline: true
                },
                {name: 'Score', value: manga.averageScore ? `${manga.averageScore}/100` : 'Unknown', inline: true},
                {
                    name: 'MAL Link',
                    value: manga.idMal ? `https://myanimelist.net/manga/${manga.idMal}` : 'Unknown',
                    inline: false
                }
            );
    }

    async exec(message: Message, {query}: { query: string }) {
        try {
            const resp = await anilistRequest(
                anilist.anilistMangaSearchQuery(query, 5),
                this.client.config.defaultTimeout
            );

            const mangas = resp.data.data.Page.media;

            // if results are empty
            if (mangas.length == 0) {
                return message.channel.send(':thinking: Sorry, manga not found.');
            }

            const selectionEmbed = createSelectionEmbed('Manga', mangas, query);
            const msg = await message.channel.send(selectionEmbed);

            sendSelectionEmojis(msg, mangas.length);

            try {
                const reaction = await collectSelection(
                    message,
                    msg,
                    mangas.length,
                    this.client.config.selectionTimeout
                );

                if (typeof reaction === 'undefined') {
                    tracer.console().error(this.client.options.shards, 'Undefined reaction');
                    return message.channel.send(':thinking: Huh, that\'s really weird. We got invalid emoji.');
                }

                const embed = this.createMangaEmbed(mangas[helpers.getValueFromEmoji(reaction.emoji.toString()) - 1]);

                return message.channel.send(embed);
            } catch (e) {
                return message.channel.send(':timer: Failed to get a response for `manga`.');
            } finally {
                await msg.delete();
            }
        } catch (e: any) {
            tracer.console().error(this.client.options.shards, `Network failure on ${e.toString()}`);
            return message.channel.send(':timer: Request timed out for `manga`.');
        }
    }
}
