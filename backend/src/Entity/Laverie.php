<?php

namespace App\Entity;

use App\Repository\LaverieRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use App\Enum\StatueLaverieEnum;

#[ORM\Entity(repositoryClass: LaverieRepository::class)]
#[ORM\Table(name: 'laverie')]
class Laverie
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: 'integer')]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: Professionnel::class, inversedBy: 'laveries')]
    #[ORM\JoinColumn(name: 'professionnel_id', referencedColumnName: 'id', nullable: false)]
    private Professionnel $professionnel;

    #[ORM\Column(type: 'string')]
    private string $statut = StatueLaverieEnum::STATUT_EN_ATTENTE->value;

    #[ORM\Column(name: 'wi_line_reference', type: 'integer', nullable: true)]
    private ?int $wiLineReference = null;

    #[ORM\ManyToOne(targetEntity: Adresse::class)]
    #[ORM\JoinColumn(name: 'adresse_id', referencedColumnName: 'id', nullable: false)]
    private Adresse $adresse;

    #[ORM\ManyToOne(targetEntity: Media::class)]
    #[ORM\JoinColumn(name: 'logo_id', referencedColumnName: 'id', nullable: true)]
    private ?Media $logo = null;

    #[ORM\Column(name: 'nom_etablissement', type: 'string', length: 255)]
    private string $nomEtablissement;

    #[ORM\Column(name: 'contact_email', type: 'string', length: 255, nullable: true)]
    private ?string $contactEmail = null;

    #[ORM\Column(type: 'text', nullable: true)]
    private ?string $description = null;

    #[ORM\Column(name: 'date_ajout', type: 'datetime')]
    private \DateTimeInterface $dateAjout;

    #[ORM\Column(name: 'date_modification', type: 'datetime')]
    private \DateTimeInterface $dateModification;

    /** @comment Si remplie : la laverie est supprimée */
    #[ORM\Column(name: 'supprimee_le', type: 'datetime', nullable: true)]
    private ?\DateTimeInterface $supprimee_le = null;

    #[ORM\OneToMany(mappedBy: 'laverie', targetEntity: LaverieEquipement::class)]
    private Collection $equipements;

    #[ORM\OneToMany(mappedBy: 'laverie', targetEntity: LaverieFavori::class)]
    private Collection $favoris;

    #[ORM\OneToMany(mappedBy: 'laverie', targetEntity: LaverieNote::class)]
    private Collection $notes;

    #[ORM\OneToMany(mappedBy: 'laverie', targetEntity: LaverieMedia::class)]
    private Collection $medias;

    #[ORM\OneToMany(mappedBy: 'laverie', targetEntity: LaverieService::class)]
    private Collection $services;

    #[ORM\OneToMany(mappedBy: 'laverie', targetEntity: LaveriePaiement::class)]
    private Collection $paiements;

    #[ORM\OneToMany(mappedBy: 'laverie', targetEntity: LaverieFermeture::class)]
    private Collection $fermetures;

    #[ORM\OneToMany(mappedBy: 'laverie', targetEntity: LaverieFermetureExceptionnelle::class)]
    private Collection $fermeturesExceptionnelles;

    #[ORM\OneToMany(mappedBy: 'laverie', targetEntity: LaverieHistoriqueInteraction::class)]
    private Collection $historiqueInteractions;

    public function __construct()
    {
        $this->equipements = new ArrayCollection();
        $this->favoris = new ArrayCollection();
        $this->notes = new ArrayCollection();
        $this->medias = new ArrayCollection();
        $this->services = new ArrayCollection();
        $this->paiements = new ArrayCollection();
        $this->fermetures = new ArrayCollection();
        $this->fermeturesExceptionnelles = new ArrayCollection();
        $this->historiqueInteractions = new ArrayCollection();
    }

    public function getId(): ?int {
        return $this->id;
    }

    public function getProfessionnel(): Professionnel
    {
        return $this->professionnel;
    }

    public function setProfessionnel(Professionnel $professionnel): static
    {
        $this->professionnel = $professionnel;
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
    public function getWiLineReference(): ?int
    {
        return $this->wiLineReference;
    }

    public function setWiLineReference(?int $ref): static
    {
        $this->wiLineReference = $ref;
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

    public function getLogo(): ?Media
    {
        return $this->logo;
    }

    public function setLogo(?Media $logo): static
    {
        $this->logo = $logo;
        return $this;
    }

    public function getNomEtablissement(): string
    {
        return $this->nomEtablissement;
    }

    public function setNomEtablissement(string $nom): static
    {
        $this->nomEtablissement = $nom;
        return $this;
    }

    public function getContactEmail(): ?string
    {
        return $this->contactEmail;
    }

    public function setContactEmail(?string $email): static
    {
        $this->contactEmail = $email;
        return $this;
    }

    public function getDescription(): ?string
    {
        return $this->description;
    }

    public function setDescription(?string $description): static
    {
        $this->description = $description;
        return $this;
    }

    public function getDateAjout(): \DateTimeInterface
    {
        return $this->dateAjout;
    }

    public function setDateAjout(\DateTimeInterface $date): static
    {
        $this->dateAjout = $date;
        return $this;
    }

    public function getDateModification(): \DateTimeInterface
    {
        return $this->dateModification;
    }

    public function setDateModification(\DateTimeInterface $date): static
    {
        $this->dateModification = $date;
        return $this;
    }

    public function getSupprimee_le(): ?\DateTimeInterface
    {
        return $this->supprimee_le;
    }

    public function setSupprimee_le(?\DateTimeInterface $date): static
    {
        $this->supprimee_le = $date;
        return $this;
    }

    public function getEquipements(): Collection
    {
        return $this->equipements;
    }

    public function setEquipements(Collection $equipements): static
    {
        $this->equipements = $equipements;
        return $this;
    }

    public function getFavoris(): Collection
    {
        return $this->favoris;
    }

    public function setFavoris(Collection $favoris): static
    {
        $this->favoris = $favoris;
        return $this;
    }

    public function getNotes(): Collection
    {
        return $this->notes;
    }

    public function setNotes(Collection $notes): static
    {
        $this->notes = $notes;
        return $this;
    }

    public function getMedias(): Collection
    {
        return $this->medias;
    }

    public function setMedias(Collection $medias): static
    {
        $this->medias = $medias;
        return $this;
    }

    public function getServices(): Collection
    {
        return $this->services;
    }

    public function getPaiements(): Collection
    {
        return $this->paiements;
    }

    public function getFermetures(): Collection
    {
        return $this->fermetures;
    }

    public function getFermeturesExceptionnelles(): Collection
    {
        return $this->fermeturesExceptionnelles;
    }

    public function setFermeturesExceptionnelles(Collection $fermeturesExceptionnelles): static
    {
        $this->fermeturesExceptionnelles = $fermeturesExceptionnelles;
        return $this;
    }

    public function getHistoriqueInteractions(): Collection
    {
        return $this->historiqueInteractions;
    }

    public function setHistoriqueInteractions(Collection $historiqueInteractions): static
    {
        $this->historiqueInteractions = $historiqueInteractions;
        return $this;
    }
}
