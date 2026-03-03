<?php

namespace App\Controller;

use App\Entity\Territoire;
use App\Entity\IndicateurEconomie;
use App\Entity\IndicateurDemographie;
use App\Entity\IndicateurUrbanisme;
use App\Entity\IndicateurEnergie;
use App\Entity\IndicateurLogement;
use App\Repository\TerritoireRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/admin')]
#[IsGranted('ROLE_ADMIN', message: 'Accès réservé aux administrateurs')]
class AdminController extends AbstractController
{
    #[Route('/import', name: 'api_admin_import', methods: ['POST'])]
    public function import(Request $request, EntityManagerInterface $em, TerritoireRepository $territoireRepo): JsonResponse
    {
        ini_set('memory_limit', '1024M');
        set_time_limit(0);

        try {
            $file = $request->files->get('file');

            if (!$file || !$file->isValid()) {
                return $this->json(['error' => 'Erreur fichier'], 400);
            }

            // --- PLUS DE SUPPRESSION (DELETE) ICI --- 
            // On passe directement à la lecture pour faire du "Mise à jour ou Création"

            if (($handle = fopen($file->getPathname(), "r")) !== FALSE) {

                // Détection séparateur
                $firstLine = fgets($handle);
                rewind($handle);
                $separator = (strpos($firstLine, ';') !== false) ? ';' : ',';
                fgetcsv($handle, 0, $separator); // Saut en-tête

                $count = 0;
                $newCount = 0;
                $updateCount = 0;

                while (($row = fgetcsv($handle, 0, $separator)) !== FALSE) {
                    if (count($row) < 5)
                        continue;

                    $codeDept = $row[1] ?? '';
                    if (empty($codeDept))
                        continue;

                    // 1. RECHERCHE INTELLIGENTE
                    // On cherche si le territoire existe déjà par son code
                    $t = $territoireRepo->findOneBy(['code' => $codeDept]);

                    if ($t) {
                        // IL EXISTE : On passe en mode MISE À JOUR
                        $updateCount++;
                    } else {
                        // IL N'EXISTE PAS : On crée un nouveau
                        $t = new Territoire();
                        $t->setCode($codeDept);
                        $newCount++;
                    }

                    // 2. MISE A JOUR DES DONNÉES (Qu'il soit neuf ou ancien)
                    $t->setNom($row[2] ?? 'Inconnu');
                    $t->setRegion($row[4] ?? '');

                    // Geom (Si présent dans le CSV, on met à jour, sinon on garde l'ancien)
                    if (!empty($row[30])) {
                        $t->setGeom($row[30]);
                    }

                    // GPS
                    if (!empty($row[31])) {
                        $cleanGps = str_replace(['"', ' '], '', $row[31]);
                        $parts = explode(',', $cleanGps);
                        if (count($parts) >= 2) {
                            $t->setLat((float) $parts[0]);
                            $t->setLng((float) $parts[1]);
                        }
                    }

                    $em->persist($t); // Doctrine gère tout seul si c'est un INSERT ou un UPDATE

                    // 3. GESTION DES INDICATEURS (Relations)
                    $annee = isset($row[0]) ? (int) $row[0] : 2023;
                    $this->updateIndic($em, $t, $annee, $row);

                    $count++;
                    if ($count % 50 === 0) {
                        $em->flush();
                        $em->clear();
                    }
                }
                fclose($handle);
                $em->flush();

                return $this->json([
                    'message' => "Import terminé !",
                    'details' => [
                        'total_traite' => $count,
                        'nouveaux' => $newCount,
                        'mis_a_jour' => $updateCount
                    ]
                ]);
            }

            return $this->json(['error' => 'Erreur lecture fichier'], 500);

        } catch (\Throwable $e) {
            return $this->json(['error' => $e->getMessage(), 'line' => $e->getLine()], 500);
        }
    }

    // --- Helpers Intelligents ---

    private function updateIndic($em, $t, $annee, $row)
    {
        // --- ECONOMIE ---
        // On récupère l'existant OU on en crée un nouveau
        $eco = $t->getEconomie() ?? new IndicateurEconomie();
        $eco->setTerritoire($t)->setAnnee($annee)
            ->setSoldeMigratoire($this->toFloat($row[9]))
            ->setTauxPauvrete($this->toFloat($row[13]));
        $em->persist($eco);

        // --- DEMOGRAPHIE ---
        $demo = $t->getDemographie() ?? new IndicateurDemographie();
        $demo->setTerritoire($t)->setAnnee($annee)
            ->setPartJeunes($this->toFloat($row[10]))
            ->setPartSeniors($this->toFloat($row[11]));
        $em->persist($demo);

        // --- URBANISME ---
        $urba = $t->getUrbanisme() ?? new IndicateurUrbanisme();
        $urba->setTerritoire($t)->setAnnee($annee)
            ->setRangPop((int) $this->toFloat($row[5]))
            ->setRangConst((int) $this->toFloat($row[19]));
        $em->persist($urba);

        // --- ENERGIE ---
        $nrj = $t->getEnergie() ?? new IndicateurEnergie();
        $nrj->setTerritoire($t)->setAnnee($annee)
            ->setAgeMoyenParc($this->toFloat($row[28]))
            ->setTauxPassoires($this->toFloat($row[29]));
        $em->persist($nrj);

        // --- LOGEMENT ---
        $log = $t->getLogement() ?? new IndicateurLogement();
        $log->setTerritoire($t)->setAnnee($annee)
            ->setTauxHlm($this->toFloat($row[16]))
            ->setStockHlm((int) $this->toFloat($row[21]));
        $em->persist($log);
    }

    private function toFloat($val): float
    {
        return (float) str_replace(',', '.', $val ?? '0');
    }
}