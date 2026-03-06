import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Shield, AlertTriangle, LogOut, Trash2 } from 'lucide-react';
import { getUserProfile, updateUserProfile, logoutUser, deleteUserProfile } from '../../services/profileService';
import './Profil.css';

export default function Profil() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [userData, setUserData] = useState({ nom: '', prenom: '', email: '' });
    const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
    const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        const loadProfile = async () => {
            try {
                const data = await getUserProfile();
                setUserData({
                    nom: data.nom || '',
                    prenom: data.prenom || '',
                    email: data.email || ''
                });
            } catch (error) {
                if (error.response && error.response.status === 401) {
                    navigate('/login');
                } else {
                    setStatusMessage({ type: 'error', text: 'Impossible de charger les données du profil.' });
                }
            } finally {
                setIsLoading(false);
            }
        };
        loadProfile();
    }, [navigate]);

    const handleUserChange = (e) => setUserData({ ...userData, [e.target.name]: e.target.value });
    const handlePasswordChange = (e) => setPasswords({ ...passwords, [e.target.name]: e.target.value });

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        try {
            await updateUserProfile({ nom: userData.nom, prenom: userData.prenom });
            setStatusMessage({ type: 'success', text: 'Vos informations ont été mises à jour.' });
        } catch (error) {
            setStatusMessage({ type: 'error', text: 'Erreur lors de la sauvegarde.' });
        }
        setTimeout(() => setStatusMessage({ type: '', text: '' }), 4000);
    };

    const handleSavePassword = async (e) => {
        e.preventDefault();
        if (passwords.new !== passwords.confirm) {
            setStatusMessage({ type: 'error', text: 'Les mots de passe ne correspondent pas.' });
            setTimeout(() => setStatusMessage({ type: '', text: '' }), 4000);
            return;
        }
        try {
            await updateUserProfile({ password: passwords.new });
            setPasswords({ current: '', new: '', confirm: '' });
            setStatusMessage({ type: 'success', text: 'Mot de passe modifié avec succès.' });
        } catch (error) {
            setStatusMessage({ type: 'error', text: 'Erreur lors de la modification.' });
        }
        setTimeout(() => setStatusMessage({ type: '', text: '' }), 4000);
    };

    const handleLogout = async () => {
        try { await logoutUser(); navigate('/login'); }
        catch (error) { navigate('/login'); }
    };

    const handleDeleteAccount = async () => {
        if (window.confirm("Voulez-vous vraiment supprimer votre compte ? Cette action est irréversible.")) {
            try {
                await deleteUserProfile();
                navigate('/register');
            } catch (error) {
                setStatusMessage({ type: 'error', text: 'Impossible de supprimer le compte.' });
                setTimeout(() => setStatusMessage({ type: '', text: '' }), 4000);
            }
        }
    };

    if (isLoading) return <div className="profil-loader">Chargement des données...</div>;

    return (
        <div className="profil-container">
            <header className="profil-header">
                <h1 className="profil-title">Paramètres du profil</h1>
                <p className="profil-subtitle">Gérez vos informations personnelles et votre sécurité</p>
                <div className="profil-email-badge">{userData.email}</div>
            </header>

            {statusMessage.text && (
                <div className={`profil-alert ${statusMessage.type}`}>
                    {statusMessage.text}
                </div>
            )}

            {/* CARTE 1 : IDENTITÉ */}
            <div className="profil-card">
                <div className="profil-card-header">
                    <User className="profil-icon" size={20} />
                    <h2>Informations Personnelles</h2>
                </div>
                <form onSubmit={handleSaveProfile} className="profil-form">
                    <div className="profil-form-row">
                        <div className="profil-form-group">
                            <label>Prénom</label>
                            <input type="text" name="prenom" value={userData.prenom} onChange={handleUserChange} required />
                        </div>
                        <div className="profil-form-group">
                            <label>Nom</label>
                            <input type="text" name="nom" value={userData.nom} onChange={handleUserChange} required />
                        </div>
                    </div>
                    <div className="profil-form-actions">
                        <button type="submit" className="profil-btn btn-primary">Enregistrer les modifications</button>
                    </div>
                </form>
            </div>

            {/* CARTE 2 : SÉCURITÉ */}
            <div className="profil-card">
                <div className="profil-card-header">
                    <Shield className="profil-icon" size={20} />
                    <h2>Sécurité du compte</h2>
                </div>
                <form onSubmit={handleSavePassword} className="profil-form">
                    <div className="profil-form-group">
                        <label>Mot de passe actuel</label>
                        <input type="password" name="current" value={passwords.current} onChange={handlePasswordChange} placeholder="••••••••" />
                    </div>
                    <div className="profil-form-row">
                        <div className="profil-form-group">
                            <label>Nouveau mot de passe</label>
                            <input type="password" name="new" value={passwords.new} onChange={handlePasswordChange} placeholder="••••••••" required />
                        </div>
                        <div className="profil-form-group">
                            <label>Confirmation</label>
                            <input type="password" name="confirm" value={passwords.confirm} onChange={handlePasswordChange} placeholder="••••••••" required />
                        </div>
                    </div>
                    <div className="profil-form-actions">
                        <button type="submit" className="profil-btn btn-secondary">Mettre à jour le mot de passe</button>
                    </div>
                </form>
            </div>

            {/* CARTE 3 : DANGER */}
            <div className="profil-card danger-zone">
                <div className="profil-card-header danger-header">
                    <AlertTriangle className="profil-icon" size={20} />
                    <h2>Zone de danger</h2>
                </div>
                <p className="danger-text">Ces actions sont immédiates. Assurez-vous d'avoir sauvegardé vos travaux avant de procéder.</p>
                <div className="profil-actions-row">
                    <button onClick={handleLogout} className="profil-btn btn-outline">
                        <LogOut size={16} /> Se déconnecter
                    </button>
                    <button onClick={handleDeleteAccount} className="profil-btn btn-danger">
                        <Trash2 size={16} /> Supprimer le compte
                    </button>
                </div>
            </div>
        </div>
    );
}