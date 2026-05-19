import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Maximize2, Minimize2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
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

function FullscreenSyncController() {
    const map = useMap();
    useEffect(() => {
        const onFullscreenChange = () => {
            setTimeout(() => map.invalidateSize(), 100);
        };
        document.addEventListener('fullscreenchange', onFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
    }, [map]);
    return null;
}

// ─── Contrôleur d'interaction ─────────────────────────────────────────────────

function MapInteractionController({ isFullscreen }: { isFullscreen: boolean }) {
    const map = useMap();

    useEffect(() => {
        const container = map.getContainer();
        const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

        // Shift+molette / pincement trackpad — toujours actif
        const onWheel = (e: WheelEvent) => {
            if (!e.shiftKey && !e.ctrlKey) return;
            e.preventDefault();
            map.setZoom(map.getZoom() + (e.deltaY < 0 ? 1 : -1));
        };
        container.addEventListener('wheel', onWheel, { passive: false });

        if (isTouch) {
            if (isFullscreen) {
                // Plein écran : 1 doigt = déplacer carte, 2 doigts = pinch zoom (Leaflet natif)
                container.style.touchAction = 'none';
                map.dragging.enable();

                return () => {
                    container.removeEventListener('wheel', onWheel);
                    container.style.touchAction = '';
                };
            }

            // Normal : 1 doigt = scroll page, 2 doigts = déplacer carte
            container.style.touchAction = 'pan-y';
            map.dragging.disable();

            const onTouchStart = (e: TouchEvent) => {
                if (e.touches.length >= 2) {
                    e.preventDefault();
                    map.dragging.enable();
                }
            };
            const onTouchEnd = (e: TouchEvent) => {
                if (e.touches.length < 2) map.dragging.disable();
            };
            // Appareils hybrides : réactiver le drag pour la souris
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
    }, [map, isFullscreen]);

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
    searchRadius?: number;
    searched?: boolean;
    filterSlot?: React.ReactNode;
}

// ─── Composant ────────────────────────────────────────────────────────────────

export default function LaverieMap({
    centerPos, zoom, userPos, laveries, activeLaverieId, onMarkerClick,
    searchRadius = 10, searched = false, filterSlot,
}: Props) {
    const { t } = useTranslation();
    const containerRef = useRef<HTMLDivElement>(null);
    const [isFullscreen, setIsFullscreen] = useState(false);
    useEffect(() => {
        const onChange = () => setIsFullscreen(!!document.fullscreenElement);
        document.addEventListener('fullscreenchange', onChange);
        return () => document.removeEventListener('fullscreenchange', onChange);
    }, []);

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            containerRef.current?.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    };

    const laveriesAvecCoords = laveries.filter((l) => l.latitude && l.longitude);

    return (
        <div
            ref={containerRef}
            className="mt-5 relative w-full h-[500px] md:h-[500px] lg:h-[800px] max-h-[80vh]"
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
                <MapInteractionController isFullscreen={isFullscreen} />
                <FullscreenSyncController />
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <RecenterMap pos={centerPos} zoom={zoom} />

                {/* Position utilisateur */}
                {userPos && (
                    <Marker position={[userPos.lat, userPos.lng]} icon={userIcon}>
                        <Popup>{t('main.laverie_map.vous_etes_ici')}</Popup>
                    </Marker>
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
                        <Popup autoPan={false}>
                            <p className="font-bold text-slate-900 text-base leading-tight line-clamp-2">{l.nom}</p>
                            <p className="text-xs text-slate-400 truncate mt-0.5">{l.adresse}</p>

                            <div className="mt-2 flex items-center gap-1.5">
                                <span className={`text-xs font-semibold ${l.estOuvert ? 'text-emerald-600' : 'text-rose-500'}`}>
                                    {l.estOuvert ? t('main.laverie_map.ouvert') : t('main.laverie_map.ferme')}
                                </span>
                            </div>

                            <div className="mt-1.5">
                                {l.horairesAujourdhui && l.horairesAujourdhui.length > 0 ? (
                                    <div className="flex flex-col gap-0.5">
                                        {l.horairesAujourdhui.map((h, i) => (
                                            <span
                                                key={i}
                                                className="inline-flex items-center gap-1 text-xs text-slate-600 font-medium bg-slate-100 rounded px-2 py-0.5 w-fit"
                                            >
                                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                                                    <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
                                                </svg>
                                                {h}
                                            </span>
                                        ))}
                                    </div>
                                ) : (
                                    <span className="text-xs text-slate-400 italic">{t('main.laverie_map.ferme_aujourd_hui')}</span>
                                )}
                            </div>

                            {l.latitude !== null && l.longitude !== null && (
                                <ItineraireButton lat={l.latitude} lng={l.longitude} nom={l.nom} />
                            )}
                            <Link
                                to={`/laveries/${l.id}`}
                                aria-label={t('main.laverie_card.voir_detail', { nom: l.nom })}
                                className="mt-3 flex items-center justify-center gap-1 w-auto px-3 py-2 rounded-lg bg-[#14A8DE] text-white text-sm font-semibold hover:bg-[#119ac8] transition-colors"
                            >
                                {t('main.laverie_card.voir_fiche')}
                            </Link>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>

            {/* Filtres en overlay (visible uniquement en plein écran) */}
            {isFullscreen && filterSlot && (
                <div className="absolute top-3 left-3 z-[400] w-72 max-h-[calc(100vh-4rem)] overflow-y-auto">
                    {filterSlot}
                </div>
            )}

            {/* Bouton plein écran */}
            <button
                type="button"
                onClick={toggleFullscreen}
                aria-label={isFullscreen ? 'Quitter le plein écran' : 'Plein écran'}
                className="absolute top-3 right-3 z-[400] flex items-center justify-center w-9 h-9 rounded-lg bg-white/90 backdrop-blur-sm shadow-md border border-white/60 text-slate-700 hover:bg-white hover:text-slate-900 transition-all"
            >
                {isFullscreen
                    ? <Minimize2 size={16} aria-hidden="true" />
                    : <Maximize2 size={16} aria-hidden="true" />
                }
            </button>

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
