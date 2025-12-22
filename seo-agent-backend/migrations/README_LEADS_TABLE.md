# Migration de la table `leads`

## Problème
L'erreur `Could not find the table 'public.leads'` indique que la table n'existe pas encore dans Supabase.

## Solution

### Étape 1 : Ouvrir Supabase SQL Editor
1. Allez sur https://supabase.com
2. Connectez-vous à votre projet
3. Allez dans **SQL Editor** (menu de gauche)

### Étape 2 : Exécuter la migration
Copiez-collez le contenu du fichier `create_leads_table.sql` dans l'éditeur SQL et exécutez-le.

### Étape 3 : Vérifier
Après exécution, vérifiez que la table existe :
```sql
SELECT * FROM leads LIMIT 1;
```

## Structure de la table

La table `leads` contient :
- `id` : UUID (clé primaire)
- `email` : TEXT (unique, indexé)
- `source` : TEXT (meta, google, direct, organic)
- `variant` : TEXT (A, B, C)
- `created_at` : TIMESTAMP
- `updated_at` : TIMESTAMP
- `converted_at` : TIMESTAMP (optionnel)
- `converted` : BOOLEAN (défaut: false)
- `metadata` : JSONB (données supplémentaires)

## Index créés
- Index unique sur `email` (évite les doublons)
- Index sur `source` et `variant` (recherche rapide)
- Index sur `created_at` (tri par date)

## Notes
- La contrainte unique sur `email` empêche les doublons
- Les erreurs de doublon sont gérées gracieusement dans le code (code 23505)

