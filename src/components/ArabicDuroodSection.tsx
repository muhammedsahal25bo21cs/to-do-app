'use client';

import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { TRANSLATIONS } from '@/data/translations';
import { Sparkles, Heart } from 'lucide-react';

export const ArabicDuroodSection: React.FC = () => {
  const { language } = useLanguage();
  const t = TRANSLATIONS[language];

  return (
    <section className="max-w-5xl mx-auto px-4 my-16">
      <div className="glass-card-gold rounded-3xl p-8 sm:p-12 relative overflow-hidden text-center border-2 border-amber-500/40 shadow-2xl space-y-8">
        
        {/* Background Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/20 border border-amber-400/50 text-amber-300 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>{t.arabicBadge}</span>
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
        </div>

        {/* Main Arabic Verses Display */}
        <div className="space-y-6 relative z-10">
          
          {/* Verse 1 */}
          <div className="p-6 rounded-2xl bg-emerald-950/80 border border-amber-500/30 shadow-inner space-y-3">
            <p className="font-amiri text-2xl sm:text-4xl text-amber-300 font-bold leading-relaxed tracking-wider drop-shadow-md">
              {t.arabicVerse1}
            </p>
            <p className="text-xs sm:text-sm text-emerald-200/80 font-light italic">
              {t.arabicTrans1}
            </p>
          </div>

          {/* Verse 2 */}
          <div className="p-5 rounded-2xl bg-emerald-950/80 border border-amber-500/30 shadow-inner space-y-2">
            <p className="font-amiri text-xl sm:text-3xl text-amber-300 font-bold leading-relaxed tracking-wider">
              {t.arabicVerse2}
            </p>
            <p className="text-xs text-emerald-200/80 font-light italic">
              {t.arabicTrans2}
            </p>
          </div>

          {/* Verse 3 */}
          <div className="p-5 rounded-2xl bg-emerald-950/80 border border-amber-500/30 shadow-inner space-y-2">
            <p className="font-amiri text-lg sm:text-2xl text-amber-300 font-bold leading-relaxed tracking-wider">
              {t.arabicVerse3}
            </p>
            <p className="text-xs text-emerald-200/80 font-light italic">
              {t.arabicTrans3}
            </p>
          </div>

        </div>

      </div>
    </section>
  );
};
