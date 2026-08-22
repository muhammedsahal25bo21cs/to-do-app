import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import fs from 'fs';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'src', 'data', 'published_cms_data.json');

function readStoredData() {
  try {
    if (fs.existsSync(dataFilePath)) {
      const content = fs.readFileSync(dataFilePath, 'utf8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.error('Error reading published_cms_data.json:', err);
  }
  return null;
}

function writeStoredData(data: any) {
  try {
    const dir = path.dirname(dataFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Error writing published_cms_data.json:', err);
    return false;
  }
}

async function syncToSupabase(payload: any) {
  const eventId = 'evt-2k26';

  // 0. Ensure Event Record
  try {
    await supabase.from('events').upsert([{
      id: eventId,
      title_en: payload.site_settings?.event_name_en || 'Milad Fest 2K26',
      title_ml: payload.site_settings?.event_name_ml || 'മീലാദ് ഫെസ്റ്റ് 2K26',
      event_code: 'MF2K26',
      is_active: true,
      event_date: payload.site_settings?.event_date || '2026-08-29',
    }], { onConflict: 'id' });
  } catch (e) {
    console.warn('Supabase event sync error:', e);
  }

  // 1. Categories
  if (Array.isArray(payload.categories) && payload.categories.length > 0) {
    try {
      const rows = payload.categories.map((c: any) => ({
        id: c.id,
        event_id: eventId,
        name_en: c.name_en,
        name_ml: c.name_ml || null,
        slug: c.slug || c.id,
        color_code: c.color_code || '#10B981',
        display_order: c.display_order || 0,
        is_enabled: c.is_enabled !== false,
      }));
      await supabase.from('categories').upsert(rows, { onConflict: 'id' });
    } catch (e) {
      console.warn('Supabase categories sync error:', e);
    }
  }

  // 2. Teams
  if (Array.isArray(payload.teams) && payload.teams.length > 0) {
    try {
      const rows = payload.teams.map((t: any) => ({
        id: t.id,
        event_id: eventId,
        name_en: t.name_en,
        name_ml: t.name_ml || null,
        short_code: t.code || t.short_code || t.id.substring(0, 4),
        logo_url: t.logo_url || null,
        color_code: t.color_code || '#3B82F6',
        display_order: t.display_order || 0,
        is_active: !t.is_archived,
      }));
      await supabase.from('teams').upsert(rows, { onConflict: 'id' });
    } catch (e) {
      console.warn('Supabase teams sync error:', e);
    }
  }

  // 3. Students
  if (Array.isArray(payload.students) && payload.students.length > 0) {
    try {
      const rows = payload.students.map((s: any) => ({
        id: s.id,
        event_id: eventId,
        student_id_code: s.student_id_code || s.id,
        name_en: s.name_en,
        name_ml: s.name_ml || null,
        category_id: s.category_id || null,
        category_class: s.category_class || s.class_name || null,
        gender: s.gender || 'General',
        team_id: s.team_id || null,
        is_active: !s.is_archived,
      }));
      await supabase.from('students').upsert(rows, { onConflict: 'id' });
    } catch (e) {
      console.warn('Supabase students sync error:', e);
    }
  }

  // 4. Programmes
  if (Array.isArray(payload.programmes) && payload.programmes.length > 0) {
    try {
      const rows = payload.programmes.map((p: any) => ({
        id: p.id,
        event_id: eventId,
        category_id: p.category_id || null,
        title_en: p.title_en,
        title_ml: p.title_ml || null,
        code: p.code || p.id,
        slug: p.slug || p.id,
        programme_type: p.competition_type === 'Team' ? 'Group' : 'Single',
        venue_name: p.venue || null,
        max_score: p.max_score || 100,
        lifecycle_status: p.lifecycle_status || (p.is_published ? 'Published' : 'Upcoming'),
        is_result_published: !!p.is_published,
      }));
      await supabase.from('programmes').upsert(rows, { onConflict: 'id' });
    } catch (e) {
      console.warn('Supabase programmes sync error:', e);
    }
  }

  // 5. Announcements
  if (Array.isArray(payload.announcements) && payload.announcements.length > 0) {
    try {
      const rows = payload.announcements.map((a: any) => ({
        id: a.id,
        event_id: eventId,
        title_en: a.title_en,
        title_ml: a.title_ml || null,
        content_en: a.content_en || a.short_description_en || a.title_en,
        priority: a.priority || 'Normal',
        is_published: a.is_published !== false,
      }));
      await supabase.from('announcements').upsert(rows, { onConflict: 'id' });
    } catch (e) {
      console.warn('Supabase announcements sync error:', e);
    }
  }

  // 6. Programme Results
  if (Array.isArray(payload.results) && payload.results.length > 0) {
    try {
      const rows = payload.results.map((r: any) => ({
        id: r.id,
        event_id: eventId,
        programme_id: r.programme_id,
        category_id: r.category_id || null,
        winners_json: Array.isArray(r.winners) ? r.winners : [r],
        is_published: r.is_published !== false,
      }));
      await supabase.from('programme_results').upsert(rows, { onConflict: 'id' });
    } catch (e) {
      console.warn('Supabase results sync error:', e);
    }
  }
}

export async function GET() {
  const data = readStoredData();
  return NextResponse.json(data || {});
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const current = readStoredData() || {};

    const updated = {
      ...current,
      ...body,
      last_synced_at: new Date().toISOString(),
    };

    // Save JSON data cache
    writeStoredData(updated);

    // Sync directly to Supabase production tables
    await syncToSupabase(updated);

    return NextResponse.json({ 
      success: true, 
      timestamp: updated.last_synced_at,
      counts: {
        students: Array.isArray(updated.students) ? updated.students.length : 0,
        teams: Array.isArray(updated.teams) ? updated.teams.length : 0,
        programmes: Array.isArray(updated.programmes) ? updated.programmes.length : 0,
        categories: Array.isArray(updated.categories) ? updated.categories.length : 0,
      }
    });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 400 });
  }
}
