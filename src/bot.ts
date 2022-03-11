import AWS from 'aws-sdk';
import tracer from 'tracer';
// @ts-ignore
import secrets from '../mount/secrets.json';
import config from './config.json';
import Client from './struct/client';

// Init AWS DynamoDB
AWS.config.update({region: config.aws.region});
AWS.config.accessKeyId = secrets.aws.accessKeyID;
AWS.config.secretAccessKey = secrets.aws.secretAccessKey;
const DDB = new AWS.DynamoDB.DocumentClient();

const client = new Client(DDB);
// Load important startup operations before client login
Promise.all([
    client.prefixDatabase.setGuilds(),
    client.musicQuizDatabase.setScores(),
    client.gifDatabase.setAlbums()
])
    .then(() => client.login(secrets.discordToken)
        .then(() => tracer.console().info(client.options.shards, `Logged into Discord`)))
    .catch(e => {
        tracer.console().fatal(client.options.shards, `Failed to startup: ${e}`);
        process.exit(1);
    });
