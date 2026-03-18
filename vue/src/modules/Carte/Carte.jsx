import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import { Search, Map as MapIcon, Info, X, Activity, Droplets, Home, Flame, Navigation, Crosshair, Calendar } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import './Carte.css';

import { getCarteData } from '../../services/territoireService';
import { getChomageData, getThermiqueData, getLogementData, getQuadrantData } from '../../services/dataService';
import LogoLoader from '../../components/LogoLoader/LogoLoader';

function MapController({ targetView }) {
    const map = useMap();
    useEffect(() => {
        if (targetView && targetView.center) {
            try {
                map.flyTo(targetView.center, targetView.zoom, { duration: 1.5 });
            } catch (e) {
                console.warn("Erreur Leaflet flyTo", e);
            }
        }
    }, [targetView, map]);
    return null;
}

function MapResizer() {
    const map = useMap();
    useEffect(() => {
        const timer = setTimeout(() => {
            try { map.invalidateSize(); } catch (e) { }
        }, 400);
        return () => clearTimeout(timer);
    }, [map]);
    return null;
}

const METRO_VIEW = { id: 'metro', label: 'Métropole', center: [46.6, 1.8], zoom: 6 };
const IDF_VIEW = { id: 'idf', label: 'Île-de-France', center: [48.7, 2.5], zoom: 8 };
const DROM_VIEWS = [
    { id: 'guadeloupe', label: 'Guadeloupe', center: [16.24, -61.55], zoom: 9 },
    { id: 'martinique', label: 'Martinique', center: [14.64, -61.02], zoom: 9 },
    { id: 'guyane', label: 'Guyane', center: [3.9, -53.1], zoom: 6 },
    { id: 'reunion', label: 'La Réunion', center: [-21.1, 55.5], zoom: 9 },
];

const TerritoireLayer = ({ territoire, isSelected, onClick }) => {
    const geom = useMemo(() => {
        if (!territoire?.geom) return null;
        if (typeof territoire.geom === 'object') return territoire.geom;
        try {
            return JSON.parse(territoire.geom);
        } catch (e) {
            return null;
        }
    }, [territoire]);

    const style = useMemo(() => ({
        color: isSelected ? '#ffffff' : '#3f3f46',
        weight: isSelected ? 2 : 1,
        fillOpacity: isSelected ? 0.3 : 0.1,
        fillColor: isSelected ? '#ffffff' : '#000000',
    }), [isSelected]);

    if (!geom) return null;

    return (
        <GeoJSON
            key={`${territoire.code}-${isSelected ? 'active' : 'inactive'}`}
            data={geom}
            style={style}
            eventHandlers={{ click: onClick }}
        />
    );
};

