import React, { useState, useEffect, useMemo } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { getVacancyData } from '../../services/dataService';
import { getCarteData } from '../../services/territoireService';
import LogoLoader from '../../components/LogoLoader/LogoLoader';
import SyncErrorAlert from '../../components/SyncErrorAlert/SyncErrorAlert';
import './House.css';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function House() {
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
                const [vacRes, cartRes] = await Promise.all([
                    getVacancyData(),
                    getCarteData()
                ]);

                const extract = (res) => res?.['hydra:member'] || res?.data || res || [];
                const vacs = extract(vacRes);
                const territories = extract(cartRes);

                const mapT = {};
                territories.forEach(t => {
                    if (t.id) mapT[t.id.toString()] = t;
                    if (t.code) mapT[t.code.toString()] = t;
                });

                const merged = vacs.map(v => {
                    const tId = v.territoire?.id || v.territoireId;
                    const t = tId ? mapT[tId.toString()] : null;
                    if (!t) return null;

                    const total = parseInt(v.nombreLogements || v.nombre_logements) || 0;
                    const principales = parseInt(v.nombreResidencesPrincipales || v.nombre_residences_principales) || 0;
                    const vacantsTaux = parseFloat(v.taux || v.taux_vacance || 0);

                    if (total === 0) return null;

                    const nbVacants = Math.round((vacantsTaux / 100) * total);
                    const nbSecondaires = Math.max(0, total - principales - nbVacants);

                    return {
                        id: tId,
                        annee: v.annee?.toString() || "2023",
                        nom: t.nom,
                        region: t.region?.nom || t.region || 'Non défini',
                        principales,
                        vacants: nbVacants,
                        secondaires: nbSecondaires,
                        total
                    };
                }).filter(Boolean);

                setDonneesGlobales(merged);
                const years = [...new Set(merged.map(d => d.annee))].sort((a, b) => b - a);
                setAnneesDisponibles(years);
                if (years.length > 0) setSelectedYear(years[0]);

            } catch (err) {
                console.error("Erreur de récupération :", err);
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

    const chartDataArray = useMemo(() => {
        return isNationalView ? yearData : yearData.filter(d => d.region === selectedRegion);
    }, [isNationalView, yearData, selectedRegion]);

    useEffect(() => {
        if (!isNationalView && chartDataArray.length > 0) {
            const isValid = chartDataArray.some(d => d.nom === selectedDept);
            if (!isValid) setSelectedDept(chartDataArray[0].nom);
        } else {
            setSelectedDept('');
        }
    }, [chartDataArray, selectedDept, isNationalView]);

    const activeEntity = useMemo(() => {
        if (!isNationalView && selectedDept) {
            return chartDataArray.find(d => d.nom === selectedDept) || null;
        }

        if (chartDataArray.length === 0) return null;
        const agg = chartDataArray.reduce((acc, curr) => {
            acc.principales += curr.principales;
            acc.vacants += curr.vacants;
            acc.secondaires += curr.secondaires;
            acc.total += curr.total;
            return acc;
        }, { principales: 0, vacants: 0, secondaires: 0, total: 0 });

        return {
            nom: isNationalView ? 'France Entière' : `Moyenne ${selectedRegion}`,
            isAggregate: true,
            ...agg
        };
    }, [isNationalView, selectedDept, chartDataArray, selectedRegion]);

    const referenceStats = useMemo(() => {
        const sourceData = isNationalView ? yearData : chartDataArray;
        if (sourceData.length === 0) return { principales: 0, vacants: 0, secondaires: 0 };

        const sum = sourceData.reduce((acc, curr) => {
            acc.principales += curr.principales;
            acc.vacants += curr.vacants;
            acc.secondaires += curr.secondaires;
            acc.total += curr.total;
            return acc;
        }, { principales: 0, vacants: 0, secondaires: 0, total: 0 });

        if (sum.total === 0) return { principales: 0, vacants: 0, secondaires: 0 };

        return {
            principales: (sum.principales / sum.total) * 100,
            vacants: (sum.vacants / sum.total) * 100,
            secondaires: (sum.secondaires / sum.total) * 100
        };
    }, [isNationalView, yearData, chartDataArray]);

    const getAnalysis = (entity) => {
        if (!entity || entity.total === 0) return { title: "N/A", color: "#64748b", desc: "Données insuffisantes." };
        const pSec = (entity.secondaires / entity.total) * 100;
        const pVac = (entity.vacants / entity.total) * 100;

        if (pSec > 25) return { title: "Zone Touristique", color: "#3b82f6", desc: "Forte dominance des résidences secondaires. Pression sur l'habitat permanent." };
        if (pVac > 12) return { title: "Déprise Immobilière", color: "#f43f5e", desc: "Volume de logements vacants préoccupant nécessitant des politiques de réhabilitation." };
        if (pSec > 10 && pVac > 8) return { title: "Marché Hybride", color: "#8b5cf6", desc: "Territoire mêlant attrait saisonnier et nécessité de rénovation de l'ancien." };
        return { title: "Marché Équilibré", color: "#10b981", desc: "Parc immobilier sainement structuré pour répondre aux besoins de l'habitat permanent." };
    };

    const activeAnalysis = getAnalysis(activeEntity);

    const chartData = useMemo(() => {
        return {
            labels: ['Résidences Principales', 'Logements Vacants', 'Résidences Secondaires'],
            datasets: [{
                data: activeEntity ? [activeEntity.principales, activeEntity.vacants, activeEntity.secondaires] : [],
                backgroundColor: ['#10b981', '#f43f5e', '#3b82f6'],
                borderColor: '#111418',
                borderWidth: 4,
                hoverOffset: 15
            }]
        };
    }, [activeEntity]);

    const chartOptions = {
        cutout: '75%',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: '#0f172a', padding: 15, titleFont: { size: 14, weight: 'bold' }, bodyFont: { size: 14 },
                callbacks: { label: (item) => ` ${item.label} : ${item.raw.toLocaleString('fr-FR')} logements` }
            }
        }
    };

    if (isLoading) return <LogoLoader text="Analyse du parc immobilier..." />;

    const pctPrincipales = activeEntity && activeEntity.total > 0 ? ((activeEntity.principales / activeEntity.total) * 100).toFixed(1) : 0;
    const pctVacants = activeEntity && activeEntity.total > 0 ? ((activeEntity.vacants / activeEntity.total) * 100).toFixed(1) : 0;
    const pctSecondaires = activeEntity && activeEntity.total > 0 ? ((activeEntity.secondaires / activeEntity.total) * 100).toFixed(1) : 0;

    return (
        <div className="bi-dashboard-container housing-theme">
            <header className="bi-header">
                <div>
                    <h1 className="bi-title">Structure & Occupation de l'Habitat</h1>
                    <p className="bi-subtitle">Analyse de la répartition du parc immobilier (Principales, Secondaires, Vacants).</p>
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
                            <option value="">-- Moyenne Régionale --</option>
                            {chartDataArray.map(d => <option key={d.nom} value={d.nom}>{d.nom}</option>)}
                        </select>
                    </div>
                )}
            </nav>

            {apiError ? (
                <div style={{ padding: '2rem' }}>
                    <SyncErrorAlert details={apiError} onRetry={() => setRetryTrigger(prev => prev + 1)} />
                </div>
            ) : (
                <>
                    <div className="bi-kpi-grid">
                        <div className="bi-kpi-card">
                            <div className="kpi-header">Moyenne {isNationalView ? 'Nationale' : selectedRegion}</div>
                            <div className="kpi-body">
                                <div className="kpi-stat">
                                    <span className="kpi-label" style={{ color: '#10b981' }}>Principales</span>
                                    <span className="kpi-value">{referenceStats.principales.toFixed(1)}%</span>
                                </div>
                                <div className="kpi-divider"></div>
                                <div className="kpi-stat">
                                    <span className="kpi-label" style={{ color: '#3b82f6' }}>Secondaires</span>
                                    <span className="kpi-value">{referenceStats.secondaires.toFixed(1)}%</span>
                                </div>
                                <div className="kpi-divider"></div>
                                <div className="kpi-stat">
                                    <span className="kpi-label" style={{ color: '#f43f5e' }}>Vacants</span>
                                    <span className="kpi-value">{referenceStats.vacants.toFixed(1)}%</span>
                                </div>
                            </div>
                        </div>

                        {activeEntity && (
                            <div className="bi-kpi-card target" style={{ borderTopColor: activeAnalysis.color }}>
                                <div className="kpi-header">Focus : {activeEntity.nom}</div>
                                <div className="kpi-body target-body">
                                    <div className="target-stats">
                                        <div className="kpi-stat">
                                            <span className="kpi-label">Principales</span>
                                            <span className="kpi-value" style={{ color: '#10b981' }}>{pctPrincipales}%</span>
                                        </div>
                                        <div className="kpi-stat">
                                            <span className="kpi-label">Secondaires</span>
                                            <span className="kpi-value" style={{ color: '#3b82f6' }}>{pctSecondaires}%</span>
                                        </div>
                                        <div className="kpi-stat">
                                            <span className="kpi-label">Vacants</span>
                                            <span className="kpi-value" style={{ color: '#f43f5e' }}>{pctVacants}%</span>
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
                            <h2 className="chart-title">Répartition du Parc : {activeEntity?.nom}</h2>
                            <div className="chart-legend">
                                <span className="legend-marker" style={{ backgroundColor: '#10b981' }}></span> Principales
                                <span className="legend-marker" style={{ backgroundColor: '#3b82f6', marginLeft: '1rem' }}></span> Secondaires
                                <span className="legend-marker" style={{ backgroundColor: '#f43f5e', marginLeft: '1rem' }}></span> Vacants
                            </div>
                        </div>

                        <div className="chart-container-classic" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '500px' }}>
                            <div className="doughnut-container-relative">
                                <Doughnut data={chartData} options={chartOptions} />
                                <div className="doughnut-center-info">
                                    <span className="d-val">{activeEntity?.total.toLocaleString('fr-FR')}</span>
                                    <span className="d-lab">Logements<br />au total</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}