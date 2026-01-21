import { useState } from 'react';
import { Clock, LogIn, LogOut } from 'lucide-react';
import { useSession } from '../hooks/useSession';
import { formatTime, formatElapsedTime } from '../utils/timeUtils';

export function Home() {
  const { isClocked, currentSession, elapsedTime, clockIn, clockOut } = useSession();
  const [isAnimating, setIsAnimating] = useState(false);

  const handleClick = async () => {
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 300);

    if (isClocked) {
      await clockOut();
    } else {
      await clockIn();
    }
  };

  const getElapsedDisplay = () => {
    if (!isClocked || elapsedTime === 0) return '00:00:00';
    return formatElapsedTime(elapsedTime);
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 pb-24">
      {/* Logo/Title */}
      <div className="text-center mb-12">
        <Clock className="w-16 h-16 text-primary mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-white mb-2">Pointeuse Digitale</h1>
        <p className="text-slate-400">
          {isClocked ? 'Session en cours' : 'Prêt à commencer'}
        </p>
      </div>

      {/* Main Clock Button */}
      <div className="relative mb-12">
        <button
          onClick={handleClick}
          className={`
            relative w-64 h-64 rounded-full flex flex-col items-center justify-center
            transition-all duration-300 shadow-2xl
            ${isAnimating ? 'scale-95' : 'scale-100'}
            ${isClocked
              ? 'bg-gradient-to-br from-red-500 to-red-700 hover:from-red-600 hover:to-red-800'
              : 'bg-gradient-to-br from-primary to-emerald-600 hover:from-emerald-600 hover:to-emerald-700'
            }
          `}
        >
          {/* Pulsing ring animation when clocked in */}
          {isClocked && (
            <div className="absolute inset-0 rounded-full animate-ping bg-red-500 opacity-20" />
          )}

          <div className="relative z-10 flex flex-col items-center">
            {isClocked ? (
              <LogOut className="w-16 h-16 text-white mb-4" strokeWidth={2.5} />
            ) : (
              <LogIn className="w-16 h-16 text-white mb-4" strokeWidth={2.5} />
            )}
            <span className="text-2xl font-bold text-white">
              {isClocked ? 'Pointer Sortie' : 'Pointer Entrée'}
            </span>
          </div>
        </button>

        {/* Decorative circles */}
        <div className={`absolute inset-0 -m-4 rounded-full border-4 ${isClocked ? 'border-red-400' : 'border-primary'} opacity-20`} />
        <div className={`absolute inset-0 -m-8 rounded-full border-2 ${isClocked ? 'border-red-400' : 'border-primary'} opacity-10`} />
      </div>

      {/* Session Info */}
      {isClocked && currentSession && (
        <div className="w-full max-w-md space-y-4">
          <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
            <div className="text-center">
              <p className="text-slate-400 text-sm mb-2">Temps écoulé</p>
              <p className="text-5xl font-mono font-bold text-white mb-4">
                {getElapsedDisplay()}
              </p>
              <div className="flex items-center justify-center gap-2 text-slate-400">
                <Clock size={16} />
                <span className="text-sm">
                  Arrivée : {formatTime(currentSession.arrivalTime)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {!isClocked && (
        <div className="text-center text-slate-400 max-w-md">
          <p className="text-sm">
            Appuyez sur le bouton pour commencer votre session de travail.
            Un message sera automatiquement envoyé lors de votre départ.
          </p>
        </div>
      )}
    </div>
  );
}
