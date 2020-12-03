import {Message, MessageReaction} from 'discord.js';
import * as helpers from '../utils/helpers';

/**
 * Send selection emojis
 * @param {Message} msg: Message to add reactions to
 * @param {number} num: Number of messages
 */
export function sendSelectionEmojis(msg: Message, num: number) {
    [...Array(num)].reduce((p: Promise<MessageReaction>, _, i) =>
        p.then(_ => msg.react(helpers.getEmojiNumber(i + 1))).catch(_ => _), Promise.resolve());
}

/**
 * Collection selection
 * @param {Message} message: Original message
 * @param {Message} selectionMessage: Selection message
 * @param {number} num: Number of messages
 * @param {number} timeout: Timeout for selection
 * @return {Promise<MessageReaction | undefined>}
 */
export async function collectSelection(
    message: Message,
    selectionMessage: Message,
    num: number,
    timeout: number
): Promise<MessageReaction | undefined> {
    const collected = await selectionMessage.awaitReactions((reaction, user) => {
        const idx = helpers.getValueFromEmoji(reaction.emoji.name);
        return 1 <= idx && idx <= num && user.id == message.author.id;
    }, {
        max: 1,
        time: timeout,
        errors: ['time']
    });
    return collected.first();
}