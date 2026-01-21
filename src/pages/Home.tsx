import { useState, useEffect } from 'react';
import { Clock as ClockIcon, MapPin, AlertTriangle } from 'lucide-react';
import { useSession } from '../hooks/useSession';
import { useNavigate } from 'react-router-dom';

export function Home() {
  const { isClocked, clockIn, clockOut, currentSession, elapsedTime } = useSession();
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
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  // Format date as "Day DD Month"
  const formatFullDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    });
  };

  // Capitalize first letter
  const capitalizeFirst = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  // Format elapsed time for display
  const formatElapsed = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.floor(minutes % 60);
    const secs = Math.floor((minutes * 60) % 60);
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex-1 flex flex-col p-6 pb-24 pt-8">
      <div className="max-w-2xl mx-auto w-full flex flex-col h-full">
        {/* Top Section: Clock and Date */}
        <div className="text-center space-y-3 mb-8">
          {/* Digital Clock */}
          <div className="text-6xl md:text-7xl font-light tracking-wider text-white/95">
            {formatClock(currentTime)}
          </div>

          {/* Date */}
          <div className="text-base text-slate-400">
            {capitalizeFirst(formatFullDate(currentTime))}
          </div>
        </div>

        {/* Session Info Banner if clocked in */}
        {isClocked && currentSession && (
          <div className="mb-6 bg-primary/10 border border-primary/30 rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-primary rounded-full animate-pulse"></div>
                <span className="text-sm text-slate-300">Active Session</span>
              </div>
              <div className="text-right">
                <div className="text-2xl font-mono font-bold text-white">
                  {formatElapsed(elapsedTime)}
                </div>
                <div className="text-xs text-slate-400">
                  Started: {currentSession.arrivalTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Center Section: Main Clock Button */}
        <div className="flex-1 flex flex-col items-center justify-center gap-8">
          <button
            onClick={handleClick}
            className={`
              relative w-72 h-72 rounded-full flex flex-col items-center justify-center
              transition-all duration-300
              ${isAnimating ? 'scale-95' : 'scale-100'}
              ${isClocked
                ? 'bg-gradient-to-br from-slate-700 via-slate-600 to-slate-700 shadow-2xl shadow-slate-900/50'
                : 'bg-gradient-to-br from-primary via-cyan-500 to-primary shadow-2xl shadow-primary/50'
              }
            `}
          >
            {/* Inner circle for better depth */}
            <div className={`
              absolute inset-8 rounded-full
              ${isClocked
                ? 'bg-gradient-to-br from-slate-600 to-slate-700'
                : 'bg-gradient-to-br from-cyan-400 to-primary'
              }
            `}>
              <div className="w-full h-full flex flex-col items-center justify-center">
                <ClockIcon
                  size={64}
                  className="text-white mb-4"
                  strokeWidth={1.5}
                />
                <span className="text-xl font-bold text-white tracking-wide">
                  {isClocked ? 'CLOCK' : 'CLOCK'}
                </span>
                <span className="text-xl font-bold text-white tracking-wide">
                  {isClocked ? 'OUT' : 'IN'}
                </span>
              </div>
            </div>

            {/* Animated ring when clocked in */}
            {isClocked && (
              <div className="absolute inset-0 rounded-full border-4 border-slate-500 animate-ping opacity-20" />
            )}
          </button>
        </div>

        {/* Bottom Section: Action Buttons */}
        <div className="space-y-3 mt-auto">
          <button
            onClick={() => navigate('/settings')}
            className="w-full py-4 bg-secondary/90 hover:bg-secondary text-white rounded-2xl font-medium text-sm flex items-center justify-center gap-2 transition-all shadow-lg"
          >
            <MapPin size={20} />
            Configure Work Location
          </button>

          <button
            className="w-full py-4 bg-navy/80 hover:bg-navy text-slate-300 rounded-2xl font-medium text-sm flex items-center justify-center gap-2 transition-all border border-slate-700"
          >
            <AlertTriangle size={20} />
            Outside Work Zone
          </button>
        </div>
      </div>
    </div>
  );
}
