'use client';

import React, { useEffect, useState } from 'react';
import { getSiteSettings, SiteSettings } from '@/lib/cmsService';
import { MapPin, Navigation, ExternalLink } from 'lucide-react';

export const LocationSection: React.FC = () => {
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  useEffect(() => {
    getSiteSettings().then(setSettings);
  }, []);

  return (
    <section id="location" className="py-16 sm:py-24 bg-emerald-950 text-emerald-100 border-b border-emerald-800/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold uppercase tracking-wider">
            <MapPin className="w-4 h-4 text-amber-400" />
            <span>Event Venue</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-gold-gradient tracking-tight">
            Location & Directions
          </h2>
          <p className="text-xs sm:text-sm text-emerald-200/80">
            {settings?.venue_en || 'Main Auditorium'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
          <div className="bg-emerald-900/40 border border-emerald-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="space-y-1">
              <h3 className="text-lg font-extrabold text-emerald-100">{settings?.venue_en || 'Main Auditorium'}</h3>
              <p className="text-xs text-emerald-300/80">{settings?.location_address || 'Event Address'}</p>
            </div>

            {settings?.map_url && (
              <a
                href={settings.map_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-emerald-950 font-extrabold text-xs shadow-lg transition-all"
              >
                <Navigation className="w-4 h-4" />
                <span>Open Google Maps</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>

          <div className="lg:col-span-2 rounded-3xl overflow-hidden border border-emerald-800 shadow-2xl h-80 bg-emerald-900/30">
            {settings?.map_embed_src && (
              <iframe
                src={settings.map_embed_src}
                className="w-full h-full border-0"
                allowFullScreen
                loading="lazy"
                title="Event Venue Location"
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
