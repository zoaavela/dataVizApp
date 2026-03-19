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
import { getAgeData } from '../../services/dataService';
import { getCarteData } from '../../services/territoireService';
import './Demographie.css';
import LogoLoader from '../../components/LogoLoader/LogoLoader';
import SyncErrorAlert from '../../components/SyncErrorAlert/SyncErrorAlert';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const parseNumber = (val) => {
    if (val === null || val === undefined) return 0;
    if (typeof val === 'number') return val;
    return parseFloat(val.toString().replace(',', '.')) || 0;
};

export default function Demographie() {
    const [donneesGlobales, setDonneesGlobales] = useState([]);
    const [anneesDisponibles, setAnneesDisponibles] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [apiError, setApiError] = useState(null);
    const [retryTrigger, setRetryTrigger] = useState(0);

    const [selectedYear, setSelectedYear] = useState('');
    const [selectedRegion, setSelectedRegion] = useState('all');
    const [selectedDept, setSelectedDept] = useState('');
    const [sortMode, setSortMode] = useState('seniors');

    useEffect(() => {
        const fetchData = async () => {
            setApiError(null);
            try {
                setIsLoading(true);
                const [demoRes, territoiresRes] = await Promise.all([
                    getAgeData(),
                    getCarteData()
                ]);

                const rawDemo = demoRes?.['hydra:member'] || demoRes?.data || demoRes || [];
                const rawTerritoires = territoiresRes?.['hydra:member'] || territoiresRes?.data || territoiresRes || [];

                const mapTerritoires = {};
                rawTerritoires.forEach(t => {
                    if (t.id) mapTerritoires[t.id.toString()] = t;
                    if (t.code) mapTerritoires[t.code.toString()] = t;
                });

                const dataNettoyee = (Array.isArray(rawDemo) ? rawDemo : [rawDemo]).map(ind => {
                    if (!ind) return null;
                    let tId = ind.territoireId || ind.territoire_id || ind.code_departement;
                    const tLie = tId ? mapTerritoires[tId.toString()] : null;

                    const partJeunes = parseNumber(ind['% population de moins de 20 ans'] ?? ind.partJeunes);
                    const partSeniors = parseNumber(ind['% population de 60 ans et plus'] ?? ind.partSeniors);
                    const ecart = Math.abs(partJeunes - partSeniors);

                    return {
                        id: tId || Math.random().toString(),
                        nom: tLie?.nom || ind.nom_departement || `Zone ${tId}`,
                        region: tLie?.region?.nom || tLie?.region || ind.nom_region || 'Non défini',
                        annee: ind.annee ? ind.annee.toString() : (ind.année_publication ? ind.année_publication.toString() : '2023'),
                        partJeunes: partJeunes,
                        partSeniors: partSeniors,
                        ecart: ecart
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
            if (!map[d.region]) map[d.region] = { sumJeunes: 0, sumSeniors: 0, count: 0 };
            map[d.region].sumJeunes += d.partJeunes;
            map[d.region].sumSeniors += d.partSeniors;
            map[d.region].count++;
        });
        return Object.keys(map).map(r => {
            const partJeunes = map[r].sumJeunes / map[r].count;
            const partSeniors = map[r].sumSeniors / map[r].count;
            return { nom: r, isRegion: true, partJeunes, partSeniors, ecart: Math.abs(partJeunes - partSeniors) };
        });
    }, [yearData]);

    const chartDataArray = useMemo(() => {
        let baseData = isNationalView ? regionalAggregates : yearData.filter(d => d.region === selectedRegion);
        return [...baseData].sort((a, b) => {
            if (sortMode === 'jeunes') return b.partJeunes - a.partJeunes;
            if (sortMode === 'seniors') return b.partSeniors - a.partSeniors;
            if (sortMode === 'ecart') return b.ecart - a.ecart;
            return 0;
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
        if (!yearData.length) return { jeunes: 0, seniors: 0 };
        const sumJeunes = yearData.reduce((acc, d) => acc + d.partJeunes, 0);
        const sumSeniors = yearData.reduce((acc, d) => acc + d.partSeniors, 0);
        return { jeunes: sumJeunes / yearData.length, seniors: sumSeniors / yearData.length };
    }, [yearData]);

    const statsRegionalesActuelles = useMemo(() => {
        if (isNationalView) return null;
        return regionalAggregates.find(r => r.nom === selectedRegion) || null;
    }, [isNationalView, regionalAggregates, selectedRegion]);

    const activeEntity = useMemo(() => {
        if (isNationalView) return chartDataArray.find(d => d.nom === selectedRegion) || null;
        return chartDataArray.find(d => d.nom === selectedDept) || chartDataArray[0] || null;
    }, [isNationalView, chartDataArray, selectedRegion, selectedDept]);

    const getDemographicStatus = (jeunes, seniors) => {
        const diff = jeunes - seniors;
        if (diff >= 2) return { title: "Profil Jeune", color: "#34d399", desc: "Population nettement plus jeune. Pression sur l'infrastructure éducative et l'emploi." };
        if (diff > -2 && diff < 2) return { title: "Équilibre Démographique", color: "#10b981", desc: "Répartition stable entre les générations. Modèle de transition équilibré." };
        if (diff <= -2 && diff > -6) return { title: "Vieillissement Actif", color: "#059669", desc: "La part des seniors domine. Évolution progressive des besoins locaux en services." };
        return { title: "Profil Sénior", color: "#064e3b", desc: "Forte surreprésentation des plus de 60 ans. Enjeux structurels de santé et de dépendance." };
    };

    const activeAnalysis = activeEntity ? getDemographicStatus(activeEntity.partJeunes, activeEntity.partSeniors) : null;

    const chartData = useMemo(() => {
        const activeName = isNationalView ? selectedRegion : selectedDept;
        return {
            labels: chartDataArray.map(d => d.nom),
            datasets: [
                {
                    label: 'Moins de 20 ans',
                    data: chartDataArray.map(d => -d.partJeunes),
                    backgroundColor: chartDataArray.map(d => d.nom === activeName ? '#10b981' : 'rgba(16, 185, 129, 0.25)'),
                    borderColor: chartDataArray.map(d => d.nom === activeName ? '#10b981' : 'transparent'),
                    borderWidth: 1,
                    borderRadius: { topLeft: 4, bottomLeft: 4 },
                    barPercentage: 0.85,
                    categoryPercentage: 0.9,
                },
                {
                    label: '60 ans et plus',
                    data: chartDataArray.map(d => d.partSeniors),
                    backgroundColor: chartDataArray.map(d => d.nom === activeName ? '#047857' : 'rgba(4, 120, 87, 0.25)'),
                    borderColor: chartDataArray.map(d => d.nom === activeName ? '#047857' : 'transparent'),
                    borderWidth: 1,
                    borderRadius: { topRight: 4, bottomRight: 4 },
                    barPercentage: 0.85,
                    categoryPercentage: 0.9,
                }
            ]
        };
    }, [chartDataArray, isNationalView, selectedRegion, selectedDept]);

    const chartOptions = {
        indexAxis: 'y',
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
                backgroundColor: '#0f172a', padding: 12,
                titleFont: { size: 13, weight: 'bold' },
                bodyFont: { size: 12 },
                callbacks: { label: (context) => `${context.dataset.label} : ${Math.abs(context.raw).toFixed(1)}%` }
            }
        },
        scales: {
            x: {
                stacked: true,
                grid: {
                    color: (ctx) => ctx.tick.value === 0 ? 'rgba(255, 255, 255, 0.2)' : 'rgba(30, 41, 59, 0.5)',
                    drawBorder: false,
                    lineWidth: (ctx) => ctx.tick.value === 0 ? 2 : 1
                },
                title: { display: true, text: "PROPORTION DE LA POPULATION (%)", color: '#64748b', font: { size: 11, weight: 'bold' } },
                ticks: { color: '#64748b', font: { weight: '600' }, callback: (value) => Math.abs(value) + '%' },
                min: -40, max: 40
            },
            y: {
                stacked: true,
                grid: { display: false, drawBorder: false },
                ticks: {
                    color: (ctx) => {
                        const activeName = isNationalView ? selectedRegion : selectedDept;
                        return ctx.tick.label === activeName ? '#ffffff' : '#94a3b8';
                    },
                    font: (ctx) => {
                        const activeName = isNationalView ? selectedRegion : selectedDept;
                        return { size: 12, weight: ctx.tick.label === activeName ? '800' : '500' };
                    }
                }
            }
        },
        animation: { duration: 400 }
    };

    if (isLoading) return <LogoLoader text="Traitement des profils démographiques..." />;

    const dynamicChartHeight = Math.max(400, chartDataArray.length * 35);

    return (
        <div className="bi-dashboard-container">
            <header className="bi-header">
                <div>
                    <h1 className="bi-title">Structure des Âges & Démographie</h1>
                    <p className="bi-subtitle">Comparaison de la part des moins de 20 ans face aux 60 ans et plus par territoire.</p>
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
                            <option value="" disabled>Sélectionner...</option>
                            {chartDataArray.map(d => <option key={d.nom} value={d.nom}>{d.nom}</option>)}
                        </select>
                    </div>
                )}
                <div className="bi-filter-group">
                    <label>Critère de Tri</label>
                    <select value={sortMode} onChange={(e) => setSortMode(e.target.value)}>
                        <option value="seniors">Par part de Seniors</option>
                        <option value="jeunes">Par part de Jeunes</option>
                        <option value="ecart">Par amplitude d'écart</option>
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
                            <div className="kpi-body">
                                <div className="kpi-stat">
                                    <span className="kpi-label color-jeunes">&lt; 20 ans</span>
                                    <span className="kpi-value">{statsMoyennes.jeunes.toFixed(1)}%</span>
                                </div>
                                <div className="kpi-divider"></div>
                                <div className="kpi-stat">
                                    <span className="kpi-label color-seniors">60+ ans</span>
                                    <span className="kpi-value">{statsMoyennes.seniors.toFixed(1)}%</span>
                                </div>
                            </div>
                        </div>

                        {!isNationalView && statsRegionalesActuelles && (
                            <div className="bi-kpi-card highlight">
                                <div className="kpi-header">Moyenne {selectedRegion}</div>
                                <div className="kpi-body">
                                    <div className="kpi-stat">
                                        <span className="kpi-label color-jeunes">&lt; 20 ans</span>
                                        <span className="kpi-value">{statsRegionalesActuelles.partJeunes.toFixed(1)}%</span>
                                    </div>
                                    <div className="kpi-divider"></div>
                                    <div className="kpi-stat">
                                        <span className="kpi-label color-seniors">60+ ans</span>
                                        <span className="kpi-value">{statsRegionalesActuelles.partSeniors.toFixed(1)}%</span>
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
                                            <span className="kpi-value color-jeunes" style={{ fontSize: '1.75rem' }}>{activeEntity.partJeunes.toFixed(1)}%</span>
                                        </div>
                                        <div className="kpi-stat">
                                            <span className="kpi-value color-seniors" style={{ fontSize: '1.75rem' }}>{activeEntity.partSeniors.toFixed(1)}%</span>
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
                            <h2 className="chart-title">Pyramide Comparative ({isNationalView ? 'Toutes les Régions' : selectedRegion})</h2>
                            <div className="chart-legend">
                                <span className="legend-marker" style={{ backgroundColor: '#10b981' }}></span> Moins de 20 ans
                                <span className="legend-marker" style={{ backgroundColor: '#047857', marginLeft: '1rem' }}></span> 60 ans et plus
                            </div>
                        </div>

                        <div className="chart-scrollable-container">
                            <div style={{ height: `${dynamicChartHeight}px`, position: 'relative', width: '100%' }}>
                                {chartDataArray.length > 0 ? (
                                    <Bar data={chartData} options={chartOptions} />
                                ) : (
                                    <div className="no-data">Aucune donnée trouvée.</div>
                                )}
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}