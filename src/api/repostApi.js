import axiosClient from './axiosClient';

export const repostApi = {
create: (workoutId, note) => axiosClient.post(`/Repost/${workoutId}`, { note }),
delete: (repostId) => axiosClient.delete(`/Repost/${repostId}`),
getMy: () => axiosClient.get('/Repost/me'),
};




