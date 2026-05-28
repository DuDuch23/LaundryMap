<?php

namespace App\Service;

use App\Repository\MotInjurieuxRepository;

/**
 * Détection automatique de contenus offensants.
 * Compare le texte soumis contre la liste noire (MotInjurieux),
 * en normalisant les deux termes (minuscules, sans accents, sans ponctuation).
 */
class FiltreContenusService
{
    public function __construct(
        private readonly MotInjurieuxRepository $motInjurieuxRepository,
    ) {}

    /**
     * Retourne true si le texte contient un mot de la liste noire.
     */
    public function contientContenuOffensant(string $texte): bool
    {
        $mots = $this->motInjurieuxRepository->findAll();
        if (empty($mots)) {
            return false;
        }

        $textNormalise = $this->normaliser($texte);

        foreach ($mots as $mot) {
            $motNormalise = $this->normaliser($mot->getLabel());
            if ($motNormalise !== '' && str_contains($textNormalise, $motNormalise)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Normalise une chaîne : minuscules, sans accents, sans ponctuation, espaces simples.
     */
    private function normaliser(string $texte): string
    {
        $texte = mb_strtolower($texte, 'UTF-8');
        // Translittération ASCII (é→e, ü→u, ñ→n, etc.)
        $texte = iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $texte) ?: $texte;
        // Remplacer tout ce qui n'est pas alphanumérique par un espace
        $texte = preg_replace('/[^a-z0-9]/', ' ', $texte) ?: '';
        // Normaliser les espaces multiples
        return trim((string) preg_replace('/\s+/', ' ', $texte));
    }
}
