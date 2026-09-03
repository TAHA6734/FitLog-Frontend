import axiosClient from './axiosClient';

export const savedWorkoutApi = {
save: (workoutId) => axiosClient.post(`/SavedWorkout/${workoutId}`),
unsave: (workoutId) => axiosClient.delete(`/SavedWorkout/${workoutId}`),
isSaved: (workoutId) => axiosClient.get(`/SavedWorkout/${workoutId}/is-saved`),
getMySaved: () => axiosClient.get('/SavedWorkout/me'),
};
