import { useState, useEffect } from 'react';
import { PARIS_FALLBACK } from '../constants/Laverie';
import type { Position } from '../types/Laverie';

interface UseGeolocationResult {
    userPos: Position | null;
    /** Position effective = userPos ou PARIS_FALLBACK */
    centerPos: Position;
    setCenterPos: (p: Position) => void;
    geoRefused: boolean;
    geoLoading: boolean;
    /** À appeler uniquement sur une action explicite de l'utilisateur. */
    requestGeolocation: () => void;
}

export function useGeolocation(): UseGeolocationResult {
    const [userPos, setUserPos]       = useState<Position | null>(null);
    const [centerPos, setCenterPos]   = useState<Position>(PARIS_FALLBACK);
    const [geoRefused, setGeoRefused] = useState(false);
    const [geoLoading, setGeoLoading] = useState(false);

    // Load saved position from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem('user_geolocation');
        if (saved) {
            try {
                const pos: Position = JSON.parse(saved);
                setUserPos(pos);
                setCenterPos(pos);
            } catch {
                localStorage.removeItem('user_geolocation');
            }
        }
    }, []);

    const requestGeolocation = () => {
        if (!navigator.geolocation || geoLoading || userPos) return;
        setGeoLoading(true);
        navigator.geolocation.getCurrentPosition(
            ({ coords }) => {
                const p: Position = { lat: coords.latitude, lng: coords.longitude };
                setUserPos(p);
                setCenterPos(p);
                // Save to localStorage
                localStorage.setItem('user_geolocation', JSON.stringify(p));
                setGeoLoading(false);
            },
            () => {
                setGeoRefused(true);
                setGeoLoading(false);
            },
            { enableHighAccuracy: true, timeout: 8000 }
        );
    };

    return { userPos, centerPos, setCenterPos, geoRefused, geoLoading, requestGeolocation };
}
