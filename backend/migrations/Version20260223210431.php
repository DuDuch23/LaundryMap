<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260223210431 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE administrateur (id INT AUTO_INCREMENT NOT NULL, email VARCHAR(255) NOT NULL, mot_de_passe VARCHAR(255) NOT NULL, PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE adresse (id INT AUTO_INCREMENT NOT NULL, adresse VARCHAR(255) NOT NULL, rue VARCHAR(255) NOT NULL, code_postal INT NOT NULL, ville VARCHAR(255) NOT NULL, pays VARCHAR(255) NOT NULL, latitude DOUBLE PRECISION DEFAULT NULL, longitude DOUBLE PRECISION DEFAULT NULL, statut_geolocalisation VARCHAR(255) NOT NULL, PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE langue (id INT AUTO_INCREMENT NOT NULL, nom VARCHAR(255) NOT NULL, code VARCHAR(2) NOT NULL, PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE laverie (id INT AUTO_INCREMENT NOT NULL, statut VARCHAR(255) NOT NULL, wi_line_reference INT DEFAULT NULL, nom_etablissement VARCHAR(255) NOT NULL, contact_email VARCHAR(255) DEFAULT NULL, description LONGTEXT DEFAULT NULL, date_ajout DATETIME NOT NULL, date_modification DATETIME NOT NULL, supprimee_le DATETIME DEFAULT NULL, professionnel_id INT NOT NULL, adresse_id INT NOT NULL, logo_id INT DEFAULT NULL, INDEX IDX_B62ACE498A49CC82 (professionnel_id), INDEX IDX_B62ACE494DE7DC5C (adresse_id), INDEX IDX_B62ACE49F98F144A (logo_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE laverie_equipement (id INT AUTO_INCREMENT NOT NULL, equipement_reference INT DEFAULT NULL, nom VARCHAR(255) NOT NULL, type VARCHAR(255) NOT NULL, capacite INT NOT NULL, tarif DOUBLE PRECISION NOT NULL, duree INT NOT NULL, laverie_id INT NOT NULL, INDEX IDX_17CAF8EE97C840DF (laverie_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE laverie_favori (laverie_id INT NOT NULL, utilisateur_id INT NOT NULL, INDEX IDX_5FAF2CC297C840DF (laverie_id), INDEX IDX_5FAF2CC2FB88E14F (utilisateur_id), PRIMARY KEY (laverie_id, utilisateur_id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE laverie_fermeture (id INT AUTO_INCREMENT NOT NULL, jour VARCHAR(255) NOT NULL, date_ajout DATETIME NOT NULL, date_modification DATETIME NOT NULL, heure_debut TIME NOT NULL, heure_fin TIME NOT NULL, laverie_id INT NOT NULL, INDEX IDX_2DA7259E97C840DF (laverie_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE laverie_fermeture_exceptionnelle (id INT AUTO_INCREMENT NOT NULL, date_debut DATETIME NOT NULL, date_fin DATETIME NOT NULL, raison VARCHAR(255) DEFAULT NULL, date_ajout DATETIME NOT NULL, laverie_id INT NOT NULL, INDEX IDX_99A98E2D97C840DF (laverie_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE laverie_historique_interaction (id INT AUTO_INCREMENT NOT NULL, action VARCHAR(255) NOT NULL, motif_action VARCHAR(255) NOT NULL, date DATETIME NOT NULL, administrateur_id INT NOT NULL, laverie_id INT NOT NULL, INDEX IDX_D51587DF7EE5403C (administrateur_id), INDEX IDX_D51587DF97C840DF (laverie_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE laverie_media (description VARCHAR(255) NOT NULL, laverie_id INT NOT NULL, media_id INT NOT NULL, INDEX IDX_903A8D7697C840DF (laverie_id), INDEX IDX_903A8D76EA9FDD75 (media_id), PRIMARY KEY (laverie_id, media_id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE laverie_note (id INT AUTO_INCREMENT NOT NULL, note SMALLINT DEFAULT NULL, note_le DATETIME DEFAULT NULL, commentaire VARCHAR(500) DEFAULT NULL, commente_le DATETIME DEFAULT NULL, reponse VARCHAR(500) DEFAULT NULL, repondu_le DATETIME DEFAULT NULL, commentaire_supprime_motif VARCHAR(255) DEFAULT NULL, commentaire_supprime_le DATETIME DEFAULT NULL, laverie_id INT NOT NULL, utilisateur_id INT NOT NULL, INDEX IDX_D6ACE30A97C840DF (laverie_id), INDEX IDX_D6ACE30AFB88E14F (utilisateur_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE laverie_note_signalement (date DATETIME NOT NULL, motif VARCHAR(255) NOT NULL, commentaire LONGTEXT DEFAULT NULL, laverie_note_id INT NOT NULL, utilisateur_id INT NOT NULL, INDEX IDX_2A911CC1C1E50FDC (laverie_note_id), INDEX IDX_2A911CC1FB88E14F (utilisateur_id), PRIMARY KEY (laverie_note_id, utilisateur_id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE laverie_paiement (paiement_id INT NOT NULL, laverie_id INT NOT NULL, INDEX IDX_255F499D2A4C4478 (paiement_id), INDEX IDX_255F499D97C840DF (laverie_id), PRIMARY KEY (paiement_id, laverie_id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE laverie_service (service_id INT NOT NULL, laverie_id INT NOT NULL, INDEX IDX_6959D5B97C840DF (laverie_id), PRIMARY KEY (service_id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE media (id INT AUTO_INCREMENT NOT NULL, emplacement VARCHAR(255) NOT NULL, nom_originel VARCHAR(255) NOT NULL, poids INT NOT NULL, mime_type VARCHAR(255) NOT NULL, PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE methode_paiement (id INT AUTO_INCREMENT NOT NULL, nom VARCHAR(255) NOT NULL, PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE mot_injurieux (id INT AUTO_INCREMENT NOT NULL, label VARCHAR(255) NOT NULL, PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE professionnel (id INT AUTO_INCREMENT NOT NULL, siren INT NOT NULL, statut VARCHAR(255) NOT NULL, date_validation DATETIME DEFAULT NULL, utilisateur_id INT NOT NULL, adresse_id INT NOT NULL, UNIQUE INDEX UNIQ_7A28C10FFB88E14F (utilisateur_id), INDEX IDX_7A28C10F4DE7DC5C (adresse_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE professionnel_historique_interaction (id INT AUTO_INCREMENT NOT NULL, action VARCHAR(255) NOT NULL, motif_action VARCHAR(255) NOT NULL, date DATETIME NOT NULL, administrateur_id INT NOT NULL, professionel_id INT NOT NULL, INDEX IDX_887428797EE5403C (administrateur_id), INDEX IDX_88742879F837D6C3 (professionel_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE service (id INT AUTO_INCREMENT NOT NULL, nom VARCHAR(255) NOT NULL, PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE utilisateur (id INT AUTO_INCREMENT NOT NULL, email VARCHAR(255) NOT NULL, nom VARCHAR(255) DEFAULT NULL, prenom VARCHAR(255) DEFAULT NULL, mot_de_passe VARCHAR(255) DEFAULT NULL, statut VARCHAR(255) NOT NULL, date_creation DATETIME DEFAULT NULL, date_modification DATETIME DEFAULT NULL, oauth_id VARCHAR(255) DEFAULT NULL, date_derniere_connexion DATETIME DEFAULT NULL, PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE utilisateur_historique_interaction (id INT AUTO_INCREMENT NOT NULL, action VARCHAR(255) NOT NULL, motif_action VARCHAR(255) NOT NULL, date DATETIME NOT NULL, administrateur_id INT NOT NULL, utilisateur_id INT NOT NULL, INDEX IDX_69250DF57EE5403C (administrateur_id), INDEX IDX_69250DF5FB88E14F (utilisateur_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE utilisateur_preference (id INT AUTO_INCREMENT NOT NULL, theme VARCHAR(255) NOT NULL, notifications TINYINT NOT NULL, utilisateur_id INT NOT NULL, langue_id INT NOT NULL, UNIQUE INDEX UNIQ_6FD17245FB88E14F (utilisateur_id), INDEX IDX_6FD172452AADBACD (langue_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('ALTER TABLE laverie ADD CONSTRAINT FK_B62ACE498A49CC82 FOREIGN KEY (professionnel_id) REFERENCES professionnel (id)');
        $this->addSql('ALTER TABLE laverie ADD CONSTRAINT FK_B62ACE494DE7DC5C FOREIGN KEY (adresse_id) REFERENCES adresse (id)');
        $this->addSql('ALTER TABLE laverie ADD CONSTRAINT FK_B62ACE49F98F144A FOREIGN KEY (logo_id) REFERENCES media (id)');
        $this->addSql('ALTER TABLE laverie_equipement ADD CONSTRAINT FK_17CAF8EE97C840DF FOREIGN KEY (laverie_id) REFERENCES laverie (id)');
        $this->addSql('ALTER TABLE laverie_favori ADD CONSTRAINT FK_5FAF2CC297C840DF FOREIGN KEY (laverie_id) REFERENCES laverie (id)');
        $this->addSql('ALTER TABLE laverie_favori ADD CONSTRAINT FK_5FAF2CC2FB88E14F FOREIGN KEY (utilisateur_id) REFERENCES utilisateur (id)');
        $this->addSql('ALTER TABLE laverie_fermeture ADD CONSTRAINT FK_2DA7259E97C840DF FOREIGN KEY (laverie_id) REFERENCES laverie (id)');
        $this->addSql('ALTER TABLE laverie_fermeture_exceptionnelle ADD CONSTRAINT FK_99A98E2D97C840DF FOREIGN KEY (laverie_id) REFERENCES laverie (id)');
        $this->addSql('ALTER TABLE laverie_historique_interaction ADD CONSTRAINT FK_D51587DF7EE5403C FOREIGN KEY (administrateur_id) REFERENCES administrateur (id)');
        $this->addSql('ALTER TABLE laverie_historique_interaction ADD CONSTRAINT FK_D51587DF97C840DF FOREIGN KEY (laverie_id) REFERENCES laverie (id)');
        $this->addSql('ALTER TABLE laverie_media ADD CONSTRAINT FK_903A8D7697C840DF FOREIGN KEY (laverie_id) REFERENCES laverie (id)');
        $this->addSql('ALTER TABLE laverie_media ADD CONSTRAINT FK_903A8D76EA9FDD75 FOREIGN KEY (media_id) REFERENCES media (id)');
        $this->addSql('ALTER TABLE laverie_note ADD CONSTRAINT FK_D6ACE30A97C840DF FOREIGN KEY (laverie_id) REFERENCES laverie (id)');
        $this->addSql('ALTER TABLE laverie_note ADD CONSTRAINT FK_D6ACE30AFB88E14F FOREIGN KEY (utilisateur_id) REFERENCES utilisateur (id)');
        $this->addSql('ALTER TABLE laverie_note_signalement ADD CONSTRAINT FK_2A911CC1C1E50FDC FOREIGN KEY (laverie_note_id) REFERENCES laverie_note (id)');
        $this->addSql('ALTER TABLE laverie_note_signalement ADD CONSTRAINT FK_2A911CC1FB88E14F FOREIGN KEY (utilisateur_id) REFERENCES utilisateur (id)');
        $this->addSql('ALTER TABLE laverie_paiement ADD CONSTRAINT FK_255F499D2A4C4478 FOREIGN KEY (paiement_id) REFERENCES methode_paiement (id)');
        $this->addSql('ALTER TABLE laverie_paiement ADD CONSTRAINT FK_255F499D97C840DF FOREIGN KEY (laverie_id) REFERENCES laverie (id)');
        $this->addSql('ALTER TABLE laverie_service ADD CONSTRAINT FK_6959D5BED5CA9E6 FOREIGN KEY (service_id) REFERENCES service (id)');
        $this->addSql('ALTER TABLE laverie_service ADD CONSTRAINT FK_6959D5B97C840DF FOREIGN KEY (laverie_id) REFERENCES laverie (id)');
        $this->addSql('ALTER TABLE professionnel ADD CONSTRAINT FK_7A28C10FFB88E14F FOREIGN KEY (utilisateur_id) REFERENCES utilisateur (id)');
        $this->addSql('ALTER TABLE professionnel ADD CONSTRAINT FK_7A28C10F4DE7DC5C FOREIGN KEY (adresse_id) REFERENCES adresse (id)');
        $this->addSql('ALTER TABLE professionnel_historique_interaction ADD CONSTRAINT FK_887428797EE5403C FOREIGN KEY (administrateur_id) REFERENCES administrateur (id)');
        $this->addSql('ALTER TABLE professionnel_historique_interaction ADD CONSTRAINT FK_88742879F837D6C3 FOREIGN KEY (professionel_id) REFERENCES professionnel (id)');
        $this->addSql('ALTER TABLE utilisateur_historique_interaction ADD CONSTRAINT FK_69250DF57EE5403C FOREIGN KEY (administrateur_id) REFERENCES administrateur (id)');
        $this->addSql('ALTER TABLE utilisateur_historique_interaction ADD CONSTRAINT FK_69250DF5FB88E14F FOREIGN KEY (utilisateur_id) REFERENCES utilisateur (id)');
        $this->addSql('ALTER TABLE utilisateur_preference ADD CONSTRAINT FK_6FD17245FB88E14F FOREIGN KEY (utilisateur_id) REFERENCES utilisateur (id)');
        $this->addSql('ALTER TABLE utilisateur_preference ADD CONSTRAINT FK_6FD172452AADBACD FOREIGN KEY (langue_id) REFERENCES langue (id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE laverie DROP FOREIGN KEY FK_B62ACE498A49CC82');
        $this->addSql('ALTER TABLE laverie DROP FOREIGN KEY FK_B62ACE494DE7DC5C');
        $this->addSql('ALTER TABLE laverie DROP FOREIGN KEY FK_B62ACE49F98F144A');
        $this->addSql('ALTER TABLE laverie_equipement DROP FOREIGN KEY FK_17CAF8EE97C840DF');
        $this->addSql('ALTER TABLE laverie_favori DROP FOREIGN KEY FK_5FAF2CC297C840DF');
        $this->addSql('ALTER TABLE laverie_favori DROP FOREIGN KEY FK_5FAF2CC2FB88E14F');
        $this->addSql('ALTER TABLE laverie_fermeture DROP FOREIGN KEY FK_2DA7259E97C840DF');
        $this->addSql('ALTER TABLE laverie_fermeture_exceptionnelle DROP FOREIGN KEY FK_99A98E2D97C840DF');
        $this->addSql('ALTER TABLE laverie_historique_interaction DROP FOREIGN KEY FK_D51587DF7EE5403C');
        $this->addSql('ALTER TABLE laverie_historique_interaction DROP FOREIGN KEY FK_D51587DF97C840DF');
        $this->addSql('ALTER TABLE laverie_media DROP FOREIGN KEY FK_903A8D7697C840DF');
        $this->addSql('ALTER TABLE laverie_media DROP FOREIGN KEY FK_903A8D76EA9FDD75');
        $this->addSql('ALTER TABLE laverie_note DROP FOREIGN KEY FK_D6ACE30A97C840DF');
        $this->addSql('ALTER TABLE laverie_note DROP FOREIGN KEY FK_D6ACE30AFB88E14F');
        $this->addSql('ALTER TABLE laverie_note_signalement DROP FOREIGN KEY FK_2A911CC1C1E50FDC');
        $this->addSql('ALTER TABLE laverie_note_signalement DROP FOREIGN KEY FK_2A911CC1FB88E14F');
        $this->addSql('ALTER TABLE laverie_paiement DROP FOREIGN KEY FK_255F499D2A4C4478');
        $this->addSql('ALTER TABLE laverie_paiement DROP FOREIGN KEY FK_255F499D97C840DF');
        $this->addSql('ALTER TABLE laverie_service DROP FOREIGN KEY FK_6959D5BED5CA9E6');
        $this->addSql('ALTER TABLE laverie_service DROP FOREIGN KEY FK_6959D5B97C840DF');
        $this->addSql('ALTER TABLE professionnel DROP FOREIGN KEY FK_7A28C10FFB88E14F');
        $this->addSql('ALTER TABLE professionnel DROP FOREIGN KEY FK_7A28C10F4DE7DC5C');
        $this->addSql('ALTER TABLE professionnel_historique_interaction DROP FOREIGN KEY FK_887428797EE5403C');
        $this->addSql('ALTER TABLE professionnel_historique_interaction DROP FOREIGN KEY FK_88742879F837D6C3');
        $this->addSql('ALTER TABLE utilisateur_historique_interaction DROP FOREIGN KEY FK_69250DF57EE5403C');
        $this->addSql('ALTER TABLE utilisateur_historique_interaction DROP FOREIGN KEY FK_69250DF5FB88E14F');
        $this->addSql('ALTER TABLE utilisateur_preference DROP FOREIGN KEY FK_6FD17245FB88E14F');
        $this->addSql('ALTER TABLE utilisateur_preference DROP FOREIGN KEY FK_6FD172452AADBACD');
        $this->addSql('DROP TABLE administrateur');
        $this->addSql('DROP TABLE adresse');
        $this->addSql('DROP TABLE langue');
        $this->addSql('DROP TABLE laverie');
        $this->addSql('DROP TABLE laverie_equipement');
        $this->addSql('DROP TABLE laverie_favori');
        $this->addSql('DROP TABLE laverie_fermeture');
        $this->addSql('DROP TABLE laverie_fermeture_exceptionnelle');
        $this->addSql('DROP TABLE laverie_historique_interaction');
        $this->addSql('DROP TABLE laverie_media');
        $this->addSql('DROP TABLE laverie_note');
        $this->addSql('DROP TABLE laverie_note_signalement');
        $this->addSql('DROP TABLE laverie_paiement');
        $this->addSql('DROP TABLE laverie_service');
        $this->addSql('DROP TABLE media');
        $this->addSql('DROP TABLE methode_paiement');
        $this->addSql('DROP TABLE mot_injurieux');
        $this->addSql('DROP TABLE professionnel');
        $this->addSql('DROP TABLE professionnel_historique_interaction');
        $this->addSql('DROP TABLE service');
        $this->addSql('DROP TABLE utilisateur');
        $this->addSql('DROP TABLE utilisateur_historique_interaction');
        $this->addSql('DROP TABLE utilisateur_preference');
    }
}
