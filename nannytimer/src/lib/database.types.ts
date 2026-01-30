export type UserRole = 'employer' | 'nanny'

export interface Profile {
  id: string
  email: string
  full_name: string
  role: UserRole
  created_at: string
  employer_id?: string | null // For nanny accounts, links to their employer
  work_address?: string | null
  work_latitude?: number | null
  work_longitude?: number | null
}

export interface TimeEntry {
  id: string
  nanny_id: string
  employer_id: string
  clock_in: string
  clock_out: string | null
  duration_minutes: number | null
  created_at: string
}

export interface WeeklyReport {
  id: string
  nanny_id: string
  employer_id: string
  week_start: string
  week_end: string
  total_hours: number
  total_minutes: number
  sent_at: string | null
  created_at: string
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: Omit<Profile, 'created_at'>
        Update: Partial<Profile>
      }
      time_entries: {
        Row: TimeEntry
        Insert: Omit<TimeEntry, 'id' | 'created_at'>
        Update: Partial<TimeEntry>
      }
      weekly_reports: {
        Row: WeeklyReport
        Insert: Omit<WeeklyReport, 'id' | 'created_at'>
        Update: Partial<WeeklyReport>
      }
    }
  }
}
