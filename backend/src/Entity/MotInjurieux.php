<?php

namespace App\Entity;

use App\Repository\MotInjurieuxRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: MotInjurieuxRepository::class)]
#[ORM\Table(name: 'mot_injurieux')]
class MotInjurieux
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: 'integer')]
    private ?int $id = null;

    #[ORM\Column(type: 'string', length: 255)]
    private string $label;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getLabel(): string
    {
        return $this->label;
    }

    public function setLabel(string $label): static
    {
        $this->label = $label;
        return $this;
    }
}
