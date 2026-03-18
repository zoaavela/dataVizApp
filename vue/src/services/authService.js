import { apiFetch } from './api';

export const login = async (email, password) => {
    const response = await fetch('https://zoaavela.alwaysdata.net/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Erreur de connexion');
    }

    const data = await response.json();

    if (data.token) {
        localStorage.setItem('token', data.token);
    }

    return data;
};

export const register = (userData) => {
    return apiFetch('/register', {
        method: 'POST',
        body: JSON.stringify(userData)
    });
};