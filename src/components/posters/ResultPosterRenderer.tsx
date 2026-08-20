'use client';

import React from 'react';
import { ProgrammeResult, SiteSettings } from '@/lib/cmsService';
import { Award, Sparkles, Trophy, Star, Moon } from 'lucide-react';

interface ResultPosterRendererProps {
  settings?: SiteSettings;
  programmeTitle: string;
  categoryName: string;
  results: ProgrammeResult[];
  template?: 'classic-islamic' | 'royal-gold' | 'minimalist-emerald' | 'modern-islamic';
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
  results,
  template = 'royal-gold',
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
    event_date: 'August 29, 2026'
  };

  const visibleResults = results.slice(0, displayPositionsCount);

  return (
    <div className="w-full max-w-lg mx-auto aspect-[4/5] bg-emerald-950 text-emerald-100 rounded-3xl p-6 sm:p-8 shadow-2xl border-4 border-amber-500/40 relative overflow-hidden flex flex-col justify-between select-none">
      {/* Background Decorative Pattern Overlay */}
      <div 
        className="absolute inset-0 opacity-10 pointer-events-none bg-repeat" 
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23f59e0b' fill-opacity='0.4' fill-rule='evenodd'%3E%3Cpath d='M30 30L0 0h60L30 30zM30 30L0 60h60L30 30z'/%3E%3C/g%3E%3C/svg%3E")`
        }} 
      />

      {/* Template Style Specific Ornaments */}
      {template === 'classic-islamic' && (
        <div className="absolute inset-2 border-2 border-amber-500/30 rounded-2xl pointer-events-none" />
      )}
      {template === 'royal-gold' && (
        <div className="absolute inset-3 border border-amber-400/50 rounded-2xl pointer-events-none shadow-inner" />
      )}
      {template === 'modern-islamic' && (
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-bl-full pointer-events-none" />
      )}

      {/* Poster Top Section: Event Identity */}
      <div className="text-center space-y-2 z-10">
        <div className="flex items-center justify-center gap-2">
          <Moon className="w-4 h-4 text-amber-400" />
          <span className="text-[10px] font-black tracking-widest text-amber-300 uppercase">
            {activeSettings.event_name_en}
          </span>
          <Star className="w-3 h-3 text-amber-400" />
        </div>

        <h2 className="text-xl sm:text-2xl font-black text-gold-gradient tracking-tight uppercase">
          {posterTitle}
        </h2>

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-900/80 border border-emerald-700">
          <span className="text-xs font-black text-amber-300">{programmeTitle}</span>
          <span className="text-emerald-500">•</span>
          <span className="text-xs font-bold text-emerald-200">{categoryName}</span>
        </div>
      </div>

      {/* Poster Middle Section: Winners Roster (STRICTLY NO SCORES) */}
      <div className="space-y-3 my-4 z-10">
        {visibleResults.map((r) => {
          const isRank1 = r.rank === 1;
          const isRank2 = r.rank === 2;
          const isRank3 = r.rank === 3;

          return (
            <div
              key={r.id || r.rank}
              className={`p-3.5 sm:p-4 rounded-2xl border flex items-center justify-between gap-3 transition-all ${
                isRank1
                  ? 'bg-amber-500/20 border-amber-400 shadow-lg shadow-amber-500/10'
                  : isRank2
                  ? 'bg-slate-300/10 border-slate-300/40'
                  : isRank3
                  ? 'bg-amber-700/20 border-amber-600/40'
                  : 'bg-emerald-900/40 border-emerald-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm shrink-0 shadow-md ${
                    isRank1
                      ? 'bg-amber-500 text-emerald-950'
                      : isRank2
                      ? 'bg-slate-200 text-emerald-950'
                      : isRank3
                      ? 'bg-amber-700 text-emerald-100'
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

              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/30">
                {r.rank === 1 ? '1st Winner' : r.rank === 2 ? '2nd Winner' : r.rank === 3 ? '3rd Winner' : `Rank #${r.rank}`}
              </span>
            </div>
          );
        })}

        {/* Optional Special Awards */}
        {specialAwards.map((award, idx) => (
          <div key={idx} className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-xs">
            <span className="font-extrabold text-amber-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{award.title}</span>
            </span>
            <strong className="text-emerald-100 font-bold">{award.winnerName}</strong>
          </div>
        ))}
      </div>

      {/* Poster Bottom Footer */}
      <div className="border-t border-emerald-800/80 pt-3 flex items-center justify-between gap-3 z-10">
        <div className="space-y-0.5 text-left flex-1">
          <p className="text-[11px] font-bold text-emerald-300">
            {customFooterText || activeSettings.organizer_name_en || 'Raulathul Madheena Committee'}
          </p>
          <p className="text-[9px] text-emerald-400/60 uppercase font-mono tracking-widest">
            Official Event Publication • {activeSettings.event_date}
          </p>
        </div>

        {showQRCode && (
          <div className="bg-white p-1 rounded-xl shadow-md shrink-0 flex flex-col items-center">
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(qrUrl || (typeof window !== 'undefined' ? window.location.href : ''))}`}
              alt="Scan QR"
              className="w-10 h-10 object-contain"
            />
            <span className="text-[7px] font-extrabold text-emerald-950 uppercase tracking-tighter">Scan Result</span>
          </div>
        )}
      </div>
    </div>
  );
}
