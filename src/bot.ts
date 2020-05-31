import Client from './struct/client'
import config from './config.json';
import * as helpers from './utils/helpers';
import AWS from 'aws-sdk';

// Set timestamps for non production environments
const logCopy = console.log.bind(console);
console.log = function (...data: string[]) {
    for (const [idx, item] of data.entries()) {
        if (idx < 2) {
            data[idx] = helpers.pad(Array(20).join(' '), item, true);
        }
    }
    if (process.env.PRODUCTION == 'false') {
        logCopy('[' + new Date().toUTCString() + ']', data.join(' | '));
    } else {
        logCopy(data.join(' | '));
    }
};

AWS.config.update({region: config.AWS.region});
const DDB = new AWS.DynamoDB.DocumentClient();

const client = new Client(DDB);
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