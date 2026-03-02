<?php

namespace App\Entity;

use App\Repository\ProfessionnelHistoriqueInteractionRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: ProfessionnelHistoriqueInteractionRepository::class)]
#[ORM\Table(name: 'professionnel_historique_interaction')]
class ProfessionnelHistoriqueInteraction
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: 'integer')]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: Administrateur::class, inversedBy: 'professionnelHistoriques')]
    #[ORM\JoinColumn(name: 'administrateur_id', referencedColumnName: 'id', nullable: false)]
    private Administrateur $administrateur;

    #[ORM\ManyToOne(targetEntity: Professionnel::class, inversedBy: 'historiqueInteractions')]
    #[ORM\JoinColumn(name: 'professionel_id', referencedColumnName: 'id', nullable: false)]
    private Professionnel $professionnel;

    #[ORM\Column(type: 'string')]
    private string $action;

    #[ORM\Column(name: 'motif_action', type: 'string', length: 255)]
    private string $motifAction;

    #[ORM\Column(type: 'datetime')]
    private \DateTimeInterface $date;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getAdministrateur(): Administrateur
    {
        return $this->administrateur;
    }

    public function setAdministrateur(Administrateur $administrateur): static
    {
        $this->administrateur = $administrateur;
        return $this;
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

    public function getAction(): string
    {
        return $this->action;
    }

    public function setAction(string $action): static
    {
        $this->action = $action;
        return $this;
    }

    public function getMotifAction(): string
    {
        return $this->motifAction;
    }

    public function setMotifAction(string $motif): static
    {
        $this->motifAction = $motif;
        return $this;
    }

    public function getDate(): \DateTimeInterface
    {
        return $this->date;
    }

    public function setDate(\DateTimeInterface $date): static
    {
        $this->date = $date;
        return $this;
    }
}
