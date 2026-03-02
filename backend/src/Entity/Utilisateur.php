<?php

namespace App\Entity;

use App\Repository\UtilisateurRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: UtilisateurRepository::class)]
#[ORM\Table(name: 'utilisateur')]
class Utilisateur
{
    public const STATUT_EN_ATTENTE = 'En attente';
    public const STATUT_VALIDE     = 'Validé';
    public const STATUT_REFUSE     = 'Refusé';
    public const STATUT_BANNI      = 'Banni';

    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: 'integer')]
    private ?int $id = null;

    #[ORM\Column(type: 'string', length: 255)]
    private string $email;

    #[ORM\Column(type: 'string', length: 255, nullable: true)]
    private ?string $nom = null;

    #[ORM\Column(type: 'string', length: 255, nullable: true)]
    private ?string $prenom = null;

    #[ORM\Column(name: 'mot_de_passe', type: 'string', length: 255, nullable: true)]
    private ?string $motDePasse = null;

    #[ORM\Column(type: 'string', enumType: null)]
    private string $statut = self::STATUT_EN_ATTENTE;

    #[ORM\Column(name: 'date_creation', type: 'datetime', nullable: true)]
    private ?\DateTimeInterface $dateCreation = null;

    #[ORM\Column(name: 'date_modification', type: 'datetime', nullable: true)]
    private ?\DateTimeInterface $dateModification = null;

    #[ORM\Column(name: 'oauth_id', type: 'string', length: 255, nullable: true)]
    private ?string $oauthId = null;

    #[ORM\Column(name: 'date_derniere_connexion', type: 'datetime', nullable: true)]
    private ?\DateTimeInterface $dateDerniereConnexion = null;

    #[ORM\OneToOne(mappedBy: 'utilisateur', targetEntity: Professionnel::class)]
    private ?Professionnel $professionnel = null;

    #[ORM\OneToOne(mappedBy: 'utilisateur', targetEntity: UtilisateurPreference::class)]
    private ?UtilisateurPreference $preference = null;

    #[ORM\OneToMany(mappedBy: 'utilisateur', targetEntity: LaverieFavori::class)]
    private Collection $favoris;

    #[ORM\OneToMany(mappedBy: 'utilisateur', targetEntity: LaverieNote::class)]
    private Collection $notes;

    #[ORM\OneToMany(mappedBy: 'utilisateur', targetEntity: UtilisateurHistoriqueInteraction::class)]
    private Collection $historiqueInteractions;

    public function __construct()
    {
        $this->favoris = new ArrayCollection();
        $this->notes = new ArrayCollection();
        $this->historiqueInteractions = new ArrayCollection();
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

    public function getNom(): ?string
    {
        return $this->nom;
    }

    public function setNom(?string $nom): static
    {
        $this->nom = $nom;
        return $this;
    }

    public function getPrenom(): ?string
    {
        return $this->prenom;
    }

    public function setPrenom(?string $prenom): static
    {
        $this->prenom = $prenom;
        return $this;
    }

    public function getMotDePasse(): ?string
    {
        return $this->motDePasse;
    }

    public function setMotDePasse(?string $motDePasse): static
    {
        $this->motDePasse = $motDePasse;
        return $this;
    }

    public function getStatut(): string
    {
        return $this->statut;
    }

    public function setStatut(string $statut): static
    {
        $this->statut = $statut;
        return $this;
    }

    public function getDateCreation(): ?\DateTimeInterface {
        return $this->dateCreation;
    }

    public function setDateCreation(?\DateTimeInterface $dateCreation): static
    {
        $this->dateCreation = $dateCreation;
        return $this;
    }

    public function getDateModification(): ?\DateTimeInterface
    {
        return $this->dateModification;
    }

    public function setDateModification(?\DateTimeInterface $dateModification): static
    {
        $this->dateModification = $dateModification;
        return $this;
    }

    public function getOauthId(): ?string
    {
        return $this->oauthId;
    }

    public function setOauthId(?string $oauthId): static
    {
        $this->oauthId = $oauthId;
        return $this;
    }

    public function getDateDerniereConnexion(): ?\DateTimeInterface
    {
        return $this->dateDerniereConnexion;
    }

    public function setDateDerniereConnexion(?\DateTimeInterface $date): static
    {
        $this->dateDerniereConnexion = $date;
        return $this;
    }

    public function getProfessionnel(): ?Professionnel
    {
        return $this->professionnel;
    }

    public function getPreference(): ?UtilisateurPreference
    {
        return $this->preference;
    }

    public function getFavoris(): Collection
    {
        return $this->favoris;
    }

    public function getNotes(): Collection
    {
        return $this->notes;
    }

    public function getHistoriqueInteractions(): Collection
    {
        return $this->historiqueInteractions;
    }
}
