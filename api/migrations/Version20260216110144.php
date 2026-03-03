<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260216110144 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE indicateur_demographie (id INT AUTO_INCREMENT NOT NULL, annee INT NOT NULL, part_jeunes DOUBLE PRECISION DEFAULT NULL, part_seniors DOUBLE PRECISION DEFAULT NULL, territoire_id INT NOT NULL, UNIQUE INDEX UNIQ_22A96700D0F97A8 (territoire_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE indicateur_economie (id INT AUTO_INCREMENT NOT NULL, annee INT NOT NULL, taux_pauvrete DOUBLE PRECISION DEFAULT NULL, solde_migratoire DOUBLE PRECISION DEFAULT NULL, territoire_id INT NOT NULL, UNIQUE INDEX UNIQ_7AA1F8A8D0F97A8 (territoire_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE indicateur_energie (id INT AUTO_INCREMENT NOT NULL, annee INT NOT NULL, age_moyen_parc DOUBLE PRECISION DEFAULT NULL, taux_passoires DOUBLE PRECISION DEFAULT NULL, territoire_id INT NOT NULL, UNIQUE INDEX UNIQ_4BE04B07D0F97A8 (territoire_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE indicateur_logement (id INT AUTO_INCREMENT NOT NULL, annee INT NOT NULL, stock_hlm INT DEFAULT NULL, taux_hlm DOUBLE PRECISION DEFAULT NULL, territoire_id INT NOT NULL, UNIQUE INDEX UNIQ_B826158DD0F97A8 (territoire_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE indicateur_urbanisme (id INT AUTO_INCREMENT NOT NULL, annee INT NOT NULL, rang_pop INT DEFAULT NULL, rang_const INT DEFAULT NULL, territoire_id INT NOT NULL, UNIQUE INDEX UNIQ_D09742E0D0F97A8 (territoire_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE territoire (id INT AUTO_INCREMENT NOT NULL, nom VARCHAR(255) NOT NULL, code VARCHAR(5) NOT NULL, region VARCHAR(255) DEFAULT NULL, lat DOUBLE PRECISION DEFAULT NULL, lng DOUBLE PRECISION DEFAULT NULL, PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE messenger_messages (id BIGINT AUTO_INCREMENT NOT NULL, body LONGTEXT NOT NULL, headers LONGTEXT NOT NULL, queue_name VARCHAR(190) NOT NULL, created_at DATETIME NOT NULL, available_at DATETIME NOT NULL, delivered_at DATETIME DEFAULT NULL, INDEX IDX_75EA56E0FB7336F0E3BD61CE16BA31DBBF396750 (queue_name, available_at, delivered_at, id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('ALTER TABLE indicateur_demographie ADD CONSTRAINT FK_22A96700D0F97A8 FOREIGN KEY (territoire_id) REFERENCES territoire (id)');
        $this->addSql('ALTER TABLE indicateur_economie ADD CONSTRAINT FK_7AA1F8A8D0F97A8 FOREIGN KEY (territoire_id) REFERENCES territoire (id)');
        $this->addSql('ALTER TABLE indicateur_energie ADD CONSTRAINT FK_4BE04B07D0F97A8 FOREIGN KEY (territoire_id) REFERENCES territoire (id)');
        $this->addSql('ALTER TABLE indicateur_logement ADD CONSTRAINT FK_B826158DD0F97A8 FOREIGN KEY (territoire_id) REFERENCES territoire (id)');
        $this->addSql('ALTER TABLE indicateur_urbanisme ADD CONSTRAINT FK_D09742E0D0F97A8 FOREIGN KEY (territoire_id) REFERENCES territoire (id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE indicateur_demographie DROP FOREIGN KEY FK_22A96700D0F97A8');
        $this->addSql('ALTER TABLE indicateur_economie DROP FOREIGN KEY FK_7AA1F8A8D0F97A8');
        $this->addSql('ALTER TABLE indicateur_energie DROP FOREIGN KEY FK_4BE04B07D0F97A8');
        $this->addSql('ALTER TABLE indicateur_logement DROP FOREIGN KEY FK_B826158DD0F97A8');
        $this->addSql('ALTER TABLE indicateur_urbanisme DROP FOREIGN KEY FK_D09742E0D0F97A8');
        $this->addSql('DROP TABLE indicateur_demographie');
        $this->addSql('DROP TABLE indicateur_economie');
        $this->addSql('DROP TABLE indicateur_energie');
        $this->addSql('DROP TABLE indicateur_logement');
        $this->addSql('DROP TABLE indicateur_urbanisme');
        $this->addSql('DROP TABLE territoire');
        $this->addSql('DROP TABLE messenger_messages');
    }
}
