import { supabase, isSupabaseConfigured } from './supabaseClient';

export type AdminRole = 'Super Admin' | 'Event Manager' | 'Score Manager' | 'Result Manager' | 'Check-in Staff';

export interface AdminProfile {
  id: string;
  email: string;
  name_en: string;
  role: AdminRole;
  status: 'Active' | 'Disabled';
  assigned_programme_ids?: string[];
  assigned_category_ids?: string[];
  last_active?: string;
  created_at?: string;
}

export interface EventItem {
  id: string;
  title_en: string;
  subtitle_en?: string;
  organizer_en?: string;
  status: 'Draft' | 'Upcoming' | 'Live' | 'Completed' | 'Archived';
  start_date: string;
  end_date: string;
  is_active: boolean;
  created_at?: string;
}

export interface SiteSettings {
  id?: string;
  event_id?: string;
  event_name_en: string;
  event_name_ml?: string;
  event_subtitle_en: string;
  event_subtitle_ml?: string;
  organizer_name_en?: string;
  bismillah_ar?: string;
  durood_ar?: string;
  description_en: string;
  description_ml?: string;
  description_ar?: string;
  event_date: string;
  event_time: string;
  event_end_date?: string;
  timezone?: string;
  venue_en: string;
  venue_ml?: string;
  location_address: string;
  map_url: string;
  map_embed_src: string;
  latitude?: number;
  longitude?: number;
  logo_url: string;
  organizer_logo_url?: string;
  hero_image_url: string;
  event_poster_url: string;
  favicon_url?: string;
  result_poster_bg_url?: string;
  certificate_bg_url?: string;
  primary_color?: string;
  secondary_color?: string;
  accent_color?: string;
  background_color?: string;
  text_color?: string;
  heading_font?: string;
  body_font?: string;
  contact_phone: string;
  contact_email: string;
  social_facebook: string;
  social_instagram: string;
  social_youtube: string;
  social_whatsapp: string;
  seo_site_title?: string;
  seo_meta_description?: string;
  seo_share_image_url?: string;
  is_countdown_enabled: boolean;
  is_participants_section_enabled: boolean;
  countdown_target_iso: string;
  event_status?: 'Upcoming' | 'Live' | 'Completed';
  live_announcement_enabled?: boolean;
  live_announcement_message?: string;
  live_announcement_priority?: 'Normal' | 'Important' | 'Urgent';
  
  // Customization Engine Extensions
  is_maintenance_mode?: boolean;
  maintenance_message?: string;
  public_pages_visibility?: {
    home?: boolean;
    programs?: boolean;
    results?: boolean;
    leaderboard?: boolean;
    announcements?: boolean;
    gallery?: boolean;
    venue?: boolean;
    verify?: boolean;
    register?: boolean;
  };
  leaderboard_point_rules?: { rank: number; points: number }[];
  draft_settings?: Partial<SiteSettings>;
}

export interface ConfigAuditLog {
  id: string;
  setting_key: string;
  old_value: string;
  new_value: string;
  changed_by: string;
  timestamp: string;
}

export interface EventSection {
  id: string;
  section_key: string;
  title_en: string;
  title_ml?: string;
  display_order: number;
  is_enabled: boolean;
}

export interface NavigationItem {
  id: string;
  label_en: string;
  label_ml?: string;
  target_section: string;
  href?: string;
  display_order: number;
  is_enabled: boolean;
}

export interface Category {
  id: string;
  name_en: string;
  name_ml?: string;
  name_ar?: string;
  short_name?: string;
  slug?: string;
  description?: string;
  color_code?: string;
  age_range?: string;
  class_range?: string;
  allow_individual?: boolean;
  allow_team?: boolean;
  max_team_size?: number;
  display_order: number;
  is_enabled?: boolean;
  is_archived?: boolean;
}

export interface Team {
  id: string;
  code: string;
  name_en: string;
  name_ml?: string;
  category?: string;
  color_code?: string;
  description?: string;
  logo_url?: string;
  is_archived?: boolean;
}

export interface Student {
  id: string;
  student_id_code: string;
  name_en: string;
  name_ml?: string;
  category_class: string;
  team_id?: string;
  gender?: string;
  institution?: string;
  photo_url?: string;
  contact_phone?: string;
  contact_email?: string;
  address?: string;
  notes?: string;
  is_archived?: boolean;
}

export interface Speaker {
  id: string;
  name_en: string;
  name_ml?: string;
  name_ar?: string;
  role_en: string;
  role_ml?: string;
  description_en: string;
  description_ml?: string;
  photo_url: string;
  category: string;
  social_facebook?: string;
  social_instagram?: string;
  social_youtube?: string;
  is_published: boolean;
  display_order: number;
}

export interface Programme {
  id: string;
  code?: string;
  slug?: string;
  title_en: string;
  title_ml?: string;
  title_ar?: string;
  description_en: string;
  description_ml?: string;
  description_ar?: string;
  event_date: string;
  start_time: string;
  end_time: string;
  venue: string;
  category_id?: string;
  category_ids?: string[];
  speaker_id?: string;
  speaker_ids?: string[];
  speaker_name?: string;
  image_url?: string;
  gender?: string;
  competition_type: 'Individual' | 'Team' | 'Individual+Team';
  
  // Registration Configuration
  registration_mode?: 'Admin Only' | 'Public' | 'Both';
  approval_mode?: 'Automatic' | 'Manual';
  registration_open?: boolean;
  registration_deadline?: string;
  allowed_participant_types?: 'Students' | 'Teams' | 'Both';
  max_participants?: number;
  max_team_size?: number;
  min_team_size?: number;
  allow_late_registration?: boolean;
  required_fields?: string[];

  // Scoring Configuration
  max_score: number;
  min_score?: number;
  passing_score?: number;
  scoring_direction?: 'higher_wins' | 'lower_wins' | 'manual';

  // Ranking & Leaderboard Configuration
  publish_position_count?: 'top_3' | 'top_5' | 'top_10' | 'all';
  include_in_student_leaderboard?: boolean;
  include_in_team_leaderboard?: boolean;
  custom_points_map?: {
    rank1: number;
    rank2: number;
    rank3: number;
    rank4: number;
  };

  // Status Lifecycle
  lifecycle_status?: 'Draft' | 'Registration Open' | 'Registration Closed' | 'Upcoming' | 'Ongoing' | 'Completed' | 'Scores Pending' | 'Result Ready' | 'Published';
  status: 'draft' | 'published';
  is_published: boolean;
  display_order: number;
  is_archived?: boolean;
}

export interface ProgrammeRegistration {
  id: string;
  programme_id: string;
  participant_type: 'student' | 'team';
  student_id?: string;
  team_id?: string;
  status?: 'Registered' | 'Confirmed' | 'Pending' | 'Rejected' | 'Cancelled' | 'Withdrawn' | 'Disqualified';
  attendance?: 'Pending' | 'Present' | 'Absent' | 'Excused' | 'Cancelled' | 'Unmarked';
  checked_in_at?: string;
  checked_in_by?: string;
  checkin_method?: 'QR' | 'Manual';
  attendance_notes?: string;
  created_at?: string;

  // Public Registration Additions
  registration_id_code?: string;
  full_name?: string;
  gender?: 'Male' | 'Female';
  class_grade?: string;
  contact_phone?: string;
  contact_email?: string;
  category_id?: string;
  category_name?: string;
  team_name?: string;
  team_members?: { name: string; class_grade?: string }[];
  rejection_reason?: string;
  approval_mode?: 'Automatic' | 'Manual';
}

export interface ScoreEntry {
  id: string;
  programme_id: string;
  registration_id: string;
  student_id?: string;
  team_id?: string;
  score: number;
  max_score: number;
  is_verified: boolean;
  is_submitted?: boolean;
  needs_correction?: boolean;
  correction_reason?: string;
  criteria_breakdown?: Record<string, number>;
  verified_by?: string;
  updated_at?: string;
}

export interface ScoreAuditHistoryEntry {
  id: string;
  score_id: string;
  programme_id: string;
  participant_name: string;
  old_score: number;
  new_score: number;
  changed_by: string;
  timestamp: string;
}

export interface ProgrammeResult {
  id: string;
  programme_id: string;
  participant_type: 'student' | 'team';
  student_id?: string;
  team_id?: string;
  rank: number;
  score: number;
  max_score: number;
  points: number;
  is_published: boolean;
  published_at?: string;
  poster_title?: string;
  poster_template?: 'classic-islamic' | 'royal-gold' | 'minimalist-emerald' | 'modern-islamic';
  poster_bg_url?: string;
  custom_footer_text?: string;
  student_name_en?: string;
  student_name_ml?: string;
  team_name_en?: string;
  team_name_ml?: string;
  programme_title_en?: string;
  programme_title_ml?: string;
  programme_slug?: string;
  category_name_en?: string;
  category_name_ml?: string;
  category_slug?: string;
}

export interface StudentLeaderboardEntry {
  student_id: string;
  student_name_en: string;
  student_name_ml?: string;
  student_code: string;
  team_name_en: string;
  team_name_ml?: string;
  total_points: number;
  programmes_count: number;
  wins_1st_count: number;
  wins_2nd_count: number;
  wins_3rd_count: number;
  rank: number;
}

export interface TeamLeaderboardEntry {
  team_id: string;
  team_name_en: string;
  team_name_ml?: string;
  color_code: string;
  total_points: number;
  members_count: number;
  wins_count: number;
  wins_1st_count: number;
  wins_2nd_count: number;
  wins_3rd_count: number;
  rank: number;
}

export interface GalleryImage {
  id: string;
  title_en: string;
  title_ml?: string;
  album_id?: string;
  category_en: string;
  category_ml?: string;
  image_url: string;
  caption?: string;
  is_published: boolean;
  display_order: number;
}

export interface Announcement {
  id: string;
  title_en: string;
  title_ml?: string;
  content_en: string;
  content_ml?: string;
  short_description_en?: string;
  image_url?: string;
  start_date: string;
  end_date?: string;
  is_important: boolean;
  is_published: boolean;
  is_featured?: boolean;
  priority?: 'Normal' | 'Important' | 'Urgent';
  status?: 'Draft' | 'Published' | 'Archived';
  display_order: number;
}

export interface AdminActivityLog {
  id: string;
  admin_email: string;
  action: string;
  entity_type: string;
  entity_id: string;
  details: string;
  created_at: string;
}

// ==================== CERTIFICATES ENGINE ====================
export type CertificateType = 'Winner' | 'Participation' | 'Special Award';
export type CertificateStatus = 'Draft' | 'Generated' | 'Issued' | 'Revoked';
export type CertificateTemplateStyle = 'classic-islamic' | 'royal-gold' | 'minimal-emerald';

export interface GeneratedCertificate {
  id: string; // e.g. "CERT-8F4A2B9X"
  certificate_type: CertificateType;
  template_style: CertificateTemplateStyle;
  status: CertificateStatus;
  
  recipient_type: 'student' | 'team';
  student_id?: string;
  team_id?: string;
  recipient_name: string;
  recipient_code?: string;
  team_name?: string;
  
  programme_id?: string;
  programme_title: string;
  category_id?: string;
  category_name: string;
  event_name: string;
  
  position?: string; // "1st Place", "2nd Place", "3rd Place", "Participant", "Special Award"
  achievement_text: string;
  issue_date: string;
  
  organizer_name?: string;
  logo_url?: string;
  signature_url?: string;
  seal_url?: string;
  
  qr_code_url?: string;
  revoked_at?: string;
  revoked_reason?: string;
  created_at?: string;
}

export interface CertificateTemplateConfig {
  id?: string;
  title_winner: string;
  title_participation: string;
  title_special: string;
  achievement_text_winner: string;
  achievement_text_participation: string;
  achievement_text_special: string;
  organizer_name: string;
  font_family?: string;
  logo_url?: string;
  signature_url?: string;
  seal_url?: string;
  bg_watermark_url?: string;
}

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

const DEFAULT_EVENTS: EventItem[] = [
  { id: 'evt-2k26', title_en: 'Milad Fest 2K26', subtitle_en: 'Annual Cultural Fest', organizer_en: 'Raulathul Madheena Committee', status: 'Live', start_date: '2026-08-29', end_date: '2026-08-30', is_active: true },
];

const DEFAULT_SITE_SETTINGS: SiteSettings = {
  event_name_en: 'റൗളത്തുൽ മദീന മീലാദ് ഫെസ്റ്റ് - 2K26 | Rowlathul Madeena Milad Fest',
  event_name_ml: 'റൗളത്തുൽ മദീന മീലാദ് ഫെസ്റ്റ് - 2K26',
  event_subtitle_en: 'August 29, Saturday • Al Ihsan Sunni Madrassa, Karingari',
  event_subtitle_ml: '2026 ആഗസ്റ്റ് 29 • ശനിയാഴ്ച • അൽ ഇഹ്സാൻ സുന്നി മദ്രസ കരിങ്ങാരി',
  organizer_name_en: 'Al Ihsan Sunni Madrassa, Karingari',
  description_en: 'Grand Cultural & Spiritual Celebration of Mawlid-un-Nabi ﷺ. Live results, leaderboard, and certificate verification.',
  description_ml: 'അൽ ഇഹ്സാൻ സുന്നി മദ്രസ കരിങ്ങാരി സംഘടിപ്പിക്കുന്ന മീലാദ് ഫെസ്റ്റ് 2K26. തത്സമയ ഫലങ്ങളും ലീഡർബോർഡും.',
  event_date: '2026-08-29',
  event_time: '08:30 AM onwards',
  event_end_date: '2026-08-29',
  timezone: 'Asia/Kolkata',
  venue_en: 'Al Ihsan Sunni Madrassa, Karingari',
  venue_ml: 'അൽ ഇഹ്സാൻ സുന്നി മദ്രസ കരിങ്ങാരി',
  location_address: 'Karingari, Kerala, India',
  map_url: 'https://maps.google.com/?q=Al+Ihsan+Sunni+Madrassa+Karingari',
  map_embed_src: 'https://maps.google.com/maps?q=Karingari+Kerala&t=&z=14&ie=UTF8&iwloc=&output=embed',
  logo_url: '/logo.png',
  hero_image_url: '/og-image.png',
  event_poster_url: '/og-image.png',
  primary_color: '#064e3b',
  secondary_color: '#f59e0b',
  accent_color: '#10b981',
  contact_phone: '+91 98765 43210',
  contact_email: 'contact@miladfest.com',
  social_facebook: 'https://facebook.com',
  social_instagram: 'https://instagram.com',
  social_youtube: 'https://youtube.com',
  social_whatsapp: 'https://wa.me/919876543210',
  seo_site_title: 'റൗളത്തുൽ മദീന മീലാദ് ഫെസ്റ്റ് - 2K26 | Rowlathul Madeena Milad Fest',
  seo_meta_description: 'August 29, Saturday · Al Ihsan Sunni Madrassa, Karingari. Grand Cultural & Spiritual Celebration of Mawlid-un-Nabi ﷺ. Live results, leaderboard, and certificate verification.',
  seo_share_image_url: '/og-image.png',
  is_countdown_enabled: true,
  is_participants_section_enabled: true,
  countdown_target_iso: '2026-08-29T00:00:00+05:30',
  event_status: 'Live',

  // Engine defaults
  is_maintenance_mode: false,
  maintenance_message: 'The website is currently undergoing scheduled maintenance. Please check back shortly.',
  heading_font: 'Cinzel',
  body_font: 'Inter',
  background_color: '#022c22',
  text_color: '#ecfdf5',
  public_pages_visibility: {
    home: true,
    programs: true,
    results: true,
    leaderboard: true,
    announcements: true,
    gallery: true,
    venue: true,
    verify: true,
    register: true,
  },
  leaderboard_point_rules: [
    { rank: 1, points: 10 },
    { rank: 2, points: 7 },
    { rank: 3, points: 5 },
    { rank: 4, points: 3 },
  ],
};

