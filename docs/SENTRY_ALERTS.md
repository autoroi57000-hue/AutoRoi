# Configuration des alertes Sentry — Auto Roi

## Prérequis

1. Créer un compte sur [sentry.io](https://sentry.io) (plan gratuit : 5 000 erreurs/mois)
2. Créer une organisation (ex: `auto-roi`)
3. Créer un projet Next.js (ex: `auto-roi-web`)
4. Copier le DSN dans `.env.local` et dans Vercel > Environment Variables

## Variables d'environnement

```env
# .env.local + Vercel Environment Variables
NEXT_PUBLIC_SENTRY_DSN=https://xxx@o123.ingest.sentry.io/456
SENTRY_DSN=https://xxx@o123.ingest.sentry.io/456
SENTRY_ORG=auto-roi
SENTRY_PROJECT=auto-roi-web
SENTRY_AUTH_TOKEN=sntrys_xxx  # Settings > Auth Tokens > Create New Token
```

## Alertes à configurer

Aller dans **Sentry > Alerts > Create Alert Rule**

### 1. Erreur Stripe Webhook (CRITIQUE)

- **When**: An event is seen with tag `action:stripe_webhook`
- **Filter**: Event level is `error`
- **Then**: Send email notification
- **Frequency**: Every time (no cooldown)
- **Reason**: Un échec webhook = réservation payée mais non confirmée

### 2. Erreur Resend / Email (HAUTE)

- **When**: An event is seen with tag `action:sendRentalEmail`
- **Filter**: Event level is `error`
- **Then**: Send email notification
- **Frequency**: At most once every 10 minutes
- **Reason**: Client ne reçoit pas sa confirmation / contrat

### 3. Erreur Supabase / DB (HAUTE)

- **When**: An event matching `*supabase*` OR `*postgres*` is seen
- **Filter**: Event level is `error`
- **Then**: Send email notification
- **Frequency**: At most once every 5 minutes
- **Reason**: DB down = site entièrement cassé

### 4. Taux d'erreur élevé (MOYENNE)

- **Type**: Metric Alert
- **When**: Error count > 50 in 5 minutes
- **Then**: Send email notification
- **Reason**: Détection d'un incident global (déploiement cassé, etc.)

### 5. Erreur génération contrat PDF (HAUTE)

- **When**: An event is seen with tag `action:generateRentalContract`
- **Filter**: Event level is `error`
- **Then**: Send email notification
- **Frequency**: Every time
- **Reason**: Client ne reçoit pas son contrat de location

## Vérification post-déploiement

Après le premier déploiement avec Sentry :

1. Ouvrir le site en production
2. Ouvrir la console navigateur → vérifier qu'il n'y a pas d'erreur Sentry
3. Dans Sentry Dashboard → vérifier que le projet reçoit des "transactions" (performance)
4. Tester une action qui génère une erreur → vérifier qu'elle apparaît dans Sentry

## Source Maps

Les source maps sont uploadées automatiquement lors du build si `SENTRY_AUTH_TOKEN` est défini.
Pour créer un token : **Settings > Auth Tokens > Create New Token** (scope: `project:releases`).
