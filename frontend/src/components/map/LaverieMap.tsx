import L from 'leaflet';
import { useTranslation } from 'react-i18next';
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

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
    centerPos: Position;
    zoom: number;
    userPos: Position | null;
    laveries: Laverie[];
    activeLaverieId: number | null;
    onMarkerClick: (l: Laverie) => void;
}

// ─── Composant ────────────────────────────────────────────────────────────────

export default function LaverieMap({
    centerPos, zoom, userPos, laveries, activeLaverieId, onMarkerClick,
}: Props) {
    const { t } = useTranslation();
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
            >
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
                            <p className="text-sm font-semibold">{l.nom}</p>
                            <p className="text-xs text-slate-500 mt-0.5">{l.adresse}</p>
                            <p className={`text-xs font-medium mt-1 ${l.estOuvert ? 'text-emerald-600' : 'text-rose-500'}`}>
                                {l.estOuvert ? t('main.laverie_map.ouvert') : t('main.laverie_map.ferme')}
                            </p>
                            {l.latitude !== null && l.longitude !== null && (
                                <ItineraireButton
                                    lat={l.latitude}
                                    lng={l.longitude}
                                    nom={l.nom}
                                />
                            )}
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>

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
