import { useLiveQuery } from 'dexie-react-hooks';
import { Calendar, Clock, TrendingUp, Award, BarChart3 } from 'lucide-react';
import { getSessionsByDateRange } from '../services/database';
import { getWeekStart, getMonthStart, getDateString, calculateTotalHours, calculateTotalMinutes, formatDuration } from '../utils/timeUtils';
import { StatCard } from '../components/StatCard';

export function Statistics() {
  const today = new Date();
  const weekStart = getWeekStart(today);
  const monthStart = getMonthStart(today);

  const weekSessions = useLiveQuery(
    () => getSessionsByDateRange(getDateString(weekStart), getDateString(today))
  );

  const monthSessions = useLiveQuery(
    () => getSessionsByDateRange(getDateString(monthStart), getDateString(today))
  );

  // Filter only completed sessions (with departureTime)
  const completedWeekSessions = weekSessions?.filter(s => s.departureTime) || [];
  const completedMonthSessions = monthSessions?.filter(s => s.departureTime) || [];

  const weekHours = calculateTotalHours(completedWeekSessions);
  const monthHours = calculateTotalHours(completedMonthSessions);
  const weekMinutes = calculateTotalMinutes(completedWeekSessions);
  const monthMinutes = calculateTotalMinutes(completedMonthSessions);

  const weekSessionCount = completedWeekSessions.length;
  const monthSessionCount = completedMonthSessions.length;

  // Calculate average per day worked
  const weekDaysWorked = new Set(completedWeekSessions.map(s => s.date)).size;
  const monthDaysWorked = new Set(completedMonthSessions.map(s => s.date)).size;

  const avgWeekHours = weekDaysWorked > 0 ? weekHours / weekDaysWorked : 0;
  const avgMonthHours = monthDaysWorked > 0 ? monthHours / monthDaysWorked : 0;

  // Progress bar for weekly goal (35h)
  const weeklyGoal = 35;
  const weekProgress = Math.min((weekHours / weeklyGoal) * 100, 100);

  return (
    <div className="flex-1 overflow-y-auto p-6 pb-24 pt-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <BarChart3 className="text-primary w-8 h-8" />
          <h1 className="text-2xl font-bold text-white">Statistiques</h1>
        </div>

        {/* Week Stats */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Calendar size={20} className="text-primary" />
            Cette semaine
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <StatCard
              title="Temps total"
              value={formatDuration(weekMinutes)}
              subtitle={`${weekSessionCount} session${weekSessionCount > 1 ? 's' : ''}`}
              icon={Clock}
            />

            <StatCard
              title="Moyenne journalière"
              value={formatDuration(avgWeekHours * 60)}
              subtitle={`${weekDaysWorked} jour${weekDaysWorked > 1 ? 's' : ''} travaillé${weekDaysWorked > 1 ? 's' : ''}`}
              icon={TrendingUp}
            />
          </div>

          {/* Weekly goal progress */}
          <div className="bg-navy/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-slate-300">Objectif hebdomadaire</span>
              <span className="text-sm font-bold text-white">
                {weekHours.toFixed(1)}h / {weeklyGoal}h
              </span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-primary to-cyan-400 h-full transition-all duration-500 rounded-full"
                style={{ width: `${weekProgress}%` }}
              />
            </div>
            <p className="text-xs text-slate-400 mt-2">
              {weekProgress >= 100 ? '🎉 Objectif atteint !' : `${(weeklyGoal - weekHours).toFixed(1)}h restantes`}
            </p>
          </div>
        </div>

        {/* Month Stats */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Award size={20} className="text-secondary" />
            Ce mois
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <StatCard
              title="Temps total"
              value={formatDuration(monthMinutes)}
              subtitle={`${monthSessionCount} session${monthSessionCount > 1 ? 's' : ''}`}
              icon={Clock}
              color="text-secondary"
            />

            <StatCard
              title="Moyenne journalière"
              value={formatDuration(avgMonthHours * 60)}
              subtitle={`${monthDaysWorked} jour${monthDaysWorked > 1 ? 's' : ''} travaillé${monthDaysWorked > 1 ? 's' : ''}`}
              icon={TrendingUp}
              color="text-secondary"
            />
          </div>
        </div>

        {/* Info message if no data */}
        {weekSessionCount === 0 && (
          <div className="bg-navy/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 text-center">
            <p className="text-slate-400">
              Commencez à pointer pour voir vos statistiques
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
