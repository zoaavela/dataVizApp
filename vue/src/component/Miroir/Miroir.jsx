import React, { useState, useEffect, useMemo } from 'react';
import {
    Chart as ChartJS,
    RadialLinearScale,
    PointElement,
    LineElement,
    Filler,
    Tooltip,
    Legend,
} from 'chart.js';
import { Radar } from 'react-chartjs-2';
import { getQuadrantData, getLogementData, getAgeData } from '../../services/dataService';
import { getCarteData } from '../../services/territoireService';
import LogoLoader from '../LogoLoader/LogoLoader';
import './Miroir.css';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

export default function Miroir() {
    const [isLoading, setIsLoading] = useState(true);
    const [allData, setAllData] = useState([]);
    const [selectedYear, setSelectedYear] = useState('2022');
    const [selectedDept, setSelectedDept] = useState('');

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const [quadrantRes, logementRes, ageRes, territoriesRes] = await Promise.all([
                    getQuadrantData().catch(() => ({ data: [] })),
                    getLogementData().catch(() => ({ data: [] })),
                    getAgeData().catch(() => ({ data: [] })),
                    getCarteData().catch(() => [])
                ]);

                await new Promise(r => setTimeout(r, 1500));

                const rawQ = quadrantRes?.['hydra:member'] || quadrantRes?.data || quadrantRes || [];
                const rawL = logementRes?.['hydra:member'] || logementRes?.data || logementRes || [];
                const rawA = ageRes?.['hydra:member'] || ageRes?.data || ageRes || [];
                const rawT = territoriesRes?.['hydra:member'] || territoriesRes?.data || territoriesRes || [];

                const mapT = {};
                rawT.forEach(t => mapT[t.id?.toString() || t.code?.toString()] = t);

                // Merge data by territory and year
                const merged = [];
                const years = new Set();

                rawQ.forEach(q => {
                    const tId = q.territoireId || q.territoire_id;
                    const year = q.annee?.toString() || '2022';
                    years.add(year);
                    const tInfo = mapT[tId?.toString()];
                    if (!tInfo) return;

                    // Find corresponding age and logement data
                    const a = rawA.find(x => (x.territoireId || x.territoire_id) == tId && (x.annee || 2022) == year);
                    const l = rawL.find(x => (x.territoireId || x.territoire_id) == tId && (x.annee || 2022) == year);

                    merged.push({
                        id: tId,
                        nom: tInfo.nom,
                        region: tInfo.region?.nom || tInfo.region,
                        year,
                        pauvrete: parseFloat(q.tauxPauvrete ?? q.taux_pauvrete ?? 0),
                        migration: parseFloat(q.soldeMigratoire ?? q.solde_migratoire ?? 0),
                        hlm: l ? parseFloat(l.tauxHlm ?? l.taux_hlm ?? 0) : 0,
                        jeunes: a ? parseFloat(a.partJeunes ?? a.part_jeunes ?? 0) : 0,
                        seniors: a ? parseFloat(a.partSeniors ?? a.part_seniors ?? 0) : 0
                    });
                });

                setAllData(merged);
                if (merged.length > 0) {
                    const sortedYears = Array.from(years).sort((a, b) => b - a);
                    setSelectedYear(sortedYears[0]);
                    setSelectedDept(merged.find(m => m.year === sortedYears[0])?.nom || '');
                }
            } catch (e) {
                console.error("Miroir Fetch Error:", e);
            } finally {
                setIsLoading(false);
            }
        };
        fetchAll();
    }, []);

    const yearData = useMemo(() => allData.filter(d => d.year === selectedYear), [allData, selectedYear]);
    const departments = useMemo(() => [...new Set(yearData.map(d => d.nom))].sort(), [yearData]);

    const nationalAvg = useMemo(() => {
        if (yearData.length === 0) return null;
        const count = yearData.length;
        return {
            pauvrete: yearData.reduce((s, d) => s + d.pauvrete, 0) / count,
            migration: yearData.reduce((s, d) => s + d.migration, 0) / count,
            hlm: yearData.reduce((s, d) => s + d.hlm, 0) / count,
            jeunes: yearData.reduce((s, d) => s + d.jeunes, 0) / count,
            seniors: yearData.reduce((s, d) => s + d.seniors, 0) / count
        };
    }, [yearData]);

    const activeDept = useMemo(() => yearData.find(d => d.nom === selectedDept), [yearData, selectedDept]);

    const chartData = useMemo(() => {
        if (!nationalAvg || !activeDept) return { labels: [], datasets: [] };

        const labels = ['Pauvreté (%)', 'Solde Migratoire', 'Taux HLM (%)', 'Part Jeunes (%)', 'Part Seniors (%)'];

        return {
            labels,
            datasets: [
                {
                    label: 'Moyenne Nationale',
                    data: [nationalAvg.pauvrete, nationalAvg.migration + 5, nationalAvg.hlm, nationalAvg.jeunes, nationalAvg.seniors],
                    backgroundColor: 'rgba(148, 163, 184, 0.2)',
                    borderColor: '#94a3b8',
                    borderWidth: 2,
                    pointBackgroundColor: '#94a3b8',
                },
                {
                    label: activeDept.nom,
                    data: [activeDept.pauvrete, activeDept.migration + 5, activeDept.hlm, activeDept.jeunes, activeDept.seniors],
                    backgroundColor: 'rgba(45, 212, 191, 0.4)',
                    borderColor: '#2dd4bf',
                    borderWidth: 3,
                    pointBackgroundColor: '#fff',
                    pointRadius: 4
                }
            ]
        };
    }, [nationalAvg, activeDept]);

    const chartOptions = {
        scales: {
            r: {
                angleLines: { color: 'rgba(255,255,255,0.1)' },
                grid: { color: 'rgba(255,255,255,0.1)' },
                pointLabels: { color: '#94a3b8', font: { size: 10, weight: '700' } },
                ticks: { display: false, stepSize: 5 },
                suggestedMin: 0,
                backgroundColor: 'rgba(13, 15, 17, 0.5)'
            }
        },
        plugins: {
            legend: {
                position: 'bottom',
                labels: { color: '#fff', usePointStyle: true, padding: 20 }
            }
        },
        maintainAspectRatio: false
    };

    if (isLoading) return <LogoLoader text="Reflet du miroir national..." />;

    return (
        <div className="dashboard-bento-layout">
            <div className="bento-header-panel">
                <span className="quadrant-module-badge color-info bg-info-soft">Benchmark Territorial</span>
                <h1 className="bento-title">Le Miroir National</h1>
                <p className="bento-subtitle">Situez instantanément un département par rapport aux moyennes du pays.</p>
            </div>

            <div className="paradoxe-grid">
                <div className="paradoxe-sidebar">
                    <div className="bento-controls-panel">
                        <div className="filter-group">
                            <label className="bento-label">Année</label>
                            <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} className="bento-input-select">
                                {[...new Set(allData.map(d => d.year))].sort((a, b) => b - a).map(y => <option key={y} value={y}>{y}</option>)}
                            </select>
                        </div>
                        <div className="filter-group">
                            <label className="bento-label">Département</label>
                            <select value={selectedDept} onChange={(e) => setSelectedDept(e.target.value)} className="bento-input-select">
                                {departments.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                        </div>
                    </div>

                    {activeDept && nationalAvg && (
                        <div className="bento-analysis-card border-highlight" style={{ borderLeftColor: '#2dd4bf' }}>
                            <div className="analysis-status-text">Récapitulatif</div>
                            <div className="miroir-comparison-list">
                                <div className="comparison-item">
                                    <span>Pauvreté</span>
                                    <div className="comparison-values">
                                        <span className="v-dept">{activeDept.pauvrete.toFixed(1)}%</span>
                                        <span className="v-nat">Nat: {nationalAvg.pauvrete.toFixed(1)}%</span>
                                    </div>
                                </div>
                                <div className="comparison-item">
                                    <span>HLM</span>
                                    <div className="comparison-values">
                                        <span className="v-dept">{activeDept.hlm.toFixed(1)}%</span>
                                        <span className="v-nat">Nat: {nationalAvg.hlm.toFixed(1)}%</span>
                                    </div>
                                </div>
                                <div className="comparison-item">
                                    <span>Jeunes</span>
                                    <div className="comparison-values">
                                        <span className="v-dept">{activeDept.jeunes.toFixed(1)}%</span>
                                        <span className="v-nat">Nat: {nationalAvg.jeunes.toFixed(1)}%</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="bento-chart-panel miroir-chart-container">
                    <div className="chart-wrapper">
                        <Radar data={chartData} options={chartOptions} />
                    </div>
                </div>
            </div>
        </div>
    );
}
