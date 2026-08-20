'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { getAnnouncements, Announcement } from '@/lib/cmsService';
import { Flame, AlertCircle, ArrowRight } from 'lucide-react';

export function EventUpdatesBanner() {
  const [urgentUpdates, setUrgentUpdates] = useState<Announcement[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const anns = await getAnnouncements(true);
    const urgents = anns.filter((a) => a.priority === 'Urgent' || a.is_important);
    setUrgentUpdates(urgents);
  };

  if (urgentUpdates.length === 0) return null;

  const topUpdate = urgentUpdates[0];

  return (
    <div className="bg-gradient-to-r from-red-950 via-amber-950 to-red-950 border-b border-red-500/40 text-amber-100 py-2.5 px-4 sm:px-6 shadow-lg relative z-20">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 text-xs font-bold">
        <div className="flex items-center gap-2.5 truncate">
          <span className="px-2 py-0.5 rounded-full bg-red-500 text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shrink-0">
            <Flame className="w-3 h-3 text-amber-300" />
            <span>LIVE UPDATE</span>
          </span>

          <span className="truncate text-emerald-100 font-extrabold">
            {topUpdate.title_en}
            {topUpdate.short_description_en && (
              <span className="text-amber-300 font-semibold ml-2">— {topUpdate.short_description_en}</span>
            )}
          </span>
        </div>

        <Link
          href={`/announcements/${topUpdate.id}`}
          className="inline-flex items-center gap-1 text-[11px] font-black text-amber-400 hover:text-amber-300 shrink-0 transition-colors"
        >
          <span>Details</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
