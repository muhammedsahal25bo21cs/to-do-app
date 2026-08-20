'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { User, ShieldCheck, Mail, BookOpen, LogOut } from 'lucide-react';

export default function JudgeProfilePage() {
  const router = useRouter();
  const { adminProfile, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.push('/judge/login');
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-emerald-950/80 border border-emerald-800 p-5 rounded-3xl backdrop-blur-xl flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-emerald-100 flex items-center gap-2">
            <User className="w-5 h-5 text-amber-400" />
            <span>Judge Profile & Credentials</span>
          </h1>
          <p className="text-xs text-emerald-300/80 mt-1">
            Active judge identity and category scope details.
          </p>
        </div>
      </div>

      {/* Profile Card */}
      <div className="bg-emerald-950/90 border border-emerald-800 p-6 rounded-3xl shadow-xl space-y-4">
        <div className="flex items-center gap-4 border-b border-emerald-800/80 pb-4">
          <div className="w-14 h-14 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 font-black text-xl flex items-center justify-center">
            {adminProfile?.name_en ? adminProfile.name_en.charAt(0) : 'J'}
          </div>

          <div>
            <h2 className="text-lg font-black text-emerald-100">{adminProfile?.name_en || 'Event Judge'}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-extrabold uppercase">
                {adminProfile?.role || 'Score Manager'}
              </span>
              <span className="text-xs font-mono text-emerald-300/80">
                {adminProfile?.email || 'judge@miladfest.com'}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between text-emerald-300">
            <span className="font-extrabold">Assigned Programme Scope:</span>
            <span className="text-amber-400 font-mono">
              {adminProfile?.assigned_programme_ids?.length || 'All Assigned'} Programmes
            </span>
          </div>
          <div className="flex items-center justify-between text-emerald-300">
            <span className="font-extrabold">Session Security Status:</span>
            <span className="text-emerald-300 font-bold">Authenticated & Encrypted</span>
          </div>
        </div>

        <div className="pt-4 border-t border-emerald-800/80">
          <button
            onClick={handleLogout}
            className="w-full py-3 rounded-2xl bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 font-black text-xs transition-all flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out of Judge Desk</span>
          </button>
        </div>

      </div>

    </div>
  );
}
