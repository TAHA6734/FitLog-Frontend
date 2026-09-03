
import axiosClient from './axiosClient';

export const achievementApi = {
getMine: () => axiosClient.get('/Achievement/me'),
};



