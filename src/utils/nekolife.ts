import axios, {AxiosResponse} from 'axios';
import config from '../config.json';

export function nekolife(tag: string): Promise<AxiosResponse> {
    return axios({
        url: `https://nekos.life/api/v2/img/${tag}`,
        timeout: config.defaultTimeout,
        method: 'get'
    });
}