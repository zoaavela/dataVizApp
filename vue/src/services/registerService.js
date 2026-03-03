import { apiFetch } from './api';

export const registerUser = async (userData) => {
    return await apiFetch('/register', {
        method: 'POST',
        body: JSON.stringify(userData)
    });
};