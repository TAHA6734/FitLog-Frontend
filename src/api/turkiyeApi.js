import axios from 'axios';

const turkiyeApiClient = axios.create({
    baseURL: 'https://api.turkiyeapi.dev/v1',
});
export const turkiyeApi = {
    getProvinces: () =>  turkiyeApiClient.get('/provinces'),
};