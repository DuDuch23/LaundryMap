<?php

namespace App\Entity;

use App\Repository\LaverieNoteRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: LaverieNoteRepository::class)]
#[ORM\Table(name: 'laverie_note')]
class LaverieNote
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: 'integer')]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: Laverie::class, inversedBy: 'notes')]
    #[ORM\JoinColumn(name: 'laverie_id', referencedColumnName: 'id', nullable: false)]
    private Laverie $laverie;

    #[ORM\ManyToOne(targetEntity: Utilisateur::class, inversedBy: 'notes')]
    #[ORM\JoinColumn(name: 'utilisateur_id', referencedColumnName: 'id', nullable: false)]
    private Utilisateur $utilisateur;

    // Note de 0 à 5 sans virgule
    #[ORM\Column(type: 'smallint', nullable: true)]
    private ?int $note = null;

    #[ORM\Column(name: 'note_le', type: 'datetime', nullable: true)]
    private ?\DateTimeInterface $noteLe = null;

    #[ORM\Column(type: 'string', length: 500, nullable: true)]
    private ?string $commentaire = null;

    #[ORM\Column(name: 'commente_le', type: 'datetime', nullable: true)]
    private ?\DateTimeInterface $commenteLe = null;

    #[ORM\Column(type: 'string', length: 500, nullable: true)]
    private ?string $reponse = null;

    #[ORM\Column(name: 'repondu_le', type: 'datetime', nullable: true)]
    private ?\DateTimeInterface $reponduLe = null;

    #[ORM\Column(name: 'commentaire_supprime_motif', type: 'string', length: 255, nullable: true)]
    private ?string $commentaireSupprimeMotif = null;

    #[ORM\Column(name: 'commentaire_supprime_le', type: 'datetime', nullable: true)]
    private ?\DateTimeInterface $commentaireSupprimeeLe = null;

    #[ORM\OneToMany(mappedBy: 'laverieNote', targetEntity: LaverieNoteSignalement::class)]
    private Collection $signalements;

    public function __construct()
    {
        $this->signalements = new ArrayCollection();
    }

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
        $this->laverie = $laverie; return $this;
    }

    public function getUtilisateur(): Utilisateur
    {
        return $this->utilisateur;
    }

    public function setUtilisateur(Utilisateur $utilisateur): static
    {
        $this->utilisateur = $utilisateur;
        return $this;
    }

    public function getNote(): ?int
    {
        return $this->note;
    }

    public function setNote(?int $note): static
    {
        $this->note = $note;
        return $this;
    }

    public function getNoteLe(): ?\DateTimeInterface
    {
        return $this->noteLe;
    }

    public function setNoteLe(?\DateTimeInterface $date): static
    {
        $this->noteLe = $date; 
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

    public function getCommenteLe(): ?\DateTimeInterface
    {
        return $this->commenteLe;
    }

    public function setCommenteLe(?\DateTimeInterface $date): static
    {
        $this->commenteLe = $date; 
        return $this;
    }

    public function getReponse(): ?string
    {
        return $this->reponse;
    }

    public function setReponse(?string $reponse): static
    {
        $this->reponse = $reponse; 
        return $this;
    }

    public function getReponduLe(): ?\DateTimeInterface
    {
        return $this->reponduLe;
    }

    public function setReponduLe(?\DateTimeInterface $date): static
    {
        $this->reponduLe = $date; 
        return $this;
    }

    public function getCommentaireSupprimeMotif(): ?string
    { 
        return $this->commentaireSupprimeMotif;
    }

    public function setCommentaireSupprimeMotif(?string $motif): static
    { 
        $this->commentaireSupprimeMotif = $motif;
        return $this;
    }

    public function getCommentaireSupprimeeLe(): ?\DateTimeInterface
    { 
        return $this->commentaireSupprimeeLe;
    }

    public function setCommentaireSupprimeeLe(?\DateTimeInterface $date): static
    { 
        $this->commentaireSupprimeeLe = $date;
        return $this;
    }

    public function getSignalements(): Collection
    { 
        return $this->signalements;
    }
}
