import {AkairoClient, CommandHandler, ListenerHandler} from 'discord-akairo';
import {DocumentClient} from 'aws-sdk/lib/dynamodb/document_client';
import {PrefixDatabase} from '../utils/prefixDatabase';
import {MusicQuizDatabase} from '../utils/musicQuizDatabase';
import {MusicQuizSession} from '../utils/musicQuizSession';
import {GifDatabase} from '../utils/gifDatabase';
import {join} from 'path';
import config from '../config.json';
import musicQuizDataset from '../data/musicquiz_dataset.json';
import catgirlDataset from '../data/catgirl_dataset.json';
import {TextChannel, VoiceChannel, VoiceConnection} from 'discord.js';

declare module 'discord-akairo' {
    interface AkairoClient {
        config: any;
        musicQuizDataset: any;
        catgirlDataset: any;
        DDB: DocumentClient;
        prefixDatabase: PrefixDatabase;
        musicQuizDatabase: MusicQuizDatabase;
        musicQuizSession: MusicQuizSession;
        gifDatabase: GifDatabase;
        musicQueue: Map<string, MusicQueue>;
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
    volume: 2,
    playing: boolean
}

export default class Client extends AkairoClient {
    constructor(DDB: DocumentClient) {
        super({ownerID: config.owners}, {
            messageCacheMaxSize: 10,
            messageCacheLifetime: 120,
            messageSweepInterval: 60,
            disableMentions: 'everyone'
        });

        this.DDB = DDB;
        this.config = config;
        this.musicQuizDataset = musicQuizDataset;
        this.catgirlDataset = catgirlDataset;
        this.prefixDatabase = new PrefixDatabase(this);
        this.musicQuizDatabase = new MusicQuizDatabase(this);
        this.musicQuizSession = new MusicQuizSession();
        this.gifDatabase = new GifDatabase(this);
        this.musicQueue = new Map();

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