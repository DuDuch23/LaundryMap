<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260630120000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Création de la table laverie_reseau_social (liens réseaux sociaux d\'une laverie, un seul par type)';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('CREATE TABLE laverie_reseau_social (
            id INT AUTO_INCREMENT NOT NULL,
            laverie_id INT NOT NULL,
            type VARCHAR(255) NOT NULL,
            url VARCHAR(2048) NOT NULL,
            UNIQUE INDEX uniq_laverie_type (laverie_id, type),
            INDEX IDX_LAVERIE_RESEAU_SOCIAL_LAVERIE (laverie_id),
            PRIMARY KEY(id)
        ) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');

        $this->addSql('ALTER TABLE laverie_reseau_social ADD CONSTRAINT FK_LAVERIE_RESEAU_SOCIAL_LAVERIE FOREIGN KEY (laverie_id) REFERENCES laverie (id)');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE laverie_reseau_social DROP FOREIGN KEY FK_LAVERIE_RESEAU_SOCIAL_LAVERIE');
        $this->addSql('DROP TABLE laverie_reseau_social');
    }
}
