'use client';

import React, { useEffect, useState } from 'react';
import { getSiteSettings, SiteSettings } from '@/lib/cmsService';
import { Info, Sparkles } from 'lucide-react';

export const AboutSection: React.FC = () => {
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  useEffect(() => {
    getSiteSettings().then(setSettings);
  }, []);

  return (
    <section id="about" className="py-16 sm:py-24 bg-emerald-950 text-emerald-100 border-b border-emerald-800/40">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold uppercase tracking-wider">
          <Info className="w-4 h-4 text-amber-400" />
          <span>About the Event</span>
        </div>

        <h2 className="text-3xl sm:text-5xl font-black text-gold-gradient tracking-tight">
          {settings?.event_name_en || 'Milad Fest 2K26'}
        </h2>

        <p className="text-sm sm:text-base text-emerald-200/90 leading-relaxed max-w-3xl mx-auto">
          {settings?.description_en || 'Welcome to the official event portal. Event schedules, competitor registrations, results, and leaderboards will appear as published by event administrators.'}
        </p>
      </div>
    </section>
  );
};
