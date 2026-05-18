# LaundryMap — Guide Claude Code

## Vue d'ensemble

Application web de recherche de laveries automatiques en France.
- **Frontend** : React 18 + TypeScript + Vite + Tailwind CSS + react-leaflet
- **Backend** : Symfony 7 + PHP 8.3 + Doctrine ORM + JWT (LexikJWT)
- **Base de données** : MariaDB 11
- **Infrastructure** : Docker Compose (db / php-fpm / nginx / frontend / phpmyadmin)

---

## Stack technique

| Couche | Technologie |
|---|---|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS |
| Carte | react-leaflet + Leaflet, OpenStreetMap / Nominatim |
| Internationalisation | react-i18next (fr / en) |
| HTTP client | axios (avec intercepteurs JWT) + fetch natif |
| Backend | Symfony 7, PHP 8.3, PHP-FPM |
| ORM | Doctrine ORM |
| Auth | JWT via LexikJWTAuthenticationBundle |
| BDD | MariaDB 11 |
| Email | Brevo (SMTP) via Symfony Mailer |
| Reverse proxy | Nginx |

---

## Lancer le projet

```bash
# Démarrer tous les services
docker compose up -d

# Accès
# Frontend  : http://localhost:5173
# API       : http://localhost:8000
# phpMyAdmin: http://localhost:8081
```

```bash
# Migrations Doctrine
docker compose exec php php bin/console doctrine:migrations:migrate

# Fixtures
docker compose exec php php bin/console doctrine:fixtures:load

# Cache Symfony
docker compose exec php php bin/console cache:clear
```

---

## Structure des dossiers

```
LaundryMap/
├── backend/                    # Symfony API
│   ├── src/
│   │   ├── Controller/Api/     # Endpoints REST
│   │   ├── Entity/             # Entités Doctrine
│   │   ├── Repository/         # Requêtes BDD
│   │   ├── Service/            # Logique métier
│   │   ├── Enum/               # Enums PHP 8.1+
│   │   ├── DTO/                # Data Transfer Objects
│   │   └── Security/           # UserChecker JWT
│   ├── config/
│   │   └── packages/security.yaml   # Firewall + access_control
│   ├── migrations/             # Migrations Doctrine
│   └── templates/emails/       # Templates Twig pour emails
│
└── frontend/                   # React / Vite
    └── src/
        ├── pages/              # Pages (Home, MesFavoris, Connexion…)
        ├── components/         # Composants réutilisables
        │   ├── map/            # LaverieMap, RecenterMap, ItineraireButton
        │   ├── laverie/        # LaverieCard, LaverieGrid, LogoUpload…
        │   ├── search/         # SearchBar, FilterPanel
        │   └── ui/             # Composants UI génériques
        ├── hooks/              # useFavorites, useLaverieSearch, useGeolocation
        ├── services/           # api.js (URL base), request.tsx (appels HTTP)
        ├── types/              # Types TypeScript
        ├── locales/fr|en/      # Traductions i18n
        └── routes/             # ProRoute, UserRoute (guards)
```

---

## Principaux endpoints API

| Méthode | Route | Auth | Description |
|---|---|---|---|
| POST | `/api/connexion` | Public | Login JWT |
| POST | `/api/inscription-utilisateur` | Public | Inscription utilisateur |
| POST | `/api/inscription-professionnel` | Public | Inscription pro |
| GET | `/api/laveries/recherche` | Public | Recherche laveries (géo + filtres) |
| GET | `/api/laveries/geocode` | Public | Autocomplétion Nominatim |
| GET | `/api/laveries/{id}` | Public | Fiche publique laverie |
| GET | `/api/profil` | Auth | Profil utilisateur connecté |
| PUT | `/api/profil` | Auth | Modifier profil |
| DELETE | `/api/profil` | Auth | Supprimer compte |
| GET | `/api/profil/favoris` | Auth (user) | Lister ses favoris |
| POST | `/api/profil/favoris/{id}` | Auth (user) | Ajouter un favori |
| DELETE | `/api/profil/favoris/{id}` | Auth (user) | Supprimer un favori |
| GET | `/api/admin/laveries` | Admin | Gestion laveries |
| POST | `/api/admin/laveries/{id}/statut` | Admin | Valider / refuser laverie |
| GET | `/api/professionnel/laveries` | Pro | Mes laveries |

