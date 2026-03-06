import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Map as MapIcon,
    User,
    Database,
    BarChart3,
    ArrowRight,
    Activity,
    TrendingUp,
    Target
} from 'lucide-react';
import './Home.css';

export default function Home({ user }) {
    const navigate = useNavigate();
    const isAdmin = user?.roles?.includes('ROLE_ADMIN');

    return (
        <div className="bi-home-container">
            {/* Halo lumineux en arrière-plan */}
            <div className="bi-bg-glow"></div>

            {/* --- EN-TÊTE / HERO SECTION --- */}
            <header className="bi-hero-section">
                <h1 className="hero-title">
                    Bienvenue, <span className="hero-highlight">{user?.prenom || 'Utilisateur'}</span>
                </h1>
                <p className="hero-subtitle">
                    Pilotez vos données territoriales avec la plateforme VISION. Accédez à vos modules d'analyse, de cartographie et de gestion.
                </p>

                {/* Barre de statut système pour habiller l'en-tête */}
                <div className="hero-data-status">
                    <div className="status-item">
                        <span className="status-dot green"></span> API Connectée
                    </div>
                    <div className="status-separator"></div>
                    <div className="status-item">101 Départements</div>
                    <div className="status-separator"></div>
                    <div className="status-item">Dernière MAJ : Mars 2026</div>
                </div>
            </header>

            {/* --- ACTIONS PRINCIPALES (GRID 2 COLONNES) --- */}
            <div className="bi-home-grid">
                {/* Action Principale 1 : Carte */}
                <div className="bi-action-card primary" onClick={() => navigate('/carte')}>
                    <div className="card-bg-pattern"></div>
                    <div className="card-content">
                        <div className="card-header-icon">
                            <MapIcon size={32} strokeWidth={1.5} />
                        </div>
                        <h2 className="card-title">Carte Globale</h2>
                        <p className="card-desc">Visualisation géographique interactive des indicateurs démographiques et thermiques sur l'ensemble du territoire.</p>

                        {/* Décoration CSS (Mini Map abstraite) */}
                        <div className="deco-visual deco-map">
                            <div className="map-dot d1"></div>
                            <div className="map-dot d2"></div>
                            <div className="map-dot d3"></div>
                            <div className="map-dot d4"></div>
                            <div className="map-dot d5"></div>
                        </div>

                        <div className="card-action-link">
                            Ouvrir la carte <ArrowRight size={18} />
                        </div>
                    </div>
                </div>

                {/* Action Principale 2 : Modules */}
                <div className="bi-action-card secondary" onClick={() => navigate('/modules')}>
                    <div className="card-bg-pattern"></div>
                    <div className="card-content">
                        <div className="card-header-icon">
                            <BarChart3 size={32} strokeWidth={1.5} />
                        </div>
                        <h2 className="card-title">Portail Analytique</h2>
                        <p className="card-desc">Accédez à l'ensemble des modules d'analyse croisée : choc des générations, dette thermique, indice de protection...</p>

                        {/* Décoration CSS (Mini Chart abstrait) */}
                        <div className="deco-visual deco-chart">
                            <div className="bar b1"></div>
                            <div className="bar b2"></div>
                            <div className="bar b3"></div>
                            <div className="bar b4"></div>
                            <div className="bar b5"></div>
                        </div>

                        <div className="card-action-link">
                            Voir les modules <ArrowRight size={18} />
                        </div>
                    </div>
                </div>
            </div>

            {/* --- SECTIONS SECONDAIRES (OUTILS & RACCOURCIS) --- */}
            <div className="bi-tools-section">
                <h3 className="section-label">Outils & Accès Rapides</h3>

                <div className="bi-tools-grid">
                    {/* Outils Système */}
                    <div className="bi-tool-card" onClick={() => navigate('/profil')}>
                        <div className="tool-icon"><User size={24} /></div>
                        <div className="tool-text">
                            <h4>Mon Profil</h4>
                            <span>Gérer mon compte</span>
                        </div>
                    </div>

                    {isAdmin ? (
                        <div className="bi-tool-card admin" onClick={() => navigate('/admin/import')}>
                            <div className="tool-icon"><Database size={24} /></div>
                            <div className="tool-text">
                                <h4>Import Data</h4>
                                <span>Mise à jour CSV</span>
                            </div>
                        </div>
                    ) : (
                        <div className="bi-tool-card disabled">
                            <div className="tool-icon"><Activity size={24} /></div>
                            <div className="tool-text">
                                <h4>Flux Actif</h4>
                                <span>Synchronisation auto</span>
                            </div>
                        </div>
                    )}

                    {/* Accès Rapides aux Modules pour remplir l'espace */}
                    <div className="bi-tool-card quick-link" onClick={() => navigate('/quadrant')}>
                        <div className="tool-icon"><Target size={24} /></div>
                        <div className="tool-text">
                            <h4>Quadrant Stratégique</h4>
                            <span>Accès direct</span>
                        </div>
                    </div>

                    <div className="bi-tool-card quick-link" onClick={() => navigate('/thermique')}>
                        <div className="tool-icon"><TrendingUp size={24} /></div>
                        <div className="tool-text">
                            <h4>Dette Thermique</h4>
                            <span>Accès direct</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}