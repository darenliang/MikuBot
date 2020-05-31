import {Command} from 'discord-akairo';
import {Message} from 'discord.js';
import {MBEmbed} from '../../utils/messageGenerator';

export default class PingCommand extends Command {
    constructor() {
        super('ping', {
            aliases: ['ping'],
            description: {
                'fields': [
                    {
                        'name': '',
                        'value': 'Pings bot.'
                    }
                ]
            }
        });
    }

    async exec(message: Message) {
        const embed = new MBEmbed({
            title: `MikuBot is ${this.client.ws.status == 0 ? 'operational' : 'nonoperational'}`
        })
            .setDescription(':ping_pong: Pong!')
            .addField('Websocket Latency', `${this.client.ws.ping}ms`, false)
            .addField('Websocket Gateway', this.client.ws.gateway ? this.client.ws.gateway : 'Unknown', false);

        if (this.client.ws.status == 0) {
            embed.setColor(5025616);
        } else {
            embed.setColor(16007990);
        }

        return await message.channel.send(embed);
    }
}