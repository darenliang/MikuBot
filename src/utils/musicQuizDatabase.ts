import Client from '../struct/client';
import {User} from 'discord.js';

interface MusicQuizCache {
    [key: string]: MusicQuizItem
}

interface MusicQuizItem {
    musicScore: number,
    totalAttempts: number
}

export class MusicQuizDatabase {
    private client: Client;
    private cache: MusicQuizCache;

    constructor(client: Client) {
        this.client = client;
        this.cache = {};
    }

    createScore(user: User | null, item: MusicQuizItem): boolean {
        if (!user) return false;

        const params = {
            TableName: this.client.config.AWS.musicQuizTableName,
            Item: {
                'UserId': user.id,
                'MusicScore': item.musicScore,
                'TotalAttempts': item.totalAttempts
            }
        };

        this.client.DDB.put(params, err => {
            if (err) {
                console.log('ERROR', 'createScore', err);
            }
            return false;
        });

        this.cache[user.id] = item;
        return true;
    }

    updateScore(user: User | null, item: MusicQuizItem): boolean {
        if (!user) return false;

        const params = {
            TableName: this.client.config.AWS.musicQuizTableName,
            ExpressionAttributeValues: {
                ':s': item.musicScore,
                ':t': item.totalAttempts
            },
            Key: {
                'UserId': user.id
            },
            UpdateExpression: 'set MusicScore = :s, TotalAttempts = :t',
            ReturnValues: 'UPDATED_NEW'
        };

        this.client.DDB.update(params, err => {
            if (err) {
                console.log('ERROR', 'updateScore', err);
            }
            return false;
        });

        this.cache[user.id] = item;
        return true;
    }

    checkUser(user: User | null): boolean {
        if (!user) {
            return false;
        }
        return this.cache.hasOwnProperty(user.id);
    }

    getScore(user: User | null): MusicQuizItem {
        if (user && this.checkUser(user)) {
            return this.cache[user.id];
        }
        return {
            musicScore: 0,
            totalAttempts: 0
        };
    }

    getScores(): MusicQuizCache {
        return this.cache;
    }

    setScores() {
        const cache = this.cache;
        const client = this.client;

        const params: any = {
            TableName: this.client.config.AWS.musicQuizTableName,
            ProjectionExpression: 'UserId, MusicScore, TotalAttempts'
        };

        return new Promise(function (resolve, reject) {
            const onScan = (err: any, data: any) => {
                if (err) {
                    return reject(err);
                } else {
                    for (const item of data.Items) {
                        cache[item.UserId] = {
                            musicScore: item.MusicScore,
                            totalAttempts: item.TotalAttempts
                        };
                    }
                    // Continue to scan
                    if (typeof data.LastEvaluatedKey != 'undefined') {
                        params.ExclusiveStartKey = data.LastEvaluatedKey;
                        client.DDB.scan(params, onScan);
                    } else {
                        return resolve();
                    }
                }
            };
            client.DDB.scan(params, onScan);
        });
    };
}