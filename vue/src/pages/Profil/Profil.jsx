import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Shield, AlertTriangle, LogOut, Trash2 } from 'lucide-react';
import { getUserProfile, updateUserProfile, logoutUser, deleteUserProfile } from '../../services/profileService';
import LogoLoader from '../../components/LogoLoader/LogoLoader';
import './Profil.css';

export default function Profil() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [userData, setUserData] = useState({ nom: '', prenom: '', email: '' });
    const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
    const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        const loadProfile = async () => {
            const localUser = JSON.parse(localStorage.getItem('user') || '{}');
            if (localUser.email) {
                setUserData({ nom: localUser.nom || '', prenom: localUser.prenom || '', email: localUser.email || '' });
            }

            try {
                const data = await getUserProfile();
                if (data && data.email) {
                    setUserData({ nom: data.nom || '', prenom: data.prenom || '', email: data.email || '' });
                    localStorage.setItem('user', JSON.stringify({ ...localUser, ...data }));
                }
            } catch (error) {
                if (error.code === 401) navigate('/login');
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
            setStatusMessage({ type: 'success', text: 'Informations mises à jour.' });
        } catch (error) {
            setStatusMessage({ type: 'error', text: 'Erreur lors de la sauvegarde.' });
        }
        setTimeout(() => setStatusMessage({ type: '', text: '' }), 4000);
    };

    const handleSavePassword = async (e) => {
        e.preventDefault();
        if (passwords.new !== passwords.confirm) {
            setStatusMessage({ type: 'error', text: 'Les nouveaux mots de passe ne correspondent pas.' });
            return;
        }
        try {
            await updateUserProfile({
                currentPassword: passwords.current,
                newPassword: passwords.new
            });
            setPasswords({ current: '', new: '', confirm: '' });
            setStatusMessage({ type: 'success', text: 'Mot de passe modifié avec succès.' });
        } catch (error) {
            setStatusMessage({
                type: 'error',
                text: error.error || 'Mot de passe actuel incorrect.'
            });
        }
        setTimeout(() => setStatusMessage({ type: '', text: '' }), 4000);
    };

    const handleLogout = async () => {
        try { await logoutUser(); } catch (e) { }
        finally {
            localStorage.clear();
            navigate('/');
        }
    };

    const handleDeleteAccount = async () => {
        if (window.confirm("Voulez-vous vraiment supprimer votre compte ? Cette action est irréversible.")) {
            try {
                await deleteUserProfile();
                localStorage.clear();
                navigate('/');
            } catch (error) {
                setStatusMessage({ type: 'error', text: 'Erreur lors de la suppression du compte.' });
            }
        }
    };

    if (isLoading) return <LogoLoader text="Chargement du profil..." />;

    return (
        <div className="profil-container">
            <header className="profil-header">
                <h1 className="profil-title">Mon Profil</h1>
                <div className="profil-email-badge">{userData.email}</div>
            </header>

            {statusMessage.text && <div className={`profil-alert ${statusMessage.type}`}>{statusMessage.text}</div>}

            {/* SECTION INFORMATIONS */}
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
                        <button type="submit" className="profil-btn btn-primary">Sauvegarder</button>
                    </div>
                </form>
            </div>

            {/* SECTION SÉCURITÉ */}
            <div className="profil-card">
                <div className="profil-card-header">
                    <Shield className="profil-icon" size={20} />
                    <h2>Sécurité</h2>
                </div>
                <form onSubmit={handleSavePassword} className="profil-form">
                    <div className="profil-form-group">
                        <label>Mot de passe actuel</label>
                        <input type="password" name="current" value={passwords.current} onChange={handlePasswordChange} required />
                    </div>
                    <div className="profil-form-row">
                        <div className="profil-form-group">
                            <label>Nouveau mot de passe</label>
                            <input type="password" name="new" value={passwords.new} onChange={handlePasswordChange} required />
                        </div>
                        <div className="profil-form-group">
                            <label>Confirmation</label>
                            <input type="password" name="confirm" value={passwords.confirm} onChange={handlePasswordChange} required />
                        </div>
                    </div>
                    <div className="profil-form-actions">
                        <button type="submit" className="profil-btn btn-secondary">Changer le mot de passe</button>
                    </div>
                </form>
            </div>

            {/* SECTION DANGER */}
            <div className="profil-card danger-zone">
                <div className="profil-card-header">
                    <AlertTriangle className="profil-icon" size={20} />
                    <h2>Zone de danger</h2>
                </div>
                <p className="danger-text">Actions irréversibles. Soyez prudent.</p>
                <div className="profil-actions-row">
                    <button onClick={handleLogout} className="profil-btn btn-outline">
                        <LogOut size={16} /> Déconnexion
                    </button>
                    <button onClick={handleDeleteAccount} className="profil-btn btn-danger">
                        <Trash2 size={16} /> Supprimer le compte
                    </button>
                </div>
            </div>
        </div>
    );
}