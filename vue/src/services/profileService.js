// src/services/profileService.js
import { apiFetch } from './api';

const getAuthOptions = (options = {}) => {
    const token = localStorage.getItem('token');

    return {
        ...options,
        headers: {
            ...options.headers,
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
    };
};

export const getUserProfile = async () => {
    return await apiFetch('/profile', getAuthOptions());
};

export const updateUserProfile = async (profileData) => {
    return await apiFetch('/profile', getAuthOptions({
        method: 'PUT',
        body: JSON.stringify(profileData)
    }));
};

export const logoutUser = async () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return await apiFetch('/logout', getAuthOptions());
};

export const deleteUserProfile = async () => {
    return await apiFetch('/profile', getAuthOptions({
        method: 'DELETE'
    }));
};