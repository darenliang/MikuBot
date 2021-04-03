import {DocumentClient} from 'aws-sdk/lib/dynamodb/document_client';
import {AkairoClient, CommandHandler, ListenerHandler} from 'discord-akairo';
import {Message, TextChannel, VoiceChannel, VoiceConnection} from 'discord.js';
import {join} from 'path';
// @ts-ignore
import catgirlDataset from '../../mount/datasets/catgirl_dataset.json';
// @ts-ignore
import musicQuizDataset from '../../mount/datasets/musicquiz_dataset.json';
// @ts-ignore
import triviaDataset from '../../mount/datasets/trivia_dataset.json';
import config from '../config.json';
import {GifDatabase} from '../utils/gifDatabase';
import {MusicQuizDatabase} from '../utils/musicQuizDatabase';
import {MusicQuizSession} from '../utils/musicQuizSession';
import {PrefixDatabase} from '../utils/prefixDatabase';

declare module 'discord-akairo' {
    interface AkairoClient {
        config: any;
        musicQuizDataset: any;
        catgirlDataset: any;
        triviaDataset: any;
        DDB: DocumentClient;
        prefixDatabase: PrefixDatabase;
        musicQuizDatabase: MusicQuizDatabase;
        musicQuizSession: MusicQuizSession;
        gifDatabase: GifDatabase;
        musicQueue: Map<string, MusicQueue>;
        deleteCache: Map<string, Message>
        guildCount: number;
        commandHandler: CommandHandler;
        listenerHandler: ListenerHandler
    }
}

export interface Song {
    title: string,
    url: string,
    thumbnail: string
}

export interface MusicQueue {
    textChannel: TextChannel,
    voiceChannel: VoiceChannel,
    connection: VoiceConnection | null,
    songs: Song[],
    volume: 5,
    playing: boolean
}

export default class Client extends AkairoClient {
    constructor(DDB: DocumentClient) {
        super({ownerID: config.owners}, {
            ws: {
                intents: [
                    'GUILDS',
                    'GUILD_MESSAGES',
                    'GUILD_MESSAGE_REACTIONS',
                    'DIRECT_MESSAGES',
                    'DIRECT_MESSAGE_REACTIONS'
                ]
            },
            disableMentions: 'everyone',
            messageCacheMaxSize: 10,
            messageCacheLifetime: 120,
            messageSweepInterval: 60,
        });

        this.DDB = DDB;
        this.config = config;
        this.musicQuizDataset = musicQuizDataset;
        this.catgirlDataset = catgirlDataset;
        this.triviaDataset = triviaDataset;
        this.prefixDatabase = new PrefixDatabase(this);
        this.musicQuizDatabase = new MusicQuizDatabase(this);
        this.musicQuizSession = new MusicQuizSession();
        this.gifDatabase = new GifDatabase(this);
        this.musicQueue = new Map<string, MusicQueue>();
        this.deleteCache = new Map<string, Message>();
        // Set default before waiting for ready event.
        this.guildCount = 0;

        this.commandHandler = new CommandHandler(this, {
            directory: join(__dirname, '..', 'commands'),
            prefix: msg => {
                return this.prefixDatabase.getPrefix(msg.guild);
            },
            automateCategories: true,
            defaultCooldown: 1000
        });

        this.listenerHandler = new ListenerHandler(this, {
            directory: join(__dirname, '..', 'listeners')
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
