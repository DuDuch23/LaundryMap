import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import type { Position } from '../../types/Laverie';

interface Props {
    pos: Position;
    zoom?: number;
}

/** Recentre la carte en douceur à chaque changement de position. */
export default function RecenterMap({ pos, zoom }: Props) {
    const map = useMap();

    useEffect(() => {
        map.flyTo([pos.lat, pos.lng], zoom ?? map.getZoom(), { duration: 0.4 });
    }, [pos.lat, pos.lng, zoom, map]);

    return null;
}
