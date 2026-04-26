import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';

import { useGeolocation }   from '../hooks/useGeolocation';
import { useLaverieSearch } from '../hooks/useLaverieSearch';
import LaverieMap  from '../components/map/LaverieMap';
import SearchBar   from '../components/search/SearchBar';
import FilterPanel from '../components/search/FilterPanel';
import LaverieGrid from '../components/laverie/LaverieGrid';

import type { GeoSuggestion, Laverie } from '../types/Laverie';

export default function Home() {
    const { t } = useTranslation();
    const location = useLocation();
    const navigate  = useNavigate();

    // ── Flash message ─────────────────────────────────────────────────────────
    const [flashMessageKey] = useState<string>(() =>
        (location.state as any)?.flashMessageKey || sessionStorage.getItem('flashMessageKey') || ''
    );
    useEffect(() => {
        if ((location.state as any)?.flashMessageKey) navigate(location.pathname, { replace: true, state: null });
        if (flashMessageKey) sessionStorage.removeItem('flashMessageKey');
    }, [flashMessageKey, location.pathname, location.state, navigate]);

    // ── Géolocalisation ───────────────────────────────────────────────────────
    const { userPos, centerPos, setCenterPos, geoRefused } = useGeolocation();
    const [mapZoom, setMapZoom] = useState(12);

    // ── Recherche ─────────────────────────────────────────────────────────────
    const {
        laveries, loading, searched,
        filtres, setFiltreHoraire, toggleServiceId, togglePaiementId, setFiltreRayon, reinitialiserFiltres, nbFiltresActifs,
        searchQuery, setSearchQuery, suggestions, showSuggestions, setShowSuggestions, geocoding,
        handleSearchInput, lancerRecherche, rechercherParTexte,
    } = useLaverieSearch();

    useEffect(() => {
        if (userPos) { setMapZoom(14); lancerRecherche(userPos); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userPos]);

    // ── État UI carte ─────────────────────────────────────────────────────────
    const [activeLaverieId, setActiveLaverieId] = useState<number | null>(null);
    const [showFilters, setShowFilters] = useState(false);
    const cardRefs = useRef<Record<number, HTMLDivElement | null>>({});

    const handleLaverieSelect = (l: Laverie) => {
        setActiveLaverieId(l.id);
        if (l.latitude && l.longitude) { setCenterPos({ lat: l.latitude, lng: l.longitude }); setMapZoom(16); }
        cardRefs.current[l.id]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    };

    const handleSuggestionPick = (s: GeoSuggestion) => {
        const pos = { lat: s.latitude, lng: s.longitude };
        setCenterPos(pos); setMapZoom(14);
        setSearchQuery(s.label.split(',')[0]);
        lancerRecherche(pos);
    };

    return (
        <div className="flex flex-col bg-slate-50 min-h-screen pt-20 w-full">
            <div className="w-full max-w-[1280px] mx-auto">

                {flashMessageKey && (
                    <div className="mx-5 mt-4 p-3 rounded-xl bg-green-100 text-green-800 text-sm font-medium" role="status" aria-live="polite">
                        {t(flashMessageKey)}
                    </div>
                )}

                {geoRefused && !searched && (
                    <div className="mx-5 mt-4 flex items-start gap-3 p-3 rounded-xl bg-[#14A8DE]/10 border border-[#14A8DE]/20 text-sm text-[#0d7ba8]" role="status">
                        <svg className="shrink-0 mt-0.5" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
                        </svg>
                        <p>Géolocalisation refusée. Saisissez votre ville ou code postal dans la barre de recherche pour trouver des laveries à proximité.</p>
                    </div>
                )}

                {/* Carte */}
                <LaverieMap
                    centerPos={centerPos} zoom={mapZoom} userPos={userPos}
                    laveries={laveries} activeLaverieId={activeLaverieId}
                    onMarkerClick={handleLaverieSelect}
                />

                {/* Recherche & filtres */}
                <div className="px-5 -mt-5 relative z-10">
                    <SearchBar
                        value={searchQuery} onChange={handleSearchInput}
                        onSubmit={(e) => { e.preventDefault(); if (searchQuery.trim()) rechercherParTexte(searchQuery); }}
                        onGeoClick={() => { if (userPos) { setCenterPos(userPos); setMapZoom(14); lancerRecherche(userPos); } }}
                        showGeo={!!userPos && !geoRefused}
                        geocoding={geocoding} suggestions={suggestions} showSuggestions={showSuggestions}
                        onSuggestionPick={handleSuggestionPick}
                        onSuggestionBlur={() => setShowSuggestions(false)}
                    />

                    <div className="flex items-center justify-between mt-3">
                        <button
                            type="button"
                            onClick={() => setShowFilters((v) => !v)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${nbFiltresActifs > 0 ? 'bg-[#14A8DE] text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/>
                            </svg>
                            Filtres
                            {nbFiltresActifs > 0 && <span className="bg-white/30 text-white rounded-full px-1.5 py-0.5 text-xs font-bold leading-none">{nbFiltresActifs}</span>}
                        </button>
                        {searched && <p className="text-xs text-slate-500">{loading ? 'Recherche en cours…' : `${laveries.length} laverie${laveries.length !== 1 ? 's' : ''} trouvée${laveries.length !== 1 ? 's' : ''}`}</p>}
                    </div>

                    {showFilters && (
                        <FilterPanel
                            filtres={filtres}
                            onHoraireChange={setFiltreHoraire}
                            onToggleServiceId={toggleServiceId}
                            onTogglePaiementId={togglePaiementId}
                            onRayonChange={setFiltreRayon}
                            onReinitialiser={reinitialiserFiltres}
                            onAppliquer={() => { setShowFilters(false); lancerRecherche(userPos ?? undefined); }}
                            nbActifs={nbFiltresActifs}
                        />
                    )}
                </div>

                {/* Résultats */}
                <div className="px-5 mt-6 pb-20">
                    <LaverieGrid
                        laveries={laveries} loading={loading} searched={searched}
                        activeLaverieId={activeLaverieId} onCardClick={handleLaverieSelect}
                        cardRefs={cardRefs} nbFiltresActifs={nbFiltresActifs}
                        onClearFilters={() => { reinitialiserFiltres(); lancerRecherche(userPos ?? undefined); }}
                    />
                </div>

            </div>
        </div>
    );
}