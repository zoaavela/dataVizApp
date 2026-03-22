import React, { useState, useEffect } from 'react';
import logo from '../../assets/logo3.png';
import './LandingLoader.css';

export default function LandingLoader() {
    const [shouldFadeOut, setShouldFadeOut] = useState(false);

    useEffect(() => {
        // Disparition douce après exactement 3 secondes
        const timer = setTimeout(() => {
            setShouldFadeOut(true);
        }, 3000);

        return () => clearTimeout(timer);
    }, []);

    return (
        <div className={`landing-loader-overlay ${shouldFadeOut ? 'fade-out' : ''}`}>
            <div className="landing-loader-content">
                <img src={logo} alt="VISION" className="landing-loader-img" />
                
                <div className="landing-loader-progress-wrapper">
                    <div className="landing-loader-progress-bar"></div>
                </div>
            </div>
        </div>
    );
}