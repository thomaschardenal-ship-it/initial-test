import { useLiveQuery } from 'dexie-react-hooks';
import { Trash2, Clock, Calendar } from 'lucide-react';
import { getAllSessions, deleteSession } from '../services/database';
import { formatTime, formatDuration, formatDate, isToday, isYesterday } from '../utils/timeUtils';
import { Session } from '../types';

export function History() {
  const sessions = useLiveQuery(() => getAllSessions());

  const handleDelete = async (id: number | undefined) => {
    if (!id) return;

    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette session ?')) {
      await deleteSession(id);
    }
  };

  const getDateLabel = (session: Session) => {
    const sessionDate = new Date(session.date);
    if (isToday(sessionDate)) return "Aujourd'hui";
    if (isYesterday(sessionDate)) return "Hier";
    return formatDate(sessionDate);
  };

  const groupSessionsByDate = (sessions: Session[] | undefined) => {
    if (!sessions) return {};

    return sessions.reduce((groups, session) => {
      const dateKey = session.date;
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(session);
      return groups;
    }, {} as Record<string, Session[]>);
  };

  const groupedSessions = groupSessionsByDate(sessions);
  const dateKeys = Object.keys(groupedSessions);

  if (!sessions || sessions.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 pb-24">
        <Calendar className="w-20 h-20 text-slate-600 mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Aucun historique</h2>
        <p className="text-slate-400 text-center">
          Vos sessions de travail apparaîtront ici
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 pb-24">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-6">Historique</h1>

        <div className="space-y-6">
          {dateKeys.map(dateKey => (
            <div key={dateKey}>
              <h2 className="text-sm font-semibold text-slate-400 mb-3 flex items-center gap-2">
                <Calendar size={16} />
                {getDateLabel(groupedSessions[dateKey][0])}
              </h2>

              <div className="space-y-3">
                {groupedSessions[dateKey].map(session => (
                  <div
                    key={session.id}
                    className="bg-slate-800 rounded-xl p-4 border border-slate-700 hover:border-slate-600 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <Clock className="text-primary" size={20} />
                          <div>
                            <p className="text-white font-medium">
                              {formatTime(session.arrivalTime)} - {session.departureTime ? formatTime(session.departureTime) : 'En cours'}
                            </p>
                            {session.duration && (
                              <p className="text-sm text-slate-400">
                                Durée : {formatDuration(session.duration)}
                              </p>
                            )}
                          </div>
                        </div>

                        {!session.departureTime && (
                          <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/20 text-primary rounded-full text-xs font-medium">
                            <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                            Session en cours
                          </div>
                        )}
                      </div>

                      {session.departureTime && (
                        <button
                          onClick={() => handleDelete(session.id)}
                          className="p-2 text-slate-400 hover:text-danger transition-colors"
                          aria-label="Supprimer"
                        >
                          <Trash2 size={20} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
