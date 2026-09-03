import axiosClient from './axiosClient';

export const templateApi = {
create: (data) => axiosClient.post('/WorkoutTemplate', data),
getMy: () => axiosClient.get('/WorkoutTemplate/me'),
delete: (id) => axiosClient.delete(`/WorkoutTemplate/${id}`),
use: (id) => axiosClient.post(`/WorkoutTemplate/${id}/use`),
};

