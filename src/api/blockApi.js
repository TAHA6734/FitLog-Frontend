import axiosClient from './axiosClient';

export const blockApi = {
block: (userId) => axiosClient.post(`/Block/${userId}`),
unblock: (userId) => axiosClient.delete(`/Block/${userId}`),
isBlocked: (userId) => axiosClient.get(`/Block/${userId}/is-blocked`),
getBlockedUsers:()=>axiosClient.get('/Block/blocked'),
};
