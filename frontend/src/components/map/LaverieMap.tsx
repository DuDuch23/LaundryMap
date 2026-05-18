import { useCallback, useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { Circle, MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import type { Laverie, Position } from '../../types/Laverie';
import RecenterMap from './RecenterMap';
import ItineraireButton from './ItineraireButton';

// ─── Icônes ───────────────────────────────────────────────────────────────────

function pinIcon(couleur: string, active: boolean) {
    const size = active ? 44 : 36;
    return L.divIcon({
        className: '',
        html: `<div style="
            width:${size}px;height:${size}px;
            background:${couleur};
            border-radius:50% 50% 50% 0;
            transform:rotate(-45deg);
            border:3px solid white;
            box-shadow:0 3px 12px rgba(0,0,0,.35);
            transition:all .2s;
        "><div style="
            width:10px;height:10px;background:white;border-radius:50%;
            position:absolute;top:50%;left:50%;
            transform:translate(-50%,-50%) rotate(45deg);
        "></div></div>`,
        iconSize: [size, size],
        iconAnchor: [size / 2, size],
        popupAnchor: [0, -size - 4],
    });
}

const userIcon = L.divIcon({
    className: '',
    html: `<div style="
        width:16px;height:16px;
        background:#14A8DE;border-radius:50%;
        border:3px solid white;
        box-shadow:0 0 0 4px rgba(20,168,222,.25);
    "></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
});

// ─── Contrôleur d'interaction ─────────────────────────────────────────────────

function MapInteractionController({ onSingleTouch }: { onSingleTouch: () => void }) {
    const map = useMap();

    useEffect(() => {
        const container = map.getContainer();
        const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

        // Toujours actif : Shift+molette ou pincement trackpad (ctrlKey+wheel)
        // Doit être en dehors du if/else car certains PC Windows rapportent maxTouchPoints > 0
        // même sans écran tactile (drivers, moniteurs hybrides), ce qui faisait entrer dans
        // la branche touch et ne jamais attacher ce handler.
        const onWheel = (e: WheelEvent) => {
            if (!e.shiftKey && !e.ctrlKey) return;
            e.preventDefault();
            map.setZoom(map.getZoom() + (e.deltaY < 0 ? 1 : -1));
        };
        container.addEventListener('wheel', onWheel, { passive: false });

        if (isTouch) {
            container.style.touchAction = 'pan-y';
            map.dragging.disable();

            const onTouchStart = (e: TouchEvent) => {
                if (e.touches.length >= 2) {
                    e.preventDefault();
                    map.dragging.enable();
                } else {
                    onSingleTouch();
                }
            };

            const onTouchEnd = (e: TouchEvent) => {
                if (e.touches.length < 2) map.dragging.disable();
            };

            // Sur les appareils hybrides (PC tactile), map.dragging.disable() bloque aussi
            // le drag souris. On le réactive dès qu'un vrai clic souris est détecté.
            const onMouseDown = () => {
                if (!map.dragging.enabled()) map.dragging.enable();
            };

            container.addEventListener('touchstart', onTouchStart, { passive: false, capture: true });
            container.addEventListener('touchend', onTouchEnd, { passive: true });
            container.addEventListener('touchcancel', onTouchEnd, { passive: true });
            container.addEventListener('mousedown', onMouseDown, { capture: true });

            return () => {
                container.removeEventListener('wheel', onWheel);
                container.removeEventListener('touchstart', onTouchStart, true);
                container.removeEventListener('touchend', onTouchEnd);
                container.removeEventListener('touchcancel', onTouchEnd);
                container.removeEventListener('mousedown', onMouseDown, true);
                container.style.touchAction = '';
                map.dragging.enable();
            };
        }

        return () => container.removeEventListener('wheel', onWheel);
    }, [map, onSingleTouch]);

    return null;
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
    centerPos: Position;
    zoom: number;
    userPos: Position | null;
    laveries: Laverie[];
    activeLaverieId: number | null;
    onMarkerClick: (l: Laverie) => void;
    showGeoCta?: boolean;
    geoLoading?: boolean;
    onGeoClick?: () => void;
}

// ─── Composant ────────────────────────────────────────────────────────────────

export default function LaverieMap({
    centerPos, zoom, userPos, laveries, activeLaverieId, onMarkerClick,
    showGeoCta = false, geoLoading = false, onGeoClick,
}: Props) {
    const { t } = useTranslation();
    const [touchHint, setTouchHint] = useState(false);
    const hintTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const handleSingleTouch = useCallback(() => {
        setTouchHint(true);
        if (hintTimer.current) clearTimeout(hintTimer.current);
        hintTimer.current = setTimeout(() => setTouchHint(false), 2000);
    }, []);

    useEffect(() => () => {
        if (hintTimer.current) clearTimeout(hintTimer.current);
    }, []);

    const laveriesAvecCoords = laveries.filter((l) => l.latitude && l.longitude);

    return (
        <div
            className="mt-5 relative w-full h-[260px] md:h-[380px] lg:h-[800px] max-h-[65vh]"
            role="region"
            aria-label={t('main.laverie_map.aria_label')}
        >
            <MapContainer
                center={[centerPos.lat, centerPos.lng]}
                zoom={zoom}
                className="h-full w-full z-0"
                zoomControl={false}
                scrollWheelZoom={false}
            >
                <MapInteractionController onSingleTouch={handleSingleTouch} />
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <RecenterMap pos={centerPos} zoom={zoom} />

                {/* Position utilisateur */}
                {userPos && (
                    <>
                        <Marker position={[userPos.lat, userPos.lng]} icon={userIcon}>
                            <Popup>{t('main.laverie_map.vous_etes_ici')}</Popup>
                        </Marker>
                        <Circle
                            center={[userPos.lat, userPos.lng]}
                            radius={500}
                            pathOptions={{ color: '#14A8DE', fillColor: '#14A8DE', fillOpacity: 0.08, weight: 1.5 }}
                        />
                    </>
                )}

                {/* Marqueurs laveries */}
                {laveriesAvecCoords.map((l) => (
                    <Marker
                        key={l.id}
                        position={[l.latitude!, l.longitude!]}
                        icon={pinIcon(
                            l.estOuvert ? '#10b981' : '#ef4444',
                            activeLaverieId === l.id,
                        )}
                        eventHandlers={{ click: () => onMarkerClick(l) }}
                    >
                        <Popup>
                            <p className="font-bold text-slate-900 text-lg leading-tight line-clamp-2">{l.nom}</p>
                            <p className="text-md text-slate-400 truncate">{l.adresse}</p>
                            <p className={`text-sm font-medium mt-1 ${l.estOuvert ? 'text-emerald-600' : 'text-rose-500'}`}>
                                {l.estOuvert ? t('main.laverie_map.ouvert') : t('main.laverie_map.ferme')}
                            </p>
                            {l.horairesAujourdhui && l.horairesAujourdhui.length > 0 && (
                                <p className="text-xs text-slate-400 mt-0.5">
                                    {l.horairesAujourdhui.join(' · ')}
                                </p>
                            )}
                            {l.latitude !== null && l.longitude !== null && (
                                <ItineraireButton lat={l.latitude} lng={l.longitude} nom={l.nom} />
                            )}
                            <Link
                                to={`/laveries/${l.id}`}
                                aria-label={t('main.laverie_card.voir_detail', { nom: l.nom })}
                                className="block mt-3 text-xs font-semibold text-[#14A8DE] hover:text-[#119ac8] transition-colors"
                            >
                                Voir la fiche
                            </Link>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>

            {/* Hint tactile : 2 doigts pour déplacer (mobile/tablette) */}
            {touchHint && (
                <div className="absolute inset-0 z-[450] flex items-center justify-center pointer-events-none">
                    <div className="bg-black/60 text-white text-sm font-medium rounded-xl px-4 py-2.5 backdrop-blur-sm shadow-lg">
                        {t('main.laverie_map.deux_doigts')}
                    </div>
                </div>
            )}

            {/* Bouton CTA géolocalisation — superposé sur la carte */}
            {showGeoCta && (
                <button
                    type="button"
                    onClick={onGeoClick}
                    disabled={geoLoading}
                    aria-busy={geoLoading}
                    className="absolute bottom-7 right-3 z-[400] flex items-center gap-3 px-4 py-3 rounded-full bg-[#14A8DE] shadow-lg hover:bg-[#119ac8] active:scale-[.99] transition-all group disabled:opacity-60 disabled:cursor-wait"
                >
                    <span className="shrink-0 w-9 h-9 rounded-full bg-white/10 flex items-center justify-center  transition-colors" aria-hidden="true">
                        {geoLoading ? (
                            <div className="w-4 h-4 border-2 border-[#14A8DE] border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
                                <path d="M7.425 13.5L5.2875 8.2125L0 6.075V5.025L13.5 0L8.475 13.5H7.425ZM7.9125 10.725L10.95 2.55L2.775 5.5875L6.45 7.05L7.9125 10.725Z" fill="white" className="group-hover:fill-white" />
                            </svg>
                        )}
                    </span>
                    <span className="text-sm font-semibold text-white transition-colors">
                        {geoLoading ? t('main.home.geo_chargement') : t('main.home.utiliser_position')}
                    </span>
                </button>
            )}

            {/* Badge position détectée */}
            {userPos && (
                <div
                    className="absolute bottom-3 left-3 z-[400] flex items-center gap-1.5 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm border border-white/60"
                    aria-live="polite"
                >
                    <span className="w-2 h-2 rounded-full bg-[#14A8DE] animate-pulse" aria-hidden="true" />
                    {t('main.laverie_map.position_detectee')}
                </div>
            )}
        </div>
    );
}
