import React, { useState } from 'react';
// Ajout de l'icône Upload pour l'import, et Info pour à propos
import { Home, Info, Upload, LogOut, Menu, ChevronLeft } from 'lucide-react';
import logo from '../../assets/logo3.png';
import './Sidebar.css';

const Sidebar = ({ user }) => {
    const [isOpen, setIsOpen] = useState(true);
    const [activeItem, setActiveItem] = useState("Accueil");

    // Menus de base accessibles à tous
    const menuItems = [
        { name: "Accueil", icon: <Home size={22} /> },
        { name: "À propos", icon: <Info size={22} /> },
    ];

    // Vérification du rôle administrateur (basé sur ton format de base de données)
    const isAdmin = user && user.roles && user.roles.includes("ROLE_ADMIN");

    // Ajout conditionnel du menu Import
    if (isAdmin) {
        menuItems.push({ name: "Import", icon: <Upload size={22} /> });
    }

    return (
        <div className={`sidebar ${isOpen ? 'open' : 'closed'}`}>

            {/* --- HEADER & LOGO --- */}
            <div className="header">
                <div className="logo-container">
                    <img src={logo} alt="Logo" className="logo-img" />
                    <span className="logo-text">VISION</span>
                </div>

                <button className="toggle-btn" onClick={() => setIsOpen(!isOpen)}>
                    {isOpen ? <ChevronLeft size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* --- LISTE DES MENUS --- */}
            <div className="menu-list">
                {menuItems.map((item) => (
                    <div
                        key={item.name}
                        className={`menu-item ${activeItem === item.name ? 'active' : ''}`}
                        onClick={() => setActiveItem(item.name)}
                    >
                        <div className="icon-box">
                            {item.icon}
                        </div>
                        <span className="label">{item.name}</span>
                    </div>
                ))}
            </div>

            {/* --- FOOTER --- */}
            <div className="footer">
                <div className="menu-item logout" onClick={() => console.log('Logout')}>
                    <div className="icon-box">
                        <LogOut size={22} />
                    </div>
                    <span className="label">Déconnexion</span>
                </div>
            </div>

        </div>
    );
};

export default Sidebar;