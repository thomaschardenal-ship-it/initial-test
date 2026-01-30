# 🕐 NannyTimer

Application de pointage moderne pour suivre les heures de garde de votre nounou.

![NannyTimer](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Tailwind](https://img.shields.io/badge/Tailwind-4-38bdf8?style=flat-square&logo=tailwindcss)
![Supabase](https://img.shields.io/badge/Supabase-Database-3ecf8e?style=flat-square&logo=supabase)

## ✨ Fonctionnalités

- 📍 **Géolocalisation** : La nounou ne peut pointer que si elle est sur le lieu de travail (rayon de 50m)
- ⏱️ **Chronomètre en temps réel** : Suivi précis des heures de travail
- 📊 **Dashboard employeur** : Graphiques et statistiques détaillées
- 📱 **Mobile-first** : Design responsive optimisé pour smartphone
- 📧 **Récapitulatif hebdomadaire** : Email automatique chaque vendredi soir
- 🔐 **Authentification sécurisée** : Comptes séparés employeur/nounou
- 📅 **Historique complet** : Suivi sur l'année

## 🚀 Installation

### Prérequis

- Node.js 18+
- Compte [Supabase](https://supabase.com) (gratuit)
- Compte [Vercel](https://vercel.com) (gratuit)

### 1. Cloner et installer

```bash
cd nannytimer
npm install
```

### 2. Configurer Supabase

1. Créez un nouveau projet sur [Supabase](https://supabase.com)
2. Allez dans **SQL Editor** et exécutez le contenu de `supabase-schema.sql`
3. Copiez vos clés API depuis **Settings > API**

### 3. Variables d'environnement

Créez un fichier `.env.local` à la racine :

```env
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre-clé-anon
SUPABASE_SERVICE_ROLE_KEY=votre-clé-service
CRON_SECRET=un-secret-aléatoire
```

### 4. Lancer en développement

```bash
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000)

## 📱 Utilisation

### Pour l'employeur

1. Créez un compte en sélectionnant "Employeur"
2. Ajoutez votre nounou via son email (elle doit d'abord créer son compte)
3. Consultez le dashboard pour voir les heures en temps réel

### Pour la nounou

1. Créez un compte en sélectionnant "Nounou"
2. Attendez que l'employeur vous associe à son compte
3. Configurez l'adresse du lieu de travail
4. Utilisez le bouton de pointage quand vous arrivez/partez

## 📧 Notifications Email

Pour activer les emails hebdomadaires automatiques :

1. Inscrivez-vous sur [Resend](https://resend.com) (gratuit)
2. Ajoutez `RESEND_API_KEY` à vos variables d'environnement
3. Configurez un cron job sur Vercel pour appeler `/api/send-report` chaque vendredi à 18h

## 🚀 Déploiement sur Vercel

```bash
npm run build
vercel --prod
```

N'oubliez pas d'ajouter vos variables d'environnement dans les paramètres Vercel.

## 🛠️ Stack technique

- **Framework** : Next.js 15 (App Router)
- **Language** : TypeScript
- **Styling** : Tailwind CSS 4
- **Database** : Supabase (PostgreSQL)
- **Auth** : Supabase Auth
- **Charts** : Recharts
- **Icons** : Lucide React
- **Dates** : date-fns

## 📁 Structure du projet

```
nannytimer/
├── src/
│   ├── app/                 # Pages Next.js
│   │   ├── api/            # API routes
│   │   ├── dashboard/      # Dashboard employeur
│   │   ├── timer/          # Page pointeuse
│   │   ├── login/          # Connexion
│   │   ├── register/       # Inscription
│   │   └── setup/          # Configuration nounou
│   ├── components/         # Composants React
│   ├── contexts/           # Contextes (Auth)
│   ├── hooks/              # Hooks personnalisés
│   └── lib/                # Utilitaires
├── public/                 # Assets statiques
└── supabase-schema.sql    # Schéma de base de données
```

## 📄 Licence

MIT - Libre d'utilisation et modification.

---

Fait avec 💜 pour simplifier le suivi des heures de garde
