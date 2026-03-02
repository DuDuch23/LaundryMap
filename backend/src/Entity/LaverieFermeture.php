<?php

namespace App\Entity;

use App\Repository\LaverieFermetureRepository;
use Doctrine\ORM\Mapping as ORM;
use App\Enum\JourEnum;

#[ORM\Entity(repositoryClass: LaverieFermetureRepository::class)]
#[ORM\Table(name: 'laverie_fermeture')]
class LaverieFermeture
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: 'integer')]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: Laverie::class, inversedBy: 'fermetures')]
    #[ORM\JoinColumn(name: 'laverie_id', referencedColumnName: 'id', nullable: false)]
    private Laverie $laverie;

    #[ORM\Column(enumType: JourEnum::class)]
    private JourEnum $jour;

    #[ORM\Column(name: 'date_ajout', type: 'datetime')]
    private \DateTimeInterface $dateAjout;

    #[ORM\Column(name: 'date_modification', type: 'datetime')]
    private \DateTimeInterface $dateModification;

    #[ORM\Column(name: 'heure_debut', type: 'time')]
    private \DateTimeInterface $heureDebut;

    #[ORM\Column(name: 'heure_fin', type: 'time')]
    private \DateTimeInterface $heureFin;

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

    public function getJour(): JourEnum
    {
        return $this->jour;
    }

    public function setJour(JourEnum $jour): static
    {
        $this->jour = $jour;
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

    public function getHeureDebut(): \DateTimeInterface
    {
        return $this->heureDebut;
    }

    public function setHeureDebut(\DateTimeInterface $heure): static
    {
        $this->heureDebut = $heure;
        return $this;
    }

    public function getHeureFin(): \DateTimeInterface
    {
        return $this->heureFin;
    }

    public function setHeureFin(\DateTimeInterface $heure): static
    {
        $this->heureFin = $heure;
        return $this;
    }
}
