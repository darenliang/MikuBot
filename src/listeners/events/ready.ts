import {Listener} from 'discord-akairo';

export default class ReadyListener extends Listener {
    constructor() {
        super('ready', {
            emitter: 'client',
            event: 'ready'
        });
    }

    async exec() {
        const setPresence = () => {
            this.client.user!.setPresence({activity: {name: `@${this.client.config.name} help`}, status: 'online'});
        };

        // Set every minute
        setPresence();
        setInterval(() => {
            setPresence();
        }, 60000);

        for (const guild of this.client.guilds.cache.array()) {
            if (!this.client.prefixDatabase.checkGuild(guild)) {
                this.client.prefixDatabase.createGuild(guild);
                console.log('INFO', 'ready', `Added ${guild.name} - ${guild.id}`);
            }
        }

        console.log('INFO', 'ready', `${this.client.config.name} ${this.client.config.version}`);
        console.log('INFO', 'ready', `Serving ${this.client.guilds.cache.size} servers`);
    }
}