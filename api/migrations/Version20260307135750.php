<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260307135750 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE indicateur_chomage (id INT AUTO_INCREMENT NOT NULL, annee INT NOT NULL, taux DOUBLE PRECISION NOT NULL, territoire_id INT NOT NULL, INDEX IDX_26AD9374D0F97A8 (territoire_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE indicateur_vacancy (id INT AUTO_INCREMENT NOT NULL, annee INT NOT NULL, taux DOUBLE PRECISION NOT NULL, territoire_id INT NOT NULL, INDEX IDX_C053FD1AD0F97A8 (territoire_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('ALTER TABLE indicateur_chomage ADD CONSTRAINT FK_26AD9374D0F97A8 FOREIGN KEY (territoire_id) REFERENCES territoire (id)');
        $this->addSql('ALTER TABLE indicateur_vacancy ADD CONSTRAINT FK_C053FD1AD0F97A8 FOREIGN KEY (territoire_id) REFERENCES territoire (id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE indicateur_chomage DROP FOREIGN KEY FK_26AD9374D0F97A8');
        $this->addSql('ALTER TABLE indicateur_vacancy DROP FOREIGN KEY FK_C053FD1AD0F97A8');
        $this->addSql('DROP TABLE indicateur_chomage');
        $this->addSql('DROP TABLE indicateur_vacancy');
    }
}
