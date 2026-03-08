<?php

namespace App\Entity;

use App\Repository\AdministrateurRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: AdministrateurRepository::class)]
#[ORM\Table(name: 'administrateur')]
class Administrateur
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: 'integer')]
    private ?int $id = null;

    #[ORM\Column(type: 'string', length: 255)]
    private string $email;

    #[ORM\Column(name: 'mot_de_passe', type: 'string', length: 255)]
    private string $motDePasse;

    #[ORM\OneToMany(mappedBy: 'administrateur', targetEntity: UtilisateurHistoriqueInteraction::class)]
    private Collection $utilisateurHistoriques;

    #[ORM\OneToMany(mappedBy: 'administrateur', targetEntity: ProfessionnelHistoriqueInteraction::class)]
    private Collection $professionnelHistoriques;

    #[ORM\OneToMany(mappedBy: 'administrateur', targetEntity: LaverieHistoriqueInteraction::class)]
    private Collection $laverieHistoriques;

    public function __construct()
    {
        $this->utilisateurHistoriques = new ArrayCollection();
        $this->professionnelHistoriques = new ArrayCollection();
        $this->laverieHistoriques = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getEmail(): string
    {
        return $this->email;
    }

    public function setEmail(string $email): static
    {
        $this->email = $email;
        return $this;
    }

    public function getMotDePasse(): string
    {
        return $this->motDePasse;
    }

    public function setMotDePasse(string $motDePasse): static
    {
        $this->motDePasse = $motDePasse;
        return $this;
    }

    public function getUtilisateurHistoriques(): Collection
    {
        return $this->utilisateurHistoriques;
    }
    
    public function setUtilisateurHistoriques(Collection $utilisateurHistoriques): static
    {
        $this->utilisateurHistoriques = $utilisateurHistoriques;
        return $this;
    }

    public function getProfessionnelHistoriques(): Collection
    {
        return $this->professionnelHistoriques;
    }

    public function setProfessionnelHistoriques(Collection $professionnelHistoriques): static
    {
        $this->professionnelHistoriques = $professionnelHistoriques;
        return $this;
    }

    public function getLaverieHistoriques(): Collection
    {
        return $this->laverieHistoriques;
    }

    public function setLaverieHistoriques(Collection $laverieHistoriques): static
    {
        $this->laverieHistoriques = $laverieHistoriques;
        return $this;
    }
}
