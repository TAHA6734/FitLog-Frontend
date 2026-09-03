
import axiosClient from './axiosClient';

export const activityApi = {
getLiked: () => axiosClient.get('/Activity/liked'),
getSaved: () => axiosClient.get('/Activity/saved'),
getCommented: () => axiosClient.get('/Activity/commented'),
getCommentedForUser : (userId) => axiosClient.get(`/Activity/commented/${userId}`),
};
