import { useState, useEffect } from 'react';
import { ArrowRight, ArrowLeft, MapPin, Settings as SettingsIcon, AlertTriangle } from 'lucide-react';
import { useSession } from '../hooks/useSession';
import { useNavigate } from 'react-router-dom';

export function Home() {
  const { isClocked, clockIn, clockOut } = useSession();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isAnimating, setIsAnimating] = useState(false);
  const navigate = useNavigate();

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleClick = async () => {
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 300);

    if (isClocked) {
      await clockOut();
    } else {
      await clockIn();
    }
  };

  // Format time as HH:MM:SS
  const formatClock = (date: Date) => {
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  // Format date as "Jour DD Mois"
  const formatFullDate = (date: Date) => {
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    });
  };

  // Capitalize first letter
  const capitalizeFirst = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-between p-6 pb-24 pt-12">
      {/* Top Section: Clock and Date */}
      <div className="w-full text-center space-y-4">
        {/* Digital Clock */}
        <div className="text-7xl font-light tracking-wider text-white/90">
          {formatClock(currentTime)}
        </div>

        {/* Date */}
        <div className="text-lg text-slate-400">
          {capitalizeFirst(formatFullDate(currentTime))}
        </div>

        {/* Configure Location Button */}
        <button
          onClick={() => navigate('/settings')}
          className="mt-6 px-6 py-3 bg-secondary/80 hover:bg-secondary text-white rounded-full font-medium text-sm flex items-center gap-2 mx-auto transition-colors"
        >
          <MapPin size={18} />
          Configurez votre lieu de travail
        </button>
      </div>

      {/* Center Section: Main Clock Button */}
      <div className="flex flex-col items-center gap-6">
        <button
          onClick={handleClick}
          className={`
            relative w-80 h-80 rounded-full flex flex-col items-center justify-center
            transition-all duration-300 shadow-2xl
            ${isAnimating ? 'scale-95' : 'scale-100'}
            ${isClocked
              ? 'bg-slate-700/50 hover:bg-slate-700/70 border-2 border-slate-600'
              : 'bg-slate-700/50 hover:bg-slate-700/70 border-2 border-slate-600'
            }
          `}
        >
          <div className="flex flex-col items-center gap-4">
            {isClocked ? (
              <ArrowLeft className="w-16 h-16 text-slate-400" strokeWidth={2} />
            ) : (
              <ArrowRight className="w-16 h-16 text-slate-400" strokeWidth={2} />
            )}
            <span className="text-xl font-bold text-slate-400 tracking-wider">
              {isClocked ? 'POINTER SORTIE' : 'POINTER ARRIVEE'}
            </span>
          </div>
        </button>

        {/* Out of Work Zone Button */}
        <button
          className="px-6 py-3 bg-secondary/80 hover:bg-secondary text-white rounded-full font-medium text-sm flex items-center gap-2 transition-colors"
        >
          <AlertTriangle size={18} />
          Hors zone de travail
        </button>
      </div>

      {/* Bottom spacer */}
      <div className="h-4"></div>
    </div>
  );
}
