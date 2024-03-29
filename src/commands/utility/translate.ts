import translate from '@iamtraction/google-translate';
import {Command} from 'discord-akairo';
import {Message} from 'discord.js';
import tracer from 'tracer';

export default class TranslateCommand extends Command {
    constructor() {
        super('translate', {
            aliases: ['translate', 'tr'],
            description: {
                'fields': [
                    {
                        'name': '<message>',
                        'value': 'Translate message to English.'
                    },
                    {
                        'name': 'to:<language> <message>',
                        'value': 'Translate message to specified language.'
                    },
                    {
                        'name': '?List of supported languages',
                        'value': 'Please consult [ISO-639-1/2](https://cloud.google.com/translate/docs/languages) for all the language codes.\n```\naf, am, ar, az, be, bg, bn, bs, ca, ceb, co, cs, cy, da, de, el, en, eo, es, et, eu, fa, fi, fr, fy, ga, gd, gl, gu, ha, haw, hi, hmn, hr, ht, hu, hy, id, ig, is, it, iw, ja, jw, ka, kk, km, kn, ko, ku, ky, la, lb, lo, lt, lv, ma, mg, mi, mk, ml, mn, mr, ms, mt, my, ne, nl, no, ny, pl, ps, pt, ro, ru, sd, si, sk, sl, sm, sn, so, sq, sr, st, su, sv, sw, ta, te, tg, th, tl, tr, ug, uk, ur, uz, vi, xh, yi, yo, zh-cn, zh-tw, zu\n```'
                    },
                ]
            },
            clientPermissions: ['SEND_MESSAGES'],
            cooldown: 10000,
            ratelimit: 3,
            args: [
                {
                    id: 'lang',
                    match: 'option',
                    flag: 'to:',
                    default: 'en'
                },
                {
                    id: 'msg',
                    type: 'string',
                    match: 'rest'
                }
            ]
        });
    }

    async exec(message: Message, {lang, msg}: { lang: string, msg: string }) {
        if (!msg) return await message.channel.send('Please provide a message to translate.');
        try {
            const result = await translate(msg, {
                to: lang
            });
            return await message.channel.send(result.text);
        } catch (e: any) {
            tracer.console().error(this.client.options.shards, `Cannot translate: ${e.toString()}`);
            return await message.channel.send('We cannot translate your message. Please check to make sure that you used a valid language code.');
        }
    }
}
