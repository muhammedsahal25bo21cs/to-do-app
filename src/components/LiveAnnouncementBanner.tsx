'use client';

import React, { useEffect, useState } from 'react';
import { getSiteSettings, SiteSettings } from '@/lib/cmsService';
import { subscribeToSiteSettings } from '@/lib/realtimeService';
import { Megaphone, AlertCircle, Info, Radio, X } from 'lucide-react';

export function LiveAnnouncementBanner() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [dismissed, setDismissed] = useState(false);

  const loadSettings = async () => {
    try {
      const data = await getSiteSettings();
      setSettings(data);
    } catch (e) {
      console.error('Error loading site settings for live banner:', e);
    }
  };

  useEffect(() => {
    loadSettings();
    const unsub = subscribeToSiteSettings(() => loadSettings());
    return () => unsub();
  }, []);

  if (!settings || !settings.live_announcement_enabled || !settings.live_announcement_message || dismissed) {
    return null;
  }

  const priority = settings.live_announcement_priority || 'Important';

  const bgStyles = 
    priority === 'Urgent'
      ? 'bg-gradient-to-r from-rose-950 via-rose-900 to-rose-950 border-rose-500/50 text-rose-100'
      : priority === 'Important'
      ? 'bg-gradient-to-r from-amber-950 via-amber-900 to-amber-950 border-amber-500/50 text-amber-100'
      : 'bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-950 border-emerald-500/50 text-emerald-100';

  const badgeStyles =
    priority === 'Urgent'
      ? 'bg-rose-500/30 text-rose-200 border-rose-400/40'
      : priority === 'Important'
      ? 'bg-amber-500/30 text-amber-200 border-amber-400/40'
      : 'bg-emerald-500/30 text-emerald-200 border-emerald-400/40';

  return (
    <div className={`w-full border-b py-2 px-4 text-xs font-semibold ${bgStyles} transition-all duration-300 relative`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 overflow-hidden">
          <span className={`px-2 py-0.5 rounded-full border text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shrink-0 ${badgeStyles}`}>
            <Radio className="w-3 h-3 animate-pulse" />
            <span>LIVE UPDATE</span>
          </span>

          <p className="truncate text-xs font-bold leading-relaxed">
            {settings.live_announcement_message}
          </p>
        </div>

        <button
          onClick={() => setDismissed(true)}
          className="p-1 rounded-lg hover:bg-black/20 text-current/80 hover:text-current shrink-0 transition-colors"
          title="Dismiss Live Alert"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
