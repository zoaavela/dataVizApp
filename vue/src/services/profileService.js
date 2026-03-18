import { apiFetch } from './api';


export const getUserProfile = async () => {
    return await apiFetch('/profile', { method: 'GET' });
};

export const updateUserProfile = async (profileData) => {
    return await apiFetch('/profile', {
        method: 'PUT',
        body: JSON.stringify(profileData)
    });
};

export const logoutUser = async () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
};

export const deleteUserProfile = async () => {
    return await apiFetch('/profile', { method: 'DELETE' });
};