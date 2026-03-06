import { useState, useEffect, useMemo, useCallback } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import { Search, Map as MapIcon, Info, ChevronRight, X, Navigation, Crosshair } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import './Carte.css';
import { getCarteData } from '../../services/territoireService';

function MapController({ targetView }) {
    const map = useMap();
    useEffect(() => {
        if (targetView) {
            map.flyTo(targetView.center, targetView.zoom, { duration: 1.5 });
        }
    }, [targetView, map]);
    return null;
}

function MapResizer() {
    const map = useMap();
    useEffect(() => {
        const timer = setTimeout(() => map.invalidateSize(), 400);
        return () => clearTimeout(timer);
    }, [map]);
    return null;
}

const METRO_VIEW = { id: 'metro', label: 'France Métropolitaine', center: [46.6, 1.8], zoom: 6 };
const IDF_VIEW = { id: 'idf', label: 'Île-de-France', center: [48.7, 2.5], zoom: 8 };

const MINI_VIEWS = [
    { id: 'guadeloupe', label: 'Guadeloupe', center: [16.24, -61.55], zoom: 8 },
    { id: 'martinique', label: 'Martinique', center: [14.64, -61.02], zoom: 8 },
    { id: 'guyane', label: 'Guyane', center: [3.9, -53.1], zoom: 5 },
    { id: 'reunion', label: 'Réunion', center: [-21.1, 55.5], zoom: 8 },
];

const TerritoireLayer = ({ territoire, isSelected, onClick }) => {
    const geom = useMemo(
        () => (typeof territoire.geom === 'string' ? JSON.parse(territoire.geom) : territoire.geom),
        [territoire.geom]
    );
    const style = useMemo(() => ({
        color: isSelected ? '#10b981' : '#22c55e',
        weight: isSelected ? 2.5 : 1,
        fillOpacity: isSelected ? 0.35 : 0.05,
        fillColor: '#10b981',
    }), [isSelected]);

    if (!geom) return null;
    return <GeoJSON data={geom} style={style} eventHandlers={{ click: onClick }} />;
};

const TerritoiresLayer = ({ territoires, selectedId, onSelect }) => (
    <>
        {territoires.map((t, index) => (
            <TerritoireLayer
                key={`${t.id}-${index}`}
                territoire={t}
                isSelected={selectedId === t.id}
                onClick={() => onSelect(t)}
            />
        ))}
    </>
);

