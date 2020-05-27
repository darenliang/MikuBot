import {Command} from 'discord-akairo';
import {Message, MessageReaction} from 'discord.js';
import {Client} from '../../bot';
import axios from 'axios';
import * as helpers from '../../utils/helpers';
import {MBEmbed} from '../../utils/messageGenerator';

const he = require('he');

export default class TriviaCommand extends Command {
    constructor() {
        super('trivia', {
            aliases: ['trivia'],
            description: {
                'fields': [
                    {
                        'name': '',
                        'value': 'Start an anime trivia question.\n' +
                            '**Note**: After one minute, the trivia question times out.'
                    }
                ]
            },
            cooldown: 10000,
            ratelimit: 2
        });
    }

    async exec(message: Message) {
        const client = this.client as Client;
        axios({
            url: 'https://opentdb.com/api.php?amount=1&category=31&type=multiple',
            timeout: client.config.defaultTimeout,
            method: 'get'
        }).then(resp => {
            const question = resp.data.results[0];
            const answers: string[] = question.incorrect_answers;
            answers.push(question.correct_answer);
            helpers.shuffleArr(answers);
            const embed = new MBEmbed({
                title: 'Anime Trivia'
            }).setDescription(`${he.decode(question.question)}\n\n:one: ${he.decode(answers[0])}\n:two: ${he.decode(answers[1])}\n:three: ${he.decode(answers[2])}\n:four: ${he.decode(answers[3])}`);
            message.channel.send(embed).then((msg) => {
                [...Array(5)].reduce((p: Promise<MessageReaction>, _, i) =>
                    p.then(_ => msg.react(helpers.getEmojiNumber(i + 1))).catch(_ => _), Promise.resolve());

                const embed = new MBEmbed({
                    title: 'Timed out',
                    color: 16635957
                }).addField('Answer', he.decode(question.correct_answer), true);

                msg.awaitReactions((reaction, user) => {
                    const idx = helpers.getValueFromEmoji(reaction.emoji.name);
                    return 1 <= idx && idx <= 5 && user.id == message.author.id;
                }, {
                    max: 1,
                    time: 60000,
                    errors: ['time']
                }).then(collected => {
                    const reaction = collected.first();
                    if (typeof reaction === 'undefined') {
                        console.log('ERROR', 'anime', 'Weird emoji ERROR');
                        return message.channel.send(':thinking: Huh, that\s really weird. We got invalid emoji.');
                    }
                    if (question.correct_answer == answers[helpers.getValueFromEmoji(reaction.emoji.toString()) - 1]) {
                        embed.author!.name = 'Correct';
                        embed.color = 5025616;
                    } else {
                        embed.author!.name = 'Incorrect';
                        embed.color = 16007990;
                    }
                    return message.channel.send(embed);
                }).catch(_ => {
                    return message.channel.send(embed);
                }).finally(() => {
                    return msg.delete();
                });
            });
        }).catch(err => {
            console.log('ERROR', 'trivia', `Network failure on ${err}`);
            return message.channel.send(':timer: Request timed out for `trivia`.');
        });
    }
}