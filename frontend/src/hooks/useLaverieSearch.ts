import { useCallback, useRef, useState } from 'react';
import { geocodeSuggestions, searchLaveries } from '../services/request';
import type { FiltresRecherche, GeoSuggestion, Laverie, Position, RechercheParams } from '../types/Laverie';

interface UseLaverieSearchResult {
    // Résultats
    laveries: Laverie[];
    loading: boolean;
    searched: boolean;
    // Filtres
    filtres: FiltresRecherche;
    setFiltreHoraire: (v: string) => void;
    toggleServiceId: (id: number) => void;
    togglePaiementId: (id: number) => void;
    setFiltreRayon: (v: number) => void;
    reinitialiserFiltres: () => void;
    nbFiltresActifs: number;
    // Recherche textuelle
    searchQuery: string;
    setSearchQuery: (v: string) => void;
    suggestions: GeoSuggestion[];
    showSuggestions: boolean;
    setShowSuggestions: (v: boolean) => void;
    geocoding: boolean;
    handleSearchInput: (v: string) => void;
    // Actions
    lancerRecherche: (pos?: Position) => Promise<void>;
    rechercherParTexte: (q: string) => Promise<void>;
}

const FILTRES_VIDES: FiltresRecherche = { horaire: '', serviceIds: [], paiementIds: [], rayon: 2 };

export function useLaverieSearch(): UseLaverieSearchResult {
    const [laveries, setLaveries] = useState<Laverie[]>([]);
    const [loading,  setLoading]  = useState(false);
    const [searched, setSearched] = useState(false);

    const [filtres, setFiltres] = useState<FiltresRecherche>(FILTRES_VIDES);

    const [searchQuery,     setSearchQuery]     = useState('');
    const [suggestions,     setSuggestions]     = useState<GeoSuggestion[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [geocoding,       setGeocoding]       = useState(false);

    const suggestTimer = useRef<ReturnType<typeof setTimeout>>(null);

    // ── Helpers filtres ───────────────────────────────────────────────────────

    const setFiltreHoraire = (v: string) =>
        setFiltres((f) => ({ ...f, horaire: f.horaire === v ? '' : v }));

    const toggleServiceId = (id: number) =>
        setFiltres((f) => ({
            ...f,
            serviceIds: f.serviceIds.includes(id)
                ? f.serviceIds.filter((x) => x !== id)
                : [...f.serviceIds, id],
        }));

    const togglePaiementId = (id: number) =>
        setFiltres((f) => ({
            ...f,
            paiementIds: f.paiementIds.includes(id)
                ? f.paiementIds.filter((x) => x !== id)
                : [...f.paiementIds, id],
        }));

    const setFiltreRayon = (v: number) => setFiltres((f) => ({ ...f, rayon: v }));

    const reinitialiserFiltres = () => setFiltres(FILTRES_VIDES);

    const nbFiltresActifs =
        (filtres.horaire ? 1 : 0) + filtres.serviceIds.length + filtres.paiementIds.length;

    // ── Appel API ─────────────────────────────────────────────────────────────

    const doSearch = useCallback(async (params: RechercheParams) => {
        setLoading(true);
        setSearched(true);
        try {
            const data = await searchLaveries({
                ...params,
                rayon:       filtres.rayon,
                horaire:     filtres.horaire     || undefined,
                serviceIds:  filtres.serviceIds.length  ? filtres.serviceIds  : undefined,
                paiementIds: filtres.paiementIds.length ? filtres.paiementIds : undefined,
            });
            setLaveries(data.laveries);
        } catch {
            setLaveries([]);
        } finally {
            setLoading(false);
        }
    }, [filtres]);

    const lancerRecherche = useCallback(
        (pos?: Position) => doSearch(pos ? { lat: pos.lat, lng: pos.lng } : {}),
        [doSearch],
    );

    const rechercherParTexte = useCallback(
        (q: string) => { setShowSuggestions(false); return doSearch({ q }); },
        [doSearch],
    );

    // ── Auto-complétion ───────────────────────────────────────────────────────

    const handleSearchInput = (v: string) => {
        setSearchQuery(v);
        if (suggestTimer.current) clearTimeout(suggestTimer.current);
        if (v.length < 2) { setSuggestions([]); return; }

        suggestTimer.current = setTimeout(async () => {
            setGeocoding(true);
            const data = await geocodeSuggestions(v);
            setSuggestions(data);
            setShowSuggestions(data.length > 0);
            setGeocoding(false);
        }, 350);
    };

    return {
        laveries, loading, searched,
        filtres, setFiltreHoraire, toggleServiceId, togglePaiementId, setFiltreRayon, reinitialiserFiltres, nbFiltresActifs,
        searchQuery, setSearchQuery, suggestions, showSuggestions, setShowSuggestions, geocoding,
        handleSearchInput,
        lancerRecherche, rechercherParTexte,
    };
}

