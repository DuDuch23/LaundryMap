# 🧺 LaundryMap

LaundryMap est une application collaborative orienté mobile first permettant de localiser et partager des machines à laver publiques sur une carte interactive.

## ✨ Fonctionnalités

- 🗺️ Carte interactive pour visualiser les emplacements de laveries automatiques
- ↗️ Itinéraire vers les laveries diponibles
- 📍 Ajout collaboratif de nouveaux emplacements
- 👤 Système d'authentification pour les contributeurs + systèmes de modérations (Super admin)
- ✏️ Modification et suppression des laveries
- 🔍 Recherche et filtrage des machines disponibles
- 📱 Interface responsive adaptée Mobile-first + Tablet/Desktop
- 🤖 Intéractions API propriétaires (Lecture + interprétations des données json)
- 🗣️ Gestion des commentaires
- ⭐ Gestion des notations
- 🇺🇸 Système de traductions (internationnalisation)
- ♿ Accessibilité renforcé pour les personnes handicapées
- ‼️ Système de signalement de contenu

## 🛠️ Technologies

### Backend
- **Symfony 8** (PHP 8.4)
- **Doctrine ORM** - Gestion de la base de données
- **LexikJWTAuthenticationBundle** - Authentification JWT
- **NelmioCorsBundle** - Gestion CORS

### Frontend
- **React 19** + **TypeScript** - Bibliothèque front JavaScript
- **Vite** - Build tool & serveur de dev (HMR)
- **Tailwind CSS v4**
- **react-leaflet** - Carte interactive (OpenStreetMap)

### Base de données
- **MariaDB 11** - Stockage des données

### Infrastructure
- **Docker Compose** - db / migrate / php (FPM) / nginx / frontend / phpmyadmin

---

## 🚀 Installation avec Docker (recommandé)

C'est la méthode officielle et testée pour lancer le projet en local, en dev comme point de départ pour la prod.

### Prérequis

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (Docker Engine 24+ / Docker Compose v2)
- Git

### Étapes

```bash
# 1. Cloner le repository
git clone https://github.com/DuDuch23/LaundryMap.git
cd LaundryMap

# 2. Copier le fichier d'environnement racine et remplir les valeurs
cp .env.example .env
# → éditer .env : mots de passe DB, APP_SECRET (openssl rand -hex 32),
#   identifiants SMTP Brevo, OAuth Google, tokens INSEE / WI-LINE.
#   Pour un simple test local, les valeurs par défaut suffisent pour DB_*
#   et APP_SECRET ; les intégrations tierces (mail, Google, INSEE, WI-LINE)
#   resteront simplement inactives sans clé valide.

# 3. Construire les images et démarrer tous les services
docker compose up -d --build
```

Au premier démarrage, le service `migrate` s'exécute automatiquement : il applique les migrations Doctrine, génère les clés JWT et charge les fixtures (données de démonstration), puis s'arrête. Les services `php` et `nginx` attendent qu'il ait terminé avant de démarrer.

### Accès

| Service | URL |
|---|---|
| Frontend (Vite, HMR) | http://localhost:5173 |
| API backend | http://localhost:8000 |
| phpMyAdmin | http://localhost:8081 |

### Comptes de test (chargés par les fixtures)

| Rôle | Email | Mot de passe |
|---|---|---|
| Super admin | `superadmin@laundrymaps.fr` | `Super@9012` |
| Admin | `admin@laundrymaps.fr` | `Admin@1234` |
| Modérateur | `moderateur@laundrymaps.fr` | `Modo@5678` |
| Utilisateur | `marc.dupont@email.fr` (ou tout autre email des fixtures) | `Password@123` |

⚠️ Ces comptes n'existent qu'en environnement de développement (fixtures) — jamais en production.

### Commandes utiles

```bash
# Voir les logs d'un service
docker compose logs -f php

# Rejouer les migrations manuellement
docker compose exec php php bin/console doctrine:migrations:migrate

# Recharger les fixtures (⚠️ purge les données existantes)
docker compose exec php php bin/console doctrine:fixtures:load

# Vider le cache Symfony
docker compose exec php php bin/console cache:clear

# Reconstruire un service après modification de son Dockerfile
docker compose up -d --build php
docker compose up -d --build frontend

# Tout arrêter (les données de la DB sont conservées dans le volume db_data)
docker compose down

# Tout arrêter et supprimer les données de la DB
docker compose down -v
```

> ℹ️ Le service `migrate` recharge intégralement les fixtures (et purge la base) à chaque fois qu'il est recréé — par exemple après un `docker compose down` puis `up`, ou un `--force-recreate migrate`. Un simple `docker compose stop` / `start` (sans recréation) conserve vos données.

### Configuration Google Cloud (SSO)

1. Créer un identifiant OAuth 2.0 (type **Application Web**) dans Google Cloud Console.
2. Ajouter l'URI suivante dans **Authorized redirect URIs** :
   - `http://localhost:8000/api/oauth/google/callback`
3. Renseigner `GOOGLE_CLIENT_ID` et `GOOGLE_CLIENT_SECRET` dans le `.env` racine.
4. Le bouton "Continuer avec Google" est disponible sur les pages inscription utilisateur et connexion.

---

## 🧑‍💻 Installation manuelle (sans Docker)

