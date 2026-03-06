import React, { useState, useEffect, useMemo } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Tooltip,
    Legend
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { getBetonData } from '../../services/dataService';
import { getCarteData } from '../../services/territoireService';
import './Beton.css';
import LogoLoader from '../LogoLoader/LogoLoader';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

const COLORS = {
    good: '#4ade80',
    over: '#fbbf24',
    under: '#f87171',
    inactive: '#2d3136'
};

export default function ParadoxeBeton() {
    const [donneesGlobales, setDonneesGlobales] = useState([]);
    const [anneesDisponibles, setAnneesDisponibles] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // États des filtres
    const [selectedYear, setSelectedYear] = useState('');
    const [selectedRegion, setSelectedRegion] = useState('all');
    const [selectedDept, setSelectedDept] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const betonRes = await getBetonData();
                const territoiresRes = await getCarteData().catch(() => null);

                await new Promise(resolve => setTimeout(resolve, 2000));

                const rawBeton = betonRes?.['hydra:member'] || betonRes?.data || betonRes || [];
                const rawTerritoires = territoiresRes?.['hydra:member'] || territoiresRes?.data || territoiresRes || [];

                const mapTerritoires = {};
                rawTerritoires.forEach(t => {
                    if (t.id) mapTerritoires[t.id.toString()] = t;
                    if (t.code) mapTerritoires[t.code.toString()] = t;
                });

                // 1. Extraction et nettoyage
                const dataNettoyee = (Array.isArray(rawBeton) ? rawBeton : [rawBeton]).map(ind => {
                    if (!ind) return null;

                    let tId = ind.territoireId || ind.territoire_id;
                    if (!tId && ind.territoire) {
                        if (typeof ind.territoire === 'string') tId = ind.territoire.split('/').pop();
                        else if (typeof ind.territoire === 'object') tId = ind.territoire.id || ind.territoire.code;
                    }

                    const tLie = tId ? mapTerritoires[tId.toString()] : null;
                    const nomRegion = tLie ? (tLie.region?.nom || tLie.region) : 'Non défini';

                    return {
                        id: tId || Math.random().toString(),
                        nom: tLie ? tLie.nom : `Inconnu (${tId})`,
                        region: nomRegion,
                        annee: ind.annee ? ind.annee.toString() : '2022',
                        valPop: parseInt(ind.rangPop ?? ind.rang_pop ?? ind.population ?? 0, 10),
                        valConst: parseInt(ind.rangConst ?? ind.rang_const ?? ind.construction ?? 0, 10)
                    };
                }).filter(d => d && !d.nom.startsWith('Inconnu') && !d.nom.startsWith('Zone'));

                // 2. Regroupement par année avec SÉCURITÉ ANTI-DOUBLON
                const dataParAnnee = {};
                dataNettoyee.forEach(d => {
                    if (!dataParAnnee[d.annee]) dataParAnnee[d.annee] = new Map();
                    // L'utilisation d'une Map avec le nom comme clé écrase les doublons éventuels
                    dataParAnnee[d.annee].set(d.nom, d);
                });

                let dataEnrichie = [];
                Object.keys(dataParAnnee).forEach(annee => {
                    // On transforme la Map en tableau propre
                    let dataAnnee = Array.from(dataParAnnee[annee].values());

                    // Création du classement Population
                    dataAnnee.sort((a, b) => b.valPop - a.valPop);
                    dataAnnee.forEach((d, index) => { d.rankPop = index + 1; });

                    // Création du classement Construction
                    dataAnnee.sort((a, b) => b.valConst - a.valConst);
                    dataAnnee.forEach((d, index) => { d.rankConst = index + 1; });

                    // Calcul de l'état d'alignement
                    dataAnnee.forEach(d => {
                        const diff = d.rankPop - d.rankConst;
                        d.align = diff < -15 ? 'under' : (diff > 15 ? 'over' : 'good');
                        d.totalDepts = dataAnnee.length; // Sert à bloquer l'axe Y du graphique
                        dataEnrichie.push(d);
                    });
                });

                setDonneesGlobales(dataEnrichie);

                // Initialisation des filtres avec l'année la plus récente
                const anneesUniques = [...new Set(dataEnrichie.map(d => d.annee))].sort((a, b) => b - a);
                setAnneesDisponibles(anneesUniques);
                if (anneesUniques.length > 0) setSelectedYear(anneesUniques[0].toString());

            } catch (error) {
                console.error("Erreur d'assemblage :", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    // --------------------------------------------------------------------------------
    // MOTEUR DE FILTRAGE STRICT EN CASCADE
    // --------------------------------------------------------------------------------

    // 1. On isole UNIQUEMENT l'année active
    const yearData = useMemo(() => {
        if (!selectedYear) return [];
        return donneesGlobales.filter(d => d.annee === selectedYear);
    }, [donneesGlobales, selectedYear]);

    // 2. On liste les régions disponibles pour CETTE année précise
    const availableRegions = useMemo(() => {
        return [...new Set(yearData.map(d => d.region))].filter(r => r !== 'Non défini').sort();
    }, [yearData]);

    // 3. On filtre les départements selon la région sélectionnée
    const sortedRegionData = useMemo(() => {
        const data = selectedRegion === 'all'
            ? yearData
            : yearData.filter(d => d.region === selectedRegion);
        return data.sort((a, b) => a.nom.localeCompare(b.nom));
    }, [yearData, selectedRegion]);

    // 4. On détermine le département actif de façon ultra-sécurisée
    const activeDeptObj = useMemo(() => {
        if (sortedRegionData.length === 0) return null;
        const found = sortedRegionData.find(d => d.nom === selectedDept);
        return found || sortedRegionData[0]; // Retombe toujours sur le premier de la liste valide
    }, [sortedRegionData, selectedDept]);

    const maxRankInYear = yearData.length > 0 ? yearData[0].totalDepts : 100;

    // --------------------------------------------------------------------------------
    // GRAPHIQUE ET OPTIONS
    // --------------------------------------------------------------------------------

    const chartData = useMemo(() => {
        const activeDeptName = activeDeptObj ? activeDeptObj.nom : '';

        const datasets = sortedRegionData.map(d => {
            const isSelected = d.nom === activeDeptName;
            const accentColor = COLORS[d.align] || COLORS.inactive;

            return {
                label: d.nom,
                data: [d.rankPop, d.rankConst],
                borderColor: isSelected ? accentColor : COLORS.inactive,
                borderWidth: isSelected ? 4 : 2,
                pointRadius: isSelected ? 6 : 0,
                pointBackgroundColor: '#16191d',
                pointBorderColor: accentColor,
                pointBorderWidth: 3,
                tension: 0,
                order: isSelected ? -1 : 1
            };
        });

        return { labels: ['Pression Démographique', 'Effort de Construction'], datasets };
    }, [sortedRegionData, activeDeptObj]);

    const chartOptions = {
        responsive: true, maintainAspectRatio: false,
        interaction: { mode: 'nearest', intersect: false },
        plugins: { legend: { display: false }, tooltip: { enabled: false } },
        scales: {
            y: {
                reverse: true,
                min: 1,
                max: maxRankInYear,
                grid: { display: false }, ticks: { display: false }, border: { display: false }
            },
            x: {
                grid: { color: '#2d3136', lineWidth: 2, drawBorder: false, tickLength: 0 },
                ticks: { color: '#a0aab2', font: { size: 13, weight: '600', family: 'system-ui' }, padding: 15 },
                offset: true
            }
        },
        animation: { duration: 300 }
    };

    if (isLoading) return <LogoLoader text="Analyse en cours..." />;

    return (
        <div className="dashboard-bento-layout">
            <div className="bento-header-panel">
                <span className="quadrant-module-badge">Urbanisme & Stratégie</span>
                <h1 className="bento-title">Le Paradoxe du Béton</h1>
                <p className="bento-subtitle">L'effort de construction est-il vraiment aligné avec la dynamique de population locale ?</p>
            </div>

            <div className="paradoxe-grid">
                <div className="paradoxe-sidebar">
                    <div className="bento-controls-panel">
                        <div className="filter-group-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div className="filter-item">
                                <label className="bento-label">Année</label>
                                <select
                                    value={selectedYear}
                                    onChange={(e) => {
                                        setSelectedYear(e.target.value);
                                        setSelectedRegion('all');
                                        setSelectedDept('');
                                    }}
                                    className="bento-input-select"
                                >
                                    {anneesDisponibles.map(y => <option key={y} value={y}>{y}</option>)}
                                </select>
                            </div>

                            <div className="filter-item">
                                <label className="bento-label">Région</label>
                                <select
                                    value={selectedRegion}
                                    onChange={(e) => {
                                        setSelectedRegion(e.target.value);
                                        setSelectedDept('');
                                    }}
                                    className="bento-input-select"
                                >
                                    <option value="all">Filtre National</option>
                                    {availableRegions.map(r => <option key={r} value={r}>{r}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="filter-item" style={{ marginTop: '1rem' }}>
                            <label className="bento-label">Département Cible</label>
                            <select
                                value={activeDeptObj?.nom || ''}
                                onChange={(e) => setSelectedDept(e.target.value)}
                                className="bento-input-select"
                                disabled={sortedRegionData.length === 0}
                            >
                                {sortedRegionData.map(d => <option key={d.nom} value={d.nom}>{d.nom}</option>)}
                            </select>
                        </div>
                    </div>

                    {activeDeptObj && (
                        <div className="paradoxe-stats-box border-highlight" style={{ borderLeftColor: COLORS[activeDeptObj.align] }}>
                            <div className="analysis-stats-row">
                                <div className="analysis-stat-box">
                                    <span className="stat-label-muted">Population</span>
                                    <div className="stat-v-large">#{activeDeptObj.rankPop}</div>
                                    <span className="stat-subtitle">sur {maxRankInYear} depts</span>
                                    <div className="stat-detail-mini">
                                        Vol: <strong>{activeDeptObj.valPop.toLocaleString('fr-FR')}</strong>
                                    </div>
                                </div>

                                <div className="analysis-stat-box">
                                    <span className="stat-label-muted">Construction</span>
                                    <div className="stat-v-large">#{activeDeptObj.rankConst}</div>
                                    <span className="stat-subtitle">sur {maxRankInYear} depts</span>
                                    <div className="stat-detail-mini">
                                        Vol: <strong>{activeDeptObj.valConst.toLocaleString('fr-FR')}</strong>
                                    </div>
                                </div>
                            </div>

                            <div className={`verdict-box align-${activeDeptObj.align}`}>
                                {activeDeptObj.align === 'good' && (
                                    <><h4 className="color-primary">Cohérence Opérationnelle</h4><p>L'effort de construction est parfaitement aligné avec la dynamique de population locale.</p></>
                                )}
                                {activeDeptObj.align === 'over' && (
                                    <><h4 className="color-warning">Risque de Surchauffe</h4><p>Volume de construction élevé face à une pression démographique modérée.</p></>
                                )}
                                {activeDeptObj.align === 'under' && (
                                    <><h4 className="color-danger">Pénurie Structurelle</h4><p>La population augmente plus vite que l'offre de logements. Risque de tension immobilière.</p></>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className="bento-chart-panel paradoxe-chart-container">
                    {sortedRegionData.length > 0 ? (
                        <Line data={chartData} options={chartOptions} />
                    ) : (
                        <div className="no-data-display">
                            Aucune donnée disponible pour ces critères.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
