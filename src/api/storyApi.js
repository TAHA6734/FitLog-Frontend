import axiosClient from './axiosClient';

export const storyApi = {
create: (formData) => axiosClient.post('/Story', formData, {
headers: { 'Content-Type': 'multipart/form-data' },
}),
getFeed: () => axiosClient.get('/Story/feed'),
markViewed: (storyId) => axiosClient.post(`/Story/${storyId}/view`),
getViewers: (storyId) => axiosClient.get(`/Story/${storyId}/viewers`),
delete: (storyId) => axiosClient.delete(`/Story/${storyId}`),
};
