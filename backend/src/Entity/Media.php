<?php

namespace App\Entity;

use App\Repository\MediaRepository;
use Symfony\Component\Serializer\Attribute\Groups;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: MediaRepository::class)]
#[ORM\Table(name: 'media')]
class Media
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: 'integer')]
    #[Groups(['laverie:private'])]
    private ?int $id = null;

    #[ORM\Column(type: 'string', length: 255)]
    #[Groups(['laverie:private'])]
    private string $emplacement;

    #[ORM\Column(name: 'nom_originel', type: 'string', length: 255)]
    #[Groups(['laverie:private'])]
    private string $nomOriginel;

    #[ORM\Column(type: 'integer')]
    #[Groups(['laverie:private'])]
    private int $poids;

    #[ORM\Column(name: 'mime_type', type: 'string')]
    #[Groups(['laverie:private'])]
    private string $mimeType;

    public function getId(): ?int
    {
        return $this->id;
    }
    
    public function getEmplacement(): string
    {
        return $this->emplacement;
    }
    
    public function setEmplacement(string $emplacement): static
    {
        $this->emplacement = $emplacement;
        return $this;
    }
    
    public function getNomOriginel(): string
    {
        return $this->nomOriginel;
    }
    
    public function setNomOriginel(string $nomOriginel): static
    {
        $this->nomOriginel = $nomOriginel;
        return $this;
    }
    
    public function getPoids(): int
    {
        return $this->poids;
    }
    
    public function setPoids(int $poids): static
    {
        $this->poids = $poids;
        return $this;
    }
    
    public function getMimeType(): string
    {
        return $this->mimeType;
    }
    
    public function setMimeType(string $mimeType): static
    {
        $this->mimeType = $mimeType;
        return $this;
    }
}
