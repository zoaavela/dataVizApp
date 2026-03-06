// Login.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from "../../services/authService";
import logo from '../../assets/logo3.png';
import sideImage from '../../assets/login-side.svg';
import './Login.css';

export default function Login({ setUser }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            const data = await login(email, password);

            // 1. SAUVEGARDE DU TOKEN (L'élément manquant)
            // Vérifie si ton API renvoie data.token ou data.access_token
            if (data.token) {
                localStorage.setItem('token', data.token);
            }

            const userData = {
                email: data.user.email,
                roles: data.user.roles,
                nom: data.user.nom,
                prenom: data.user.prenom
            };

            if (setUser) {
                setUser(userData);
            }

            // 2. Sauvegarde de l'objet utilisateur pour l'affichage
            localStorage.setItem('user', JSON.stringify(userData));

            navigate('/profil');
        } catch (err) {
            setError(err.message || 'Email ou mot de passe incorrect.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-split-layout">
            <div className="auth-split-container">

                {/* L'image est passée en style inline ici */}
                <div className="auth-image-side" style={{ backgroundImage: `url(${sideImage})` }}>
                    <div className="auth-image-overlay">
                    </div>
                </div>

                <div className="auth-form-side">
                    <div className="auth-header">
                        <img src={logo} alt="Logo" className="auth-logo" />
                        <h1 className="auth-title">Connexion</h1>
                        <p className="auth-subtitle">Accédez à votre espace de pilotage.</p>
                    </div>

                    {error && (
                        <div className="auth-alert alert-error">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="auth-form">
                        <div className="form-group">
                            <label htmlFor="email" className="form-label">Adresse Email</label>
                            <input
                                id="email"
                                type="email"
                                className="bento-input-text"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="vous@exemple.com"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="password" className="form-label">Mot de passe</label>
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

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="btn-primary auth-submit-btn"
                        >
                            {isLoading ? 'Authentification...' : 'Se connecter'}
                        </button>
                    </form>

                    <div className="auth-footer">
                        <span className="auth-footer-text">Vous n'avez pas encore de compte ?</span>
                        <Link to="/register" className="auth-link">
                            Créer un compte
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}