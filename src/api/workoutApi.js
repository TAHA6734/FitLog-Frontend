import axiosClient from './axiosClient';

export const workoutApi = {
getFeed: (page = 1, pageSize = 10, sortBy = 'chronological') =>
axiosClient.get(`/Workout/feed?page=${page}&pageSize=${pageSize}&sortBy=${sortBy}`),
getById: (id) => axiosClient.get(`/Workout/${id}`),
getMyWorkouts: () => axiosClient.get('/Workout/my-workouts'),
getByUserId: (userId) => axiosClient.get(`/Workout/user/${userId}`),
getByTag:(tag)=>axiosClient.get(`/Tag/${tag}/workouts`),
create: (formData) => axiosClient.post('/Workout', formData, {
headers: { 'Content-Type': 'multipart/form-data' },
}),
update: (id, formData) => axiosClient.put(`/Workout/${id}`, formData, {
headers: { 'Content-Type': 'multipart/form-data' },
}),
delete: (id) => axiosClient.delete(`/Workout/${id}`),
};

export const likeApi = {
like: (workoutId) => axiosClient.post(`/Like/${workoutId}`),
unlike: (workoutId) => axiosClient.delete(`/Like/${workoutId}`),
};

export const commentApi = {
add: (workoutId, content) => axiosClient.post(`/Comment/${workoutId}`, { content }),
getForWorkout: (workoutId) => axiosClient.get(`/Comment/workout/${workoutId}`),
delete: (commentId) => axiosClient.delete(`/Comment/${commentId}`),
update:(commentId,content)=>axiosClient.put(`/Comment/${commentId}`,{content}),
add: (workoutId, content, parentCommentId = null) =>
axiosClient.post(`/Comment/${workoutId}`, { content, parentCommentId }),
likeComment: (commentId) => axiosClient.post(`/Comment/${commentId}/like`),
unlikeComment: (commentId) => axiosClient.delete(`/Comment/${commentId}/like`),

};


