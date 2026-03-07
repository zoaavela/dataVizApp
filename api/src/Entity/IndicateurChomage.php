<?php

namespace App\Entity;

use App\Repository\IndicateurChomageRepository;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Attribute\Groups;

#[ORM\Entity(repositoryClass: IndicateurChomageRepository::class)]
class IndicateurChomage
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['module:chomage'])]
    private ?int $id = null;

    #[ORM\Column]
    #[Groups(['module:chomage'])]
    private ?int $annee = null;

    #[ORM\Column]
    #[Groups(['module:chomage'])]
    private ?float $taux = null;

    #[ORM\ManyToOne(inversedBy: 'indicateurChomages')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['module:chomage'])]
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

    public function getTaux(): ?float
    {
        return $this->taux;
    }

    public function setTaux(float $taux): static
    {
        $this->taux = $taux;

        return $this;
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
