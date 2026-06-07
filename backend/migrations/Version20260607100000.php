<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260607100000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Ajoute banni_jusqua et banni_motif sur utilisateur pour le blocage temporaire/définitif (US37)';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE utilisateur ADD banni_jusqua DATETIME DEFAULT NULL, ADD banni_motif VARCHAR(255) DEFAULT NULL');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE utilisateur DROP banni_jusqua, DROP banni_motif');
    }
}
