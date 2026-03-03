import { apiFetch } from './api';

export const getUserProfile = async () => {
    return await apiFetch('/profile');
};

export const updateUserProfile = async (profileData) => {
    return await apiFetch('/profile', {
        method: 'PUT',
        body: JSON.stringify(profileData)
    });
};

export const logoutUser = async () => {
    return await apiFetch('/logout');
};

export const deleteUserProfile = async () => {
    return await apiFetch('/profile', {
        method: 'DELETE'
    });
};