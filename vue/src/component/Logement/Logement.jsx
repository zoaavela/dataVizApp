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
import annotationPlugin from 'chartjs-plugin-annotation';

import { getLogementData, getQuadrantData } from '../../services/dataService';
import { getCarteData } from '../../services/territoireService';
import LogoLoader from '../LogoLoader/LogoLoader';
import './Logement.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend, annotationPlugin);

const parseNumber = (val) => {
    if (val === null || val === undefined) return 0;
    if (typeof val === 'number') return val;
    return parseFloat(val.toString().replace(',', '.')) || 0;
};

export default function Logement() {
    const [donneesGlobales, setDonneesGlobales] = useState([]);
    const [anneesDisponibles, setAnneesDisponibles] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const [selectedYear, setSelectedYear] = useState('');
    const [selectedRegion, setSelectedRegion] = useState('all');
    const [selectedDept, setSelectedDept] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [protectionRes, quadrantRes, territoiresRes] = await Promise.all([
                    getLogementData(),
                    getQuadrantData().catch(() => null),
                    getCarteData().catch(() => null)
                ]);

                const rawProtection = protectionRes?.['hydra:member'] || protectionRes?.data || protectionRes || [];
                const rawQuadrant = quadrantRes?.['hydra:member'] || quadrantRes?.data || quadrantRes || [];
                const rawTerritoires = territoiresRes?.['hydra:member'] || territoiresRes?.data || territoiresRes || [];

                const mapTerritoires = {};
                rawTerritoires.forEach(t => {
                    if (t.id) mapTerritoires[t.id.toString()] = t;
                    if (t.code) mapTerritoires[t.code.toString()] = t;
                });

                const mapPauvrete = {};
                (Array.isArray(rawQuadrant) ? rawQuadrant : []).forEach(q => {
                    const tId = q.territoireId || q.territoire_id;
                    const annee = q.annee || 2022;
                    if (tId) {
                        mapPauvrete[`${tId}-${annee}`] = parseNumber(q.tauxPauvrete ?? q.taux_pauvrete);
                    }
                });

                const dataNettoyee = (Array.isArray(rawProtection) ? rawProtection : [rawProtection]).map(ind => {
                    if (!ind) return null;

                    let tId = ind.territoireId || ind.territoire_id;
                    const annee = ind.annee ? ind.annee.toString() : '2022';
                    const tLie = tId ? mapTerritoires[tId.toString()] : null;

                    const social = parseNumber(ind.tauxHlm ?? ind.taux_hlm ?? ind['Taux de logements sociaux* (en %)']);
                    const pauvrete = mapPauvrete[`${tId}-${annee}`] || 0;

                    return {
                        id: tId || Math.random().toString(),
                        nom: tLie ? tLie.nom : `Inconnu (${tId})`,
                        region: tLie ? (tLie.region?.nom || tLie.region) : 'Non défini',
                        annee: annee,
                        pauv: pauvrete,
                        social: social
                    };
                }).filter(d => d && !d.nom.startsWith('Inconnu') && !d.nom.startsWith('Zone'));

                const dataParAnnee = {};
                dataNettoyee.forEach(d => {
                    if (!dataParAnnee[d.annee]) dataParAnnee[d.annee] = new Map();
                    d.ratio = d.pauv > 0 ? (d.social / d.pauv) * 100 : 0;
                    dataParAnnee[d.annee].set(d.nom, d);
                });

                let dataEnrichie = [];
                Object.keys(dataParAnnee).forEach(annee => {
                    dataEnrichie = dataEnrichie.concat(Array.from(dataParAnnee[annee].values()));
                });

                setDonneesGlobales(dataEnrichie);
                const anneesUniques = [...new Set(dataEnrichie.map(d => d.annee))].sort((a, b) => b - a);
                setAnneesDisponibles(anneesUniques);

                if (anneesUniques.length > 0) setSelectedYear(anneesUniques[0].toString());

            } catch (error) {
                console.error("Erreur d'assemblage des données :", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const yearData = useMemo(() => {
        if (!selectedYear) return [];
        return donneesGlobales.filter(d => d.annee === selectedYear);
    }, [donneesGlobales, selectedYear]);

    const availableRegions = useMemo(() => {
        return [...new Set(yearData.map(d => d.region))].filter(r => r !== 'Non défini').sort();
    }, [yearData]);

    const isNationalView = selectedRegion === 'all';

    const statsNationales = useMemo(() => {
        if (!yearData.length) return 0;
        return yearData.reduce((acc, d) => acc + d.ratio, 0) / yearData.length;
    }, [yearData]);

    const regionalAggregates = useMemo(() => {
        const map = {};
        yearData.forEach(d => {
            if (d.region === 'Non défini') return;
            if (!map[d.region]) map[d.region] = { sumRatio: 0, sumPauv: 0, sumSocial: 0, count: 0 };
            map[d.region].sumRatio += d.ratio;
            map[d.region].sumPauv += d.pauv;
            map[d.region].sumSocial += d.social;
            map[d.region].count++;
        });
        return Object.keys(map).map(r => ({
            nom: r,
            isRegion: true,
            ratio: map[r].sumRatio / map[r].count,
            pauv: map[r].sumPauv / map[r].count,
            social: map[r].sumSocial / map[r].count
        }));
    }, [yearData]);

    const statsRegionalesActuelles = useMemo(() => {
        if (isNationalView) return null;
        return regionalAggregates.find(r => r.nom === selectedRegion) || null;
    }, [isNationalView, regionalAggregates, selectedRegion]);

    const chartDataArray = useMemo(() => {
        if (isNationalView) {
            return [...regionalAggregates].sort((a, b) => b.ratio - a.ratio);
        }
        return yearData.filter(d => d.region === selectedRegion).sort((a, b) => b.ratio - a.ratio);
    }, [isNationalView, regionalAggregates, yearData, selectedRegion]);

    useEffect(() => {
        if (!isNationalView && chartDataArray.length > 0) {
            const isValid = chartDataArray.some(d => d.nom === selectedDept);
            if (!isValid) setSelectedDept(chartDataArray[0].nom);
        } else {
            setSelectedDept('');
        }
    }, [chartDataArray, selectedDept, isNationalView]);

    const activeEntity = useMemo(() => {
        if (isNationalView) {
            return chartDataArray.find(d => d.nom === selectedRegion) || null;
        } else {
            return chartDataArray.find(d => d.nom === selectedDept) || chartDataArray[0] || null;
        }
    }, [isNationalView, chartDataArray, selectedRegion, selectedDept]);

    const getStatusInfo = (ratio) => {
        if (ratio >= 100) return { color: '#10b981', title: 'Couverture Excédentaire', desc: "Offre HLM supérieure au taux de pauvreté. Absorbtion structurelle." };
        if (ratio >= 70) return { color: '#f59e0b', title: 'Tension Modérée', desc: "Équipement partiel. Une fraction des ménages dépend du parc privé." };
        return { color: '#ef4444', title: 'Déficit Structurel', desc: "Inadéquation majeure entre offre sociale et demande locale." };
    };

    const activeStatus = activeEntity ? getStatusInfo(activeEntity.ratio) : null;

    const chartData = useMemo(() => {
        const labels = chartDataArray.map(d => d.nom);
        const data = chartDataArray.map(d => d.ratio);
        const bgColors = chartDataArray.map(d => {
            const isSelected = (!isNationalView && d.nom === selectedDept) || (isNationalView && false);
            if (isSelected) return getStatusInfo(d.ratio).color;
            return '#1e293b';
        });
        const hoverColors = chartDataArray.map(d => getStatusInfo(d.ratio).color);

        return {
            labels,
            datasets: [{
                data,
                backgroundColor: bgColors,
                hoverBackgroundColor: hoverColors,
                borderRadius: 4,
                barPercentage: 0.7,
                categoryPercentage: 0.85
            }]
        };
    }, [chartDataArray, isNationalView, selectedDept]);

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
                backgroundColor: '#0f172a',
                padding: 12,
                titleFont: { size: 14, family: 'inherit', weight: 'bold' },
                bodyFont: { size: 13, family: 'inherit' },
                callbacks: { label: (ctx) => `${ctx.raw.toFixed(1)}% de couverture` }
            },
            annotation: {
                annotations: {
                    natLine: {
                        type: 'line',
                        xMin: statsNationales, xMax: statsNationales,
                        borderColor: '#64748b', borderWidth: 2, borderDash: [4, 4],
                        label: {
                            display: true, content: `FRANCE (${statsNationales.toFixed(0)}%)`,
                            position: 'start', backgroundColor: '#0f172a', color: '#94a3b8',
                            font: { size: 10, weight: 'bold' }, yAdjust: -15
                        }
                    },
                    regLine: !isNationalView && statsRegionalesActuelles ? {
                        type: 'line',
                        xMin: statsRegionalesActuelles.ratio, xMax: statsRegionalesActuelles.ratio,
                        borderColor: '#6366f1', borderWidth: 2, borderDash: [4, 4],
                        label: {
                            display: true, content: `RÉGION (${statsRegionalesActuelles.ratio.toFixed(0)}%)`,
                            position: 'end', backgroundColor: 'rgba(99, 102, 241, 0.2)', color: '#a5b4fc',
                            font: { size: 10, weight: 'bold' }, yAdjust: 15
                        }
                    } : null,
                    equilibriumLine: {
                        type: 'line',
                        xMin: 100, xMax: 100,
                        borderColor: '#94a3b8', borderWidth: 2, borderDash: [2, 2],
                        label: {
                            display: true, content: `ÉQUILIBRE (100%)`,
                            position: 'start', backgroundColor: 'rgba(15, 23, 42, 0.8)', color: '#e2e8f0',
                            font: { size: 10, weight: 'bold' }, yAdjust: 15
                        }
                    }
                }
            }
        },
        scales: {
            x: {
                min: 0,
                grid: { color: 'rgba(30, 41, 59, 0.6)', drawBorder: false },
                title: { display: true, text: "RATIO D'ÉQUIPEMENT (%)", color: '#64748b', font: { size: 11, weight: 'bold', family: 'inherit' } },
                ticks: { color: '#64748b', font: { family: 'inherit' } }
            },
            y: {
                grid: { display: false, drawBorder: false },
                ticks: {
                    color: (ctx) => (!isNationalView && ctx.tick.label === selectedDept) ? '#ffffff' : '#94a3b8',
                    font: { weight: '500', family: 'inherit', size: 12 }
                }
            }
        },
        animation: { duration: 400 }
    };

    if (isLoading) return <LogoLoader text="Extraction des métriques..." />;

    const dynamicChartHeight = Math.max(100 + chartDataArray.length * 35, 400);

    return (
        <div className="bi-dashboard-container">
            <header className="bi-header">
                <div>
                    <h1 className="bi-title">Couverture Sociale de la Précarité</h1>
                    <p className="bi-subtitle">Adéquation entre le parc HLM et le volume de ménages sous le seuil de pauvreté.</p>
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
            </nav>

            <div className="bi-kpi-section">
                <div className="bi-kpi-referentials">
                    <div className="bi-kpi-card">
                        <div className="kpi-header">Moyenne Nationale</div>
                        <div className="kpi-body">
                            <div className="kpi-stat">
                                <span className="kpi-label">Ratio Global</span>
                                <span className="kpi-value">{statsNationales.toFixed(1)}%</span>
                            </div>
                        </div>
                    </div>

                    {!isNationalView && statsRegionalesActuelles && (
                        <div className="bi-kpi-card highlight">
                            <div className="kpi-header">Moyenne {selectedRegion}</div>
                            <div className="kpi-body">
                                <div className="kpi-stat">
                                    <span className="kpi-label">Ratio Régional</span>
                                    <span className="kpi-value">{statsRegionalesActuelles.ratio.toFixed(1)}%</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {activeEntity && activeStatus && (
                    <div className="bi-kpi-card target" style={{ borderTopColor: activeStatus.color }}>
                        <div className="kpi-header">Focus : {activeEntity.nom}</div>
                        <div className="kpi-body target-body">
                            <div className="target-stats">
                                <div className="kpi-stat">
                                    <span className="kpi-label" style={{ color: activeStatus.color }}>Ratio Local</span>
                                    <span className="kpi-value" style={{ color: activeStatus.color, fontSize: '1.75rem' }}>{activeEntity.ratio.toFixed(1)}%</span>
                                </div>
                            </div>
                            <div className="target-verdict">
                                <span className="verdict-title" style={{ color: activeStatus.color }}>
                                    {activeStatus.title}
                                </span>
                                <span className="verdict-desc">{activeStatus.desc}</span>
                            </div>
                        </div>
                        <div className="analysis-stats-row">
                            <div className="analysis-stat-box">
                                <span className="bento-label">Taux Pauvreté</span>
                                <div className="stat-value-small">{activeEntity.pauv.toFixed(1)}%</div>
                            </div>
                            <div className="analysis-stat-box">
                                <span className="bento-label">Parc Social</span>
                                <div className="stat-value-small">{activeEntity.social.toFixed(1)}%</div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="bi-chart-panel">
                <div className="chart-toolbar">
                    <h2 className="chart-title">Classement ({isNationalView ? 'Toutes les Régions' : selectedRegion})</h2>
                    <div className="chart-legend-bottom">
                        <div className="legend-item"><span className="legend-color" style={{ backgroundColor: '#ef4444' }}></span>Déficit (&lt;70%)</div>
                        <div className="legend-item"><span className="legend-color" style={{ backgroundColor: '#f59e0b' }}></span>Tension (70-100%)</div>
                        <div className="legend-item"><span className="legend-color" style={{ backgroundColor: '#10b981' }}></span>Excédent (&gt;100%)</div>
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
        </div>
    );
}