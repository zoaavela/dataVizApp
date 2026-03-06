import React, { useState, useEffect, useMemo } from 'react';
import {
    Chart as ChartJS,
    LinearScale,
    CategoryScale,
    PointElement,
    LineElement,
    Tooltip,
    Legend
} from 'chart.js';
import { Scatter, Line } from 'react-chartjs-2';
import annotationPlugin from 'chartjs-plugin-annotation';
import { getQuadrantData } from '../../services/dataService';
import { getCarteData } from '../../services/territoireService';
import './Quadrant.css';
import LogoLoader from '../LogoLoader/LogoLoader';

ChartJS.register(LinearScale, CategoryScale, PointElement, LineElement, Tooltip, Legend, annotationPlugin);

const MEDIAN_PAUVRETE = 14.5;
const MEDIAN_MIGRATOIRE = 0;

const PROFILES_INFO = {
    dynamique: {
        id: 'dynamique',
        title: "Croissance Dynamique",
        color: "#4ade80",
        desc: "Indicateurs économiques solides couplés à une forte attractivité démographique. Ces territoires attirent de nouveaux habitants tout en maintenant un niveau de précarité sous contrôle."
    },
    residentiel: {
        id: 'residentiel',
        title: "Attractivité Résidentielle",
        color: "#2dd4bf",
        desc: "Afflux migratoire positif soutenu par un cadre de vie attractif, malgré un taux de pauvreté supérieur à la médiane. L'enjeu est l'intégration économique des nouveaux arrivants."
    },
    sature: {
        id: 'sature',
        title: "Tension Économique",
        color: "#94a3b8",
        desc: "Bassins d'emplois majeurs présentant une forte création de richesse (faible pauvreté), mais confrontés à un déficit migratoire (coût de la vie, saturation foncière)."
    },
    vulnerable: {
        id: 'vulnerable',
        title: "Vulnérabilité Structurelle",
        color: "#f87171",
        desc: "Territoires cumulant fragilité socio-économique (forte pauvreté) et déclin démographique (départs). Ces zones nécessitent des politiques de revitalisation massives."
    }
};

const getProfileKey = (x, y) => {
    if (x < MEDIAN_PAUVRETE && y > MEDIAN_MIGRATOIRE) return 'dynamique';
    if (x >= MEDIAN_PAUVRETE && y > MEDIAN_MIGRATOIRE) return 'residentiel';
    if (x < MEDIAN_PAUVRETE && y <= MEDIAN_MIGRATOIRE) return 'sature';
    return 'vulnerable';
};

