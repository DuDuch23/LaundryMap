<?php

namespace App\Service;

use App\Enum\TypeReseauSocialEnum;

/**
 * Validation des liens réseaux sociaux d'une laverie.
 */
class ReseauSocialValidator
{
    private const DOMAINES = [
        TypeReseauSocialEnum::FACEBOOK->value => 'facebook.com',
        TypeReseauSocialEnum::INSTAGRAM->value => 'instagram.com',
        TypeReseauSocialEnum::X->value => 'x.com',
        TypeReseauSocialEnum::LINKEDIN->value => 'linkedin.com',
    ];

    /**
     * Valide une URL pour un type donné.
     *
     * @return string|null Le message d'erreur si invalide, null si valide.
     */
    public function validate(TypeReseauSocialEnum $type, string $url): ?string
    {
        $url = trim($url);

        if ($url === '') {
            return 'Le lien est vide.';
        }

        if (filter_var($url, FILTER_VALIDATE_URL) === false) {
            return 'Le lien n\'est pas une URL valide.';
        }

        $parts = parse_url($url);
        if (!is_array($parts) || !isset($parts['scheme'], $parts['host'])) {
            return 'Le lien n\'est pas une URL valide.';
        }

        if (strtolower($parts['scheme']) !== 'https') {
            return 'Le lien doit utiliser le protocole HTTPS.';
        }

        $host = strtolower($parts['host']);

        // Site web : aucun domaine imposé, l'URL HTTPS valide suffit.
        if ($type === TypeReseauSocialEnum::SITE_WEB) {
            return null;
        }

        $domaineAttendu = self::DOMAINES[$type->value] ?? null;
        if ($domaineAttendu === null) {
            return 'Type de réseau social inconnu.';
        }

        // Accepte le domaine exact et ses sous-domaines (ex : www.facebook.com, fr.linkedin.com),
        // mais refuse les domaines pièges (ex : evilfacebook.com).
        if ($host !== $domaineAttendu && !str_ends_with($host, '.' . $domaineAttendu)) {
            return sprintf('Le lien %s doit pointer vers %s.', $type->value, $domaineAttendu);
        }

        return null;
    }

    public function isValid(TypeReseauSocialEnum $type, string $url): bool
    {
        return $this->validate($type, $url) === null;
    }
}
