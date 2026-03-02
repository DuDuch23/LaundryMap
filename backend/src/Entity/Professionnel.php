<?php

namespace App\Entity;

use App\Repository\ProfessionnelRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use App\Enum\StatutProfessionnelEnum;

#[ORM\Entity(repositoryClass: ProfessionnelRepository::class)]
#[ORM\Table(name: 'professionnel')]
class Professionnel
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: 'integer')]
    private ?int $id = null;

    #[ORM\OneToOne(targetEntity: Utilisateur::class, inversedBy: 'professionnel')]
    #[ORM\JoinColumn(name: 'utilisateur_id', referencedColumnName: 'id', nullable: false)]
    private Utilisateur $utilisateur;

    #[ORM\Column(type: 'integer')]
    private int $siren;

    #[ORM\Column(enumType: StatutProfessionnelEnum::class)]
    private StatutProfessionnelEnum $statut = StatutProfessionnelEnum::STATUT_EN_ATTENTE;

    #[ORM\Column(name: 'date_validation', type: 'datetime', nullable: true)]
    private ?\DateTimeInterface $dateValidation = null;

    #[ORM\ManyToOne(targetEntity: Adresse::class)]
    #[ORM\JoinColumn(name: 'adresse_id', referencedColumnName: 'id', nullable: false)]
    private Adresse $adresse;

    #[ORM\OneToMany(mappedBy: 'professionnel', targetEntity: Laverie::class)]
    private Collection $laveries;

    #[ORM\OneToMany(mappedBy: 'professionnel', targetEntity: ProfessionnelHistoriqueInteraction::class)]
    private Collection $historiqueInteractions;

    public function __construct()
    {
        $this->laveries               = new ArrayCollection();
        $this->historiqueInteractions = new ArrayCollection();
    }

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

    public function getSiren(): int
    {
        return $this->siren;
    }

    public function setSiren(int $siren): static
    {
        $this->siren = $siren;
        return $this;
    }

    public function getStatut(): StatutProfessionnelEnum
    {
        return $this->statut;
    }

    public function setStatut(StatutProfessionnelEnum $statut): static
    {
        $this->statut = $statut;
        return $this;
    }

    public function getDateValidation(): ?\DateTimeInterface
    {
        return $this->dateValidation;
    }

    public function setDateValidation(?\DateTimeInterface $date): static
    {
        $this->dateValidation = $date;
        return $this;
    }

    public function getAdresse(): Adresse
    {
        return $this->adresse;
    }

    public function setAdresse(Adresse $adresse): static
    {
        $this->adresse = $adresse;
        return $this;
    }

    public function getLaveries(): Collection {
        return $this->laveries;
    }

        public function getHistoriqueInteractions(): Collection {
        return $this->historiqueInteractions;
    }
}
