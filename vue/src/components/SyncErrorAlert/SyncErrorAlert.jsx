import React from 'react';
import { AlertTriangle, RefreshCcw, LogOut } from 'lucide-react';
import './SyncErrorAlert.css';

export default function SyncErrorAlert({
    message = "Erreur de synchronisation des données",
    details = "Impossible de se connecter au serveur de données brutes. Le service est peut-être temporairement indisponible.",
    onRetry = null
}) {
    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/vision/';
    };

    return (
        <div className="sync-error-popup-overlay">
            <div className="sync-error-popup-modal" role="alert">
                <div className="sync-error-icon-container">
                    <AlertTriangle size={32} className="sync-error-main-icon" />
                </div>

                <div className="sync-error-text-block">
                    <h2 className="sync-error-title">Échec de Connexion</h2>
                    <p className="sync-error-message">{message}</p>

                    {details && (
                        <div className="sync-error-details-box">
                            <span className="sync-error-details-label">Détails techniques :</span>
                            <p className="sync-error-details">{details}</p>
                        </div>
                    )}
                </div>

                <div className="sync-error-actions">
                    <button onClick={handleLogout} className="sync-error-btn secondary">
                        <LogOut size={14} />
                        Retour à l'accueil
                    </button>

                    {onRetry && (
                        <button onClick={onRetry} className="sync-error-btn primary">
                            <RefreshCcw size={14} />
                            Relancer
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}