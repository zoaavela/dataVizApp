import React, { useState, useEffect, useMemo } from 'react';
import {
    Chart as ChartJS,
    LinearScale,
    PointElement,
    LineElement,
    Tooltip,
    Legend,
    ScatterController
} from 'chart.js';
import { Scatter } from 'react-chartjs-2';
import { getThermiqueData } from '../../services/dataService';
import { getCarteData } from '../../services/territoireService';
import './Thermique.css';
import LogoLoader from '../../components/LogoLoader/LogoLoader';
import SyncErrorAlert from '../../components/SyncErrorAlert/SyncErrorAlert';

ChartJS.register(LinearScale, PointElement, LineElement, ScatterController, Tooltip, Legend);

const COLORS = {
    efficient: '#10b981',
    neglected: '#ef4444',
    standard: '#f59e0b',
    inactive: '#2d3136'
};

const parseFrenchNumber = (val) => {
    if (val === null || val === undefined) return 0;
    if (typeof val === 'number') return val;
    return parseFloat(val.toString().replace(',', '.')) || 0;
};

export default function Thermique() {
    const [donneesGlobales, setDonneesGlobales] = useState([]);
    const [anneesDisponibles, setAnneesDisponibles] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [apiError, setApiError] = useState(null);
    const [retryTrigger, setRetryTrigger] = useState(0);

    const [selectedYear, setSelectedYear] = useState('');
    const [selectedRegion, setSelectedRegion] = useState('all');
    const [selectedDept, setSelectedDept] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            setApiError(null);
            try {
                setIsLoading(true);
                const [thermiqueRes, territoiresRes] = await Promise.all([
                    getThermiqueData(),
                    getCarteData()
                ]);

                await new Promise(resolve => setTimeout(resolve, 800));

                const rawThermique = thermiqueRes?.['hydra:member'] || thermiqueRes?.data || thermiqueRes || [];
                const rawTerritoires = territoiresRes?.['hydra:member'] || territoiresRes?.data || territoiresRes || [];

                const mapTerritoires = {};
                rawTerritoires.forEach(t => {
                    if (t.id) mapTerritoires[t.id.toString()] = t;
                    if (t.code) mapTerritoires[t.code.toString()] = t;
                });

                const dataNettoyee = (Array.isArray(rawThermique) ? rawThermique : [rawThermique]).map(ind => {
                    if (!ind) return null;
                    let tId = ind.territoireId || ind.territoire_id;
                    const tLie = tId ? mapTerritoires[tId.toString()] : null;

                    const age = parseFrenchNumber(ind.ageMoyenParc);
                    const passoires = parseFrenchNumber(ind.tauxPassoires ?? ind.taux_passoires ?? ind.passoires);

                    const expected = (0.55 * age) - 2.6;
                    const gap = passoires - expected;

                    let status = 'standard';
                    if (gap > 5) status = 'neglected';
                    else if (gap < -5) status = 'efficient';

                    return {
                        id: tId || Math.random().toString(),
                        nom: tLie?.nom || `Zone ${tId}`,
                        region: tLie?.region?.nom || tLie?.region || 'Non défini',
                        annee: ind.annee ? ind.annee.toString() : '2022',
                        age: age,
                        passoires: passoires,
                        gap: gap,
                        status: status
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
                console.error("Erreur d'assemblage :", error);
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

    const availableDepartments = useMemo(() => {
        let filtered = yearData;
        if (selectedRegion !== 'all') {
            filtered = yearData.filter(d => d.region === selectedRegion);
        }
        return filtered.sort((a, b) => a.nom.localeCompare(b.nom));
    }, [yearData, selectedRegion]);

    const isNationalView = selectedRegion === 'all';

    useEffect(() => {
        if (availableDepartments.length > 0) {
            const isValid = availableDepartments.some(d => d.nom === selectedDept);
            if (!isValid) setSelectedDept(availableDepartments[0].nom);
        } else {
            setSelectedDept('');
        }
    }, [availableDepartments, selectedDept]);

    const activeDeptObj = useMemo(() => {
        return availableDepartments.find(d => d.nom === selectedDept) || availableDepartments[0] || null;
    }, [availableDepartments, selectedDept]);

    const statsNationales = useMemo(() => {
        if (!yearData.length) return { age: 0, passoires: 0 };
        const sumAge = yearData.reduce((acc, d) => acc + d.age, 0);
        const sumPass = yearData.reduce((acc, d) => acc + d.passoires, 0);
        return { age: sumAge / yearData.length, passoires: sumPass / yearData.length };
    }, [yearData]);

    const statsRegionales = useMemo(() => {
        if (isNationalView || !yearData.length) return null;
        const regData = yearData.filter(d => d.region === selectedRegion);
        if (!regData.length) return null;
        const sumAge = regData.reduce((acc, d) => acc + d.age, 0);
        const sumPass = regData.reduce((acc, d) => acc + d.passoires, 0);
        return { age: sumAge / regData.length, passoires: sumPass / regData.length };
    }, [yearData, selectedRegion, isNationalView]);

    const getStatusDetails = (status) => {
        switch (status) {
            case 'efficient': return { title: 'Rénovation Exemplaire', desc: 'Performances thermiques nettement supérieures à la moyenne attendue pour cet âge.', color: COLORS.efficient };
            case 'neglected': return { title: 'Négligence Thermique', desc: 'Parc anormalement énergivore malgré sa relative jeunesse.', color: COLORS.neglected };
            default: return { title: 'Usure Normale', desc: 'Le taux de passoires correspond à la dégradation thermique standard.', color: COLORS.standard };
        }
    };

    const activeAnalysis = activeDeptObj ? getStatusDetails(activeDeptObj.status) : null;

    const chartData = useMemo(() => {
        return {
            datasets: [
                {
                    type: 'line',
                    label: 'Norme d\'usure',
                    data: [{ x: 0, y: 0 }, { x: 100, y: (0.55 * 100) - 2.6 }],
                    borderColor: '#475569',
                    borderWidth: 2,
                    borderDash: [5, 5],
                    pointRadius: 0,
                    order: 2,
                    hitRadius: 10
                },
                {
                    type: 'scatter',
                    label: 'Départements',
                    data: availableDepartments.map(d => ({ x: d.age, y: d.passoires, d: d })),
                    backgroundColor: (ctx) => {
                        const d = ctx.raw?.d;
                        if (!d) return COLORS.inactive;
                        return d.nom === activeDeptObj?.nom ? COLORS[d.status] : 'rgba(100, 116, 139, 0.3)';
                    },
                    pointRadius: (ctx) => ctx.raw?.d?.nom === activeDeptObj?.nom ? 12 : 5,
                    pointBorderColor: (ctx) => ctx.raw?.d?.nom === activeDeptObj?.nom ? '#ffffff' : 'transparent',
                    pointBorderWidth: (ctx) => ctx.raw?.d?.nom === activeDeptObj?.nom ? 3 : 0,
                    pointHoverRadius: (ctx) => ctx.raw?.d?.nom === activeDeptObj?.nom ? 14 : 8,
                    order: 1
                }
            ]
        };
    }, [availableDepartments, activeDeptObj]);

    const chartOptions = useMemo(() => ({
        responsive: true,
        maintainAspectRatio: false,
        onClick: (event, elements) => {
            if (elements.length > 0) {
                const element = elements[0];
                if (element.datasetIndex === 1 && availableDepartments[element.index]) {
                    setSelectedDept(availableDepartments[element.index].nom);
                }
            }
        },
        onHover: (event, elements) => {
            if (event.native?.target) {
                event.native.target.style.cursor = elements?.length && elements[0].datasetIndex === 1 ? 'pointer' : 'default';
            }
        },
        scales: {
            x: {
                type: 'linear',
                min: 0,
                title: { display: true, text: 'ÂGE MOYEN DU PARC (ANS)', color: '#64748b', font: { size: 10, weight: 'bold', family: 'inherit' } },
                grid: { color: 'rgba(30, 41, 59, 0.5)' },
                ticks: { color: '#64748b', font: { family: 'inherit' } }
            },
            y: {
                type: 'linear',
                min: 0,
                title: { display: true, text: 'PASSOIRES THERMIQUES (%)', color: '#64748b', font: { size: 10, weight: 'bold', family: 'inherit' } },
                grid: { color: 'rgba(30, 41, 59, 0.5)' },
                ticks: { color: '#64748b', font: { family: 'inherit' } }
            }
        },
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: '#0f172a',
                padding: 12,
                titleFont: { family: 'inherit', size: 13 },
                bodyFont: { family: 'inherit', size: 12 },
                callbacks: {
                    label: (ctx) => {
                        if (ctx.datasetIndex === 0) return `Norme théorique : ${ctx.raw.y.toFixed(1)}% à ${ctx.raw.x} ans`;
                        return `${ctx.raw.d.nom}: ${ctx.raw.y.toFixed(1)}% passoires (${ctx.raw.x.toFixed(1)} ans)`;
                    }
                }
            }
        }
    }), [availableDepartments]);

    if (isLoading) return <LogoLoader text="Calcul des dépenses thermiques..." />;

    return (
        <div className="bi-dashboard-container">
            <header className="bi-header">
                <div>
                    <h1 className="bi-title">La Dette Thermique</h1>
                    <p className="bi-subtitle">Analyse croisée entre l'âge du parc immobilier et sa consommation énergétique.</p>
                </div>
            </header>

            <nav className="bi-toolbar">
                <div className="bi-filter-group">
                    <label>Année de référence</label>
                    <select value={selectedYear} onChange={(e) => { setSelectedYear(e.target.value); setSelectedRegion('all'); setSelectedDept(''); }}>
                        {anneesDisponibles.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                </div>
                <div className="bi-filter-group">
                    <label>Périmètre Régional</label>
                    <select value={selectedRegion} onChange={(e) => { setSelectedRegion(e.target.value); setSelectedDept(''); }}>
                        <option value="all">Vue Nationale (Toutes régions)</option>
                        {availableRegions.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                </div>
                <div className="bi-filter-group">
                    <label>Département Cible</label>
                    <select value={activeDeptObj?.nom || ''} onChange={(e) => setSelectedDept(e.target.value)} disabled={availableDepartments.length === 0}>
                        {availableDepartments.map(d => <option key={d.nom} value={d.nom}>{d.nom}</option>)}
                    </select>
                </div>
            </nav>

            {apiError ? (
                <div style={{ padding: '2rem' }}>
                    <SyncErrorAlert details={apiError} onRetry={() => setRetryTrigger(prev => prev + 1)} />
                </div>
            ) : (
                <>
                    <div className="bi-kpi-section">
                        <div className="bi-kpi-referentials">
                            <div className="bi-kpi-card">
                                <div className="kpi-header">Moyenne Nationale</div>
                                <div className="kpi-body">
                                    <div className="kpi-stat">
                                        <span className="kpi-label">Âge Moyen</span>
                                        <span className="kpi-value">{statsNationales.age.toFixed(1)} <span style={{ fontSize: '0.9rem', fontWeight: 'normal' }}>ans</span></span>
                                    </div>
                                    <div className="kpi-divider"></div>
                                    <div className="kpi-stat">
                                        <span className="kpi-label">Passoires</span>
                                        <span className="kpi-value">{statsNationales.passoires.toFixed(1)}%</span>
                                    </div>
                                </div>
                            </div>

                            {!isNationalView && statsRegionales && (
                                <div className="bi-kpi-card highlight">
                                    <div className="kpi-header">Moyenne {selectedRegion}</div>
                                    <div className="kpi-body">
                                        <div className="kpi-stat">
                                            <span className="kpi-label">Âge Moyen</span>
                                            <span className="kpi-value">{statsRegionales.age.toFixed(1)} <span style={{ fontSize: '0.9rem', fontWeight: 'normal' }}>ans</span></span>
                                        </div>
                                        <div className="kpi-divider"></div>
                                        <div className="kpi-stat">
                                            <span className="kpi-label">Passoires</span>
                                            <span className="kpi-value">{statsRegionales.passoires.toFixed(1)}%</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {activeDeptObj && activeAnalysis && (
                            <div className="bi-kpi-card target" style={{ borderTopColor: activeAnalysis.color }}>
                                <div className="kpi-header">Focus : {activeDeptObj.nom}</div>
                                <div className="kpi-body target-body">
                                    <div className="target-stats">
                                        <div className="kpi-stat">
                                            <span className="kpi-label">Âge Parc</span>
                                            <span className="kpi-value" style={{ fontSize: '1.5rem' }}>{activeDeptObj.age} <span style={{ fontSize: '0.9rem', fontWeight: 'normal' }}>ans</span></span>
                                        </div>
                                        <div className="kpi-stat">
                                            <span className="kpi-label">Passoires</span>
                                            <span className="kpi-value" style={{ fontSize: '1.5rem', color: activeAnalysis.color }}>{activeDeptObj.passoires}%</span>
                                        </div>
                                    </div>
                                    <div className="target-verdict">
                                        <span className="verdict-title" style={{ color: activeAnalysis.color }}>
                                            {activeAnalysis.title}
                                        </span>
                                        <span className="verdict-desc">{activeAnalysis.desc}</span>
                                    </div>
                                </div>

                                <div className="gap-indicator" style={{ borderTop: '1px dashed #334155', paddingTop: '1rem', marginTop: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: '600', textTransform: 'uppercase' }}>Écart à la norme d'usure</span>
                                    <span style={{ fontWeight: '800', color: activeAnalysis.color, backgroundColor: 'rgba(255,255,255,0.05)', padding: '0.25rem 0.75rem', borderRadius: '4px' }}>
                                        {activeDeptObj.gap > 0 ? '+' : ''}{activeDeptObj.gap.toFixed(1)} pts
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="bi-chart-panel thermique-panel">
                        <div className="chart-toolbar">
                            <h2 className="chart-title">Nuage de dispersion thermique ({isNationalView ? 'France' : selectedRegion})</h2>
                            <div className="chart-legend-bottom">
                                <div className="legend-item"><span className="legend-color" style={{ backgroundColor: '#ef4444' }}></span>Zone de Négligence</div>
                                <div className="legend-item"><span className="legend-color" style={{ backgroundColor: '#f59e0b' }}></span>Usure Normale</div>
                                <div className="legend-item"><span className="legend-color" style={{ backgroundColor: '#10b981' }}></span>Zone de Rénovation</div>
                            </div>
                        </div>

                        <div className="chart-container-relative" style={{ position: 'relative', flex: 1, padding: '1rem', minHeight: '500px' }}>
                            <div className="chart-overlay-badge badge-top-left" style={{ color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.3)', backgroundColor: 'rgba(239, 68, 68, 0.05)' }}>
                                Critique : Récent mais énergivore
                            </div>
                            <div className="chart-overlay-badge badge-bottom-right" style={{ color: '#10b981', borderColor: 'rgba(16, 185, 129, 0.3)', backgroundColor: 'rgba(16, 185, 129, 0.05)' }}>
                                Exemplaire : Ancien mais rénové
                            </div>

                            {availableDepartments.length > 0 ? (
                                <Scatter data={chartData} options={chartOptions} />
                            ) : (
                                <div className="no-data">Aucune donnée disponible.</div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}