export default function Carte() {
    const [territoires, setTerritoires] = useState([]);
    const [selected, setSelected] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [mainView, setMainView] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        getCarteData().then(res => {
            const data = res['hydra:member'] || res;
            setTerritoires(Array.isArray(data) ? data : []);
            setIsLoading(false);
        });
    }, []);

    const suggestions = useMemo(() => {
        if (!searchQuery) return [];

        const query = searchQuery.toLowerCase();

        const filtered = territoires.filter(t =>
            (t.nom && t.nom.toLowerCase().includes(query)) ||
            (t.code && t.code.toLowerCase().includes(query)) ||
            (t.region && t.region.toLowerCase().includes(query))
        );

        const uniqueSuggestions = [];
        const seenNames = new Set();

        for (const item of filtered) {
            const nameToTrack = item.nom ? item.nom.toLowerCase() : '';
            if (!seenNames.has(nameToTrack)) {
                seenNames.add(nameToTrack);
                uniqueSuggestions.push(item);
            }
        }

        return uniqueSuggestions.slice(0, 5);
    }, [searchQuery, territoires]);

    const handleSelectTerritoire = useCallback((t) => {
        setSelected(t);
        setSearchQuery('');
        if (t.lat && t.lng) {
            setMainView({ center: [parseFloat(t.lat), parseFloat(t.lng)], zoom: 8 });
        }
    }, []);

    const handleMiniClick = useCallback((view) => {
        setMainView({ center: view.center, zoom: view.zoom });
    }, []);

    return (
        <div className="bi-dashboard-container">
            <header className="bi-header">
                <div>
                    <h1 className="bi-title">Explorateur Cartographique</h1>
                    <p className="bi-subtitle">Visualisez et analysez les données territoriales de la France métropolitaine et des DROM.</p>
                </div>
            </header>

            <div className="carte-grid-layout">
                <aside className="carte-sidebar">
                    <div className="sidebar-box search-box">
                        <h3 className="box-title">Recherche</h3>
                        <div className="search-input-wrapper">
                            <Search size={16} className="search-icon" />
                            <input
                                type="text"
                                placeholder="Département, code, région..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            {searchQuery && (
                                <button className="search-clear" onClick={() => setSearchQuery('')}>
                                    <X size={14} />
                                </button>
                            )}
                        </div>
                        {suggestions.length > 0 && (
                            <div className="search-results">
                                {suggestions.map(s => (
                                    <div key={s.id} className="result-item" onClick={() => handleSelectTerritoire(s)}>
                                        <MapIcon size={14} />
                                        <span>{s.nom} {s.code ? `(${s.code})` : ''}</span>
                                        <ChevronRight size={14} className="arrow" />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="sidebar-box info-box">
                        <h3 className="box-title">Diagnostic Territorial</h3>
                        {selected ? (
                            <div className="info-content active">
                                <div className="info-header">
                                    <h4>{selected.nom}</h4>
                                    <button onClick={() => setSelected(null)} className="info-close"><X size={16} /></button>
                                </div>
                                <div className="metrics-grid">
                                    <div className="metric">
                                        <span className="metric-lbl">Code INSEE</span>
                                        <span className="metric-val">{selected.code}</span>
                                    </div>
                                    <div className="metric">
                                        <span className="metric-lbl">Logements</span>
                                        <span className="metric-val error">N/A</span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="info-content empty">
                                <Info size={20} className="empty-icon" />
                                <p>Sélectionnez un département sur la carte pour afficher ses données.</p>
                            </div>
                        )}
                    </div>
                </aside>

                <main className="carte-main-area">
                    {isLoading && (
                        <div className="map-loader">
                            <div className="spinner"></div>
                            <span>Chargement spatial...</span>
                        </div>
                    )}

                    <MapContainer
                        center={METRO_VIEW.center}
                        zoom={METRO_VIEW.zoom}
                        zoomControl={true}
                        style={{ height: '100%', width: '100%', backgroundColor: '#0b0c10' }}
                    >
                        {mainView && <MapController targetView={mainView} />}
                        <MapResizer />
                        <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
                        <TerritoiresLayer
                            territoires={territoires}
                            selectedId={selected?.id}
                            onSelect={handleSelectTerritoire}
                        />
                    </MapContainer>
                </main>

                <aside className="carte-sidebar">
                    <div className="sidebar-box nav-box">
                        <h3 className="box-title">Navigation Rapide</h3>

                        <div className="nav-buttons-container" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <div className="metro-nav-card" onClick={() => handleMiniClick(METRO_VIEW)}>
                                <Navigation size={18} className="nav-icon" />
                                <span>Centrer sur la Métropole</span>
                            </div>

                            <div className="metro-nav-card" onClick={() => handleMiniClick(IDF_VIEW)}>
                                <Crosshair size={18} className="nav-icon" />
                                <span>Centrer sur l'Île-de-France</span>
                            </div>
                        </div>

                        <div className="nav-divider"></div>
                        <h3 className="box-title">Outre-Mer (DROM)</h3>

                        <div className="drom-grid">
                            {MINI_VIEWS.map(view => (
                                <div key={view.id} className="drom-minimap" onClick={() => handleMiniClick(view)}>
                                    <span className="drom-tag">{view.label}</span>
                                    <MapContainer
                                        center={view.center}
                                        zoom={view.zoom}
                                        zoomControl={false}
                                        dragging={false}
                                        scrollWheelZoom={false}
                                        doubleClickZoom={false}
                                        attributionControl={false}
                                        style={{ height: '100%', width: '100%', backgroundColor: '#0b0c10' }}
                                    >
                                        <MapResizer />
                                        <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
                                        <TerritoiresLayer
                                            territoires={territoires}
                                            selectedId={selected?.id}
                                            onSelect={handleSelectTerritoire}
                                        />
                                    </MapContainer>
                                </div>
                            ))}
                        </div>
                    </div>
                </aside>

            </div>
        </div>
    );
}