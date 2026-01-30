-- =====================================================
-- NannyTimer - Supabase Database Schema
-- =====================================================
-- Run this SQL in your Supabase SQL Editor to set up the database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- PROFILES TABLE
-- Stores user information for both employers and nannies
-- =====================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('employer', 'nanny')),
  employer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  work_address TEXT,
  work_latitude DOUBLE PRECISION,
  work_longitude DOUBLE PRECISION,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_employer_id ON profiles(employer_id);

-- =====================================================
-- TIME ENTRIES TABLE
-- Stores clock in/out records
-- =====================================================
CREATE TABLE IF NOT EXISTS time_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nanny_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  employer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  clock_in TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  clock_out TIMESTAMP WITH TIME ZONE,
  duration_minutes INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_time_entries_nanny_id ON time_entries(nanny_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_employer_id ON time_entries(employer_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_clock_in ON time_entries(clock_in);

-- =====================================================
-- WEEKLY REPORTS TABLE
-- Stores generated weekly report history
-- =====================================================
CREATE TABLE IF NOT EXISTS weekly_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nanny_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  employer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  week_start TIMESTAMP WITH TIME ZONE NOT NULL,
  week_end TIMESTAMP WITH TIME ZONE NOT NULL,
  total_hours INTEGER NOT NULL DEFAULT 0,
  total_minutes INTEGER NOT NULL DEFAULT 0,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_weekly_reports_nanny_id ON weekly_reports(nanny_id);
CREATE INDEX IF NOT EXISTS idx_weekly_reports_week_start ON weekly_reports(week_start);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_reports ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- PROFILES POLICIES
-- =====================================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Employers can view their nannies' profiles
CREATE POLICY "Employers can view their nannies" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles employer
      WHERE employer.id = auth.uid()
      AND employer.role = 'employer'
      AND profiles.employer_id = employer.id
    )
  );

-- Employers can update their nannies' employer_id
CREATE POLICY "Employers can link nannies" ON profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles employer
      WHERE employer.id = auth.uid()
      AND employer.role = 'employer'
    )
  );

-- Nannies can view their employer's profile
CREATE POLICY "Nannies can view their employer" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles nanny
      WHERE nanny.id = auth.uid()
      AND nanny.role = 'nanny'
      AND nanny.employer_id = profiles.id
    )
  );

-- =====================================================
-- TIME ENTRIES POLICIES
-- =====================================================

-- Nannies can view their own time entries
CREATE POLICY "Nannies can view own time entries" ON time_entries
  FOR SELECT USING (auth.uid() = nanny_id);

-- Nannies can insert their own time entries
CREATE POLICY "Nannies can insert own time entries" ON time_entries
  FOR INSERT WITH CHECK (auth.uid() = nanny_id);

-- Nannies can update their own time entries
CREATE POLICY "Nannies can update own time entries" ON time_entries
  FOR UPDATE USING (auth.uid() = nanny_id);

-- Employers can view time entries of their nannies
CREATE POLICY "Employers can view their nannies time entries" ON time_entries
  FOR SELECT USING (auth.uid() = employer_id);

-- =====================================================
-- WEEKLY REPORTS POLICIES
-- =====================================================

-- Nannies can view their own weekly reports
CREATE POLICY "Nannies can view own reports" ON weekly_reports
  FOR SELECT USING (auth.uid() = nanny_id);

-- Employers can view reports for their nannies
CREATE POLICY "Employers can view their reports" ON weekly_reports
  FOR SELECT USING (auth.uid() = employer_id);

-- Service role can insert reports (for API)
CREATE POLICY "Service can insert reports" ON weekly_reports
  FOR INSERT WITH CHECK (true);

-- =====================================================
-- REALTIME SUBSCRIPTIONS
-- =====================================================

-- Enable realtime for time_entries
ALTER PUBLICATION supabase_realtime ADD TABLE time_entries;

-- =====================================================
-- HELPER FUNCTION: Auto-create profile on signup
-- =====================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'employer')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
