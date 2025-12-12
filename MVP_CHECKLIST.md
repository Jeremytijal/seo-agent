# ✅ Checklist MVP - SEO Agent
## Vérification avant lancement des ads

### 🟢 **FONCTIONNALITÉS CRITIQUES - OK**

#### 1. **Flow d'Onboarding** ✅
- ✅ Page d'onboarding avec 4 étapes (Bienvenue → Sites → Mots-clés → Calendrier)
- ✅ Analyse de site + 3 concurrents
- ✅ Sélection de mots-clés
- ✅ Prévisualisation calendrier
- ✅ Redirection vers subscription après onboarding
- ⚠️ **MANQUE**: Endpoint backend `/api/keywords/analyze-competitors` (actuellement fallback simulé)

#### 2. **Paiement & Abonnements** ✅
- ✅ Page subscription avec 2 plans (Starter 29€, Pro 49€)
- ✅ Intégration Stripe avec code promo EARLYBIRD50 automatique
- ✅ Webhook Stripe pour gérer les abonnements
- ✅ Redirection vers calendrier après activation
- ✅ Gestion des essais gratuits (7 jours)

#### 3. **Recherche de Mots-clés** ✅
- ✅ Page Keywords fonctionnelle
- ✅ API `/api/keywords/search` implémentée
- ✅ Sauvegarde favoris (`/api/keywords/favorites/:userId`)
- ✅ Bouton "Ajouter au calendrier"
- ⚠️ **NOTE**: Données simulées par OpenAI (pas de vraie API DataForSEO/SerpAPI)

#### 4. **Génération de Contenu** ✅
- ✅ Page Contents avec génération d'articles
- ✅ API `/api/content/generate` implémentée
- ✅ Options: tone, length, FAQ, images
- ✅ Sauvegarde articles dans Supabase
- ✅ Preview et édition

#### 5. **Planificateur de Contenu** ✅
- ✅ Calendrier mensuel avec drag & drop
- ✅ Articles depuis onboarding chargés depuis localStorage
- ✅ Bannières (activé, génération, connecter site)
- ✅ Popup expert après 3s si pas de site connecté
- ✅ Bouton "Générer des idées" → redirige vers Keywords

#### 6. **Connexion WordPress** ✅
- ✅ Page Integrations avec connexion WordPress
- ✅ Test de connexion (`/api/sites/test-connection`)
- ✅ Connexion site (`/api/sites/connect`)
- ✅ Chiffrement credentials (AES-256)
- ✅ Demande aide experte gratuite

#### 7. **Publication** ✅
- ✅ Page Publish avec liste articles
- ✅ API `/api/wordpress/publish` implémentée
- ✅ Sélection site connecté
- ✅ Statuts: draft, scheduled, published

#### 8. **Dashboard** ✅
- ✅ KPIs (articles, mots-clés, audits, sites)
- ✅ Graphiques activité
- ✅ Actions rapides
- ✅ Contenu récent
- ✅ Bannière "Connecter votre site" si 0 sites

---

### 🟡 **ÉLÉMENTS À VÉRIFIER / AMÉLIORER**

#### 1. **Audit SEO** ⚠️
- ⚠️ Page AuditSEO existe mais **simulation uniquement**
- ❌ Pas d'API backend `/api/seo/audit` implémentée
- 💡 **Action**: Soit désactiver temporairement, soit implémenter un audit basique

#### 2. **Endpoint Onboarding Manquant** ⚠️
- ❌ `/api/keywords/analyze-competitors` n'existe pas dans le backend
- ✅ Fallback simulé fonctionne dans le frontend
- 💡 **Action**: Implémenter l'endpoint ou garder le fallback pour MVP

#### 3. **Variables d'Environnement** ⚠️
**Frontend (Netlify):**
- ✅ `VITE_SUPABASE_URL`
- ✅ `VITE_SUPABASE_ANON_KEY`
- ✅ `VITE_API_URL` (doit pointer vers Railway)
- ⚠️ `VITE_STRIPE_PUBLIC_KEY` (vérifier si utilisée)

**Backend (Railway):**
- ✅ `SUPABASE_URL`
- ✅ `SUPABASE_SERVICE_KEY`
- ✅ `OPENAI_API_KEY`
- ✅ `STRIPE_SECRET_KEY`
- ✅ `STRIPE_WEBHOOK_SECRET`
- ✅ `STRIPE_EARLYBIRD_COUPON_ID` (vérifier que le coupon existe dans Stripe)
- ✅ `ENCRYPTION_KEY` (pour WordPress passwords)