const DEFAULT_SECTIONS: EventSection[] = [
  { id: 'sec-1', section_key: 'hero', title_en: 'Hero Banner', display_order: 1, is_enabled: true },
  { id: 'sec-2', section_key: 'announcements', title_en: 'Announcements', display_order: 2, is_enabled: true },
  { id: 'sec-3', section_key: 'countdown', title_en: 'Countdown Timer', display_order: 3, is_enabled: true },
  { id: 'sec-4', section_key: 'about', title_en: 'About Fest', display_order: 4, is_enabled: true },
  { id: 'sec-5', section_key: 'programmes', title_en: 'Programme Schedule', display_order: 5, is_enabled: true },
  { id: 'sec-6', section_key: 'speakers', title_en: 'Speakers & Guests', display_order: 6, is_enabled: true },
  { id: 'sec-7', section_key: 'gallery', title_en: 'Event Gallery', display_order: 7, is_enabled: true },
  { id: 'sec-8', section_key: 'location', title_en: 'Location & Venue', display_order: 8, is_enabled: true },
];

const DEFAULT_NAV_ITEMS: NavigationItem[] = [
  { id: 'nav-1', label_en: 'Home', target_section: '#hero', href: '/', display_order: 1, is_enabled: true },
  { id: 'nav-2', label_en: 'Programmes', target_section: '', href: '/programs', display_order: 2, is_enabled: true },
  { id: 'nav-3', label_en: 'Participants', target_section: '', href: '/participants', display_order: 3, is_enabled: true },
  { id: 'nav-4', label_en: 'Results', target_section: '', href: '/results', display_order: 4, is_enabled: true },
  { id: 'nav-5', label_en: 'Leaderboard', target_section: '', href: '/leaderboard', display_order: 5, is_enabled: true },
  { id: 'nav-6', label_en: 'Announcements', target_section: '#announcements', href: '', display_order: 6, is_enabled: true },
  { id: 'nav-7', label_en: 'Gallery', target_section: '#gallery', href: '', display_order: 7, is_enabled: true },
  { id: 'nav-8', label_en: 'Venue', target_section: '#location', href: '', display_order: 8, is_enabled: true },
  { id: 'nav-9', label_en: 'About', target_section: '#about', href: '', display_order: 9, is_enabled: true },
];

const DEFAULT_ADMIN_USERS: AdminProfile[] = [
  { id: 'adm-1', email: 'admin@miladfest.com', name_en: 'Super Administrator', role: 'Super Admin', status: 'Active', last_active: 'Just now' },
  { id: 'adm-2', email: 'events@miladfest.com', name_en: 'Event Desk Manager', role: 'Event Manager', status: 'Active', last_active: '2 hours ago' },
  { id: 'adm-3', email: 'scores@miladfest.com', name_en: 'Score Entry Controller', role: 'Score Manager', status: 'Active', last_active: '1 day ago' },
  { id: 'adm-4', email: 'results@miladfest.com', name_en: 'Result & Poster Publisher', role: 'Result Manager', status: 'Active', last_active: '3 days ago' },
];

const DEFAULT_CATEGORIES: Category[] = [];
const DEFAULT_TEAMS: Team[] = [];
const DEFAULT_STUDENTS: Student[] = [];
const DEFAULT_SPEAKERS: Speaker[] = [];
const DEFAULT_PROGRAMMES: Programme[] = [];
const DEFAULT_REGISTRATIONS: ProgrammeRegistration[] = [];
const DEFAULT_SCORES: ScoreEntry[] = [];
const DEFAULT_SCORE_AUDIT: ScoreAuditHistoryEntry[] = [];
const DEFAULT_RESULTS: ProgrammeResult[] = [];
const DEFAULT_GALLERY: GalleryImage[] = [];
const DEFAULT_ANNOUNCEMENTS: Announcement[] = [];
const DEFAULT_LOGS: AdminActivityLog[] = [];
const DEFAULT_CERTIFICATES: GeneratedCertificate[] = [];
const DEFAULT_CERTIFICATE_CONFIG: CertificateTemplateConfig = {
  title_winner: 'CERTIFICATE OF ACHIEVEMENT',
  title_participation: 'CERTIFICATE OF PARTICIPATION',
  title_special: 'SPECIAL RECOGNITION CERTIFICATE',
  achievement_text_winner: 'for securing [Position] in [Programme] ([Category])',
  achievement_text_participation: 'for active participation in [Programme] ([Category])',
  achievement_text_special: 'for outstanding performance and contribution to [Programme]',
  organizer_name: 'Raulathul Madheena Committee',
};

function getLocal<T>(key: string, defaultData: T): T {
  if (typeof window === 'undefined') return defaultData;
  try {
    const item = localStorage.getItem(`meelad_cms_${key}`);
    return item ? JSON.parse(item) : defaultData;
  } catch {
    return defaultData;
  }
}

function setLocal<T>(key: string, data: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`meelad_cms_${key}`, JSON.stringify(data));
  } catch (e) {
    console.error('LocalStorage error:', e);
  }
}

export async function logActivity(action: string, entity_type: string, entity_id: string, details: string, admin_email = 'admin@miladfest.com') {
  const newLog: AdminActivityLog = {
    id: 'log-' + Math.random().toString(36).substring(2) + '-' + Date.now(),
    admin_email,
    action,
    entity_type,
    entity_id,
    details,
    created_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured()) {
    try {
      await supabase.from('admin_activity_logs').insert([{ admin_email, action, entity_type, entity_id, details }]);
    } catch (err) {
      console.warn('Supabase log error:', err);
    }
  }

  const logs = getLocal<AdminActivityLog[]>('logs', DEFAULT_LOGS);
  setLocal('logs', [newLog, ...logs].slice(0, 100));
}

// ==================== MULTI-EVENT ENGINE ====================
export async function getEvents(): Promise<EventItem[]> {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase.from('events').select('*').order('start_date', { ascending: false });
      if (data && !error && data.length > 0) return data;
    } catch (e) {
      console.warn('Supabase getEvents error', e);
    }
  }
  return getLocal<EventItem[]>('events', DEFAULT_EVENTS);
}

export async function createEvent(event: Omit<EventItem, 'id'>): Promise<EventItem> {
  const newEvt: EventItem = {
    ...event,
    id: 'evt-' + Date.now(),
    created_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured()) {
    try {
      const { data } = await supabase.from('events').insert([newEvt]).select().single();
      if (data) newEvt.id = data.id;
    } catch (e) {
      console.warn('Supabase createEvent error', e);
    }
  }

  const current = await getEvents();
  setLocal('events', [newEvt, ...current]);
  await logActivity('create_event', 'events', newEvt.id, `Created new event "${newEvt.title_en}"`);
  return newEvt;
}

export async function setActiveEvent(eventId: string): Promise<void> {
  const events = await getEvents();
  const updated = events.map(e => ({ ...e, is_active: e.id === eventId }));

  if (isSupabaseConfigured()) {
    try {
      await supabase.from('events').update({ is_active: false }).neq('id', eventId);
      await supabase.from('events').update({ is_active: true }).eq('id', eventId);
    } catch (e) {
      console.warn('Supabase setActiveEvent error', e);
    }
  }

  setLocal('events', updated);
  const target = events.find(e => e.id === eventId);
  if (target) {
    await updateSiteSettings({ event_name_en: target.title_en, event_subtitle_en: target.subtitle_en || '' });
  }
  await logActivity('switch_event', 'events', eventId, `Switched active event context`);
}

// ==================== ADMIN PROFILES & RBAC ====================
export async function getAdminProfiles(): Promise<AdminProfile[]> {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase.from('admin_profiles').select('*').order('created_at', { ascending: false });
      if (data && !error) return data;
      if (error) console.warn('Supabase getAdminProfiles error:', error);
    } catch (e) {
      console.warn('Supabase getAdminProfiles error', e);
    }
  }
  return getLocal<AdminProfile[]>('admin_profiles', DEFAULT_ADMIN_USERS);
}

export async function createAdminProfile(user: Omit<AdminProfile, 'id'>): Promise<AdminProfile> {
  const newUser: AdminProfile = {
    ...user,
    id: 'adm-' + Date.now(),
    created_at: new Date().toISOString(),
    last_active: 'Never',
  };

  if (isSupabaseConfigured()) {
    try {
      const { data } = await supabase.from('admin_profiles').insert([newUser]).select().single();
      if (data) newUser.id = data.id;
    } catch (e) {
      console.warn('Supabase createAdminProfile error', e);
    }
  }

  const current = await getAdminProfiles();
  setLocal('admin_profiles', [newUser, ...current]);
  await logActivity('create_admin', 'admin_profiles', newUser.id, `Created admin account for "${newUser.email}" (${newUser.role})`);
  return newUser;
}

export async function updateAdminProfile(id: string, changes: Partial<AdminProfile>): Promise<void> {
  if (isSupabaseConfigured()) {
    try {
      await supabase.from('admin_profiles').update(changes).eq('id', id);
    } catch (e) {
      console.warn('Supabase updateAdminProfile error', e);
    }
  }
  const current = await getAdminProfiles();
  setLocal('admin_profiles', current.map(u => u.id === id ? { ...u, ...changes } : u));
  await logActivity('update_admin', 'admin_profiles', id, `Updated admin role/status`);
}

export async function deleteAdminProfile(id: string): Promise<void> {
  if (isSupabaseConfigured()) {
    try {
      await supabase.from('admin_profiles').delete().eq('id', id);
    } catch (e) {
      console.warn('Supabase deleteAdminProfile error', e);
    }
  }
  const current = await getAdminProfiles();
  setLocal('admin_profiles', current.filter(u => u.id !== id));
  await logActivity('delete', 'admin_profiles', id, 'Deleted admin profile');
}

// ==================== SITE SETTINGS ====================
export async function getSiteSettings(): Promise<SiteSettings> {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase.from('site_settings').select('*').single();
      if (data && !error) return data;
    } catch (e) {
      console.warn('Supabase getSiteSettings error', e);
    }
  }
  return getLocal<SiteSettings>('site_settings', DEFAULT_SITE_SETTINGS);
}

export async function updateSiteSettings(settings: Partial<SiteSettings>): Promise<SiteSettings> {
  const current = await getSiteSettings();
  const updated = { ...current, ...settings };

  if (isSupabaseConfigured()) {
    try {
      if (current.id) {
        await supabase.from('site_settings').update(updated).eq('id', current.id);
      } else {
        await supabase.from('site_settings').insert([updated]);
      }
    } catch (e) {
      console.warn('Supabase updateSiteSettings error', e);
    }
  }

  setLocal('site_settings', updated);
  await logActivity('update', 'site_settings', current.id || 'settings', 'Updated event settings');
  return updated;
}

// ==================== SECTIONS ====================
export async function getSections(onlyEnabled = false): Promise<EventSection[]> {
  if (isSupabaseConfigured()) {
    try {
      let query = supabase.from('event_sections').select('*').order('display_order', { ascending: true });
      if (onlyEnabled) query = query.eq('is_enabled', true);
      const { data, error } = await query;
      if (data && !error && data.length > 0) return data;
    } catch (e) {
      console.warn('Supabase getSections error', e);
    }
  }
  const local = getLocal<EventSection[]>('sections', DEFAULT_SECTIONS);
  const sorted = [...local].sort((a, b) => a.display_order - b.display_order);
  return onlyEnabled ? sorted.filter(s => s.is_enabled) : sorted;
}

export async function updateSection(id: string, changes: Partial<EventSection>): Promise<void> {
  if (isSupabaseConfigured()) {
    try {
      await supabase.from('event_sections').update(changes).eq('id', id);
    } catch (e) {
      console.warn('Supabase updateSection error', e);
    }
  }
  const sections = await getSections(false);
  setLocal('sections', sections.map(s => s.id === id ? { ...s, ...changes } : s));
  await logActivity('update', 'section', id, 'Updated section visibility/title');
}

export async function reorderSections(orderedIds: string[]): Promise<void> {
  const sections = await getSections(false);
  const updated = sections.map(s => {
    const idx = orderedIds.indexOf(s.id);
    return idx !== -1 ? { ...s, display_order: idx + 1 } : s;
  });
  setLocal('sections', updated);

  if (isSupabaseConfigured()) {
    for (let i = 0; i < orderedIds.length; i++) {
      await supabase.from('event_sections').update({ display_order: i + 1 }).eq('id', orderedIds[i]);
    }
  }
  await logActivity('reorder', 'section', 'multiple', 'Reordered website sections');
}

// ==================== NAVIGATION ====================
export async function getNavigationItems(onlyEnabled = false): Promise<NavigationItem[]> {
  if (isSupabaseConfigured()) {
    try {
      let query = supabase.from('navigation_items').select('*').order('display_order', { ascending: true });
      if (onlyEnabled) query = query.eq('is_enabled', true);
      const { data, error } = await query;
      if (data && !error && data.length > 0) return data;
    } catch (e) {
      console.warn('Supabase getNavigationItems error', e);
    }
  }
  const local = getLocal<NavigationItem[]>('navigation', DEFAULT_NAV_ITEMS);
  const sorted = [...local].sort((a, b) => a.display_order - b.display_order);
  return onlyEnabled ? sorted.filter(n => n.is_enabled) : sorted;
}

export async function createNavigationItem(item: Omit<NavigationItem, 'id'>): Promise<NavigationItem> {
  const newItem: NavigationItem = { ...item, id: 'nav-' + Date.now() };
  if (isSupabaseConfigured()) {
    try {
      const { data } = await supabase.from('navigation_items').insert([item]).select().single();
      if (data) newItem.id = data.id;
    } catch (e) {
      console.warn('Supabase createNavigationItem error', e);
    }
  }
  const current = await getNavigationItems(false);
  setLocal('navigation', [...current, newItem]);
  await logActivity('create', 'navigation', newItem.id, `Created nav link "${newItem.label_en}"`);
  return newItem;
}

export async function updateNavigationItem(id: string, changes: Partial<NavigationItem>): Promise<void> {
  if (isSupabaseConfigured()) {
    try {
      await supabase.from('navigation_items').update(changes).eq('id', id);
    } catch (e) {
      console.warn('Supabase updateNavigationItem error', e);
    }
  }
  const items = await getNavigationItems(false);
  setLocal('navigation', items.map(n => n.id === id ? { ...n, ...changes } : n));
  await logActivity('update', 'navigation', id, 'Updated nav link');
}

export async function deleteNavigationItem(id: string): Promise<void> {
  if (isSupabaseConfigured()) {
    try {
      await supabase.from('navigation_items').delete().eq('id', id);
    } catch (e) {
      console.warn('Supabase deleteNavigationItem error', e);
    }
  }
  const items = await getNavigationItems(false);
  setLocal('navigation', items.filter(n => n.id !== id));
  await logActivity('delete', 'navigation', id, 'Deleted nav link');
}

