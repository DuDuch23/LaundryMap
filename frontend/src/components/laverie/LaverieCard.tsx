import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Heart, Loader2 } from 'lucide-react';
import type { Laverie } from '../../types/Laverie';
import API_BASE_URL, { resolveUrl, uploadPath } from '../../services/api';

const FALLBACK_IMG = uploadPath('/uploads/laveries/default-laundry.jpg');

interface Props {
    laverie: Laverie;
    active: boolean;
    onClick: (l: Laverie) => void;
    showFavoriteButton?: boolean;
    isFavorite?: boolean;
    favoritePending?: boolean;
    onFavoriteToggle?: (l: Laverie) => void;
}

function formatDistance(km: number): string {
    return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`;
}

export default function LaverieCard({
    laverie: l,
    active,
    onClick,
    showFavoriteButton = false,
    isFavorite = false,
    favoritePending = false,
    onFavoriteToggle,
}: Props) {
    const navigate = useNavigate();
    const { t } = useTranslation();

    return (
        <div
            onClick={() => onClick(l)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onClick(l)}
            aria-label={`Laverie ${l.nom}`}
            className={`relative bg-white rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 flex gap-3 p-3 ${
                active ? 'ring-2 ring-[#14A8DE] shadow-md' : 'border border-slate-100 shadow-sm'
            }`}
        >
            {showFavoriteButton && onFavoriteToggle && (
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        onFavoriteToggle(l);
                    }}
                    disabled={favoritePending}
                    className={`absolute left-3 top-3 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full shadow-sm ring-1 ring-black/5 backdrop-blur-sm transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-60 ${
                        isFavorite
                            ? 'bg-rose-500 text-white hover:bg-rose-600'
                            : 'bg-white/95 text-rose-500 hover:bg-rose-50'
                    }`}
                    aria-label={isFavorite ? t('main.laverie_card.retirer_favori', { nom: l.nom }) : t('main.laverie_card.ajouter_favori', { nom: l.nom })}
                    aria-busy={favoritePending}
                    title={isFavorite ? t('main.laverie_card.retirer_favori', { nom: l.nom }) : t('main.laverie_card.ajouter_favori', { nom: l.nom })}
                >
                    {favoritePending ? (
                        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    ) : (
                        <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : 'stroke-[2.25]'}`} aria-hidden="true" />
                    )}
                </button>
            )}

            {/* Image carrée */}
            <div className="w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden bg-slate-100">
                <img
                    src={resolveUrl(l.image || FALLBACK_IMG)}
                    alt={l.nom}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    onError={(e) => { (e.currentTarget as HTMLImageElement).src = FALLBACK_IMG; }}
                />
            </div>

            {/* Badge note — coin haut droit de la card */}
            <div className="absolute top-3 right-3 flex items-center gap-0.5 bg-amber-400 rounded-full px-2 py-0.5 text-xs font-semibold text-slate-900 shadow-sm">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                </svg>
                {l.noteMoyenne > 0 ? Number(l.noteMoyenne).toFixed(1) : '—'}
            </div>

            {/* Contenu */}
            <div className="flex flex-col flex-1 min-w-0 justify-between pr-10">
                {/* Nom */}
                <div>
                    <h3 className="font-bold text-slate-900 text-sm leading-tight line-clamp-2">
                        {l.nom}
                    </h3>
                </div>

                {/* Adresse */}
                <p className="text-xs text-slate-400 truncate">{l.adresse}</p>

                {/* Badge statut + distance + lien */}
                <div className="flex items-center justify-between mt-1">
                    <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                        l.estOuvert
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-slate-100 text-slate-500'
                    }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${l.estOuvert ? 'bg-emerald-500' : 'bg-slate-400'}`} aria-hidden="true" />
                        {l.estOuvert ? t('main.laverie_card.disponible') : t('main.laverie_card.ferme')}
                    </span>

                    <div className="flex items-center gap-2">
                        {l.distance !== null && (
                            <span className="text-xs text-slate-400 font-medium">
                                {formatDistance(l.distance)}
                            </span>
                        )}
                        <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); navigate(`/laveries/${l.id}`); }}
                            aria-label={t('main.laverie_card.voir_detail', { nom: l.nom })}
                            className="text-xs font-semibold text-[#14A8DE] hover:text-[#119ac8] transition-colors"
                        >
                            →
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
