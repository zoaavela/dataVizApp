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

    // --- INTERCEPTION DES ERREURS POUR LE POPUP GLOBAL ---
    if (response.status === 401) {
        window.dispatchEvent(new CustomEvent('global-api-error', {
            detail: {
                type: 'auth',
                message: 'Votre session a expiré. Pour votre sécurité, veuillez vous reconnecter.'
            }
        }));
        throw new Error('Session expirée');
    }

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || errorData.error || 'Une erreur inattendue est survenue lors de la communication avec le serveur.';

        window.dispatchEvent(new CustomEvent('global-api-error', {
            detail: {
                type: 'server',
                message: errorMessage
            }
        }));
        throw errorData;
    }
    // --------------------------------------------------------

    if (response.status === 204) {
        return null;
    }

    return response.json();
};