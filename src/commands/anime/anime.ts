import {Command} from 'discord-akairo';
import {Message, MessageEmbed} from 'discord.js';
import * as anilist from '../../utils/anilist';
import {anilistRequest, createSelectionEmbed} from '../../utils/anilist';
import {parseAired, parseColor} from '../../utils/anime';
import * as helpers from '../../utils/helpers';
import {MBEmbed} from '../../utils/messageGenerator';
import {collectSelection, sendSelectionEmojis} from '../../utils/selection';

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

    /**
     * Create anime embed
     * @param anime
     * @return {MessageEmbed}
     */
    createAnimeEmbed(anime: any): MessageEmbed {
        return new MBEmbed({
            title: anime.title.userPreferred,
            url: anime.siteUrl,
            color: parseColor(anime.coverImage.color, this.client.config.color)
        })
            .setThumbnail(anime.coverImage.extraLarge)
            .setDescription(he.decode((anime.description ? anime.description : 'No description.').replace(/(<([^>]+)>)/g, '')))
            .setImage(anime.bannerImage)
            .addFields(
                {name: 'Type', value: anilist.mapFormats(anime.format), inline: true},
                {name: 'Episodes', value: anime.episodes ? anime.episodes.toString() : 'Unknown', inline: true},
                {
                    name: 'Status',
                    value: helpers.capitalize(anime.status.split('_').join(' ').toLowerCase()),
                    inline: true
                },
                {
                    name: 'Aired', value: parseAired(anime), inline: false
                },
                {name: 'Genres', value: anime.genres.length != 0 ? anime.genres.join(', ') : 'Unknown', inline: false},
                {
                    name: 'Studios', value: (() => {
                        const studiosArr = anime.studios.edges
                            .filter((studio: { node: { isAnimationStudio: boolean; }; }) => studio.node.isAnimationStudio)
                            .map((studio: { node: { name: string; }; }) => studio.node.name);
                        return studiosArr.length != 0 ? studiosArr.join(', ') : 'Unknown';
                    })(), inline: true
                },
                {
                    name: 'Source',
                    value: anilist.mapFormats(anime.source),
                    inline: true
                },
                {name: 'Score', value: anime.averageScore ? `${anime.averageScore}/100` : 'Unknown', inline: true},
                {
                    name: 'MAL Link',
                    value: anime.idMal ? `https://myanimelist.net/anime/${anime.idMal}` : 'Unknown',
                    inline: false
                }
            );
    }

    async exec(message: Message, {query}: { query: string }) {
        try {
            const resp = await anilistRequest(
                anilist.anilistAnimeSearchQuery(query, 5),
                this.client.config.defaultTimeout
            );

            const animes = resp.data.data.Page.media;

            // if results are empty
            if (animes.length == 0) {
                return message.channel.send(':thinking: We cannot find the anime you are looking for.');
            }

            const selectionEmbed = createSelectionEmbed('Anime', animes, query);
            const msg = await message.channel.send(selectionEmbed);

            sendSelectionEmojis(msg, animes.length);

            try {
                const reaction = await collectSelection(
                    message,
                    msg,
                    animes.length,
                    this.client.config.selectionTimeout
                );

                if (typeof reaction === 'undefined') {
                    console.log('ERROR', 'anime', 'Weird emoji ERROR');
                    return message.channel.send(':thinking: Huh, that\'s really weird. We got invalid emoji.');
                }

                const embed = this.createAnimeEmbed(animes[helpers.getValueFromEmoji(reaction.emoji.toString()) - 1]);

                return message.channel.send(embed);
            } catch (e) {
                return message.channel.send(':timer: Failed to get a response for `anime`.');
            } finally {
                await msg.delete();
            }
        } catch (e) {
            console.log('ERROR', 'anime', `Network failure on ${e.toString()}`);
            return message.channel.send(':timer: Request timed out for `anime`.');
        }
    }
}