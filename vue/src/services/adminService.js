import { apiFetch } from './api';

export const importCsv = (file) => {
    const formData = new FormData();
    formData.append('file', file);

    // Le token est automatiquement ajouté par api.js
    return apiFetch('/admin/import', {
        method: 'POST',
        body: formData
    });
};