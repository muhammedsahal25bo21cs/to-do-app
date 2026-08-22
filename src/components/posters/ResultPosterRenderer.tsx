'use client';

import React from 'react';
import { ProgrammeResult, SiteSettings } from '@/lib/cmsService';
import { Sparkles, Trophy, Star, Moon, Calendar, MapPin, Award } from 'lucide-react';

export type PosterTemplateType =
  | 'madinah-premium'
  | 'royal-islamic'
  | 'modern-islamic'
  | 'masjid-night'
  | 'traditional-nabidinam'
  | 'classic-islamic'
  | 'royal-gold';

interface ResultPosterRendererProps {
  settings?: SiteSettings;
  programmeTitle: string;
  categoryName: string;
  gender?: string;
  venue?: string;
  eventDate?: string;
  results: ProgrammeResult[];
  template?: PosterTemplateType;
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
  template = 'madinah-premium',
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
    venue_en: 'Al Ihsan Sunni Madrassa, Karingari'
  };

  const visibleResults = results.slice(0, displayPositionsCount);
  const displayVenue = venue || activeSettings.venue_en;
  const displayDate = eventDate || activeSettings.event_date;

  const currentPublicUrl = qrUrl || (typeof window !== 'undefined' ? window.location.href : 'https://miladfest.com');
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(currentPublicUrl)}`;

  const isStoryFormat = aspectRatio === '9:16';

  // Normalize fallback templates
  let activeTemplate: PosterTemplateType = template;
  if ((template as string) === 'classic-islamic' || (template as string) === 'royal-gold') {
    activeTemplate = 'madinah-premium';
  }

  // Render Template 1: Madinah Premium
  if (activeTemplate === 'madinah-premium') {
    return (
      <div 
        id="result-poster-element"
        className={`w-full mx-auto bg-gradient-to-b from-[#022016] via-[#064e3b] to-[#022016] text-amber-50 rounded-3xl shadow-2xl border-[6px] border-amber-400/90 relative overflow-hidden flex flex-col justify-between select-none ${
          isStoryFormat ? 'max-w-md aspect-[9/16] p-6 sm:p-8' : 'max-w-lg aspect-[4/5] p-6 sm:p-8'
        }`}
      >
        {/* Background Islamic Pattern */}
        <div 
          className="absolute inset-0 opacity-15 pointer-events-none bg-repeat" 
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23fbbf24' fill-opacity='0.4' fill-rule='evenodd'%3E%3Cpath d='M40 40L0 0h80L40 40zM40 40L0 80h80L40 40z'/%3E%3C/g%3E%3C/svg%3E")`
          }} 
        />
        
        {/* Decorative Gold Filigree Frame */}
        <div className="absolute inset-2 border-2 border-amber-400/50 rounded-2xl pointer-events-none" />
        <div className="absolute inset-3.5 border border-amber-300/30 rounded-xl pointer-events-none" />

        {/* Top Header */}
        <div className="text-center space-y-1.5 z-10 pt-1">
          <p className="text-xs sm:text-sm font-serif text-amber-300 font-bold tracking-widest">
            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
          </p>

          <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-emerald-950/80 border border-amber-400/50">
            <Moon className="w-3.5 h-3.5 text-amber-400 fill-amber-400/40" />
            <span className="text-[11px] font-black tracking-wider text-amber-300 uppercase">
              {activeSettings.event_name_en}
            </span>
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400/40" />
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200 uppercase tracking-tight drop-shadow">
            {posterTitle}
          </h2>

          <div className="inline-flex flex-wrap items-center justify-center gap-2 px-4 py-1 rounded-full bg-amber-500/20 border border-amber-400/60 shadow-inner">
            <span className="text-xs font-black text-amber-200">{programmeTitle}</span>
            <span className="text-amber-400">•</span>
            <span className="text-xs font-bold text-amber-100">{categoryName}</span>
            {gender && (
              <>
                <span className="text-amber-400">•</span>
                <span className="text-[11px] font-bold text-amber-300 uppercase">{gender}</span>
              </>
            )}
          </div>
        </div>

        {/* Winners Section (STRICT ZERO MARKS/POINTS) */}
        <div className="space-y-3 my-3 z-10 flex-1 flex flex-col justify-center">
          {visibleResults.map((r) => {
            const isRank1 = r.rank === 1;
            const isRank2 = r.rank === 2;
            const isRank3 = r.rank === 3;

            return (
              <div
                key={r.id || r.rank}
                className={`p-3.5 sm:p-4 rounded-2xl border flex items-center justify-between gap-3 shadow-lg ${
                  isRank1
                    ? 'bg-gradient-to-r from-amber-500/30 via-amber-400/20 to-amber-500/30 border-amber-300 shadow-amber-500/20'
                    : isRank2
                    ? 'bg-slate-300/15 border-slate-300/60'
                    : isRank3
                    ? 'bg-amber-900/30 border-amber-600/60'
                    : 'bg-emerald-950/60 border-emerald-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-base shrink-0 shadow-md ${
                      isRank1
                        ? 'bg-gradient-to-br from-amber-300 to-amber-500 text-emerald-950 border border-amber-200'
                        : isRank2
                        ? 'bg-gradient-to-br from-slate-100 to-slate-300 text-emerald-950 border border-slate-100'
                        : isRank3
                        ? 'bg-gradient-to-br from-amber-700 to-amber-900 text-amber-100 border border-amber-600'
                        : 'bg-emerald-900 text-emerald-300 border border-emerald-700'
                    }`}
                  >
                    {isRank1 ? '🥇' : isRank2 ? '🥈' : isRank3 ? '🥉' : `#${r.rank}`}
                  </div>

                  <div>
                    <h3 className="text-sm sm:text-base font-black text-amber-100 leading-snug">
                      {r.student_name_en || r.team_name_en || 'Participant Winner'}
                    </h3>
                    <p className="text-[11px] font-bold text-amber-300/90">
                      {r.team_name_en || 'Independent'}
                    </p>
                  </div>
                </div>

                <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-300 bg-amber-500/20 px-3 py-1 rounded-full border border-amber-400/50 shrink-0">
                  {r.rank === 1 ? '1st Place' : r.rank === 2 ? '2nd Place' : r.rank === 3 ? '3rd Place' : `Rank #${r.rank}`}
                </span>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="border-t border-amber-400/40 pt-3 flex items-center justify-between gap-3 z-10">
          <div className="space-y-1 text-left flex-1">
            <p className="text-xs font-black text-amber-300">
              {customFooterText || activeSettings.organizer_name_en}
            </p>
            <div className="flex flex-wrap items-center gap-3 text-[9px] text-amber-200/80 font-mono">
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
            <div className="bg-white p-1.5 rounded-xl shadow-lg border border-amber-400/60 shrink-0 flex flex-col items-center">
              <img src={qrImageUrl} alt="QR Verification" className="w-10 h-10 object-contain" />
              <span className="text-[7px] font-black text-emerald-950 uppercase mt-0.5">Verify Result</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Render Template 2: Royal Islamic
  if (activeTemplate === 'royal-islamic') {
    return (
      <div 
        id="result-poster-element"
        className={`w-full mx-auto bg-gradient-to-br from-[#01140e] via-[#064e3b] to-[#02261b] text-amber-50 rounded-3xl shadow-2xl border-[6px] border-amber-500 relative overflow-hidden flex flex-col justify-between select-none ${
          isStoryFormat ? 'max-w-md aspect-[9/16] p-6 sm:p-8' : 'max-w-lg aspect-[4/5] p-6 sm:p-8'
        }`}
      >
        <div className="absolute inset-2 border-2 border-amber-400/70 rounded-2xl pointer-events-none" />
        <div className="absolute top-4 left-4 right-4 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent" />

        <div className="text-center space-y-2 z-10">
          <span className="text-xs font-serif text-amber-300 font-black tracking-widest">
            ﷽
          </span>
          <p className="text-[10px] font-extrabold uppercase tracking-widest text-amber-300/90">
            {activeSettings.event_name_en}
          </p>
          <h2 className="text-2xl font-black text-amber-300 uppercase tracking-tight drop-shadow-md">
            {posterTitle}
          </h2>
          <div className="inline-block px-4 py-1 rounded-full bg-emerald-950 border border-amber-400/60 text-xs font-extrabold text-amber-200">
            {programmeTitle} • {categoryName} {gender ? `(${gender})` : ''}
          </div>
        </div>

        <div className="space-y-3.5 my-4 z-10 flex-1 flex flex-col justify-center">
          {visibleResults.map((r) => (
            <div 
              key={r.id || r.rank} 
              className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/90 via-emerald-900/80 to-emerald-950/90 border border-amber-400/50 flex items-center justify-between shadow-xl"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-300 to-amber-600 text-emerald-950 font-black flex items-center justify-center shadow">
                  {r.rank === 1 ? '1st' : r.rank === 2 ? '2nd' : r.rank === 3 ? '3rd' : `#${r.rank}`}
                </div>
                <div>
                  <h3 className="text-base font-black text-amber-100">{r.student_name_en || r.team_name_en}</h3>
                  <p className="text-xs text-amber-300/80">{r.team_name_en || 'Independent'}</p>
                </div>
              </div>
              <span className="text-xs font-bold text-amber-400 bg-amber-500/20 px-3 py-1 rounded-full border border-amber-400/40">
                {r.rank === 1 ? 'WINNER' : r.rank === 2 ? 'RUNNER UP' : '3RD PLACE'}
              </span>
            </div>
          ))}
        </div>

        <div className="border-t border-amber-400/40 pt-3 flex items-center justify-between z-10 text-xs text-amber-200">
          <div>
            <p className="font-bold text-amber-300">{customFooterText || activeSettings.organizer_name_en}</p>
            <p className="text-[10px] text-emerald-200/80">{displayDate} • {displayVenue}</p>
          </div>
          {showQRCode && (
            <div className="bg-white p-1 rounded-lg">
              <img src={qrImageUrl} alt="QR" className="w-9 h-9" />
            </div>
          )}
        </div>
      </div>
    );
  }

  // Render Template 3: Modern Islamic
  if (activeTemplate === 'modern-islamic') {
    return (
      <div 
        id="result-poster-element"
        className={`w-full mx-auto bg-[#fdfbf7] text-emerald-950 rounded-3xl shadow-2xl border-[6px] border-emerald-800 relative overflow-hidden flex flex-col justify-between select-none ${
          isStoryFormat ? 'max-w-md aspect-[9/16] p-6 sm:p-8' : 'max-w-lg aspect-[4/5] p-6 sm:p-8'
        }`}
      >
        <div className="text-center space-y-1.5 z-10">
          <p className="text-xs font-serif text-amber-600 font-bold">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</p>
          <span className="text-[10px] font-black uppercase text-emerald-800 tracking-widest">{activeSettings.event_name_en}</span>
          <h2 className="text-2xl font-black text-emerald-900 uppercase tracking-tight">{posterTitle}</h2>
          <div className="inline-block px-4 py-1 rounded-full bg-emerald-900 text-amber-300 text-xs font-black">
            {programmeTitle} — {categoryName} {gender ? `(${gender})` : ''}
          </div>
        </div>

        <div className="space-y-3 my-4 z-10 flex-1 flex flex-col justify-center">
          {visibleResults.map((r) => (
            <div key={r.id || r.rank} className="p-3.5 rounded-2xl bg-white border border-emerald-200 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-800 text-amber-300 font-black text-sm flex items-center justify-center">
                  {r.rank}
                </div>
                <div>
                  <h3 className="text-sm font-black text-emerald-950">{r.student_name_en || r.team_name_en}</h3>
                  <p className="text-xs font-bold text-amber-700">{r.team_name_en || 'Independent'}</p>
                </div>
              </div>
              <span className="text-xs font-black text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                {r.rank === 1 ? '1st Place' : r.rank === 2 ? '2nd Place' : '3rd Place'}
              </span>
            </div>
          ))}
        </div>

        <div className="border-t border-emerald-200 pt-3 flex items-center justify-between text-xs z-10">
          <div>
            <p className="font-black text-emerald-900">{customFooterText || activeSettings.organizer_name_en}</p>
            <p className="text-[10px] text-emerald-700 font-medium">{displayDate} • {displayVenue}</p>
          </div>
          {showQRCode && (
            <div className="bg-white p-1 rounded-lg border border-emerald-300">
              <img src={qrImageUrl} alt="QR" className="w-9 h-9" />
            </div>
          )}
        </div>
      </div>
    );
  }

  // Render Template 4: Masjid Night
  if (activeTemplate === 'masjid-night') {
    return (
      <div 
        id="result-poster-element"
        className={`w-full mx-auto bg-gradient-to-b from-[#031326] via-[#0a2e45] to-[#020b14] text-cyan-50 rounded-3xl shadow-2xl border-[6px] border-amber-400 relative overflow-hidden flex flex-col justify-between select-none ${
          isStoryFormat ? 'max-w-md aspect-[9/16] p-6 sm:p-8' : 'max-w-lg aspect-[4/5] p-6 sm:p-8'
        }`}
      >
        <div className="text-center space-y-1.5 z-10">
          <p className="text-xs font-serif text-amber-300 font-bold">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</p>
          <div className="flex items-center justify-center gap-1.5">
            <Moon className="w-4 h-4 text-amber-300 fill-amber-300" />
            <span className="text-xs font-black uppercase text-amber-300 tracking-widest">{activeSettings.event_name_en}</span>
          </div>
          <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200 uppercase">{posterTitle}</h2>
          <div className="inline-block px-4 py-1 rounded-full bg-cyan-950 border border-amber-400/60 text-xs font-black text-amber-200">
            {programmeTitle} • {categoryName} {gender ? `(${gender})` : ''}
          </div>
        </div>

        <div className="space-y-3 my-4 z-10 flex-1 flex flex-col justify-center">
          {visibleResults.map((r) => (
            <div key={r.id || r.rank} className="p-3.5 rounded-2xl bg-cyan-950/80 border border-amber-400/50 flex items-center justify-between shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-400 text-cyan-950 font-black text-base flex items-center justify-center">
                  {r.rank === 1 ? '🥇' : r.rank === 2 ? '🥈' : '🥉'}
                </div>
                <div>
                  <h3 className="text-sm font-black text-cyan-100">{r.student_name_en || r.team_name_en}</h3>
                  <p className="text-xs font-bold text-amber-300">{r.team_name_en || 'Independent'}</p>
                </div>
              </div>
              <span className="text-xs font-black text-amber-300 bg-amber-500/20 px-3 py-1 rounded-full border border-amber-400/40">
                {r.rank === 1 ? 'First' : r.rank === 2 ? 'Second' : 'Third'}
              </span>
            </div>
          ))}
        </div>

        <div className="border-t border-amber-400/40 pt-3 flex items-center justify-between text-xs z-10">
          <div>
            <p className="font-bold text-amber-300">{customFooterText || activeSettings.organizer_name_en}</p>
            <p className="text-[10px] text-cyan-200/80">{displayDate} • {displayVenue}</p>
          </div>
          {showQRCode && (
            <div className="bg-white p-1 rounded-lg">
              <img src={qrImageUrl} alt="QR" className="w-9 h-9" />
            </div>
          )}
        </div>
      </div>
    );
  }

  // Render Template 5: Traditional Nabidinam
  return (
    <div 
      id="result-poster-element"
      className={`w-full mx-auto bg-gradient-to-b from-[#0a3a2a] via-[#14532d] to-[#0a3a2a] text-amber-50 rounded-3xl shadow-2xl border-[6px] border-amber-400 relative overflow-hidden flex flex-col justify-between select-none ${
        isStoryFormat ? 'max-w-md aspect-[9/16] p-6 sm:p-8' : 'max-w-lg aspect-[4/5] p-6 sm:p-8'
      }`}
    >
      <div className="text-center space-y-1.5 z-10">
        <p className="text-sm font-serif text-amber-300 font-black">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</p>
        <span className="text-xs font-black uppercase text-amber-300 tracking-widest">{activeSettings.event_name_en}</span>
        <h2 className="text-2xl font-black text-amber-300 uppercase">{posterTitle}</h2>
        <div className="inline-block px-4 py-1 rounded-full bg-emerald-950 border border-amber-400 text-xs font-black text-amber-200">
          {programmeTitle} — {categoryName} {gender ? `(${gender})` : ''}
        </div>
      </div>

      <div className="space-y-3 my-4 z-10 flex-1 flex flex-col justify-center">
        {visibleResults.map((r) => (
          <div key={r.id || r.rank} className="p-3.5 rounded-2xl bg-emerald-950/90 border border-amber-400/60 flex items-center justify-between shadow-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-400 text-emerald-950 font-black text-base flex items-center justify-center">
                {r.rank}
              </div>
              <div>
                <h3 className="text-sm font-black text-amber-100">{r.student_name_en || r.team_name_en}</h3>
                <p className="text-xs text-amber-300">{r.team_name_en || 'Independent'}</p>
              </div>
            </div>
            <span className="text-xs font-black text-amber-300 bg-amber-500/20 px-3 py-1 rounded-full border border-amber-400/50">
              {r.rank === 1 ? '1st Place' : r.rank === 2 ? '2nd Place' : '3rd Place'}
            </span>
          </div>
        ))}
      </div>

      <div className="border-t border-amber-400/40 pt-3 flex items-center justify-between text-xs z-10">
        <div>
          <p className="font-bold text-amber-300">{customFooterText || activeSettings.organizer_name_en}</p>
          <p className="text-[10px] text-amber-200/80">{displayDate} • {displayVenue}</p>
        </div>
        {showQRCode && (
          <div className="bg-white p-1 rounded-lg">
            <img src={qrImageUrl} alt="QR" className="w-9 h-9" />
          </div>
        )}
      </div>
    </div>
  );
}
