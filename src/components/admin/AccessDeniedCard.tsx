'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { ShieldAlert, ArrowLeft, Home, Lock } from 'lucide-react';

export function AccessDeniedCard({ requiredFeature = 'this feature' }: { requiredFeature?: string }) {
  const { adminRole, adminProfile } = useAuth();

  return (
    <div className="max-w-xl mx-auto py-16 px-4">
      <div className="bg-emerald-950/90 border-2 border-red-500/60 p-8 sm:p-10 rounded-3xl shadow-2xl text-center space-y-6 backdrop-blur-xl">
        <div className="w-16 h-16 rounded-full bg-red-500/20 border border-red-500/40 flex items-center justify-center mx-auto text-red-400">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-red-400">
            Role Permission Restriction ({adminRole})
          </span>

          <h2 className="text-2xl font-black text-red-300 font-serif">
            Access Denied
          </h2>

          <p className="text-xs text-emerald-300/80 leading-relaxed max-w-md mx-auto">
            Your role (<strong className="text-amber-300">{adminRole}</strong>) does not have sufficient permissions to access {requiredFeature}.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-900/40 border border-emerald-800 text-xs text-emerald-300 font-semibold space-y-1">
          <p>Logged in as: <strong className="text-emerald-100">{adminProfile?.email}</strong></p>
          <p className="text-[11px] text-emerald-400/80">Contact a Super Administrator if you require elevated permissions.</p>
        </div>

        <div className="pt-2 flex items-center justify-center gap-3">
          <Link
            href="/admin"
            className="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-emerald-950 text-xs font-black shadow-lg flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            <span>Return to Admin Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
