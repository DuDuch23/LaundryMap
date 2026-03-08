<?php

namespace App\Entity;

use App\Repository\LaverieNoteSignalementRepository;
use Doctrine\ORM\Mapping as ORM;
use App\Enum\MotifEnum;

#[ORM\Entity(repositoryClass: LaverieNoteSignalementRepository::class)]
#[ORM\Table(name: 'laverie_note_signalement')]
class LaverieNoteSignalement
{
    #[ORM\Id]
    #[ORM\ManyToOne(targetEntity: LaverieNote::class, inversedBy: 'signalements')]
    #[ORM\JoinColumn(name: 'laverie_note_id', referencedColumnName: 'id', nullable: true)]
    private ?LaverieNote $laverieNote = null;

    #[ORM\Id]
    #[ORM\ManyToOne(targetEntity: Utilisateur::class)]
    #[ORM\JoinColumn(name: 'utilisateur_id', referencedColumnName: 'id', nullable: true)]
    private ?Utilisateur $utilisateur = null;

    #[ORM\Column(type: 'datetime')]
    private \DateTimeInterface $date;

    #[ORM\Column(enumType: MotifEnum::class)]
    private MotifEnum $motif;

    #[ORM\Column(type: 'text', nullable: true)]
    private ?string $commentaire = null;

    public function getLaverieNote(): ?LaverieNote
    {
        return $this->laverieNote;
    }

    public function setLaverieNote(?LaverieNote $laverieNote): static
    {
        $this->laverieNote = $laverieNote;
        return $this;
    }

    public function getUtilisateur(): ?Utilisateur
    {
        return $this->utilisateur;
    }

    public function setUtilisateur(?Utilisateur $utilisateur): static
    {
        $this->utilisateur = $utilisateur;
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

    public function getMotif(): MotifEnum
    {
        return $this->motif;
    }

    public function setMotif(MotifEnum $motif): static
    {
        $this->motif = $motif;
        return $this;
    }

    public function getCommentaire(): ?string
    {
        return $this->commentaire;
    }

    public function setCommentaire(?string $commentaire): static
    {
        $this->commentaire = $commentaire;
        return $this;
    }
}
