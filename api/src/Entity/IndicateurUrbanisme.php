<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Attribute\Groups;

#[ORM\Entity]
class IndicateurUrbanisme
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column]
    #[Groups(['module:beton'])]
    private ?int $annee = null;

    #[ORM\Column(nullable: true)]
    #[Groups(['module:beton'])]
    private ?int $rangPop = null;

    #[ORM\Column(nullable: true)]
    #[Groups(['module:beton'])]
    private ?int $rangConst = null;

    #[ORM\OneToOne(inversedBy: 'urbanisme', targetEntity: Territoire::class)]
    #[ORM\JoinColumn(nullable: false)]
    private ?Territoire $territoire = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getAnnee(): ?int
    {
        return $this->annee;
    }

    public function setAnnee(int $annee): static
    {
        $this->annee = $annee;

        return $this;
    }

    public function getRangPop(): ?int
    {
        return $this->rangPop;
    }

    public function setRangPop(?int $rangPop): static
    {
        $this->rangPop = $rangPop;

        return $this;
    }

    public function getRangConst(): ?int
    {
        return $this->rangConst;
    }

    public function setRangConst(?int $rangConst): static
    {
        $this->rangConst = $rangConst;

        return $this;
    }

    #[Groups(['module:beton'])]
    public function getTerritoireId(): ?int
    {
        return $this->territoire ? $this->territoire->getId() : null;
    }

    public function setTerritoire(Territoire $territoire): static
    {
        $this->territoire = $territoire;

        return $this;
    }
}