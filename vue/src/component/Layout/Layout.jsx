import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { Home, User, Map as MapIcon, Box, Database, Info, LogOut } from 'lucide-react';
import logo from '../../assets/logo3.png';
import './Layout.css';

export default function Layout({ user, setUser }) {
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        setUser(null);
        navigate('/login');
    };

    const isAdmin = user?.roles?.includes('ROLE_ADMIN');

    const navSections = [
        {
            title: 'Menu',
            items: [
                { path: '/accueil', icon: <Home size={20} />, label: 'Accueil' },
                { path: '/profil', icon: <User size={20} />, label: 'Mon Profil' },
                { path: '/carte', icon: <MapIcon size={20} />, label: 'Carte Globale' },
            ]
        },
        {
            title: 'Modules',
            items: [
                { path: '/modules', icon: <Box size={20} />, label: 'Analyses' },
                ...(isAdmin
                    ? [{ path: '/admin/import', icon: <Database size={20} />, label: 'Import CSV' }]
                    : [])
            ]
        },
        {
            title: 'Outils',
            items: [
                { path: '/about', icon: <Info size={20} />, label: 'À propos' },
            ]
        }
    ];

    return (
        <div className="layout-container">
            <aside className="sidebar">
                {/* --- LOGO AREA --- */}
                <div className="sidebar-logo">
                    <img src={logo} alt="Logo" className="logo-icon-img" />
                    <span className="logo-text">VISION</span>
                </div>

                {/* --- NAVIGATION --- */}
                <nav className="nav-menu">
                    {navSections.map((section, index) => (
                        <div key={index} className="nav-section">
                            <div className="nav-section-title">{section.title}</div>
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
                                        <div className="nav-text">{item.label}</div>
                                    </Link>
                                );
                            })}
                        </div>
                    ))}
                </nav>

                {/* --- FOOTER --- */}
                <div className="logout-container">
                    <button onClick={handleLogout} className="logout-btn">
                        <div className="nav-icon">
                            <LogOut size={20} />
                        </div>
                        <span className="nav-text">Déconnexion</span>
                    </button>
                </div>
            </aside>

            <main className="main-content">
                <Outlet />
            </main>
        </div>
    );
}