'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { HeaderNav } from '@/components/HeaderNav';
import { FooterSection } from '@/components/FooterSection';
import { getProgrammeResults, getProgrammes, Programme, ProgrammeResult } from '@/lib/cmsService';
import { Trophy, ArrowLeft, Loader2, Sparkles } from 'lucide-react';

export default function ProgrammeResultDetailPage() {
  const params = useParams();
  const programmeId = params?.id as string;

  const [programme, setProgramme] = useState<Programme | null>(null);
  const [results, setResults] = useState<ProgrammeResult[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (programmeId) {
      loadData();
    }
  }, [programmeId]);

  const loadData = async () => {
    setIsLoading(true);
    const [allPrg, res] = await Promise.all([
      getProgrammes(false),
      getProgrammeResults(programmeId, true),
    ]);
    const found = allPrg.find(p => p.id === programmeId);
    setProgramme(found || null);
    setResults(res);
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-emerald-950 text-emerald-100 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-emerald-950 text-emerald-100 flex flex-col justify-between">
      <div>
        <HeaderNav />

        <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
          <Link
            href="/results"
            className="inline-flex items-center gap-2 text-xs font-bold text-amber-400 hover:underline mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Results</span>
          </Link>

          {/* Programme Header Card */}
          <div className="bg-emerald-950/80 border border-emerald-800/80 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-3 relative overflow-hidden text-center sm:text-left">
            <div className="flex items-center gap-2 text-xs text-amber-400 font-bold uppercase tracking-wider justify-center sm:justify-start">
              <Trophy className="w-4 h-4" />
              <span>Official Result Sheet</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-gold-gradient">
              {programme?.title_en || 'Programme Result'}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs text-emerald-300/80 pt-2 border-t border-emerald-800/40 justify-center sm:justify-start">
              <span>📅 Date: {programme?.event_date || 'August 29, 2026'}</span>
              <span>⏰ Time: {programme?.start_time || '09:00 AM'}</span>
              <span>📍 Venue: {programme?.venue || 'Main Auditorium'}</span>
            </div>
          </div>

          {/* Winner Ranks List (STRICTLY NO SCORES SHOWN) */}
          {results.length === 0 ? (
            <div className="text-center py-12 bg-emerald-950/60 border border-emerald-800/60 rounded-3xl p-8 space-y-2">
              <Trophy className="w-10 h-10 text-emerald-600 mx-auto" />
              <h3 className="text-base font-bold text-emerald-100">Results pending publication</h3>
              <p className="text-xs text-emerald-400/80">The official results for this competition are being verified.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <h2 className="text-base font-bold text-emerald-100 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <span>Winner Positions</span>
              </h2>

              {results.map((res) => {
                const isGold = res.rank === 1;
                const isSilver = res.rank === 2;
                const isBronze = res.rank === 3;

                return (
                  <div
                    key={res.id}
                    className={`p-5 rounded-3xl border flex items-center justify-between gap-4 shadow-xl transition-all ${
                      isGold ? 'bg-amber-500/10 border-amber-500/50 shadow-amber-500/10' :
                      isSilver ? 'bg-slate-500/10 border-slate-400/40' :
                      isBronze ? 'bg-amber-900/10 border-amber-700/40' :
                      'bg-emerald-950/80 border-emerald-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm shrink-0 border ${
                          isGold ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-emerald-950 border-amber-300' :
                          isSilver ? 'bg-gradient-to-br from-slate-300 to-slate-400 text-slate-950 border-slate-200' :
                          isBronze ? 'bg-gradient-to-br from-amber-700 to-amber-900 text-amber-100 border-amber-600' :
                          'bg-emerald-900 text-emerald-200 border-emerald-800'
                        }`}
                      >
                        {isGold ? '🥇' : isSilver ? '🥈' : isBronze ? '🥉' : `#${res.rank}`}
                      </div>

                      <div>
                        <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider block">
                          {isGold ? '1st Place' : isSilver ? '2nd Place' : isBronze ? '3rd Place' : `Rank ${res.rank}`}
                        </span>
                        <h3 className="text-base font-extrabold text-emerald-100">
                          {res.student_name_en}
                        </h3>
                        <p className="text-xs font-semibold text-amber-400">
                          Team: {res.team_name_en}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      <FooterSection />
    </div>
  );
}
