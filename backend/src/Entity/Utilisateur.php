<?php
namespace App\Entity;

use App\Repository\UtilisateurRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use App\Enum\StatutUtilisateurEnum;
use Symfony\Bridge\Doctrine\Validator\Constraints\UniqueEntity;
use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Component\Serializer\Attribute\Groups;
use Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface;
use Symfony\Component\Security\Core\User\UserInterface;

#[ORM\Entity(repositoryClass: UtilisateurRepository::class)]
#[ORM\Table(name: 'utilisateur')]
#[ORM\HasLifecycleCallbacks]
#[UniqueEntity(
    fields: ['email'],
    message: 'ERROR_EMAIL_IS_USING'
)]
#[ORM\UniqueConstraint(name: 'UNIQ_IDENTIFIER_EMAIL', fields: ['email'])]

class Utilisateur implements UserInterface, PasswordAuthenticatedUserInterface
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: 'integer')]
    #[Groups(['utilisateur:read'])]
    private ?int $id = null;

    #[ORM\Column(type: 'string', length: 255, unique: true)]
    #[Assert\NotBlank(message: "ERROR_EMAIL_REQUIRED")]
    #[Assert\Email(message: "ERROR_EMAIL_INVALID")]
    #[Groups(['utilisateur:read', 'utilisateur:write'])]
    private string $email;

    #[ORM\Column(type: 'string', length: 255, nullable: true)]
    #[Assert\Length(max: 50, maxMessage: "ERROR_LASTNAME_TOO_LONG")]
    #[Groups(['utilisateur:read', 'utilisateur:write'])]
    private ?string $nom = null;

    #[ORM\Column(type: 'string', length: 255, nullable: true)]
    #[Assert\Length(max: 50, maxMessage: "ERROR_FIRSTNAME_TOO_LONG")]
    #[Groups(['utilisateur:read', 'utilisateur:write'])]
    private ?string $prenom = null;

    #[ORM\Column(name: 'mot_de_passe', type: 'string', length: 255, nullable: true)]
    #[Assert\NotBlank(message: "ERROR_PASSWORD_REQUIRED")]
    #[Assert\Length(min: 8, minMessage: "ERROR_PASSWORD_TOO_SHORT")]
    #[Groups(['utilisateur:write'])]
    private ?string $motDePasse = null;

    #[ORM\Column(type: 'string', enumType: StatutUtilisateurEnum::class)]
    #[Groups(['utilisateur:read'])]
    private StatutUtilisateurEnum $statut = StatutUtilisateurEnum::STATUT_EN_ATTENTE;

    #[ORM\Column(name: 'date_creation', type: 'datetime', nullable: true)]
    #[Groups(['utilisateur:read'])]
    private ?\DateTimeInterface $dateCreation = null;

    #[ORM\Column(name: 'date_modification', type: 'datetime', nullable: true)]
    #[Groups(['utilisateur:read'])]
    private ?\DateTimeInterface $dateModification = null;

    #[ORM\Column(name: 'oauth_id', type: 'string', length: 255, nullable: true)]
    private ?string $oauthId = null;

    #[ORM\Column(name: 'date_derniere_connexion', type: 'datetime', nullable: true)]
    private ?\DateTimeInterface $dateDerniereConnexion = null;

    #[ORM\Column(name: 'utilisateur_supprime_le', type: 'datetime', nullable: true)]
    private ?\DateTimeInterface $utilisateurSupprimeLe = null;

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

    public function getStatut(): StatutUtilisateurEnum
    {
        return $this->statut;
    }

    public function setStatut(StatutUtilisateurEnum $statut): static
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

    public function getUtilisateurSupprimeLe(): ?\DateTimeInterface
    {
        return $this->utilisateurSupprimeLe;
    }

    public function setUtilisateurSupprimeLe(?\DateTimeInterface $date): static
    {
        $this->utilisateurSupprimeLe = $date;
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

    #[ORM\PrePersist]
    public function setDatesLorsDeLaCreation(): void
    {
        $this->dateCreation = new \DateTime();
        $this->dateModification = new \DateTime();
    }

    #[ORM\PreUpdate]
    public function setDateLorsDeLaModification(): void
    {
        $this->dateModification = new \DateTime();
    }

    public function getUserIdentifier(): string
    {
        return $this->email;
    }

    public function getRoles(): array
    {
        return ['ROLE_USER'];
    }

    public function getPassword(): ?string
    {
        return $this->motDePasse;
    }

    public function isProfessionnel(): bool
    {
        return $this->professionnel !== null;
    }

    public function eraseCredentials(): void
    {
        // Vide intentionnellement
    }
}
