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
            title: 'Positionnement Précarité / Attractivité',
            description: 'Matrice de données croisant la précarité et l\'attractivité des départements.',
            icon: BarChart3,
            path: '/quadrant',
            accentColor: '#3b82f6'
        },
        {
            id: 'chomage',
            title: 'Taux de Chômage T4 2024',
            description: 'Cartographie et statistiques régionales du taux de chômage au 4ème trimestre 2024.',
            icon: Map,
            path: '/chomage',
            accentColor: '#4ade80'
        },
        {
            id: 'generations',
            title: 'Démographie & Population',
            description: 'Répartition par catégories d\'âge, évolution de la population et densité territoriale.',
            icon: Users,
            path: '/demographie',
            accentColor: '#f59e0b'
        },
        {
            id: 'protection',
            title: 'Statistiques des Logements',
            description: 'Données structurelles du parc immobilier (logements sociaux, résidences principales).',
            icon: PieChart,
            path: '/logement',
            accentColor: '#a855f7'
        },
        {
            id: 'thermique',
            title: 'DPE & Ancienneté des Bâtiments',
            description: 'Analyse du Diagnostic de Performance Énergétique (DPE) croisée avec l\'âge des habitations.',
            icon: TrendingUp,
            path: '/thermique',
            accentColor: '#f87171'
        },
        {
            id: 'miroir',
            title: 'Indicateurs par Département',
            description: 'Synthèse des données territoriales par département avec comparatif national.',
            icon: Target,
            path: '/house',
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