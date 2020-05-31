import Client from '../struct/client';
import {Guild} from 'discord.js';

interface PrefixCache {
    [key: string]: string
}

export class PrefixDatabase {
    private client: Client;
    private cache: PrefixCache;

    constructor(client: Client) {
        this.client = client;
        this.cache = {};
    }

    createGuild(guild: Guild | null): boolean {
        if (!guild) {
            return false;
        }

        const params = {
            TableName: this.client.config.AWS.prefixTableName,
            Item: {
                'GuildId': guild.id,
                'Prefix': this.client.config.defaultPrefix
            }
        };

        this.client.DDB.put(params, err => {
            if (err) {
                console.log('ERROR', 'createGuild', err);
            }
            return false;
        });

        this.cache[guild.id] = this.client.config.defaultPrefix;
        return true;
    }

    updateGuild(guild: Guild | null, prefix: string): boolean {
        if (!guild) {
            return false;
        }

        const params = {
            TableName: this.client.config.AWS.prefixTableName,
            ExpressionAttributeValues: {
                ':s': prefix
            },
            Key: {
                'GuildId': guild.id
            },
            UpdateExpression: 'set Prefix = :s',
            ReturnValues: 'UPDATED_NEW'
        };

        this.client.DDB.update(params, err => {
            if (err) {
                console.log('ERROR', 'updateGuild', err);
            }
            return false;
        });

        this.cache[guild.id] = prefix;
        return true;
    }

    removeGuild(guild: Guild | null): boolean {
        if (!guild) return false;

        const params = {
            TableName: this.client.config.AWS.prefixTableName,
            Key: {
                'GuildId': guild.id
            }
        };

        this.client.DDB.delete(params, err => {
            if (err) {
                console.log('ERROR', 'removeGuild', err);
            }
            return false;
        });

        delete this.cache[guild.id];
        return true;
    }

    checkGuild(guild: Guild | null): boolean {
        if (!guild) return false;
        return this.cache.hasOwnProperty(guild.id);
    }

    getPrefix(guild: Guild | null): string {
        if (guild && this.checkGuild(guild)) return this.cache[guild.id];
        return this.client.config.defaultPrefix;
    }

    setGuilds() {
        const cache = this.cache;
        const client = this.client;

        const params: any = {
            TableName: this.client.config.AWS.prefixTableName,
            ProjectionExpression: 'GuildId, Prefix'
        };

        return new Promise(function (resolve, reject) {
            const onScan = (err: any, data: any) => {
                if (err) {
                    return reject(err);
                } else {
                    for (const item of data.Items) {
                        cache[item.GuildId] = item.Prefix;
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