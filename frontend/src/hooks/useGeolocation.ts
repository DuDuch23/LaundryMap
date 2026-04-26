import { useEffect, useState } from 'react';
import { PARIS_FALLBACK } from '../constants/Laverie';
import type { Position } from '../types/Laverie';

interface UseGeolocationResult {
    userPos: Position | null;
    /** Position effective = userPos ou PARIS_FALLBACK */
    centerPos: Position;
    setCenterPos: (p: Position) => void;
    geoRefused: boolean;
    geoLoading: boolean;
}

/**
 * Demande la géolocalisation navigateur une seule fois au mount.
 * - Si accordée : userPos + centerPos = position réelle
 * - Si refusée  : userPos = null, centerPos = Paris (fallback)
 */
export function useGeolocation(): UseGeolocationResult {
    const [userPos, setUserPos]       = useState<Position | null>(null);
    const [centerPos, setCenterPos]   = useState<Position>(PARIS_FALLBACK);
    const [geoRefused, setGeoRefused] = useState(false);
    const [geoLoading, setGeoLoading] = useState(true);

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(
            ({ coords }) => {
                const p: Position = { lat: coords.latitude, lng: coords.longitude };
                setUserPos(p);
                setCenterPos(p);
                setGeoLoading(false);
            },
            () => {
                setGeoRefused(true);
                setGeoLoading(false);
            },
            { enableHighAccuracy: true, timeout: 8000 }
        );
    }, []);

    return { userPos, centerPos, setCenterPos, geoRefused, geoLoading };
}