# Noir et Crème — Menu digital

Carte numérique du coffee shop **Noir et Crème** (Gambetta, Oran), avec un espace
d'administration pour modifier produits et prix sans toucher au code.

- **Carte publique** — `/` : thème noir & crème, navigation par catégorie.
- **Administration** — `/admin` : ajout / modification / suppression des produits,
  des catégories et des informations du café.

## Stack

Next.js 15 (App Router) · Tailwind CSS · Supabase (PostgreSQL) · Vercel

## Architecture

La carte est lue publiquement avec la clé *publishable* Supabase : les policies RLS
n'autorisent que le `SELECT`, et les rôles `anon` / `authenticated` n'ont aucun
droit d'écriture sur les tables.

Les écritures passent exclusivement par des fonctions `SECURITY DEFINER`
(`noir_admin_*`) protégées par un secret partagé qui ne quitte jamais le serveur.
Le navigateur ne reçoit donc jamais de clé d'écriture.

Si Supabase est injoignable, la carte imprimée est servie depuis
`src/lib/fallback.ts` : le site ne s'affiche jamais vide.

## Développement

```bash
npm install
cp .env.example .env.local   # puis renseigner les variables
npm run dev
```

## Variables d'environnement

| Variable | Rôle |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | URL du projet Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clé publique (lecture seule via RLS) |
| `SUPABASE_ADMIN_TOKEN` | Secret serveur vérifié par les RPC `noir_admin_*` |
| `AUTH_SECRET` | Clé de signature du cookie de session admin |
| `ADMIN_USERNAME` / `ADMIN_PASSWORD` | Identifiants du tableau de bord |

Les identifiants sont comparés sans tenir compte de la casse, des accents ni des
espaces multiples : « Noir Est Crème » équivaut à « noir est creme ».

## Base de données

Les migrations appliquées se trouvent dans `supabase/migrations/`. Toutes les
tables sont préfixées `noir_` afin de cohabiter sans collision avec d'autres
schémas présents sur le même projet Supabase.
