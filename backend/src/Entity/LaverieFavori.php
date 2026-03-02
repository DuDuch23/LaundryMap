<?php

namespace App\Entity;

use App\Repository\LaverieFavoriRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: LaverieFavoriRepository::class)]
#[ORM\Table(name: 'laverie_favori')]
class LaverieFavori
{
    #[ORM\Id]
    #[ORM\ManyToOne(targetEntity: Laverie::class, inversedBy: 'favoris')]
    #[ORM\JoinColumn(name: 'laverie_id', referencedColumnName: 'id', nullable: false)]
    private Laverie $laverie;

    #[ORM\Id]
    #[ORM\ManyToOne(targetEntity: Utilisateur::class, inversedBy: 'favoris')]
    #[ORM\JoinColumn(name: 'utilisateur_id', referencedColumnName: 'id', nullable: false)]
    private Utilisateur $utilisateur;

    public function getLaverie(): Laverie
    {
        return $this->laverie;
    }
    
    public function setLaverie(Laverie $laverie): static
    {
        $this->laverie = $laverie;
        return $this;
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
}
