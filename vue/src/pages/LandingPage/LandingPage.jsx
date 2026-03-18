import React, { Suspense, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, ChartLine, Home, Flame } from 'lucide-react';
import logo from '../../assets/logo3.png';
import LandingLoader from '../../components/LandingLoader/LandingLoader'; // <-- Pense à vérifier ce chemin
import './LandingPage.css';

const Spline = React.lazy(() => import('@splinetool/react-spline'));

// Structure de données pour la nouvelle section de fonctionnalités
const features = [
    { icon: User, title: 'Analyse Démographique', description: 'Comprendre la structure et l’évolution de la population pour adapter les services publics.' },
    { icon: ChartLine, title: 'Dynamique Économique', description: 'Identifier les secteurs en croissance, les zones d’emploi et les opportunités d’investissement.' },
    { icon: Home, title: 'Observatoire Immobilier', description: 'Suivre les tendances du marché, la vacance et les besoins en logement.' },
    { icon: Flame, title: 'Stratégie Énergétique', description: 'Évaluer le parc de logements, cibler les passoires thermiques et optimiser la rénovation.' },
];

export default function LandingPage() {
    const navigate = useNavigate();

    // État pour savoir si la scène 3D est totalement chargée et prête à être affichée
    const [isSplineLoaded, setIsSplineLoaded] = useState(false);

    // OPTIMISATION : Préchargement agressif du fichier 3D en arrière-plan
    // Cela permet au navigateur de le télécharger avant même que Spline ne le demande
    useEffect(() => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'fetch';
        link.crossOrigin = 'anonymous';
        link.href = 'https://prod.spline.design/Hx4YiNij3PQvCW59/scene.splinecode';
        document.head.appendChild(link);

        return () => document.head.removeChild(link);
    }, []);

    return (
        <div className="landing-root">
            {/* Nouveau Loader Premium qui écoute l'état de Spline */}
            <LandingLoader isLoaded={isSplineLoaded} />

            <div className="landing-bg-spline">
                <Suspense fallback={null}>
                    {/* On utilise l'événement onLoad natif de Spline pour déclencher la disparition du loader */}
                    <Spline
                        scene="https://prod.spline.design/Hx4YiNij3PQvCW59/scene.splinecode"
                        onLoad={() => setIsSplineLoaded(true)}
                    />
                </Suspense>
            </div>

            <div className="landing-gradient"></div>

            <header className="landing-top-bar">
                <img src={logo} alt="Logo" className="landing-logo" />
                <span className="landing-brand">VISION</span>
            </header>

            <main className="landing-content-area">
                <div className="landing-main-block">
                    {/* Texte principal enrichi */}
                    <div className="landing-text-block">
                        <h1 className="landing-headline">
                            L'avenir de votre territoire,<br />
                            décrypté. Avec précision.
                        </h1>
                        <p className="landing-sub-headline">
                            Une plateforme d'analyse de données avancée, fusionnant l'IA territoriale et la visualisation stratégique.
                            Anticipez les tendances, optimisez vos décisions et façonnez le développement de demain.
                        </p>

                        <div className="landing-button-group">
                            <button onClick={() => navigate('/accueil')} className="btn-glass-primary">
                                Consulter la Data Vision
                            </button>
                            <button onClick={() => navigate('/login')} className="btn-glass-secondary">
                                Se connecter
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}