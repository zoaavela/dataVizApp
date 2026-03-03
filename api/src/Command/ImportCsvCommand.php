<?php

namespace App\Command;

use App\Entity\Territoire;
use App\Entity\IndicateurEconomie;
use App\Entity\IndicateurDemographie;
use App\Entity\IndicateurUrbanisme;
use App\Entity\IndicateurEnergie;
use App\Entity\IndicateurLogement;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

#[AsCommand(
    name: 'app:import-csv',
    description: 'Importe les données depuis import.csv (Mapping certifié avec Geom et GPS)',
)]
class ImportCsvCommand extends Command
{
    private EntityManagerInterface $em;

    public function __construct(EntityManagerInterface $em)
    {
        parent::__construct();
        $this->em = $em;
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);
        $file = 'import.csv';

        if (!file_exists($file)) {
            $io->error('Fichier import.csv introuvable à la racine du projet !');
            return Command::FAILURE;
        }

        if (($handle = fopen($file, "r")) !== FALSE) {
            $io->title("Lancement de l'importation...");

            // On saute la ligne d'en-tête (headers)
            fgetcsv($handle, 0, ",");

            $count = 0;
            // On augmente la limite de longueur de ligne (0 = illimité) car la colonne 'geom' est très longue
            while (($row = fgetcsv($handle, 0, ",")) !== FALSE) {

                // Vérif sécurité structure basique
                if (count($row) < 30)
                    continue;

                // --- 1. TERRITOIRE (Table Mère) ---
                $t = new Territoire();
                $t->setNom($row[2]);        // Col 2 : Nom Dept
                $t->setCode($row[1]);       // Col 1 : Code Dept
                $t->setRegion($row[4]);     // Col 4 : Nom Région

                // --- A. GESTION GEOM (Colonne 30) ---
                // On stocke le JSON brut des frontières
                if (!empty($row[30])) {
                    $t->setGeom($row[30]);
                }

                // --- B. GESTION GPS (Colonne 31 : "lat, lng") ---
                if (!empty($row[31])) {
                    // On nettoie la chaîne (enlève les guillemets éventuels)
                    $cleanGps = str_replace('"', '', $row[31]);
                    $parts = explode(',', $cleanGps);

                    if (count($parts) === 2) {
                        $t->setLat((float) trim($parts[0])); // Latitude
                        $t->setLng((float) trim($parts[1])); // Longitude
                    }
                }

                $this->em->persist($t);

                $annee = (int) $row[0]; // Col 0 : Année

                // --- 2. ECONOMIE ---
                $eco = new IndicateurEconomie();
                $eco->setAnnee($annee);
                $eco->setTauxPauvrete($this->toFloat($row[13]));     // Col 13
                $eco->setSoldeMigratoire($this->toFloat($row[9]));   // Col 9
                $eco->setTerritoire($t);
                $this->em->persist($eco);

                // --- 3. DEMOGRAPHIE ---
                $demo = new IndicateurDemographie();
                $demo->setAnnee($annee);
                $demo->setPartJeunes($this->toFloat($row[10]));      // Col 10
                $demo->setPartSeniors($this->toFloat($row[11]));     // Col 11
                $demo->setTerritoire($t);
                $this->em->persist($demo);

                // --- 4. URBANISME ---
                $urba = new IndicateurUrbanisme();
                $urba->setAnnee($annee);
                $urba->setRangPop((int) $this->toFloat($row[5]));     // Col 5
                $urba->setRangConst((int) $this->toFloat($row[19]));  // Col 19
                $urba->setTerritoire($t);
                $this->em->persist($urba);

                // --- 5. ENERGIE ---
                $nrj = new IndicateurEnergie();
                $nrj->setAnnee($annee);
                // Attention : Âge moyen est souvent col 28 et Passoires col 29 ou 30 selon les versions du CSV
                // Basé sur ton fichier :
                $nrj->setAgeMoyenParc($this->toFloat($row[28]));     // Col 28 (Âge moyen)
                $nrj->setTauxPassoires($this->toFloat($row[29]));    // Col 29 (Taux énergivores)
                $nrj->setTerritoire($t);
                $this->em->persist($nrj);

                // --- 6. LOGEMENT ---
                $log = new IndicateurLogement();
                $log->setAnnee($annee);
                $log->setStockHlm((int) $this->toFloat($row[21]));    // Col 21
                $log->setTauxHlm($this->toFloat($row[16]));           // Col 16
                $log->setTerritoire($t);
                $this->em->persist($log);

                $count++;
            }
            fclose($handle);

            $this->em->flush();
            $io->success("$count territoires importés avec succès (GPS et Geom inclus) !");
            return Command::SUCCESS;
        }
        return Command::FAILURE;
    }

    private function toFloat($val): float
    {
        if (empty($val))
            return 0.0;
        // Remplace la virgule par un point pour PHP
        return (float) str_replace(',', '.', $val);
    }
}