# Guide d'utilisation de CESIZen

CESIZen est une application de bien-etre mental permettant de suivre ses emotions, consulter son historique, visualiser des statistiques et lire des conseils. Elle propose aussi une interface d'administration pour gerer les contenus et les referentiels.

## Acces a l'application

En local, ouvrir :

```text
http://localhost:3000
```

Depuis la page d'accueil, deux parcours sont possibles :

- creer un compte utilisateur
- se connecter avec un compte existant

Compte administrateur par defaut apres initialisation de la base :

```text
Email : admin@cesizen.fr
Mot de passe : Admin123!
```

## Parcours utilisateur

### Creer un compte

1. Cliquer sur `Commencer gratuitement`.
2. Renseigner les informations demandees.
3. Valider l'inscription.
4. Se connecter avec les identifiants crees si la connexion n'est pas automatique.

### Se connecter

1. Cliquer sur `Se connecter`.
2. Saisir l'adresse email et le mot de passe.
3. Valider le formulaire.

Apres connexion, l'utilisateur accede a son tableau de bord.

## Tableau de bord

Le tableau de bord affiche une synthese personnelle :

- meteo du jour
- nombre d'entrees du mois
- nombre d'entrees aujourd'hui
- nombre de jours actifs
- intensite moyenne
- graphique d'evolution de l'humeur
- entrees recentes

## Journal emotionnel

Le journal permet d'enregistrer et de consulter les emotions ressenties.

### Ajouter une entree

1. Depuis le tableau de bord ou la rubrique `Journal`, cliquer sur l'action d'ajout d'emotion.
2. Choisir une emotion.
3. Indiquer l'intensite ressentie.
4. Ajouter une note personnelle si necessaire.
5. Enregistrer l'entree.

Les notes personnelles sont chiffrees cote serveur.

### Consulter l'historique

La rubrique `Journal` permet de retrouver les entrees passees. Selon l'ecran, les entrees peuvent etre consultees sous forme de liste, de cartes ou via un calendrier.

### Modifier ou supprimer une entree

Depuis une entree existante, utiliser les actions disponibles pour :

- modifier l'emotion, l'intensite ou la note
- supprimer l'entree si elle n'est plus utile

## Statistiques

La rubrique `Statistiques` permet d'analyser l'evolution emotionnelle dans le temps.

Elle affiche notamment :

- les tendances recentes
- les moyennes d'intensite
- la repartition des emotions
- l'activite par periode

Ces donnees aident a identifier les variations et habitudes emotionnelles.

## Conseils et articles

La rubrique `Conseils` donne acces aux articles de bien-etre mental publies.

Fonctionnalites principales :

- consulter la liste des articles
- filtrer ou parcourir par categorie
- ouvrir un article detaille
- lire les ressources publiees par l'administration

Cette rubrique est accessible depuis l'espace public et l'espace connecte.

## Profil

La rubrique `Profil` permet de gerer les informations du compte.

Selon les options disponibles, l'utilisateur peut :

- consulter ses informations personnelles
- modifier son profil
- changer son mot de passe
- gerer son compte

## Deconnexion

Pour quitter la session :

1. Ouvrir le menu ou l'en-tete de l'application.
2. Cliquer sur l'action de deconnexion.
3. L'application revient a l'etat non connecte.

## Parcours administrateur

Un utilisateur avec le role `admin` peut acceder a l'espace d'administration.

URL locale :

```text
http://localhost:3000/admin
```

### Tableau de bord admin

L'administration donne acces a une vue de gestion globale, notamment pour :

- suivre les statistiques principales
- gerer les utilisateurs
- gerer les articles
- gerer les emotions et leurs categories

### Gestion des utilisateurs

La rubrique utilisateurs permet a l'administrateur de :

- consulter les comptes inscrits
- promouvoir un utilisateur si l'action est disponible
- bannir un utilisateur
- supprimer un utilisateur

L'administrateur ne consulte pas les notes personnelles chiffrees des utilisateurs.

### Gestion des articles

La rubrique articles permet de :

- creer un article
- modifier un article existant
- associer une categorie
- ajouter un extrait ou une image de couverture
- publier ou depublier un article
- supprimer un article

Les articles publies apparaissent dans la rubrique `Conseils`.

### Gestion des categories d'articles

Les categories servent a organiser les articles de conseils. Elles peuvent etre utilisees pour faciliter la navigation cote utilisateur.

### Gestion des emotions

La rubrique emotions permet de maintenir le referentiel utilise dans le journal emotionnel :

- categories d'emotions
- emotions associees
- couleurs
- pictogrammes

Ces elements alimentent les formulaires utilisateur et les visualisations statistiques.

## Installation sur mobile ou ordinateur

CESIZen est une PWA installable depuis un navigateur compatible :

- Chrome ou Edge : menu du navigateur, puis **Installer CESIZen** ;
- Safari sur iPhone ou iPad : **Partager**, puis **Sur l'ecran d'accueil** ;
- Chrome sur Android : menu, puis **Installer l'application**.

L'application installee utilise les memes parcours et les memes donnees que la
version ouverte dans le navigateur.

## Bonnes pratiques d'utilisation

- Renseigner les emotions regulierement pour obtenir des statistiques pertinentes.
- Utiliser les notes pour contextualiser les variations importantes.
- Consulter les tendances sur plusieurs jours plutot qu'une seule entree isolee.
- Se deconnecter apres utilisation sur un appareil partage.
- Changer le mot de passe administrateur par defaut apres l'installation.
