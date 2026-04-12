<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260412000100 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Ajout de la photo de profil pour les professionnels';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE professionnel ADD photo_profil_id INT DEFAULT NULL');
        $this->addSql('CREATE INDEX IDX_5E9E89CB8A1B7C6A ON professionnel (photo_profil_id)');
        $this->addSql('ALTER TABLE professionnel ADD CONSTRAINT FK_5E9E89CB8A1B7C6A FOREIGN KEY (photo_profil_id) REFERENCES media (id) ON DELETE SET NULL');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE professionnel DROP FOREIGN KEY FK_5E9E89CB8A1B7C6A');
        $this->addSql('DROP INDEX IDX_5E9E89CB8A1B7C6A ON professionnel');
        $this->addSql('ALTER TABLE professionnel DROP photo_profil_id');
    }
}
