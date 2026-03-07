<?php

namespace App\Entity;

use App\Repository\IndicateurVacancyRepository;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Attribute\Groups;

#[ORM\Entity(repositoryClass: IndicateurVacancyRepository::class)]
class IndicateurVacancy
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['module:vacancy'])]
    private ?int $id = null;

    #[ORM\Column]
    #[Groups(['module:vacancy'])]
    private ?int $annee = null;

    #[ORM\Column]
    #[Groups(['module:vacancy'])]
    private ?float $taux = null;

    // Ajout du total des logements
    #[ORM\Column(nullable: true)]
    #[Groups(['module:vacancy'])]
    private ?int $nombreLogements = null;

    // Ajout des résidences principales
    #[ORM\Column(nullable: true)]
    #[Groups(['module:vacancy'])]
    private ?int $nombreResidencesPrincipales = null;

    #[ORM\ManyToOne(inversedBy: 'indicateurVacancies')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['module:vacancy'])]
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

    public function getNombreLogements(): ?int
    {
        return $this->nombreLogements;
    }

    public function setNombreLogements(?int $nombreLogements): static
    {
        $this->nombreLogements = $nombreLogements;

        return $this;
    }

    public function getNombreResidencesPrincipales(): ?int
    {
        return $this->nombreResidencesPrincipales;
    }

    public function setNombreResidencesPrincipales(?int $nombreResidencesPrincipales): static
    {
        $this->nombreResidencesPrincipales = $nombreResidencesPrincipales;

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