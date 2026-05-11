import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ajouterFavori, getMesFavoris, supprimerFavori, type FavoriLaverie } from '../services/request';

type FavoriteToggleResult = 'added' | 'removed';

export function useFavorites() {
    const [favoris, setFavoris] = useState<FavoriLaverie[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [pendingIds, setPendingIds] = useState<number[]>([]);
    const pendingIdsRef = useRef<Set<number>>(new Set());
    const requestSeqRef = useRef(0);

    const favoriteIds = useMemo(() => favoris.map((favori) => favori.id), [favoris]);

    const refresh = useCallback(async (silent = false) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setFavoris([]);
                setError(null);
                if (!silent) {
                    setLoading(false);
                }
                return;
            }

            const requestSeq = ++requestSeqRef.current;
            if (!silent) {
                setLoading(true);
            }

            const data = await getMesFavoris();
            if (requestSeq !== requestSeqRef.current) return;

            setFavoris(Array.isArray(data.favoris) ? data.favoris : []);
            setError(null);
        } catch (err: any) {
            if (!silent) {
                setError(err?.message || 'Impossible de récupérer vos favoris.');
            }
        } finally {
            if (!silent) {
                setLoading(false);
            }
        }
    }, []);

    useEffect(() => {
        void refresh();
    }, [refresh]);

    const toggleFavorite = useCallback(async (laverieId: number, shouldBeFavorite: boolean): Promise<FavoriteToggleResult> => {
        if (pendingIdsRef.current.has(laverieId)) {
            return shouldBeFavorite ? 'added' : 'removed';
        }

        try {
            pendingIdsRef.current.add(laverieId);
            setPendingIds((prev) => (prev.includes(laverieId) ? prev : [...prev, laverieId]));

            if (shouldBeFavorite) {
                await ajouterFavori(laverieId);
                return 'added';
            }

            await supprimerFavori(laverieId);
            return 'removed';
        } finally {
            await refresh(true);
            pendingIdsRef.current.delete(laverieId);
            setPendingIds((prev) => prev.filter((id) => id !== laverieId));
        }
    }, [refresh]);

    const addFavorite = useCallback((laverieId: number) => toggleFavorite(laverieId, true), [toggleFavorite]);
    const removeFavorite = useCallback((laverieId: number) => toggleFavorite(laverieId, false), [toggleFavorite]);

    return {
        favoris,
        favoriteIds,
        loading,
        error,
        pendingIds,
        refresh,
        addFavorite,
        removeFavorite,
        toggleFavorite,
    };
}
