import { apiFetch } from './api';

export const getAdminRequests = async () => {
    return await apiFetch('/super-admin/users/requests', { method: 'GET' });
};

export const approveAdminRequest = async (id) => {
    return await apiFetch(`/super-admin/users/${id}/approve`, { method: 'POST' });
};

export const rejectAdminRequest = async (id) => {
    return await apiFetch(`/super-admin/users/${id}/reject`, { method: 'POST' });
};