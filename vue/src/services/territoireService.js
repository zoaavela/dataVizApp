import { apiFetch } from './api';

export const getCarteData = () => {
    return apiFetch('/territoires/carte', { method: 'GET' });
};

export const getAllTerritoires = () => {
    return apiFetch('/territoires', { method: 'GET' });
};