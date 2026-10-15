import axiosClient from './axiosClient';

export const userApi = {
getMe: () => axiosClient.get('/User/me'),
getProfile: (userId) => axiosClient.get(`/User/${userId}`),
updateProfile: (formData) => axiosClient.put('/User/me', formData, {
headers: { 'Content-Type': 'multipart/form-data' },
}),
updatePrivacy: (isPrivate) => axiosClient.put('/User/me/privacy', { isPrivate }),
updateStatsVisibility: (visibility) => axiosClient.put('/User/me/stats-visibility', { visibility }),
search: (query) => axiosClient.get(`/User/search?query=${query}`),
getWeeklySummary: () => axiosClient.get('/User/me/weekly-summary'),
getWorkoutPartners: () => axiosClient.get('/User/workout-partners'),
setPremium : (isPremium) => axiosClient.put('/User/me/premium',{isPremium}),
setCoverTheme : (theme) => axiosClient.put('/User/me/cover-theme',{theme}),
};

export const followApi = {
follow: (userId) => axiosClient.post(`/Follow/${userId}`),
unfollow: (userId) => axiosClient.delete(`/Follow/${userId}`),
removeFollower:(followerId)=>axiosClient.delete(`/Follow/followers/${followerId}`),
isFollowing: (userId) => axiosClient.get(`/Follow/${userId}/is-following`),
getStatus: (userId) => axiosClient.get(`/Follow/${userId}/status`),
getPendingRequests: () => axiosClient.get('/Follow/requests'),
acceptRequest: (requesterId) => axiosClient.post(`/Follow/requests/${requesterId}/accept`),
rejectRequest: (requesterId) => axiosClient.post(`/Follow/requests/${requesterId}/reject`),
getFollowers: (userId) => axiosClient.get(`/Follow/${userId}/followers`),
getFollowing: (userId) => axiosClient.get(`/Follow/${userId}/following`),
};

export const leaderboardApi = {
getDistance: () => axiosClient.get('/Leaderboard/distance'),
getStreak: () => axiosClient.get('/Leaderboard/streak'),
getDevelopmentScore: () => axiosClient.get('/Leaderboard/development-score'),
};


