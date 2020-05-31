import {Command} from 'discord-akairo';
import {Message} from 'discord.js';
import * as helpers from '../../utils/helpers';
import {MBEmbed} from '../../utils/messageGenerator';

export default class LeaderboardCommand extends Command {
    constructor() {
        super('leaderboard', {
            aliases: ['leaderboard', 'lb'],
            description: {
                'fields': [
                    {
                        'name': '',
                        'value': 'Display your own music quiz score.'
                    },
                    {
                        'name': 'server <optional page number>',
                        'value': 'Display the anime music quiz leaderboard from the respective server.\n' +
                            'Alias: `s <optional page number>`'
                    },
                    {
                        'name': 'global <optional page number>',
                        'value': 'Displays the global anime music quiz leaderboard.\n' +
                            'Alias: `g <optional page number>`'
                    }
                ]
            },
            cooldown: 5000,
            args: [
                {
                    id: 'local',
                    match: 'flag',
                    flag: ['server', 's']
                },
                {
                    id: 'global',
                    match: 'flag',
                    flag: ['global', 'g']
                },
                {
                    id: 'page',
                    type: 'integer',
                    default: 1
                }
            ]
        });
    }

    async exec(message: Message, {local, global, page}: { local: boolean, global: boolean, page: number }) {
        const scores = this.client.musicQuizDatabase.getScores();
        if (page < 1) return await message.channel.send('Please enter a positive integer as the page number.');
        if (local && !message.guild) return await message.channel.send('The local leaderboard is only available in servers.');
        if (local) {
            const embed = new MBEmbed({
                title: `Music Quiz Leaderboard for ${message.guild?.name}`
            }).setDescription('```\nRank |  Score | User\n');
            const memberIDs = new Set();
            for (const member of message.guild!.members.cache.values()) {
                memberIDs.add(member.id);
            }
            let sortedScores: [string, number][] = [];
            for (const key in scores) {
                if (memberIDs.has(key)) {
                    sortedScores.push([key, scores[key].musicScore]);
                }
            }
            if (sortedScores.length == 0) return await message.channel.send('There are no music score entries yet for this server.');
            embed.setFooter(`Page ${page} | Total entries for this server: ${sortedScores.length}`);
            sortedScores.sort((a, b) => b[1] - a[1]);
            const selectedScores = sortedScores.slice((page - 1) * 10, page * 10);
            if (selectedScores.length == 0) return await message.channel.send(`Your page number is too large. The last page number is ${Math.ceil(sortedScores.length / 10)}.`);
            for (const [idx, score] of selectedScores.entries()) {
                const user = await message.guild!.members.fetch(score[0])
                embed.description += `${helpers.pad('    ', (idx + 1 + ((page - 1)) * 10).toString(), true)} | ${helpers.pad('      ', (score[1] * 100).toString(), true)} | ${user.user.username}#${user.user.discriminator}\n`;
            }
            embed.description += '```'
            return await message.channel.send(embed);
        } else if (global) {
            const embed = new MBEmbed({
                title: 'Global Music Quiz Leaderboard'
            }).setDescription('```\nRank |  Score | User\n');
            let sortedScores: [string, number][] = [];
            for (const key in scores) {
                sortedScores.push([key, scores[key].musicScore]);
            }
            if (sortedScores.length == 0) return await message.channel.send('There are no music score entries yet.');
            embed.setFooter(`Page ${page} | Total entries: ${sortedScores.length}`);
            sortedScores.sort((a, b) => b[1] - a[1]);
            const selectedScores = sortedScores.slice((page - 1) * 10, page * 10);
            if (selectedScores.length == 0) return await message.channel.send(`Your page number is too large. The last page number is ${Math.ceil(sortedScores.length / 10)}.`);
            for (const [idx, score] of selectedScores.entries()) {
                const user = await this.client.users.fetch(score[0])
                embed.description += `${helpers.pad('    ', (idx + 1 + ((page - 1)) * 10).toString(), true)} | ${helpers.pad('      ', (score[1] * 100).toString(), true)} | ${user.username}#${user.discriminator}\n`;
            }
            embed.description += '```'
            return await message.channel.send(embed);
        } else {
            const score = this.client.musicQuizDatabase.getScore(message.author);
            const globalRank = Object.values(scores)
                .map(s => s.musicScore).reduce((a, c) => a + ((c > score.musicScore) ? 1 : 0), 0) + 1;
            const embed = new MBEmbed({
                title: `${message.author.username}#${message.author.discriminator}'s Music Score`,
                color: message.member ? message.member.displayColor : undefined
            })
                .addField('Score', score.musicScore * 100, true)
                .addField('Global Rank', helpers.ordinalSuffixOf(globalRank), true);
            if (message.guild) {
                const memberIDs = new Set();
                for (const member of message.guild!.members.cache.values()) {
                    memberIDs.add(member.id);
                }
                let accumulator = 1;
                for (const key in scores) {
                    if (memberIDs.has(key) && scores[key].musicScore > score.musicScore) {
                        accumulator++;
                    }
                }
                embed.addField('Server Rank', helpers.ordinalSuffixOf(accumulator), true);
            }
            return await message.channel.send(embed);
        }
    }
}