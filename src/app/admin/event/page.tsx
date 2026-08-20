'use client';

import React, { useEffect, useState } from 'react';
import { getSiteSettings, updateSiteSettings, uploadMediaImage, SiteSettings } from '@/lib/cmsService';
import { AdminPreviewModal } from '@/components/admin/AdminPreviewModal';
import { 
  Save, 
  Eye, 
  Upload, 
  CheckCircle2, 
  Calendar, 
  MapPin, 
  Globe, 
  Phone, 
  Image as ImageIcon, 
  Clock, 
  Sparkles,
  AlertCircle
} from 'lucide-react';

export default function EventDetailsAdmin() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  useEffect(() => {
    getSiteSettings().then((s) => {
      setSettings(s);
      setIsLoading(false);
    });
  }, []);

  const handleChange = (field: keyof SiteSettings, value: any) => {
    if (!settings) return;
    setSettings({ ...settings, [field]: value });
  };

  const handleImageUpload = async (field: keyof SiteSettings, file: File) => {
    try {
      const uploadedUrl = await uploadMediaImage(file);
      handleChange(field, uploadedUrl);
    } catch (err) {
      alert('Failed to upload image');
    }
  };

  const handleSave = async (published = true) => {
    if (!settings) return;
    setIsSaving(true);
    await updateSiteSettings(settings);
    setIsSaving(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  if (isLoading || !settings) {
    return <div className="p-8 text-center text-emerald-300">Loading Event Details...</div>;
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-emerald-950/80 border border-emerald-800/80 p-6 rounded-3xl backdrop-blur-xl">
        <div>
          <h1 className="text-2xl font-black text-emerald-100 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-amber-400" />
            <span>Event Details & Branding</span>
          </h1>
          <p className="text-xs text-emerald-300/80 mt-1">
            Manage names, titles, dates, venue, logos, posters, social links, and countdown without editing code.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setIsPreviewOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-900 hover:bg-emerald-800 text-amber-300 font-bold text-xs border border-emerald-700 transition-all"
          >
            <Eye className="w-4 h-4" />
            <span>Preview Changes</span>
          </button>
          <button
            onClick={() => handleSave(true)}
            disabled={isSaving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-emerald-950 font-extrabold text-xs shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Publishing...' : 'Save & Publish'}</span>
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-xs font-bold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Event details saved and updated on the public website!</span>
        </div>
      )}

      {/* Form Sections */}
      <div className="space-y-6">
        {/* 1. Basic Information */}
        <div className="bg-emerald-950/80 border border-emerald-800/60 rounded-3xl p-6 shadow-xl space-y-4">
          <h2 className="text-base font-bold text-emerald-100 border-b border-emerald-800/60 pb-3 flex items-center gap-2">
            <Globe className="w-5 h-5 text-amber-400" />
            <span>1. Event Titles & Multilingual Descriptions</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-emerald-300 mb-1">Event Name (English)</label>
              <input
                type="text"
                value={settings.event_name_en}
                onChange={(e) => handleChange('event_name_en', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-emerald-900/40 border border-emerald-800 text-emerald-100 text-xs focus:border-amber-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-emerald-300 mb-1">Event Name (Malayalam - മലയാളം)</label>
              <input
                type="text"
                value={settings.event_name_ml}
                onChange={(e) => handleChange('event_name_ml', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-emerald-900/40 border border-emerald-800 text-emerald-100 text-xs focus:border-amber-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-emerald-300 mb-1">Subtitle (English)</label>
              <input
                type="text"
                value={settings.event_subtitle_en}
                onChange={(e) => handleChange('event_subtitle_en', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-emerald-900/40 border border-emerald-800 text-emerald-100 text-xs focus:border-amber-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-emerald-300 mb-1">Subtitle (Malayalam)</label>
              <input
                type="text"
                value={settings.event_subtitle_ml}
                onChange={(e) => handleChange('event_subtitle_ml', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-emerald-900/40 border border-emerald-800 text-emerald-100 text-xs focus:border-amber-400 focus:outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-emerald-300 mb-1">Arabic Bismillah Header</label>
              <input
                type="text"
                dir="rtl"
                value={settings.bismillah_ar}
                onChange={(e) => handleChange('bismillah_ar', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-emerald-900/40 border border-emerald-800 text-amber-300 font-serif text-sm focus:border-amber-400 focus:outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-emerald-300 mb-1">Arabic Durood Header</label>
              <input
                type="text"
                dir="rtl"
                value={settings.durood_ar}
                onChange={(e) => handleChange('durood_ar', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-emerald-900/40 border border-emerald-800 text-amber-300 font-serif text-sm focus:border-amber-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-emerald-300 mb-1">About Fest Description (English)</label>
              <textarea
                rows={3}
                value={settings.description_en}
                onChange={(e) => handleChange('description_en', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-emerald-900/40 border border-emerald-800 text-emerald-100 text-xs focus:border-amber-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-emerald-300 mb-1">About Fest Description (Malayalam)</label>
              <textarea
                rows={3}
                value={settings.description_ml}
                onChange={(e) => handleChange('description_ml', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-emerald-900/40 border border-emerald-800 text-emerald-100 text-xs focus:border-amber-400 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* 2. Date, Time & Venue */}
        <div className="bg-emerald-950/80 border border-emerald-800/60 rounded-3xl p-6 shadow-xl space-y-4">
          <h2 className="text-base font-bold text-emerald-100 border-b border-emerald-800/60 pb-3 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-amber-400" />
            <span>2. Event Date, Time & Venue</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-emerald-300 mb-1">Event Date (YYYY-MM-DD)</label>
              <input
                type="date"
                value={settings.event_date}
                onChange={(e) => handleChange('event_date', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-emerald-900/40 border border-emerald-800 text-emerald-100 text-xs focus:border-amber-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-emerald-300 mb-1">Event Time (e.g. 09:00 AM onwards)</label>
              <input
                type="text"
                value={settings.event_time}
                onChange={(e) => handleChange('event_time', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-emerald-900/40 border border-emerald-800 text-emerald-100 text-xs focus:border-amber-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-emerald-300 mb-1">Venue Name (English)</label>
              <input
                type="text"
                value={settings.venue_en}
                onChange={(e) => handleChange('venue_en', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-emerald-900/40 border border-emerald-800 text-emerald-100 text-xs focus:border-amber-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-emerald-300 mb-1">Venue Name (Malayalam)</label>
              <input
                type="text"
                value={settings.venue_ml}
                onChange={(e) => handleChange('venue_ml', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-emerald-900/40 border border-emerald-800 text-emerald-100 text-xs focus:border-amber-400 focus:outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-emerald-300 mb-1">Location Address</label>
              <input
                type="text"
                value={settings.location_address}
                onChange={(e) => handleChange('location_address', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-emerald-900/40 border border-emerald-800 text-emerald-100 text-xs focus:border-amber-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-emerald-300 mb-1">Google Maps Link URL</label>
              <input
                type="text"
                value={settings.map_url}
                onChange={(e) => handleChange('map_url', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-emerald-900/40 border border-emerald-800 text-emerald-100 text-xs focus:border-amber-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-emerald-300 mb-1">Google Maps Embed iframe Source</label>
              <input
                type="text"
                value={settings.map_embed_src}
                onChange={(e) => handleChange('map_embed_src', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-emerald-900/40 border border-emerald-800 text-emerald-100 text-xs focus:border-amber-400 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* 3. Media & Uploaders */}
        <div className="bg-emerald-950/80 border border-emerald-800/60 rounded-3xl p-6 shadow-xl space-y-4">
          <h2 className="text-base font-bold text-emerald-100 border-b border-emerald-800/60 pb-3 flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-amber-400" />
            <span>3. Hero Image, Logo & Event Poster</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Hero Image */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-emerald-300">Hero Banner Image</label>
              {settings.hero_image_url && (
                <img src={settings.hero_image_url} alt="Hero" className="w-full h-32 object-cover rounded-xl border border-emerald-800" />
              )}
              <input
                type="text"
                placeholder="Image URL"
                value={settings.hero_image_url}
                onChange={(e) => handleChange('hero_image_url', e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-emerald-900/40 border border-emerald-800 text-emerald-100 text-xs"
              />
              <label className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-900 hover:bg-emerald-800 text-emerald-200 text-xs font-semibold cursor-pointer border border-emerald-700">
                <Upload className="w-3.5 h-3.5" />
                <span>Upload File</span>
                <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleImageUpload('hero_image_url', e.target.files[0])} />
              </label>
            </div>

            {/* Logo */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-emerald-300">Event Logo</label>
              {settings.logo_url && (
                <img src={settings.logo_url} alt="Logo" className="w-full h-32 object-contain rounded-xl border border-emerald-800 bg-emerald-900/30 p-2" />
              )}
              <input
                type="text"
                placeholder="Logo Image URL"
                value={settings.logo_url}
                onChange={(e) => handleChange('logo_url', e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-emerald-900/40 border border-emerald-800 text-emerald-100 text-xs"
              />
              <label className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-900 hover:bg-emerald-800 text-emerald-200 text-xs font-semibold cursor-pointer border border-emerald-700">
                <Upload className="w-3.5 h-3.5" />
                <span>Upload File</span>
                <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleImageUpload('logo_url', e.target.files[0])} />
              </label>
            </div>

            {/* Poster */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-emerald-300">Event Poster</label>
              {settings.event_poster_url && (
                <img src={settings.event_poster_url} alt="Poster" className="w-full h-32 object-cover rounded-xl border border-emerald-800" />
              )}
              <input
                type="text"
                placeholder="Poster Image URL"
                value={settings.event_poster_url}
                onChange={(e) => handleChange('event_poster_url', e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-emerald-900/40 border border-emerald-800 text-emerald-100 text-xs"
              />
              <label className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-900 hover:bg-emerald-800 text-emerald-200 text-xs font-semibold cursor-pointer border border-emerald-700">
                <Upload className="w-3.5 h-3.5" />
                <span>Upload File</span>
                <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleImageUpload('event_poster_url', e.target.files[0])} />
              </label>
            </div>
          </div>
        </div>

        {/* 4. Contact & Social Links */}
        <div className="bg-emerald-950/80 border border-emerald-800/60 rounded-3xl p-6 shadow-xl space-y-4">
          <h2 className="text-base font-bold text-emerald-100 border-b border-emerald-800/60 pb-3 flex items-center gap-2">
            <Phone className="w-5 h-5 text-amber-400" />
            <span>4. Contact Information & Social Media</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-emerald-300 mb-1">Contact Phone</label>
              <input
                type="text"
                value={settings.contact_phone}
                onChange={(e) => handleChange('contact_phone', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-emerald-900/40 border border-emerald-800 text-emerald-100 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-emerald-300 mb-1">Contact Email</label>
              <input
                type="email"
                value={settings.contact_email}
                onChange={(e) => handleChange('contact_email', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-emerald-900/40 border border-emerald-800 text-emerald-100 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-emerald-300 mb-1">WhatsApp Link</label>
              <input
                type="text"
                value={settings.social_whatsapp}
                onChange={(e) => handleChange('social_whatsapp', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-emerald-900/40 border border-emerald-800 text-emerald-100 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-emerald-300 mb-1">YouTube Link</label>
              <input
                type="text"
                value={settings.social_youtube}
                onChange={(e) => handleChange('social_youtube', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-emerald-900/40 border border-emerald-800 text-emerald-100 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-emerald-300 mb-1">Facebook Link</label>
              <input
                type="text"
                value={settings.social_facebook}
                onChange={(e) => handleChange('social_facebook', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-emerald-900/40 border border-emerald-800 text-emerald-100 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-emerald-300 mb-1">Instagram Link</label>
              <input
                type="text"
                value={settings.social_instagram}
                onChange={(e) => handleChange('social_instagram', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-emerald-900/40 border border-emerald-800 text-emerald-100 text-xs"
              />
            </div>
          </div>
        </div>

        {/* 5. Countdown Controls */}
        <div className="bg-emerald-950/80 border border-emerald-800/60 rounded-3xl p-6 shadow-xl space-y-4">
          <h2 className="text-base font-bold text-emerald-100 border-b border-emerald-800/60 pb-3 flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-400" />
            <span>5. Countdown Settings</span>
          </h2>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-emerald-100">Show Countdown Section on Website</span>
              <p className="text-[11px] text-emerald-400/80">Toggle to display live countdown clock to fest day.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.is_countdown_enabled}
                onChange={(e) => handleChange('is_countdown_enabled', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-emerald-900 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-emerald-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
            </label>
          </div>

          <div>
            <label className="block text-xs font-bold text-emerald-300 mb-1">Countdown Target Date & Time (ISO format)</label>
            <input
              type="text"
              value={settings.countdown_target_iso}
              onChange={(e) => handleChange('countdown_target_iso', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-emerald-900/40 border border-emerald-800 text-emerald-100 text-xs"
            />
          </div>
        </div>
      </div>

      <AdminPreviewModal isOpen={isPreviewOpen} onClose={() => setIsPreviewOpen(false)} />
    </div>
  );
}
