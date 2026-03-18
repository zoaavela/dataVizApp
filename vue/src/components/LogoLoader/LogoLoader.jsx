import React from 'react';
import logo from '../../assets/logo3.png';
import './LogoLoader.css';

export default function LogoLoader({ text = "Initialisation de VISION..." }) {
    return (
        <div className="loader-overlay">
            <div className="loader-content">
                <div className="loader-logo-wrapper">
                    <img src={logo} alt="Loading..." className="loader-logo-img" />
                </div>
                <div className="loader-text-container">
                    <p className="loader-text">{text}</p>
                    <div className="loader-progress-track">
                        <div className="loader-progress-bar"></div>
                    </div>
                </div>
            </div>
        </div>
    );
}