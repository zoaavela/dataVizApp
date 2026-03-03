import { apiFetch } from './api';

export const getQuadrantData = () => {
    return apiFetch('/territoires/quadrant', { method: 'GET' });
};

export const getAgeData = () => {
    return apiFetch('/territoires/age', { method: 'GET' });
};

export const getBetonData = () => {
    return apiFetch('/territoires/beton', { method: 'GET' });
};

export const getThermiqueData = () => {
    return apiFetch('/territoires/thermique', { method: 'GET' });
};

export const getLogementData = () => {
    return apiFetch('/territoires/logement', { method: 'GET' });
};

