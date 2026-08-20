'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { getSiteSettings, SiteSettings } from '@/lib/cmsService';
import { ShareModal } from '@/components/ShareModal';
import { Calendar, MapPin, Clock, ArrowRight, Trophy, Share2, QrCode } from 'lucide-react';

export const HeroSection: React.FC = () => {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);

  useEffect(() => {
    getSiteSettings().then(setSettings);
  }, []);

  const eventUrl = typeof window !== 'undefined' ? window.location.origin : 'https://miladfest.com';

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-emerald-950 via-emerald-900 to-emerald-950 text-emerald-100 py-16 sm:py-24 border-b border-emerald-800/40">
      {/* Subtle Background Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-8">
        
        {/* Top Fest Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold uppercase tracking-wider">
          <Trophy className="w-4 h-4 text-amber-400" />
          <span>{settings?.event_subtitle_en || 'Annual Cultural & Academic Fest 2K26'}</span>
        </div>

        {/* Main Event Title */}
        <div className="space-y-3 max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-gold-gradient tracking-tight leading-none">
            {settings?.event_name_en || 'Milad Fest 2K26'}
          </h1>
          <p className="text-sm sm:text-lg text-emerald-200/90 max-w-2xl mx-auto font-medium leading-relaxed">
            {settings?.description_en || 'Welcome to the official event portal. Explore programmes, competitor rankings, and official result posters.'}
          </p>
        </div>

        {/* Quick Info Badges */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-bold text-emerald-300 pt-2">
          <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-900/60 border border-emerald-800/80 shadow-md">
            <Calendar className="w-4 h-4 text-amber-400" />
            <span>{settings?.event_date || 'August 29, 2026'}</span>
          </div>

          <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-900/60 border border-emerald-800/80 shadow-md">
            <Clock className="w-4 h-4 text-amber-400" />
            <span>{settings?.event_time || '09:00 AM onwards'}</span>
          </div>

          <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-900/60 border border-emerald-800/80 shadow-md">
            <MapPin className="w-4 h-4 text-amber-400" />
            <span>{settings?.venue_en || 'Main Auditorium'}</span>
          </div>
        </div>

        {/* Action CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <Link
            href="/results"
            className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-emerald-950 font-extrabold text-xs shadow-xl shadow-amber-500/20 transition-all hover:scale-105"
          >
            <span>View Official Results</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/programs"
            className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-emerald-900/80 hover:bg-emerald-800 text-emerald-100 font-bold text-xs border border-emerald-700 transition-all"
          >
            <span>Explore Programmes</span>
          </Link>

          <button
            onClick={() => setShareModalOpen(true)}
            className="flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-emerald-900/60 hover:bg-emerald-800 text-amber-300 font-bold text-xs border border-emerald-700 transition-all"
            title="Share Event & Generate QR Code"
          >
            <Share2 className="w-4 h-4" />
            <span>Share Event</span>
          </button>
        </div>

      </div>

      {/* Share Modal */}
      <ShareModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        title={settings?.event_name_en || 'Milad Fest 2K26'}
        subtitle="Official Event Portal"
        urlParams={{ type: 'event' }}
        filename="milad-fest-event-qr"
      />
    </section>
  );
};