Pour du développement backend/frontend en dehors des conteneurs (nécessite une DB déjà disponible).

### Prérequis

- PHP 8.4 ou supérieur
- Composer
- Node.js 20+ et npm
- MySQL / MariaDB 11
- [Symfony CLI](https://symfony.com/download)

### Backend (Symfony)

```bash
cd backend

# Installer les dépendances PHP
composer install

# Créer backend/.env.local (non versionné) avec vos identifiants,
# par exemple :
cat > .env.local << 'EOF'
APP_ENV=dev
APP_SECRET=change_me_openssl_rand_hex_32
DATABASE_URL="mysql://root@127.0.0.1:3306/laundrymap?serverVersion=mariadb-11.0.0&charset=utf8mb4"
CORS_ALLOW_ORIGIN='^https?://(localhost|127\.0\.0\.1)(:[0-9]+)?$'
MAILER_DSN=smtp://user:pass@smtp-relay.brevo.com:587
BREVO_FROM=noreply@votre-domaine.fr
DEFAULT_URI=http://localhost:8000
FRONTEND_URL=http://localhost:5173
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=http://localhost:8000/api/oauth/google/callback
FRONTEND_SSO_SUCCESS_URL=http://localhost:5173/profil
FRONTEND_SSO_ERROR_URL=http://localhost:5173/connexion
INSEE_TOKEN=
WILINE_SERVER=https://api.wi-line.fr
WILINE_USER=
code=
JWT_SECRET_KEY=%kernel.project_dir%/config/jwt/private.pem
JWT_PUBLIC_KEY=%kernel.project_dir%/config/jwt/public.pem
JWT_PASSPHRASE=
EOF

# Créer la base de données
php bin/console doctrine:database:create

# Exécuter les migrations
php bin/console doctrine:migrations:migrate

# (Optionnel) Charger les fixtures de démonstration
php bin/console doctrine:fixtures:load

# Générer les clés JWT
php bin/console lexik:jwt:generate-keypair

# Lancer le serveur de développement (HTTPS auto-signé par défaut)
symfony server:start
```

### Frontend (React)

```bash
cd frontend

# Installer les dépendances
npm install

# Configurer l'URL de l'API dans frontend/.env
# VITE_API_BASE_URL=http://localhost:8000  (ou https:// si vous utilisez symfony server:start)

# Lancer le serveur de développement
npm run dev
```

---

## 📁 Structure du projet

```
LaundryMap/
├── docker-compose.yml        # Orchestration des services (db, migrate, php, nginx, frontend, phpmyadmin)
├── conf/nginx/                # Configuration Nginx (reverse proxy → PHP-FPM)
│
├── backend/                   # Application Symfony (API REST)
│   ├── config/
│   │   └── packages/          # security.yaml, nelmio_cors.yaml, doctrine.yaml…
│   ├── migrations/            # Migrations Doctrine
│   ├── src/
│   │   ├── Controller/Api/    # Contrôleurs REST
│   │   ├── Entity/            # Entités Doctrine
│   │   ├── Repository/        # Requêtes BDD
│   │   ├── Service/           # Logique métier
│   │   ├── DTO/                # Data Transfer Objects
│   │   ├── Enum/               # Enums PHP
│   │   ├── Security/           # UserChecker JWT
│   │   └── DataFixtures/       # Données de démonstration
│   ├── templates/emails/       # Templates Twig pour emails
│   └── public/                 # Point d'entrée PHP (front controller)
│
└── frontend/                   # Application React / Vite
    └── src/
        ├── pages/               # Pages (Home, MesFavoris, Connexion…)
        ├── components/          # Composants réutilisables (map/, laverie/, search/, ui/…)
        ├── hooks/               # useFavorites, useLaverieSearch, useGeolocation…
        ├── services/            # api.js (URL de base), request.tsx (appels HTTP)
        ├── routes/              # Gardes de routes (AuthRoute, ProRoute, RequireAdmin…)
        ├── types/               # Types TypeScript
        └── locales/fr|en/       # Traductions i18n
```

## 🔑 Utilisation

1. **Créer un compte** : Inscrivez-vous avec une adresse email et un mot de passe
2. **Explorer la carte** : Naviguez sur la carte pour voir les machines existantes
3. **Ajouter une machine** : Cliquez sur la carte pour ajouter un nouvel emplacement
4. **Gérer vos contributions** : Modifiez ou supprimez les machines que vous avez ajoutées

## 🩺 Dépannage

- **`ports are not available` sur le port 8000** : un autre processus écoute déjà dessus (souvent `symfony server:start` en local). Arrêtez-le (`symfony server:stop` ou fermez le processus) puis relancez `docker compose up -d nginx`.
- **Le conteneur `migrate` échoue** : consultez ses logs avec `docker compose logs migrate` — la cause la plus fréquente est un `.env` racine incomplet (variables `DB_*` ou `APP_SECRET` manquantes).
- **Images cassées / `/uploads` ne charge pas** : vérifiez que `VITE_API_BASE_URL` (frontend) pointe vers `http://localhost:8000` en Docker — pas `https://`, nginx ne sert que du HTTP en dev.

## 👥 Auteurs

- Adrien Leclere - https://github.com/ENFANTSDUPAYS
- Noah Bonnaventure - https://github.com/TechnicienDeSurface
- Alexandre Duchemin - https://github.com/DuDuch23
