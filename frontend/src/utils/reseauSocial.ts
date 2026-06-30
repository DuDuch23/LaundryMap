import type { ReseauSocialType } from '../services/request';

export interface ReseauSocialConfig {
    type: ReseauSocialType;
    label: string;
    placeholder: string;
    domaine: string | null;
}

// Ordre d'affichage des champs dans les formulaires.
export const RESEAUX_SOCIAUX_CONFIG: ReseauSocialConfig[] = [
    { type: 'SITE_WEB',  label: 'Site web',  placeholder: 'https://www.malaverie.fr',              domaine: null },
    { type: 'FACEBOOK',  label: 'Facebook',  placeholder: 'https://facebook.com/malaverie',         domaine: 'facebook.com' },
    { type: 'INSTAGRAM', label: 'Instagram', placeholder: 'https://instagram.com/malaverie',        domaine: 'instagram.com' },
    { type: 'X',         label: 'X',         placeholder: 'https://x.com/malaverie',                domaine: 'x.com' },
    { type: 'LINKEDIN',  label: 'LinkedIn',  placeholder: 'https://linkedin.com/company/malaverie', domaine: 'linkedin.com' },
];

/**
 * Valide une URL de réseau social (miroir du validateur backend).
 * Retourne un message d'erreur, ou null si l'URL est valide.
 */
export function validerLienReseauSocial(type: ReseauSocialType, url: string): string | null {
    const valeur = url.trim();
    if (valeur === '') {
        return null;
    }

    let parsed: URL;
    try {
        parsed = new URL(valeur);
    } catch {
        return 'Le lien n\'est pas une URL valide.';
    }

    if (parsed.protocol !== 'https:') {
        return 'Le lien doit commencer par https://';
    }

    const config = RESEAUX_SOCIAUX_CONFIG.find((c) => c.type === type);
    if (!config) {
        return 'Type de réseau social inconnu.';
    }
    if (config.domaine === null) {
        return null;
    }

    const host = parsed.hostname.toLowerCase();
    if (host !== config.domaine && !host.endsWith('.' + config.domaine)) {
        return `Le lien ${config.label} doit pointer vers ${config.domaine}.`;
    }

    return null;
}
