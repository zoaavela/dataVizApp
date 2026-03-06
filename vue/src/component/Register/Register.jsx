// src/pages/Register.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from '../../services/registerService';
import logo from '../../assets/logo3.png';
import sideImage from '../../assets/login-side.svg';
import '../Login/Login.css';

export default function Register() {
    const [formData, setFormData] = useState({
        prenom: '',
        nom: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (formData.password !== formData.confirmPassword) {
            return setError("Les mots de passe ne correspondent pas.");
        }

        setIsLoading(true);

        try {
            await registerUser({
                prenom: formData.prenom,
                nom: formData.nom,
                email: formData.email,
                password: formData.password
            });

            navigate('/login');
        } catch (err) {
            setError(err.message || "Une erreur est survenue lors de l'inscription.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-split-layout">
            <div className="auth-split-container">

                <div className="auth-image-side" style={{ backgroundImage: `url(${sideImage})` }}>
                    <div className="auth-image-overlay">
                        <h2 className="auth-image-title"></h2>
                    </div>
                </div>

                <div className="auth-form-side">
                    <div className="auth-header">
                        <img src={logo} alt="Logo" className="auth-logo" />
                        <h1 className="auth-title">Inscription</h1>
                        <p className="auth-subtitle">Créez votre compte administrateur.</p>
                    </div>

                    {error && (
                        <div className="auth-alert alert-error">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="auth-form">
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                            <div className="form-group">
                                <label htmlFor="prenom" className="form-label">Prénom</label>
                                <input
                                    id="prenom"
                                    type="text"
                                    className="bento-input-text"
                                    value={formData.prenom}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="nom" className="form-label">Nom</label>
                                <input
                                    id="nom"
                                    type="text"
                                    className="bento-input-text"
                                    value={formData.nom}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="email" className="form-label">Adresse Email</label>
                            <input
                                id="email"
                                type="email"
                                className="bento-input-text"
                                value={formData.email}
                                onChange={handleChange}
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
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="confirmPassword" className="form-label">Confirmer le mot de passe</label>
                            <input
                                id="confirmPassword"
                                type="password"
                                className="bento-input-text"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="btn-primary auth-submit-btn"
                        >
                            {isLoading ? 'Création...' : 'Créer mon compte'}
                        </button>
                    </form>

                    <div className="auth-footer">
                        <span className="auth-footer-text">Vous avez déjà un compte ?</span>
                        <Link to="/login" className="auth-link">
                            Se connecter
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}