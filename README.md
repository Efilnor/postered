# Postered
_Postered_ est un site web permettant de faire le lien entre des illustrateurs et des acheteurs. Il permet aux illustrateurs de publier leurs illustrations, qui sont ensuite vendues sous forme de posters aux acheteurs du site. Le site a bien sûr un système de modération, demandant à ce que chaque illustration soit vérifiée par un humain avant d'être publiée sur le site. 

## Installation
Le projet est entièrement conteneurisé avec Docker pour garantir un environnement stable et prêt à l'emploi.

### 1. Démarrer l'infrastructure
À la racine du projet, exécutez la commande suivante pour construire les images et lancer les services (Base de données, Backend et Frontend) :

```bash
docker-compose up -d --build
```

### 2. Initialiser les données
Une fois les services opérationnels, exécutez le script de peuplement pour générer automatiquement les thèmes, le système de permissions et la galerie de posters :

```bash
docker-compose exec backend npm run seed
```

### Accès au projet
Une fois ces étapes terminées, rendez-vous sur : http://localhost:3000

Bonne balade artistique sur Postered ! ✨

## Identifiants de test

| Rôle | Email | Mot de passe |
| --- | --- | --- |
| Admin | admin@postered.com | admin123 |
| Utilisateur normal | buyer@postered.com | buyer123 |
| Créateur de poster | creator@postered.com | creator123 |
| Modérateur | manager@postered.com | manager123 |

## Permissions & Groupes
### Permissions

| User | Self | Group | Design | Order | Session |
| --- | --- | --- | --- | --- | --- |
| user : read <br> user : write <br> user : delete | self : read <br> self : write | group : read <br> group : write <br> group : delete <br> group : request | design : read <br> design : create <br> design : update <br> design : publish <br> design : delete | order : create <br> order : read <br> order : update | session : read <br> session : write <br> session : delete |

### Groupes 

| Titre | Description | Permissions |
| --- | --- | --- |
| Admin | Peut tout faire | * : * |
| Guest | N’a pas de droit | design : read, self : create |
| UserBuyer | Peut acheter un design | self:*, order:create, order:read |
| UserCreator | Peut ajouter un design et acheter un design | self:*, order:create, order:read, design:create, design:update (own) |
| DesignManager | Peut supprimer et modifier des designs existants | design:update (tous), design:delete (tous), design:publish |

## Sécurité






## Structure du projet 
