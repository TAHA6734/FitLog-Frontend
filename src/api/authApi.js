import { googleLogout } from '@react-oauth/google';
import axiosClient from './axiosClient';

export const authApi = {
    register:(data)=>axiosClient.post('/Auth/register',data),
    login:(data) => axiosClient.post('/Auth/login',data),
     refreshToken:(refreshToken)=>axiosClient.post('/Auth/refresh-token',refreshToken),
     googleLogin: (idToken) => axiosClient.post('/Auth/google-login',{idToken}),
     forgotPassword:(email)=>axiosClient.post('/Auth/forgot-password',{email}),
     resetPassword:(data)=>axiosClient.post('/Auth/reset-password',data)
};
export const onboardingApi={
    complete:(data)=>axiosClient.post('/User/me/onboarding',data),
};