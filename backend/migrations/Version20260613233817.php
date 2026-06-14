<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260613233817 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Ajout du champ cible (commentaire|reponse) dans laverie_note_signalement pour permettre de signaler aussi les réponses professionnelles';
    }

    public function up(Schema $schema): void
    {
        $this->addSql("ALTER TABLE laverie_note_signalement ADD cible VARCHAR(20) NOT NULL DEFAULT 'commentaire', DROP PRIMARY KEY, ADD PRIMARY KEY (laverie_note_id, utilisateur_id, cible)");
        $this->addSql('ALTER TABLE professionnel DROP FOREIGN KEY `FK_5E9E89CB8A1B7C6A`');
        $this->addSql('ALTER TABLE professionnel ADD CONSTRAINT FK_7A28C10F2AA08659 FOREIGN KEY (photo_profil_id) REFERENCES media (id)');
        $this->addSql('ALTER TABLE professionnel RENAME INDEX idx_5e9e89cb8a1b7c6a TO IDX_7A28C10F2AA08659');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE laverie_note_signalement DROP cible, DROP PRIMARY KEY, ADD PRIMARY KEY (laverie_note_id, utilisateur_id)');
        $this->addSql('ALTER TABLE professionnel DROP FOREIGN KEY FK_7A28C10F2AA08659');
        $this->addSql('ALTER TABLE professionnel ADD CONSTRAINT `FK_5E9E89CB8A1B7C6A` FOREIGN KEY (photo_profil_id) REFERENCES media (id) ON DELETE SET NULL');
        $this->addSql('ALTER TABLE professionnel RENAME INDEX idx_7a28c10f2aa08659 TO IDX_5E9E89CB8A1B7C6A');
    }
}
