'use client';

import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { TRANSLATIONS } from '@/data/translations';
import { EVENT_DETAILS } from '@/data/eventData';
import { Sparkles, Calendar, MapPin, Bookmark, Bell, Flag, Layers } from 'lucide-react';

export const EventInfoSection: React.FC = () => {
  const { language } = useLanguage();
  const t = TRANSLATIONS[language];

  return (
    <section id="info" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-10">
      
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-semibold">
          <Bookmark className="w-3.5 h-3.5 text-amber-400" />
          <span>{t.infoBadge}</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-extrabold text-gold-gradient tracking-tight">
          {t.infoTitle}
        </h2>
      </div>

      {/* Grid of Icon Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Card 1: Event Name */}
        <div className="glass-card rounded-3xl p-6 border border-emerald-800/50 hover:border-amber-400/60 transition-all duration-300 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300">
            <Flag className="w-6 h-6" />
          </div>
          <p className="text-xs font-bold text-amber-400 uppercase tracking-wider">{t.infoEventName}</p>
          <h3 className="text-xl font-bold text-emerald-100">{t.title}</h3>
          <p className="text-xs text-emerald-300/80">{t.subTitle}</p>
        </div>

        {/* Card 2: Date & Day */}
        <div className="glass-card rounded-3xl p-6 border border-emerald-800/50 hover:border-amber-400/60 transition-all duration-300 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300">
            <Calendar className="w-6 h-6" />
          </div>
          <p className="text-xs font-bold text-amber-400 uppercase tracking-wider">{t.infoDateTitle}</p>
          <h3 className="text-xl font-bold text-emerald-100">{t.dateLabel}</h3>
          <p className="text-xs text-amber-300/80 font-semibold">{t.dateHijri}</p>
        </div>

        {/* Card 3: Venue & Location */}
        <div className="glass-card rounded-3xl p-6 border border-emerald-800/50 hover:border-amber-400/60 transition-all duration-300 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300">
            <MapPin className="w-6 h-6" />
          </div>
          <p className="text-xs font-bold text-amber-400 uppercase tracking-wider">{t.infoVenueTitle}</p>
          <h3 className="text-xl font-bold text-emerald-100">{t.venueLabel}</h3>
          <p className="text-xs text-emerald-300/80">Karingari, Kerala</p>
        </div>

        {/* Card 4: Event Type */}
        <div className="glass-card rounded-3xl p-6 border border-emerald-800/50 hover:border-amber-400/60 transition-all duration-300 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300">
            <Layers className="w-6 h-6" />
          </div>
          <p className="text-xs font-bold text-amber-400 uppercase tracking-wider">{t.infoTypeTitle}</p>
          <h3 className="text-xl font-bold text-emerald-100">{t.infoTypeDesc}</h3>
          <p className="text-xs text-emerald-300/80">Annual Mawlid Celebration</p>
        </div>

        {/* Card 5 & 6 Span: Important Announcements */}
        <div className="md:col-span-2 glass-card-gold rounded-3xl p-6 sm:p-8 border border-amber-500/40 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/30 border border-amber-400/60 flex items-center justify-center text-amber-300">
              <Bell className="w-5 h-5 animate-bounce" />
            </div>
            <h3 className="text-xl font-bold text-gold-gradient">{t.announcementsTitle}</h3>
          </div>

          <ul className="space-y-2.5 text-xs sm:text-sm text-emerald-100/90 font-light">
            <li className="flex items-start gap-2.5 bg-emerald-950/60 p-3 rounded-xl border border-emerald-800/40">
              <span className="text-amber-400 font-bold shrink-0">❖</span>
              <span>{t.announcement1}</span>
            </li>
            <li className="flex items-start gap-2.5 bg-emerald-950/60 p-3 rounded-xl border border-emerald-800/40">
              <span className="text-amber-400 font-bold shrink-0">❖</span>
              <span>{t.announcement2}</span>
            </li>
            <li className="flex items-start gap-2.5 bg-emerald-950/60 p-3 rounded-xl border border-emerald-800/40">
              <span className="text-amber-400 font-bold shrink-0">❖</span>
              <span>{t.announcement3}</span>
            </li>
          </ul>
        </div>

      </div>

    </section>
  );
};