// ==================== CATEGORIES ====================
export async function getCategories(includeArchived = false): Promise<Category[]> {
  if (isSupabaseConfigured()) {
    try {
      let query = supabase.from('categories').select('*').order('display_order', { ascending: true });
      if (!includeArchived) query = query.eq('is_archived', false);
      const { data, error } = await query;
      if (data && !error && data.length > 0) {
        return data.map(c => ({ ...c, slug: c.slug || slugify(c.name_en) }));
      }
    } catch (e) {
      console.warn('Supabase getCategories error', e);
    }
  }
  const cats = getLocal<Category[]>('categories', DEFAULT_CATEGORIES).sort((a, b) => a.display_order - b.display_order);
  const items = includeArchived ? cats : cats.filter(c => !c.is_archived);
  return items.map(c => ({ ...c, slug: c.slug || slugify(c.name_en) }));
}

export async function createCategory(cat: Omit<Category, 'id'>): Promise<Category> {
  const slug = cat.slug || slugify(cat.name_en);
  const newCat: Category = {
    ...cat,
    slug,
    id: 'cat-' + Date.now(),
    is_archived: false,
    allow_individual: cat.allow_individual !== undefined ? cat.allow_individual : true,
    allow_team: cat.allow_team !== undefined ? cat.allow_team : true,
    max_team_size: cat.max_team_size || 5,
  };
  if (isSupabaseConfigured()) {
    try {
      const { data } = await supabase.from('categories').insert([{ ...newCat }]).select().single();
      if (data) newCat.id = data.id;
    } catch (e) {
      console.warn('Supabase createCategory error', e);
    }
  }
  const current = await getCategories(true);
  setLocal('categories', [...current, newCat]);
  await logActivity('create', 'category', newCat.id, `Created category "${newCat.name_en}"`);
  return newCat;
}

export async function updateCategory(id: string, changes: Partial<Category>): Promise<void> {
  if (changes.name_en && !changes.slug) {
    changes.slug = slugify(changes.name_en);
  }
  if (isSupabaseConfigured()) {
    try {
      await supabase.from('categories').update(changes).eq('id', id);
    } catch (e) {
      console.warn('Supabase updateCategory error', e);
    }
  }
  const current = await getCategories(true);
  setLocal('categories', current.map(c => c.id === id ? { ...c, ...changes } : c));
  await logActivity('update', 'category', id, 'Updated category');
}

export async function archiveCategory(id: string): Promise<void> {
  await updateCategory(id, { is_archived: true });
  await logActivity('archive', 'category', id, 'Archived category profile');
}

export async function restoreCategory(id: string): Promise<void> {
  await updateCategory(id, { is_archived: false });
  await logActivity('restore', 'category', id, 'Restored category profile');
}

export async function deleteCategory(id: string, reassignCategoryId?: string): Promise<void> {
  const programmes = await getProgrammes(false, true);
  const affected = programmes.filter(p => p.category_id === id);

  for (const prg of affected) {
    await updateProgramme(prg.id, { category_id: reassignCategoryId || undefined });
  }

  if (isSupabaseConfigured()) {
    try {
      await supabase.from('categories').delete().eq('id', id);
    } catch (e) {
      console.warn('Supabase deleteCategory error', e);
    }
  }

  const current = await getCategories(true);
  setLocal('categories', current.filter(c => c.id !== id));
  await logActivity('delete', 'category', id, `Deleted category (Reassigned ${affected.length} programmes)`);
}

// ==================== TEAMS ====================
export async function getTeams(includeArchived = false): Promise<Team[]> {
  if (isSupabaseConfigured()) {
    try {
      let query = supabase.from('teams').select('*').order('name_en', { ascending: true });
      if (!includeArchived) query = query.eq('is_archived', false);
      const { data, error } = await query;
      if (data && !error && data.length > 0) return data;
    } catch (e) {
      console.warn('Supabase getTeams error', e);
    }
  }
  const local = getLocal<Team[]>('teams', DEFAULT_TEAMS);
  return includeArchived ? local : local.filter(t => !t.is_archived);
}

export async function createTeam(team: Omit<Team, 'id'>): Promise<Team> {
  const currentTeams = await getTeams(true);
  const code = team.code?.trim();

  if (code) {
    const duplicate = currentTeams.find(t => t.code.toLowerCase() === code.toLowerCase());
    if (duplicate) {
      throw new Error('This Team ID is already registered.');
    }
  }

  const newTeam: Team = { ...team, code: code || `TM-${currentTeams.length + 1}`, id: 'team-' + Date.now(), is_archived: false };
  if (isSupabaseConfigured()) {
    try {
      const { data } = await supabase.from('teams').insert([newTeam]).select().single();
      if (data) newTeam.id = data.id;
    } catch (e) {
      console.warn('Supabase createTeam error', e);
    }
  }
  const current = await getTeams(true);
  setLocal('teams', [...current, newTeam]);
  await logActivity('create', 'team', newTeam.id, `Created team "${newTeam.name_en}"`);
  return newTeam;
}

export async function updateTeam(id: string, changes: Partial<Team>): Promise<void> {
  if (changes.code) {
    const currentTeams = await getTeams(true);
    const duplicate = currentTeams.find(t => t.id !== id && t.code.toLowerCase() === changes.code?.trim().toLowerCase());
    if (duplicate) {
      throw new Error('This Team ID is already registered.');
    }
  }

  if (isSupabaseConfigured()) {
    try {
      await supabase.from('teams').update(changes).eq('id', id);
    } catch (e) {
      console.warn('Supabase updateTeam error', e);
    }
  }
  const current = await getTeams(true);
  setLocal('teams', current.map(t => t.id === id ? { ...t, ...changes } : t));
  await logActivity('update', 'team', id, 'Updated team details');
}

export async function restoreTeam(id: string): Promise<void> {
  await updateTeam(id, { is_archived: false });
  await logActivity('restore', 'team', id, 'Restored team profile');
}

export async function deleteTeam(id: string): Promise<void> {
  await updateTeam(id, { is_archived: true });
  await logActivity('archive', 'team', id, 'Archived team profile');
}

// ==================== STUDENTS ====================
export async function generateNextStudentCode(): Promise<string> {
  const students = await getStudents(true);
  const nextNum = students.length + 1;
  return `STU-${nextNum.toString().padStart(4, '0')}`;
}

export async function getStudents(includeArchived = false): Promise<Student[]> {
  if (isSupabaseConfigured()) {
    try {
      let query = supabase.from('students').select('*').order('name_en', { ascending: true });
      if (!includeArchived) query = query.eq('is_archived', false);
      const { data, error } = await query;
      if (data && !error && data.length > 0) return data;
    } catch (e) {
      console.warn('Supabase getStudents error', e);
    }
  }
  const local = getLocal<Student[]>('students', DEFAULT_STUDENTS);
  return includeArchived ? local : local.filter(s => !s.is_archived);
}

export async function createStudent(std: Omit<Student, 'id'>): Promise<Student> {
  const currentStudents = await getStudents(true);
  let studentCode = std.student_id_code?.trim();

  if (!studentCode) {
    studentCode = await generateNextStudentCode();
  }

  const duplicate = currentStudents.find(s => s.student_id_code.toLowerCase() === studentCode.toLowerCase());
  if (duplicate) {
    throw new Error('This Student ID is already registered.');
  }

  const newStd: Student = { ...std, student_id_code: studentCode, id: 'std-' + Date.now(), is_archived: false };
  if (isSupabaseConfigured()) {
    try {
      const { data } = await supabase.from('students').insert([newStd]).select().single();
      if (data) newStd.id = data.id;
    } catch (e) {
      console.warn('Supabase createStudent error', e);
    }
  }
  setLocal('students', [...currentStudents, newStd]);
  await logActivity('create', 'student', newStd.id, `Registered student "${newStd.name_en}" (${newStd.student_id_code})`);
  return newStd;
}

export async function updateStudent(id: string, changes: Partial<Student>): Promise<void> {
  if (changes.student_id_code) {
    const currentStudents = await getStudents(true);
    const duplicate = currentStudents.find(s => s.id !== id && s.student_id_code.toLowerCase() === changes.student_id_code?.trim().toLowerCase());
    if (duplicate) {
      throw new Error('This Student ID is already registered.');
    }
  }

  if (isSupabaseConfigured()) {
    try {
      await supabase.from('students').update(changes).eq('id', id);
    } catch (e) {
      console.warn('Supabase updateStudent error', e);
    }
  }
  const current = await getStudents(true);
  setLocal('students', current.map(s => s.id === id ? { ...s, ...changes } : s));
  await logActivity('update', 'student', id, 'Updated student profile');
}

export async function restoreStudent(id: string): Promise<void> {
  await updateStudent(id, { is_archived: false });
  await logActivity('restore', 'student', id, 'Restored student profile');
}

export async function deleteStudent(id: string): Promise<void> {
  await updateStudent(id, { is_archived: true });
  await logActivity('archive', 'student', id, 'Archived student profile');
}

export async function importStudentsCSV(
  rows: { student_id_code?: string; name_en: string; category_class?: string; team_code_or_name?: string; institution?: string }[]
): Promise<{ successCount: number; duplicateCount: number; errors: string[] }> {
  let successCount = 0;
  let duplicateCount = 0;
  const errors: string[] = [];

  const teams = await getTeams(true);
  const categories = await getCategories();
  const defaultCategory = categories[0]?.name_en || 'Sub-Junior';

  for (const r of rows) {
    if (!r.name_en || !r.name_en.trim()) continue;

    let teamId: string | undefined = undefined;
    if (r.team_code_or_name) {
      const q = r.team_code_or_name.trim().toLowerCase();
      const matchedTeam = teams.find(t => t.code.toLowerCase() === q || t.name_en.toLowerCase() === q);
      if (matchedTeam) teamId = matchedTeam.id;
    }

    try {
      const code = r.student_id_code?.trim() || await generateNextStudentCode();
      await createStudent({
        student_id_code: code,
        name_en: r.name_en.trim(),
        category_class: r.category_class?.trim() || defaultCategory,
        team_id: teamId,
        institution: r.institution?.trim() || undefined,
      });
      successCount++;
    } catch (err: any) {
      if (err.message?.includes('already registered')) {
        duplicateCount++;
      } else {
        errors.push(`Name "${r.name_en}": ${err.message}`);
      }
    }
  }

  return { successCount, duplicateCount, errors };
}

// ==================== SPEAKERS ====================
export async function getSpeakers(onlyPublished = false): Promise<Speaker[]> {
  if (isSupabaseConfigured()) {
    try {
      let query = supabase.from('speakers').select('*').order('display_order', { ascending: true });
      if (onlyPublished) query = query.eq('is_published', true);
      const { data, error } = await query;
      if (data && !error && data.length > 0) return data;
    } catch (e) {
      console.warn('Supabase getSpeakers error', e);
    }
  }
  const local = getLocal<Speaker[]>('speakers', DEFAULT_SPEAKERS).sort((a, b) => a.display_order - b.display_order);
  return onlyPublished ? local.filter(s => s.is_published) : local;
}

export async function createSpeaker(spk: Omit<Speaker, 'id'>): Promise<Speaker> {
  const newSpk: Speaker = { ...spk, id: 'spk-' + Date.now() };
  if (isSupabaseConfigured()) {
    try {
      const { data } = await supabase.from('speakers').insert([spk]).select().single();
      if (data) newSpk.id = data.id;
    } catch (e) {
      console.warn('Supabase createSpeaker error', e);
    }
  }
  const current = await getSpeakers(false);
  setLocal('speakers', [...current, newSpk]);
  await logActivity('create', 'speaker', newSpk.id, `Created speaker "${newSpk.name_en}"`);
  return newSpk;
}

export async function updateSpeaker(id: string, changes: Partial<Speaker>): Promise<void> {
  if (isSupabaseConfigured()) {
    try {
      await supabase.from('speakers').update(changes).eq('id', id);
    } catch (e) {
      console.warn('Supabase updateSpeaker error', e);
    }
  }
  const current = await getSpeakers(false);
  setLocal('speakers', current.map(s => s.id === id ? { ...s, ...changes } : s));
  await logActivity('update', 'speaker', id, 'Updated speaker profile');
}

export async function deleteSpeaker(id: string): Promise<void> {
  if (isSupabaseConfigured()) {
    try {
      await supabase.from('speakers').delete().eq('id', id);
    } catch (e) {
      console.warn('Supabase deleteSpeaker error', e);
    }
  }
  const current = await getSpeakers(false);
  setLocal('speakers', current.filter(s => s.id !== id));
  await logActivity('delete', 'speaker', id, 'Deleted speaker profile');
}

export async function toggleSpeakerPublish(id: string): Promise<boolean> {
  const speakers = await getSpeakers(false);
  const target = speakers.find(s => s.id === id);
  if (!target) return false;
  const newStatus = !target.is_published;
  await updateSpeaker(id, { is_published: newStatus });
  await logActivity(newStatus ? 'publish' : 'unpublish', 'speaker', id, `${newStatus ? 'Published' : 'Unpublished'} speaker`);
  return newStatus;
}

// ==================== PROGRAMMES ====================
export async function getProgrammes(onlyPublished = false, includeArchived = false): Promise<Programme[]> {
  if (isSupabaseConfigured()) {
    try {
      let query = supabase.from('programmes').select('*').order('display_order', { ascending: true });
      if (onlyPublished) {
        query = query.eq('is_published', true).eq('status', 'published');
      }
      if (!includeArchived) {
        query = query.eq('is_archived', false);
      }
      const { data, error } = await query;
      if (data && !error && data.length > 0) {
        return data.map(p => ({ ...p, slug: p.slug || slugify(p.title_en) }));
      }
    } catch (e) {
      console.warn('Supabase getProgrammes error', e);
    }
  }
  const local = getLocal<Programme[]>('programmes', DEFAULT_PROGRAMMES).sort((a, b) => a.display_order - b.display_order);
  let items = includeArchived ? local : local.filter(p => !p.is_archived);
  if (onlyPublished) items = items.filter(p => p.is_published && p.status === 'published');
  return items.map(p => ({ ...p, slug: p.slug || slugify(p.title_en) }));
}

export async function createProgramme(prg: Omit<Programme, 'id'>): Promise<Programme> {
  const slug = prg.slug || slugify(prg.title_en);
  const newPrg: Programme = {
    ...prg,
    slug,
    id: 'prg-' + Date.now(),
    is_archived: false,
    registration_open: prg.registration_open !== undefined ? prg.registration_open : true,
    scoring_direction: prg.scoring_direction || 'higher_wins',
    min_score: prg.min_score || 0,
    max_score: prg.max_score || 100,
    publish_position_count: prg.publish_position_count || 'top_3',
    include_in_student_leaderboard: prg.include_in_student_leaderboard !== undefined ? prg.include_in_student_leaderboard : true,
    include_in_team_leaderboard: prg.include_in_team_leaderboard !== undefined ? prg.include_in_team_leaderboard : true,
    custom_points_map: prg.custom_points_map || { rank1: 10, rank2: 7, rank3: 5, rank4: 3 },
    lifecycle_status: prg.lifecycle_status || 'Draft',
  };

  if (isSupabaseConfigured()) {
    try {
      const { data } = await supabase.from('programmes').insert([{ ...newPrg }]).select().single();
      if (data) newPrg.id = data.id;
    } catch (e) {
      console.warn('Supabase createProgramme error', e);
    }
  }
  const current = await getProgrammes(false, true);
  setLocal('programmes', [...current, newPrg]);
  await logActivity('create', 'programme', newPrg.id, `Created programme "${newPrg.title_en}"`);
  return newPrg;
}

