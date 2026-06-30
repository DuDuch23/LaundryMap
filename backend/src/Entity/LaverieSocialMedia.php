<?php

namespace App\Entity;

use App\Enum\SocialMediaTypeEnum;
use App\Repository\LaverieSocialMediaRepository;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Attribute\Groups;

#[ORM\Entity(repositoryClass: LaverieSocialMediaRepository::class)]
#[ORM\Table(name: 'laverie_social_media')]
#[ORM\UniqueConstraint(name: 'uniq_laverie_social_type', columns: ['laverie_id', 'type'])]
class LaverieSocialMedia
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: 'integer')]
    #[Groups(['laverie:public'])]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: Laverie::class, inversedBy: 'socialMedias')]
    #[ORM\JoinColumn(name: 'laverie_id', referencedColumnName: 'id', nullable: false)]
    private Laverie $laverie;

    #[ORM\Column(enumType: SocialMediaTypeEnum::class)]
    #[Groups(['laverie:public'])]
    private SocialMediaTypeEnum $type;

    #[ORM\Column(type: 'string', length: 2048)]
    #[Groups(['laverie:public'])]
    private string $url;

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

    public function getType(): SocialMediaTypeEnum
    {
        return $this->type;
    }

    public function setType(SocialMediaTypeEnum $type): static
    {
        $this->type = $type;
        return $this;
    }

    public function getUrl(): string
    {
        return $this->url;
    }

    public function setUrl(string $url): static
    {
        $this->url = $url;
        return $this;
    }
}
