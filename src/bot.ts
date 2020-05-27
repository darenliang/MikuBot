import {DocumentClient} from 'aws-sdk/lib/dynamodb/document_client';
import {AkairoClient, CommandHandler, ListenerHandler} from 'discord-akairo';
import {PrefixDatabase} from './utils/prefixDatabase';
import {MusicQuizDatabase} from './utils/musicQuizDatabase';
import {MusicQuizSession} from './utils/musicQuizSession';
import config from './config.json';
import musicQuizDataset from './data/musicquiz_dataset.json';
import * as helpers from './utils/helpers';
import AWS from 'aws-sdk';
import {join} from 'path';
import {GifDatabase} from './utils/gifDatabase';
import {TextChannel, VoiceChannel, VoiceConnection} from 'discord.js';

// Set timestamps for non production environments
const logCopy = console.log.bind(console);
console.log = function (...data: string[]) {
    for (const [idx, item] of data.entries()) {
        if (idx < 2) {
            data[idx] = helpers.pad(Array(20).join(' '), item, true);
        }
    }
    if (!config.production) {
        logCopy('[' + new Date().toUTCString() + ']', data.join(' | '));
    } else {
        logCopy(data.join(' | '));
    }
};

export interface Song {
    id: string,
    title: string,
    url: string
}

export interface MusicQueue {
    textChannel: TextChannel,
    voiceChannel: VoiceChannel,
    connection: VoiceConnection | null,
    songs: Song[],
    volume: 2,
    playing: boolean
}

export class Client extends AkairoClient {
    public DDB: DocumentClient;
    public config: any;
    public musicQuizDataset: any;
    public prefixDatabase: PrefixDatabase;
    public musicQuizDatabase: MusicQuizDatabase;
    public musicQuizSession: MusicQuizSession;
    public gifDatabase: GifDatabase;
    public musicQueue: Map<string, MusicQueue>;
    public commandHandler: CommandHandler;
    public listenerHandler: ListenerHandler;

    constructor(DDB: DocumentClient, config: any) {
        super({ownerID: config.owners}, {disableMentions: 'everyone'});

        this.DDB = DDB;
        this.config = config;
        this.musicQuizDataset = musicQuizDataset;
        this.prefixDatabase = new PrefixDatabase(this);
        this.musicQuizDatabase = new MusicQuizDatabase(this);
        this.musicQuizSession = new MusicQuizSession();
        this.gifDatabase = new GifDatabase(this);
        this.musicQueue = new Map();

        this.commandHandler = new CommandHandler(this, {
            directory: join(__dirname, 'commands'),
            prefix: msg => {
                return this.prefixDatabase.getPrefix(msg.guild);
            },
            automateCategories: true,
            defaultCooldown: 1000
        });

        this.listenerHandler = new ListenerHandler(this, {
            directory: join(__dirname, 'listeners')
        });

        this.commandHandler.useListenerHandler(this.listenerHandler);

        this.listenerHandler.setEmitters({
            commandHandler: this.commandHandler,
            listenerHandler: this.listenerHandler
        });

        this.commandHandler.loadAll();
        this.listenerHandler.loadAll();
    }
}

AWS.config.update({region: config.AWS.region});
const DDB = new AWS.DynamoDB.DocumentClient();

const client = new Client(DDB, config);
// Load important startup operations before client login
Promise.all([client.prefixDatabase.setGuilds(),
    client.musicQuizDatabase.setScores(),
    client.gifDatabase.setAlbums()])
    .then(() => client.login(process.env.DISCORD_TOKEN)
        .then(() => console.log('INFO', 'bot', 'Logged into Discord.')))
    .catch(_ => {
        console.log('FATAL', 'bot', 'Failed to startup.');
        process.exit(1);
    });