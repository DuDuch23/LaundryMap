# 🧺 LaundryMap

LaundryMap est une application collaborative orienté mobile first permettant de localiser et partager des machines à laver publiques sur une carte interactive.

## ✨ Fonctionnalités

- 🗺️ Carte interactive pour visualiser les emplacements de machines à laver
- 📍 Ajout collaboratif de nouveaux emplacements
- 👤 Système d'authentification pour les contributions
- ✏️ Modification et suppression des emplacements ajoutés
- 🔍 Recherche et filtrage des machines disponibles
- 📱 Interface responsive adaptée mobile et desktop

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

### Frontend (React)

```bash
# Se déplacer dans le dossier frontend
cd frontend

# Installer les dépendances
npm install

# Configurer l'URL de l'API dans .env avec les informations de l'API propriétaire

# Lancer le serveur de développement
npm start


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
