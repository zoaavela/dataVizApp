import React, { useEffect, useState } from 'react';
import { AlertTriangle, X, LogOut } from 'lucide-react';
import './GlobalErrorModal.css';

export default function GlobalErrorModal() {
    const [error, setError] = useState(null);

    useEffect(() => {
        // Fonction déclenchée quand api.js envoie l'erreur
        const handleApiError = (event) => {
            setError(event.detail);
        };

        window.addEventListener('global-api-error', handleApiError);
        return () => window.removeEventListener('global-api-error', handleApiError);
    }, []);

    if (!error) return null;

    // Déconnexion et redirection vers l'accueil (/)
    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setError(null);
        window.location.href = '/vision/';
    };

    // Fermer le popup (seulement si ce n'est pas une expiration de session)
    const handleClose = () => {
        setError(null);
    };

    return (
        <div className="global-error-overlay">
            <div className="global-error-modal">
                <div className="global-error-icon-wrapper">
                    <AlertTriangle size={32} className="global-error-icon" />
                </div>

                <h2 className="global-error-title">
                    {error.type === 'auth' ? 'Session Expirée' : 'Erreur Système'}
                </h2>

                <p className="global-error-message">
                    {error.message}
                </p>

                <div className="global-error-actions">
                    {/* On ne permet de fermer que si ce n'est PAS une erreur de sécurité/auth */}
                    {error.type !== 'auth' && (
                        <button onClick={handleClose} className="global-error-btn outline">
                            <X size={16} /> Ignorer
                        </button>
                    )}

                    <button onClick={handleLogout} className="global-error-btn solid">
                        <LogOut size={16} /> Se déconnecter
                    </button>
                </div>
            </div>
        </div>
    );
}