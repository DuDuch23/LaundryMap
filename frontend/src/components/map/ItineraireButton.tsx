import { useTranslation } from 'react-i18next';
import { Navigation, Map } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Props {
    lat: number;
    lng: number;
    nom?: string;
}

function WazeLogo({ className }: { className?: string }) {
    return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
            <circle cx="12" cy="12" r="10" fill="#33CCFF" />
            <circle cx="9" cy="11" r="1.2" fill="#fff" />
            <circle cx="15" cy="11" r="1.2" fill="#fff" />
            <path d="M8.5 14.5c.8 1.2 2.1 2 3.5 2s2.7-.8 3.5-2" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" fill="none" />
        </svg>
    );
}

export default function ItineraireButton({ lat, lng }: Props) {
    const { t } = useTranslation();

    const ouvrirGoogleMaps = () => {
        window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`, '_blank', 'noopener,noreferrer');
    };

    const ouvrirWaze = () => {
        window.open(`https://waze.com/ul?ll=${lat}%2C${lng}&navigate=yes`, '_blank', 'noopener,noreferrer');
    };

    return (
        <div className="mt-2 w-full">
            <DropdownMenu>
                <DropdownMenuTrigger
                    className="w-full inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-800 text-xs font-semibold rounded-lg border border-slate-200 py-2 shadow-sm transition-colors cursor-pointer leading-none outline-none"
                    aria-label={t('main.laverie_map.itineraire')}
                >
                    <Navigation size={14} className="text-[#14A8DE] flex-shrink-0" aria-hidden="true" />
                    <span>{t('main.laverie_map.itineraire')}</span>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="min-w-[160px]">
                    <DropdownMenuItem className="gap-3 px-3 py-2.5 cursor-pointer" onSelect={ouvrirWaze}>
                        <WazeLogo className="w-5 h-5 flex-shrink-0" />
                        Waze
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="gap-3 px-3 py-2.5 cursor-pointer" onSelect={ouvrirGoogleMaps}>
                        <Map size={18} className="text-[#EA4335] flex-shrink-0" aria-hidden="true" />
                        Google Maps
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
