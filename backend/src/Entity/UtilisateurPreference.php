<?php

namespace App\Entity;

use App\Repository\UtilisateurPreferenceRepository;
use Doctrine\ORM\Mapping as ORM;
use App\Enum\ThemePreferenceEnum;

#[ORM\Entity(repositoryClass: UtilisateurPreferenceRepository::class)]
#[ORM\Table(name: 'utilisateur_preference')]
class UtilisateurPreference
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: 'integer')]
    private ?int $id = null;

    #[ORM\OneToOne(targetEntity: Utilisateur::class, inversedBy: 'preference')]
    #[ORM\JoinColumn(name: 'utilisateur_id', referencedColumnName: 'id', nullable: false)]
    private Utilisateur $utilisateur;

    #[ORM\ManyToOne(targetEntity: Langue::class)]
    #[ORM\JoinColumn(name: 'langue_id', referencedColumnName: 'id', nullable: false)]
    private Langue $langue;

    #[ORM\Column(enumType: ThemePreferenceEnum::class)]
    private ThemePreferenceEnum $theme = ThemePreferenceEnum::THEME_CLAIR->value;

    #[ORM\Column(type: 'boolean')]
    private bool $notifications;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getUtilisateur(): Utilisateur
    {
        return $this->utilisateur;
    }

    public function setUtilisateur(Utilisateur $utilisateur): static
    {
        $this->utilisateur = $utilisateur;
        return $this;
    }

    public function getLangue(): Langue
    {
        return $this->langue;
    }

    public function setLangue(Langue $langue): static
    {
        $this->langue = $langue;
        return $this;
    }

    public function getTheme(): ThemePreferenceEnum
    {
        return $this->theme;
    }

    public function setTheme(ThemePreferenceEnum $theme): static
    {
        $this->theme = $theme;
        return $this;
    }

    public function isNotifications(): bool
    {
        return $this->notifications;
    }

    public function setNotifications(bool $notifications): static
    {
        $this->notifications = $notifications;
        return $this;
    }
}
