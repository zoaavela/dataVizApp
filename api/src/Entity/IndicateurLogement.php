<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Attribute\Groups;

#[ORM\Entity]
class IndicateurLogement
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column] // <-- AJOUT DE L'ANNÉE
    #[Groups(['module:carte', 'module:logement'])]
    private ?int $annee = null;

    #[ORM\Column(nullable: true)]
    #[Groups(['module:carte', 'module:logement'])]
    private ?int $stockHlm = null;

    #[ORM\Column(nullable: true)]
    #[Groups(['module:carte', 'module:logement'])]
    private ?float $tauxHlm = null;

    #[ORM\OneToOne(inversedBy: 'logement', targetEntity: Territoire::class)]
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

    public function getStockHlm(): ?int
    {
        return $this->stockHlm;
    }

    public function setStockHlm(?int $stockHlm): static
    {
        $this->stockHlm = $stockHlm;

        return $this;
    }

    public function getTauxHlm(): ?float
    {
        return $this->tauxHlm;
    }

    public function setTauxHlm(?float $tauxHlm): static
    {
        $this->tauxHlm = $tauxHlm;

        return $this;
    }

    #[Groups(['module:logement'])]
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