'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { HeaderNav } from '@/components/HeaderNav';
import { FooterSection } from '@/components/FooterSection';
import { getAnnouncements, Announcement, SiteSettings, getSiteSettings } from '@/lib/cmsService';
import { ArrowLeft, Calendar, Megaphone, Flame, AlertCircle, Sparkles } from 'lucide-react';

export default function AnnouncementDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  const loadData = async () => {
    setIsLoading(true);
    const [anns, stg] = await Promise.all([
      getAnnouncements(true),
      getSiteSettings(),
    ]);
    const found = anns.find((a) => a.id === id);
    setAnnouncement(found || null);
    setSettings(stg);
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-emerald-950 text-emerald-100 flex items-center justify-center">
        <span className="text-xs text-amber-400 font-bold">Loading announcement detail...</span>
      </div>
    );
  }

  if (!announcement) {
    return (
      <div className="min-h-screen bg-emerald-950 text-emerald-100 flex flex-col justify-between">
        <HeaderNav />
        <div className="text-center py-20 space-y-4">
          <Megaphone className="w-12 h-12 text-emerald-700 mx-auto" />
          <h1 className="text-xl font-bold text-emerald-200">Announcement Not Found</h1>
          <Link href="/announcements" className="text-xs font-bold text-amber-400 hover:underline">
            Back to Announcements
          </Link>
        </div>
        <FooterSection />
      </div>
    );
  }

  const isUrgent = announcement.priority === 'Urgent';
  const isImportant = announcement.priority === 'Important' || announcement.is_important;

  return (
    <div className="min-h-screen bg-emerald-950 text-emerald-100 flex flex-col justify-between">
      <HeaderNav />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-16 space-y-8 w-full flex-grow">
        <Link
          href="/announcements"
          className="inline-flex items-center gap-2 text-xs font-bold text-amber-400 hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Announcements</span>
        </Link>

        {/* Article Reader Card */}
        <div className={`bg-emerald-900/40 border rounded-3xl p-6 sm:p-10 shadow-2xl space-y-6 ${
          isUrgent ? 'border-red-500/80 bg-red-950/20' : isImportant ? 'border-amber-500/80 bg-amber-950/10' : 'border-emerald-800'
        }`}>
          {/* Header Badges */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-emerald-800/60 pb-4">
            <div className="flex items-center gap-2">
              {isUrgent && (
                <span className="px-3 py-1 rounded-full bg-red-500/20 text-red-300 text-xs font-black border border-red-500/40 flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-red-400" />
                  <span>Urgent Live Alert</span>
                </span>
              )}
              {isImportant && !isUrgent && (
                <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/40 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-amber-400" />
                  <span>Important Notice</span>
                </span>
              )}
              {announcement.is_featured && (
                <span className="px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 text-xs font-bold border border-sky-500/40 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-sky-400" />
                  <span>Featured Banner</span>
                </span>
              )}
            </div>

            <span className="text-xs font-mono text-emerald-400/80 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-amber-400" />
              <span>Published: {announcement.start_date || 'Today'}</span>
            </span>
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-4xl font-black text-emerald-100 leading-tight">
            {announcement.title_en}
          </h1>

          {announcement.short_description_en && (
            <p className="text-sm font-bold text-amber-300 border-l-4 border-amber-400 pl-4 py-1">
              {announcement.short_description_en}
            </p>
          )}

          {/* Content Body */}
          <div className="text-sm text-emerald-200/90 leading-relaxed whitespace-pre-line space-y-4 pt-2">
            {announcement.content_en}
          </div>

          {/* Footer Metadata */}
          <div className="pt-6 border-t border-emerald-800/60 text-xs text-emerald-400/70 flex items-center justify-between">
            <span>Official Event Publication</span>
            <span className="font-bold text-amber-400">{settings?.event_name_en || 'Milad Fest 2K26'}</span>
          </div>
        </div>
      </main>

      <FooterSection />
    </div>
  );
}
