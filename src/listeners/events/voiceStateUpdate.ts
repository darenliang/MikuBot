import {Listener} from 'discord-akairo';
import {VoiceState} from 'discord.js';

export default class VoiceStateUpdateListener extends Listener {
    constructor() {
        super('voiceStateUpdate', {
            emitter: 'client',
            event: 'voiceStateUpdate'
        });
    }

    async exec(_: VoiceState, newState: VoiceState) {
        // Cleanup on disconnect
        if (newState.member!.user.id == this.client.user!.id && newState.connection == null) {
            this.client.musicQueue.delete(newState.guild.id);
        }
    }
}