// --- Login.jsx ---
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from "../../services/authService";
import logo from '../../assets/logo3.png';
import './Login.css';
import { getUserProfile } from "../../services/profileService";

export default function Login({ setUser }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [statusMessage, setStatusMessage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setStatusMessage(null);
        setIsLoading(true);

        try {
            // 1. On s'identifie, authService stocke le Token
            await login(email, password);

            // 2. On récupère les infos du profil avec le token
            const userProfile = await getUserProfile();
            const user = userProfile.user || userProfile;

            const userStatus = user?.adminRequestStatus;
            const roles = user?.roles || [];

            // 3. Vérification des accès
            if (userStatus === 'pending' && !roles.includes('ROLE_ADMIN')) {
                setStatusMessage("Votre demande d'accès administrateur est toujours en cours d'examen par le Super Admin.");
                localStorage.removeItem('token');
                setIsLoading(false);
                return;
            }

            if (userStatus === 'rejected' && !roles.includes('ROLE_ADMIN')) {
                setError("Votre demande d'accès administrateur a été refusée.");
                localStorage.removeItem('token');
                setIsLoading(false);
                return;
            }

            // 4. On prépare le profil
            const userData = {
                email: user.email,
                roles: user.roles || [],
                nom: user.nom || '',
                prenom: user.prenom || ''
            };

            if (setUser) setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));

            navigate('/accueil');
        } catch (err) {
            console.error("Erreur de login :", err);
            setError(err.message || "Identifiants incorrects ou problème de serveur.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-right">
                <div className="login-form-wrapper">
                    <div className="auth-header" style={{ textAlign: 'center', marginBottom: '2rem' }}>
                        <img src={logo} alt="Logo" className="auth-logo" style={{ width: '32px', marginBottom: '1rem', cursor: 'pointer' }} onClick={() => navigate('/')} />
                        <h2 className="login-title">Connexion</h2>
                    </div>
                    <p className="login-subtitle">Connectez-vous pour gérer les imports ou suivez l'état de votre demande.</p>

                    {error && <div className="login-error">{error}</div>}
                    {statusMessage && <div className="login-info" style={{ color: '#3b82f6', backgroundColor: '#1e3a8a33', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>{statusMessage}</div>}

                    <form onSubmit={handleSubmit} className="login-form">
                        <div className="form-group">
                            <label htmlFor="email">Adresse E-mail</label>
                            <input
                                id="email"
                                type="email"
                                className="bento-input-text"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="nom@exemple.com"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">Mot de passe</label>
                            <input
                                id="password"
                                type="password"
                                className="bento-input-text"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <button type="submit" disabled={isLoading} className="btn-primary auth-submit-btn">
                            {isLoading ? 'Authentification...' : 'Se connecter'}
                        </button>

                        <button
                            type="button"
                            onClick={() => navigate('/accueil')}
                            className="auth-submit-btn guest-btn"
                        >
                            Continuer en tant qu'invité
                        </button>

                        <div className="register-link">
                            Pas encore de compte ? <span onClick={() => navigate('/register')}>Demander un accès</span>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}