'use client';

import React from 'react';
import Link from 'next/link';
import { HeaderNav } from '@/components/HeaderNav';
import { FooterSection } from '@/components/FooterSection';
import { Lock, ArrowLeft, Home, Calendar } from 'lucide-react';

export function PageUnavailableCard({ pageTitle = 'Page' }: { pageTitle?: string }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-950 via-emerald-900 to-emerald-950 text-emerald-100 flex flex-col justify-between">
      <HeaderNav />

      <main className="flex-1 max-w-xl mx-auto px-4 py-16 w-full flex items-center justify-center">
        <div className="bg-emerald-950/90 border-2 border-amber-500/40 p-8 sm:p-10 rounded-3xl shadow-2xl text-center space-y-6 backdrop-blur-xl w-full">
          <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber-400">Public Access Guard</span>
            <h1 className="text-2xl sm:text-3xl font-black text-amber-300 font-serif">
              {pageTitle} Temporarily Unavailable
            </h1>
            <p className="text-xs text-emerald-300/80 leading-relaxed max-w-md mx-auto">
              This section is currently disabled in event settings by administrators. Please check back later or explore available event schedules.
            </p>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/"
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-emerald-950 text-xs font-black shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
            >
              <Home className="w-4 h-4" />
              <span>Back to Homepage</span>
            </Link>

            <Link
              href="/programs"
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-emerald-900 hover:bg-emerald-800 text-emerald-100 text-xs font-extrabold border border-emerald-700 flex items-center justify-center gap-2"
            >
              <Calendar className="w-4 h-4 text-amber-400" />
              <span>View Programmes</span>
            </Link>
          </div>
        </div>
      </main>

      <FooterSection />
    </div>
  );
}
