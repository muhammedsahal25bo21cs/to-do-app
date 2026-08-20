'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { 
  getProgrammes, 
  getCategories, 
  getProgrammeRegistrations, 
  getProgrammeScores,
  Programme, 
  Category 
} from '@/lib/cmsService';
import { 
  LayoutDashboard, 
  BookOpen, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  ArrowRight,
  Gavel,
  ShieldCheck
} from 'lucide-react';

export default function JudgeDashboardPage() {
  const { canManageProgramme, adminProfile } = useAuth();

  const [assignedProgrammes, setAssignedProgrammes] = useState<Programme[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [programmeStats, setProgrammeStats] = useState<Record<string, { total: number; entered: number; verified: number }>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const [prgs, cats] = await Promise.all([
        getProgrammes(false, false),
        getCategories(true),
      ]);

      const allowed = prgs.filter(p => canManageProgramme(p.id));
      setAssignedProgrammes(allowed);
      setCategories(cats);

      // Fetch stats for each programme
      const statsMap: Record<string, { total: number; entered: number; verified: number }> = {};
      for (const p of allowed) {
        const [regs, scrs] = await Promise.all([
          getProgrammeRegistrations(p.id),
          getProgrammeScores(p.id),
        ]);
        const entered = scrs.length;
        const verified = scrs.filter(s => s.is_verified).length;
        statsMap[p.id] = { total: regs.length, entered, verified };
      }
      setProgrammeStats(statsMap);

    } catch (e) {
      console.error('Error loading judge dashboard:', e);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 text-amber-400 gap-3 font-bold text-xs">
        <Gavel className="w-8 h-8 animate-spin" />
        <span>Loading Assigned Judge Programmes...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Welcome Banner */}
      <div className="bg-emerald-950/80 border border-emerald-800 p-5 rounded-3xl backdrop-blur-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-extrabold text-[10px] uppercase tracking-wider">
              Judge Workspace
            </span>
          </div>
          <h1 className="text-xl font-black text-emerald-100 flex items-center gap-2">
            <span>Welcome, {adminProfile?.name_en || 'Event Judge'}</span>
          </h1>
          <p className="text-xs text-emerald-300/80 mt-1">
            You have {assignedProgrammes.length} assigned programmes for competition score entry.
          </p>
        </div>
      </div>

      {/* Assigned Programmes Grid */}
      <div className="space-y-4">
        <h2 className="text-base font-extrabold text-emerald-100 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-amber-400" />
          <span>Assigned Competition Programmes ({assignedProgrammes.length})</span>
        </h2>

        {assignedProgrammes.length === 0 ? (
          <div className="p-8 text-center bg-emerald-900/20 border border-emerald-800 rounded-3xl space-y-2">
            <Gavel className="w-8 h-8 text-emerald-400 mx-auto" />
            <h3 className="text-sm font-extrabold text-emerald-100">No Programmes Assigned Yet</h3>
            <p className="text-xs text-emerald-400/80">Please contact the Event Super Admin to assign programmes to your judge profile.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {assignedProgrammes.map(programme => {
              const cat = categories.find(c => c.id === programme.category_id);
              const stats = programmeStats[programme.id] || { total: 0, entered: 0, verified: 0 };
              const isAllEntered = stats.total > 0 && stats.entered >= stats.total;
              const isAllVerified = stats.total > 0 && stats.verified >= stats.total;

              return (
                <div
                  key={programme.id}
                  className="bg-emerald-950/90 border border-emerald-800 p-5 rounded-3xl shadow-xl flex flex-col justify-between space-y-4 hover:border-amber-500/50 transition-all"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-900/60 text-emerald-300 text-[10px] font-extrabold uppercase">
                        {cat?.name_en || 'General'}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                        programme.lifecycle_status === 'Ongoing' ? 'bg-red-500/20 text-red-300 border border-red-500/40 animate-pulse' :
                        programme.lifecycle_status === 'Completed' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' :
                        'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      }`}>
                        {programme.lifecycle_status || 'Upcoming'}
                      </span>
                    </div>

                    <h3 className="text-lg font-black text-emerald-100">{programme.title_en}</h3>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-emerald-300/80 font-medium">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-amber-400" />
                        <span>{programme.venue || 'Main Stage'}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-amber-400" />
                        <span>{programme.event_date || 'Today'}</span>
                      </span>
                    </div>
                  </div>

                  {/* Progress Stats */}
                  <div className="p-3 rounded-2xl bg-emerald-900/40 border border-emerald-800/80 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-emerald-300">Score Progress</span>
                      <span className="text-amber-400 font-mono">
                        {stats.entered} / {stats.total} Entered
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-emerald-950 overflow-hidden">
                      <div
                        className="h-full bg-amber-400 transition-all"
                        style={{ width: `${stats.total > 0 ? (stats.entered / stats.total) * 100 : 0}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className={`font-extrabold ${isAllEntered ? 'text-emerald-300' : 'text-amber-300'}`}>
                        {isAllEntered ? 'All Scores Entered' : 'Pending Score Input'}
                      </span>
                      <span className="text-emerald-400">
                        {stats.verified} Verified
                      </span>
                    </div>
                  </div>

                  <Link
                    href={`/judge/programmes?programme_id=${programme.id}`}
                    className="w-full py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-emerald-950 font-black text-xs shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    <span>Open Score Entry Desk</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>

                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
