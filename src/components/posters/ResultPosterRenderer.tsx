'use client';

import React from 'react';
import { ProgrammeResult, SiteSettings } from '@/lib/cmsService';
import { Award, Sparkles, Trophy, Star, Moon, QrCode, MapPin, Calendar } from 'lucide-react';

interface ResultPosterRendererProps {
  settings?: SiteSettings;
  programmeTitle: string;
  categoryName: string;
  gender?: string;
  venue?: string;
  eventDate?: string;
  results: ProgrammeResult[];
  template?: 'classic-islamic' | 'royal-gold' | 'minimalist-emerald' | 'modern-islamic';
  aspectRatio?: '4:5' | '9:16';
  posterTitle?: string;
  customFooterText?: string;
  displayPositionsCount?: number;
  specialAwards?: { title: string; winnerName: string }[];
  qrUrl?: string;
  showQRCode?: boolean;
}

export function ResultPosterRenderer({
  settings: initialSettings,
  programmeTitle,
  categoryName,
  gender,
  venue,
  eventDate,
  results,
  template = 'royal-gold',
  aspectRatio = '4:5',
  posterTitle = 'OFFICIAL COMPETITION RESULT',
  customFooterText,
  displayPositionsCount = 3,
  specialAwards = [],
  qrUrl,
  showQRCode = true,
}: ResultPosterRendererProps) {
  const [settings, setSettings] = React.useState<SiteSettings | null>(initialSettings || null);

  React.useEffect(() => {
    if (!initialSettings) {
      import('@/lib/cmsService').then(mod => {
        mod.getSiteSettings().then(setSettings);
      });
    }
  }, [initialSettings]);

  const activeSettings = settings || {
    event_name_en: 'Milad Fest 2K26',
    organizer_name_en: 'Raulathul Madheena Committee',
    event_date: 'August 29, 2026',
    venue_en: 'Main Auditorium'
  };

  const visibleResults = results.slice(0, displayPositionsCount);
  const displayVenue = venue || activeSettings.venue_en;
  const displayDate = eventDate || activeSettings.event_date;

  // Dynamic QR Code URL using public API
  const currentPublicUrl = qrUrl || (typeof window !== 'undefined' ? window.location.href : 'https://miladfest.com');
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(currentPublicUrl)}`;

  const isStoryFormat = aspectRatio === '9:16';

  return (
    <div 
      id="result-poster-element"
      className={`w-full mx-auto bg-gradient-to-b from-[#022c22] via-[#064e3b] to-[#022c22] text-emerald-100 rounded-3xl shadow-2xl border-[6px] border-amber-500/80 relative overflow-hidden flex flex-col justify-between select-none ${
        isStoryFormat ? 'max-w-md aspect-[9/16] p-6 sm:p-8' : 'max-w-lg aspect-[4/5] p-6 sm:p-8'
      }`}
    >
      {/* Background Islamic Geometric Pattern Overlay */}
      <div 
        className="absolute inset-0 opacity-15 pointer-events-none bg-repeat" 
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23f59e0b' fill-opacity='0.5' fill-rule='evenodd'%3E%3Cpath d='M30 30L0 0h60L30 30zM30 30L0 60h60L30 30z'/%3E%3C/g%3E%3C/svg%3E")`
        }} 
      />

      {/* Dual Ornamental Borders */}
      <div className="absolute inset-2 border-2 border-amber-400/40 rounded-2xl pointer-events-none" />
      <div className="absolute inset-3 border border-amber-400/30 rounded-2xl pointer-events-none" />

      {/* Corner Arabesque Flourishes */}
      <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-amber-400/80 rounded-tl-lg pointer-events-none" />
      <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-amber-400/80 rounded-tr-lg pointer-events-none" />
      <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-amber-400/80 rounded-bl-lg pointer-events-none" />
      <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-amber-400/80 rounded-br-lg pointer-events-none" />

      {/* Top Header: Bismillah Calligraphy & Event Identity */}
      <div className="text-center space-y-2 z-10 pt-1">
        <p className="text-xs sm:text-sm font-serif text-amber-300/90 tracking-widest uppercase font-bold">
          بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
        </p>

        <div className="flex items-center justify-center gap-2">
          <Moon className="w-3.5 h-3.5 text-amber-400 fill-amber-400/30" />
          <span className="text-[11px] font-black tracking-widest text-amber-300 uppercase">
            {activeSettings.event_name_en}
          </span>
          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400/30" />
        </div>

        <h2 className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200 uppercase tracking-tight drop-shadow-md">
          {posterTitle}
        </h2>

        {/* Programme & Category Badge Strip */}
        <div className="inline-flex flex-wrap items-center justify-center gap-2 px-4 py-1.5 rounded-full bg-emerald-900/90 border border-amber-400/50 shadow-md">
          <span className="text-xs font-black text-amber-300">{programmeTitle}</span>
          <span className="text-amber-500">•</span>
          <span className="text-xs font-bold text-emerald-100">{categoryName}</span>
          {gender && (
            <>
              <span className="text-amber-500">•</span>
              <span className="text-[11px] font-bold text-amber-300 uppercase">{gender}</span>
            </>
          )}
        </div>
      </div>

      {/* Middle Section: Winners Roster (STRICTLY NO SCORES, MARKS, OR POINTS) */}
      <div className="space-y-3 my-3 z-10 flex-1 flex flex-col justify-center">
        {visibleResults.map((r) => {
          const isRank1 = r.rank === 1;
          const isRank2 = r.rank === 2;
          const isRank3 = r.rank === 3;

          return (
            <div
              key={r.id || r.rank}
              className={`p-3.5 sm:p-4 rounded-2xl border flex items-center justify-between gap-3 transition-all ${
                isRank1
                  ? 'bg-gradient-to-r from-amber-500/25 via-amber-400/20 to-amber-500/25 border-amber-400 shadow-xl shadow-amber-500/10'
                  : isRank2
                  ? 'bg-slate-300/15 border-slate-300/50 shadow-md'
                  : isRank3
                  ? 'bg-amber-800/20 border-amber-600/50 shadow-md'
                  : 'bg-emerald-900/50 border-emerald-800'
              }`}
            >
              <div className="flex items-center gap-3">
                {/* Position Medal Icon */}
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-base shrink-0 shadow-md ${
                    isRank1
                      ? 'bg-amber-400 text-emerald-950 border border-amber-300'
                      : isRank2
                      ? 'bg-slate-200 text-emerald-950 border border-slate-100'
                      : isRank3
                      ? 'bg-amber-700 text-amber-100 border border-amber-600'
                      : 'bg-emerald-900 text-emerald-300 border border-emerald-700'
                  }`}
                >
                  {isRank1 ? '🥇' : isRank2 ? '🥈' : isRank3 ? '🥉' : `#${r.rank}`}
                </div>

                <div>
                  <h3 className="text-sm sm:text-base font-black text-emerald-100 leading-snug">
                    {r.student_name_en || r.team_name_en || 'Participant Winner'}
                  </h3>
                  <p className="text-[11px] font-bold text-amber-300/90">
                    {r.team_name_en || 'Independent'}
                  </p>
                </div>
              </div>

              <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-300 bg-amber-500/20 px-3 py-1 rounded-full border border-amber-400/40 shrink-0">
                {r.rank === 1 ? '1st Winner' : r.rank === 2 ? '2nd Winner' : r.rank === 3 ? '3rd Winner' : `Rank #${r.rank}`}
              </span>
            </div>
          );
        })}

        {/* Special Awards Roster */}
        {specialAwards.map((award, idx) => (
          <div key={idx} className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-xs">
            <span className="font-extrabold text-amber-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>{award.title}</span>
            </span>
            <strong className="text-emerald-100 font-bold">{award.winnerName}</strong>
          </div>
        ))}
      </div>

      {/* Footer Section: Date, Venue, Organizer Info & Embedded Scannable QR Code */}
      <div className="border-t border-amber-500/30 pt-3 flex items-center justify-between gap-3 z-10">
        <div className="space-y-1 text-left flex-1">
          <p className="text-xs font-bold text-amber-300">
            {customFooterText || activeSettings.organizer_name_en || 'Raulathul Madheena Committee'}
          </p>
          
          <div className="flex flex-wrap items-center gap-3 text-[9px] text-emerald-300/80 font-mono">
            <span className="flex items-center gap-1">
              <Calendar className="w-2.5 h-2.5 text-amber-400" />
              <span>{displayDate}</span>
            </span>
            {displayVenue && (
              <span className="flex items-center gap-1">
                <MapPin className="w-2.5 h-2.5 text-amber-400" />
                <span>{displayVenue}</span>
              </span>
            )}
          </div>
        </div>

        {showQRCode && (
          <div className="bg-white p-1.5 rounded-2xl shadow-lg border border-amber-400/50 shrink-0 flex flex-col items-center">
            <img
              src={qrImageUrl}
              alt="Scan QR Result Verification"
              className="w-11 h-11 object-contain rounded-md"
            />
            <span className="text-[7px] font-black text-emerald-950 uppercase tracking-tight mt-0.5">Scan Result</span>
          </div>
        )}
      </div>
    </div>
  );
}
