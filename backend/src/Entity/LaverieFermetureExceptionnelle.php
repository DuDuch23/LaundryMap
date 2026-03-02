<?php

namespace App\Entity;

use App\Repository\LaverieFermetureExceptionnelleRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: LaverieFermetureExceptionnelleRepository::class)]
#[ORM\Table(name: 'laverie_fermeture_exceptionnelle')]
class LaverieFermetureExceptionnelle
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: 'integer')]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: Laverie::class, inversedBy: 'fermeturesExceptionnelles')]
    #[ORM\JoinColumn(name: 'laverie_id', referencedColumnName: 'id', nullable: false)]
    private Laverie $laverie;

    #[ORM\Column(name: 'date_debut', type: 'datetime')]
    private \DateTimeInterface $dateDebut;

    #[ORM\Column(name: 'date_fin', type: 'datetime')]
    private \DateTimeInterface $dateFin;

    #[ORM\Column(type: 'string', length: 255, nullable: true)]
    private ?string $raison = null;

    #[ORM\Column(name: 'date_ajout', type: 'datetime')]
    private \DateTimeInterface $dateAjout;

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

    public function getDateDebut(): \DateTimeInterface
    {
        return $this->dateDebut;
    }

    public function setDateDebut(\DateTimeInterface $date): static
    {
        $this->dateDebut = $date;
        return $this;
    }

    public function getDateFin(): \DateTimeInterface
    {
        return $this->dateFin;
    }

    public function setDateFin(\DateTimeInterface $date): static
    {
        $this->dateFin = $date;
        return $this;
    }

    public function getRaison(): ?string
    {
        return $this->raison;
    }
    
    public function setRaison(?string $raison): static
    {
        $this->raison = $raison;
        return $this;
    }

    public function getDateAjout(): \DateTimeInterface
    {
        return
        $this->dateAjout;
    }

    public function setDateAjout(\DateTimeInterface $date): static
    {
        $this->dateAjout = $date;
        return $this;
    }
}
