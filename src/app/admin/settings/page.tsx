'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  getSiteSettings, 
  updateSiteSettings, 
  getEvents, 
  createEvent, 
  setActiveEvent, 
  getSections, 
  updateSection, 
  getNavigationItems, 
  updateNavigationItem,
  getConfigAuditLogs,
  logConfigChange,
  SiteSettings, 
  EventItem, 
  EventSection, 
  NavigationItem,
  ConfigAuditLog
} from '@/lib/cmsService';
import { AdminPermissionGuard } from '@/components/admin/AdminPermissionGuard';
import { 
  Settings, 
  Save, 
  CheckCircle2, 
  Sparkles, 
  Palette, 
  Compass, 
  Layout, 
  MapPin, 
  PhoneCall, 
  Search, 
  Activity, 
  Globe,
  Plus,
  RefreshCw,
  Wand2,
  Lock,
  Eye,
  Layers,
  BarChart2,
  Type,
  FileText,
  ShieldAlert,
  ArrowUp,
  ArrowDown,
  Trash2
} from 'lucide-react';

function SettingsAdminContent() {
  const [tab, setTab] = useState<'identity' | 'branding' | 'theme' | 'visibility' | 'homepage' | 'nav' | 'leaderboard' | 'maintenance' | 'audit'>('identity');
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [sections, setSections] = useState<EventSection[]>([]);
  const [navItems, setNavItems] = useState<NavigationItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<ConfigAuditLog[]>([]);

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // New Nav Item Form State
  const [newNavLabel, setNewNavLabel] = useState('');
  const [newNavHref, setNewNavHref] = useState('');

  // New Point Rule State
  const [newRank, setNewRank] = useState<number>(5);
  const [newPoints, setNewPoints] = useState<number>(2);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [stg, evts, secs, navs, logs] = await Promise.all([
      getSiteSettings(),
      getEvents(),
      getSections(false),
      getNavigationItems(false),
      getConfigAuditLogs(),
    ]);

    setSettings(stg);
    setEvents(evts);
    setSections(secs.sort((a, b) => a.display_order - b.display_order));
    setNavItems(navs.sort((a, b) => a.display_order - b.display_order));
    setAuditLogs(logs);
  };

  const handleSave = async (draftMode = false) => {
    if (!settings) return;
    setIsSaving(true);

    if (draftMode) {
      const updated = {
        ...settings,
        draft_settings: { ...settings }
      };
      await updateSiteSettings(updated);
      await logConfigChange('draft_settings', 'previous_draft', 'Saved draft settings');
    } else {
      await updateSiteSettings(settings);
      await logConfigChange('site_settings', 'previous_config', 'Published live configuration');
    }

    setIsSaving(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3500);
    await loadData();
  };

  // Section Ordering Handlers
  const handleMoveSection = async (index: number, direction: 'up' | 'down') => {
    const newSections = [...sections];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newSections.length) return;

    const temp = newSections[index];
    newSections[index] = newSections[targetIndex];
    newSections[targetIndex] = temp;

    // Update display orders
    for (let i = 0; i < newSections.length; i++) {
      newSections[i].display_order = i + 1;
      await updateSection(newSections[i].id, { display_order: i + 1 });
    }

    setSections(newSections);
  };

  const handleToggleSection = async (secId: string, currentVal: boolean) => {
    await updateSection(secId, { is_enabled: !currentVal });
    await loadData();
  };

  // Navigation Items Handlers
  const handleToggleNavItem = async (navId: string, currentVal: boolean) => {
    await updateNavigationItem(navId, { is_enabled: !currentVal });
    await loadData();
  };

  const handleMoveNavItem = async (index: number, direction: 'up' | 'down') => {
    const newNavs = [...navItems];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newNavs.length) return;

    const temp = newNavs[index];
    newNavs[index] = newNavs[targetIndex];
    newNavs[targetIndex] = temp;

    for (let i = 0; i < newNavs.length; i++) {
      newNavs[i].display_order = i + 1;
      await updateNavigationItem(newNavs[i].id, { display_order: i + 1 });
    }

    setNavItems(newNavs);
  };

  // Page Visibility Toggle Helper
  const handleTogglePageVisibility = (pageKey: string) => {
    if (!settings) return;
    const currentVis = settings.public_pages_visibility || {
      home: true,
      programs: true,
      results: true,
      leaderboard: true,
      announcements: true,
      gallery: true,
      venue: true,
      verify: true,
      register: true,
    };

    setSettings({
      ...settings,
      public_pages_visibility: {
        ...currentVis,
        [pageKey]: !currentVis[pageKey as keyof typeof currentVis],
      },
    });
  };

  // Leaderboard Points Helper
  const handleAddPointRule = () => {
    if (!settings) return;
    const rules = settings.leaderboard_point_rules || [];
    const updatedRules = [...rules.filter(r => r.rank !== newRank), { rank: newRank, points: newPoints }].sort((a, b) => a.rank - b.rank);
    setSettings({ ...settings, leaderboard_point_rules: updatedRules });
  };

  const handleRemovePointRule = (rank: number) => {
    if (!settings) return;
    const rules = settings.leaderboard_point_rules || [];
    setSettings({ ...settings, leaderboard_point_rules: rules.filter(r => r.rank !== rank) });
  };

  if (!settings) {
    return (
      <div className="p-12 text-center text-amber-300 font-bold text-xs animate-pulse">
        Loading Event Customization Engine...
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-emerald-950/90 border border-emerald-800/80 p-6 rounded-3xl backdrop-blur-xl">
        <div>
          <h1 className="text-2xl font-black text-emerald-100 flex items-center gap-2">
            <Settings className="w-7 h-7 text-amber-400" />
            <span>Event Control & Customization Engine</span>
          </h1>
          <p className="text-xs text-emerald-300/80 mt-1">
            Configure settings, branding, visual themes, public page visibility, homepage section orders, point rules, and maintenance mode.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => handleSave(true)}
            disabled={isSaving}
            className="px-4 py-2.5 rounded-2xl bg-emerald-900 hover:bg-emerald-800 border border-emerald-700 text-amber-300 font-extrabold text-xs transition-all flex items-center gap-1.5 shrink-0"
          >
            <FileText className="w-4 h-4" />
            <span>Save Draft</span>
          </button>

          <button
            onClick={() => handleSave(false)}
            disabled={isSaving}
            className="px-6 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-emerald-950 font-black text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2 shrink-0"
          >
            {saveSuccess ? <CheckCircle2 className="w-4 h-4 text-emerald-950" /> : <Save className="w-4 h-4" />}
            <span>{isSaving ? 'Publishing...' : saveSuccess ? 'Published!' : 'Publish Live Settings'}</span>
          </button>
        </div>
      </div>

      {/* Control Tabs Bar */}
      <div className="flex border-b border-emerald-800/60 overflow-x-auto gap-2">
        {[
          { id: 'identity', label: '1. Event Identity', icon: Globe },
          { id: 'branding', label: '2. Branding & Logos', icon: Palette },
          { id: 'theme', label: '3. Theme & Typography', icon: Type },
          { id: 'visibility', label: '4. Public Page Access', icon: Lock },
          { id: 'homepage', label: '5. Homepage Layout', icon: Layout },
          { id: 'nav', label: '6. Navigation Builder', icon: Compass },
          { id: 'leaderboard', label: '7. Point Rules', icon: BarChart2 },
          { id: 'maintenance', label: '8. Maintenance Mode', icon: ShieldAlert },
          { id: 'audit', label: '9. Audit History', icon: Activity },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id as any)}
            className={`px-4 py-3 text-xs font-extrabold rounded-t-2xl transition-all shrink-0 flex items-center gap-2 ${
              tab === t.id
                ? 'bg-amber-500 text-emerald-950 shadow-lg shadow-amber-500/20'
                : 'text-emerald-300 hover:bg-emerald-900/60'
            }`}
          >
            <t.icon className="w-4 h-4" />
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* TAB 1: EVENT IDENTITY */}
      {tab === 'identity' && (
        <div className="bg-emerald-950/80 border border-emerald-800/60 rounded-3xl p-6 shadow-xl space-y-6 max-w-4xl">
          <div>
            <h2 className="text-lg font-black text-amber-300 flex items-center gap-2">
              <Globe className="w-5 h-5" />
              <span>Event Identity & Official Information</span>
            </h2>
            <p className="text-xs text-emerald-300/80 mt-1">Configure event titles, dates, time, venue, and official contact details.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <label className="block font-bold text-amber-300">Event Title (English) *</label>
              <input
                type="text"
                value={settings.event_name_en}
                onChange={(e) => setSettings({ ...settings, event_name_en: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-emerald-900 border border-emerald-700 text-emerald-100 font-bold focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="block font-bold text-amber-300">Event Subtitle *</label>
              <input
                type="text"
                value={settings.event_subtitle_en}
                onChange={(e) => setSettings({ ...settings, event_subtitle_en: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-emerald-900 border border-emerald-700 text-emerald-100 font-bold focus:outline-none"
              />
            </div>

            <div className="space-y-1 md:col-span-2">
              <label className="block font-bold text-amber-300">Organizer Name *</label>
              <input
                type="text"
                value={settings.organizer_name_en || ''}
                onChange={(e) => setSettings({ ...settings, organizer_name_en: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-emerald-900 border border-emerald-700 text-emerald-100 font-bold focus:outline-none"
              />
            </div>

            <div className="space-y-1 md:col-span-2">
              <label className="block font-bold text-amber-300">Event Description</label>
              <textarea
                value={settings.description_en}
                onChange={(e) => setSettings({ ...settings, description_en: e.target.value })}
                className="w-full p-3 rounded-xl bg-emerald-900 border border-emerald-700 text-emerald-100 font-bold focus:outline-none min-h-[90px]"
              />
            </div>

            <div className="space-y-1">
              <label className="block font-bold text-amber-300">Event Date *</label>
              <input
                type="text"
                value={settings.event_date}
                onChange={(e) => setSettings({ ...settings, event_date: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-emerald-900 border border-emerald-700 text-emerald-100 font-bold focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="block font-bold text-amber-300">Event Time *</label>
              <input
                type="text"
                value={settings.event_time}
                onChange={(e) => setSettings({ ...settings, event_time: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-emerald-900 border border-emerald-700 text-emerald-100 font-bold focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="block font-bold text-amber-300">Venue Name *</label>
              <input
                type="text"
                value={settings.venue_en}
                onChange={(e) => setSettings({ ...settings, venue_en: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-emerald-900 border border-emerald-700 text-emerald-100 font-bold focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="block font-bold text-amber-300">Official Contact Phone</label>
              <input
                type="text"
                value={settings.contact_phone}
                onChange={(e) => setSettings({ ...settings, contact_phone: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-emerald-900 border border-emerald-700 text-emerald-100 font-bold focus:outline-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: BRANDING & ASSETS */}
      {tab === 'branding' && (
        <div className="bg-emerald-950/80 border border-emerald-800/60 rounded-3xl p-6 shadow-xl space-y-6 max-w-4xl">
          <div>
            <h2 className="text-lg font-black text-amber-300 flex items-center gap-2">
              <Palette className="w-5 h-5" />
              <span>Event Branding & Image Asset Management</span>
            </h2>
            <p className="text-xs text-emerald-300/80 mt-1">Configure logos, hero graphics, result poster backgrounds, and certificate backdrops.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <label className="block font-bold text-amber-300">Event Logo URL</label>
              <input
                type="text"
                value={settings.logo_url}
                onChange={(e) => setSettings({ ...settings, logo_url: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-emerald-900 border border-emerald-700 text-emerald-100 font-bold focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="block font-bold text-amber-300">Organizer Logo URL</label>
              <input
                type="text"
                value={settings.organizer_logo_url || ''}
                onChange={(e) => setSettings({ ...settings, organizer_logo_url: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-emerald-900 border border-emerald-700 text-emerald-100 font-bold focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="block font-bold text-amber-300">Hero Image URL</label>
              <input
                type="text"
                value={settings.hero_image_url}
                onChange={(e) => setSettings({ ...settings, hero_image_url: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-emerald-900 border border-emerald-700 text-emerald-100 font-bold focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="block font-bold text-amber-300">Favicon URL</label>
              <input
                type="text"
                value={settings.favicon_url || ''}
                onChange={(e) => setSettings({ ...settings, favicon_url: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-emerald-900 border border-emerald-700 text-emerald-100 font-bold focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="block font-bold text-amber-300">Result Poster Background URL</label>
              <input
                type="text"
                value={settings.result_poster_bg_url || ''}
                onChange={(e) => setSettings({ ...settings, result_poster_bg_url: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-emerald-900 border border-emerald-700 text-emerald-100 font-bold focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="block font-bold text-amber-300">Certificate Background URL</label>
              <input
                type="text"
                value={settings.certificate_bg_url || ''}
                onChange={(e) => setSettings({ ...settings, certificate_bg_url: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-emerald-900 border border-emerald-700 text-emerald-100 font-bold focus:outline-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: THEME & TYPOGRAPHY */}
      {tab === 'theme' && (
        <div className="bg-emerald-950/80 border border-emerald-800/60 rounded-3xl p-6 shadow-xl space-y-6 max-w-4xl">
          <div>
            <h2 className="text-lg font-black text-amber-300 flex items-center gap-2">
              <Type className="w-5 h-5" />
              <span>Color Theme & Web Typography</span>
            </h2>
            <p className="text-xs text-emerald-300/80 mt-1">Configure site colors and typography with live preview.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="block font-bold text-amber-300">Heading Web Font</label>
                <select
                  value={settings.heading_font || 'Cinzel'}
                  onChange={(e) => setSettings({ ...settings, heading_font: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-emerald-900 border border-emerald-700 text-emerald-100 font-bold"
                >
                  <option value="Cinzel">Cinzel (Islamic / Regal Serif)</option>
                  <option value="Playfair Display">Playfair Display (Classic Serif)</option>
                  <option value="Outfit">Outfit (Modern Sans)</option>
                  <option value="Inter">Inter (Clean Universal)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-amber-300">Body Web Font</label>
                <select
                  value={settings.body_font || 'Inter'}
                  onChange={(e) => setSettings({ ...settings, body_font: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-emerald-900 border border-emerald-700 text-emerald-100 font-bold"
                >
                  <option value="Inter">Inter (Highly Readable)</option>
                  <option value="Plus Jakarta Sans">Plus Jakarta Sans (Modern Clean)</option>
                  <option value="Roboto">Roboto (Standard UI)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-amber-300">Primary Color Hex</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={settings.primary_color || '#064e3b'}
                    onChange={(e) => setSettings({ ...settings, primary_color: e.target.value })}
                    className="w-10 h-10 rounded-xl bg-transparent border-0 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={settings.primary_color || '#064e3b'}
                    onChange={(e) => setSettings({ ...settings, primary_color: e.target.value })}
                    className="flex-1 px-4 py-2 rounded-xl bg-emerald-900 border border-emerald-700 text-emerald-100 font-mono font-bold"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-amber-300">Accent Gold Hex</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={settings.accent_color || '#f59e0b'}
                    onChange={(e) => setSettings({ ...settings, accent_color: e.target.value })}
                    className="w-10 h-10 rounded-xl bg-transparent border-0 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={settings.accent_color || '#f59e0b'}
                    onChange={(e) => setSettings({ ...settings, accent_color: e.target.value })}
                    className="flex-1 px-4 py-2 rounded-xl bg-emerald-900 border border-emerald-700 text-emerald-100 font-mono font-bold"
                  />
                </div>
              </div>
            </div>

            {/* Live Theme Preview Card */}
            <div className="p-6 rounded-3xl bg-emerald-950 border-2 border-amber-500/40 shadow-2xl flex flex-col justify-between space-y-4">
              <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest block">Live Theme Preview</span>

              <div className="space-y-2">
                <h3 className="text-xl font-black text-amber-300" style={{ fontFamily: settings.heading_font || 'Cinzel' }}>
                  {settings.event_name_en}
                </h3>
                <p className="text-xs text-emerald-200" style={{ fontFamily: settings.body_font || 'Inter' }}>
                  This card demonstrates live heading typography and theme color rendering.
                </p>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <div className="px-3 py-1.5 rounded-xl bg-amber-500 text-emerald-950 font-black text-xs">
                  Primary CTA
                </div>
                <div className="px-3 py-1.5 rounded-xl bg-emerald-900 border border-emerald-700 text-emerald-200 font-bold text-xs">
                  Secondary CTA
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: PUBLIC PAGE VISIBILITY */}
      {tab === 'visibility' && (
        <div className="bg-emerald-950/80 border border-emerald-800/60 rounded-3xl p-6 shadow-xl space-y-6 max-w-4xl">
          <div>
            <h2 className="text-lg font-black text-amber-300 flex items-center gap-2">
              <Lock className="w-5 h-5" />
              <span>Public Page Access & Visibility Controls</span>
            </h2>
            <p className="text-xs text-emerald-300/80 mt-1">Enable or disable specific public sections. Disabled pages are hidden from navigation.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
            {[
              { key: 'home', label: 'Homepage (/)' },
              { key: 'programs', label: 'Programmes (/programs)' },
              { key: 'results', label: 'Results (/results)' },
              { key: 'leaderboard', label: 'Leaderboard (/leaderboard)' },
              { key: 'announcements', label: 'Announcements (/announcements)' },
              { key: 'gallery', label: 'Gallery (/gallery)' },
              { key: 'venue', label: 'Venue & Location' },
              { key: 'verify', label: 'Verify Desk (/verify)' },
              { key: 'register', label: 'Public Registration' },
            ].map((p) => {
              const visMap = settings.public_pages_visibility || {
                home: true,
                programs: true,
                results: true,
                leaderboard: true,
                announcements: true,
                gallery: true,
                venue: true,
                verify: true,
                register: true,
              };
              const isEnabled = visMap[p.key as keyof typeof visMap] !== false;

              return (
                <div
                  key={p.key}
                  onClick={() => handleTogglePageVisibility(p.key)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between gap-3 ${
                    isEnabled
                      ? 'bg-emerald-900/60 border-emerald-600 text-emerald-100 shadow-md'
                      : 'bg-emerald-950/40 border-emerald-900/80 text-emerald-500 opacity-60'
                  }`}
                >
                  <span className="font-extrabold">{p.label}</span>
                  <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                    isEnabled ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-red-500/20 text-red-300'
                  }`}>
                    {isEnabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 5: HOMEPAGE LAYOUT BUILDER */}
      {tab === 'homepage' && (
        <div className="bg-emerald-950/80 border border-emerald-800/60 rounded-3xl p-6 shadow-xl space-y-6 max-w-4xl">
          <div>
            <h2 className="text-lg font-black text-amber-300 flex items-center gap-2">
              <Layout className="w-5 h-5" />
              <span>Homepage Section Drag & Reorder Builder</span>
            </h2>
            <p className="text-xs text-emerald-300/80 mt-1">Reorder or toggle enable/disable state for each homepage section.</p>
          </div>

          <div className="space-y-3">
            {sections.map((sec, idx) => (
              <div
                key={sec.id}
                className="p-4 rounded-2xl bg-emerald-900/40 border border-emerald-800 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center justify-center font-mono font-black text-xs">
                    #{sec.display_order}
                  </span>
                  <div>
                    <h3 className="text-sm font-extrabold text-emerald-100">{sec.title_en}</h3>
                    <span className="text-[10px] text-emerald-400 font-mono font-semibold">{sec.section_key}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleMoveSection(idx, 'up')}
                    disabled={idx === 0}
                    className="p-2 rounded-xl bg-emerald-900 hover:bg-emerald-800 text-amber-300 disabled:opacity-30 border border-emerald-700"
                    title="Move Up"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleMoveSection(idx, 'down')}
                    disabled={idx === sections.length - 1}
                    className="p-2 rounded-xl bg-emerald-900 hover:bg-emerald-800 text-amber-300 disabled:opacity-30 border border-emerald-700"
                    title="Move Down"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleToggleSection(sec.id, sec.is_enabled)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                      sec.is_enabled
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-red-500/20 text-red-300 border border-red-500/40'
                    }`}
                  >
                    {sec.is_enabled ? 'Active' : 'Hidden'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: NAVIGATION BUILDER */}
      {tab === 'nav' && (
        <div className="bg-emerald-950/80 border border-emerald-800/60 rounded-3xl p-6 shadow-xl space-y-6 max-w-4xl">
          <div>
            <h2 className="text-lg font-black text-amber-300 flex items-center gap-2">
              <Compass className="w-5 h-5" />
              <span>Navigation Menu Items Builder</span>
            </h2>
            <p className="text-xs text-emerald-300/80 mt-1">Add, edit, reorder, or disable navigation menu links.</p>
          </div>

          <div className="space-y-3">
            {navItems.map((item, idx) => (
              <div
                key={item.id}
                className="p-4 rounded-2xl bg-emerald-900/40 border border-emerald-800 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center justify-center font-mono font-black text-xs">
                    #{item.display_order}
                  </span>
                  <div>
                    <h3 className="text-sm font-extrabold text-emerald-100">{item.label_en}</h3>
                    <span className="text-[10px] text-emerald-400 font-mono font-semibold">{item.href || item.target_section}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleMoveNavItem(idx, 'up')}
                    disabled={idx === 0}
                    className="p-2 rounded-xl bg-emerald-900 hover:bg-emerald-800 text-amber-300 disabled:opacity-30 border border-emerald-700"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleMoveNavItem(idx, 'down')}
                    disabled={idx === navItems.length - 1}
                    className="p-2 rounded-xl bg-emerald-900 hover:bg-emerald-800 text-amber-300 disabled:opacity-30 border border-emerald-700"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleToggleNavItem(item.id, item.is_enabled)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                      item.is_enabled
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-red-500/20 text-red-300 border border-red-500/40'
                    }`}
                  >
                    {item.is_enabled ? 'Enabled' : 'Disabled'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 7: LEADERBOARD POINT RULES */}
      {tab === 'leaderboard' && (
        <div className="bg-emerald-950/80 border border-emerald-800/60 rounded-3xl p-6 shadow-xl space-y-6 max-w-3xl">
          <div>
            <h2 className="text-lg font-black text-amber-300 flex items-center gap-2">
              <BarChart2 className="w-5 h-5" />
              <span>Leaderboard Point Assignment Rules</span>
            </h2>
            <p className="text-xs text-emerald-300/80 mt-1">Configure championship points awarded per position rank.</p>
          </div>

          <div className="space-y-3">
            {(settings.leaderboard_point_rules || []).map((rule) => (
              <div
                key={rule.rank}
                className="p-4 rounded-2xl bg-emerald-900/40 border border-emerald-800 flex items-center justify-between gap-4 text-xs font-bold"
              >
                <span className="text-amber-300">Rank #{rule.rank} Winner</span>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-emerald-100 font-black text-sm">{rule.points} PTS</span>
                  <button
                    onClick={() => handleRemovePointRule(rule.rank)}
                    className="p-1.5 rounded-xl bg-red-500/20 text-red-300 border border-red-500/40 hover:bg-red-500/30"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-emerald-800/60 flex items-center gap-3 text-xs">
            <input
              type="number"
              placeholder="Rank #"
              value={newRank}
              onChange={(e) => setNewRank(parseInt(e.target.value) || 1)}
              className="w-24 px-3 py-2 rounded-xl bg-emerald-900 border border-emerald-700 text-emerald-100 font-bold"
            />
            <input
              type="number"
              placeholder="Points"
              value={newPoints}
              onChange={(e) => setNewPoints(parseInt(e.target.value) || 0)}
              className="w-24 px-3 py-2 rounded-xl bg-emerald-900 border border-emerald-700 text-emerald-100 font-bold"
            />
            <button
              onClick={handleAddPointRule}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-emerald-950 font-black"
            >
              Add Point Rule
            </button>
          </div>
        </div>
      )}

      {/* TAB 8: MAINTENANCE MODE */}
      {tab === 'maintenance' && (
        <div className="bg-emerald-950/80 border border-emerald-800/60 rounded-3xl p-6 shadow-xl space-y-6 max-w-3xl">
          <div>
            <h2 className="text-lg font-black text-red-400 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5" />
              <span>Master Maintenance Mode Control</span>
            </h2>
            <p className="text-xs text-emerald-300/80 mt-1">Enable maintenance mode to restrict public access while retaining admin access.</p>
          </div>

          <div className="p-5 rounded-2xl bg-emerald-900/40 border border-emerald-800 space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-emerald-100">Maintenance Mode Status</h3>
                <p className="text-[11px] text-emerald-400">When active, public visitors will see a maintenance notice card.</p>
              </div>

              <button
                onClick={() => setSettings({ ...settings, is_maintenance_mode: !settings.is_maintenance_mode })}
                className={`px-5 py-2.5 rounded-2xl font-black text-xs transition-all ${
                  settings.is_maintenance_mode
                    ? 'bg-red-500 text-white shadow-lg shadow-red-500/20'
                    : 'bg-emerald-900 border border-emerald-700 text-emerald-300'
                }`}
              >
                {settings.is_maintenance_mode ? 'MAINTENANCE ACTIVE ⚠️' : 'Normal Operation 🟢'}
              </button>
            </div>

            <div className="space-y-1 pt-2 border-t border-emerald-800/60">
              <label className="block font-bold text-amber-300">Public Maintenance Wording</label>
              <textarea
                value={settings.maintenance_message || ''}
                onChange={(e) => setSettings({ ...settings, maintenance_message: e.target.value })}
                className="w-full p-3 rounded-xl bg-emerald-950 border border-emerald-700 text-emerald-100 font-bold focus:outline-none min-h-[80px]"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 9: AUDIT HISTORY */}
      {tab === 'audit' && (
        <div className="bg-emerald-950/80 border border-emerald-800/60 rounded-3xl p-6 shadow-xl space-y-5 max-w-5xl">
          <div className="border-b border-emerald-800/60 pb-4">
            <h2 className="text-lg font-black text-emerald-100">Configuration Change Audit History</h2>
            <p className="text-xs text-emerald-400">Chronological history log of event settings and theme modifications</p>
          </div>

          {auditLogs.length === 0 ? (
            <div className="text-center py-10 text-xs text-emerald-400/60 font-medium">
              No configuration changes recorded in history log yet.
            </div>
          ) : (
            <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
              {auditLogs.map((log) => (
                <div key={log.id} className="p-3.5 rounded-2xl bg-emerald-900/30 border border-emerald-800/60 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-amber-400">{log.setting_key}</span>
                    <span className="text-[10px] text-emerald-400 font-mono">{new Date(log.timestamp).toLocaleString()}</span>
                  </div>
                  <p className="text-emerald-200 font-semibold">{log.new_value}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function SettingsAdminPage() {
  return (
    <AdminPermissionGuard featureKey="identity" featureLabel="Event Settings & Branding Studio">
      <SettingsAdminContent />
    </AdminPermissionGuard>
  );
}
