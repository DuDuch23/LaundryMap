<?php

namespace App\Entity;

use App\Enum\TypeReseauSocialEnum;
use App\Repository\LaverieReseauSocialRepository;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Attribute\Groups;

#[ORM\Entity(repositoryClass: LaverieReseauSocialRepository::class)]
#[ORM\Table(name: 'laverie_reseau_social')]
#[ORM\UniqueConstraint(name: 'uniq_laverie_type', columns: ['laverie_id', 'type'])]
class LaverieReseauSocial
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: 'integer')]
    #[Groups(['laverie:public'])]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: Laverie::class, inversedBy: 'reseauxSociaux')]
    #[ORM\JoinColumn(name: 'laverie_id', referencedColumnName: 'id', nullable: false)]
    private Laverie $laverie;

    #[ORM\Column(type: 'string', enumType: TypeReseauSocialEnum::class)]
    #[Groups(['laverie:public'])]
    private TypeReseauSocialEnum $type;

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

    public function getType(): TypeReseauSocialEnum
    {
        return $this->type;
    }

    public function setType(TypeReseauSocialEnum $type): static
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
