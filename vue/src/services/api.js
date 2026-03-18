const API_BASE_URL = 'https://zoaavela.alwaysdata.net/api';

export const apiFetch = async (endpoint, options = {}) => {
    const token = localStorage.getItem('token');

    const config = {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` }), // Injection du token s'il existe
            ...options.headers,
        },
        credentials: 'include',
    };

    // Suppression du Content-Type pour FormData (laisse le navigateur gérer le boundary)
    if (options.body instanceof FormData) {
        delete config.headers['Content-Type'];
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    // --- LE NETTOYAGE EST ICI (Erreur 401 : Token expiré) ---
    if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/dataVizApp/login'; // Redirection forcée et immédiate
        throw new Error('Session expirée'); // Bloque la suite du code
    }
    // --------------------------------------------------------

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw errorData;
    }

    if (response.status === 204) {
        return null;
    }

    return response.json();
};