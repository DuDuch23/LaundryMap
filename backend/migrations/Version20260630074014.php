<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260630074014 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE laverie_social_media (id INT AUTO_INCREMENT NOT NULL, type VARCHAR(255) NOT NULL, url VARCHAR(2048) NOT NULL, laverie_id INT NOT NULL, INDEX IDX_1EB1CB5797C840DF (laverie_id), UNIQUE INDEX uniq_laverie_social_type (laverie_id, type), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('ALTER TABLE laverie_social_media ADD CONSTRAINT FK_1EB1CB5797C840DF FOREIGN KEY (laverie_id) REFERENCES laverie (id)');
        $this->addSql('ALTER TABLE laverie_note_signalement CHANGE cible cible VARCHAR(20) NOT NULL');
        $this->addSql('ALTER TABLE professionnel DROP FOREIGN KEY `FK_7A28C10F2AA08659`');
        $this->addSql('DROP INDEX idx_5e9e89cb8a1b7c6a ON professionnel');
        $this->addSql('CREATE INDEX IDX_7A28C10F2AA08659 ON professionnel (photo_profil_id)');
        $this->addSql('ALTER TABLE professionnel ADD CONSTRAINT `FK_7A28C10F2AA08659` FOREIGN KEY (photo_profil_id) REFERENCES media (id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE laverie_social_media DROP FOREIGN KEY FK_1EB1CB5797C840DF');
        $this->addSql('DROP TABLE laverie_social_media');
        $this->addSql('ALTER TABLE laverie_note_signalement CHANGE cible cible VARCHAR(20) DEFAULT \'commentaire\' NOT NULL');
        $this->addSql('ALTER TABLE professionnel DROP FOREIGN KEY FK_7A28C10F2AA08659');
        $this->addSql('DROP INDEX idx_7a28c10f2aa08659 ON professionnel');
        $this->addSql('CREATE INDEX IDX_5E9E89CB8A1B7C6A ON professionnel (photo_profil_id)');
        $this->addSql('ALTER TABLE professionnel ADD CONSTRAINT FK_7A28C10F2AA08659 FOREIGN KEY (photo_profil_id) REFERENCES media (id)');
    }
}