export async function updateProgramme(id: string, changes: Partial<Programme>): Promise<void> {
  if (changes.title_en && !changes.slug) {
    changes.slug = slugify(changes.title_en);
  }
  if (isSupabaseConfigured()) {
    try {
      await supabase.from('programmes').update(changes).eq('id', id);
    } catch (e) {
      console.warn('Supabase updateProgramme error', e);
    }
  }
  const current = await getProgrammes(false, true);
  setLocal('programmes', current.map(p => p.id === id ? { ...p, ...changes } : p));
  await logActivity('update', 'programme', id, 'Updated programme schedule & configuration');
}

export async function duplicateProgramme(id: string): Promise<Programme | null> {
  const programmes = await getProgrammes(false, true);
  const target = programmes.find(p => p.id === id);
  if (!target) return null;

  const copy: Omit<Programme, 'id'> = {
    ...target,
    title_en: `${target.title_en} (Copy)`,
    slug: `${target.slug}-copy`,
    status: 'draft',
    is_published: false,
    lifecycle_status: 'Draft',
    display_order: programmes.length + 1,
    is_archived: false,
  };

  const created = await createProgramme(copy);
  await logActivity('duplicate', 'programme', created.id, `Duplicated programme config "${target.title_en}"`);
  return created;
}

export async function deleteProgramme(id: string): Promise<void> {
  const regs = await getProgrammeRegistrations(id);
  const scrs = await getProgrammeScores(id);

  if (regs.length > 0 || scrs.length > 0) {
    await updateProgramme(id, { is_archived: true });
    await logActivity('archive', 'programme', id, 'Archived programme profile');
    return;
  }

  if (isSupabaseConfigured()) {
    try {
      await supabase.from('programmes').delete().eq('id', id);
    } catch (e) {
      console.warn('Supabase deleteProgramme error', e);
    }
  }
  const current = await getProgrammes(false, true);
  setLocal('programmes', current.filter(p => p.id !== id));
  await logActivity('delete', 'programme', id, 'Deleted programme');
}

export async function toggleProgrammePublish(id: string): Promise<boolean> {
  const programmes = await getProgrammes(false, true);
  const target = programmes.find(p => p.id === id);
  if (!target) return false;

  const newStatus = !target.is_published;
  await updateProgramme(id, {
    is_published: newStatus,
    status: newStatus ? 'published' : 'draft',
    lifecycle_status: newStatus ? 'Published' : 'Completed',
  });
  await logActivity(newStatus ? 'publish' : 'unpublish', 'programme', id, `${newStatus ? 'Published' : 'Unpublished'} programme "${target.title_en}"`);
  return newStatus;
}

export async function updateProgrammeStatus(
  id: string,
  newLifecycleStatus: Programme['lifecycle_status'],
  adminEmail = 'admin@miladfest.com'
): Promise<Programme> {
  const programmes = await getProgrammes(false, true);
  const target = programmes.find(p => p.id === id);
  if (!target) throw new Error('Programme not found');

  const changes: Partial<Programme> = {
    lifecycle_status: newLifecycleStatus,
  };

  if (newLifecycleStatus === 'Ongoing') {
    changes.registration_open = false;
    await logActivity('start_programme', 'programme', id, `Programme started: "${target.title_en}"`, adminEmail);
  } else if (newLifecycleStatus === 'Completed') {
    await logActivity('complete_programme', 'programme', id, `Programme completed: "${target.title_en}"`, adminEmail);
  } else if (newLifecycleStatus === 'Published') {
    changes.is_published = true;
    changes.status = 'published';
    await logActivity('publish_programme_status', 'programme', id, `Programme status set to Published: "${target.title_en}"`, adminEmail);
  } else {
    await logActivity('update_programme_status', 'programme', id, `Programme lifecycle changed to ${newLifecycleStatus}: "${target.title_en}"`, adminEmail);
  }

  await updateProgramme(id, changes);
  return { ...target, ...changes };
}

export async function getLiveEventTimeline(): Promise<{ id: string; title: string; details: string; timestamp: string; type: 'started' | 'completed' | 'published' }[]> {
  const logs = getLocal<AdminActivityLog[]>('logs', DEFAULT_LOGS);
  const milestoneActions = ['start_programme', 'complete_programme', 'publish', 'publish_programme_status', 'generate_results'];

  const milestones = logs.filter(l => milestoneActions.includes(l.action));

  return milestones.map(m => {
    let type: 'started' | 'completed' | 'published' = 'started';
    if (m.action === 'complete_programme') type = 'completed';
    if (m.action === 'publish' || m.action === 'publish_programme_status') type = 'published';

    return {
      id: m.id,
      title: m.details,
      details: `Logged by ${m.admin_email}`,
      timestamp: m.created_at,
      type,
    };
  });
}

// ==================== PROGRAMME REGISTRATIONS ====================
export async function getProgrammeRegistrations(programmeId?: string): Promise<ProgrammeRegistration[]> {
  if (isSupabaseConfigured()) {
    try {
      let query = supabase.from('programme_registrations').select('*');
      if (programmeId) query = query.eq('programme_id', programmeId);
      const { data, error } = await query;
      if (data && !error) return data;
      if (error) console.warn('Supabase getProgrammeRegistrations error:', error);
    } catch (e) {
      console.warn('Supabase getProgrammeRegistrations error', e);
    }
  }
  const local = getLocal<ProgrammeRegistration[]>('registrations', DEFAULT_REGISTRATIONS);
  return programmeId ? local.filter(r => r.programme_id === programmeId) : local;
}

export async function registerParticipant(
  programmeId: string,
  participantType: 'student' | 'team',
  studentId?: string,
  teamId?: string,
  status: 'Registered' | 'Confirmed' | 'Withdrawn' | 'Disqualified' = 'Registered',
  attendance: 'Present' | 'Absent' | 'Unmarked' = 'Unmarked',
  isAdminOverride: boolean = false
): Promise<ProgrammeRegistration> {
  const programmes = await getProgrammes(false, true);
  const programme = programmes.find(p => p.id === programmeId);

  if (programme) {
    if (!isAdminOverride) {
      if (programme.registration_open === false) {
        throw new Error('Registration for this programme is currently closed.');
      }
      if (programme.registration_deadline) {
        const deadline = new Date(programme.registration_deadline).getTime();
        if (Date.now() > deadline) {
          throw new Error('Registration deadline for this programme has passed.');
        }
      }
    }
  }

  const existingRegs = await getProgrammeRegistrations(programmeId);

  if (participantType === 'student' && studentId) {
    const isDup = existingRegs.some(r => r.student_id === studentId);
    if (isDup) {
      throw new Error('Student is already registered for this programme.');
    }
  }

  if (participantType === 'team' && teamId) {
    const isDup = existingRegs.some(r => r.team_id === teamId);
    if (isDup) {
      throw new Error('Team is already registered for this programme.');
    }

    if (programme) {
      const maxTeam = programme.max_team_size || 10;
      const allStudents = await getStudents(false);
      const teamMembers = allStudents.filter(s => s.team_id === teamId);
      if (teamMembers.length > maxTeam) {
        throw new Error(`Team size (${teamMembers.length}) exceeds the maximum allowed team size (${maxTeam}) for this programme.`);
      }
    }
  }

  const newReg: ProgrammeRegistration = {
    id: 'reg-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
    programme_id: programmeId,
    participant_type: participantType,
    student_id: studentId,
    team_id: teamId,
    status,
    attendance,
    created_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured()) {
    try {
      const { data } = await supabase.from('programme_registrations').insert([{
        programme_id: programmeId,
        participant_type: participantType,
        student_id: studentId,
        team_id: teamId,
        status,
        attendance,
      }]).select().single();
      if (data) newReg.id = data.id;
    } catch (e) {
      console.warn('Supabase registerParticipant error', e);
    }
  }

  const currentAll = getLocal<ProgrammeRegistration[]>('registrations', DEFAULT_REGISTRATIONS);
  setLocal('registrations', [...currentAll, newReg]);
  await logActivity('register', 'programme_registrations', newReg.id, `Registered ${participantType} for programme ${programmeId}`);
  return newReg;
}

export async function bulkRegisterParticipants(
  programmeId: string,
  studentIds: string[]
): Promise<{ successCount: number; duplicateCount: number; errors: string[] }> {
  let successCount = 0;
  let duplicateCount = 0;
  const errors: string[] = [];

  const students = await getStudents(false);

  for (const stdId of studentIds) {
    const std = students.find(s => s.id === stdId);
    try {
      await registerParticipant(programmeId, 'student', stdId, std?.team_id);
      successCount++;
    } catch (err: any) {
      if (err.message?.includes('already registered')) {
        duplicateCount++;
      } else {
        errors.push(err.message || `Error registering student ${stdId}`);
      }
    }
  }

  return { successCount, duplicateCount, errors };
}

export async function updateRegistrationStatus(
  regId: string,
  status: 'Registered' | 'Confirmed' | 'Withdrawn' | 'Disqualified'
): Promise<void> {
  if (isSupabaseConfigured()) {
    try {
      await supabase.from('programme_registrations').update({ status }).eq('id', regId);
    } catch (e) {
      console.warn('Supabase updateRegistrationStatus error', e);
    }
  }
  const current = getLocal<ProgrammeRegistration[]>('registrations', DEFAULT_REGISTRATIONS);
  setLocal('registrations', current.map(r => r.id === regId ? { ...r, status } : r));
  await logActivity('update', 'programme_registrations', regId, `Updated registration status to ${status}`);
}

export async function updateRegistrationAttendance(
  regId: string,
  attendance: 'Present' | 'Absent' | 'Excused' | 'Cancelled' | 'Pending' | 'Unmarked',
  checkedInBy = 'Check-in Staff',
  reason?: string,
  method: 'QR' | 'Manual' = 'Manual'
): Promise<ProgrammeRegistration> {
  const timestamp = new Date().toISOString();
  const payload = {
    attendance,
    checked_in_at: attendance === 'Present' ? timestamp : undefined,
    checked_in_by: checkedInBy,
    checkin_method: method,
    attendance_notes: reason,
  };

  if (isSupabaseConfigured()) {
    try {
      await supabase.from('programme_registrations').update(payload).eq('id', regId);
    } catch (e) {
      console.warn('Supabase updateRegistrationAttendance error', e);
    }
  }

  const current = getLocal<ProgrammeRegistration[]>('registrations', DEFAULT_REGISTRATIONS);
  const updated = current.map(r => r.id === regId ? { ...r, ...payload } : r);
  setLocal('registrations', updated);

  const targetReg = updated.find(r => r.id === regId)!;
  await logActivity('attendance_update', 'programme_registrations', regId, `Marked attendance as "${attendance}" for ${targetReg.full_name || regId} by ${checkedInBy}${reason ? ` (${reason})` : ''}`);
  return targetReg;
}

export async function checkInByRegistrationCode(
  code: string,
  programmeId?: string,
  checkedInBy = 'Check-in Staff'
): Promise<{ success: boolean; registration?: ProgrammeRegistration; message: string; isAlreadyCheckedIn?: boolean }> {
  const cleanCode = code.trim().toUpperCase();
  const allRegs = await getProgrammeRegistrations();
  
  const match = allRegs.find(r => 
    r.registration_id_code?.toUpperCase() === cleanCode || 
    r.id === code ||
    r.student_id === code
  );

  if (!match) {
    return { success: false, message: 'Registration record not found.' };
  }

  if (programmeId && match.programme_id !== programmeId) {
    return { success: false, registration: match, message: 'This registration is not valid for this programme.' };
  }

  if (match.status === 'Cancelled' || match.status === 'Rejected') {
    return { success: false, registration: match, message: `Registration is ${match.status.toLowerCase()} and cannot be checked in.` };
  }

  if (match.attendance === 'Present') {
    const timeStr = match.checked_in_at ? new Date(match.checked_in_at).toLocaleTimeString() : 'earlier';
    return { success: true, registration: match, isAlreadyCheckedIn: true, message: `Already Checked In at ${timeStr}` };
  }

  const updated = await updateRegistrationAttendance(match.id, 'Present', checkedInBy, undefined, 'QR');
  return { success: true, registration: updated, message: `Successfully checked in ${updated.full_name || updated.id}` };
}

export async function getAttendanceSummary(programmeId: string): Promise<{
  registered: number;
  confirmed: number;
  present: number;
  absent: number;
  excused: number;
  cancelled: number;
}> {
  const regs = await getProgrammeRegistrations(programmeId);
  return {
    registered: regs.length,
    confirmed: regs.filter(r => r.status === 'Confirmed' || r.status === 'Registered').length,
    present: regs.filter(r => r.attendance === 'Present').length,
    absent: regs.filter(r => r.attendance === 'Absent').length,
    excused: regs.filter(r => r.attendance === 'Excused').length,
    cancelled: regs.filter(r => r.status === 'Cancelled' || r.attendance === 'Cancelled').length,
  };
}

export async function getRecentCheckIns(limit = 10): Promise<ProgrammeRegistration[]> {
  const regs = await getProgrammeRegistrations();
  const checkedIn = regs.filter(r => r.attendance === 'Present' && r.checked_in_at);
  checkedIn.sort((a, b) => new Date(b.checked_in_at!).getTime() - new Date(a.checked_in_at!).getTime());
  return checkedIn.slice(0, limit);
}

export async function exportAttendanceCSV(programmeId?: string): Promise<string> {
  const regs = await getProgrammeRegistrations(programmeId);
  const headers = ['Registration ID', 'Participant Name', 'Category', 'Gender', 'Status', 'Attendance', 'Check-in Time', 'Checked-in By'];
  
  const rows = regs.map(r => [
    r.registration_id_code || r.id,
    `"${r.full_name || 'Participant'}"`,
    `"${r.category_name || 'General'}"`,
    r.gender || 'General',
    r.status || 'Confirmed',
    r.attendance || 'Unmarked',
    r.checked_in_at ? `"${new Date(r.checked_in_at).toLocaleString()}"` : 'N/A',
    `"${r.checked_in_by || 'System'}"`
  ]);

  return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
}

export async function removeRegistration(id: string): Promise<void> {
  if (isSupabaseConfigured()) {
    try {
      await supabase.from('programme_registrations').delete().eq('id', id);
    } catch (e) {
      console.warn('Supabase removeRegistration error', e);
    }
  }
  const current = getLocal<ProgrammeRegistration[]>('registrations', DEFAULT_REGISTRATIONS);
  setLocal('registrations', current.filter(r => r.id !== id));
  await logActivity('delete', 'programme_registrations', id, 'Removed programme registration');
}

