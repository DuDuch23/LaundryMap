# LaundryMap — Architecture

## Infrastructure

```mermaid
graph TB
    User([Utilisateur])

    subgraph Docker["Docker Compose"]
        FE["Frontend\nReact + Vite\n:5173"]
        NGX["Nginx\n:8000"]
        PHP["PHP-FPM\nSymfony 7"]
        DB[("MariaDB 11")]
        PMA["phpMyAdmin\n:8081"]
    end

    Nominatim["Nominatim\nOpenStreetMap\n(géocodage)"]
    Brevo["Brevo\n(SMTP emails)"]
    WiLine["WiLine API\n(machines connectées)"]

    User -->|":5173"| FE
    User -->|":8000"| NGX
    FE -->|"API REST"| NGX
    NGX --> PHP
    PHP --> DB
    PMA --> DB
    PHP -->|"geocode proxy"| Nominatim
    PHP -->|"Mailer"| Brevo
    PHP -->|"machines"| WiLine
```

---

## Flux d'authentification

```mermaid
sequenceDiagram
    participant U as Utilisateur
    participant FE as React
    participant API as Symfony API
    participant DB as MariaDB

    U->>FE: POST /connexion {email, mot_de_passe}
    FE->>API: POST /api/connexion
    API->>DB: SELECT utilisateur WHERE email=?
    DB-->>API: Utilisateur + hash mot_de_passe
    API->>API: Vérif hash + UserChecker (statut)
    API-->>FE: { token: "JWT..." }
    FE->>FE: localStorage.setItem('token', JWT)
    Note over FE: Axios interceptor injecte<br/>Authorization: Bearer JWT<br/>sur chaque requête

    U->>FE: Action protégée
    FE->>API: GET /api/profil\n+ Authorization: Bearer JWT
    API->>API: LexikJWT vérifie signature
    API-->>FE: Données utilisateur
```

---

## Schéma de la base de données

```mermaid
erDiagram
    UTILISATEUR {
        int id PK
        string email UK
        string nom
        string prenom
        string mot_de_passe
        enum statut
        datetime date_creation
        datetime date_modification
        datetime date_derniere_connexion
        datetime utilisateur_supprime_le
        string oauth_id
    }

    PROFESSIONNEL {
        int id PK
        int utilisateur_id FK
        string nom
        string prenom
        string email
        string siret
        enum statut
        int photo_profil_id FK
    }

    LAVERIE {
        int id PK
        int professionnel_id FK
        int adresse_id FK
        int logo_id FK
        string nom_etablissement
        string contact_email
        text description
        enum statut
        int wi_line_reference
        datetime date_ajout
        datetime date_modification
        datetime supprimee_le
    }

    ADRESSE {
        int id PK
        string adresse
        string code_postal
        string ville
        string pays
        float latitude
        float longitude
    }

    LAVERIE_FAVORI {
        int laverie_id PK,FK
        int utilisateur_id PK,FK
    }

    LAVERIE_NOTE {
        int id PK
        int laverie_id FK
        int utilisateur_id FK
        int note
        text commentaire
        datetime date
    }

    LAVERIE_FERMETURE {
        int id PK
        int laverie_id FK
        enum jour
        time heure_debut
        time heure_fin
    }

    LAVERIE_EQUIPEMENT {
        int id PK
        int laverie_id FK
        string nom
        string type
        int capacite
        float tarif
        int duree
        int equipement_reference
    }

    LAVERIE_MEDIA {
        int id PK
        int laverie_id FK
        int media_id FK
    }

    LAVERIE_SERVICE {
        int id PK
        int laverie_id FK
        int service_id FK
    }

    LAVERIE_PAIEMENT {
        int id PK
        int laverie_id FK
        int methode_paiement_id FK
    }

    MEDIA {
        int id PK
        string emplacement
        string nom_originel
        string mime_type
        int poids
    }

    SERVICE { int id PK; string nom }
    METHODE_PAIEMENT { int id PK; string nom }

    UTILISATEUR ||--o| PROFESSIONNEL : "est"
    PROFESSIONNEL ||--o{ LAVERIE : "possède"
    LAVERIE }o--|| ADRESSE : "se trouve à"
    LAVERIE }o--o| MEDIA : "logo"
    UTILISATEUR ||--o{ LAVERIE_FAVORI : "met en favori"
    LAVERIE ||--o{ LAVERIE_FAVORI : "est favori de"
    UTILISATEUR ||--o{ LAVERIE_NOTE : "écrit"
    LAVERIE ||--o{ LAVERIE_NOTE : "reçoit"
    LAVERIE ||--o{ LAVERIE_FERMETURE : "horaires"
    LAVERIE ||--o{ LAVERIE_EQUIPEMENT : "machines"
    LAVERIE ||--o{ LAVERIE_MEDIA : "photos"
    LAVERIE ||--o{ LAVERIE_SERVICE : "offre"
    LAVERIE ||--o{ LAVERIE_PAIEMENT : "accepte"
    LAVERIE_MEDIA }o--|| MEDIA : "fichier"
    LAVERIE_SERVICE }o--|| SERVICE : "réf."
    LAVERIE_PAIEMENT }o--|| METHODE_PAIEMENT : "réf."
```

