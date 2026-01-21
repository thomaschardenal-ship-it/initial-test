import { useLiveQuery } from 'dexie-react-hooks';
import { Trash2, Clock, Calendar, History as HistoryIcon } from 'lucide-react';
import { getAllSessions, deleteSession } from '../services/database';
import { formatTime, formatDuration, formatDate, isToday, isYesterday } from '../utils/timeUtils';
import { Session } from '../types';

export function History() {
  const sessions = useLiveQuery(() => getAllSessions());

  const handleDelete = async (id: number | undefined) => {
    if (!id) return;

    if (window.confirm('Are you sure you want to delete this session?')) {
      await deleteSession(id);
    }
  };

  const getDateLabel = (session: Session) => {
    const sessionDate = new Date(session.date);
    if (isToday(sessionDate)) return "Today";
    if (isYesterday(sessionDate)) return "Yesterday";
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
        <h2 className="text-xl font-bold text-white mb-2">No History</h2>
        <p className="text-slate-400 text-center">
          Work sessions will appear here
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 pb-24 pt-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <HistoryIcon className="text-primary w-8 h-8" />
          <h1 className="text-2xl font-bold text-white">History</h1>
        </div>

        <div className="space-y-6">
          {dateKeys.map(dateKey => (
            <div key={dateKey}>
              <h2 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2 px-2">
                <Calendar size={16} className="text-primary" />
                {getDateLabel(groupedSessions[dateKey][0])}
              </h2>

              <div className="space-y-3">
                {groupedSessions[dateKey].map(session => (
                  <div
                    key={session.id}
                    className="bg-navy/80 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50 hover:border-primary/50 transition-all shadow-lg"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Clock className="text-primary" size={20} />
                          <div>
                            <p className="text-white font-medium">
                              {formatTime(session.arrivalTime)} - {session.departureTime ? formatTime(session.departureTime) : 'In Progress'}
                            </p>
                            {session.duration && (
                              <p className="text-sm text-slate-400">
                                Duration: {formatDuration(session.duration)}
                              </p>
                            )}
                          </div>
                        </div>

                        {!session.departureTime && (
                          <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/20 text-primary rounded-full text-xs font-medium">
                            <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                            Active Session
                          </div>
                        )}
                      </div>

                      {session.departureTime && (
                        <button
                          onClick={() => handleDelete(session.id)}
                          className="p-2 text-slate-400 hover:text-danger transition-colors rounded-lg hover:bg-slate-800"
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
