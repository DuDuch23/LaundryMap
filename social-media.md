* Modélisation de donnée :

J'ai créé une entité dédiée `LaverieReseauSocial` au lieu de bourrer 5 colonnes dans la table laverie ! Du coup une laverie peut avoir plusieurs liens (relation OneToMany), chaque ligne = un type + une url. J'ai suivi le même pattern que `LaverieEquipement` qui existait déjà pour rester cohérent. Le type est géré par un enum `TypeReseauSocialEnum` (Site web, Facebook, Instagram, X, LinkedIn). La table s'appelle `laverie_reseau_social` dans phpmyadmin.

* Garantit qu'une laverie possedera un seul lien par type :

J'ai mis une contrainte d'unicité sur laverie_id et type ! Et je l'ai mis à 2 endroits : au niveau Doctrine (UniqueConstraint dans l'entité) ET en SQL dans la migration (UNIQUE INDEX). Comme ça même si on essaie de contourner l'appli, la base refuse. En plus, côté contrôleur quand on enregistre, je détecte les doublons de type et je renvoie une erreur "Un seul lien Facebook est autorisé par laverie".

* Où et comment les urls seront validés :

J'ai un service backend `ReseauSocialValidator` qui vérifie 2 choses : que c'est bien une url valide en HTTPS, et que le domaine correspond au bon réseau (un lien Facebook doit pointer vers facebook.com, Instagram vers instagram.com, etc.). Pour le site web pas de domaine imposé, juste une url HTTPS valide. J'accepte les sous-domaines (www.facebook.com) mais je bloque les domaines pièges autre que facebook.com. Et j'ai la même validation côté front (dans reseauSocial.ts) pour afficher l'erreur direct à l'utilisateur sans attendre le serveur. Donc double validation : front pour l'UX, back pour la sécu.

* Affichage sur la fiche publique d'une laverie :

J'ai fait un composant réutilisable `ReseauxSociauxLinks` qui affiche les icônes cliquables. Il est utilisé sur les 3 vues (publique, pro, admin). Si la laverie n'a aucun lien, on n'affiche rien du tout (pas de section vide qui traîne). Les icônes des réseaux sociaux ne viennent pas de lucide-react car ils ont été retirés depuis quelques temps donc je les ai mises en SVG inline.

* Choix de sécurité et accessibilité :

Sécurité : tous les liens s'ouvrent avec target="_blank" + rel="noopener noreferrer" pour éviter que la page cible accède à ma fenêtre.
Accessibilité : chaque icône a un aria-label genre "Visiter Facebook (nouvel onglet)" pour les lecteurs d'écran et c'est traduit FR/EN. Si l'url est invalide à la saisie, un message d'erreur clair apparaît sous le champ.

* Bonus :
- Des fixtures qui ajoutent des réseaux à plein de laveries existantes avec des combinaisons variées (certaines ont les 5, d'autres 1 seul) pour bien tester l'affichage.
- Vérification du bon domaine pour chaque réseaux sociaux sauf le site web où l'on vérifie le HTTPS.
- i18n sur la partie publique le titre + les aria-labels passent en anglais pour l'accessibilité.
