<?php

namespace App\Command;

use App\Entity\Territoire;
use App\Entity\IndicateurEconomie;
use App\Entity\IndicateurDemographie;
use App\Entity\IndicateurUrbanisme;
use App\Entity\IndicateurEnergie;
use App\Entity\IndicateurLogement;
use App\Entity\IndicateurChomage;
use App\Entity\IndicateurVacancy;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

#[AsCommand(
    name: 'app:import-csv',
    description: 'Importe les données depuis import.csv (efface les anciennes données)',
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

        // --- PURGE DE LA BASE DE DONNÉES ---
        $io->text("Nettoyage des anciennes données en cours...");
        $connection = $this->em->getConnection();
        $platform = $connection->getDatabasePlatform();

        // Désactive la vérification des clés étrangères pour pouvoir vider les tables
        $connection->executeStatement('SET FOREIGN_KEY_CHECKS=0');

        $tables = [
            'indicateur_economie',
            'indicateur_demographie',
            'indicateur_energie',
            'indicateur_logement',
            'indicateur_chomage',
            'indicateur_vacancy',
            'territoire'
        ];

        foreach ($tables as $table) {
            $connection->executeStatement($platform->getTruncateTableSQL($table, true));
        }
        $connection->executeStatement('SET FOREIGN_KEY_CHECKS=1');
        $io->success("Base de données vidée !");
        // ------------------------------------

        if (($handle = fopen($file, "r")) !== FALSE) {
            $io->title("Lancement de l'importation...");

            // On saute la ligne d'en-tête
            fgetcsv($handle, 1000, ",");

            $count = 0;
            while (($row = fgetcsv($handle, 5000, ",")) !== FALSE) {
                if (empty($row[0]))
                    continue;

                $annee = (int) $row[0];

                // --- 1. TERRITOIRE ---
                $t = new Territoire();
                $t->setNom($row[2]);
                $t->setCode($row[1]);
                $t->setRegion($row[4]);

                if (!empty($row[31])) {
                    $centroid = json_decode($row[31], true);
                    if ($centroid && isset($centroid['coordinates'])) {
                        $t->setLng($centroid['coordinates'][0]);
                        $t->setLat($centroid['coordinates'][1]);
                    }
                }
                $this->em->persist($t);

                // --- 2. ÉCONOMIE ---
                $eco = new IndicateurEconomie();
                $eco->setAnnee($annee);
                $eco->setTauxPauvrete($this->toFloat($row[13]));
                $eco->setSoldeMigratoire($this->toFloat($row[9]));
                $eco->setTerritoire($t);
                $this->em->persist($eco);

                // --- 3. DÉMOGRAPHIE ---
                $demo = new IndicateurDemographie();
                $demo->setAnnee($annee);
                $demo->setPartJeunes($this->toFloat($row[10]));
                $demo->setPartSeniors($this->toFloat($row[11]));
                $demo->setTerritoire($t);
                $this->em->persist($demo);

                // --- 4. ÉNERGIE ---
                $nrj = new IndicateurEnergie();
                $nrj->setAnnee($annee);
                $nrj->setAgeMoyenParc($this->toFloat($row[28]));
                $nrj->setTauxPassoires($this->toFloat($row[29]));
                $nrj->setTerritoire($t);
                $this->em->persist($nrj);

                // --- 5. LOGEMENT ---
                $log = new IndicateurLogement();
                $log->setAnnee($annee);
                $log->setStockHlm((int) $this->toFloat($row[21]));
                $log->setTauxHlm($this->toFloat($row[16]));
                $log->setTerritoire($t);
                $this->em->persist($log);

                // --- 6. CHOMAGE ---
                $chom = new IndicateurChomage();
                $chom->setAnnee($annee);
                $chom->setTaux($this->toFloat($row[12]));
                $chom->setTerritoire($t);
                $this->em->persist($chom);

                // --- 7. VACANCY (C'EST ICI QUE CA SE PASSE !) ---
                $vac = new IndicateurVacancy();
                $vac->setAnnee($annee);
                $vac->setTaux($this->toFloat($row[17]));
                $vac->setNombreLogements((int) $this->toFloat($row[14]));
                $vac->setNombreResidencesPrincipales((int) $this->toFloat($row[15]));
                $vac->setTerritoire($t);
                $this->em->persist($vac);

                $count++;
            }
            fclose($handle);

            $this->em->flush();
            $io->success("$count territoires importés avec succès ! La base est désormais parfaitement à jour.");
            return Command::SUCCESS;
        }
        return Command::FAILURE;
    }

    private function toFloat($val): float
    {
        if (empty($val))
            return 0.0;
        $val = str_replace(',', '.', $val);
        return (float) $val;
    }
}