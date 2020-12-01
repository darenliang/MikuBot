import {Command} from 'discord-akairo';
import {Message, MessageReaction} from 'discord.js';
import * as helpers from '../../utils/helpers';
import {MBEmbed} from '../../utils/messageGenerator';

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
            clientPermissions: ['SEND_MESSAGES'],
            cooldown: 10000,
            ratelimit: 2
        });
    }

    async exec(message: Message) {
        const question = this.client.triviaDataset[Math.floor(Math.random() * this.client.triviaDataset.length)];
        const answers: string[] = question.incorrect_answers;
        answers.push(question.correct_answer);
        helpers.shuffleArr(answers);
        const embed = new MBEmbed({
            title: 'Anime Trivia'
        }).setDescription(`${decodeURIComponent(question.question)}\n\n:one: ${decodeURIComponent(answers[0])}\n:two: ${decodeURIComponent(answers[1])}\n:three: ${decodeURIComponent(answers[2])}\n:four: ${decodeURIComponent(answers[3])}`);
        const msg = await message.channel.send(embed);

        [...Array(4)].reduce((p: Promise<MessageReaction>, _, i) =>
            p.then(_ => msg.react(helpers.getEmojiNumber(i + 1))).catch(_ => _), Promise.resolve());

        const answerEmbed = new MBEmbed({
            title: 'Timed out',
            color: 16635957
        }).addField('Answer', decodeURIComponent(question.correct_answer), true);

        try {
            const collected = await msg.awaitReactions((reaction, user) => {
                const idx = helpers.getValueFromEmoji(reaction.emoji.name);
                return 1 <= idx && idx <= 4 && user.id == message.author.id;
            }, {
                max: 1,
                time: 60000,
                errors: ['time']
            });
            const reaction = collected.first();
            if (typeof reaction === 'undefined') {
                console.log('ERROR', 'anime', 'Weird emoji ERROR');
                return message.channel.send(':thinking: Huh, that\'s really weird. We got invalid emoji.');
            }
            if (question.correct_answer == answers[helpers.getValueFromEmoji(reaction.emoji.toString()) - 1]) {
                answerEmbed.author!.name = 'Correct';
                answerEmbed.color = 5025616;
            } else {
                answerEmbed.author!.name = 'Incorrect';
                answerEmbed.color = 16007990;
            }
            return message.channel.send(answerEmbed);
        } catch (e) {
            console.log('ERROR', 'anime', `Error occurred: ${e.toString()}`);
            return message.channel.send('An error has occurred for `trivia`.');
        } finally {
            await msg.delete();
        }
    }
}