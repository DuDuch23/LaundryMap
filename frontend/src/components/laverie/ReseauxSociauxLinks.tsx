import { Globe } from 'lucide-react';
import type { ReseauSocial, ReseauSocialType } from '../../services/request';

interface ReseauxSociauxLinksProps {
    reseaux: ReseauSocial[] | undefined | null;
    /** Taille des icônes (px). Défaut 20. */
    size?: number;
}

// Couleur de marque au survol pour chaque réseau.
const COLOR_MAP: Record<ReseauSocialType, string> = {
    SITE_WEB: 'hover:bg-slate-700 hover:border-slate-700',
    FACEBOOK: 'hover:bg-[#1877F2] hover:border-[#1877F2]',
    INSTAGRAM: 'hover:bg-[#E4405F] hover:border-[#E4405F]',
    X: 'hover:bg-black hover:border-black',
    LINKEDIN: 'hover:bg-[#0A66C2] hover:border-[#0A66C2]',
};

// lucide-react ne fournit pas (plus) les icônes de marque : on utilise des SVG dédiés.
function BrandIcon({ type, size = 20 }: { type: ReseauSocialType; size?: number }) {
    const common = {
        width: size,
        height: size,
        viewBox: '0 0 24 24',
        fill: 'currentColor' as const,
        'aria-hidden': true,
    };

    switch (type) {
        case 'FACEBOOK':
            return (
                <svg {...common}>
                    <path d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07c0 6.02 4.39 11.01 10.13 11.93v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.7 4.53-4.7 1.31 0 2.69.24 2.69.24v2.97h-1.52c-1.49 0-1.96.93-1.96 1.89v2.26h3.33l-.53 3.49h-2.8V24C19.61 23.08 24 18.09 24 12.07z" />
                </svg>
            );
        case 'INSTAGRAM':
            return (
                <svg {...common}>
                    <path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41-.56-.22-.96-.48-1.38-.9-.42-.42-.68-.82-.9-1.38-.16-.42-.36-1.06-.41-2.23-.06-1.27-.07-1.65-.07-4.85s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.42 2.17 8.8 2.16 12 2.16zM12 0C8.74 0 8.33.01 7.05.07 5.78.13 4.9.33 4.14.63c-.79.31-1.46.72-2.13 1.38C1.35 2.68.94 3.35.63 4.14.33 4.9.13 5.78.07 7.05.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.06 1.27.26 2.15.56 2.91.31.79.72 1.46 1.38 2.13.67.66 1.34 1.07 2.13 1.38.76.3 1.64.5 2.91.56C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c1.27-.06 2.15-.26 2.91-.56.79-.31 1.46-.72 2.13-1.38.66-.67 1.07-1.34 1.38-2.13.3-.76.5-1.64.56-2.91.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.06-1.27-.26-2.15-.56-2.91-.31-.79-.72-1.46-1.38-2.13C21.32 1.35 20.65.94 19.86.63 19.1.33 18.22.13 16.95.07 15.67.01 15.26 0 12 0zm0 5.84A6.16 6.16 0 1 0 18.16 12 6.16 6.16 0 0 0 12 5.84zM12 16a4 4 0 1 1 4-4 4 4 0 0 1-4 4zm6.41-10.85a1.44 1.44 0 1 0 1.44 1.44 1.44 1.44 0 0 0-1.44-1.44z" />
                </svg>
            );
        case 'X':
            return (
                <svg {...common}>
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
            );
        case 'LINKEDIN':
            return (
                <svg {...common}>
                    <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.07 2.07 0 1 1 0-4.14 2.07 2.07 0 0 1 0 4.14zm1.78 13.02H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z" />
                </svg>
            );
        case 'SITE_WEB':
        default:
            return <Globe size={size} aria-hidden="true" />;
    }
}

export default function ReseauxSociauxLinks({ reseaux, size = 20 }: ReseauxSociauxLinksProps) {
    // Si aucun lien : on n'affiche rien du tout (pas de section vide).
    if (!reseaux || reseaux.length === 0) {
        return null;
    }

    return (
        <div className="flex flex-wrap items-center gap-2">
            {reseaux.map((reseau) => {
                const colorClasses = COLOR_MAP[reseau.type] ?? 'hover:bg-slate-700 hover:border-slate-700';

                return (
                    <a
                        key={reseau.id}
                        href={reseau.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={reseau.libelle}
                        title={reseau.libelle}
                        className={`inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition-colors hover:text-white ${colorClasses}`}
                    >
                        <BrandIcon type={reseau.type} size={size} />
                    </a>
                );
            })}
        </div>
    );
}
