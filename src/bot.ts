import AWS from 'aws-sdk';
// @ts-ignore
import secrets from '../mount/secrets.json';
import config from './config.json';
import Client from './struct/client';
import * as helpers from './utils/helpers';

// Set timestamps for non production environments
const logCopy = console.log.bind(console);
console.log = function (...data: string[]) {
    for (const [idx, item] of data.entries()) {
        if (idx < 2) {
            data[idx] = helpers.pad(Array(20).join('_'), item, true);
        }
    }
    if (!secrets.production) {
        logCopy('[' + new Date().toUTCString() + ']', data.join(' | '));
    } else {
        logCopy(data.join(' | '));
    }
};

AWS.config.update({region: config.aws.region});
const DDB = new AWS.DynamoDB.DocumentClient();

const client = new Client(DDB);
// Load important startup operations before client login
Promise.all([client.prefixDatabase.setGuilds(),
    client.musicQuizDatabase.setScores(),
    client.gifDatabase.setAlbums()])
    .then(() => client.login(secrets.discordToken)
        .then(() => console.log('INFO', 'bot', 'Logged into Discord.')))
    .catch(_ => {
        console.log('FATAL', 'bot', 'Failed to startup.');
        process.exit(1);
    });