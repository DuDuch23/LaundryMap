<?php

namespace App\Entity;

use App\Repository\MethodePaiementRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: MethodePaiementRepository::class)]
#[ORM\Table(name: 'methode_paiement')]
class MethodePaiement
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: 'integer')]
    private ?int $id = null;

    #[ORM\Column(type: 'string', length: 255)]
    private string $nom;

    public function getId(): ?int
    {
        return $this->id;
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
}
