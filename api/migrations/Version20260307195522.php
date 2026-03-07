<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260307195522 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE indicateur_urbanisme DROP FOREIGN KEY `FK_D09742E0D0F97A8`');
        $this->addSql('DROP TABLE indicateur_urbanisme');
        $this->addSql('ALTER TABLE indicateur_vacancy ADD nombre_logements INT DEFAULT NULL, ADD nombre_residences_principales INT DEFAULT NULL');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE indicateur_urbanisme (id INT AUTO_INCREMENT NOT NULL, annee INT NOT NULL, rang_pop INT DEFAULT NULL, rang_const INT DEFAULT NULL, territoire_id INT NOT NULL, UNIQUE INDEX UNIQ_D09742E0D0F97A8 (territoire_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_general_ci` ENGINE = InnoDB COMMENT = \'\' ');
        $this->addSql('ALTER TABLE indicateur_urbanisme ADD CONSTRAINT `FK_D09742E0D0F97A8` FOREIGN KEY (territoire_id) REFERENCES territoire (id)');
        $this->addSql('ALTER TABLE indicateur_vacancy DROP nombre_logements, DROP nombre_residences_principales');
    }
}
