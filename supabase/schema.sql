-- ========================================================
-- MILAD FEST 2K26 - SUPABASE PRODUCTION DATABASE ARCHITECTURE
-- Complete Schema, Foreign Keys, Constraints, Score Audit Logs & RLS
-- ========================================================

-- Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. EVENTS TABLE (Multi-Event Architecture Support)
CREATE TABLE IF NOT EXISTS public.events (
  id TEXT PRIMARY KEY,
  title_en TEXT NOT NULL,
  title_ml TEXT,
  event_code TEXT NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  event_date DATE,
  start_time TIME,
  end_time TIME,
  venue TEXT,
  organizer_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. ADMIN PROFILES TABLE (Supabase Auth Integration)
CREATE TABLE IF NOT EXISTS public.admin_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  name_en TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('Super Admin', 'Event Manager', 'Score Manager', 'Result Manager')),
  status TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Disabled')),
  assigned_programme_ids TEXT[] DEFAULT '{}',
  assigned_category_ids TEXT[] DEFAULT '{}',
  last_active TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.categories (
  id TEXT PRIMARY KEY,
  event_id TEXT REFERENCES public.events(id) ON DELETE CASCADE,
  name_en TEXT NOT NULL,
  name_ml TEXT,
  name_ar TEXT,
  short_name TEXT,
  slug TEXT UNIQUE,
  description TEXT,
  color_code TEXT DEFAULT '#10B981',
  age_range TEXT,
  class_range TEXT,
  display_order INT DEFAULT 0,
  is_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TEAMS TABLE (House System)
CREATE TABLE IF NOT EXISTS public.teams (
  id TEXT PRIMARY KEY,
  event_id TEXT REFERENCES public.events(id) ON DELETE CASCADE,
  name_en TEXT NOT NULL,
  name_ml TEXT,
  short_code TEXT NOT NULL,
  logo_url TEXT,
  color_code TEXT DEFAULT '#3B82F6',
  total_points INT DEFAULT 0,
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. STUDENTS TABLE (Strictly Private from Anon Public)
CREATE TABLE IF NOT EXISTS public.students (
  id TEXT PRIMARY KEY,
  event_id TEXT REFERENCES public.events(id) ON DELETE CASCADE,
  student_id_code TEXT NOT NULL UNIQUE,
  name_en TEXT NOT NULL,
  name_ml TEXT,
  category_id TEXT REFERENCES public.categories(id) ON DELETE SET NULL,
  category_class TEXT,
  gender TEXT CHECK (gender IN ('Male', 'Female', 'General', 'All')),
  class_name TEXT,
  institution TEXT,
  team_id TEXT REFERENCES public.teams(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. PROGRAMMES TABLE
CREATE TABLE IF NOT EXISTS public.programmes (
  id TEXT PRIMARY KEY,
  event_id TEXT REFERENCES public.events(id) ON DELETE CASCADE,
  category_id TEXT REFERENCES public.categories(id) ON DELETE SET NULL,
  title_en TEXT NOT NULL,
  title_ml TEXT,
  code TEXT NOT NULL UNIQUE,
  slug TEXT UNIQUE,
  programme_type TEXT CHECK (programme_type IN ('Single', 'Group')),
  gender TEXT CHECK (gender IN ('Male', 'Female', 'General', 'All')),
  venue_id TEXT,
  venue_name TEXT,
  max_participants INT DEFAULT 100,
  is_registration_enabled BOOLEAN DEFAULT true,
  registration_mode TEXT DEFAULT 'Both' CHECK (registration_mode IN ('Admin Only', 'Public Registration', 'Both')),
  registration_deadline TIMESTAMPTZ,
  scoring_method TEXT DEFAULT 'Marks' CHECK (scoring_method IN ('Marks', 'Grades', 'Ranks', 'Points')),
  max_score INT DEFAULT 100,
  lifecycle_status TEXT DEFAULT 'Upcoming' CHECK (lifecycle_status IN ('Upcoming', 'Registration Open', 'Registration Closed', 'Ongoing', 'Completed', 'Result Pending', 'Result Published', 'Archived')),
  is_result_published BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. REGISTRATIONS TABLE
CREATE TABLE IF NOT EXISTS public.registrations (
  id TEXT PRIMARY KEY,
  event_id TEXT REFERENCES public.events(id) ON DELETE CASCADE,
  programme_id TEXT NOT NULL REFERENCES public.programmes(id) ON DELETE CASCADE,
  category_id TEXT REFERENCES public.categories(id) ON DELETE SET NULL,
  student_id TEXT REFERENCES public.students(id) ON DELETE SET NULL,
  team_id TEXT REFERENCES public.teams(id) ON DELETE SET NULL,
  registration_type TEXT CHECK (registration_type IN ('Single', 'Group')),
  status TEXT DEFAULT 'Confirmed' CHECK (status IN ('Pending', 'Confirmed', 'Cancelled', 'Rejected')),
  approval_status TEXT DEFAULT 'Approved' CHECK (approval_status IN ('Pending', 'Approved', 'Rejected')),
  attendance TEXT DEFAULT 'Not Marked' CHECK (attendance IN ('Not Marked', 'Present', 'Absent')),
  registered_by TEXT DEFAULT 'System',
  registered_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_student_programme UNIQUE NULLS NOT DISTINCT (programme_id, student_id),
  CONSTRAINT unique_team_programme UNIQUE NULLS NOT DISTINCT (programme_id, team_id)
);

-- 8. SCORES TABLE (Private Competition Scores)
CREATE TABLE IF NOT EXISTS public.scores (
  id TEXT PRIMARY KEY,
  event_id TEXT REFERENCES public.events(id) ON DELETE CASCADE,
  programme_id TEXT NOT NULL REFERENCES public.programmes(id) ON DELETE CASCADE,
  registration_id TEXT REFERENCES public.registrations(id) ON DELETE CASCADE,
  student_id TEXT REFERENCES public.students(id) ON DELETE SET NULL,
  team_id TEXT REFERENCES public.teams(id) ON DELETE SET NULL,
  score_value NUMERIC(6, 2) NOT NULL DEFAULT 0,
  max_score NUMERIC(6, 2) NOT NULL DEFAULT 100,
  judge_id TEXT,
  judge_name TEXT,
  entered_by TEXT NOT NULL,
  entered_at TIMESTAMPTZ DEFAULT NOW(),
  is_verified BOOLEAN DEFAULT false,
  verified_by TEXT,
  verified_at TIMESTAMPTZ,
  criteria_breakdown JSONB DEFAULT '{}'::jsonb
);

-- 9. SCORE AUDIT LOGS TABLE (Score Revisions & History)
CREATE TABLE IF NOT EXISTS public.score_audit_logs (
  id TEXT PRIMARY KEY,
  score_id TEXT NOT NULL REFERENCES public.scores(id) ON DELETE CASCADE,
  programme_id TEXT NOT NULL REFERENCES public.programmes(id) ON DELETE CASCADE,
  previous_score NUMERIC(6, 2),
  new_score NUMERIC(6, 2) NOT NULL,
  changed_by TEXT NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. PROGRAMME RESULTS TABLE (Public when Published, with Immutable Snapshot JSON)
CREATE TABLE IF NOT EXISTS public.programme_results (
  id TEXT PRIMARY KEY,
  event_id TEXT REFERENCES public.events(id) ON DELETE CASCADE,
  programme_id TEXT NOT NULL REFERENCES public.programmes(id) ON DELETE CASCADE,
  category_id TEXT REFERENCES public.categories(id) ON DELETE SET NULL,
  winners_json JSONB NOT NULL DEFAULT '[]'::jsonb,
  snapshot_data JSONB DEFAULT '{}'::jsonb,
  total_participants INT DEFAULT 0,
  scoring_method TEXT DEFAULT 'Marks',
  result_version INT DEFAULT 1,
  status TEXT DEFAULT 'Published' CHECK (status IN ('Draft', 'Generated', 'Reviewed', 'Published', 'Unpublished', 'Archived')),
  is_published BOOLEAN DEFAULT true,
  published_by TEXT,
  published_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. LEADERBOARDS TABLE (Calculated from Published Results Only)
CREATE TABLE IF NOT EXISTS public.leaderboards (
  id TEXT PRIMARY KEY,
  event_id TEXT REFERENCES public.events(id) ON DELETE CASCADE,
  team_id TEXT REFERENCES public.teams(id) ON DELETE CASCADE,
  student_id TEXT REFERENCES public.students(id) ON DELETE CASCADE,
  category_id TEXT REFERENCES public.categories(id) ON DELETE CASCADE,
  total_points INT DEFAULT 0,
  first_count INT DEFAULT 0,
  second_count INT DEFAULT 0,
  third_count INT DEFAULT 0,
  total_events_won INT DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. LEADERBOARD HISTORY SNAPSHOTS
CREATE TABLE IF NOT EXISTS public.leaderboard_history (
  id TEXT PRIMARY KEY,
  event_id TEXT REFERENCES public.events(id) ON DELETE CASCADE,
  rebuild_id TEXT NOT NULL,
  snapshot_json JSONB NOT NULL DEFAULT '[]'::jsonb,
  recalculated_by TEXT DEFAULT 'System',
  recalculated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. CERTIFICATES TABLE (Public Verification by Hash)
CREATE TABLE IF NOT EXISTS public.certificates (
  id TEXT PRIMARY KEY,
  event_id TEXT REFERENCES public.events(id) ON DELETE CASCADE,
  programme_id TEXT REFERENCES public.programmes(id) ON DELETE CASCADE,
  student_id TEXT REFERENCES public.students(id) ON DELETE SET NULL,
  team_id TEXT REFERENCES public.teams(id) ON DELETE SET NULL,
  recipient_name TEXT NOT NULL,
  certificate_type TEXT NOT NULL CHECK (certificate_type IN ('Winner', 'Participation', 'Special Award')),
  template_style TEXT DEFAULT 'classic-islamic',
  status TEXT DEFAULT 'Issued' CHECK (status IN ('Issued', 'Revoked')),
  issue_date DATE DEFAULT CURRENT_DATE,
  qr_code_hash TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. ANNOUNCEMENTS TABLE (Public when Published)
CREATE TABLE IF NOT EXISTS public.announcements (
  id TEXT PRIMARY KEY,
  event_id TEXT REFERENCES public.events(id) ON DELETE CASCADE,
  title_en TEXT NOT NULL,
  title_ml TEXT,
  content_en TEXT NOT NULL,
  priority TEXT DEFAULT 'Normal' CHECK (priority IN ('Normal', 'High', 'Urgent')),
  is_published BOOLEAN DEFAULT true,
  published_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. GALLERY IMAGES TABLE (Public when Published)
CREATE TABLE IF NOT EXISTS public.gallery_images (
  id TEXT PRIMARY KEY,
  event_id TEXT REFERENCES public.events(id) ON DELETE CASCADE,
  title_en TEXT NOT NULL,
  image_url TEXT NOT NULL,
  category_name TEXT,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 16. ACTIVITY LOGS TABLE (Strictly Private Admin Audit Trail)
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id TEXT PRIMARY KEY,
  event_id TEXT REFERENCES public.events(id) ON DELETE CASCADE,
  user_id TEXT,
  user_name TEXT DEFAULT 'System',
  user_role TEXT DEFAULT 'Admin',
  action_type TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  description TEXT NOT NULL,
  is_system_action BOOLEAN DEFAULT false,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ========================================================

-- Enable RLS on all sensitive tables
ALTER TABLE public.admin_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.score_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.programme_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaderboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- 1. Admin Profiles RLS
CREATE POLICY "Admins view profiles" ON public.admin_profiles FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Super Admins manage profiles" ON public.admin_profiles FOR ALL USING (
  EXISTS (SELECT 1 FROM public.admin_profiles WHERE id = auth.uid() AND role = 'Super Admin' AND status = 'Active')
);

-- 2. Students RLS
CREATE POLICY "Admins view students" ON public.students FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins manage students" ON public.students FOR ALL USING (
  EXISTS (SELECT 1 FROM public.admin_profiles WHERE id = auth.uid() AND role IN ('Super Admin', 'Event Manager') AND status = 'Active')
);

-- 3. Scores & Score Audit Logs RLS
CREATE POLICY "Authorized read scores" ON public.scores FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.admin_profiles
    WHERE id = auth.uid() AND status = 'Active'
      AND (role IN ('Super Admin', 'Event Manager', 'Result Manager') OR (role = 'Score Manager' AND (assigned_programme_ids IS NULL OR programme_id = ANY(assigned_programme_ids))))
  )
);
CREATE POLICY "Authorized write scores" ON public.scores FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.admin_profiles
    WHERE id = auth.uid() AND status = 'Active'
      AND (role = 'Super Admin' OR (role = 'Score Manager' AND (assigned_programme_ids IS NULL OR programme_id = ANY(assigned_programme_ids))))
  )
);
CREATE POLICY "Admins read score audit logs" ON public.score_audit_logs FOR SELECT USING (auth.role() = 'authenticated');

-- 4. Programme Results RLS
CREATE POLICY "Public read published results" ON public.programme_results FOR SELECT USING (is_published = true);
CREATE POLICY "Admins read all results" ON public.programme_results FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Result Managers manage results" ON public.programme_results FOR ALL USING (
  EXISTS (SELECT 1 FROM public.admin_profiles WHERE id = auth.uid() AND role IN ('Super Admin', 'Result Manager') AND status = 'Active')
);

-- 5. Certificates RLS
CREATE POLICY "Public verify certificates" ON public.certificates FOR SELECT USING (status = 'Issued' OR status = 'Revoked');
CREATE POLICY "Result Managers manage certificates" ON public.certificates FOR ALL USING (
  EXISTS (SELECT 1 FROM public.admin_profiles WHERE id = auth.uid() AND role IN ('Super Admin', 'Result Manager') AND status = 'Active')
);

-- 6. Announcements & Gallery RLS
CREATE POLICY "Public read announcements" ON public.announcements FOR SELECT USING (is_published = true);
CREATE POLICY "Admins manage announcements" ON public.announcements FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Public read gallery" ON public.gallery_images FOR SELECT USING (is_published = true);
CREATE POLICY "Admins manage gallery" ON public.gallery_images FOR ALL USING (auth.role() = 'authenticated');

-- 7. Activity Logs RLS
CREATE POLICY "Admins read activity logs" ON public.activity_logs FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins insert activity logs" ON public.activity_logs FOR INSERT WITH CHECK (auth.role() = 'authenticated');
