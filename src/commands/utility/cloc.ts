import axios from 'axios';
import {Command} from 'discord-akairo';
import {Message, MessageEmbed} from 'discord.js';
import tracer from 'tracer';

export default class ClocCommand extends Command {
    constructor() {
        super('cloc', {
            aliases: ['cloc', 'countlines'],
            description: {
                'fields': [
                    {
                        'name': '',
                        'value': `Get line count of MikuBot\'s source code.`
                    },
                    {
                        'name': '<github username/repo name>',
                        'value': 'Get line count of specified repo.\n' +
                            '**Example repo**: darenliang/MikuBot'
                    }
                ]
            },
            clientPermissions: ['SEND_MESSAGES'],
            cooldown: 10000,
            typing: true,
            args: [
                {
                    id: 'repo',
                    match: 'content',
                    type: 'string'
                }
            ]
        });
    }

    async exec(message: Message, {repo}: { repo: string }) {
        if (!repo) {
            repo = this.client.config.githubRepo;
        } else if (!/^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}\/[^\/\s]{1,100}$/.test(repo.toLowerCase())) {
            return await message.channel.send('Invalid GitHub repo. Please make sure it\'s in the form `<github username/repo name>`.');
        }
        try {
            const resp = await axios.get(`https://api.codetabs.com/v1/loc?github=${repo}`, {
                timeout: this.client.config.defaultTimeout
            });
            if (resp.data.hasOwnProperty('Error')) {
                tracer.console().warn(this.client.options.shards, 'Repo fail');
                return message.channel.send(`Failed to count lines of code in ${repo}.`);
            }
            if (resp.data.length == 0) {
                tracer.console().warn(this.client.options.shards, 'Empty repo');
                return message.channel.send(':thinking: No programming languages detected.');
            }
            const embed = new MessageEmbed()
                .setTitle(`How many lines of code in ${repo}?`)
                .setColor(this.client.config.color)
                .setURL(`https://github.com/${repo}`);
            for (const [idx, language] of resp.data.entries()) {
                if (idx == 24 || idx == resp.data.length - 1) break;
                embed.addField(language.language, language.linesOfCode, true);
            }
            const lastLanguage = resp.data[resp.data.length - 1];
            embed.addField(lastLanguage.language, lastLanguage.linesOfCode);
            return message.channel.send(embed);
        } catch (e) {
            tracer.console().error(this.client.options.shards, e);
            return message.channel.send(`Failed to count lines of code in ${repo}.`);
        }
    }
}
