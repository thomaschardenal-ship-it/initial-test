import { Session } from '../types';
import { formatTime, formatDuration } from '../utils/timeUtils';

/**
 * Generate message text for session completion
 */
export function generateMessage(session: Session, userName: string): string {
  const arrival = formatTime(session.arrivalTime);
  const departure = session.departureTime ? formatTime(session.departureTime) : 'N/A';
  const duration = session.duration ? formatDuration(session.duration) : 'N/A';

  const name = userName || 'User';

  return `${name} - Work Session Completed

Duration: ${duration}
Clock In: ${arrival}
Clock Out: ${departure}

Nanny Hours Tracker`;
}

/**
 * Send SMS via native SMS app
 */
export function sendSMS(phone: string, message: string): void {
  if (!phone) {
    alert('Phone number not configured');
    return;
  }

  const encodedMessage = encodeURIComponent(message);
  const smsUrl = `sms:${phone}${/iPhone|iPad|iPod/.test(navigator.userAgent) ? '&' : '?'}body=${encodedMessage}`;

  window.location.href = smsUrl;
}

/**
 * Send Email via native email app
 */
export function sendEmail(email: string, subject: string, message: string): void {
  if (!email) {
    alert('Email not configured');
    return;
  }

  const encodedSubject = encodeURIComponent(subject);
  const encodedBody = encodeURIComponent(message);
  const mailtoUrl = `mailto:${email}?subject=${encodedSubject}&body=${encodedBody}`;

  window.location.href = mailtoUrl;
}
