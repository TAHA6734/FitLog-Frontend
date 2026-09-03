import axiosClient from './axiosClient';

export const eventApi = {
create: (groupId, data) => axiosClient.post(`/Group/${groupId}/Events`, data),
getByGroup: (groupId) => axiosClient.get(`/Group/${groupId}/Events`),
getById: (groupId, eventId) => axiosClient.get(`/Group/${groupId}/Events/${eventId}`),
respond: (groupId, eventId, status) =>
axiosClient.post(`/Group/${groupId}/Events/${eventId}/respond`, { status }),
delete: (groupId, eventId) => axiosClient.delete(`/Group/${groupId}/Events/${eventId}`),
};


