import { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { Home, User, Map as MapIcon, Box, Database, Info, LogOut, Menu, ChevronLeft, Users } from 'lucide-react';
import logo from '../../assets/logo3.png';
import './Layout.css';

export default function Layout({ user, setUser }) {
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        setUser(null);
        navigate('/');
    };

    const isAdmin = user?.roles?.includes('ROLE_ADMIN') || user?.roles?.includes('ROLE_SUPER_ADMIN');

    const isSuperAdmin = user?.roles?.includes('ROLE_SUPER_ADMIN');

    const navSections = [
        {
            title: 'Vision',
            items: [
                { path: '/accueil', icon: <Home size={20} />, label: 'Accueil' },
                { path: '/carte', icon: <MapIcon size={20} />, label: 'Carte Globale' },
                { path: '/modules', icon: <Box size={20} />, label: 'Toutes les Analyses' },
            ]
        },
        ...(isAdmin ? [{
            title: 'Administration',
            items: [
                { path: '/admin/import', icon: <Database size={20} />, label: 'Importation de données' },
                ...(isSuperAdmin ? [{ path: '/super-admin/requests', icon: <Users size={20} />, label: 'Gérer les Demandes' }] : [])
            ]
        }] : []),
        ...(user ? [{
            title: 'Compte',
            items: [
                { path: '/profil', icon: <User size={20} />, label: 'Mon Profil' }
            ]
        }] : []),
        {
            title: 'Support',
            items: [
                { path: '/about', icon: <Info size={20} />, label: 'Guide & À propos' },
            ]
        }
    ];

    return (
        <div className="layout-container">
            <aside className="sidebar">
                {/* --- LOGO AREA --- */}
                <div className="sidebar-header" onClick={() => navigate('/')}>
                    <div className="sidebar-logo">
                        <img src={logo} alt="Logo" className="logo-icon-img" />
                        <span className="logo-text">VISION</span>
                    </div>
                </div>

                {/* --- NAVIGATION --- */}
                <nav className="nav-menu">
                    {navSections.map((section, index) => (
                        <div key={index} className="nav-section-wrapper">
                            <div className="nav-section">
                                <div className={`nav-section-title ${index === 0 ? 'first-title' : ''}`}>
                                    <span>{section.title}</span>
                                </div>
                                {section.items.map((item) => {
                                    const isActive = item.path === '/modules'
                                        ? location.pathname === '/modules' || ['/quadrant', '/beton', '/demographie', '/logement', '/thermique', '/miroir'].includes(location.pathname)
                                        : location.pathname === item.path;
                                    return (
                                        <Link
                                            key={item.path}
                                            to={item.path}
                                            className={`nav-item ${isActive ? 'active' : ''}`}
                                        >
                                            <div className="nav-icon">
                                                {item.icon}
                                            </div>
                                            <span className="nav-text">{item.label}</span>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </nav>

                {/* --- FOOTER --- */}
                <div className="logout-container">
                    {user ? (
                        <button onClick={handleLogout} className="auth-btn logout">
                            <div className="nav-icon">
                                <LogOut size={20} />
                            </div>
                            <span className="nav-text">Déconnexion</span>
                        </button>
                    ) : (
                        <button onClick={() => navigate('/login')} className="auth-btn login">
                            <div className="nav-icon">
                                <User size={20} />
                            </div>
                            <span className="nav-text">Connexion</span>
                        </button>
                    )}
                </div>
            </aside>

            <main className="main-content">
                <Outlet />
            </main>
        </div>
    );
}
