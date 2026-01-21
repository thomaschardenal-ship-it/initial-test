import Dexie, { Table } from 'dexie';
import { Session, Settings } from '../types';

class PointeuseDatabase extends Dexie {
  sessions!: Table<Session>;
  settings!: Table<Settings>;

  constructor() {
    super('PointeuseDigitale');
    this.version(1).stores({
      sessions: '++id, date, arrivalTime, departureTime',
      settings: '++id'
    });
  }
}

export const db = new PointeuseDatabase();

// Session methods
export async function addSession(session: Omit<Session, 'id'>): Promise<number> {
  return await db.sessions.add(session);
}

export async function updateSession(id: number, updates: Partial<Session>): Promise<number> {
  return await db.sessions.update(id, updates);
}

export async function deleteSession(id: number): Promise<void> {
  await db.sessions.delete(id);
}

export async function getAllSessions(): Promise<Session[]> {
  return await db.sessions.orderBy('arrivalTime').reverse().toArray();
}

export async function getCurrentSession(): Promise<Session | undefined> {
  return await db.sessions
    .filter(session => !session.departureTime)
    .first();
}

export async function getSessionsByDateRange(startDate: string, endDate: string): Promise<Session[]> {
  return await db.sessions
    .where('date')
    .between(startDate, endDate, true, true)
    .toArray();
}

// Settings methods
export async function getSettings(): Promise<Settings | undefined> {
  return await db.settings.toCollection().first();
}

export async function updateSettings(settings: Omit<Settings, 'id'>): Promise<void> {
  const existing = await getSettings();
  if (existing?.id) {
    await db.settings.update(existing.id, settings);
  } else {
    await db.settings.add(settings);
  }
}

// Initialize default settings if not exists
export async function initializeSettings(): Promise<void> {
  const existing = await getSettings();
  if (!existing) {
    await db.settings.add({
      userName: '',
      recipientPhone: '',
      recipientEmail: '',
      sendMethod: 'sms'
    });
  }
}
