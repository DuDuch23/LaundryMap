<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260630073514 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE laverie ADD site_web VARCHAR(255) DEFAULT NULL, ADD facebook VARCHAR(255) DEFAULT NULL, ADD instagram VARCHAR(255) DEFAULT NULL, ADD twitter VARCHAR(255) DEFAULT NULL, ADD linkedin VARCHAR(255) DEFAULT NULL');
        $this->addSql('ALTER TABLE laverie_note_signalement CHANGE cible cible VARCHAR(20) NOT NULL');
        $this->addSql('ALTER TABLE professionnel DROP FOREIGN KEY `FK_7A28C10F2AA08659`');
        $this->addSql('DROP INDEX idx_5e9e89cb8a1b7c6a ON professionnel');
        $this->addSql('CREATE INDEX IDX_7A28C10F2AA08659 ON professionnel (photo_profil_id)');
        $this->addSql('ALTER TABLE professionnel ADD CONSTRAINT `FK_7A28C10F2AA08659` FOREIGN KEY (photo_profil_id) REFERENCES media (id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE laverie DROP site_web, DROP facebook, DROP instagram, DROP twitter, DROP linkedin');
        $this->addSql('ALTER TABLE laverie_note_signalement CHANGE cible cible VARCHAR(20) DEFAULT \'commentaire\' NOT NULL');
        $this->addSql('ALTER TABLE professionnel DROP FOREIGN KEY FK_7A28C10F2AA08659');
        $this->addSql('DROP INDEX idx_7a28c10f2aa08659 ON professionnel');
        $this->addSql('CREATE INDEX IDX_5E9E89CB8A1B7C6A ON professionnel (photo_profil_id)');
        $this->addSql('ALTER TABLE professionnel ADD CONSTRAINT FK_7A28C10F2AA08659 FOREIGN KEY (photo_profil_id) REFERENCES media (id)');
    }
}
