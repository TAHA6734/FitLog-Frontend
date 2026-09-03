import axiosClient from './axiosClient';

export const notificationApi = {
getAll: () => axiosClient.get('/Notification'),
markAllAsRead: () => axiosClient.post('/Notification/mark-all-read'),
getUnreadCount: () => axiosClient.get('/Notification/unread-count'),
clearMessageNotifications: (fromUserId) => axiosClient.delete(`/Notification/message-from/${fromUserId}`),
delete: (notificationId) => axiosClient.delete(`/Notification/${notificationId}`),
deleteBatch: (notificationIds) => axiosClient.post('/Notification/delete-batch', notificationIds),
deleteAll: () => axiosClient.delete('/Notification'),
};


