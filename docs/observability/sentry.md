# Observabilite Sentry

CESIZen utilise Sentry pour les erreurs, les logs structures, le Session
Replay, le tracing, le profiling et les metriques applicatives. La collecte est
desactivee en developpement et pendant les tests.

## Environnements

Configurer les variables suivantes dans les deux applications Dokploy.

| Variable | Staging | Production | Type |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_SENTRY_DSN` | DSN du projet | DSN du projet | Build et runtime |
| `SENTRY_DSN` | Meme DSN | Meme DSN | Runtime serveur |
| `NEXT_PUBLIC_SENTRY_ENVIRONMENT` | `staging` | `production` | Build |
| `SENTRY_ENVIRONMENT` | `staging` | `production` | Build et runtime |
| `SENTRY_ORG` | `cesizen-nx` | `cesizen-nx` | Build |
| `SENTRY_PROJECT` | `javascript-nextjs` | `javascript-nextjs` | Build |
| `SENTRY_UPLOAD_SOURCE_MAPS` | `true` | `true` | Build |
| `SENTRY_AUTH_TOKEN` | Secret Sentry | Secret Sentry | Secret de build |

Le token d'authentification sert uniquement a creer la release et a televerser
les source maps pendant le build Dokploy. Il ne doit pas etre disponible dans
le navigateur, inscrit dans une image ou versionne. Le build echoue
volontairement si l'upload est demande sans token.

Le build GitHub Actions ne definit pas `SENTRY_UPLOAD_SOURCE_MAPS=true` et reste
donc executable sans token. Les source maps correspondant a l'artefact deploye
sont produites et envoyees par le build Dokploy.

## Politique de collecte

- Erreurs inattendues : 100 %. Les validations et reponses HTTP attendues
  `400`, `401`, `403` et `404` ne creent pas d'issue.
- Traces : 10 % en staging et 2 % en production.
- Profiling : 10 % des sessions deja selectionnees par le tracing.
- Replay : aucune session normale ; session complete uniquement lorsqu'une
  erreur est capturee.
- Logs : evenements structures sans contenu utilisateur.
- Metriques : compteurs d'operations et durees par route logique, methode,
  resultat et role.

Le Replay masque tous les textes et bloque tous les medias. Les payloads Sentry
suppriment les corps HTTP, cookies, headers, query strings, emails, tokens,
mots de passe, notes, contenus, noms et prenoms. Seuls l'identifiant utilisateur
pseudonyme et le role peuvent etre associes aux erreurs serveur authentifiees.

## Releases et integration GitHub

`withSentryConfig` detecte automatiquement le `git HEAD` pendant chaque build,
injecte ce SHA dans les SDK client et serveur, cree la release et associe les
commits disponibles dans le clone Dokploy. L'integration GitHub Sentry peut
alors relier les stack traces, commits et auteurs. Les source maps sont
supprimees de l'artefact apres leur upload.

## Verification sur staging

1. Deployer un commit avec toutes les variables ci-dessus.
2. Provoquer temporairement une erreur navigateur depuis les outils de
   developpement et une erreur serveur dans une branche de verification.
3. Verifier dans Sentry l'environnement `staging`, le SHA de release et la
   lisibilite des fichiers TypeScript dans la stack trace.
4. Verifier la presence d'un log, d'une trace, d'une metrique, d'un profil et
   d'un Replay lie a l'erreur.
5. Examiner les payloads et confirmer l'absence d'email, cookie, token, note,
   contenu de formulaire et query string.
6. Retirer le code de faute controlee avant fusion. Aucune route publique de
   test Sentry ne doit rester dans le depot.

## Rotation et diagnostic

- Creer un nouveau token Sentry avec les droits de release et source maps,
  remplacer le secret dans Dokploy, redeployer, puis revoquer l'ancien token.
- Si aucune source map n'apparait, verifier les logs du build Dokploy,
  `SENTRY_UPLOAD_SOURCE_MAPS=true`, le token, l'organisation, le projet et le
  SHA de release.
- Si aucun evenement n'apparait, verifier le DSN et les deux variables
  d'environnement. Les valeurs autres que `staging` et `production`
  desactivent volontairement le SDK.
- Si le quota augmente trop vite, conserver les erreurs a 100 % et reduire en
  priorite les traces ou le Replay sur erreur.

Pour une inspection API en lecture seule, definir localement un
`SENTRY_AUTH_TOKEN` avec `org:read`, `project:read` et `event:read`. Ne jamais
coller ce token dans une conversation ou un ticket.
