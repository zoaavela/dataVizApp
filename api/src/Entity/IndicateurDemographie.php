<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Attribute\Groups;

#[ORM\Entity]
class IndicateurDemographie
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column]
    #[Groups(['module:age'])]
    private ?int $annee = null;

    #[ORM\Column(nullable: true)]
    #[Groups(['module:age'])]
    private ?float $partJeunes = null;

    #[ORM\Column(nullable: true)]
    #[Groups(['module:age'])]
    private ?float $partSeniors = null;

    #[ORM\OneToOne(inversedBy: 'demographie', targetEntity: Territoire::class)]
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

    public function getPartJeunes(): ?float
    {
        return $this->partJeunes;
    }

    public function setPartJeunes(?float $partJeunes): static
    {
        $this->partJeunes = $partJeunes;

        return $this;
    }

    public function getPartSeniors(): ?float
    {
        return $this->partSeniors;
    }

    public function setPartSeniors(?float $partSeniors): static
    {
        $this->partSeniors = $partSeniors;

        return $this;
    }

    #[Groups(['module:age'])]
    public function getTerritoireId(): ?int
    {
        return $this->territoire ? $this->territoire->getId() : null;
    }

    public function getTerritoire(): ?Territoire
    {
        return $this->territoire;
    }

    public function setTerritoire(?Territoire $territoire): static
    {
        $this->territoire = $territoire;

        return $this;
    }
}