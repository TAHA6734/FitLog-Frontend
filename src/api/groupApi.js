import axiosClient from './axiosClient';

export const groupApi = {
create: (data) => axiosClient.post('/Group', data),
getById: (groupId) => axiosClient.get(`/Group/${groupId}`),
getMyGroups: () => axiosClient.get('/Group/my-groups'),
getMembers: (groupId) => axiosClient.get(`/Group/${groupId}/members`),
join: (groupId) => axiosClient.post(`/Group/${groupId}/join`),
leave: (groupId) => axiosClient.post(`/Group/${groupId}/leave`),
delete: (groupId) => axiosClient.delete(`/Group/${groupId}`),
search: (query) => axiosClient.get(`/Group/search?query=${query}`),
kickMember: (groupId, userId) => axiosClient.delete(`/Group/${groupId}/members/${userId}`),
};



