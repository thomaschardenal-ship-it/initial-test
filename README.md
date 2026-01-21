# Pointeuse Digitale - PWA

Application Web Progressive (PWA) de suivi du temps de présence avec génération automatique de rapports.

![Stack](https://img.shields.io/badge/React-18-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-blue)
![PWA](https://img.shields.io/badge/PWA-Ready-green)

## Fonctionnalités

- **Pointage entrée/sortie** : Bouton central pour pointer son arrivée et son départ
- **Chronomètre en temps réel** : Affichage du temps écoulé pendant la session
- **Historique des sessions** : Liste complète de toutes les sessions avec possibilité de suppression
- **Statistiques** : Vues hebdomadaires et mensuelles avec graphiques de progression
- **Envoi automatique de messages** : SMS ou Email envoyés automatiquement à la fin de chaque session
- **Mode hors ligne** : Fonctionne sans connexion internet grâce à IndexedDB
- **Installable sur mobile** : Ajout à l'écran d'accueil pour une expérience native

## Stack Technique

- **Framework** : React 18 + TypeScript
- **Build Tool** : Vite
- **Styling** : Tailwind CSS
- **Routing** : React Router DOM v6
- **Base de données locale** : Dexie.js (wrapper IndexedDB)
- **PWA** : vite-plugin-pwa
- **Icônes** : Lucide React
- **Hébergement** : GitHub Pages

## Installation

### Prérequis

- Node.js 20+
- npm ou yarn

### Installation locale

```bash
# Cloner le repository
git clone https://github.com/votre-username/pointeuse-digitale.git
cd pointeuse-digitale

# Installer les dépendances
npm install

# Lancer en développement
npm run dev
```

L'application sera accessible sur `http://localhost:5173`

## Déploiement sur GitHub Pages

### Configuration initiale

1. **Créer un repository GitHub** nommé `pointeuse-digitale` (ou autre nom)

2. **Mettre à jour le base path** dans `vite.config.ts` :
   ```typescript
   export default defineConfig({
     base: '/nom-de-votre-repo/',
     // ...
   })
   ```

3. **Pousser le code sur GitHub** :
   ```bash
   git remote add origin https://github.com/votre-username/pointeuse-digitale.git
   git push -u origin main
   ```

4. **Activer GitHub Pages** :
   - Aller dans Settings > Pages
   - Source : Sélectionner "GitHub Actions"

5. **Déploiement automatique** :
   - Le workflow GitHub Actions (`.github/workflows/deploy.yml`) se déclenche automatiquement à chaque push sur `main`
   - L'app sera disponible sur : `https://votre-username.github.io/pointeuse-digitale/`

### Build manuel

```bash
# Créer le build de production
npm run build

# Prévisualiser le build
npm run preview
```

## Installation sur iPhone/iPad

1. Ouvrir l'URL de l'application dans **Safari** (navigateur par défaut)
2. Appuyer sur le bouton **Partager** (carré avec flèche vers le haut)
3. Faire défiler et sélectionner **"Sur l'écran d'accueil"**
4. Confirmer le nom et appuyer sur **"Ajouter"**

L'application apparaît maintenant comme une app native sur l'écran d'accueil !

## Installation sur Android

1. Ouvrir l'URL de l'application dans **Chrome**
2. Appuyer sur le menu (trois points verticaux)
3. Sélectionner **"Ajouter à l'écran d'accueil"**
4. Confirmer le nom et appuyer sur **"Ajouter"**

## Utilisation

### Premier démarrage

1. Aller dans **Réglages** (icône engrenage en bas)
2. Renseigner votre nom
3. Choisir la méthode d'envoi (SMS ou Email)
4. Renseigner le numéro de téléphone ou l'email du destinataire
5. Sauvegarder et tester avec le bouton **"Test"**

### Pointage quotidien

1. **Arrivée** : Appuyer sur le bouton vert "Pointer Entrée"
2. Le chronomètre démarre automatiquement
3. **Départ** : Appuyer sur le bouton rouge "Pointer Sortie"
4. Un message est automatiquement envoyé avec les détails de la session

### Consulter l'historique

- Onglet **Historique** : Liste de toutes les sessions groupées par date
- Possibilité de supprimer des sessions en appuyant sur l'icône poubelle

### Visualiser les statistiques

- Onglet **Stats** : Vue hebdomadaire et mensuelle
- Progression vers l'objectif hebdomadaire de 35h
- Moyenne journalière et nombre de sessions

## Architecture du projet

```
pointeuse-digitale/
├── public/
│   └── icons/                # Icônes PWA (à ajouter)
├── src/
│   ├── components/
│   │   ├── Navigation.tsx    # Barre de navigation
│   │   └── StatCard.tsx      # Carte de statistique
│   ├── pages/
│   │   ├── Home.tsx          # Page d'accueil avec pointage
│   │   ├── History.tsx       # Historique des sessions
│   │   ├── Statistics.tsx    # Statistiques
│   │   └── Settings.tsx      # Configuration
│   ├── hooks/
│   │   └── useSession.ts     # Hook pour gérer les sessions
│   ├── services/
│   │   ├── database.ts       # Service Dexie.js
│   │   └── messageService.ts # Envoi SMS/Email
│   ├── types/
│   │   └── index.ts          # Types TypeScript
│   ├── utils/
│   │   └── timeUtils.ts      # Fonctions utilitaires
│   ├── App.tsx               # Composant principal
│   ├── main.tsx              # Point d'entrée
│   └── index.css             # Styles globaux
├── .github/
│   └── workflows/
│       └── deploy.yml        # Workflow GitHub Actions
├── vite.config.ts            # Configuration Vite + PWA
├── tailwind.config.js        # Configuration Tailwind
└── package.json
```

## Personnalisation

### Icônes PWA

Pour personnaliser les icônes de l'application :

1. Créer deux icônes PNG :
   - `icon-192x192.png` (192x192 pixels)
   - `icon-512x512.png` (512x512 pixels)

2. Les placer dans `public/icons/`

3. Générer facilement des icônes sur [RealFaviconGenerator](https://realfavicongenerator.net/)

### Objectif hebdomadaire

Modifier l'objectif dans `src/pages/Statistics.tsx` :

```typescript
const weeklyGoal = 35; // Changer ici
```

### Couleurs

Modifier les couleurs dans `tailwind.config.js` :

```javascript
colors: {
  primary: '#10b981', // Vert émeraude
  danger: '#ef4444',  // Rouge
}
```

## Données et confidentialité

- **Stockage local uniquement** : Toutes les données sont stockées localement dans votre navigateur via IndexedDB
- **Aucun serveur** : Aucune donnée n'est envoyée à un serveur externe
- **Messages** : Les SMS/Emails sont envoyés via l'application native de votre appareil

## Technologies utilisées

- [React](https://react.dev/) - Framework UI
- [TypeScript](https://www.typescriptlang.org/) - Typage statique
- [Vite](https://vitejs.dev/) - Build tool rapide
- [Tailwind CSS](https://tailwindcss.com/) - Framework CSS utilitaire
- [Dexie.js](https://dexie.org/) - Wrapper IndexedDB
- [React Router](https://reactrouter.com/) - Routing
- [Lucide React](https://lucide.dev/) - Icônes
- [vite-plugin-pwa](https://vite-pwa-org.netlify.app/) - Plugin PWA

## Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou une pull request.

## License

MIT

## Support

Pour toute question ou problème, ouvrez une issue sur GitHub.

---

Développé avec ❤️ par [Votre Nom]
