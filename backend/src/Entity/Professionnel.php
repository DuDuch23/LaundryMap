<?php

namespace App\Entity;

use App\Repository\ProfessionnelRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use App\Enum\StatutProfessionnelEnum;
use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Component\Serializer\Attribute\Groups;

#[ORM\Entity(repositoryClass: ProfessionnelRepository::class)]
#[ORM\Table(name: 'professionnel')]
class Professionnel
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: 'integer')]
    #[Groups(['professionnel:read'])]
    private ?int $id = null;

    #[ORM\OneToOne(targetEntity: Utilisateur::class, inversedBy: 'professionnel')]
    #[ORM\JoinColumn(name: 'utilisateur_id', referencedColumnName: 'id', nullable: false)]
    #[Groups(['professionnel:read'])]
    private Utilisateur $utilisateur;

    #[ORM\Column(type: 'integer')]
    #[Assert\NotBlank(message: "Le numéro SIREN est obligatoire pour un professionnel.")]
    #[Assert\Length(
        exactly: 9,
        exactMessage: "Le numéro SIREN doit contenir exactement {{ limit }} chiffres."
    )]
    #[Groups(['professionnel:read', 'professionnel:write'])]
    private int $siren;

    #[ORM\Column(enumType: StatutProfessionnelEnum::class)]
    #[Groups(['professionnel:read'])]
    private StatutProfessionnelEnum $statut = StatutProfessionnelEnum::STATUT_EN_ATTENTE;

    #[ORM\Column(name: 'date_validation', type: 'datetime', nullable: true)]
    #[Groups(['professionnel:read'])]
    private ?\DateTimeInterface $dateValidation = null;

    #[ORM\ManyToOne(targetEntity: Adresse::class)]
    #[ORM\JoinColumn(name: 'adresse_id', referencedColumnName: 'id', nullable: false)]
    #[Groups(['professionnel:read', 'professionnel:write'])]
    private Adresse $adresse;

    #[ORM\ManyToOne(targetEntity: Media::class)]
    #[ORM\JoinColumn(name: 'photo_profil_id', referencedColumnName: 'id', nullable: true)]
    private ?Media $photoProfil = null;

    #[ORM\OneToMany(mappedBy: 'professionnel', targetEntity: Laverie::class)]
    #[Groups(['professionnel:read'])]
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

    public function getPhotoProfil(): ?Media
    {
        return $this->photoProfil;
    }

    public function setPhotoProfil(?Media $photoProfil): static
    {
        $this->photoProfil = $photoProfil;
        return $this;
    }

    public function getHistoriqueInteractions(): Collection {
        return $this->historiqueInteractions;
    }
}
