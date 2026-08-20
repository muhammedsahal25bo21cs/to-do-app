'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Moon, Wrench, Sparkles, Clock } from 'lucide-react';

export function MaintenanceOverlay({ message }: { message?: string }) {
  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-b from-emerald-950 via-emerald-900 to-emerald-950 text-emerald-100 flex flex-col justify-between p-6">
      <div className="max-w-2xl mx-auto w-full my-auto text-center space-y-8 bg-emerald-950/90 border-2 border-amber-500/60 p-8 sm:p-12 rounded-3xl shadow-2xl backdrop-blur-2xl relative overflow-hidden">
        
        {/* Ambient Glow Accent */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Crescent Bismillah Icon */}
        <div className="w-20 h-20 rounded-3xl bg-amber-500/10 border-2 border-amber-500/40 flex items-center justify-center mx-auto text-amber-400 shadow-xl">
          <Wrench className="w-10 h-10 animate-bounce" />
        </div>

        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold uppercase tracking-widest">
            <Moon className="w-4 h-4 text-amber-400" />
            <span>Official Event Maintenance</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-amber-400 font-serif drop-shadow-md">
            Website Temporarily Unavailable
          </h1>

          <p className="text-xs sm:text-sm text-emerald-200/90 max-w-md mx-auto leading-relaxed">
            {message || 'The Milad Fest portal is currently undergoing scheduled event configuration maintenance. Please check back shortly.'}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-900/60 border border-emerald-800 text-xs text-emerald-300 flex items-center justify-center gap-2 max-w-md mx-auto font-semibold">
          <Clock className="w-4 h-4 text-amber-400 shrink-0" />
          <span>System updates are applied live in real-time.</span>
        </div>

        <div className="pt-4 border-t border-emerald-800/60 flex items-center justify-center gap-4 text-xs">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-emerald-900 hover:bg-emerald-800 text-amber-300 border border-emerald-700 font-extrabold transition-all"
          >
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>Admin Control Panel</span>
          </Link>
        </div>
      </div>

      <div className="text-center text-[11px] text-emerald-400/60 font-medium">
        © 2026 Milad Fest. Official Event Management System.
      </div>
    </div>
  );
}
