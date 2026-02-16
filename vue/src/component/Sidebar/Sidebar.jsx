import React, { useState } from 'react';
import { Home, User, Settings, LogOut, Menu, ChevronLeft } from 'lucide-react';
import './Sidebar.css';

const Sidebar = () => {
    const [isOpen, setIsOpen] = useState(true);
    const [activeItem, setActiveItem] = useState("Accueil");

    const menuItems = [
        { name: "Accueil", icon: <Home size={22} /> },
        { name: "À propos", icon: <User size={22} /> },
        { name: "Paramètres", icon: <Settings size={22} /> },
    ];

    return (
        <div className={`sidebar ${isOpen ? 'open' : 'closed'}`}>

            {/* --- HEADER (BOUTON TOGGLE) --- */}
            <div className="header">
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