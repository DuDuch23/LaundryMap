import type { RefObject } from 'react';
import { useTranslation } from 'react-i18next';
import type { Laverie } from '../../types/Laverie';
import LaverieCard from './LaverieCard';

interface Props {
    laveries: Laverie[];
    loading: boolean;
    searched: boolean;
    activeLaverieId: number | null;
    onCardClick: (l: Laverie) => void;
    cardRefs: RefObject<Record<number, HTMLDivElement | null>>;
    nbFiltresActifs: number;
    onClearFilters: () => void;
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function LaverieCardSkeleton() {
    return (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm animate-pulse flex gap-3 p-3" aria-hidden="true">
            <div className="w-20 h-20 flex-shrink-0 rounded-xl bg-slate-200" />
            <div className="flex flex-col flex-1 justify-between py-0.5">
                <div className="h-4 bg-slate-200 rounded w-3/4" />
                <div className="h-3 bg-slate-100 rounded w-1/2" />
                <div className="h-5 bg-slate-100 rounded w-1/3" />
            </div>
        </div>
    );
}

// ─── État vide ────────────────────────────────────────────────────────────────

function EmptyState({ nbFiltresActifs, onClearFilters }: { nbFiltresActifs: number; onClearFilters: () => void }) {
    const { t } = useTranslation();
    return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4" aria-hidden="true">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5" aria-hidden="true">
                    <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
                </svg>
            </div>
            <h3 className="text-base font-semibold text-slate-700 mb-1">{t('main.laverie_grid.aucune_laverie')}</h3>
            <p className="text-sm text-slate-400 max-w-xs">
                {t('main.laverie_grid.aucune_laverie_desc')}
            </p>
            {nbFiltresActifs > 0 && (
                <button
                    type="button"
                    onClick={onClearFilters}
                    className="mt-4 px-4 py-2 rounded-xl bg-[#14A8DE]/10 text-[#14A8DE] text-sm font-medium hover:bg-[#14A8DE]/20 transition-colors"
                >
                    {t('main.laverie_grid.retirer_filtres')}
                </button>
            )}
        </div>
    );
}

// ─── État initial ─────────────────────────────────────────────────────────────

function InitialState() {
    const { t } = useTranslation();
    return (
        <div className="flex flex-col items-center justify-center py-14 text-center">
            <div className="w-16 h-16 bg-[#14A8DE]/10 rounded-full flex items-center justify-center mb-4" aria-hidden="true">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#14A8DE" strokeWidth="1.5" aria-hidden="true">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                </svg>
            </div>
            <h3 className="text-base font-semibold text-slate-700 mb-1">{t('main.laverie_grid.trouver_laverie')}</h3>
            <p className="text-sm text-slate-400 max-w-xs">
                {t('main.laverie_grid.trouver_laverie_desc')}
            </p>
        </div>
    );
}

// ─── Composant principal ──────────────────────────────────────────────────────

export default function LaverieGrid({
    laveries, loading, searched, activeLaverieId,
    onCardClick, cardRefs, nbFiltresActifs, onClearFilters,
}: Props) {
    if (loading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" aria-busy="true" aria-label="Chargement…">
                {[...Array(4)].map((_, i) => <LaverieCardSkeleton key={i} />)}
            </div>
        );
    }

    if (!searched) return <InitialState />;

    if (laveries.length === 0) {
        return <EmptyState nbFiltresActifs={nbFiltresActifs} onClearFilters={onClearFilters} />;
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {laveries.map((l) => (
                <div
                    key={l.id}
                    ref={(el) => { if (cardRefs.current) cardRefs.current[l.id] = el; }}
                >
                    <LaverieCard
                        laverie={l}
                        active={activeLaverieId === l.id}
                        onClick={onCardClick}
                    />
                </div>
            ))}
        </div>
    );
}
