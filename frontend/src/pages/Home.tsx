import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router';
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

    // ── Géolocalisation à la demande ──────────────────────────────────────────
    // requestGeolocation() n'est appelé QUE sur clic explicite de l'utilisateur.
    const { userPos, centerPos, setCenterPos, geoRefused, geoLoading, requestGeolocation } = useGeolocation();
    const [mapZoom, setMapZoom] = useState(12);

    // ── Recherche ─────────────────────────────────────────────────────────────
    const {
        laveries, loading, searched,
        filtres, setFiltreHoraire, toggleServiceId, togglePaiementId, setFiltreRayon, reinitialiserFiltres, nbFiltresActifs,
        searchQuery, setSearchQuery, suggestions, showSuggestions, setShowSuggestions, geocoding,
        handleSearchInput, lancerRecherche, rechercherParTexte,
    } = useLaverieSearch();

    // Dès que la position est accordée, lancer une recherche automatique.
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

    // Le bouton CTA de géolocalisation s'affiche uniquement :
    //  - avant toute recherche (searched = false)
    //  - tant que la position n'est pas encore connue
    //  - tant qu'elle n'a pas été refusée
    const showGeoCta = !searched && !userPos && !geoRefused;

    return (
        <div className="flex flex-col bg-slate-50 min-h-screen pt-20 w-full">
            <div className="w-full max-w-[1280px] mx-auto">

                {flashMessageKey && (
                    <div className="mx-5 mt-4 p-3 rounded-xl bg-green-100 text-green-800 text-sm font-medium" role="status" aria-live="polite">
                        {t(flashMessageKey)}
                    </div>
                )}

                {/* Bannière de refus — uniquement si l'utilisateur a explicitement cliqué */}
                {geoRefused && !searched && (
                    <div className="mx-5 mt-4 flex items-start gap-3 p-3 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-800" role="status">
                        <svg className="shrink-0 mt-0.5" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
                        </svg>
                        <p>{t('main.home.geo_refuse')}</p>
                    </div>
                )}
                <div className="mt-5 relative z-10 px-5">
                    <SearchBar
                        value={searchQuery} onChange={handleSearchInput}
                        onSubmit={(e) => { e.preventDefault(); if (searchQuery.trim()) rechercherParTexte(searchQuery); }}
                        onGeoClick={() => { if (userPos) { setCenterPos(userPos); setMapZoom(14); lancerRecherche(userPos); } }}
                        showGeo={!!userPos && !geoRefused}
                        geocoding={geocoding} suggestions={suggestions} showSuggestions={showSuggestions}
                        onSuggestionPick={handleSuggestionPick}
                        onSuggestionBlur={() => setShowSuggestions(false)}
                    />

                    {/*
                      * Bouton CTA de géolocalisation.
                      *
                      * Affiché uniquement AVANT toute recherche et avant que la position
                      * soit connue. Il explique clairement POURQUOI la position est utile,
                      * ce qui augmente le taux d'acceptation et la confiance de l'utilisateur.
                      *
                      * La demande navigateur ne se déclenche QUE sur ce clic.
                      */}
                    {showGeoCta && (
                        <button
                            type="button"
                            onClick={requestGeolocation}
                            disabled={geoLoading}
                            aria-busy={geoLoading}
                            className="absolute top-[620px] right-5 w-auto mt-3 rounded-full bg-black flex items-center gap-3 px-4 py-3 border border-white/20 shadow-sm hover:bg-white hover:border-white active:scale-[.99] transition-all text-left group disabled:opacity-60 disabled:cursor-wait"
                        >
                            <span className="shrink-0 w-9 h-9 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-black transition-colors" aria-hidden="true">
                                {geoLoading ? (
                                    <div className="w-4 h-4 border-2 border-[#14A8DE] border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
                                        <path d="M7.425 13.5L5.2875 8.2125L0 6.075V5.025L13.5 0L8.475 13.5H7.425ZM7.9125 10.725L10.95 2.55L2.775 5.5875L6.45 7.05L7.9125 10.725Z" className="fill-white group-hover:fill-white" fill="white"/>
                                    </svg>
                                )}
                            </span>

                            <span className="block text-md font-semibold text-white group-hover:text-black transition-colors">
                                {geoLoading ? t('main.home.geo_chargement') : t('main.home.utiliser_position')}
                            </span>
                        </button>
                    )}

                    <div className="flex items-center justify-between mt-3">
                        <button
                            type="button"
                            onClick={() => setShowFilters((v) => !v)}
                            aria-expanded={showFilters}
                            aria-label={t('main.home.filtres')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${nbFiltresActifs > 0 ? 'bg-[#14A8DE] text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                                <line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/>
                            </svg>
                            {t('main.home.filtres')}
                            {nbFiltresActifs > 0 && <span className="bg-white/30 text-white rounded-full px-1.5 py-0.5 text-xs font-bold leading-none" aria-label={`${nbFiltresActifs}`}>{nbFiltresActifs}</span>}
                        </button>
                        {searched && <p className="text-xs text-slate-500" role="status" aria-live="polite">{loading ? t('main.home.recherche_en_cours') : t('main.home.resultats', { count: laveries.length })}</p>}
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

                {/* Carte */}
                <LaverieMap
                    centerPos={centerPos} zoom={mapZoom} userPos={userPos}
                    laveries={laveries} activeLaverieId={activeLaverieId}
                    onMarkerClick={handleLaverieSelect}
                />

                {/* Recherche & filtres */}

                {/* Résultats */}
                <div className="px-5 mt-6 pb-20">
                    <div className="flex items-center justify-between mb-4">
                        <h2>{t('main.home.a_proximite')}</h2>
                        <Link to="/laveries">{t('main.home.voir_tout')}</Link>
                    </div>
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
