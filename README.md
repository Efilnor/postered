# Postered
## Installation (Docker)
Le projet est nécessite docker pour son lancement. 

1. Lancer l'application
Depuis la racine du projet, exécutez la commande suivante pour construire et lancer les containers (Base de données, Backend et Frontend) :

```bash
docker-compose up -d --build
```

2. Remplir la base de données
Une fois les containers lancés, exécutez le script de peuplement pour générer les thèmes, les permissions et les premiers posters :

```bash
docker-compose exec backend npm run seed
```

Rendez vous à l'adresse suivante et bonne balade sur le projet !

http://localhost:5173/

## Identifiants de test

| Rôle | Email | Mot de passe |
| --- | --- | --- |
| Admin | admin@postered.com | admin123 |
| Utilisateur normal | buyer@postered.com | buyer123 |
| Créateur de poster | creator@postered.com | creator123 |
| Modérateur | manager@postered.com | manager123 |


## Structure du projet 
