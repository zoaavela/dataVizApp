// Chomage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Tooltip,
    Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { getChomageData } from '../../services/dataService';
import { getCarteData } from '../../services/territoireService';
import './Chomage.css';
import LogoLoader from '../../components/LogoLoader/LogoLoader';
import SyncErrorAlert from '../../components/SyncErrorAlert/SyncErrorAlert';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const parseNumber = (val) => {
    if (val === null || val === undefined) return 0;
    if (typeof val === 'number') return val;
    return parseFloat(val.toString().replace(',', '.')) || 0;
};

export default function Chomage() {
    const [donneesGlobales, setDonneesGlobales] = useState([]);
    const [anneesDisponibles, setAnneesDisponibles] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [apiError, setApiError] = useState(null);
    const [retryTrigger, setRetryTrigger] = useState(0);

    const [selectedYear, setSelectedYear] = useState('');
    const [selectedRegion, setSelectedRegion] = useState('all');
    const [selectedDept, setSelectedDept] = useState('');
    const [sortMode, setSortMode] = useState('taux_desc');

    useEffect(() => {
        const fetchData = async () => {
            setApiError(null);
            try {
                setIsLoading(true);
                const [chomageRes, territoiresRes] = await Promise.all([
                    getChomageData(),
                    getCarteData()
                ]);

                const rawChomage = chomageRes?.['hydra:member'] || chomageRes?.data || chomageRes || [];
                const rawTerritoires = territoiresRes?.['hydra:member'] || territoiresRes?.data || territoiresRes || [];

                const mapTerritoires = {};
                rawTerritoires.forEach(t => {
                    if (t.id) mapTerritoires[t.id.toString()] = t;
                    if (t.code) mapTerritoires[t.code.toString()] = t;
                });

                const dataNettoyee = (Array.isArray(rawChomage) ? rawChomage : [rawChomage]).map(ind => {
                    if (!ind) return null;
                    let tId = ind.territoire?.id || ind.territoireId || ind.territoire_id || ind.code_departement;
                    const tLie = tId ? mapTerritoires[tId.toString()] : null;

                    return {
                        id: tId || Math.random().toString(),
                        nom: tLie?.nom || ind.nom_departement || `Zone ${tId}`,
                        region: tLie?.region?.nom || tLie?.region || ind.nom_region || 'Non défini',
                        annee: ind.annee ? ind.annee.toString() : '2023',
                        taux: parseNumber(ind.taux ?? ind['Taux de chômage au T4 (en %)'] ?? 0)
                    };
                }).filter(d => d && !d.nom.startsWith('Zone null'));

                const dataParAnnee = {};
                dataNettoyee.forEach(d => {
                    if (!dataParAnnee[d.annee]) dataParAnnee[d.annee] = new Map();
                    dataParAnnee[d.annee].set(d.nom, d);
                });

                let dataEnrichie = [];
                Object.keys(dataParAnnee).forEach(annee => {
                    dataEnrichie = dataEnrichie.concat(Array.from(dataParAnnee[annee].values()));
                });

                setDonneesGlobales(dataEnrichie);
                const annees = [...new Set(dataEnrichie.map(d => d.annee))].sort((a, b) => b - a);
                setAnneesDisponibles(annees);

                if (annees.length > 0) setSelectedYear(annees[0].toString());
            } catch (error) {
                console.error("Erreur d'assemblage des données :", error);
                setApiError("Le serveur de données ne répond pas. Veuillez réessayer ultérieurement.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [retryTrigger]);

    const yearData = useMemo(() => {
        if (!selectedYear) return [];
        return donneesGlobales.filter(d => d.annee === selectedYear);
    }, [donneesGlobales, selectedYear]);

    const availableRegions = useMemo(() => {
        return [...new Set(yearData.map(d => d.region))].filter(r => r !== 'Non défini').sort();
    }, [yearData]);

    const isNationalView = selectedRegion === 'all';

    const regionalAggregates = useMemo(() => {
        const map = {};
        yearData.forEach(d => {
            if (d.region === 'Non défini') return;
            if (!map[d.region]) map[d.region] = { sumTaux: 0, count: 0 };
            map[d.region].sumTaux += d.taux;
            map[d.region].count++;
        });
        return Object.keys(map).map(r => {
            return { nom: r, isRegion: true, taux: map[r].sumTaux / map[r].count };
        });
    }, [yearData]);

    const chartDataArray = useMemo(() => {
        let baseData = isNationalView ? regionalAggregates : yearData.filter(d => d.region === selectedRegion);
        return [...baseData].sort((a, b) => {
            if (sortMode === 'taux_desc') return b.taux - a.taux;
            if (sortMode === 'taux_asc') return a.taux - b.taux;
            return a.nom.localeCompare(b.nom);
        });
    }, [isNationalView, regionalAggregates, yearData, selectedRegion, sortMode]);

    useEffect(() => {
        if (!isNationalView && chartDataArray.length > 0) {
            const isValid = chartDataArray.some(d => d.nom === selectedDept);
            if (!isValid) setSelectedDept(chartDataArray[0].nom);
        } else {
            setSelectedDept('');
        }
    }, [chartDataArray, selectedDept, isNationalView]);

    const statsMoyennes = useMemo(() => {
        if (!yearData.length) return { taux: 0 };
        const sumTaux = yearData.reduce((acc, d) => acc + d.taux, 0);
        return { taux: sumTaux / yearData.length };
    }, [yearData]);

    const statsRegionalesActuelles = useMemo(() => {
        if (isNationalView) return null;
        return regionalAggregates.find(r => r.nom === selectedRegion) || null;
    }, [isNationalView, regionalAggregates, selectedRegion]);

    const activeEntity = useMemo(() => {
        if (isNationalView) return chartDataArray.find(d => d.nom === selectedRegion) || null;
        return chartDataArray.find(d => d.nom === selectedDept) || chartDataArray[0] || null;
    }, [isNationalView, chartDataArray, selectedRegion, selectedDept]);

    const getChomageStatus = (taux) => {
        if (taux >= 9) return { title: "Chômage Élevé", color: "#ef4444", desc: "Taux critique dépassant largement la moyenne nationale." };
        if (taux >= 6.5) return { title: "Marché Intermédiaire", color: "#8b5cf6", desc: "Taux de chômage modéré, dans la moyenne." };
        return { title: "Plein Emploi Potentiel", color: "#22c55e", desc: "Taux très bas. Forte tension sur les recrutements." };
    };

    const activeAnalysis = activeEntity ? getChomageStatus(activeEntity.taux) : null;

    const chartData = useMemo(() => {
        const activeName = isNationalView ? selectedRegion : selectedDept;
        return {
            labels: chartDataArray.map(d => d.nom),
            datasets: [
                {
                    label: 'Taux de Chômage (%)',
                    data: chartDataArray.map(d => d.taux),
                    backgroundColor: chartDataArray.map(d => d.nom === activeName ? '#8b5cf6' : 'rgba(139, 92, 246, 0.3)'),
                    borderColor: chartDataArray.map(d => d.nom === activeName ? '#8b5cf6' : 'transparent'),
                    borderWidth: 1,
                    borderRadius: 4,
                }
            ]
        };
    }, [chartDataArray, isNationalView, selectedRegion, selectedDept]);

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        onClick: (event, elements) => {
            if (elements.length > 0) {
                const index = elements[0].index;
                const clickedItem = chartDataArray[index];
                if (isNationalView) {
                    setSelectedRegion(clickedItem.nom);
                    setSelectedDept('');
                } else {
                    setSelectedDept(clickedItem.nom);
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
                backgroundColor: '#0f172a',
                padding: 12,
                titleFont: { size: 13, weight: 'bold' },
                bodyFont: { size: 13 },
                callbacks: { label: (context) => `Chômage : ${context.raw.toFixed(1)}%` }
            }
        },
        scales: {
            y: {
                grid: { color: 'rgba(30, 41, 59, 0.5)', drawBorder: false },
                title: { display: true, text: "TAUX DE CHÔMAGE (%)", color: '#64748b', font: { size: 11, weight: 'bold' } },
                ticks: { color: '#64748b', font: { weight: '600' }, callback: (value) => value + '%' },
                beginAtZero: true
            },
            x: {
                grid: { display: false, drawBorder: false },
                ticks: {
                    color: (ctx) => {
                        const activeName = isNationalView ? selectedRegion : selectedDept;
                        return ctx.tick.label === activeName ? '#ffffff' : '#94a3b8';
                    },
                    font: (ctx) => {
                        const activeName = isNationalView ? selectedRegion : selectedDept;
                        return { size: 11, weight: ctx.tick.label === activeName ? '800' : '500' };
                    },
                    maxRotation: 45,
                    minRotation: 45
                }
            }
        },
        animation: { duration: 400 }
    };

    if (isLoading) return <LogoLoader text="Extraction des indicateurs d'emploi..." />;

    return (
        <div className="bi-dashboard-container chomage-theme">
            <header className="bi-header">
                <div>
                    <h1 className="bi-title">Dynamique de l'Emploi</h1>
                    <p className="bi-subtitle">Analyse classique du taux de chômage par territoire.</p>
                </div>
            </header>

            <nav className="bi-toolbar">
                <div className="bi-filter-group">
                    <label>Année</label>
                    <select value={selectedYear} onChange={(e) => { setSelectedYear(e.target.value); setSelectedRegion('all'); }}>
                        {anneesDisponibles.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                </div>
                <div className="bi-filter-group">
                    <label>Périmètre Spatial</label>
                    <select value={selectedRegion} onChange={(e) => { setSelectedRegion(e.target.value); setSelectedDept(''); }}>
                        <option value="all">Vue Nationale (Régions)</option>
                        {availableRegions.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                </div>
                {!isNationalView && (
                    <div className="bi-filter-group">
                        <label>Département Cible</label>
                        <select value={selectedDept} onChange={(e) => setSelectedDept(e.target.value)} disabled={chartDataArray.length === 0}>
                            {chartDataArray.map(d => <option key={d.nom} value={d.nom}>{d.nom}</option>)}
                        </select>
                    </div>
                )}
                <div className="bi-filter-group">
                    <label>Critère de Tri</label>
                    <select value={sortMode} onChange={(e) => setSortMode(e.target.value)}>
                        <option value="taux_desc">Chômage décroissant</option>
                        <option value="taux_asc">Chômage croissant</option>
                        <option value="alpha">Ordre alphabétique</option>
                    </select>
                </div>
            </nav>

            {apiError ? (
                <div style={{ padding: '2rem' }}>
                    <SyncErrorAlert details={apiError} onRetry={() => setRetryTrigger(prev => prev + 1)} />
                </div>
            ) : (
                <>
                    <div className="bi-kpi-grid">
                        <div className="bi-kpi-card">
                            <div className="kpi-header">Moyenne Nationale</div>
                            <div className="kpi-body single-stat">
                                <div className="kpi-stat">
                                    <span className="kpi-label color-chomage">Taux de chômage</span>
                                    <span className="kpi-value">{statsMoyennes.taux.toFixed(1)}%</span>
                                </div>
                            </div>
                        </div>

                        {!isNationalView && statsRegionalesActuelles && (
                            <div className="bi-kpi-card highlight">
                                <div className="kpi-header">Moyenne {selectedRegion}</div>
                                <div className="kpi-body single-stat">
                                    <div className="kpi-stat">
                                        <span className="kpi-label color-chomage">Taux de chômage</span>
                                        <span className="kpi-value">{statsRegionalesActuelles.taux.toFixed(1)}%</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeEntity && activeAnalysis && (
                            <div className="bi-kpi-card target" style={{ borderTopColor: activeAnalysis.color }}>
                                <div className="kpi-header">Focus : {activeEntity.nom}</div>
                                <div className="kpi-body target-body">
                                    <div className="target-stats">
                                        <div className="kpi-stat">
                                            <span className="kpi-value" style={{ fontSize: '2rem', color: activeAnalysis.color }}>
                                                {activeEntity.taux.toFixed(1)}%
                                            </span>
                                        </div>
                                    </div>
                                    <div className="target-verdict">
                                        <span className="verdict-title" style={{ color: activeAnalysis.color }}>
                                            {activeAnalysis.title}
                                        </span>
                                        <span className="verdict-desc">{activeAnalysis.desc}</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="bi-chart-panel">
                        <div className="chart-toolbar">
                            <h2 className="chart-title">Répartition du Chômage ({isNationalView ? 'Toutes les Régions' : selectedRegion})</h2>
                        </div>

                        <div className="chart-container-classic">
                            {chartDataArray.length > 0 ? (
                                <Bar data={chartData} options={chartOptions} />
                            ) : (
                                <div className="no-data">Aucune donnée trouvée.</div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}