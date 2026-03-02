<?php

namespace App\Entity;

use App\Repository\LaveriePaiementRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: LaveriePaiementRepository::class)]
#[ORM\Table(name: 'laverie_paiement')]
class LaveriePaiement
{
    #[ORM\Id]
    #[ORM\ManyToOne(targetEntity: MethodePaiement::class)]
    #[ORM\JoinColumn(name: 'paiement_id', referencedColumnName: 'id', nullable: false)]
    private MethodePaiement $paiement;

    #[ORM\Id]
    #[ORM\ManyToOne(targetEntity: Laverie::class, inversedBy: 'paiements')]
    #[ORM\JoinColumn(name: 'laverie_id', referencedColumnName: 'id', nullable: false)]
    private Laverie $laverie;

    public function getPaiement(): MethodePaiement
    {
        return $this->paiement;
    }
    
    public function setPaiement(MethodePaiement $paiement): static
    {
        $this->paiement = $paiement;
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
