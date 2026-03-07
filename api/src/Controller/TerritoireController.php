<?php

namespace App\Controller;

use App\Repository\IndicateurEconomieRepository;
use App\Repository\IndicateurDemographieRepository;
use App\Repository\IndicateurUrbanismeRepository;
use App\Repository\IndicateurEnergieRepository;
use App\Repository\IndicateurLogementRepository;
use App\Repository\TerritoireRepository;
use App\Repository\IndicateurChomageRepository;
use App\Repository\IndicateurVacancyRepository;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/territoires')]
class TerritoireController extends AbstractController
{
    // --- MODULE 1 : Économie ---
    #[Route('/quadrant', name: 'api_quadrant', methods: ['GET'])]
    public function quadrant(IndicateurEconomieRepository $repo): JsonResponse
    {
        return $this->json($repo->findAll(), 200, [], ['groups' => ['module:quadrant']]);
    }

    // --- MODULE 2 : Démographie ---
    #[Route('/age', name: 'api_age', methods: ['GET'])]
    public function age(IndicateurDemographieRepository $repo): JsonResponse
    {
        return $this->json($repo->findAll(), 200, [], ['groups' => ['module:age']]);
    }

    // --- MODULE 3 : Énergie ---
    #[Route('/thermique', name: 'api_thermique', methods: ['GET'])]
    public function thermique(IndicateurEnergieRepository $repo): JsonResponse
    {
        return $this->json($repo->findAll(), 200, [], ['groups' => ['module:thermique']]);
    }

    // --- MODULE 4 : Logement ---
    #[Route('/logement', name: 'api_logement', methods: ['GET'])]
    public function logement(IndicateurLogementRepository $repo): JsonResponse
    {
        return $this->json($repo->findAll(), 200, [], ['groups' => ['module:logement']]);
    }

    // --- CARTE : TerritoireRepository ---
    #[Route('/carte', name: 'api_carte', methods: ['GET'])]
    public function carte(TerritoireRepository $repo): JsonResponse
    {
        return $this->json($repo->findAll(), 200, [], ['groups' => ['module:carte']]);
    }

    // --- MODULE 5 : CHÔMAGE ---
    #[Route('/chomage', name: 'api_chomage', methods: ['GET'])]
    public function chomage(IndicateurChomageRepository $repo): JsonResponse
    {
        return $this->json($repo->findAll(), 200, [], ['groups' => ['module:chomage']]);
    }

    // --- MODULE 6 : VACANCY ---
    #[Route('/vacancy', name: 'api_vacancy', methods: ['GET'])]
    public function vacancy(IndicateurVacancyRepository $repo): JsonResponse
    {
        return $this->json($repo->findAll(), 200, [], ['groups' => ['module:vacancy']]);
    }
}