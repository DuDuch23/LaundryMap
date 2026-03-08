<?php

namespace App\Entity;

use App\Repository\LaverieMediaRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: LaverieMediaRepository::class)]
#[ORM\Table(name: 'laverie_media')]
class LaverieMedia
{
    #[ORM\Id]
    #[ORM\ManyToOne(targetEntity: Laverie::class, inversedBy: 'medias')]
    #[ORM\JoinColumn(name: 'laverie_id', referencedColumnName: 'id', nullable: false)]
    private Laverie $laverie;

    #[ORM\Id]
    #[ORM\ManyToOne(targetEntity: Media::class)]
    #[ORM\JoinColumn(name: 'media_id', referencedColumnName: 'id', nullable: true)]
    private ?Media $media = null;

    #[ORM\Column(type: 'string', length: 255)]
    private string $description;

    public function getLaverie(): Laverie
    {
        return $this->laverie;
    }

    public function setLaverie(Laverie $laverie): static
    {
        $this->laverie = $laverie;
        return $this;
    }

    public function getMedia(): ?Media
    {
        return $this->media;
    }

    public function setMedia(?Media $media): static
    {
        $this->media = $media;
        return $this;
    }

    public function getDescription(): string
    {
        return $this->description;
    }

    public function setDescription(string $description): static
    {
        $this->description = $description;
        return $this;
    }
}
