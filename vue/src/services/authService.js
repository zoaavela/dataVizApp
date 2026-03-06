import { apiFetch } from './api';

export const login = async (email, password) => {
    const response = await fetch('http://localhost:8000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });

    if (!response.ok) throw new Error('Erreur connexion');

    const data = await response.json();
    return data;
};

export const register = (userData) => {
    return apiFetch('/register', {
        method: 'POST',
        body: JSON.stringify(userData)
    });
};

export const getProfile = () => {
    return apiFetch('/profile', { method: 'GET' });
};

export const updateProfile = (userData) => {
    return apiFetch('/profile', {
        method: 'PUT',
        body: JSON.stringify(userData)
    });
};

export const deleteProfile = () => {
    return apiFetch('/profile', { method: 'DELETE' });
};