export default function QuadrantStrategique() {
    const [territoires, setTerritoires] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [apiError, setApiError] = useState(false);

    const [selectedDept, setSelectedDept] = useState('');
    const [selectedRegion, setSelectedRegion] = useState('all');
    const [selectedYear, setSelectedYear] = useState('all');

    const [activeFilter, setActiveFilter] = useState(null);

    useEffect(() => {
        const fetchDonnees = async () => {
            try {
                const [indicateursRes, territoiresRes] = await Promise.all([
                    getQuadrantData(),
                    getCarteData().catch(() => null)
                ]);

                await new Promise(resolve => setTimeout(resolve, 800));

                if (!indicateursRes) throw new Error("API Quadrant injoignable.");

                const rawIndicateurs = indicateursRes?.['hydra:member'] || indicateursRes?.data || indicateursRes;
                const rawTerritoires = territoiresRes?.['hydra:member'] || territoiresRes?.data || territoiresRes || [];

                const mapTerritoires = {};
                rawTerritoires.forEach(t => {
                    if (t.id) mapTerritoires[t.id.toString()] = t;
                    if (t.code) mapTerritoires[t.code.toString()] = t;
                });

                const donneesFormatees = (Array.isArray(rawIndicateurs) ? rawIndicateurs : []).map(ind => {
                    let tId = null;

                    if (ind.territoire) {
                        if (typeof ind.territoire === 'string') tId = ind.territoire.split('/').pop();
                        else if (typeof ind.territoire === 'object') tId = ind.territoire.id || ind.territoire.code || (ind.territoire['@id'] ? ind.territoire['@id'].split('/').pop() : null);
                    }
                    else if (ind.territoire_id) tId = ind.territoire_id;
                    else if (ind.territoireId) tId = ind.territoireId;

                    const territoireLie = tId ? mapTerritoires[tId.toString()] : null;
                    const pauvrete = parseFloat(ind.tauxPauvrete ?? ind.taux_pauvrete);
                    const migratoire = parseFloat(ind.soldeMigratoire ?? ind.solde_migratoire);

                    return {
                        id: tId || Math.random().toString(),
                        nom: territoireLie ? territoireLie.nom : `Zone Inconnue (ID: ${tId || 'Introuvable'})`,
                        region: territoireLie ? (territoireLie.region?.nom || territoireLie.region) : 'Non défini',
                        x: isNaN(pauvrete) ? 0 : pauvrete,
                        y: isNaN(migratoire) ? 0 : migratoire,
                        annee: ind.annee || 'Non défini',
                        profile: getProfileKey(isNaN(pauvrete) ? 0 : pauvrete, isNaN(migratoire) ? 0 : migratoire)
                    };
                });

                setTerritoires(donneesFormatees);
            } catch (error) {
                console.error("Erreur critique d'assemblage:", error);
                setApiError(true);
            } finally {
                setIsLoading(false);
            }
        };
        fetchDonnees();
    }, []);

    const handleDeptChange = (e) => {
        setSelectedDept(e.target.value);
        if (e.target.value !== '') setActiveFilter(null);
    };

    const handleQuadrantClick = (profileKey) => {
        if (activeFilter === profileKey) {
            setActiveFilter(null);
        } else {
            setActiveFilter(profileKey);
            setSelectedDept('');
        }
    };

    const departementsFiltres = useMemo(() => {
        return territoires.filter(d => {
            const regionMatch = selectedRegion === 'all' || d.region === selectedRegion;
            const anneeMatch = selectedYear === 'all' || d.annee.toString() === selectedYear.toString();
            return regionMatch && anneeMatch;
        });
    }, [territoires, selectedRegion, selectedYear]);

    const departementsUniques = useMemo(() => {
        const uniques = [];
        const nomsVus = new Set();
        for (const item of departementsFiltres) {
            if (item.nom && !nomsVus.has(item.nom)) {
                nomsVus.add(item.nom);
                uniques.push(item);
            }
        }
        return uniques.sort((a, b) => a.nom.localeCompare(b.nom));
    }, [departementsFiltres]);

    // CORRECTION CRITIQUE : L'historique et la sélection utilisent d.nom au lieu de d.id
    const deptHistory = useMemo(() => {
        if (!selectedDept) return [];
        return territoires
            .filter(t => t.nom === selectedDept && t.annee !== 'Non défini')
            .sort((a, b) => parseInt(a.annee) - parseInt(b.annee));
    }, [territoires, selectedDept]);

    const activeDeptData = useMemo(() => {
        if (!selectedDept) return null;
        const matches = departementsFiltres.filter(t => t.nom === selectedDept);
        if (matches.length === 0) return null;
        // On récupère l'année la plus récente par défaut pour le panneau d'infos
        return matches.sort((a, b) => parseInt(b.annee) - parseInt(a.annee))[0];
    }, [departementsFiltres, selectedDept]);

    const chartData = useMemo(() => {
        const datasets = [];

        // 1. Dataset principal (Nuage de points)
        datasets.push({
            type: 'scatter',
            label: 'Territoires',
            data: departementsFiltres,
            backgroundColor: (ctx) => {
                const d = ctx.raw;
                if (!d) return;
                const baseColor = PROFILES_INFO[d.profile].color;

                // Utilisation de d.nom pour la correspondance
                if (selectedDept) {
                    return d.nom === selectedDept ? baseColor : baseColor + '15';
                }
                if (activeFilter) {
                    return d.profile === activeFilter ? baseColor : baseColor + '15';
                }
                return baseColor + 'CC';
            },
            pointRadius: (ctx) => {
                const d = ctx.raw;
                return (selectedDept && d?.nom === selectedDept) ? 12 : 6;
            },
            pointHoverRadius: 10,
            pointBorderColor: (ctx) => {
                const d = ctx.raw;
                return (selectedDept && d?.nom === selectedDept) ? '#ffffff' : 'transparent';
            },
            pointBorderWidth: (ctx) => {
                const d = ctx.raw;
                return (selectedDept && d?.nom === selectedDept) ? 2 : 0;
            },
            order: 1
        });

        // 2. Ligne de trajectoire si on sélectionne un département + "Toutes les années"
        if (selectedDept && selectedYear === 'all' && deptHistory.length > 1) {
            datasets.push({
                type: 'line',
                label: `Trajectoire ${selectedDept}`,
                data: deptHistory,
                borderColor: '#cbd5e1',
                borderWidth: 2,
                borderDash: [5, 5],
                pointRadius: 0, // Les points sont gérés par le dataset scatter
                fill: false,
                tension: 0.2,
                order: 2 // Ligne dessinée derrière les points
            });
        }

        return { datasets };
    }, [departementsFiltres, selectedDept, activeFilter, selectedYear, deptHistory]);

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        onClick: (event, elements) => {
            if (elements.length > 0) {
                const index = elements[0].index;
                const datasetIndex = elements[0].datasetIndex;
                const dataPoint = chartData.datasets[datasetIndex].data[index];
                if (dataPoint && dataPoint.nom) {
                    setSelectedDept(dataPoint.nom);
                    setActiveFilter(null);
                }
            }
        },
        onHover: (event, elements) => {
            if (event.native?.target) {
                event.native.target.style.cursor = elements?.length ? 'pointer' : 'default';
            }
        },
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: '#0f172a', borderColor: '#1e293b', borderWidth: 1, padding: 14,
                titleFont: { size: 14, family: 'inherit', weight: 'bold' },
                bodyFont: { size: 13, family: 'inherit', color: '#cbd5e1' },
                displayColors: false,
                callbacks: {
                    title: (context) => `${context[0].raw.nom} (${context[0].raw.annee})`,
                    label: (context) => `Pauvreté: ${context.raw.x.toFixed(1)}% | Migration: ${context.raw.y.toFixed(1)}%`
                }
            },
            annotation: {
                annotations: {
                    lineX: {
                        type: 'line', xMin: MEDIAN_PAUVRETE, xMax: MEDIAN_PAUVRETE, borderColor: '#475569', borderWidth: 2, borderDash: [4, 4],
                        label: { display: true, content: 'Pauvreté Médiane', position: 'start', backgroundColor: '#0f172a', color: '#94a3b8', font: { size: 10 } }
                    },
                    lineY: {
                        type: 'line', yMin: MEDIAN_MIGRATOIRE, yMax: MEDIAN_MIGRATOIRE, borderColor: '#475569', borderWidth: 2, borderDash: [4, 4],
                        label: { display: true, content: 'Équilibre Migratoire', position: 'end', backgroundColor: '#0f172a', color: '#94a3b8', font: { size: 10 }, xAdjust: -20 }
                    }
                }
            }
        },
        scales: {
            x: {
                type: 'linear',
                title: { display: true, text: 'TAUX DE PAUVRETÉ (%)', color: '#64748b', font: { size: 11, weight: 'bold' } },
                grid: { color: 'rgba(30, 41, 59, 0.5)' }, ticks: { color: '#64748b' },
                suggestedMin: 0, suggestedMax: 25
            },
            y: {
                type: 'linear',
                title: { display: true, text: 'SOLDE MIGRATOIRE (%)', color: '#64748b', font: { size: 11, weight: 'bold' } },
                grid: { color: 'rgba(30, 41, 59, 0.5)' }, ticks: { color: '#64748b' },
                suggestedMin: -12, suggestedMax: 10
            }
        }
    };

    const currentDisplayInfo = activeDeptData
        ? PROFILES_INFO[activeDeptData.profile]
        : (activeFilter ? PROFILES_INFO[activeFilter] : null);

    // Données pour le petit graphique temporel en bas à gauche
    const lineChartData = useMemo(() => {
        const color = currentDisplayInfo ? currentDisplayInfo.color : '#94a3b8';
        return {
            labels: deptHistory.map(d => d.annee),
            datasets: [
                {
                    label: 'Pauvreté (%)',
                    data: deptHistory.map(d => d.x),
                    borderColor: '#64748b',
                    backgroundColor: '#64748b',
                    yAxisID: 'y',
                    tension: 0.3,
                    pointRadius: 4,
                    borderWidth: 2
                },
                {
                    label: 'Solde Migratoire (%)',
                    data: deptHistory.map(d => d.y),
                    borderColor: color,
                    backgroundColor: color,
                    yAxisID: 'y1',
                    tension: 0.3,
                    pointRadius: 4,
                    borderWidth: 2
                }
            ]
        };
    }, [deptHistory, currentDisplayInfo]);

    const lineChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: '#0f172a', borderColor: '#1e293b', borderWidth: 1,
                titleFont: { family: 'inherit', size: 11 },
                bodyFont: { family: 'inherit', size: 11 },
                callbacks: {
                    label: (context) => `${context.dataset.label}: ${context.raw.toFixed(1)}%`
                }
            }
        },
        scales: {
            x: {
                grid: { display: false },
                ticks: { color: '#64748b', font: { size: 10 } }
            },
            y: {
                type: 'linear',
                display: true,
                position: 'left',
                grid: { color: 'rgba(30, 41, 59, 0.3)', drawBorder: false },
                ticks: { color: '#64748b', font: { size: 10 } },
                title: { display: true, text: 'Pauvreté', color: '#64748b', font: { size: 10 } }
            },
            y1: {
                type: 'linear',
                display: true,
                position: 'right',
                grid: { drawOnChartArea: false },
                ticks: { color: currentDisplayInfo?.color || '#94a3b8', font: { size: 10 } },
                title: { display: true, text: 'Migration', color: currentDisplayInfo?.color || '#94a3b8', font: { size: 10 } }
            }
        }
    };

    const regionsUniques = [...new Set(territoires.map(t => t.region))].filter(r => r !== 'Non défini');
    const anneesUniques = [...new Set(territoires.map(t => t.annee))].filter(a => a !== 'Non défini').sort((a, b) => b - a);

    if (isLoading) return <LogoLoader text="Construction de la matrice..." />;
    if (apiError) return <div className="bi-error-msg">Erreur de synchronisation avec la source de données.</div>;

    return (
        <div className="bi-dashboard-container">
            <header className="bi-header">
                <div>
                    <h1 className="bi-title">Matrice de Positionnement Stratégique</h1>
                    <p className="bi-subtitle">Analyse croisée de la dynamique démographique et de la solidité économique des territoires.</p>
                </div>
            </header>

            <nav className="bi-toolbar">
                <div className="bi-filter-group">
                    <label>Année de référence</label>
                    <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
                        <option value="all">Toutes les années</option>
                        {anneesUniques.map(a => <option key={a} value={a}>{a}</option>)}
                    </select>
                </div>

                <div className="bi-filter-group">
                    <label>Périmètre Régional</label>
                    <select value={selectedRegion} onChange={(e) => { setSelectedRegion(e.target.value); setSelectedDept(''); setActiveFilter(null); }}>
                        <option value="all">Toutes les régions</option>
                        {regionsUniques.sort().map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                </div>

                <div className="bi-filter-group">
                    <label>Département Cible</label>
                    <select value={selectedDept} onChange={handleDeptChange}>
                        <option value="">Sélectionner un département...</option>
                        {/* CORRECTION : value est d.nom au lieu de d.id */}
                        {departementsUniques.map(d => (
                            <option key={d.nom} value={d.nom}>{d.nom}</option>
                        ))}
                    </select>
                </div>
            </nav>

            <div className="bi-main-content-split">
                <div className="bi-adaptive-sidebar">
                    <div className="bi-quadrant-toggles">
                        {Object.values(PROFILES_INFO).map(prof => (
                            <button
                                key={prof.id}
                                onClick={() => handleQuadrantClick(prof.id)}
                                className={`bi-q-btn ${activeFilter === prof.id || (activeDeptData && activeDeptData.profile === prof.id) ? 'active' : ''}`}
                                style={{ '--btn-color': prof.color }}
                            >
                                {prof.title}
                            </button>
                        ))}
                    </div>

                    <div className="bi-adaptive-card" style={{ borderLeftColor: currentDisplayInfo ? currentDisplayInfo.color : '#334155' }}>
                        {currentDisplayInfo ? (
                            <>
                                <div className="adaptive-header">
                                    <h2 style={{ color: currentDisplayInfo.color }}>{currentDisplayInfo.title}</h2>
                                </div>

                                {activeDeptData && (
                                    <div className="adaptive-dept-focus">
                                        <h3>Focus : {activeDeptData.nom} {selectedYear === 'all' && `(${activeDeptData.annee})`}</h3>
                                        <div className="adaptive-stats-grid">
                                            <div className="adaptive-stat-box">
                                                <span className="stat-label">Taux de Pauvreté</span>
                                                <span className="stat-value">{activeDeptData.x.toFixed(1)}%</span>
                                            </div>
                                            <div className="adaptive-stat-box">
                                                <span className="stat-label">Solde Migratoire</span>
                                                <span className="stat-value">{activeDeptData.y > 0 ? '+' : ''}{activeDeptData.y.toFixed(1)}%</span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="adaptive-description">
                                    <p>{currentDisplayInfo.desc}</p>
                                </div>

                                {selectedDept && deptHistory.length > 1 && (
                                    <div className="adaptive-history-chart" style={{ height: '200px', marginTop: '1.5rem', borderTop: '1px dashed #334155', paddingTop: '1rem', display: 'flex', flexDirection: 'column' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', alignItems: 'center' }}>
                                            <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase' }}>Évolution Temporelle</span>
                                            <div style={{ display: 'flex', gap: '1rem', fontSize: '0.65rem', textTransform: 'uppercase', fontWeight: '700' }}>
                                                <span style={{ color: '#64748b' }}>■ Pauvreté</span>
                                                <span style={{ color: currentDisplayInfo.color }}>■ Migration</span>
                                            </div>
                                        </div>
                                        <div style={{ flex: 1, minHeight: 0 }}>
                                            <Line data={lineChartData} options={lineChartOptions} />
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="adaptive-empty-state">
                                <h3>Analysez un profil</h3>
                                <p>Cliquez sur l'un des 4 profils au-dessus pour comprendre ses caractéristiques, ou sélectionnez un département spécifique pour voir son diagnostic détaillé.</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="bi-chart-panel quadrant-panel">
                    <div className="chart-toolbar">
                        <h2 className="chart-title">Nuage de dispersion des territoires</h2>
                    </div>
                    <div className="chart-container-relative" style={{ height: '500px' }}>
                        <Scatter data={chartData} options={chartOptions} />
                    </div>
                </div>
            </div>
        </div>
    );
}