<?php

namespace App\Entity;

use App\Repository\TerritoireRepository;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Attribute\Groups; // Correct pour Symfony 7+ (Annotation n'existe plus)

#[ORM\Entity(repositoryClass: TerritoireRepository::class)]
class Territoire
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['territoire:read', 'module:quadrant', 'module:age', 'module:beton', 'module:thermique', 'module:logement', 'module:carte'])]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    #[Groups(['territoire:read', 'module:quadrant', 'module:age', 'module:beton', 'module:thermique', 'module:logement', 'module:carte'])]
    private ?string $nom = null;

    #[ORM\Column(length: 5)]
    #[Groups(['territoire:read', 'module:quadrant'])]
    private ?string $code = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(['module:quadrant', 'module:carte'])]
    private ?string $region = null;

    // --- COORDONNÉES GPS (Points) ---
    #[ORM\Column(nullable: true)]
    #[Groups(['module:carte'])]
    private ?float $lat = null;

    #[ORM\Column(nullable: true)]
    #[Groups(['module:carte'])]
    private ?float $lng = null;

    // --- GEOMÉTRIE (Frontières) ---
    // Type 'text' pour stocker le JSON lourd sans complexité
    #[ORM\Column(type: 'text', nullable: true)]
    #[Groups(['module:carte'])]
    private ?string $geom = null;

    // --- RELATIONS (Bidirectionnelles) ---

    #[ORM\OneToOne(mappedBy: 'territoire', cascade: ['persist', 'remove'])]
    #[Groups(['module:quadrant'])]
    private ?IndicateurEconomie $economie = null;

    #[ORM\OneToOne(mappedBy: 'territoire', cascade: ['persist', 'remove'])]
    #[Groups(['module:age'])]
    private ?IndicateurDemographie $demographie = null;

    #[ORM\OneToOne(mappedBy: 'territoire', cascade: ['persist', 'remove'])]
    #[Groups(['module:beton'])]
    private ?IndicateurUrbanisme $urbanisme = null;

    #[ORM\OneToOne(mappedBy: 'territoire', cascade: ['persist', 'remove'])]
    #[Groups(['module:thermique'])]
    private ?IndicateurEnergie $energie = null;

    #[ORM\OneToOne(mappedBy: 'territoire', cascade: ['persist', 'remove'])]
    #[Groups(['module:logement', 'module:carte'])]
    private ?IndicateurLogement $logement = null;

    // --- GETTERS & SETTERS ---

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getNom(): ?string
    {
        return $this->nom;
    }
    public function setNom(string $nom): static
    {
        $this->nom = $nom;
        return $this;
    }

    public function getCode(): ?string
    {
        return $this->code;
    }
    public function setCode(string $code): static
    {
        $this->code = $code;
        return $this;
    }

    public function getRegion(): ?string
    {
        return $this->region;
    }
    public function setRegion(?string $region): static
    {
        $this->region = $region;
        return $this;
    }

    public function getLat(): ?float
    {
        return $this->lat;
    }
    public function setLat(?float $lat): static
    {
        $this->lat = $lat;
        return $this;
    }

    public function getLng(): ?float
    {
        return $this->lng;
    }
    public function setLng(?float $lng): static
    {
        $this->lng = $lng;
        return $this;
    }

    public function getGeom(): ?string
    {
        return $this->geom;
    }
    public function setGeom(?string $geom): static
    {
        $this->geom = $geom;
        return $this;
    }

    public function getEconomie(): ?IndicateurEconomie
    {
        return $this->economie;
    }
    public function setEconomie(?IndicateurEconomie $economie): static
    {
        if ($economie === null && $this->economie !== null) {
            $this->economie->setTerritoire(null);
        }
        if ($economie !== null && $economie->getTerritoire() !== $this) {
            $economie->setTerritoire($this);
        }
        $this->economie = $economie;
        return $this;
    }

    public function getDemographie(): ?IndicateurDemographie
    {
        return $this->demographie;
    }
    public function setDemographie(?IndicateurDemographie $demographie): static
    {
        if ($demographie === null && $this->demographie !== null) {
            $this->demographie->setTerritoire(null);
        }
        if ($demographie !== null && $demographie->getTerritoire() !== $this) {
            $demographie->setTerritoire($this);
        }
        $this->demographie = $demographie;
        return $this;
    }

    public function getUrbanisme(): ?IndicateurUrbanisme
    {
        return $this->urbanisme;
    }
    public function setUrbanisme(?IndicateurUrbanisme $urbanisme): static
    {
        if ($urbanisme === null && $this->urbanisme !== null) {
            $this->urbanisme->setTerritoire(null);
        }
        if ($urbanisme !== null && $urbanisme->getTerritoire() !== $this) {
            $urbanisme->setTerritoire($this);
        }
        $this->urbanisme = $urbanisme;
        return $this;
    }

    public function getEnergie(): ?IndicateurEnergie
    {
        return $this->energie;
    }
    public function setEnergie(?IndicateurEnergie $energie): static
    {
        if ($energie === null && $this->energie !== null) {
            $this->energie->setTerritoire(null);
        }
        if ($energie !== null && $energie->getTerritoire() !== $this) {
            $energie->setTerritoire($this);
        }
        $this->energie = $energie;
        return $this;
    }

    public function getLogement(): ?IndicateurLogement
    {
        return $this->logement;
    }
    public function setLogement(?IndicateurLogement $logement): static
    {
        if ($logement === null && $this->logement !== null) {
            $this->logement->setTerritoire(null);
        }
        if ($logement !== null && $logement->getTerritoire() !== $this) {
            $logement->setTerritoire($this);
        }
        $this->logement = $logement;
        return $this;
    }
}