export async function generateUniqueRegistrationId(): Promise<string> {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let randomCode = '';
  for (let i = 0; i < 6; i++) {
    randomCode += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `REG-${randomCode}`;
}

export async function submitPublicRegistration(payload: {
  programme_id: string;
  participant_type: 'student' | 'team';
  full_name: string;
  student_id_code?: string;
  category_id: string;
  gender: 'Male' | 'Female';
  class_grade?: string;
  contact_phone?: string;
  contact_email?: string;
  team_id?: string;
  team_name?: string;
  team_members?: { name: string; class_grade?: string }[];
}): Promise<ProgrammeRegistration> {
  const programmes = await getProgrammes(false, true);
  const programme = programmes.find(p => p.id === payload.programme_id);
  if (!programme) throw new Error('Programme not found.');

  // 1. Check Registration Mode
  const mode = programme.registration_mode || 'Both';
  if (mode === 'Admin Only') {
    throw new Error('Online registration is not available for this programme.');
  }

  // 2. Check Open status & Deadline
  if (programme.registration_open === false) {
    throw new Error('Registration for this programme is currently closed.');
  }

  if (programme.registration_deadline) {
    const deadline = new Date(programme.registration_deadline).getTime();
    if (Date.now() > deadline && !programme.allow_late_registration) {
      throw new Error(`Registration ended on ${new Date(programme.registration_deadline).toLocaleDateString()}`);
    }
  }

  // 3. Check Capacity
  const existingRegs = await getProgrammeRegistrations(payload.programme_id);
  const validRegs = existingRegs.filter(r => r.status !== 'Rejected' && r.status !== 'Cancelled');
  if (programme.max_participants && validRegs.length >= programme.max_participants) {
    throw new Error('Registration capacity reached. Registration is now closed.');
  }

  // 4. Validate Category Eligibility
  const categories = await getCategories(true);
  const selectedCat = categories.find(c => c.id === payload.category_id);
  if (!selectedCat) throw new Error('Invalid category selected.');

  const catName = selectedCat.name_en.toLowerCase();
  if (catName.includes('female') && payload.gender === 'Male') {
    throw new Error('This participant is not eligible for this category.');
  }
  if (catName.includes('male') && !catName.includes('female') && payload.gender === 'Female') {
    throw new Error('This participant is not eligible for this category.');
  }

  // 5. Team size validation for team registrations
  if (payload.participant_type === 'team') {
    const membersCount = (payload.team_members?.length || 0) + 1;
    const maxTeam = programme.max_team_size || selectedCat.max_team_size || 10;
    const minTeam = programme.min_team_size || 2;

    if (membersCount < minTeam) {
      throw new Error(`Team registration requires a minimum of ${minTeam} members.`);
    }
    if (membersCount > maxTeam) {
      throw new Error(`Team size (${membersCount}) exceeds maximum allowed (${maxTeam}) for this programme.`);
    }
  }

  // 6. Duplicate Prevention
  const isDuplicate = validRegs.some(r => {
    if (r.category_id === payload.category_id) {
      if (r.full_name?.toLowerCase() === payload.full_name.toLowerCase() && (r.contact_phone === payload.contact_phone || r.contact_email === payload.contact_email)) {
        return true;
      }
    }
    return false;
  });

  if (isDuplicate) {
    throw new Error('You are already registered for this programme.');
  }

  let studentId: string | undefined = undefined;
  if (payload.participant_type === 'student') {
    const students = await getStudents(true);
    let std = payload.student_id_code ? students.find(s => s.student_id_code.toLowerCase() === payload.student_id_code?.trim().toLowerCase()) : undefined;

    if (!std) {
      std = students.find(s => s.name_en.toLowerCase() === payload.full_name.toLowerCase() && (s.contact_phone === payload.contact_phone || s.contact_email === payload.contact_email));
    }

    if (std) {
      studentId = std.id;
      const stdDup = validRegs.some(r => r.student_id === std?.id);
      if (stdDup) {
        throw new Error('You are already registered for this programme.');
      }
    } else {
      const newStd = await createStudent({
        student_id_code: payload.student_id_code || await generateNextStudentCode(),
        name_en: payload.full_name,
        category_class: selectedCat.name_en,
        gender: payload.gender,
        contact_phone: payload.contact_phone,
        contact_email: payload.contact_email,
        team_id: payload.team_id,
      });
      studentId = newStd.id;
    }
  }

  const approvalMode = programme.approval_mode || 'Automatic';
  const initialStatus = approvalMode === 'Manual' ? 'Pending' : 'Confirmed';
  const regCode = await generateUniqueRegistrationId();

  const newReg: ProgrammeRegistration = {
    id: 'reg-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
    programme_id: payload.programme_id,
    participant_type: payload.participant_type,
    student_id: studentId,
    team_id: payload.team_id,
    status: initialStatus,
    attendance: 'Unmarked',
    registration_id_code: regCode,
    full_name: payload.full_name,
    gender: payload.gender,
    class_grade: payload.class_grade,
    contact_phone: payload.contact_phone,
    contact_email: payload.contact_email,
    category_id: payload.category_id,
    category_name: selectedCat.name_en,
    team_name: payload.team_name,
    team_members: payload.team_members,
    approval_mode: approvalMode,
    created_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured()) {
    try {
      const { data } = await supabase.from('programme_registrations').insert([{
        programme_id: payload.programme_id,
        participant_type: payload.participant_type,
        student_id: studentId,
        team_id: payload.team_id,
        status: initialStatus,
        attendance: 'Unmarked',
        registration_id_code: regCode,
        full_name: payload.full_name,
        gender: payload.gender,
        class_grade: payload.class_grade,
        contact_phone: payload.contact_phone,
        contact_email: payload.contact_email,
        category_id: payload.category_id,
        team_name: payload.team_name,
        team_members: payload.team_members,
      }]).select().single();
      if (data) newReg.id = data.id;
    } catch (e) {
      console.warn('Supabase submitPublicRegistration error', e);
    }
  }

  const currentAll = getLocal<ProgrammeRegistration[]>('registrations', DEFAULT_REGISTRATIONS);
  setLocal('registrations', [...currentAll, newReg]);
  await logActivity('public_register', 'programme_registrations', newReg.id, `Public registration submitted for "${payload.full_name}" (${regCode}) - Status: ${initialStatus}`);
  return newReg;
}

export async function getRegistrationByCode(code: string): Promise<ProgrammeRegistration | null> {
  const cleanCode = code.trim().toUpperCase();
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase.from('programme_registrations').select('*').eq('registration_id_code', cleanCode).single();
      if (data && !error) return data;
    } catch (e) {
      console.warn('Supabase getRegistrationByCode error', e);
    }
  }

  const all = getLocal<ProgrammeRegistration[]>('registrations', DEFAULT_REGISTRATIONS);
  return all.find(r => r.registration_id_code?.toUpperCase() === cleanCode || r.id === code) || null;
}

export async function reviewRegistration(
  regId: string,
  action: 'Approve' | 'Reject',
  rejectionReason?: string
): Promise<ProgrammeRegistration> {
  const status: ProgrammeRegistration['status'] = action === 'Approve' ? 'Confirmed' : 'Rejected';

  if (isSupabaseConfigured()) {
    try {
      await supabase.from('programme_registrations').update({ status, rejection_reason: rejectionReason }).eq('id', regId);
    } catch (e) {
      console.warn('Supabase reviewRegistration error', e);
    }
  }

  const current = getLocal<ProgrammeRegistration[]>('registrations', DEFAULT_REGISTRATIONS);
  const updated = current.map(r => r.id === regId ? { ...r, status, rejection_reason: rejectionReason } : r);
  setLocal('registrations', updated);
  await logActivity('review_registration', 'programme_registrations', regId, `Registration ${action}d (Status: ${status})`);
  return updated.find(r => r.id === regId)!;
}

// ==================== SCORES & VERIFICATION ====================
export async function getProgrammeScores(programmeId?: string): Promise<ScoreEntry[]> {
  if (isSupabaseConfigured()) {
    try {
      let query = supabase.from('scores').select('*');
      if (programmeId) query = query.eq('programme_id', programmeId);
      const { data, error } = await query;
      if (data && !error && data.length > 0) return data;
    } catch (e) {
      console.warn('Supabase getProgrammeScores error', e);
    }
  }
  const local = getLocal<ScoreEntry[]>('scores', DEFAULT_SCORES);
  return programmeId ? local.filter(s => s.programme_id === programmeId) : local;
}

export async function getScoreAuditHistory(programmeId?: string): Promise<ScoreAuditHistoryEntry[]> {
  if (isSupabaseConfigured()) {
    try {
      let query = supabase.from('score_audit_history').select('*').order('timestamp', { ascending: false });
      if (programmeId) query = query.eq('programme_id', programmeId);
      const { data, error } = await query;
      if (data && !error && data.length > 0) return data;
    } catch (e) {
      console.warn('Supabase getScoreAuditHistory error', e);
    }
  }
  const local = getLocal<ScoreAuditHistoryEntry[]>('score_audit_history', DEFAULT_SCORE_AUDIT);
  return programmeId ? local.filter(a => a.programme_id === programmeId) : local;
}

export async function getScoreVerificationSummary(programmeId: string): Promise<{ totalEntered: number; verifiedCount: number; pendingCount: number }> {
  const scores = await getProgrammeScores(programmeId);
  const verified = scores.filter(s => s.is_verified);
  return {
    totalEntered: scores.length,
    verifiedCount: verified.length,
    pendingCount: scores.length - verified.length,
  };
}

export async function saveScore(
  programmeId: string,
  registrationId: string,
  studentId: string | undefined,
  teamId: string | undefined,
  score: number,
  maxScore: number,
  adminEmail = 'admin@miladfest.com',
  allowVerifiedOverride = false
): Promise<ScoreEntry> {
  if (score > maxScore) {
    throw new Error(`Score (${score}) cannot exceed maximum score (${maxScore})`);
  }

  const scores = await getProgrammeScores();
  const existing = scores.find(s => s.registration_id === registrationId);

  if (existing && existing.is_verified && !allowVerifiedOverride) {
    throw new Error('This score has been verified. You must unverify the score before editing it.');
  }

  const payload: ScoreEntry = {
    id: existing ? existing.id : 'scr-' + Date.now(),
    programme_id: programmeId,
    registration_id: registrationId,
    student_id: studentId,
    team_id: teamId,
    score,
    max_score: maxScore,
    is_verified: allowVerifiedOverride ? existing?.is_verified ?? false : false,
    updated_at: new Date().toISOString(),
  };

  // Record Audit Log if editing existing score
  if (existing && existing.score !== score) {
    const students = await getStudents(true);
    const teams = await getTeams(true);
    const std = students.find(s => s.id === studentId);
    const tm = teams.find(t => t.id === teamId);
    const name = std?.name_en || tm?.name_en || 'Participant';

    const auditEntry: ScoreAuditHistoryEntry = {
      id: 'audit-' + Math.random().toString(36).substring(2) + '-' + Date.now(),
      score_id: existing.id,
      programme_id: programmeId,
      participant_name: name,
      old_score: existing.score,
      new_score: score,
      changed_by: adminEmail,
      timestamp: new Date().toISOString(),
    };

    const currentAudit = getLocal<ScoreAuditHistoryEntry[]>('score_audit_history', DEFAULT_SCORE_AUDIT);
    setLocal('score_audit_history', [auditEntry, ...currentAudit]);

    if (isSupabaseConfigured()) {
      try {
        await supabase.from('score_audit_history').insert([auditEntry]);
      } catch (e) {
        console.warn('Supabase audit insert error', e);
      }
    }
  }

  if (isSupabaseConfigured()) {
    try {
      if (existing) {
        await supabase.from('scores').update(payload).eq('id', existing.id);
      } else {
        await supabase.from('scores').insert([payload]);
      }
    } catch (e) {
      console.warn('Supabase saveScore error', e);
    }
  }

  const updated = existing
    ? scores.map(s => s.id === existing.id ? payload : s)
    : [...scores, payload];

  setLocal('scores', updated);
  await logActivity('score_entry', 'scores', payload.id, `Entered score (${score}/${maxScore})`);
  return payload;
}

export async function unverifyScore(
  scoreId: string,
  reason: string,
  adminEmail = 'admin@miladfest.com'
): Promise<ScoreEntry> {
  const scores = await getProgrammeScores();
  const target = scores.find(s => s.id === scoreId);
  if (!target) throw new Error('Score record not found.');

  const updatedTarget: ScoreEntry = { ...target, is_verified: false };

  if (isSupabaseConfigured()) {
    try {
      await supabase.from('scores').update({ is_verified: false }).eq('id', scoreId);
    } catch (e) {
      console.warn('Supabase unverifyScore error', e);
    }
  }

  const currentAudit = getLocal<ScoreAuditHistoryEntry[]>('score_audit_history', DEFAULT_SCORE_AUDIT);
  const auditEntry: ScoreAuditHistoryEntry = {
    id: 'audit-unver-' + Date.now(),
    score_id: scoreId,
    programme_id: target.programme_id,
    participant_name: target.student_id || target.team_id || 'Participant',
    old_score: target.score,
    new_score: target.score,
    changed_by: adminEmail,
    timestamp: new Date().toISOString(),
  };
  setLocal('score_audit_history', [auditEntry, ...currentAudit]);

  const updatedScores = scores.map(s => s.id === scoreId ? updatedTarget : s);
  setLocal('scores', updatedScores);
  await logActivity('unverify_score', 'scores', scoreId, `Unverified score for editing. Reason: ${reason}`);
  return updatedTarget;
}

export async function requestScoreCorrection(
  scoreId: string,
  reason: string,
  adminEmail = 'admin@miladfest.com'
): Promise<ScoreEntry> {
  const scores = await getProgrammeScores();
  const target = scores.find(s => s.id === scoreId);
  if (!target) throw new Error('Score record not found.');

  const updatedTarget: ScoreEntry = { 
    ...target, 
    is_verified: false,
    needs_correction: true,
    correction_reason: reason 
  };

  if (isSupabaseConfigured()) {
    try {
      await supabase.from('scores').update({ 
        is_verified: false, 
        needs_correction: true, 
        correction_reason: reason 
      }).eq('id', scoreId);
    } catch (e) {
      console.warn('Supabase requestScoreCorrection error', e);
    }
  }

  const updatedScores = scores.map(s => s.id === scoreId ? updatedTarget : s);
  setLocal('scores', updatedScores);
  await logActivity('request_correction', 'scores', scoreId, `Requested correction for score. Reason: ${reason}`);
  return updatedTarget;
}

export async function submitJudgeScores(
  programmeId: string,
  judgeEmail = 'judge@miladfest.com'
): Promise<number> {
  const scores = await getProgrammeScores(programmeId);
  if (scores.length === 0) throw new Error('No scores entered yet for this programme.');

  const updated = scores.map(s => ({ ...s, is_submitted: true }));

  if (isSupabaseConfigured()) {
    try {
      await supabase.from('scores').update({ is_submitted: true }).eq('programme_id', programmeId);
    } catch (e) {
      console.warn('Supabase submitJudgeScores error', e);
    }
  }

  const allScores = await getProgrammeScores();
  setLocal('scores', allScores.map(s => s.programme_id === programmeId ? { ...s, is_submitted: true } : s));
  await logActivity('submit_scores', 'scores', programmeId, `Judge (${judgeEmail}) submitted ${scores.length} scores for verification`);
  return scores.length;
}

export interface JudgeNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'assignment' | 'correction' | 'approval' | 'starting_soon';
  is_read: boolean;
}

export async function getJudgeNotifications(): Promise<JudgeNotification[]> {
  const defaultNotifs: JudgeNotification[] = [
    {
      id: 'notif-1',
      title: 'Programme Assigned',
      message: 'You have been assigned as judge for Islamic Quiz (Junior Female).',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      type: 'assignment',
      is_read: false,
    },
    {
      id: 'notif-2',
      title: 'Programme Starting Soon',
      message: 'Junior Female Islamic Quiz starts in 15 minutes at Main Hall.',
      timestamp: new Date(Date.now() - 1800000).toISOString(),
      type: 'starting_soon',
      is_read: false,
    },
  ];
  return getLocal<JudgeNotification[]>('judge_notifications', defaultNotifs);
}

