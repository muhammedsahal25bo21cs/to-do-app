'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { HeaderNav } from '@/components/HeaderNav';
import { FooterSection } from '@/components/FooterSection';
import { getAnnouncements, getSiteSettings, Announcement, SiteSettings } from '@/lib/cmsService';
import { Megaphone, Calendar, ArrowRight, Sparkles, Flame, AlertCircle } from 'lucide-react';

export default function AnnouncementsPublicPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    const [ann, stg] = await Promise.all([
      getAnnouncements(true),
      getSiteSettings(),
    ]);
    setAnnouncements(ann);
    setSettings(stg);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-emerald-950 text-emerald-100 flex flex-col justify-between">
      <HeaderNav />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-16 space-y-10 w-full flex-grow">
        {/* Header Hero Section */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-black uppercase tracking-widest">
            <Megaphone className="w-4 h-4" />
            <span>Official Event Notices</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-gold-gradient tracking-tight">
            Announcements & Live Updates
          </h1>
          <p className="text-xs sm:text-sm text-emerald-300/80 leading-relaxed">
            Stay informed with live news, schedule changes, venue alerts, and result announcements for {settings?.event_name_en || 'Milad Fest 2K26'}.
          </p>
        </div>

        {/* Announcements List / Cards */}
        {isLoading ? (
          <div className="text-center py-16 text-emerald-400/60 font-semibold text-xs">
            Loading announcements...
          </div>
        ) : announcements.length === 0 ? (
          <div className="bg-emerald-900/30 border border-emerald-800 rounded-3xl p-12 text-center text-emerald-400/60 max-w-md mx-auto space-y-3">
            <Megaphone className="w-12 h-12 text-emerald-700 mx-auto" />
            <h3 className="text-base font-bold text-emerald-200">No Announcements Published Yet</h3>
            <p className="text-xs">Check back soon for official updates and live event notices.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {announcements.map((ann) => {
              const isUrgent = ann.priority === 'Urgent';
              const isImportant = ann.priority === 'Important' || ann.is_important;

              return (
                <div
                  key={ann.id}
                  className={`bg-emerald-900/40 border rounded-3xl p-6 shadow-xl flex flex-col justify-between space-y-4 hover:border-amber-500/50 transition-all ${
                    isUrgent ? 'border-red-500/80 bg-red-950/20' : isImportant ? 'border-amber-500/80 bg-amber-950/10' : 'border-emerald-800/80'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {isUrgent && (
                          <span className="px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-300 text-[10px] font-black border border-red-500/40 flex items-center gap-1">
                            <Flame className="w-3 h-3 text-red-400" />
                            <span>Urgent Alert</span>
                          </span>
                        )}
                        {isImportant && !isUrgent && (
                          <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/40 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3 text-amber-400" />
                            <span>Important</span>
                          </span>
                        )}
                        {ann.is_featured && (
                          <span className="px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 text-[10px] font-bold border border-sky-500/40 flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-sky-400" />
                            <span>Featured</span>
                          </span>
                        )}
                      </div>

                      <span className="text-[10px] font-mono text-emerald-400/70 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{ann.start_date || 'Today'}</span>
                      </span>
                    </div>

                    <h2 className="text-lg font-black text-emerald-100 leading-snug">
                      {ann.title_en}
                    </h2>

                    {ann.short_description_en && (
                      <p className="text-xs font-semibold text-amber-300/90">
                        {ann.short_description_en}
                      </p>
                    )}

                    {ann.content_en && (
                      <p className="text-xs text-emerald-300/80 leading-relaxed line-clamp-3">
                        {ann.content_en}
                      </p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-emerald-800/60 flex items-center justify-between">
                    <Link
                      href={`/announcements/${ann.id}`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors"
                    >
                      <span>Read Complete Notice</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <FooterSection />
    </div>
  );
}
