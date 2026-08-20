'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  getStudents, 
  getTeams, 
  getProgrammes, 
  getCategories, 
  getProgrammeRegistrations, 
  getProgrammeScores, 
  getProgrammeResults, 
  getActivityLogs,
  getStudentLeaderboard,
  getTeamLeaderboard,
  recalculateLeaderboardStandings,
  Programme,
  Category,
  AdminActivityLog,
  StudentLeaderboardEntry,
  TeamLeaderboardEntry
} from '@/lib/cmsService';
import { 
  Users, 
  Award, 
  Calendar, 
  FolderTree, 
  UserCheck, 
  CheckCircle2, 
  AlertCircle, 
  Trophy, 
  ArrowRight, 
  Clock, 
  Sparkles,
  ChevronRight,
  ShieldCheck,
  RefreshCw,
  User,
  Plus,
  UserPlus,
  CheckSquare,
  FileCheck,
  BarChart2,
  Shield,
  Layers
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState({
    totalStudents: 0,
    totalTeams: 0,
    totalProgrammes: 0,
    totalCategories: 0,
    totalRegistrations: 0,
    pendingScores: 0,
    unverifiedScores: 0,
    pendingResults: 0,
    publishedResults: 0,
  });

  const [programmesList, setProgrammesList] = useState<Programme[]>([]);
  const [pendingProgrammes, setPendingProgrammes] = useState<Programme[]>([]);
  const [draftResults, setDraftResults] = useState<Programme[]>([]);
  const [recentLogs, setRecentLogs] = useState<AdminActivityLog[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [topStudents, setTopStudents] = useState<StudentLeaderboardEntry[]>([]);
  const [topTeams, setTopTeams] = useState<TeamLeaderboardEntry[]>([]);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);
  const [isRecalculating, setIsRecalculating] = useState<boolean>(false);
  const [recalculateSuccess, setRecalculateSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    setIsError(false);

    try {
      const [stds, tms, prgs, cats, regs, scrs, res, logs, stdLeaderboard, tmLeaderboard] = await Promise.all([
        getStudents(false),
        getTeams(false),
        getProgrammes(false),
        getCategories(),
        getProgrammeRegistrations(),
        getProgrammeScores(),
        getProgrammeResults(undefined, false),
        getActivityLogs(),
        getStudentLeaderboard(),
        getTeamLeaderboard(),
      ]);

      setCategories(cats);
      setProgrammesList(prgs);
      setRecentLogs(logs.slice(0, 6));
      setTopStudents(stdLeaderboard.slice(0, 5));
      setTopTeams(tmLeaderboard.slice(0, 5));

      const publishedResIds = new Set(res.filter(r => r.is_published).map(r => r.programme_id));
      const unverifiedScoresCount = scrs.filter(s => !s.is_verified).length;

      // Programmes waiting for score entry
      const needingScores = prgs.filter(p => {
        const prgRegs = regs.filter(r => r.programme_id === p.id);
        const prgScores = scrs.filter(s => s.programme_id === p.id);
        return prgRegs.length > 0 && prgScores.length < prgRegs.length;
      });

      // Programmes with scores generated but not published yet
      const awaitingPublish = prgs.filter(p => {
        const prgRes = res.filter(r => r.programme_id === p.id);
        return prgRes.length > 0 && !publishedResIds.has(p.id);
      });

      setMetrics({
        totalStudents: stds.length,
        totalTeams: tms.length,
        totalProgrammes: prgs.length,
        totalCategories: cats.length,
        totalRegistrations: regs.length,
        pendingScores: needingScores.length,
        unverifiedScores: unverifiedScoresCount,
        pendingResults: awaitingPublish.length,
        publishedResults: publishedResIds.size,
      });

      setPendingProgrammes(needingScores);
      setDraftResults(awaitingPublish);
    } catch (err) {
      console.error('Error loading dashboard metrics', err);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecalculateLeaderboard = async () => {
    setIsRecalculating(true);
    setRecalculateSuccess(null);
    try {
      const result = await recalculateLeaderboardStandings();
      setRecalculateSuccess(`Leaderboard standings updated for ${result.studentCount} students and ${result.teamCount} teams.`);
      setTimeout(() => setRecalculateSuccess(null), 5000);
      await loadDashboardData();
    } catch (err) {
      alert('Error recalculating leaderboard.');
    } finally {
      setIsRecalculating(false);
    }
  };

  const quickActions = [
    { title: 'Add Student', href: '/admin/students', icon: UserPlus, color: 'bg-emerald-900/60 border-emerald-700 text-amber-300' },
    { title: 'Create Team', href: '/admin/teams', icon: Shield, color: 'bg-emerald-900/60 border-emerald-700 text-amber-300' },
    { title: 'Create Programme', href: '/admin/programmes', icon: Calendar, color: 'bg-emerald-900/60 border-emerald-700 text-amber-300' },
    { title: 'Register Participant', href: '/admin/registrations', icon: CheckSquare, color: 'bg-emerald-900/60 border-emerald-700 text-amber-300' },
    { title: 'Enter Scores', href: '/admin/scores', icon: Award, color: 'bg-emerald-900/60 border-emerald-700 text-amber-300' },
    { title: 'Generate Result', href: '/admin/results', icon: Trophy, color: 'bg-emerald-900/60 border-emerald-700 text-amber-300' },
    { title: 'Manage Leaderboard', href: '/leaderboard', icon: BarChart2, color: 'bg-amber-500 text-emerald-950 shadow-md shadow-amber-500/20' },
  ];

  if (isLoading) {
    return (
      <div className="py-24 text-center space-y-4">
        <RefreshCw className="w-10 h-10 text-amber-400 animate-spin mx-auto" />
        <p className="text-xs font-bold text-amber-300 tracking-wider uppercase">Loading database metrics & event dashboard...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="py-20 text-center max-w-md mx-auto space-y-4 bg-emerald-950/80 border border-emerald-800 rounded-3xl p-8 shadow-2xl">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto" />
        <h2 className="text-base font-bold text-emerald-100">Unable to load event metrics</h2>
        <p className="text-xs text-emerald-300/80">Check network connection or database configuration and retry.</p>
        <button
          onClick={loadDashboardData}
          className="px-5 py-2.5 rounded-2xl bg-amber-500 text-emerald-950 font-black text-xs shadow-lg"
        >
          Retry Loading
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-950 border border-emerald-800/80 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-3 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold uppercase tracking-wider mb-2">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>Super Administrator Portal</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-gold-gradient tracking-tight">
              Event Control Center
            </h1>
            <p className="text-xs sm:text-sm text-emerald-200/90 mt-1 max-w-2xl font-medium">
              Manage competition schedules, student rosters, score verification, role permissions, and official poster publishing.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleRecalculateLeaderboard}
              disabled={isRecalculating}
              className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-emerald-900 hover:bg-emerald-800 text-amber-300 border border-emerald-700 font-extrabold text-xs shadow-lg transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isRecalculating ? 'animate-spin' : ''}`} />
              <span>{isRecalculating ? 'Recalculating...' : 'Recalculate Leaderboard'}</span>
            </button>

            <Link
              href="/admin/results"
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-emerald-950 font-black text-xs shadow-xl shadow-amber-500/20 transition-all shrink-0"
            >
              <Trophy className="w-4 h-4" />
              <span>Result Publishing Desk</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Success Notification Banner */}
      {recalculateSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{recalculateSuccess}</span>
        </div>
      )}

      {/* Quick Actions Bar */}
      <div className="space-y-3">
        <h2 className="text-xs font-black uppercase text-amber-400 tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Quick Admin Workflow Actions</span>
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {quickActions.map((action, idx) => {
            const Icon = action.icon;
            return (
              <Link
                key={idx}
                href={action.href}
                className={`p-3.5 rounded-2xl border flex flex-col items-center justify-center text-center gap-2 transition-all hover:scale-105 ${action.color}`}
              >
                <Icon className="w-5 h-5 shrink-0" />
                <span className="text-xs font-black leading-tight">{action.title}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* 8 Core Database Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Link href="/admin/students" className="bg-emerald-950/80 border border-emerald-800/60 hover:border-amber-500/50 rounded-3xl p-5 shadow-xl transition-all group">
          <div className="flex items-center justify-between text-emerald-400 mb-3">
            <Users className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform" />
            <ChevronRight className="w-4 h-4 text-emerald-600 group-hover:text-amber-400" />
          </div>
          <span className="text-2xl sm:text-3xl font-black text-emerald-100 block">{metrics.totalStudents}</span>
          <span className="text-xs font-bold text-emerald-300/80">Total Students</span>
        </Link>

        <Link href="/admin/teams" className="bg-emerald-950/80 border border-emerald-800/60 hover:border-amber-500/50 rounded-3xl p-5 shadow-xl transition-all group">
          <div className="flex items-center justify-between text-emerald-400 mb-3">
            <Shield className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform" />
            <ChevronRight className="w-4 h-4 text-emerald-600 group-hover:text-amber-400" />
          </div>
          <span className="text-2xl sm:text-3xl font-black text-emerald-100 block">{metrics.totalTeams}</span>
          <span className="text-xs font-bold text-emerald-300/80">Total Teams</span>
        </Link>

        <Link href="/admin/programmes" className="bg-emerald-950/80 border border-emerald-800/60 hover:border-amber-500/50 rounded-3xl p-5 shadow-xl transition-all group">
          <div className="flex items-center justify-between text-emerald-400 mb-3">
            <Calendar className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform" />
            <ChevronRight className="w-4 h-4 text-emerald-600 group-hover:text-amber-400" />
          </div>
          <span className="text-2xl sm:text-3xl font-black text-emerald-100 block">{metrics.totalProgrammes}</span>
          <span className="text-xs font-bold text-emerald-300/80">Programmes</span>
        </Link>

        <Link href="/admin/categories" className="bg-emerald-950/80 border border-emerald-800/60 hover:border-amber-500/50 rounded-3xl p-5 shadow-xl transition-all group">
          <div className="flex items-center justify-between text-emerald-400 mb-3">
            <FolderTree className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform" />
            <ChevronRight className="w-4 h-4 text-emerald-600 group-hover:text-amber-400" />
          </div>
          <span className="text-2xl sm:text-3xl font-black text-emerald-100 block">{metrics.totalCategories}</span>
          <span className="text-xs font-bold text-emerald-300/80">Categories</span>
        </Link>

        <Link href="/admin/registrations" className="bg-emerald-950/80 border border-emerald-800/60 hover:border-amber-500/50 rounded-3xl p-5 shadow-xl transition-all group">
          <div className="flex items-center justify-between text-emerald-400 mb-3">
            <UserCheck className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform" />
            <ChevronRight className="w-4 h-4 text-emerald-600 group-hover:text-amber-400" />
          </div>
          <span className="text-2xl sm:text-3xl font-black text-emerald-100 block">{metrics.totalRegistrations}</span>
          <span className="text-xs font-bold text-emerald-300/80">Registrations</span>
        </Link>

        <Link href="/admin/scores" className="bg-emerald-950/80 border border-emerald-800/60 hover:border-amber-500/50 rounded-3xl p-5 shadow-xl transition-all group">
          <div className="flex items-center justify-between text-emerald-400 mb-3">
            <AlertCircle className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform" />
            <ChevronRight className="w-4 h-4 text-emerald-600 group-hover:text-amber-400" />
          </div>
          <span className="text-2xl sm:text-3xl font-black text-amber-400 block">{metrics.pendingScores}</span>
          <span className="text-xs font-bold text-emerald-300/80">Pending Scores</span>
        </Link>

        <Link href="/admin/scores/judge" className="bg-emerald-950/80 border border-emerald-800/60 hover:border-amber-500/50 rounded-3xl p-5 shadow-xl transition-all group">
          <div className="flex items-center justify-between text-emerald-400 mb-3">
            <ShieldCheck className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform" />
            <ChevronRight className="w-4 h-4 text-emerald-600 group-hover:text-amber-400" />
          </div>
          <span className="text-2xl sm:text-3xl font-black text-emerald-100 block">{metrics.unverifiedScores}</span>
          <span className="text-xs font-bold text-emerald-300/80">Unverified Marks</span>
        </Link>

        <Link href="/admin/results" className="bg-emerald-950/80 border border-emerald-800/60 hover:border-amber-500/50 rounded-3xl p-5 shadow-xl transition-all group">
          <div className="flex items-center justify-between text-emerald-400 mb-3">
            <Trophy className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform" />
            <ChevronRight className="w-4 h-4 text-emerald-600 group-hover:text-amber-400" />
          </div>
          <span className="text-2xl sm:text-3xl font-black text-gold-gradient block">{metrics.publishedResults}</span>
          <span className="text-xs font-bold text-emerald-300/80">Published Results</span>
        </Link>
      </div>

      {/* Pending Actions Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Actions 1: Programmes Awaiting Score Entry */}
        <div className="bg-emerald-950/80 border border-emerald-800/60 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-emerald-800/40 pb-3">
            <h3 className="text-base font-extrabold text-emerald-100 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-400" />
              <span>Programmes Awaiting Score Entry</span>
            </h3>
            <span className="text-xs font-bold text-amber-400 bg-amber-500/20 px-2.5 py-0.5 rounded-full border border-amber-500/40">
              {pendingProgrammes.length}
            </span>
          </div>

          {pendingProgrammes.length === 0 ? (
            <div className="text-center py-8 text-emerald-400/60 text-xs font-semibold">
              No registered programmes are currently awaiting score entry.
            </div>
          ) : (
            <div className="space-y-3">
              {pendingProgrammes.map((p) => {
                const cat = categories.find(c => c.id === p.category_id);
                return (
                  <div key={p.id} className="p-4 rounded-2xl bg-emerald-900/40 border border-emerald-800/60 flex items-center justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-bold text-amber-400 uppercase">{cat?.name_en || 'General'}</span>
                      <h4 className="text-sm font-extrabold text-emerald-100">{p.title_en}</h4>
                    </div>

                    <Link
                      href="/admin/scores"
                      className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-emerald-950 font-extrabold text-xs shrink-0 transition-all"
                    >
                      Enter Scores
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Actions 2: Draft Results Waiting for Publication */}
        <div className="bg-emerald-950/80 border border-emerald-800/60 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-emerald-800/40 pb-3">
            <h3 className="text-base font-extrabold text-emerald-100 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-400" />
              <span>Results Waiting for Publication</span>
            </h3>
            <span className="text-xs font-bold text-amber-400 bg-amber-500/20 px-2.5 py-0.5 rounded-full border border-amber-500/40">
              {draftResults.length}
            </span>
          </div>

          {draftResults.length === 0 ? (
            <div className="text-center py-8 text-emerald-400/60 text-xs font-semibold">
              No draft results waiting for publication.
            </div>
          ) : (
            <div className="space-y-3">
              {draftResults.map((p) => {
                const cat = categories.find(c => c.id === p.category_id);
                return (
                  <div key={p.id} className="p-4 rounded-2xl bg-emerald-900/40 border border-emerald-800/60 flex items-center justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-bold text-amber-400 uppercase">{cat?.name_en || 'General'}</span>
                      <h4 className="text-sm font-extrabold text-emerald-100">{p.title_en}</h4>
                    </div>

                    <Link
                      href="/admin/results"
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-emerald-100 font-extrabold text-xs shrink-0 transition-all border border-emerald-500/40"
                    >
                      Preview & Publish
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Leaderboard Summary Preview (Top 5 Students & Top 5 Teams) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top 5 Students Preview */}
        <div className="bg-emerald-950/80 border border-emerald-800/60 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-emerald-800/40 pb-3">
            <h3 className="text-base font-extrabold text-emerald-100 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-400" />
              <span>Top 5 Student Competitors</span>
            </h3>
            <Link href="/leaderboard" className="text-xs text-amber-400 hover:underline font-bold">
              Full Standings →
            </Link>
          </div>

          {topStudents.length === 0 ? (
            <div className="text-center py-6 text-emerald-400/60 text-xs font-semibold">
              No published student standings recorded yet.
            </div>
          ) : (
            <div className="space-y-2">
              {topStudents.map((std) => (
                <div key={std.student_id} className="p-3 rounded-2xl bg-emerald-900/30 border border-emerald-800 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-300 font-bold text-[11px] flex items-center justify-center shrink-0">
                      #{std.rank}
                    </span>
                    <div>
                      <h4 className="font-extrabold text-emerald-100">{std.student_name_en}</h4>
                      <span className="text-[10px] text-emerald-400 font-semibold">{std.student_code} • {std.team_name_en}</span>
                    </div>
                  </div>
                  <span className="font-black text-amber-400 text-sm shrink-0">{std.total_points} Pts</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top 5 Teams Preview */}
        <div className="bg-emerald-950/80 border border-emerald-800/60 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-emerald-800/40 pb-3">
            <h3 className="text-base font-extrabold text-emerald-100 flex items-center gap-2">
              <Shield className="w-5 h-5 text-amber-400" />
              <span>Top House Teams</span>
            </h3>
            <Link href="/points" className="text-xs text-amber-400 hover:underline font-bold">
              Team Points →
            </Link>
          </div>

          {topTeams.length === 0 ? (
            <div className="text-center py-6 text-emerald-400/60 text-xs font-semibold">
              No house team standings recorded yet.
            </div>
          ) : (
            <div className="space-y-2">
              {topTeams.map((tm) => (
                <div key={tm.team_id} className="p-3 rounded-2xl bg-emerald-900/30 border border-emerald-800 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-300 font-bold text-[11px] flex items-center justify-center shrink-0">
                      #{tm.rank}
                    </span>
                    <div>
                      <h4 className="font-extrabold text-emerald-100">{tm.team_name_en}</h4>
                      <span className="text-[10px] text-emerald-400 font-semibold">Color: {tm.color_code}</span>
                    </div>
                  </div>
                  <span className="font-black text-gold-gradient text-sm shrink-0">{tm.total_points} Pts</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity Audit Trail */}
      <div className="bg-emerald-950/80 border border-emerald-800/60 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-emerald-800/40 pb-3">
          <h3 className="text-base font-extrabold text-emerald-100 flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-400" />
            <span>Recent Admin Audit Log</span>
          </h3>
          <Link href="/admin/logs" className="text-xs text-amber-400 hover:underline font-bold">
            View Activity Logs →
          </Link>
        </div>

        {recentLogs.length === 0 ? (
          <div className="text-center py-6 text-emerald-400/60 text-xs font-semibold">
            No recent admin actions recorded.
          </div>
        ) : (
          <div className="space-y-2">
            {recentLogs.map((log, idx) => (
              <div key={`${log.id}-${idx}`} className="p-3 rounded-2xl bg-emerald-900/30 border border-emerald-800/40 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-emerald-800 text-amber-300 font-bold uppercase text-[10px]">
                    {log.action}
                  </span>
                  <span className="text-emerald-100 font-medium">{log.details}</span>
                </div>
                <span className="text-[10px] text-emerald-400/60 shrink-0">
                  {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