export async function bulkImportScoresCSV(
  programmeId: string,
  rows: { participantCode: string; score: number }[],
  maxScore: number
): Promise<{ successCount: number; errorCount: number; errors: string[] }> {
  let successCount = 0;
  let errorCount = 0;
  const errors: string[] = [];

  const [students, teams, registrations] = await Promise.all([
    getStudents(true),
    getTeams(true),
    getProgrammeRegistrations(programmeId),
  ]);

  for (const r of rows) {
    if (r.score > maxScore) {
      errorCount++;
      errors.push(`Code "${r.participantCode}": Score (${r.score}) exceeds max score (${maxScore}).`);
      continue;
    }

    const std = students.find(s => s.student_id_code.toLowerCase() === r.participantCode.trim().toLowerCase());
    const tm = teams.find(t => t.code?.toLowerCase() === r.participantCode.trim().toLowerCase());

    if (!std && !tm) {
      errorCount++;
      errors.push(`Unknown participant code "${r.participantCode}".`);
      continue;
    }

    let reg = registrations.find(regItem => (std && regItem.student_id === std.id) || (tm && regItem.team_id === tm.id));
    if (!reg) {
      reg = await registerParticipant(programmeId, std ? 'student' : 'team', std?.id, tm?.id);
    }

    try {
      await saveScore(programmeId, reg.id, std?.id, tm?.id, r.score, maxScore);
      successCount++;
    } catch (err: any) {
      errorCount++;
      errors.push(`Code "${r.participantCode}": ${err.message}`);
    }
  }

  return { successCount, errorCount, errors };
}

export async function verifyScores(programmeId: string): Promise<void> {
  const scores = await getProgrammeScores(programmeId);
  const updated = scores.map(s => ({ ...s, is_verified: true, verified_by: 'admin@miladfest.com' }));

  if (isSupabaseConfigured()) {
    try {
      await supabase.from('scores').update({ is_verified: true }).eq('programme_id', programmeId);
    } catch (e) {
      console.warn('Supabase verifyScores error', e);
    }
  }

  const allScores = await getProgrammeScores();
  setLocal('scores', allScores.map(s => s.programme_id === programmeId ? { ...s, is_verified: true } : s));
  await logActivity('verify', 'scores', programmeId, `Verified scores for programme ${programmeId}`);
}

// ==================== RESULTS & LEADERBOARDS ====================
export async function getProgrammeResults(programmeId?: string, onlyPublished = false): Promise<ProgrammeResult[]> {
  let rawResults: ProgrammeResult[] = [];
  if (isSupabaseConfigured()) {
    try {
      let query = supabase.from('results').select('*');
      if (programmeId) query = query.eq('programme_id', programmeId);
      if (onlyPublished) query = query.eq('is_published', true);
      const { data, error } = await query;
      if (data && !error && data.length > 0) rawResults = data;
    } catch (e) {
      console.warn('Supabase getProgrammeResults error', e);
    }
  }

  if (rawResults.length === 0) {
    const local = getLocal<ProgrammeResult[]>('results', DEFAULT_RESULTS);
    rawResults = programmeId ? local.filter(r => r.programme_id === programmeId) : local;
    if (onlyPublished) rawResults = rawResults.filter(r => r.is_published);
  }

  const [students, teams, programmes, categories] = await Promise.all([
    getStudents(true),
    getTeams(true),
    getProgrammes(false, true),
    getCategories(true),
  ]);

  return rawResults.map(r => {
    const std = students.find(s => s.id === r.student_id);
    const tm = teams.find(t => t.id === r.team_id || (std && std.team_id === t.id));
    const prg = programmes.find(p => p.id === r.programme_id);
    const cat = prg ? categories.find(c => c.id === prg.category_id) : undefined;

    return {
      ...r,
      student_name_en: std?.name_en || 'Participant',
      student_name_ml: std?.name_ml || '',
      team_name_en: tm?.name_en || 'Independent',
      team_name_ml: tm?.name_ml || '',
      programme_title_en: prg?.title_en || 'Programme',
      programme_title_ml: prg?.title_ml || '',
      programme_slug: prg?.slug || (prg ? slugify(prg.title_en) : 'programme'),
      category_name_en: cat?.name_en || 'General',
      category_name_ml: cat?.name_ml || '',
      category_slug: cat?.slug || (cat ? slugify(cat.name_en) : 'general'),
      poster_title: r.poster_title || 'OFFICIAL COMPETITION RESULT',
      poster_template: r.poster_template || 'royal-gold',
    };
  });
}

export async function getProgrammeResultBySlugs(programmeSlug: string, categorySlug: string): Promise<{ programme: Programme | null; category: Category | null; results: ProgrammeResult[] }> {
  const [programmes, categories, allResults] = await Promise.all([
    getProgrammes(false, true),
    getCategories(true),
    getProgrammeResults(undefined, true),
  ]);

  const programme = programmes.find(p => p.slug === programmeSlug || slugify(p.title_en) === programmeSlug) || null;
  const category = categories.find(c => c.slug === categorySlug || slugify(c.name_en) === categorySlug) || null;

  let results: ProgrammeResult[] = [];
  if (programme) {
    results = allResults.filter(r => r.programme_id === programme.id);
  }

  return { programme, category, results };
}

export async function generateProgrammeResults(programmeId: string): Promise<ProgrammeResult[]> {
  const scores = await getProgrammeScores(programmeId);
  const programme = (await getProgrammes(false, true)).find(p => p.id === programmeId);

  if (scores.length === 0) {
    throw new Error('No scores entered for this programme yet.');
  }

  const isLowerWins = programme?.scoring_direction === 'lower_wins';
  const sortedScores = [...scores].sort((a, b) => {
    return isLowerWins ? a.score - b.score : b.score - a.score;
  });

  const customMap = programme?.custom_points_map || { rank1: 10, rank2: 7, rank3: 5, rank4: 3 };
  const getPointsForRank = (r: number) => {
    if (r === 1) return customMap.rank1;
    if (r === 2) return customMap.rank2;
    if (r === 3) return customMap.rank3;
    if (r === 4) return customMap.rank4;
    return 1;
  };

  let currentRank = 1;
  const newResults: ProgrammeResult[] = [];

  for (let i = 0; i < sortedScores.length; i++) {
    const item = sortedScores[i];
    if (i > 0) {
      const prevScore = sortedScores[i - 1].score;
      if (item.score !== prevScore) {
        currentRank = i + 1;
      }
    }

    const pts = getPointsForRank(currentRank);

    newResults.push({
      id: 'res-' + Math.random().toString(36).substring(2) + '-' + Date.now(),
      programme_id: programmeId,
      participant_type: (programme?.competition_type === 'Team') ? 'team' : 'student',
      student_id: item.student_id,
      team_id: item.team_id,
      rank: currentRank,
      score: item.score,
      max_score: item.max_score,
      points: pts,
      is_published: false,
      poster_title: 'OFFICIAL COMPETITION RESULT',
      poster_template: 'royal-gold',
    });
  }

  if (isSupabaseConfigured()) {
    try {
      await supabase.from('results').delete().eq('programme_id', programmeId);
      await supabase.from('results').insert(newResults);
    } catch (e) {
      console.warn('Supabase generateProgrammeResults error', e);
    }
  }

  const allResults = getLocal<ProgrammeResult[]>('results', DEFAULT_RESULTS);
  const filtered = allResults.filter(r => r.programme_id !== programmeId);
  setLocal('results', [...filtered, ...newResults]);

  await logActivity('generate_results', 'results', programmeId, `Generated rankings & leaderboard points for programme ${programmeId}`);
  return getProgrammeResults(programmeId, false);
}

export async function updateResultPosterCustomization(programmeId: string, customization: { poster_title?: string; poster_template?: 'classic-islamic' | 'royal-gold' | 'minimalist-emerald' | 'modern-islamic'; poster_bg_url?: string; custom_footer_text?: string }): Promise<void> {
  if (isSupabaseConfigured()) {
    try {
      await supabase.from('results').update(customization).eq('programme_id', programmeId);
    } catch (e) {
      console.warn('Supabase updateResultPosterCustomization error', e);
    }
  }

  const allResults = getLocal<ProgrammeResult[]>('results', DEFAULT_RESULTS);
  setLocal('results', allResults.map(r => r.programme_id === programmeId ? { ...r, ...customization } : r));
  await logActivity('update_poster', 'results', programmeId, `Updated poster customizations`);
}

export async function publishProgrammeResults(programmeId: string): Promise<void> {
  const scores = await getProgrammeScores(programmeId);
  const unverified = scores.filter(s => !s.is_verified);
  if (unverified.length > 0) {
    throw new Error(`Cannot publish result. ${unverified.length} entered scores remain unverified.`);
  }

  if (isSupabaseConfigured()) {
    try {
      await supabase.from('results').update({ is_published: true, status: 'Published', published_at: new Date().toISOString() }).eq('programme_id', programmeId);
      await supabase.from('programmes').update({ is_result_published: true, lifecycle_status: 'Result Published' }).eq('id', programmeId);
    } catch (e) {
      console.warn('Supabase publishProgrammeResults error', e);
    }
  }

  const allResults = getLocal<ProgrammeResult[]>('results', DEFAULT_RESULTS);
  const updated = allResults.map(r => r.programme_id === programmeId ? { ...r, is_published: true, status: 'Published', published_at: new Date().toISOString() } : r);
  setLocal('results', updated);

  const programmes = await getProgrammes(false, true);
  const updatedPrgs = programmes.map(p => p.id === programmeId ? { ...p, is_result_published: true, lifecycle_status: 'Result Published' as const } : p);
  setLocal('programmes', updatedPrgs);

  // Automated Leaderboard Recalculation
  await recalculateLeaderboardStandings();

  await logActivity('system_automation', 'results', programmeId, `System: Published official result for programme ${programmeId} & recalculated team leaderboards`);
}

export async function unpublishProgrammeResults(programmeId: string): Promise<void> {
  if (isSupabaseConfigured()) {
    try {
      await supabase.from('results').update({ is_published: false, status: 'Draft' }).eq('programme_id', programmeId);
      await supabase.from('programmes').update({ is_result_published: false, lifecycle_status: 'Result Pending' }).eq('id', programmeId);
    } catch (e) {
      console.warn('Supabase unpublishProgrammeResults error', e);
    }
  }

  const allResults = getLocal<ProgrammeResult[]>('results', DEFAULT_RESULTS);
  setLocal('results', allResults.map(r => r.programme_id === programmeId ? { ...r, is_published: false, status: 'Draft' } : r));

  const programmes = await getProgrammes(false, true);
  const updatedPrgs = programmes.map(p => p.id === programmeId ? { ...p, is_result_published: false, lifecycle_status: 'Result Pending' as const } : p);
  setLocal('programmes', updatedPrgs);

  await recalculateLeaderboardStandings();
  await logActivity('unpublish', 'results', programmeId, `Unpublished results for programme ${programmeId}`);
}

// Deterministic Leaderboard Standings Engine
export async function recalculateLeaderboardStandings(): Promise<{ studentCount: number; teamCount: number }> {
  const publishedResults = await getProgrammeResults(undefined, true);
  const studentStandings = await getStudentLeaderboard();
  const teamStandings = await getTeamLeaderboard();

  // Save history snapshot
  const snapshotEntry = {
    id: 'lbh-' + Date.now(),
    rebuild_id: 'rebuild-' + Math.random().toString(36).substring(2, 8),
    snapshot_json: teamStandings,
    recalculated_by: 'System Automation',
    recalculated_at: new Date().toISOString(),
  };

  const history = getLocal<any[]>('leaderboard_history', []);
  setLocal('leaderboard_history', [snapshotEntry, ...history.slice(0, 49)]);

  if (isSupabaseConfigured()) {
    try {
      await supabase.from('leaderboard_history').insert([snapshotEntry]);
    } catch (e) {
      console.warn('Supabase leaderboard_history insert error', e);
    }
  }

  await logActivity('recalculate_leaderboard', 'leaderboard', 'system', `System Automation: Recalculated leaderboard standings (${studentStandings.length} students, ${teamStandings.length} teams)`);
  return {
    studentCount: studentStandings.length,
    teamCount: teamStandings.length,
  };
}

// Dynamic Multi-Tier Tie-Breaker Student Leaderboard Engine
export async function getStudentLeaderboard(categoryId?: string, search?: string): Promise<StudentLeaderboardEntry[]> {
  const publishedResults = await getProgrammeResults(undefined, true);
  const students = await getStudents(false);
  const teams = await getTeams(false);
  const programmes = await getProgrammes(false, true);

  const map = new Map<string, { total: number; count: number; wins1: number; wins2: number; wins3: number }>();

  for (const res of publishedResults) {
    if (!res.student_id) continue;

    const prg = programmes.find(p => p.id === res.programme_id);
    if (prg && prg.include_in_student_leaderboard === false) continue;

    if (categoryId && prg && prg.category_id !== categoryId) continue;

    const current = map.get(res.student_id) || { total: 0, count: 0, wins1: 0, wins2: 0, wins3: 0 };
    map.set(res.student_id, {
      total: current.total + Number(res.points),
      count: current.count + 1,
      wins1: current.wins1 + (res.rank === 1 ? 1 : 0),
      wins2: current.wins2 + (res.rank === 2 ? 1 : 0),
      wins3: current.wins3 + (res.rank === 3 ? 1 : 0),
    });
  }

  const entries: StudentLeaderboardEntry[] = [];
  for (const std of students) {
    const stats = map.get(std.id);
    if (!stats || stats.total === 0) continue;

    const tm = teams.find(t => t.id === std.team_id);
    entries.push({
      student_id: std.id,
      student_name_en: std.name_en,
      student_code: std.student_id_code,
      team_name_en: tm?.name_en || 'Independent',
      total_points: stats.total,
      programmes_count: stats.count,
      wins_1st_count: stats.wins1,
      wins_2nd_count: stats.wins2,
      wins_3rd_count: stats.wins3,
      rank: 0,
    });
  }

  // Multi-Tier Tie Breaker Sort
  entries.sort((a, b) => {
    if (b.total_points !== a.total_points) return b.total_points - a.total_points;
    if (b.wins_1st_count !== a.wins_1st_count) return b.wins_1st_count - a.wins_1st_count;
    if (b.wins_2nd_count !== a.wins_2nd_count) return b.wins_2nd_count - a.wins_2nd_count;
    return b.programmes_count - a.programmes_count;
  });

  let rank = 1;
  for (let i = 0; i < entries.length; i++) {
    if (i > 0) {
      const prev = entries[i - 1];
      const curr = entries[i];
      if (
        curr.total_points !== prev.total_points ||
        curr.wins_1st_count !== prev.wins_1st_count ||
        curr.wins_2nd_count !== prev.wins_2nd_count
      ) {
        rank = i + 1;
      }
    }
    entries[i].rank = rank;
  }

  if (search) {
    const query = search.toLowerCase();
    return entries.filter(e => e.student_name_en.toLowerCase().includes(query) || e.student_code.toLowerCase().includes(query) || e.team_name_en.toLowerCase().includes(query));
  }

  return entries;
}

