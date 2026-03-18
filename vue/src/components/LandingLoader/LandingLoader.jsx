import React, { useState, useEffect } from 'react';
import logo from '../../assets/logo3.png';
import './LandingLoader.css';

export default function LandingLoader() {
    const [shouldFadeOut, setShouldFadeOut] = useState(false);

    useEffect(() => {
        // Le loader durera exactement 3 secondes avant de disparaître
        const timer = setTimeout(() => {
            setShouldFadeOut(true);
        }, 1000);

        return () => clearTimeout(timer);
    }, []);

    return (
        <div className={`landing-loader-overlay ${shouldFadeOut ? 'fade-out' : ''}`}>
            <div className="landing-loader-content">
                <div className="landing-loader-logo-glow">
                    <img src={logo} alt="VISION" className="landing-loader-img" />
                </div>


            </div>
        </div>
    );
}