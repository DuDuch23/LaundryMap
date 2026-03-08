<?php

namespace App\Entity;

use App\Repository\LaverieEquipementRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: LaverieEquipementRepository::class)]
#[ORM\Table(name: 'laverie_equipement')]
class LaverieEquipement
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: 'integer')]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: Laverie::class, inversedBy: 'equipements')]
    #[ORM\JoinColumn(name: 'laverie_id', referencedColumnName: 'id', nullable: false)]
    private Laverie $laverie;

    #[ORM\Column(name: 'equipement_reference', type: 'integer', nullable: true)]
    private ?int $equipementReference = null;

    #[ORM\Column(type: 'string', length: 255)]
    private string $nom;

    #[ORM\Column(type: 'string')]
    private string $type;

    #[ORM\Column(type: 'integer')]
    private int $capacite;

    #[ORM\Column(type: 'float')]
    private float $tarif;

    // Durée en minute
    #[ORM\Column(type: 'integer')]
    private int $duree;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getLaverie(): Laverie
    {
        return $this->laverie;
    }

    public function setLaverie(Laverie $laverie): static
    {
        $this->laverie = $laverie;
        return $this;
    }

    public function getEquipementReference(): ?int
    {
        return $this->equipementReference;
    }

    public function setEquipementReference(?int $ref): static
    {
        $this->equipementReference = $ref;
        return $this;
    }

    public function getNom(): string
    {
        return $this->nom;
    }

    public function setNom(string $nom): static
    {
        $this->nom = $nom;
        return $this;
    }

    public function getType(): string
    {
        return $this->type;
    }

    public function setType(string $type): static
    {
        $this->type = $type;
        return $this;
    }

    public function getCapacite(): int
    {
        return $this->capacite;
    }

    public function setCapacite(int $capacite): static
    {
        $this->capacite = $capacite;
        return $this;
    }

    public function getTarif(): float
    {
        return $this->tarif;
    }

    public function setTarif(float $tarif): static
    {
        $this->tarif = $tarif;
        return $this;
    }

    public function getDuree(): int
    {
        return $this->duree;
    }

    public function setDuree(int $duree): static
    {
        $this->duree = $duree;
        return $this;
    }
}