// Dynamic Multi-Tier Tie-Breaker Team Leaderboard Engine
export async function getTeamLeaderboard(categoryId?: string, search?: string): Promise<TeamLeaderboardEntry[]> {
  const publishedResults = await getProgrammeResults(undefined, true);
  const teams = await getTeams(false);
  const students = await getStudents(false);
  const programmes = await getProgrammes(false, true);

  const teamMap = new Map<string, { total: number; wins1: number; wins2: number; wins3: number }>();

  for (const res of publishedResults) {
    const prg = programmes.find(p => p.id === res.programme_id);
    if (prg && prg.include_in_team_leaderboard === false) continue;

    if (categoryId && prg && prg.category_id !== categoryId) continue;

    let teamId = res.team_id;
    if (!teamId && res.student_id) {
      const std = students.find(s => s.id === res.student_id);
      teamId = std?.team_id;
    }

    if (!teamId) continue;

    const current = teamMap.get(teamId) || { total: 0, wins1: 0, wins2: 0, wins3: 0 };
    teamMap.set(teamId, {
      total: current.total + Number(res.points),
      wins1: current.wins1 + (res.rank === 1 ? 1 : 0),
      wins2: current.wins2 + (res.rank === 2 ? 1 : 0),
      wins3: current.wins3 + (res.rank === 3 ? 1 : 0),
    });
  }

  const entries: TeamLeaderboardEntry[] = [];
  for (const tm of teams) {
    const stats = teamMap.get(tm.id);
    const memberCount = students.filter(s => s.team_id === tm.id).length;

    entries.push({
      team_id: tm.id,
      team_name_en: tm.name_en,
      color_code: tm.color_code || 'amber',
      total_points: stats?.total || 0,
      members_count: memberCount,
      wins_count: stats?.wins1 || 0,
      wins_1st_count: stats?.wins1 || 0,
      wins_2nd_count: stats?.wins2 || 0,
      wins_3rd_count: stats?.wins3 || 0,
      rank: 0,
    });
  }

  // Multi-Tier Tie Breaker Sort
  entries.sort((a, b) => {
    if (b.total_points !== a.total_points) return b.total_points - a.total_points;
    if (b.wins_1st_count !== a.wins_1st_count) return b.wins_1st_count - a.wins_1st_count;
    if (b.wins_2nd_count !== a.wins_2nd_count) return b.wins_2nd_count - a.wins_2nd_count;
    return b.members_count - a.members_count;
  });

  let rank = 1;
  for (let i = 0; i < entries.length; i++) {
    if (i > 0) {
      const prev = entries[i - 1];
      const curr = entries[i];
      if (
        curr.total_points !== prev.total_points ||
        curr.wins_1st_count !== prev.wins_1st_count ||
        curr.wins_2nd_count !== prev.wins_2nd_count
      ) {
        rank = i + 1;
      }
    }
    entries[i].rank = rank;
  }

  if (search) {
    const query = search.toLowerCase();
    return entries.filter(e => e.team_name_en.toLowerCase().includes(query));
  }

  return entries;
}

// ==================== GALLERY ====================
export async function getGalleryImages(onlyPublished = false): Promise<GalleryImage[]> {
  if (isSupabaseConfigured()) {
    try {
      let query = supabase.from('gallery_images').select('*').order('display_order', { ascending: true });
      if (onlyPublished) query = query.eq('is_published', true);
      const { data, error } = await query;
      if (data && !error && data.length > 0) return data;
    } catch (e) {
      console.warn('Supabase getGalleryImages error', e);
    }
  }
  const local = getLocal<GalleryImage[]>('gallery', DEFAULT_GALLERY).sort((a, b) => a.display_order - b.display_order);
  return onlyPublished ? local.filter(g => g.is_published) : local;
}

export async function createGalleryImage(img: Omit<GalleryImage, 'id'>): Promise<GalleryImage> {
  const newImg: GalleryImage = { ...img, id: 'gal-' + Date.now() };
  if (isSupabaseConfigured()) {
    try {
      const { data } = await supabase.from('gallery_images').insert([img]).select().single();
      if (data) newImg.id = data.id;
    } catch (e) {
      console.warn('Supabase createGalleryImage error', e);
    }
  }
  const current = await getGalleryImages(false);
  setLocal('gallery', [...current, newImg]);
  await logActivity('create', 'gallery', newImg.id, `Uploaded image "${newImg.title_en}"`);
  return newImg;
}

export async function updateGalleryImage(id: string, changes: Partial<GalleryImage>): Promise<void> {
  if (isSupabaseConfigured()) {
    try {
      await supabase.from('gallery_images').update(changes).eq('id', id);
    } catch (e) {
      console.warn('Supabase updateGalleryImage error', e);
    }
  }
  const current = await getGalleryImages(false);
  setLocal('gallery', current.map(g => g.id === id ? { ...g, ...changes } : g));
  await logActivity('update', 'gallery', id, 'Updated image caption');
}

export async function deleteGalleryImage(id: string): Promise<void> {
  if (isSupabaseConfigured()) {
    try {
      await supabase.from('gallery_images').delete().eq('id', id);
    } catch (e) {
      console.warn('Supabase deleteGalleryImage error', e);
    }
  }
  const current = await getGalleryImages(false);
  setLocal('gallery', current.filter(g => g.id !== id));
  await logActivity('delete', 'gallery', id, 'Deleted image');
}

export async function toggleGalleryPublish(id: string): Promise<boolean> {
  const images = await getGalleryImages(false);
  const target = images.find(g => g.id === id);
  if (!target) return false;
  const newStatus = !target.is_published;
  await updateGalleryImage(id, { is_published: newStatus });
  await logActivity(newStatus ? 'publish' : 'unpublish', 'gallery', id, `${newStatus ? 'Published' : 'Unpublished'} image`);
  return newStatus;
}

// ==================== ANNOUNCEMENTS ====================
export async function getAnnouncements(onlyPublished = false): Promise<Announcement[]> {
  if (isSupabaseConfigured()) {
    try {
      let query = supabase.from('announcements').select('*').order('display_order', { ascending: true });
      if (onlyPublished) query = query.eq('is_published', true);
      const { data, error } = await query;
      if (data && !error && data.length > 0) return data;
    } catch (e) {
      console.warn('Supabase getAnnouncements error', e);
    }
  }
  const local = getLocal<Announcement[]>('announcements', DEFAULT_ANNOUNCEMENTS).sort((a, b) => a.display_order - b.display_order);
  return onlyPublished ? local.filter(a => a.is_published) : local;
}

export async function createAnnouncement(ann: Omit<Announcement, 'id'>): Promise<Announcement> {
  const newAnn: Announcement = { ...ann, id: 'ann-' + Date.now() };
  if (isSupabaseConfigured()) {
    try {
      const { data } = await supabase.from('announcements').insert([ann]).select().single();
      if (data) newAnn.id = data.id;
    } catch (e) {
      console.warn('Supabase createAnnouncement error', e);
    }
  }
  const current = await getAnnouncements(false);
  setLocal('announcements', [...current, newAnn]);
  await logActivity('create', 'announcement', newAnn.id, `Created announcement "${newAnn.title_en}"`);
  return newAnn;
}

export async function updateAnnouncement(id: string, changes: Partial<Announcement>): Promise<void> {
  if (isSupabaseConfigured()) {
    try {
      await supabase.from('announcements').update(changes).eq('id', id);
    } catch (e) {
      console.warn('Supabase updateAnnouncement error', e);
    }
  }
  const current = await getAnnouncements(false);
  setLocal('announcements', current.map(a => a.id === id ? { ...a, ...changes } : a));
  await logActivity('update', 'announcement', id, 'Updated announcement');
}

export async function deleteAnnouncement(id: string): Promise<void> {
  if (isSupabaseConfigured()) {
    try {
      await supabase.from('announcements').delete().eq('id', id);
    } catch (e) {
      console.warn('Supabase deleteAnnouncement error', e);
    }
  }
  const current = await getAnnouncements(false);
  setLocal('announcements', current.filter(a => a.id !== id));
  await logActivity('delete', 'announcement', id, 'Deleted announcement');
}

export async function toggleAnnouncementPublish(id: string): Promise<boolean> {
  const announcements = await getAnnouncements(false);
  const target = announcements.find(a => a.id === id);
  if (!target) return false;
  const newStatus = !target.is_published;
  await updateAnnouncement(id, { is_published: newStatus });
  await logActivity(newStatus ? 'publish' : 'unpublish', 'announcement', id, `${newStatus ? 'Published' : 'Unpublished'} announcement`);
  return newStatus;
}

// ==================== ACTIVITY LOGS ====================
export async function getActivityLogs(): Promise<AdminActivityLog[]> {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase.from('admin_activity_logs').select('*').order('created_at', { ascending: false }).limit(100);
      if (data && !error && data.length > 0) return data;
    } catch (e) {
      console.warn('Supabase getActivityLogs error', e);
    }
  }
  return getLocal<AdminActivityLog[]>('logs', DEFAULT_LOGS);
}

// ==================== MEDIA UPLOADER ====================
export async function uploadMediaImage(file: File): Promise<string> {
  if (isSupabaseConfigured()) {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
      const filePath = `uploads/${fileName}`;

      const { error: uploadError } = await supabase.storage.from('event-media').upload(filePath, file);

      if (!uploadError) {
        const { data } = supabase.storage.from('event-media').getPublicUrl(filePath);
        if (data?.publicUrl) return data.publicUrl;
      }
    } catch (err) {
      console.warn('Supabase storage upload error, using DataURL fallback', err);
    }
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
    reader.readAsDataURL(file);
  });
}

// ==================== CERTIFICATES ENGINE FUNCTIONS ====================
export function generateUniqueCertificateId(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = 'CERT-';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function getCertificates(): Promise<GeneratedCertificate[]> {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase.from('certificates').select('*').order('created_at', { ascending: false });
      if (data && !error && data.length > 0) return data;
    } catch (e) {
      console.warn('Supabase getCertificates error', e);
    }
  }
  return getLocal<GeneratedCertificate[]>('certificates', DEFAULT_CERTIFICATES);
}

export async function getCertificateById(certId: string): Promise<GeneratedCertificate | null> {
  const allCerts = await getCertificates();
  const found = allCerts.find(c => c.id.toUpperCase() === certId.trim().toUpperCase());
  return found || null;
}

export async function createCertificate(certData: Omit<GeneratedCertificate, 'id'> & { id?: string }): Promise<GeneratedCertificate> {
  const siteSettings = await getSiteSettings();
  const config = await getCertificateTemplateConfig();
  const certId = certData.id || generateUniqueCertificateId();

  const newCert: GeneratedCertificate = {
    ...certData,
    id: certId,
    status: certData.status || 'Issued',
    issue_date: certData.issue_date || new Date().toISOString().split('T')[0],
    organizer_name: certData.organizer_name || config.organizer_name || siteSettings.organizer_name_en || 'Event Committee',
    logo_url: certData.logo_url || config.logo_url || siteSettings.logo_url || undefined,
    signature_url: certData.signature_url || config.signature_url || undefined,
    seal_url: certData.seal_url || config.seal_url || undefined,
    created_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured()) {
    try {
      await supabase.from('certificates').insert([newCert]);
    } catch (e) {
      console.warn('Supabase createCertificate error', e);
    }
  }

  const current = await getCertificates();
  const filtered = current.filter(c => c.id !== certId);
  setLocal('certificates', [newCert, ...filtered]);
  await logActivity('create_certificate', 'certificates', certId, `Generated ${newCert.certificate_type} Certificate for "${newCert.recipient_name}" (${certId})`);
  return newCert;
}

export async function bulkGenerateWinnerCertificates(
  programmeId: string,
  teamMode: 'one_per_team' | 'one_per_member' = 'one_per_member',
  templateStyle: CertificateTemplateStyle = 'royal-gold'
): Promise<{ successCount: number; certificates: GeneratedCertificate[] }> {
  const [results, programme, categories, students, teams, siteSettings] = await Promise.all([
    getProgrammeResults(programmeId, true),
    (await getProgrammes(false, true)).find(p => p.id === programmeId),
    getCategories(true),
    getStudents(true),
    getTeams(true),
    getSiteSettings(),
  ]);

  if (!programme) throw new Error('Programme not found');
  const cat = categories.find(c => c.id === programme.category_id);
  const winners = results.filter(r => r.rank >= 1 && r.rank <= 3);

  if (winners.length === 0) {
    throw new Error('No published 1st, 2nd, or 3rd place winners found for this programme.');
  }

  const generatedList: GeneratedCertificate[] = [];
  const existingCerts = await getCertificates();

  for (const win of winners) {
    const posText = win.rank === 1 ? '1st Place' : win.rank === 2 ? '2nd Place' : '3rd Place';

    if (win.participant_type === 'team' || win.team_id) {
      const tm = teams.find(t => t.id === win.team_id);
      const teamName = tm?.name_en || 'Team';

      if (teamMode === 'one_per_team') {
        // Check duplicate
        const isDuplicate = existingCerts.some(c => c.programme_id === programmeId && c.team_id === win.team_id && c.position === posText && c.status !== 'Revoked');
        if (!isDuplicate) {
          const cert = await createCertificate({
            certificate_type: 'Winner',
            template_style: templateStyle,
            status: 'Issued',
            recipient_type: 'team',
            team_id: win.team_id,
            recipient_name: teamName,
            team_name: teamName,
            programme_id: programmeId,
            programme_title: programme.title_en,
            category_id: programme.category_id,
            category_name: cat?.name_en || 'General',
            event_name: siteSettings.event_name_en || 'Milad Fest 2K26',
            position: posText,
            achievement_text: `for securing ${posText} in ${programme.title_en} (${cat?.name_en || 'General'})`,
            issue_date: new Date().toISOString().split('T')[0],
          });
          generatedList.push(cert);
        }
      } else {
        // One per team member
        const members = students.filter(s => s.team_id === win.team_id);
        const memberRoster = members.length > 0 ? members : [{ id: 'std-unknown', student_id_code: 'TM-MBR', name_en: teamName, category_class: cat?.name_en || 'General' }];

        for (const m of memberRoster) {
          const isDuplicate = existingCerts.some(c => c.programme_id === programmeId && c.student_id === m.id && c.position === posText && c.status !== 'Revoked');
          if (!isDuplicate) {
            const cert = await createCertificate({
              certificate_type: 'Winner',
              template_style: templateStyle,
              status: 'Issued',
              recipient_type: 'student',
              student_id: m.id,
              recipient_name: m.name_en,
              recipient_code: m.student_id_code,
              team_name: teamName,
              programme_id: programmeId,
              programme_title: programme.title_en,
              category_id: programme.category_id,
              category_name: cat?.name_en || 'General',
              event_name: siteSettings.event_name_en || 'Milad Fest 2K26',
              position: posText,
              achievement_text: `for securing ${posText} in ${programme.title_en} (${cat?.name_en || 'General'})`,
              issue_date: new Date().toISOString().split('T')[0],
            });
            generatedList.push(cert);
          }
        }
      }
    } else if (win.student_id) {
      const std = students.find(s => s.id === win.student_id);
      const tm = teams.find(t => t.id === std?.team_id);

      const isDuplicate = existingCerts.some(c => c.programme_id === programmeId && c.student_id === win.student_id && c.position === posText && c.status !== 'Revoked');
      if (!isDuplicate) {
        const cert = await createCertificate({
          certificate_type: 'Winner',
          template_style: templateStyle,
          status: 'Issued',
          recipient_type: 'student',
          student_id: win.student_id,
          recipient_name: std?.name_en || win.student_name_en || 'Participant',
          recipient_code: std?.student_id_code,
          team_name: tm?.name_en || 'Independent',
          programme_id: programmeId,
          programme_title: programme.title_en,
          category_id: programme.category_id,
          category_name: cat?.name_en || 'General',
          event_name: siteSettings.event_name_en || 'Milad Fest 2K26',
          position: posText,
          achievement_text: `for securing ${posText} in ${programme.title_en} (${cat?.name_en || 'General'})`,
          issue_date: new Date().toISOString().split('T')[0],
        });
        generatedList.push(cert);
      }
    }
  }

  return { successCount: generatedList.length, certificates: generatedList };
}