#### 4. **Base de Données Supabase** ⚠️
Vérifier que ces tables existent:
- ✅ `profiles` (avec colonnes: subscription_plan, subscription_status, stripe_customer_id, etc.)
- ✅ `keywords` (favoris)
- ✅ `keyword_searches` (historique)
- ✅ `articles` (contenus générés)
- ✅ `connected_sites` (sites WordPress)
- ✅ `expert_requests` (demandes d'aide)

#### 5. **Stripe Configuration** ⚠️
- ✅ Produits créés: `price_1SdY1tG7TquWCqOJA8uMm6RS` (Starter) et `price_1SdY29G7TquWCqOJ77Tya1j1` (Pro)
- ✅ Coupon `EARLYBIRD50` créé dans Stripe Dashboard
- ✅ `STRIPE_EARLYBIRD_COUPON_ID` configuré sur Railway
- ⚠️ Webhook Stripe configuré sur Railway: `/api/stripe/webhook`
- ⚠️ URL webhook configurée dans Stripe Dashboard

#### 6. **Landing Page** ✅
- ✅ Design moderne (light theme)
- ✅ Sections: Hero, Features, How it works, Stats, Testimonials, Pricing, FAQ
- ✅ CTA vers signup
- ✅ Responsive

#### 7. **Pages Légales** ✅
- ✅ Terms (`/terms`)
- ✅ Privacy (`/privacy`)

---

### 🔴 **ÉLÉMENTS MANQUANTS / À CORRIGER**

#### 1. **Page Audit SEO** 🔴
- ❌ **CRITIQUE**: Page existe mais ne fait que simuler
- 💡 **Options**:
  - Option A: Désactiver temporairement (retirer de sidebar)
  - Option B: Implémenter un audit basique (meta tags, title, description, headings)

#### 2. **Endpoint analyze-competitors** 🔴
- ❌ Backend n'a pas `/api/keywords/analyze-competitors`
- ✅ Frontend a un fallback qui fonctionne
- 💡 **Recommandation**: Garder le fallback pour MVP, implémenter plus tard

#### 3. **Gestion des Erreurs** ⚠️
- ⚠️ Vérifier que toutes les erreurs API sont bien gérées
- ⚠️ Messages d'erreur utilisateur-friendly
- ⚠️ Loading states partout

#### 4. **Tests de Bout en Bout** ⚠️
**À tester manuellement:**
1. ✅ Signup → Onboarding → Subscription → Activation
2. ✅ Recherche mots-clés → Ajouter au calendrier
3. ✅ Génération article → Preview → Sauvegarde
4. ✅ Connexion WordPress → Test → Connexion
5. ✅ Publication article → WordPress
6. ⚠️ Webhook Stripe (test avec Stripe CLI ou mode test)

---

### 📋 **CHECKLIST FINALE AVANT ADS**

#### Configuration Technique
- [ ] Variables d'environnement vérifiées (Netlify + Railway)
- [ ] Stripe webhook configuré et testé
- [ ] Coupon EARLYBIRD50 créé dans Stripe
- [ ] Base de données Supabase complète (toutes les tables)
- [ ] API backend accessible (Railway)
- [ ] Frontend déployé (Netlify)

#### Fonctionnalités
- [ ] Flow onboarding complet fonctionne
- [ ] Paiement Stripe fonctionne (mode test)
- [ ] Génération contenu fonctionne
- [ ] Connexion WordPress fonctionne
- [ ] Publication WordPress fonctionne
- [ ] Calendrier charge les articles onboarding

#### UX/UI
- [ ] Landing page responsive
- [ ] Tous les liens fonctionnent
- [ ] Messages d'erreur clairs
- [ ] Loading states partout
- [ ] Bannières et popups fonctionnent

#### Décisions à Prendre
- [ ] **Audit SEO**: Désactiver ou implémenter basique?
- [ ] **Données mots-clés**: Accepter simulation pour MVP ou intégrer vraie API?

---

### 🚀 **RECOMMANDATIONS POUR MVP**

1. **Désactiver temporairement Audit SEO** (retirer de sidebar) - peut être ajouté après
2. **Garder le fallback simulateur** pour analyze-competitors - fonctionne bien pour MVP
3. **Tester le flow complet** avec un compte test Stripe
4. **Vérifier les webhooks Stripe** en mode test
5. **Documenter les limitations** (données simulées) pour les premiers clients

### ✅ **PRÊT POUR ADS SI:**
- ✅ Flow onboarding → subscription → activation fonctionne
- ✅ Génération contenu fonctionne
- ✅ Connexion WordPress fonctionne
- ✅ Stripe configuré et testé
- ✅ Variables d'environnement correctes
- ✅ Base de données complète

### ⚠️ **À FAIRE AVANT ADS:**
1. Tester le flow complet avec compte test
2. Vérifier webhook Stripe
3. Décider pour Audit SEO (désactiver ou implémenter)
4. Vérifier toutes les variables d'environnement

---

**Date de vérification**: 2025-01-12
**Statut global**: 🟡 **Presque prêt** - Quelques ajustements mineurs recommandés

