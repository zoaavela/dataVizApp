<?php

namespace App\Controller;

use App\Repository\IndicateurEconomieRepository;
use App\Repository\IndicateurDemographieRepository;
use App\Repository\IndicateurUrbanismeRepository;
use App\Repository\IndicateurEnergieRepository;
use App\Repository\IndicateurLogementRepository;
use App\Repository\TerritoireRepository;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/territoires')]
class TerritoireController extends AbstractController
{
    // --- MODULE 1 : Économie (On demande au spécialiste Éco) ---
    #[Route('/quadrant', name: 'api_quadrant', methods: ['GET'])]
    public function quadrant(IndicateurEconomieRepository $repo): JsonResponse
    {
        // On récupère les indicateurs (qui contiennent le territoire)
        return $this->json($repo->findAll(), 200, [], ['groups' => ['module:quadrant']]);
    }

    // --- MODULE 2 : Démographie (On demande au spécialiste Démo) ---
    #[Route('/age', name: 'api_age', methods: ['GET'])]
    public function age(IndicateurDemographieRepository $repo): JsonResponse
    {
        return $this->json($repo->findAll(), 200, [], ['groups' => ['module:age']]);
    }

    // --- MODULE 3 : Urbanisme (On demande au spécialiste Urba) ---
    #[Route('/beton', name: 'api_beton', methods: ['GET'])]
    public function beton(IndicateurUrbanismeRepository $repo): JsonResponse
    {
        return $this->json($repo->findAll(), 200, [], ['groups' => ['module:beton']]);
    }

    // --- MODULE 5 : Énergie ---
    #[Route('/thermique', name: 'api_thermique', methods: ['GET'])]
    public function thermique(IndicateurEnergieRepository $repo): JsonResponse
    {
        return $this->json($repo->findAll(), 200, [], ['groups' => ['module:thermique']]);
    }

    // --- MODULE 6 : Logement ---
    #[Route('/logement', name: 'api_logement', methods: ['GET'])]
    public function logement(IndicateurLogementRepository $repo): JsonResponse
    {
        return $this->json($repo->findAll(), 200, [], ['groups' => ['module:logement']]);
    }

    // --- CARTE : Ici on garde TerritoireRepository car c'est la base géographique ---
    #[Route('/carte', name: 'api_carte', methods: ['GET'])]
    public function carte(TerritoireRepository $repo): JsonResponse
    {
        return $this->json($repo->findAll(), 200, [], ['groups' => ['module:carte']]);
    }
}