---

## Rôles utilisateurs

| Rôle | Accès |
|---|---|
| Anonyme | Recherche, fiche laverie, inscription, connexion |
| `ROLE_USER` | Favoris, profil |
| `ROLE_PROFESSIONNEL` | Tableau de bord pro, gestion de ses laveries |
| `ROLE_ADMIN` | Administration complète |

Le rôle `ROLE_PROFESSIONNEL` est attribué dynamiquement si `Utilisateur.professionnel` est validé (`StatutProfessionnelEnum::STATUT_VALIDE`).

---

## Entités principales

- **Utilisateur** — compte utilisateur, avec relation 1-1 optionnelle vers Professionnel
- **Professionnel** — profil pro lié à un Utilisateur
- **Laverie** — établissement (statut, adresse, médias, horaires, équipements)
- **Adresse** — coordonnées géographiques (lat/lng) + adresse postale
- **LaverieFavori** — table de jointure composite (PK : laverie_id + utilisateur_id)
- **LaverieNote** — commentaires et notes
- **LaverieFermeture** — horaires d'ouverture par jour de la semaine
- **LaverieEquipement** — machines (type, capacité, tarif, durée)
- **LaverieMedia** — photos d'une laverie
- **Media** — fichier uploadé (emplacement, mime, poids)

### Soft-delete
Les laveries supprimées sont marquées `supprimee_le IS NOT NULL`. Tous les filtres de recherche et de favoris excluent ces laveries via cette condition.

---

## Conventions de code

### Backend (PHP/Symfony)
- Contrôleurs : `AbstractController`, attributs `#[Route]` + `#[IsGranted]`
- Retours : `JsonResponse` via `$this->json()`
- Validation utilisateur : toujours vérifier `$user instanceof Utilisateur` avant d'utiliser `$this->getUser()`
- Relations Doctrine : utiliser `addFavori()`/`removeFavori()` sur les entités (pas de setters directs)
- Repository : logique de requêtes complexes dans le repository (pas dans le contrôleur)
- Nommage snake_case pour la colonne `supprimee_le` (nom hérité de la BDD)

### Frontend (TypeScript/React)
- Appels HTTP : `request.tsx` centralise tous les appels API (axios + fetch)
- Hooks personnalisés : `hooks/` — `useFavorites`, `useLaverieSearch`, `useGeolocation`
- Traductions : toujours utiliser `t('main.section.cle')` — ajouter les clés dans `fr/translation.json` ET `en/translation.json`
- Notifications utilisateur : composant `<Notification type="success|error" message={...} />`
- Garde de routes : `<AuthRoute>` (connecté), `<UserRoute>` (utilisateur standard), `<ProRoute>` (pro), `<RequireAdmin>` (admin)
- JWT côté client : ne jamais décoder le JWT dans un composant sans `useMemo` — la lecture de `localStorage` est synchrone mais inutilement répétée à chaque render

---

## Variables d'environnement clés

### Backend (`backend/.env`)
```
DATABASE_URL=mysql://user:pass@db:3306/laundrymap
JWT_PASSPHRASE=
MAILER_DSN=smtp://...
MAILER_FROM=noreply@...
```

### Frontend
```
VITE_API_BASE_URL=http://localhost:8000
```

### Docker Compose (`.env` racine)
```
DB_ROOT_PASSWORD, DB_NAME, DB_USER, DB_PASSWORD
APP_SECRET
BREVO_CONNEXION, BREVO_KEY_SMTP, BREVO_HOST, BREVO_PORT, BREVO_FROM
```

---

## Points d'attention

- **LaverieFavori** a une clé primaire composite `(laverie_id, utilisateur_id)` — pas d'auto-increment. Doctrine le gère avec `#[ORM\Id]` sur les deux `ManyToOne`.
- **Géocodage** : le backend proxifie Nominatim pour éviter les restrictions CORS et cacher l'User-Agent.
- **Recherche géographique** : filtre bounding-box en SQL puis haversine exacte en PHP. Limite à 30 résultats, rayon max 50 km.
- **`isOuvertMaintenant`** : les `LaverieFermeture` représentent les **plages d'ouverture** (nom trompeur), pas les fermetures.
- **Touch zoom carte** : `touchAction` change dynamiquement entre `pan-y` (1 doigt = scroll page) et `none` (2 doigts = zoom Leaflet).
