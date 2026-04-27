<?php

namespace App\Entity;

use App\Repository\LaverieServiceRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: LaverieServiceRepository::class)]
#[ORM\Table(name: 'laverie_service')]
class LaverieService
{
    #[ORM\Id]
    #[ORM\ManyToOne(targetEntity: Service::class)]
    #[ORM\JoinColumn(name: 'service_id', referencedColumnName: 'id', nullable: false)]
    private Service $service;

    #[ORM\Id]
    #[ORM\ManyToOne(targetEntity: Laverie::class, inversedBy: 'services')]
    #[ORM\JoinColumn(name: 'laverie_id', referencedColumnName: 'id', nullable: false)]
    private Laverie $laverie;

    public function getService(): Service
    {
        return $this->service;
    }

    public function setService(Service $service): static
    {
        $this->service = $service;
        return $this;
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
}
