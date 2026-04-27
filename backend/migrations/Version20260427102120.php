<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260427102120 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Fix laverie_service primary key to composite (service_id, laverie_id)';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE laverie_service DROP PRIMARY KEY, ADD PRIMARY KEY (service_id, laverie_id)');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE laverie_service DROP PRIMARY KEY, ADD PRIMARY KEY (service_id)');
    }
}
