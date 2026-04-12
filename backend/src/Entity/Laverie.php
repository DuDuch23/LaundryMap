<?php

namespace App\Entity;

use App\Repository\LaverieRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use App\Enum\StatutLaverieEnum;
use Symfony\Component\Serializer\Attribute\Groups;

#[ORM\Entity(repositoryClass: LaverieRepository::class)]
#[ORM\Table(name: 'laverie')]
class Laverie
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: 'integer')]
    #[Groups(['laverie:public'])]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: Professionnel::class, inversedBy: 'laveries')]
    #[ORM\JoinColumn(name: 'professionnel_id', referencedColumnName: 'id', nullable: false)]
    #[Groups(['laverie:public', 'laverie:private'])]
    private Professionnel $professionnel;

    #[ORM\Column(enumType: StatutLaverieEnum::class)]
    #[Groups(['laverie:public'])]
    private StatutLaverieEnum $statut = StatutLaverieEnum::STATUT_EN_ATTENTE;

    #[ORM\Column(name: 'wi_line_reference', type: 'integer', nullable: true)]
    #[Groups(['laverie:private'])]
    private ?int $wiLineReference = null;

    #[ORM\ManyToOne(targetEntity: Adresse::class, cascade: ['persist'])]
    #[ORM\JoinColumn(name: 'adresse_id', referencedColumnName: 'id', nullable: false)]
    #[Groups(['laverie:public'])]
    private Adresse $adresse;

    #[ORM\ManyToOne(targetEntity: Media::class)]
    #[ORM\JoinColumn(name: 'logo_id', referencedColumnName: 'id', nullable: true)]
    #[Groups(['laverie:public'])]
    private ?Media $logo = null;

    #[ORM\Column(name: 'nom_etablissement', type: 'string', length: 255)]
    #[Groups(['laverie:public'])]
    private string $nomEtablissement;

    #[ORM\Column(name: 'contact_email', type: 'string', length: 255, nullable: true)]
    #[Groups(['laverie:public'])]
    private ?string $contactEmail = null;

    #[ORM\Column(type: 'text', nullable: true)]
    #[Groups(['laverie:public'])]
    private ?string $description = null;

    #[ORM\Column(name: 'date_ajout', type: 'datetime')]
    #[Groups(['laverie:private'])]
    private \DateTimeInterface $dateAjout;

    #[ORM\Column(name: 'date_modification', type: 'datetime')]
    #[Groups(['laverie:private'])]
    private \DateTimeInterface $dateModification;

    /** @comment Si remplie : la laverie est supprimée */
    #[ORM\Column(name: 'supprimee_le', type: 'datetime', nullable: true)]
    #[Groups(['laverie:public', 'laverie:private'])]
    private ?\DateTimeInterface $supprimee_le = null;

    #[ORM\OneToMany(mappedBy: 'laverie', targetEntity: LaverieEquipement::class)]
    #[Groups(['laverie:public'])]
    private Collection $equipements;

    #[ORM\OneToMany(mappedBy: 'laverie', targetEntity: LaverieFavori::class)]
    #[Groups(['laverie:public', 'laverie:private'])]
    private Collection $favoris;

    #[ORM\OneToMany(mappedBy: 'laverie', targetEntity: LaverieNote::class)]
    #[Groups(['laverie:public', 'laverie:private'])]
    private Collection $notes;

    #[ORM\OneToMany(mappedBy: 'laverie', targetEntity: LaverieMedia::class)]
    #[Groups(['laverie:public', 'laverie:private'])]
    private Collection $medias;

    #[ORM\OneToMany(mappedBy: 'laverie', targetEntity: LaverieService::class)]
    #[Groups(['laverie:public'])]
    private Collection $services;

    #[ORM\OneToMany(mappedBy: 'laverie', targetEntity: LaveriePaiement::class)]
    #[Groups(['laverie:public', 'laverie:private'])]
    private Collection $paiements;

    #[ORM\OneToMany(mappedBy: 'laverie', targetEntity: LaverieFermeture::class)]
    #[Groups(['laverie:public', 'laverie:private'])]
    private Collection $fermetures;

    #[ORM\OneToMany(mappedBy: 'laverie', targetEntity: LaverieFermetureExceptionnelle::class)]
    #[Groups(['laverie:public', 'laverie:private'])]
    private Collection $fermeturesExceptionnelles;

    #[ORM\OneToMany(mappedBy: 'laverie', targetEntity: LaverieHistoriqueInteraction::class)]
    #[Groups(['laverie:public', 'laverie:private'])]
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

    public function getStatut(): StatutLaverieEnum
    {
        return $this->statut;
    }
    public function setStatut(StatutLaverieEnum $statut): static
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