export default function Carte() {
    const [territoires, setTerritoires] = useState([]);
    const [statsGlobales, setStatsGlobales] = useState({});
    const [availableYears, setAvailableYears] = useState([]);

    const [selectedId, setSelectedId] = useState(null);
    const [selectedYear, setSelectedYear] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [mainView, setMainView] = useState(METRO_VIEW);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;

        const fetchAllData = async () => {
            try {
                const carteRes = await getCarteData().catch(() => []);
                const chomageRes = await getChomageData().catch(() => []);
                const thermiqueRes = await getThermiqueData().catch(() => []);
                const logementRes = await getLogementData().catch(() => []);
                const pauvreteRes = await getQuadrantData().catch(() => []);

                if (!isMounted) return;

                const carte = carteRes?.['hydra:member'] || carteRes || [];
                const statsMap = {};
                const yearsSet = new Set();

                (Array.isArray(carte) ? carte : []).forEach(t => {
                    if (t && t.id) {
                        statsMap[t.id] = { ...t, dataByYear: {} };
                    }
                });

                const extractVal = (arr, statKey, apiKeys) => {
                    const data = arr?.['hydra:member'] || arr || [];
                    if (!Array.isArray(data)) return;

                    data.forEach(item => {
                        if (!item) return;
                        const tId = item.territoireId || item.territoire_id || item.territoire?.id;
                        const annee = item.annee ? item.annee.toString() : '2023';

                        if (tId && statsMap[tId]) {
                            yearsSet.add(annee);
                            if (!statsMap[tId].dataByYear[annee]) {
                                statsMap[tId].dataByYear[annee] = {};
                            }

                            for (let key of apiKeys) {
                                if (item[key] !== undefined && item[key] !== null) {
                                    statsMap[tId].dataByYear[annee][statKey] = parseFloat(item[key]);
                                    break;
                                }
                            }
                        }
                    });
                };

                extractVal(chomageRes, 'chomage', ['tauxChomage', 'taux_chomage', 'taux', 'Taux de chômage au T4 (en %)']);
                extractVal(thermiqueRes, 'thermique', ['passoiresThermiques', 'passoires_thermiques']);
                extractVal(logementRes, 'logement', ['tauxHlm', 'taux_hlm', 'Taux de logements sociaux* (en %)']);
                extractVal(pauvreteRes, 'pauvrete', ['tauxPauvrete', 'taux_pauvrete']);

                const yearsArray = Array.from(yearsSet).sort((a, b) => b - a);

                setAvailableYears(yearsArray);
                if (yearsArray.length > 0) setSelectedYear(yearsArray[0]);

                setTerritoires(Array.isArray(carte) ? carte : []);
                setStatsGlobales(statsMap);
            } catch (error) {
                console.error("Erreur de récupération :", error);
            } finally {
                if (isMounted) setIsLoading(false);
            }
        };

        fetchAllData();
        return () => { isMounted = false; };
    }, []);

    const suggestions = useMemo(() => {
        if (!searchQuery) return [];
        const query = searchQuery.toLowerCase();
        return territoires.filter(t =>
            (t?.nom && t.nom.toLowerCase().includes(query)) ||
            (t?.code && t.code.toLowerCase().includes(query))
        ).slice(0, 5);
    }, [searchQuery, territoires]);

    const handleSelectTerritoire = useCallback((t) => {
        setSelectedId(t.id);
        setSearchQuery('');
        if (t.lat && t.lng) {
            setMainView({ center: [parseFloat(t.lat), parseFloat(t.lng)], zoom: 8 });
        }
    }, []);

    const territoryInfo = selectedId ? statsGlobales[selectedId] : null;
    const selectedData = territoryInfo?.dataByYear?.[selectedYear] || {};

    const formatStat = (val) => (val !== undefined && !isNaN(val)) ? `${val.toFixed(1)}%` : '--';

    if (isLoading) return <LogoLoader text="Initialisation de la cartographie..." />;

    return (
        <div className="carte-dashboard-wrapper">
            <header className="carte-header">
                <div>
                    <h1 className="carte-main-title">Hub Cartographique</h1>
                    <p className="carte-main-subtitle">Exploration géographique et consultation rapide des indicateurs bruts.</p>
                </div>
            </header>

            <nav className="carte-toolbar">
                <div className="carte-filter-group">
                    <label className="carte-label">Millésime</label>
                    <div className="carte-select-wrapper">
                        <Calendar size={14} className="carte-icon-muted" />
                        <select
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(e.target.value)}
                            className="carte-select"
                        >
                            {availableYears.length === 0 && <option value="">-</option>}
                            {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                    </div>
                </div>

                <div className="carte-filter-group" style={{ flex: 1.5, position: 'relative' }}>
                    <label className="carte-label">Rechercher un territoire</label>
                    <div className="carte-search-input">
                        <Search size={14} className="carte-icon-muted" />
                        <input
                            type="text"
                            placeholder="Nom du département ou code..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        {searchQuery && <button onClick={() => setSearchQuery('')} className="carte-clear-btn"><X size={14} /></button>}
                    </div>

                    {suggestions.length > 0 && (
                        <div className="carte-suggestions-dropdown">
                            {suggestions.map(s => (
                                <div key={s.id} className="carte-suggestion-item" onClick={() => handleSelectTerritoire(s)}>
                                    <MapIcon size={14} /> <span>{s.nom} ({s.code})</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="carte-filter-group" style={{ flex: 2 }}>
                    <label className="carte-label">Vues Rapides</label>
                    <div className="carte-quick-views">
                        <button className="carte-view-btn" onClick={() => setMainView(METRO_VIEW)}>
                            <Navigation size={14} /> Métropole
                        </button>
                        <button className="carte-view-btn" onClick={() => setMainView(IDF_VIEW)}>
                            <Crosshair size={14} /> IDF
                        </button>
                        <div className="carte-divider"></div>
                        {DROM_VIEWS.map(view => (
                            <button key={view.id} className="carte-view-btn outline" onClick={() => setMainView(view)}>
                                {view.label}
                            </button>
                        ))}
                    </div>
                </div>
            </nav>

            <div className="carte-body-layout">
                <div className="carte-map-section">
                    <div className="carte-map-container" style={{ height: '100%', minHeight: '500px', width: '100%', position: 'relative' }}>
                        <MapContainer
                            center={METRO_VIEW.center}
                            zoom={METRO_VIEW.zoom}
                            zoomControl={true}
                            style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, backgroundColor: '#000000' }}
                        >
                            {mainView && <MapController targetView={mainView} />}
                            <MapResizer />
                            <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
                            {territoires.map((t) => {
                                if (!t || !t.geom) return null;
                                return (
                                    <TerritoireLayer
                                        key={t.id}
                                        territoire={t}
                                        isSelected={selectedId === t.id}
                                        onClick={() => handleSelectTerritoire(t)}
                                    />
                                );
                            })}
                        </MapContainer>
                    </div>
                </div>

                <aside className="carte-side-section">
                    {territoryInfo ? (
                        <div className="carte-fiche-card active">
                            <div className="carte-fiche-header">Fiche d'identité • {selectedYear || "Aucune année"}</div>

                            <div className="carte-fiche-title-block">
                                <h2 className="carte-fiche-name">{territoryInfo.nom}</h2>
                                <span className="carte-fiche-badge">DÉPARTEMENT {territoryInfo.code}</span>
                            </div>

                            <div className="carte-stats-grid">
                                <div className="carte-stat-box">
                                    <span className="carte-stat-label"><Activity size={14} /> Chômage</span>
                                    <span className="carte-stat-value">{formatStat(selectedData.chomage)}</span>
                                </div>
                                <div className="carte-stat-box">
                                    <span className="carte-stat-label"><Droplets size={14} /> Pauvreté</span>
                                    <span className="carte-stat-value">{formatStat(selectedData.pauvrete)}</span>
                                </div>
                                <div className="carte-stat-box">
                                    <span className="carte-stat-label"><Home size={14} /> HLM</span>
                                    <span className="carte-stat-value">{formatStat(selectedData.logement)}</span>
                                </div>
                                <div className="carte-stat-box">
                                    <span className="carte-stat-label"><Flame size={14} /> Passoires Ther.</span>
                                    <span className="carte-stat-value">{formatStat(selectedData.thermique)}</span>
                                </div>
                            </div>

                            {(!selectedData.chomage && !selectedData.logement && !selectedData.pauvrete && !selectedData.thermique) && (
                                <div className="carte-fiche-alert">Aucune donnée disponible pour ce territoire en {selectedYear || 'cette année'}.</div>
                            )}
                        </div>
                    ) : (
                        <div className="carte-fiche-card empty">
                            <Info size={32} className="carte-empty-icon" />
                            <p className="carte-empty-text">Sélectionnez un département sur la carte ou utilisez la barre de recherche pour consulter ses données.</p>
                        </div>
                    )}
                </aside>
            </div>
        </div>
    );
}