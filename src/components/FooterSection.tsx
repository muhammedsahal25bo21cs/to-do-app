'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { getSiteSettings, SiteSettings } from '@/lib/cmsService';
import { Phone, Mail, Globe, ShieldCheck } from 'lucide-react';

export const FooterSection: React.FC = () => {
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  useEffect(() => {
    getSiteSettings().then(setSettings);
  }, []);

  return (
    <footer className="bg-emerald-950 border-t border-emerald-800/60 text-emerald-300 text-xs py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-emerald-800/40 pb-6">
          <div>
            <h3 className="text-lg font-black text-amber-300">
              {settings?.event_name_en || 'Milad Fest 2K26'}
            </h3>
            <p className="text-xs text-emerald-400/80 mt-0.5">
              {settings?.event_subtitle_en || 'Annual Cultural & Academic Fest'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs font-semibold">
            <Link href="/" className="hover:text-amber-300">Home</Link>
            <Link href="/programs" className="hover:text-amber-300">Programmes</Link>
            <Link href="/results" className="hover:text-amber-300">Results</Link>
            <Link href="/leaderboard" className="hover:text-amber-300">Leaderboard</Link>
            <Link href="/announcements" className="hover:text-amber-300">Announcements</Link>
            <Link href="/gallery" className="hover:text-amber-300">Gallery</Link>
            <Link href="/verify" className="hover:text-amber-300 text-amber-400">Verify Certificate</Link>
            <Link href="/admin" className="hover:text-amber-300 flex items-center gap-1 text-amber-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin Control</span>
            </Link>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-emerald-400/60">
          <p>© 2026 {settings?.event_name_en || 'Milad Fest'}. All rights reserved.</p>
          <p>Official Event Management Platform</p>
        </div>
      </div>
    </footer>
  );
};
