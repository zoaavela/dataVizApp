<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Attribute\Groups;
use Symfony\Component\Serializer\Attribute\Ignore;

#[ORM\Entity]
class IndicateurEconomie
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column]
    #[Groups(['module:quadrant'])]
    private ?int $annee = null;

    #[ORM\Column(nullable: true)]
    #[Groups(['module:quadrant'])]
    private ?float $tauxPauvrete = null;

    #[ORM\Column(nullable: true)]
    #[Groups(['module:quadrant'])]
    private ?float $soldeMigratoire = null;

    #[ORM\OneToOne(inversedBy: 'economie', targetEntity: Territoire::class)]
    #[ORM\JoinColumn(nullable: false)]
    #[Ignore]
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

    public function getTauxPauvrete(): ?float
    {
        return $this->tauxPauvrete;
    }

    public function setTauxPauvrete(?float $tauxPauvrete): static
    {
        $this->tauxPauvrete = $tauxPauvrete;

        return $this;
    }

    public function getSoldeMigratoire(): ?float
    {
        return $this->soldeMigratoire;
    }

    public function setSoldeMigratoire(?float $soldeMigratoire): static
    {
        $this->soldeMigratoire = $soldeMigratoire;

        return $this;
    }

    public function getTerritoire(): ?Territoire
    {
        return $this->territoire;
    }

    public function setTerritoire(Territoire $territoire): static
    {
        $this->territoire = $territoire;

        return $this;
    }

    #[Groups(['module:quadrant'])]
    public function getTerritoireId(): ?int
    {
        return $this->territoire ? $this->territoire->getId() : null;
    }
}