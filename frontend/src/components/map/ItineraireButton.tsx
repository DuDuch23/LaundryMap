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

    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;
    const wazeUrl = `https://waze.com/ul?ll=${lat},${lng}&navigate=yes`;

    return (
        <div className="mt-2 w-full">
            <DropdownMenu>
                <DropdownMenuTrigger
                    className="w-full inline-flex items-center justify-center gap-1.5 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold rounded-xl border border-slate-200 shadow-sm transition-colors cursor-pointer leading-none outline-none h-[34px]"
                    aria-label={t('main.laverie_map.itineraire')}
                >
                    <Navigation size={14} className="text-[#14A8DE] flex-shrink-0" aria-hidden="true" />
                    <span>{t('main.laverie_map.itineraire')}</span>
                </DropdownMenuTrigger>
                
                <DropdownMenuContent align="start" className="min-w-[160px]">
                    {/* asChild permet de transformer l'Item en balise <a> */}
                    <DropdownMenuItem asChild>
                        <a 
                            href={wazeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 px-3 py-2.5 cursor-pointer w-full"
                        >
                            <WazeLogo className="w-5 h-5 flex-shrink-0" />
                            Waze
                        </a>
                    </DropdownMenuItem>
                    
                    <DropdownMenuSeparator />
                    
                    <DropdownMenuItem asChild>
                        <a 
                            href={googleMapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 px-3 py-2.5 cursor-pointer w-full"
                        >
                            <Map size={18} className="text-[#EA4335] flex-shrink-0" aria-hidden="true" />
                            Google Maps
                        </a>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}