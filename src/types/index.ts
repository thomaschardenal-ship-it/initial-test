export interface Session {
  id?: number;
  arrivalTime: Date;
  departureTime?: Date;
  duration?: number; // en minutes
  date: string; // format YYYY-MM-DD
}

export interface Settings {
  id?: number;
  userName: string;
  recipientPhone: string;
  recipientEmail: string;
  sendMethod: 'sms' | 'email';
}
