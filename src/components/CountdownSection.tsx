'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { TRANSLATIONS } from '@/data/translations';
import { getSiteSettings, SiteSettings } from '@/lib/cmsService';
import { Clock, Sparkles, PartyPopper } from 'lucide-react';

export const CountdownSection: React.FC = () => {
  const { language } = useLanguage();
  const t = TRANSLATIONS[language];
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    getSiteSettings().then(setSettings);
  }, []);

  useEffect(() => {
    const targetIso = settings?.countdown_target_iso || '2026-08-29T08:30:00+05:30';
    const targetDate = new Date(targetIso).getTime();

    const updateTimer = () => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference <= 0) {
        setHasStarted(true);
      } else {
        setHasStarted(false);
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000),
        });
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [settings]);

  if (settings && !settings.is_countdown_enabled) return null;

  const timeBlocks = [
    { label: t.days, value: timeLeft.days },
    { label: t.hours, value: timeLeft.hours },
    { label: t.minutes, value: timeLeft.minutes },
    { label: t.seconds, value: timeLeft.seconds },
  ];

  return (
    <div className="w-full max-w-3xl mx-auto my-4">
      <div className="glass-card-gold rounded-3xl p-5 sm:p-8 relative overflow-hidden text-center shadow-2xl border border-amber-500/40">
        
        {/* Subtle background glow */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {!hasStarted ? (
          <>
            {/* Header Title */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs sm:text-sm font-semibold mb-4">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>{t.countdownTitle}</span>
              <Sparkles className="w-4 h-4 text-amber-400" />
            </div>

            {/* Time Blocks */}
            <div className="grid grid-cols-4 gap-3 sm:gap-6 my-1">
              {timeBlocks.map((block, idx) => (
                <div
                  key={idx}
                  className="bg-emerald-950/90 border border-amber-500/30 rounded-2xl p-3 sm:p-5 flex flex-col items-center justify-center shadow-inner relative group hover:border-amber-400 transition-colors"
                >
                  <span className="text-2xl sm:text-4xl md:text-5xl font-black text-gold-gradient font-mono tracking-tight">
                    {String(block.value).padStart(2, '0')}
                  </span>
                  <span className="text-xs font-semibold text-emerald-200/90 mt-1">
                    {block.label}
                  </span>
                </div>
              ))}
            </div>

            <p className="text-xs text-emerald-300/80 mt-3 font-light">
              Target: {settings?.event_date || 'August 29, 2026'} | Asia/Kolkata Timezone
            </p>
          </>
        ) : (
          <div className="py-4 space-y-3">
            <div className="w-14 h-14 mx-auto rounded-full bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-amber-300 shadow-xl">
              <PartyPopper className="w-7 h-7 text-amber-400 animate-bounce" />
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-gold-gradient tracking-tight">
              {t.eventStartedMessage}
            </h2>
            <p className="text-xs sm:text-sm text-emerald-200/90 max-w-lg mx-auto font-medium">
              {t.eventStartedSubtext}
            </p>
          </div>
        )}

      </div>
    </div>
  );
};
