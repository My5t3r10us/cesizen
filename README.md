# CESIZen

CESIZen est une application web progressive (PWA) de suivi du bien-être
mental, construite avec Next.js et installable sur ordinateur ou mobile.

## Fonctionnalités

- Journal émotionnel avec intensité, contexte et notes chiffrées
- Calendrier et statistiques d'évolution de l'humeur
- Conseils et articles publics
- Gestion des utilisateurs, articles et émotions pour les administrateurs
- Installation sur mobile et ordinateur depuis le navigateur

## Démarrage rapide

```bash
npm install
docker compose up -d
```

Créez ensuite un fichier `.env` à la racine :

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5454/cesizen_test
JWT_SECRET=votre-cle-secrete-jwt-de-32-caracteres-minimum
ENCRYPTION_KEY=0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef
```

Puis initialisez la base et démarrez l'application :

```bash
npm run db:setup
npm run dev
```

L'application est disponible sur <http://localhost:3000>.

En production HTTPS, le navigateur propose son installation comme application.

> [!NOTE]
> Le seed crée le compte administrateur
> `admin@cesizen.fr` / `Admin123!`. Changez ce mot de passe hors d'un
> environnement local.

## Commandes principales

| Commande | Usage |
|---|---|
| `npm run dev` | Serveur de développement |
| `npm run build` | Build de production |
| `npm run check` | ESLint et vérification TypeScript |
| `npm run db:setup` | Migrations et données initiales |
| `npm run test` | Tests Vitest |
| `npm run test:e2e` | Tests Playwright |

## Documentation

La documentation complète est centralisée dans [`docs/`](docs/README.md) :

- [installation](docs/installation.md) ;
- [guide utilisateur](docs/user-guide.md) ;
- [architecture et flux de données](docs/architecture/data-flows.md) ;
- [tests et CI/CD](docs/testing/README.md).
