import { supabase, isSupabaseConfigured } from './supabaseClient';

export interface DbProgramme {
  id: string;
  title_en: string;
  title_ml?: string;
  title_ar?: string;
  description_en?: string;
  description_ml?: string;
  description_ar?: string;
  event_date: string;
  start_time: string;
  end_time?: string;
  venue: string;
  speaker?: string;
  category: string;
  image_url?: string;
  is_published: boolean;
  display_order: number;
  created_at?: string;
  updated_at?: string;
}

// In-memory fallback data store for offline preview mode
let mockProgrammesStore: DbProgramme[] = [];

/**
 * Fetch ONLY published programmes for the public website
 */
export async function fetchPublicProgrammes(): Promise<DbProgramme[]> {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('programmes')
        .select('*')
        .eq('is_published', true)
        .order('display_order', { ascending: true })
        .order('event_date', { ascending: true })
        .order('start_time', { ascending: true });

      if (!error && data) {
        return data as DbProgramme[];
      }
    } catch (err) {
      console.warn('Supabase fetch failed, falling back to local store:', err);
    }
  }

  // Fallback to local store for published items
  return mockProgrammesStore
    .filter((p) => p.is_published)
    .sort((a, b) => a.display_order - b.display_order);
}

/**
 * Fetch ALL programmes (published + draft) for the Admin Dashboard
 */
export async function fetchAllProgrammesAdmin(): Promise<DbProgramme[]> {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('programmes')
        .select('*')
        .order('display_order', { ascending: true })
        .order('event_date', { ascending: true });

      if (!error && data) {
        return data as DbProgramme[];
      }
    } catch (err) {
      console.warn('Supabase fetch failed, falling back to local store:', err);
    }
  }

  return [...mockProgrammesStore].sort((a, b) => a.display_order - b.display_order);
}

/**
 * Create a new programme
 */
export async function createProgramme(programmeData: Partial<DbProgramme>): Promise<DbProgramme> {
  const newProgramme: DbProgramme = {
    id: typeof crypto !== 'undefined' ? crypto.randomUUID() : `prg-${Date.now()}`,
    title_en: programmeData.title_en || 'New Programme',
    title_ml: programmeData.title_ml || '',
    title_ar: programmeData.title_ar || '',
    description_en: programmeData.description_en || '',
    description_ml: programmeData.description_ml || '',
    description_ar: programmeData.description_ar || '',
    event_date: programmeData.event_date || '2026-08-29',
    start_time: programmeData.start_time || '09:00 AM',
    end_time: programmeData.end_time || '',
    venue: programmeData.venue || 'Al Ihsan Sunni Madrassa, Karingari',
    speaker: programmeData.speaker || '',
    category: programmeData.category || 'General',
    image_url: programmeData.image_url || '',
    is_published: programmeData.is_published ?? false,
    display_order: programmeData.display_order ?? mockProgrammesStore.length + 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('programmes')
        .insert([{
          title_en: newProgramme.title_en,
          title_ml: newProgramme.title_ml,
          title_ar: newProgramme.title_ar,
          description_en: newProgramme.description_en,
          description_ml: newProgramme.description_ml,
          description_ar: newProgramme.description_ar,
          event_date: newProgramme.event_date,
          start_time: newProgramme.start_time,
          end_time: newProgramme.end_time,
          venue: newProgramme.venue,
          speaker: newProgramme.speaker,
          category: newProgramme.category,
          image_url: newProgramme.image_url,
          is_published: newProgramme.is_published,
          display_order: newProgramme.display_order,
        }])
        .select();

      if (!error && data && data.length > 0) {
        return data[0] as DbProgramme;
      }
    } catch (err) {
      console.warn('Supabase insert failed, using fallback:', err);
    }
  }

  mockProgrammesStore.push(newProgramme);
  return newProgramme;
}

/**
 * Update an existing programme
 */
export async function updateProgramme(id: string, programmeData: Partial<DbProgramme>): Promise<DbProgramme | null> {
  const updatedFields = {
    ...programmeData,
    updated_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('programmes')
        .update(updatedFields)
        .eq('id', id)
        .select();

      if (!error && data && data.length > 0) {
        return data[0] as DbProgramme;
      }
    } catch (err) {
      console.warn('Supabase update failed:', err);
    }
  }

  const idx = mockProgrammesStore.findIndex((p) => p.id === id);
  if (idx !== -1) {
    mockProgrammesStore[idx] = { ...mockProgrammesStore[idx], ...updatedFields };
    return mockProgrammesStore[idx];
  }

  return null;
}

/**
 * Delete a programme
 */
export async function deleteProgramme(id: string): Promise<boolean> {
  if (isSupabaseConfigured()) {
    try {
      const { error } = await supabase
        .from('programmes')
        .delete()
        .eq('id', id);

      if (!error) {
        return true;
      }
    } catch (err) {
      console.warn('Supabase delete failed:', err);
    }
  }

  mockProgrammesStore = mockProgrammesStore.filter((p) => p.id !== id);
  return true;
}

/**
 * Toggle Publish / Unpublish status
 */
export async function togglePublishStatus(id: string, isPublished: boolean): Promise<DbProgramme | null> {
  return updateProgramme(id, { is_published: isPublished });
}

/**
 * Duplicate a programme
 */
export async function duplicateProgramme(id: string): Promise<DbProgramme | null> {
  const all = await fetchAllProgrammesAdmin();
  const target = all.find((p) => p.id === id);
  if (!target) return null;

  return createProgramme({
    ...target,
    title_en: `${target.title_en} (Copy)`,
    title_ml: target.title_ml ? `${target.title_ml} (കോപ്പി)` : '',
    is_published: false, // Copies default to draft
    display_order: target.display_order + 1,
  });
}
