import { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Session } from '../types';
import { db, addSession, updateSession, getCurrentSession, getSettings } from '../services/database';
import { getDateString, getElapsedMinutes } from '../utils/timeUtils';
import { generateMessage, sendSMS, sendEmail } from '../services/messageService';

export function useSession() {
  const [elapsedTime, setElapsedTime] = useState(0);

  // Get current active session
  const currentSession = useLiveQuery(() => getCurrentSession());

  // Update elapsed time every second if there's an active session
  useEffect(() => {
    if (!currentSession) {
      setElapsedTime(0);
      return;
    }

    const updateElapsed = () => {
      const minutes = getElapsedMinutes(currentSession.arrivalTime);
      setElapsedTime(minutes);
    };

    // Update immediately
    updateElapsed();

    // Then update every second
    const interval = setInterval(updateElapsed, 1000);

    return () => clearInterval(interval);
  }, [currentSession]);

  const isClocked = Boolean(currentSession);

  const clockIn = async () => {
    const now = new Date();
    const session: Omit<Session, 'id'> = {
      arrivalTime: now,
      date: getDateString(now)
    };

    await addSession(session);
  };

  const clockOut = async () => {
    if (!currentSession?.id) return;

    const now = new Date();
    const duration = Math.floor((now.getTime() - currentSession.arrivalTime.getTime()) / 1000 / 60);

    const updates = {
      departureTime: now,
      duration
    };

    await updateSession(currentSession.id, updates);

    // Get settings and send message
    const settings = await getSettings();
    if (settings && (settings.recipientPhone || settings.recipientEmail)) {
      const completedSession: Session = {
        ...currentSession,
        ...updates
      };

      const message = generateMessage(completedSession, settings.userName);

      if (settings.sendMethod === 'sms' && settings.recipientPhone) {
        sendSMS(settings.recipientPhone, message);
      } else if (settings.sendMethod === 'email' && settings.recipientEmail) {
        sendEmail(settings.recipientEmail, 'Session terminée - Pointeuse Digitale', message);
      }
    }
  };

  return {
    isClocked,
    currentSession,
    elapsedTime,
    clockIn,
    clockOut
  };
}
