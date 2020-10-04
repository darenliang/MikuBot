import {Command, Listener} from 'discord-akairo';
import {Message} from 'discord.js';
import * as helpers from '../../utils/helpers';

export default class MissingPermissionsListener extends Listener {
    constructor() {
        super('missingPermissions', {
            emitter: 'commandHandler',
            event: 'missingPermissions'
        });
    }

    async exec(message: Message, command: Command, type: string, missing: string[]) {
        console.log('INFO', 'missingPermissions', command.id);
        const permStr = helpers.perms(missing);
        switch (type) {
            case 'client':
                return await message.channel.send(`:octagonal_sign: The bot doesn't have the ${permStr} permission(s) to use the \`${command.id}\` command.`)
                    .catch(err => console.log('ERROR', 'missingPermissions', 'DEADLOCK: ' + err));
            case 'user':
                return await message.channel.send(`:octagonal_sign: You are missing the ${permStr} permission(s) to use the \`${command.id}\` command.`)
                    .catch(err => console.log('ERROR', 'missingPermissions', 'DEADLOCK: ' + err));
        }
        return;
    }
}