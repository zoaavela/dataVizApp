import { apiFetch } from './api';

export const importCsv = (file) => {
    const formData = new FormData();
    formData.append('file', file);

    return apiFetch('/admin/import', {
        method: 'POST',
        body: formData
    });
};