---

## Architecture frontend

```mermaid
graph TD
    subgraph App["App.jsx — Router"]
        H["/ Home"]
        MF["/mes-favoris MesFavoris"]
        FL["/laveries/:id FicheLaverie"]
        PR["/profil Profil"]
        CN["/connexion Connexion"]
        AD["Admin routes"]
        PRO["Pro routes"]
    end

    subgraph Hooks["Hooks"]
        UG["useGeolocation"]
        ULS["useLaverieSearch"]
        UF["useFavorites"]
    end

    subgraph Services["Services"]
        API["api.js\nAPI_BASE_URL"]
        REQ["request.tsx\nHTTP calls\n(axios + fetch)"]
    end

    subgraph Components["Composants clés"]
        LM["LaverieMap\n(react-leaflet)"]
        LG["LaverieGrid"]
        LC["LaverieCard"]
        SB["SearchBar"]
        FP["FilterPanel"]
        NT["Notification"]
    end

    H --> UG
    H --> ULS
    H --> UF
    MF --> UF
    ULS --> REQ
    UF --> REQ
    REQ --> API
    H --> LM
    H --> LG
    LG --> LC
    H --> SB
    H --> FP
    H --> NT
    MF --> NT
```

---

## Flux de recherche de laveries

```mermaid
sequenceDiagram
    participant U as Utilisateur
    participant FE as React (useLaverieSearch)
    participant API as Symfony (ApiRechercheController)
    participant Nom as Nominatim

    U->>FE: Saisit une adresse
    FE->>API: GET /api/laveries/geocode?q=...
    API->>Nom: GET search?q=...&countrycodes=fr
    Nom-->>API: Résultats JSON
    API-->>FE: { suggestions: [...] }
    FE-->>U: Dropdown autocomplétion

    U->>FE: Sélectionne une suggestion
    FE->>API: GET /api/laveries/recherche?lat=&lng=&rayon=&...
    API->>API: BBox SQL → candidats
    API->>API: Filtre textuel PHP
    API->>API: Haversine exacte + filtres horaire/service/paiement
    API->>API: Tri par distance
    API-->>FE: { laveries: [...], total, meta }
    FE-->>U: Affiche carte + liste
```

---

## Flux favoris

```mermaid
sequenceDiagram
    participant U as Utilisateur
    participant FE as React (useFavorites)
    participant API as Symfony (ApiProfilController)
    participant DB as MariaDB

    Note over FE: Mount — chargement initial
    FE->>API: GET /api/profil/favoris
    API->>DB: SELECT laverie_favori JOIN laverie WHERE supprimee_le IS NULL
    DB-->>API: LaverieFavori[]
    API-->>FE: { favoris: [...], total }

    U->>FE: Clique cœur (ajouter)
    FE->>FE: pendingIds.add(laverieId)
    FE->>API: POST /api/profil/favoris/{id}
    API->>DB: INSERT laverie_favori
    API-->>FE: 201 { message }
    FE->>API: GET /api/profil/favoris (silent refresh)
    API-->>FE: favoris mis à jour
    FE->>FE: pendingIds.delete(laverieId)
    FE-->>U: Notification succès

    U->>FE: Clique cœur (retirer)
    FE->>API: DELETE /api/profil/favoris/{id}
    API->>DB: DELETE laverie_favori
    API-->>FE: 200
    FE->>API: GET /api/profil/favoris (silent refresh)
    FE-->>U: Notification succès (vert)
```

---

## Rôles et accès

```mermaid
graph LR
    Anon["Anonyme"] -->|PUBLIC| Search["Recherche\n+ Fiche laverie"]
    Anon -->|PUBLIC| Auth["Connexion\n+ Inscription"]

    User["ROLE_USER"] -->|IS_AUTH| Profil["Profil\n+ Favoris"]
    User -->|IS_AUTH| Note["Notes laveries"]

    Pro["ROLE_PROFESSIONNEL"] -->|ROLE_PRO| Dashboard["Tableau de bord pro"]
    Pro -->|ROLE_PRO| Manage["Gérer ses laveries"]
    Pro -->|ROLE_PRO| AddLaverie["Ajouter laverie"]

    Admin["ROLE_ADMIN"] -->|ROLE_ADMIN| AdminUI["Gestion utilisateurs"]
    Admin -->|ROLE_ADMIN| AdminLav["Valider/refuser laveries"]

    User --> Anon
    Pro --> User
    Admin --> User
```
