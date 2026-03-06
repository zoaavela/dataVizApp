import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Map, BarChart3, PieChart, Users, TrendingUp, Target } from 'lucide-react';
import './Modules.css';

const ModuleCard = ({ title, description, icon: Icon, path, accentColor }) => {
    const navigate = useNavigate();

    return (
        <div
            className="bi-module-card"
            onClick={() => navigate(path)}
            style={{ '--accent': accentColor }}
        >
            <div className="module-icon-wrapper">
                <Icon size={32} strokeWidth={1.5} />
            </div>

            <div className="module-content">
                <h3 className="module-title">{title}</h3>
                <p className="module-desc">{description}</p>
            </div>
        </div>
    );
};

export default function ModulesSpace() {
    const modules = [
        {
            id: 'quadrant',
            title: 'Quadrant Stratégique',
            description: 'Matrice de positionnement croisant la précarité et l\'attractivité. Identifiez instantanément les territoires moteurs et vulnérables.',
            icon: BarChart3,
            path: '/quadrant',
            accentColor: '#3b82f6'
        },
        {
            id: 'beton',
            title: 'Le Paradoxe du Béton',
            description: 'L\'effort de construction est-il vraiment aligné avec la dynamique de population locale ? Analysez le risque de tension immobilière.',
            icon: Map,
            path: '/beton',
            accentColor: '#4ade80'
        },
        {
            id: 'generations',
            title: 'Le Choc des Générations',
            description: 'Comparaison directe : part des Jeunes vs part des Seniors. Visualisez la bascule démographique et les enjeux territoriaux.',
            icon: Users,
            path: '/demographie',
            accentColor: '#f59e0b'
        },
        {
            id: 'protection',
            title: 'L\'Indice de Protection',
            description: 'Jauge de capacité sociale : évaluez si l\'offre de logements sociaux est suffisante pour absorber la précarité locale.',
            icon: PieChart,
            path: '/logement',
            accentColor: '#a855f7'
        },
        {
            id: 'thermique',
            title: 'La Dette Thermique',
            description: 'L\'âge des bâtiments excuse-t-il leur consommation d\'énergie ? Repérez les zones de négligence ou d\'effort de rénovation.',
            icon: TrendingUp,
            path: '/thermique',
            accentColor: '#f87171'
        },
        {
            id: 'miroir',
            title: 'Le Miroir National',
            description: 'Benchmark territorial : situez instantanément un département par rapport à la moyenne nationale sur 5 indicateurs clés.',
            icon: Target,
            path: '/miroir',
            accentColor: '#2dd4bf'
        }
    ];

    return (
        <div className="bi-dashboard-container module-hub-container">
            <header className="bi-header module-hub-header">
                <div>
                    <div className="bi-surtitle">Gouvernance des Données</div>
                    <h1 className="bi-title">Portail Analytique</h1>
                    <p className="bi-subtitle">Sélectionnez un module d'analyse pour explorer le maillage territorial et révéler les dynamiques sous-jacentes.</p>
                </div>
            </header>

            <div className="bi-module-grid">
                {modules.map((mod) => (
                    <ModuleCard
                        key={mod.id}
                        {...mod}
                    />
                ))}
            </div>
        </div>
    );
}