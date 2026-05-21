import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router';
import { useTranslation } from 'react-i18next';

import { useGeolocation }   from '../hooks/useGeolocation';
import { useLaverieSearch } from '../hooks/useLaverieSearch';
import LaverieMap  from '../components/map/LaverieMap';
import SearchBar   from '../components/search/SearchBar';
import FilterPanel from '../components/search/FilterPanel';
import LaverieGrid from '../components/laverie/LaverieGrid';
import Notification from '../components/Notification';
import { useFavorites } from '../hooks/useFavorites';

import type { GeoSuggestion, Laverie } from '../types/Laverie';

function getRolesFromToken(token: string): string[] {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            window.atob(base64).split('').map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
        );
        return JSON.parse(jsonPayload).roles || [];
    } catch {
        return [];
    }
}

function isStandardUserToken(token: string): boolean {
    const roles = getRolesFromToken(token);
    return !roles.some((role) => role.includes('PROFESSIONNEL') || role.includes('ADMIN'));
}

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

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

    const isStandardUser = useMemo(() => {
        const token = localStorage.getItem('token');
        return !!token && isStandardUserToken(token);
    }, []);

    // ── Géolocalisation ───────────────────────────────────────────────────────
    const { userPos, centerPos, setCenterPos, geoRefused, requestGeolocation } = useGeolocation();
    const [mapZoom, setMapZoom] = useState(12);

    // Demande la position au chargement — le navigateur affiche sa popup native si besoin
    useEffect(() => {
        requestGeolocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
    const {
        favoriteIds,
        pendingIds: favoritePendingIds,
        toggleFavorite,
        error: favoriteError,
    } = useFavorites();

    // ── Recherche ─────────────────────────────────────────────────────────────
    const {
        laveries, loading, searched,
        filtres, setFiltreHoraire, toggleServiceId, togglePaiementId, setFiltreRayon, reinitialiserFiltres, nbFiltresActifs,
        searchQuery, setSearchQuery, suggestions, showSuggestions, setShowSuggestions, geocoding,
        handleSearchInput, lancerRecherche, rechercherParTexte,
    } = useLaverieSearch();

    useEffect(() => {
        if (!favoriteError || !isStandardUser) return;
        setNotification({ type: 'error', message: favoriteError });
    }, [favoriteError, isStandardUser]);

    useEffect(() => {
        if (userPos) { setMapZoom(14); lancerRecherche(userPos); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userPos]);

    // Remplace la distance backend par la distance réelle depuis la position GPS de l'utilisateur
    const laveriesWithUserDistance = useMemo<Laverie[]>(() => {
        if (!userPos) return laveries;
        return laveries.map((l) => ({
            ...l,
            distance: l.latitude !== null && l.longitude !== null
                ? haversineKm(userPos.lat, userPos.lng, l.latitude, l.longitude)
                : null,
        }));
    }, [laveries, userPos]);

    // ── État UI carte ─────────────────────────────────────────────────────────
    const [activeLaverieId, setActiveLaverieId] = useState<number | null>(null);
    const [showFilters, setShowFilters] = useState(false);
    const cardRefs = useRef<Record<number, HTMLDivElement | null>>({});

    // Clic sur une card : fly-to + scroll liste
    const handleLaverieSelect = (l: Laverie) => {
        setActiveLaverieId(l.id);
        if (l.latitude && l.longitude) { setCenterPos({ lat: l.latitude, lng: l.longitude }); setMapZoom(16); }
        cardRefs.current[l.id]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    };

    // Clic sur un marker : centre la carte + highlight + scroll liste uniquement sur desktop (xl)
    const handleMarkerClick = (l: Laverie) => {
        setActiveLaverieId(l.id);
        if (l.latitude && l.longitude) setCenterPos({ lat: l.latitude, lng: l.longitude });
        if (window.innerWidth >= 1280) {
            cardRefs.current[l.id]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    };

    const handleSuggestionPick = (s: GeoSuggestion) => {
        const pos = { lat: s.latitude, lng: s.longitude };
        setCenterPos(pos); setMapZoom(14);
        setSearchQuery(s.label.split(',')[0]);
        lancerRecherche(pos);
    };

    const handleFavoriteToggle = async (laverie: Laverie) => {
        if (!isStandardUser) {
            setNotification({ type: 'error', message: t('main.home.favoris_connexion_requise') });
            return;
        }

        try {
            const isAlreadyFavorite = favoriteIds.includes(laverie.id);
            const action = await toggleFavorite(laverie.id, !isAlreadyFavorite);
            setNotification({
                type: 'success',
                message: action === 'added'
                    ? t('main.home.favori_ajoute', { nom: laverie.nom })
                    : t('main.home.favori_retire', { nom: laverie.nom }),
            });
        } catch (err: any) {
            setNotification({
                type: 'error',
                message: err?.message || t('main.home.favoris_erreur'),
            });
        }
    };



    // Tri : favoris en tête, puis ordre du serveur (distance / nom)
    const sortedLaveries = useMemo(() => {
        if (!favoriteIds.length) return laveriesWithUserDistance;
        return [...laveriesWithUserDistance].sort((a, b) => {
            const aFav = favoriteIds.includes(a.id) ? 0 : 1;
            const bFav = favoriteIds.includes(b.id) ? 0 : 1;
            return aFav - bFav;
        });
    }, [laveriesWithUserDistance, favoriteIds]);

    return (
        <div className="flex flex-col bg-slate-50 min-h-screen py-20 w-full">
            {notification && (
                <Notification
                    type={notification.type}
                    message={notification.message}
                    onClose={() => setNotification(null)}
                />
            )}
            <div className="w-full max-w-[1280px] mx-auto flex flex-col justify-between xl:flex-row">
                <div className='mt-5 rounded-xl overflow-hidden relative w-full'>
                    {flashMessageKey && (
                        <div className="mx-5 mt-4 p-3 rounded-xl bg-green-100 text-green-800 text-sm font-medium" role="status" aria-live="polite">
                            {t(flashMessageKey)}
                        </div>
                    )}

                    {geoRefused && !searched && (
                        <div className="mx-5 mt-4 flex items-start gap-3 p-3 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-800" role="status">
                            <svg className="shrink-0 mt-0.5" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
                            </svg>
                            <p>{t('main.home.geo_refuse')}</p>
                        </div>
                    )}

                    <div className="mt-5 relative z-10">
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

                    {/* Carte — le bouton "se localiser" est géré à l'intérieur */}
                    <LaverieMap
                        centerPos={centerPos} zoom={mapZoom} userPos={userPos}
                        laveries={laveriesWithUserDistance} activeLaverieId={activeLaverieId}
                        onMarkerClick={handleMarkerClick}

                        searchRadius={filtres.rayon}
                        searched={searched}
                        filterSlot={
                            <div>
                                <button
                                    type="button"
                                    onClick={() => setShowFilters((v) => !v)}
                                    aria-expanded={showFilters}
                                    aria-label={t('main.home.filtres')}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium shadow transition-all ${nbFiltresActifs > 0 ? 'bg-[#14A8DE] text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                                >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                                        <line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/>
                                    </svg>
                                    {t('main.home.filtres')}
                                    {nbFiltresActifs > 0 && <span className="bg-white/30 text-white rounded-full px-1.5 py-0.5 text-xs font-bold leading-none">{nbFiltresActifs}</span>}
                                </button>
                                {showFilters && (
                                    <div className="mt-2">
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
                                    </div>
                                )}
                            </div>
                        }
                    />
                </div>
                <div className='mt-6 w-full xl:w-1/2 xl:overflow-y-auto xl:max-h-[calc(100vh-5rem)] xl:sticky xl:top-20'>
                    {/* Résultats */}
                    <div className="px-5 mt-6 pb-20">
                        {/* <div className="flex items-center justify-between mb-4">
                            <h2>{t('main.home.a_proximite')}</h2>
                            <Link to="/laveries">{t('main.home.voir_tout')}</Link>
                        </div> */}
                        <LaverieGrid
                            laveries={sortedLaveries} loading={loading} searched={searched}
                            activeLaverieId={activeLaverieId} onCardClick={handleLaverieSelect}
                            cardRefs={cardRefs} nbFiltresActifs={nbFiltresActifs}
                            onClearFilters={() => { reinitialiserFiltres(); lancerRecherche(userPos ?? undefined); }}
                            showFavoriteButton={isStandardUser}
                            favoriteIds={favoriteIds}
                            favoritePendingIds={favoritePendingIds}
                            onFavoriteToggle={handleFavoriteToggle}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
