<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Attribute\Groups;

#[ORM\Entity]
class IndicateurEnergie
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column]
    #[Groups(['module:thermique'])]
    private ?int $annee = null;

    #[ORM\Column(nullable: true)]
    #[Groups(['module:thermique'])]
    private ?float $ageMoyenParc = null;

    #[ORM\Column(nullable: true)]
    #[Groups(['module:thermique'])]
    private ?float $tauxPassoires = null;

    #[ORM\OneToOne(inversedBy: 'energie', targetEntity: Territoire::class)]
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

    public function getAgeMoyenParc(): ?float
    {
        return $this->ageMoyenParc;
    }

    public function setAgeMoyenParc(?float $ageMoyenParc): static
    {
        $this->ageMoyenParc = $ageMoyenParc;

        return $this;
    }

    public function getTauxPassoires(): ?float
    {
        return $this->tauxPassoires;
    }

    public function setTauxPassoires(?float $tauxPassoires): static
    {
        $this->tauxPassoires = $tauxPassoires;

        return $this;
    }

    #[Groups(['module:thermique'])]
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