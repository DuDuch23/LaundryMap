<?php

namespace App\Entity;

use App\Repository\LangueRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: LangueRepository::class)]
#[ORM\Table(name: 'langue')]
class Langue
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: 'integer')]
    private ?int $id = null;

    #[ORM\Column(type: 'string', length: 255)]
    private string $nom;

    /** @comment ex: fr, en */
    #[ORM\Column(type: 'string', length: 2)]
    private string $code;

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
    
    public function getCode(): string
    {
        return $this->code;
    }

    public function setCode(string $code): static
    {
        $this->code = $code;
    return $this;
    }
}
