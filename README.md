# Nanny Hours Tracker - PWA

A Progressive Web App (PWA) for tracking your nanny's working hours with automatic report generation.

![Stack](https://img.shields.io/badge/React-19-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-blue)
![PWA](https://img.shields.io/badge/PWA-Ready-green)

## Features

- **Clock In/Out** : Large, easy-to-use buttons for arrival and departure
- **Real-time Timer** : Live elapsed time display during active sessions
- **Session History** : Complete list of all sessions with delete functionality
- **Statistics** : Weekly and monthly views with progress tracking
- **Automatic Notifications** : SMS or Email sent automatically at the end of each session
- **Offline Mode** : Works without internet connection using IndexedDB
- **Mobile Installable** : Add to home screen for a native app experience

## Tech Stack

- **Framework** : React 19 + TypeScript
- **Build Tool** : Vite
- **Styling** : Tailwind CSS 4
- **Routing** : React Router DOM v7
- **Local Database** : Dexie.js (IndexedDB wrapper)
- **PWA** : vite-plugin-pwa
- **Icons** : Lucide React
- **Hosting** : GitHub Pages

## Installation

### Prerequisites

- Node.js 20+
- npm or yarn

### Local Setup

```bash
# Clone the repository
git clone https://github.com/thomaschardenal-ship-it/initial-test.git
cd initial-test

# Install dependencies
npm install

# Run in development mode
npm run dev
```

The app will be accessible at `http://localhost:5173`

## Deploying to GitHub Pages

### Initial Configuration

1. **Create a GitHub repository** named `initial-test` (or your preferred name)

2. **Update the base path** in `vite.config.ts`:
   ```typescript
   export default defineConfig({
     base: '/your-repo-name/',
     // ...
   })
   ```

3. **Push code to GitHub**:
   ```bash
   git remote add origin https://github.com/your-username/your-repo-name.git
   git push -u origin main
   ```

4. **Enable GitHub Pages**:
   - Go to Settings > Pages
   - Source: Select "GitHub Actions"

5. **Automatic Deployment**:
   - The GitHub Actions workflow (`.github/workflows/jekyll-gh-pages.yml`) triggers automatically on every push to `main`
   - The app will be available at: `https://your-username.github.io/your-repo-name/`

### Manual Build

```bash
# Create production build
npm run build

# Preview the build
npm run preview
```

## Installing on iPhone/iPad

1. Open the app URL in **Safari** (default browser)
2. Tap the **Share** button (square with arrow pointing up)
3. Scroll down and select **"Add to Home Screen"**
4. Confirm the name and tap **"Add"**

The app now appears as a native app on your home screen!

## Installing on Android

1. Open the app URL in **Chrome**
2. Tap the menu (three vertical dots)
3. Select **"Add to Home screen"**
4. Confirm the name and tap **"Add"**

## Usage

### First Time Setup

1. Go to **Settings** (gear icon at bottom)
2. Enter your name
3. Choose send method (SMS or Email)
4. Enter the recipient's phone number or email address
5. Save and test with the **"Test"** button

### Daily Clock In/Out

1. **Clock In**: Tap the green "Clock In" button when arriving
2. Timer starts automatically
3. **Clock Out**: Tap the red "Clock Out" button when leaving
4. A message is automatically sent with session details

### View History

- **History** tab: List of all sessions grouped by date
- Delete sessions by tapping the trash icon

### View Statistics

- **Stats** tab: Weekly and monthly views
- Progress toward 35-hour weekly goal
- Daily average and session count

## Project Structure

```
nanny-hours-tracker/
├── public/
│   └── icons/                # PWA icons
├── src/
│   ├── components/
│   │   ├── Navigation.tsx    # Navigation bar
│   │   └── StatCard.tsx      # Statistics card
│   ├── pages/
│   │   ├── Home.tsx          # Home page with clock in/out
│   │   ├── History.tsx       # Session history
│   │   ├── Statistics.tsx    # Statistics
│   │   └── Settings.tsx      # Configuration
│   ├── hooks/
│   │   └── useSession.ts     # Hook to manage sessions
│   ├── services/
│   │   ├── database.ts       # Dexie.js service
│   │   └── messageService.ts # SMS/Email sending
│   ├── types/
│   │   └── index.ts          # TypeScript types
│   ├── utils/
│   │   └── timeUtils.ts      # Utility functions
│   ├── App.tsx               # Main component
│   ├── main.tsx              # Entry point
│   └── index.css             # Global styles
├── .github/
│   └── workflows/
│       └── jekyll-gh-pages.yml  # GitHub Actions workflow
├── vite.config.ts            # Vite + PWA configuration
├── tailwind.config.js        # Tailwind configuration
└── package.json
```

## Customization

### PWA Icons

To customize app icons:

1. Create two PNG icons:
   - `icon-192x192.png` (192x192 pixels)
   - `icon-512x512.png` (512x512 pixels)

2. Place them in `public/icons/`

3. Easily generate icons at [RealFaviconGenerator](https://realfavicongenerator.net/)

### Weekly Goal

Modify the goal in `src/pages/Statistics.tsx`:

```typescript
const weeklyGoal = 35; // Change here
```

### Colors

Modify colors in `tailwind.config.js`:

```javascript
colors: {
  primary: '#10b981', // Emerald green
  danger: '#ef4444',  // Red
}
```

## Data & Privacy

- **Local Storage Only**: All data is stored locally in your browser via IndexedDB
- **No Server**: No data is sent to external servers
- **Messages**: SMS/Emails are sent via your device's native app

## Technologies Used

- [React](https://react.dev/) - UI Framework
- [TypeScript](https://www.typescriptlang.org/) - Static typing
- [Vite](https://vitejs.dev/) - Fast build tool
- [Tailwind CSS](https://tailwindcss.com/) - Utility CSS framework
- [Dexie.js](https://dexie.org/) - IndexedDB wrapper
- [React Router](https://reactrouter.com/) - Routing
- [Lucide React](https://lucide.dev/) - Icons
- [vite-plugin-pwa](https://vite-pwa-org.netlify.app/) - PWA plugin

## Contributing

Contributions are welcome! Feel free to open an issue or pull request.

## License

MIT

## Support

For any questions or issues, please open an issue on GitHub.

---

Built with ❤️ for tracking nanny hours
