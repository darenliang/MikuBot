import {spawn} from 'child_process';
import {StreamDispatcher, VoiceConnection} from 'discord.js';

// Taken from https://github.com/ErikMartensson/discord.js-arbitrary-ffmpeg
export function playArbitraryFFmpeg(objVoiceConnection: VoiceConnection, arrFFmpegParams: Array<string>, objOptions: object): StreamDispatcher {
    objOptions = objOptions || {type: 'converted', bitrate: 'auto'};
    const arrStandardParams = [
        '-analyzeduration', '0',
        '-loglevel', '0',
        '-f', 'wav',
        '-ar', '48000',
        '-ac', '2',
        '-reconnect', '1',
        '-reconnect_streamed', '1',
        '-reconnect_at_eof', '1',
        '-reconnect_delay_max', '5',
        '-nostdin',
        'pipe:1'
    ];
    const arrFinalParams = arrFFmpegParams.concat(arrStandardParams);
    let ffmpeg = spawn('ffmpeg', arrFinalParams);
    return objVoiceConnection.play(ffmpeg.stdout, objOptions);
}
