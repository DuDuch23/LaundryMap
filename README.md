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
- **Symfony**
- **Doctrine ORM** - Gestion de la base de données
- **LexikJWTAuthenticationBundle** - Authentification JWT

### Frontend
- **React** - Bibliothèque front JavaScript 

### Base de données
- **MySQL** // **MariaDB** - Stockage des données

## 🚀 Installation

### Prérequis

- PHP 8.4 ou supérieur
- Composer
- Node.js 22+ et npm
- MySQL / MariaDB
- Symfony CLI

### Backend (Symfony)

```bash
# Cloner le repository
git clone https://github.com/DuDuch23/LaundryMap.git

# Installer les dépendances PHP
composer install

# Configurer la base de données dans .env.local en fonction de vos informations

# Créer la base de données
php bin/console doctrine:database:create

# Exécuter les migrations
php bin/console doctrine:migrations:migrate

# Générer les clés JWT
php bin/console lexik:jwt:generate-keypair

# Lancer le serveur de développement
symfony server:start
```

### Frontend (React)

```bash
# Se déplacer dans le dossier frontend
cd frontend

# Installer les dépendances
npm install

# Configurer l'URL de l'API dans frontend/.env
# VITE_API_BASE_URL=http://localhost:8000

# Lancer le serveur de développement
npm run dev

### Configuration Google Cloud (SSO)

1. Créer un identifiant OAuth 2.0 (type **Application Web**) dans Google Cloud Console.
2. Ajouter l'URI suivante dans **Authorized redirect URIs** :
	- `http://localhost:8000/api/oauth/google/callback`
3. Ajouter le client ID et le client secret dans les variables backend.
4. Le bouton "Continuer avec Google" est disponible sur les pages inscription utilisateur et connexion.
```

## 📁 Structure du projet

```
laundrymap/
├── backend/                  # Application Symfony
│   ├── config/              # Configuration
│   ├── migrations/          # Migrations de base de données
│   ├── src/
│   │   ├── Controller/      # Contrôleurs API
│   │   ├── Entity/          # Entités Doctrine
│   │   ├── Repository/      # Repositories
│   │   └── Security/        # Configuration sécurité
│   └── public/              # Point d'entrée PHP
│
├── frontend/                # Application React
│   ├── public/
│   └── src/
│       ├── components/      # Composants React
│       ├── services/        # Services API
│       ├── pages/           # Pages de l'application
│       └── App.js           # Composant principal
│
└── README.md
```

## 🔑 Utilisation

1. **Créer un compte** : Inscrivez-vous avec une adresse email et un mot de passe
2. **Explorer la carte** : Naviguez sur la carte pour voir les machines existantes
3. **Ajouter une machine** : Cliquez sur la carte pour ajouter un nouvel emplacement
4. **Gérer vos contributions** : Modifiez ou supprimez les machines que vous avez ajoutées

## 👥 Auteurs

- Adrien Leclere - https://github.com/ENFANTSDUPAYS
- Noah Bonnaventure - https://github.com/TechnicienDeSurface
- Alexandre Duchemin - https://github.com/DuDuch23
