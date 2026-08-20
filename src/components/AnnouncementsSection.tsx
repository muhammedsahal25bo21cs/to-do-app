'use client';

import React, { useEffect, useState } from 'react';
import { getAnnouncements, Announcement } from '@/lib/cmsService';
import { Megaphone, Calendar, AlertCircle } from 'lucide-react';

export const AnnouncementsSection: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getAnnouncements(true).then((data) => {
      setAnnouncements(data);
      setIsLoading(false);
    });
  }, []);

  if (isLoading || announcements.length === 0) {
    return null; // Automatically hide section if 0 announcements exist
  }

  return (
    <section id="announcements" className="py-12 bg-emerald-950 text-emerald-100 border-b border-emerald-800/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
          <Megaphone className="w-4 h-4" />
          <span>Official Announcements</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {announcements.map((ann) => (
            <div
              key={ann.id}
              className={`p-5 rounded-3xl border shadow-lg space-y-2 ${
                ann.is_important
                  ? 'bg-amber-500/10 border-amber-500/40'
                  : 'bg-emerald-900/40 border-emerald-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-base font-extrabold text-emerald-100">{ann.title_en}</h3>
                {ann.is_important && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500 text-emerald-950 uppercase">
                    Important
                  </span>
                )}
              </div>
              {ann.content_en && <p className="text-xs text-emerald-200/90 leading-relaxed">{ann.content_en}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
