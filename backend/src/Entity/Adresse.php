<?php

namespace App\Entity;

use App\Repository\AdresseRepository;
use Doctrine\ORM\Mapping as ORM;
use App\Enum\StatutGeoEnum;
use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Component\Validator\Constraints\NotBlank;
use Symfony\Component\Serializer\Attribute\Groups;

#[ORM\Entity(repositoryClass: AdresseRepository::class)]
#[ORM\Table(name: 'adresse')]
class Adresse
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: 'integer')]
    #[Groups(['laverie:private'])]
    private ?int $id = null;

    #[ORM\Column(type: 'string', length: 255)]
    #[Assert\NotBlank(message: "L'adresse est obligatoire.")]
    #[Groups(['laverie:private'])]
    private string $adresse;

    #[ORM\Column(type: 'string', length: 255)]
    #[Assert\NotBlank(message: "La rue est obligatoire.")]
    #[Groups(['laverie:public'])]
    private string $rue;

    #[ORM\Column(name: 'code_postal', type: 'integer')]
    #[Assert\NotBlank(message: "Le code postal est obligatoire.")]
    #[Groups(['laverie:public'])]
    private int $codePostal;

    #[ORM\Column(type: 'string')]
    #[Assert\NotBlank(message: "La ville est obligatoire.")]
    #[Groups(['laverie:public'])]
    private string $ville;

    #[ORM\Column(type: 'string')]
    #[Assert\NotBlank(message: "Le pays est obligatoire.")]
    #[Groups(['laverie:public'])]
    private string $pays;

    #[ORM\Column(type: 'float', nullable: true)]
    #[Groups(['laverie:public'])]
    private ?float $latitude = null;

    #[ORM\Column(type: 'float', nullable: true)]
    #[Groups(['laverie:public'])]
    private ?float $longitude = null;

    #[ORM\Column(name: 'statut_geolocalisation', enumType: StatutGeoEnum::class)]
    #[Groups(['laverie:private'])]
    private StatutGeoEnum $statutGeolocalisation = StatutGeoEnum::EN_ATTENTE;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getAdresse(): string
    {
        return $this->adresse;
    }

    public function setAdresse(string $adresse): static
    {
        $this->adresse = $adresse;
        return $this;
    }

    public function getRue(): string
    {
        return $this->rue;
    }

    public function setRue(string $rue): static
    {
        $this->rue = $rue;
        return $this;
    }

    public function getCodePostal(): int
    {
        return $this->codePostal;
    }

    public function setCodePostal(int $codePostal): static
    {
        $this->codePostal = $codePostal;
        return $this;
    }

    public function getVille(): string
    {
        return $this->ville;
    }

    public function setVille(string $ville): static
    {
        $this->ville = $ville;
        return $this;
    }

    public function getPays(): string
    {
        return $this->pays;
    }

    public function setPays(string $pays): static
    {
        $this->pays = $pays;
        return $this;
    }

    public function getLatitude(): ?float
    {
        return $this->latitude;
    }

    public function setLatitude(?float $latitude): static
    {
        $this->latitude = $latitude;
        return $this;
    }

    public function getLongitude(): ?float
    {
        return $this->longitude;
    }

    public function setLongitude(?float $longitude): static
    {
        $this->longitude = $longitude;
        return $this;
    }

    public function getStatutGeolocalisation(): StatutGeoEnum
    {
        return $this->statutGeolocalisation;
    }

    public function setStatutGeolocalisation(StatutGeoEnum $statut): static
    {
        $this->statutGeolocalisation = $statut;
        return $this;
    }
}