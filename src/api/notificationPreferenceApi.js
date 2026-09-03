import axiosClient from './axiosClient';

export const notificationPreferenceApi = {
get: () => axiosClient.get('/User/me/notification-preferences'),
update: (data) => axiosClient.put('/User/me/notification-preferences', data),
};


