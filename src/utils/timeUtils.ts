import { Session } from '../types';

/**
 * Format duration from minutes to "Xh XXmin" format
 */
export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);

  if (hours === 0) {
    return `${mins}min`;
  }

  return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
}

/**
 * Format time to "HH:mm" format
 */
export function formatTime(date: Date): string {
  return date.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Format date to "DD/MM/YYYY" format
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

/**
 * Get date in YYYY-MM-DD format
 */
export function getDateString(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Get the start of the week (Monday)
 */
export function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  return new Date(d.setDate(diff));
}

/**
 * Get the start of the month (1st day)
 */
export function getMonthStart(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

/**
 * Calculate total hours from sessions
 */
export function calculateTotalHours(sessions: Session[]): number {
  const totalMinutes = sessions.reduce((sum, session) => {
    return sum + (session.duration || 0);
  }, 0);
  return totalMinutes / 60;
}

/**
 * Calculate total minutes from sessions
 */
export function calculateTotalMinutes(sessions: Session[]): number {
  return sessions.reduce((sum, session) => {
    return sum + (session.duration || 0);
  }, 0);
}

/**
 * Get elapsed time in minutes
 */
export function getElapsedMinutes(startTime: Date): number {
  const now = new Date();
  return Math.floor((now.getTime() - startTime.getTime()) / 1000 / 60);
}

/**
 * Format elapsed time for display (HH:mm:ss)
 */
export function formatElapsedTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = Math.floor(minutes % 60);
  const secs = Math.floor((minutes * 60) % 60);

  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Get day name from date
 */
export function getDayName(date: Date): string {
  return date.toLocaleDateString('fr-FR', { weekday: 'long' });
}

/**
 * Check if date is today
 */
export function isToday(date: Date | string): boolean {
  const d = typeof date === 'string' ? new Date(date) : date;
  const today = new Date();
  return getDateString(d) === getDateString(today);
}

/**
 * Check if date is yesterday
 */
export function isYesterday(date: Date | string): boolean {
  const d = typeof date === 'string' ? new Date(date) : date;
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return getDateString(d) === getDateString(yesterday);
}
