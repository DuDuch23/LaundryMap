import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigation, Map } from 'lucide-react';

interface Props {
    /** Latitude de la destination */
    lat: number;
    /** Longitude de la destination */
    lng: number;
    /** Nom de l'établissement (optionnel) */
    nom?: string;
}

// ─── Logos inline (couleurs de marque) ────────────────────────────────────────

function WazeLogo({ className }: { className?: string }) {
    return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
            <circle cx="12" cy="12" r="10" fill="#33CCFF" />
            <circle cx="9" cy="11" r="1.2" fill="#fff" />
            <circle cx="15" cy="11" r="1.2" fill="#fff" />
            <path
                d="M8.5 14.5c.8 1.2 2.1 2 3.5 2s2.7-.8 3.5-2"
                stroke="#fff"
                strokeWidth="1.4"
                strokeLinecap="round"
                fill="none"
            />
        </svg>
    );
}

// ─── Composant principal ──────────────────────────────────────────────────────

export default function ItineraireButton({ lat, lng }: Props) {
    const { t } = useTranslation();
    const [menuOuvert, setMenuOuvert] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Ferme le menu si on clique en dehors
    useEffect(() => {
        if (!menuOuvert) return;
        const handler = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setMenuOuvert(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [menuOuvert]);

    const ouvrirGoogleMaps = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;
        window.open(url, '_blank', 'noopener,noreferrer');
        setMenuOuvert(false);
    };

    const ouvrirWaze = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const url = `https://waze.com/ul?ll=${lat}%2C${lng}&navigate=yes`;
        window.open(url, '_blank', 'noopener,noreferrer');
        setMenuOuvert(false);
    };

    return (
        <div ref={containerRef} className="relative mt-2 w-full">
            <button
                type="button"
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setMenuOuvert((v) => !v);
                }}
                className="w-full inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-800 text-xs font-semibold rounded-lg border border-slate-200 py-2 shadow-sm transition-colors cursor-pointer leading-none"
                style={{ margin: 0 }}
                aria-haspopup="menu"
                aria-expanded={menuOuvert}
                aria-label={t('main.laverie_map.itineraire')}
            >
                <Navigation
                    size={14}
                    className="text-[#14A8DE] flex-shrink-0"
                    aria-hidden="true"
                />
                <span>{t('main.laverie_map.itineraire')}</span>
            </button>

            {menuOuvert && (
                <div
                    role="menu"
                    aria-label={t('main.laverie_map.itineraire')}
                    className="absolute left-0 right-0 top-full mt-1 z-[1000] bg-white rounded-lg border border-slate-200 shadow-lg overflow-hidden"
                >
                    <button
                        type="button"
                        role="menuitem"
                        onClick={ouvrirWaze}
                        className="w-full inline-flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-800 hover:bg-slate-50 transition-colors cursor-pointer text-left"
                    >
                        <WazeLogo className="w-4 h-4 flex-shrink-0" />
                        Waze
                    </button>
                    <div className="h-px bg-slate-100" aria-hidden="true" />
                    <button
                        type="button"
                        role="menuitem"
                        onClick={ouvrirGoogleMaps}
                        className="w-full inline-flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-800 hover:bg-slate-50 transition-colors cursor-pointer text-left"
                    >
                        <Map size={14} className="text-[#EA4335] flex-shrink-0" aria-hidden="true" />
                        Google Maps
                    </button>
                </div>
            )}
        </div>
    );
}
