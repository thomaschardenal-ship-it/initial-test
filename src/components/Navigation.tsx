import { NavLink } from 'react-router-dom';
import { Home, List, BarChart3, Settings } from 'lucide-react';

export function Navigation() {
  const linkClasses = ({ isActive }: { isActive: boolean }) => `
    flex flex-col items-center justify-center gap-1 flex-1 py-2 px-3
    transition-colors duration-200
    ${isActive ? 'text-primary' : 'text-gray-400'}
  `;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-slate-800 border-t border-slate-700 pb-safe">
      <div className="flex justify-around items-center h-16 max-w-2xl mx-auto">
        <NavLink to="/" className={linkClasses}>
          {({ isActive }) => (
            <>
              <Home size={24} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-xs font-medium">Accueil</span>
            </>
          )}
        </NavLink>

        <NavLink to="/history" className={linkClasses}>
          {({ isActive }) => (
            <>
              <List size={24} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-xs font-medium">Historique</span>
            </>
          )}
        </NavLink>

        <NavLink to="/statistics" className={linkClasses}>
          {({ isActive }) => (
            <>
              <BarChart3 size={24} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-xs font-medium">Stats</span>
            </>
          )}
        </NavLink>

        <NavLink to="/settings" className={linkClasses}>
          {({ isActive }) => (
            <>
              <Settings size={24} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-xs font-medium">Réglages</span>
            </>
          )}
        </NavLink>
      </div>
    </nav>
  );
}