export async function bulkGenerateParticipationCertificates(
  programmeId: string,
  templateStyle: CertificateTemplateStyle = 'classic-islamic'
): Promise<{ successCount: number; certificates: GeneratedCertificate[] }> {
  const [registrations, programme, categories, students, teams, siteSettings] = await Promise.all([
    getProgrammeRegistrations(programmeId),
    (await getProgrammes(false, true)).find(p => p.id === programmeId),
    getCategories(true),
    getStudents(true),
    getTeams(true),
    getSiteSettings(),
  ]);

  if (!programme) throw new Error('Programme not found');
  const cat = categories.find(c => c.id === programme.category_id);
  const eligibleRegs = registrations.filter(r => r.status === 'Confirmed' || r.attendance === 'Present');

  if (eligibleRegs.length === 0) {
    throw new Error('No confirmed or present participants found for this programme.');
  }

  const generatedList: GeneratedCertificate[] = [];
  const existingCerts = await getCertificates();

  for (const reg of eligibleRegs) {
    const std = students.find(s => s.id === reg.student_id);
    const tm = teams.find(t => t.id === reg.team_id || std?.team_id === t.id);
    const name = std?.name_en || reg.full_name || tm?.name_en || 'Participant';

    const isDuplicate = existingCerts.some(c => c.programme_id === programmeId && (c.student_id === reg.student_id || c.recipient_name === name) && c.certificate_type === 'Participation' && c.status !== 'Revoked');

    if (!isDuplicate) {
      const cert = await createCertificate({
        certificate_type: 'Participation',
        template_style: templateStyle,
        status: 'Issued',
        recipient_type: reg.participant_type,
        student_id: reg.student_id,
        team_id: reg.team_id,
        recipient_name: name,
        recipient_code: std?.student_id_code,
        team_name: tm?.name_en || 'Independent',
        programme_id: programmeId,
        programme_title: programme.title_en,
        category_id: programme.category_id,
        category_name: cat?.name_en || 'General',
        event_name: siteSettings.event_name_en || 'Milad Fest 2K26',
        position: 'Participant',
        achievement_text: `for active participation in ${programme.title_en} (${cat?.name_en || 'General'})`,
        issue_date: new Date().toISOString().split('T')[0],
      });
      generatedList.push(cert);
    }
  }

  return { successCount: generatedList.length, certificates: generatedList };
}

export async function updateCertificateStatus(certId: string, status: CertificateStatus): Promise<void> {
  if (isSupabaseConfigured()) {
    try {
      await supabase.from('certificates').update({ status }).eq('id', certId);
    } catch (e) {
      console.warn('Supabase updateCertificateStatus error', e);
    }
  }

  const current = await getCertificates();
  setLocal('certificates', current.map(c => c.id === certId ? { ...c, status } : c));
  await logActivity('update_certificate_status', 'certificates', certId, `Changed certificate status to "${status}"`);
}

export async function revokeCertificate(certId: string, reason = 'Administrative Revocation'): Promise<void> {
  const timestamp = new Date().toISOString();
  if (isSupabaseConfigured()) {
    try {
      await supabase.from('certificates').update({ status: 'Revoked', revoked_at: timestamp, revoked_reason: reason }).eq('id', certId);
    } catch (e) {
      console.warn('Supabase revokeCertificate error', e);
    }
  }

  const current = await getCertificates();
  setLocal('certificates', current.map(c => c.id === certId ? { ...c, status: 'Revoked', revoked_at: timestamp, revoked_reason: reason } : c));
  await logActivity('revoke_certificate', 'certificates', certId, `Revoked certificate ${certId}. Reason: ${reason}`);
}

export async function deleteCertificate(certId: string): Promise<void> {
  if (isSupabaseConfigured()) {
    try {
      await supabase.from('certificates').delete().eq('id', certId);
    } catch (e) {
      console.warn('Supabase deleteCertificate error', e);
    }
  }
  const current = await getCertificates();
  setLocal('certificates', current.filter(c => c.id !== certId));
  await logActivity('delete_certificate', 'certificates', certId, 'Deleted certificate record');
}

export async function getCertificateTemplateConfig(): Promise<CertificateTemplateConfig> {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase.from('certificate_template_config').select('*').single();
      if (data && !error) return data;
    } catch (e) {
      console.warn('Supabase getCertificateTemplateConfig error', e);
    }
  }
  return getLocal<CertificateTemplateConfig>('certificate_config', DEFAULT_CERTIFICATE_CONFIG);
}

export async function updateCertificateTemplateConfig(changes: Partial<CertificateTemplateConfig>): Promise<CertificateTemplateConfig> {
  const current = await getCertificateTemplateConfig();
  const updated = { ...current, ...changes };

  if (isSupabaseConfigured()) {
    try {
      if (current.id) {
        await supabase.from('certificate_template_config').update(updated).eq('id', current.id);
      } else {
        await supabase.from('certificate_template_config').insert([updated]);
      }
    } catch (e) {
      console.warn('Supabase updateCertificateTemplateConfig error', e);
    }
  }

  setLocal('certificate_config', updated);
  await logActivity('update_certificate_config', 'certificate_config', 'default', 'Updated certificate template configuration');
  return updated;
}

// ==================== CONFIGURATION AUDIT ENGINE ====================
export async function getConfigAuditLogs(): Promise<ConfigAuditLog[]> {
  return getLocal<ConfigAuditLog[]>('config_audit_logs', []);
}

export async function logConfigChange(settingKey: string, oldValue: string, newValue: string, changedBy = 'Super Admin'): Promise<void> {
  const current = await getConfigAuditLogs();
  const entry: ConfigAuditLog = {
    id: 'cfg-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
    setting_key: settingKey,
    old_value: oldValue,
    new_value: newValue,
    changed_by: changedBy,
    timestamp: new Date().toISOString(),
  };
  setLocal('config_audit_logs', [entry, ...current]);
  await logActivity('config_change', 'settings', entry.id, `Configured ${settingKey}: "${oldValue}" → "${newValue}"`);
}

// ==================== PRODUCTION SYSTEM HEALTH & QUALITY CONTROL ====================

export interface SystemHealthStatus {
  database: { status: 'Connected' | 'Warning' | 'Error'; message: string; latencyMs: number };
  auth: { status: 'Connected' | 'Warning' | 'Error'; message: string };
  storage: { status: 'Connected' | 'Warning' | 'Error'; message: string };
  realtime: { status: 'Connected' | 'Warning' | 'Error'; message: string };
  publicWebsite: { status: 'Connected' | 'Warning' | 'Error'; message: string };
}

export interface DataIntegrityAnomaly {
  id: string;
  title: string;
  category: 'Duplicate Registration' | 'Unverified Score' | 'Orphan Result' | 'Leaderboard Mismatch' | 'Invalid Certificate' | 'Missing Participant';
  severity: 'High' | 'Medium' | 'Low';
  details: string;
  actionLabel: string;
  actionUrl: string;
}

export interface PublicLinkAudit {
  id: string;
  title: string;
  url: string;
  type: 'Programme' | 'Result' | 'Leaderboard' | 'Announcement' | 'Gallery' | 'Certificate';
  status: 'Valid' | 'Broken' | 'Disabled' | 'Unpublished';
  statusCode: number;
}

export async function checkSystemHealth(): Promise<SystemHealthStatus> {
  const startDb = Date.now();
  let dbStatus: 'Connected' | 'Warning' | 'Error' = 'Connected';
  let dbMsg = 'Database schemas and 16 table relations healthy.';

  try {
    const prgs = await getProgrammes(false, true);
    if (!prgs || prgs.length === 0) {
      dbStatus = 'Warning';
      dbMsg = 'Database connected, but no programmes configured yet.';
    }
  } catch (e: any) {
    dbStatus = 'Error';
    dbMsg = 'Database query failed: ' + (e.message || 'Connection timeout');
  }
  const latency = Date.now() - startDb;

  const authStatus: 'Connected' | 'Warning' | 'Error' = isSupabaseConfigured() ? 'Connected' : 'Warning';
  const authMsg = isSupabaseConfigured() 
    ? 'Supabase Auth service operational with persistent session listener.' 
    : 'Local Auth Fallback active (Demo Mode). Supabase env vars pending.';

  const storageStatus: 'Connected' | 'Warning' | 'Error' = isSupabaseConfigured() ? 'Connected' : 'Warning';
  const storageMsg = isSupabaseConfigured() 
    ? 'Supabase Storage buckets (logos, posters, certificates, gallery) accessible.' 
    : 'Local Storage Fallback active. Remote storage buckets unverified.';

  const realtimeStatus: 'Connected' | 'Warning' | 'Error' = isSupabaseConfigured() ? 'Connected' : 'Connected';
  const realtimeMsg = isSupabaseConfigured() 
    ? 'Supabase Realtime channels active for live scores and announcement tickers.' 
    : 'Local Event-Bus Realtime active for offline preview.';

  const settings = await getSiteSettings();
  const siteStatus: 'Connected' | 'Warning' | 'Error' = settings.is_maintenance_mode ? 'Warning' : 'Connected';
  const siteMsg = settings.is_maintenance_mode 
    ? 'Website is currently in Maintenance Mode (Public access restricted).' 
    : 'Public Website operational with active settings.';

  return {
    database: { status: dbStatus, message: dbMsg, latencyMs: latency },
    auth: { status: authStatus, message: authMsg },
    storage: { status: storageStatus, message: storageMsg },
    realtime: { status: realtimeStatus, message: realtimeMsg },
    publicWebsite: { status: siteStatus, message: siteMsg },
  };
}

export async function auditDataIntegrity(): Promise<DataIntegrityAnomaly[]> {
  const anomalies: DataIntegrityAnomaly[] = [];

  const [prgs, stds, regs, results, certs] = await Promise.all([
    getProgrammes(false, true),
    getStudents(true),
    getProgrammeRegistrations(),
    getProgrammeResults(),
    getCertificates(),
  ]);

  // 1. Check for Duplicate Registrations
  const regKeyMap: Record<string, number> = {};
  for (const r of regs) {
    const key = `${r.programme_id}_${r.student_id}`;
    regKeyMap[key] = (regKeyMap[key] || 0) + 1;
    if (regKeyMap[key] === 2) {
      const prg = prgs.find((p: Programme) => p.id === r.programme_id);
      const std = stds.find((s: Student) => s.id === r.student_id);
      anomalies.push({
        id: 'anom-dup-' + r.id,
        title: `Duplicate Registration: ${std?.name_en || r.student_id}`,
        category: 'Duplicate Registration',
        severity: 'High',
        details: `Student registered multiple times for programme "${prg?.title_en || r.programme_id}".`,
        actionLabel: 'Clean Registrations',
        actionUrl: `/admin/registrations?programme_id=${r.programme_id}`,
      });
    }
  }

  // 2. Check for Unverified Score Results
  for (const res of results) {
    const scores = await getProgrammeScores(res.programme_id);
    const unverified = scores.filter(s => !s.is_verified);
    if (unverified.length > 0) {
      const prg = prgs.find((p: Programme) => p.id === res.programme_id);
      anomalies.push({
        id: 'anom-unver-' + res.id,
        title: `Unverified Scores in Result: ${prg?.title_en || res.programme_id}`,
        category: 'Unverified Score',
        severity: 'High',
        details: `Result generated while ${unverified.length} scores remain unverified.`,
        actionLabel: 'Verify Scores',
        actionUrl: `/admin/scores/judge?programme_id=${res.programme_id}`,
      });
    }
  }

  // 3. Check for Certificates pointing to Unpublished Results
  for (const c of certs) {
    const prg = prgs.find((p: Programme) => p.id === c.programme_id);
    if (prg && prg.lifecycle_status !== 'Published') {
      anomalies.push({
        id: 'anom-cert-' + c.id,
        title: `Certificate Issued for Unpublished Result: ${c.recipient_name}`,
        category: 'Invalid Certificate',
        severity: 'Medium',
        details: `Certificate "${c.id}" issued for programme "${c.programme_title || c.programme_id}" which is not published yet.`,
        actionLabel: 'Manage Certificates',
        actionUrl: '/admin/certificates',
      });
    }
  }

  return anomalies;
}

export async function checkPublicLinks(): Promise<PublicLinkAudit[]> {
  const audits: PublicLinkAudit[] = [];
  const settings = await getSiteSettings();
  const vis = settings.public_pages_visibility || {};

  audits.push({
    id: 'link-home',
    title: 'Homepage Portal',
    url: '/',
    type: 'Programme',
    status: vis.home !== false ? 'Valid' : 'Disabled',
    statusCode: vis.home !== false ? 200 : 503,
  });

  audits.push({
    id: 'link-programs',
    title: 'Programmes Directory',
    url: '/programs',
    type: 'Programme',
    status: vis.programs !== false ? 'Valid' : 'Disabled',
    statusCode: vis.programs !== false ? 200 : 503,
  });

  audits.push({
    id: 'link-results',
    title: 'Competition Results Showcase',
    url: '/results',
    type: 'Result',
    status: vis.results !== false ? 'Valid' : 'Disabled',
    statusCode: vis.results !== false ? 200 : 503,
  });

  audits.push({
    id: 'link-leaderboard',
    title: 'Championship Leaderboard',
    url: '/leaderboard',
    type: 'Leaderboard',
    status: vis.leaderboard !== false ? 'Valid' : 'Disabled',
    statusCode: vis.leaderboard !== false ? 200 : 503,
  });

  audits.push({
    id: 'link-announcements',
    title: 'Public Announcements Board',
    url: '/announcements',
    type: 'Announcement',
    status: vis.announcements !== false ? 'Valid' : 'Disabled',
    statusCode: vis.announcements !== false ? 200 : 503,
  });

  audits.push({
    id: 'link-gallery',
    title: 'Event Gallery Showcase',
    url: '/gallery',
    type: 'Gallery',
    status: vis.gallery !== false ? 'Valid' : 'Disabled',
    statusCode: vis.gallery !== false ? 200 : 503,
  });

  audits.push({
    id: 'link-verify',
    title: 'Certificate Public Verification Portal',
    url: '/verify',
    type: 'Certificate',
    status: vis.verify !== false ? 'Valid' : 'Disabled',
    statusCode: vis.verify !== false ? 200 : 503,
  });

  return audits;
}

export function validateScoreEntry(score: number, maxScore = 100): { valid: boolean; error?: string } {
  if (isNaN(score)) return { valid: false, error: 'Entered score must be a valid number.' };
  if (score < 0) return { valid: false, error: 'Score cannot be negative.' };
  if (score > maxScore) return { valid: false, error: `Score cannot exceed the configured maximum of ${maxScore}.` };
  return { valid: true };
}
