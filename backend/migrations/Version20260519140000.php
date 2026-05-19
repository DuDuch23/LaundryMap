<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260519140000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Augmente la taille de laverie_note.commentaire de 500 à 1000 caractères';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE laverie_note MODIFY commentaire VARCHAR(1000) DEFAULT NULL');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE laverie_note MODIFY commentaire VARCHAR(500) DEFAULT NULL');
    }
}
