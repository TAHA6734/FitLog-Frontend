
import axiosClient from './axiosClient';

export const feedApi = {
getFeed: (page = 1, pageSize = 10, sortBy = 'chronological') =>
axiosClient.get(`/Feed?page=${page}&pageSize=${pageSize}&sortBy=${sortBy}`),
getUserTimeline: (userId) => axiosClient.get(`/Feed/user/${userId}`),
};




