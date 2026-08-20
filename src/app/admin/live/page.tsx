'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  getProgrammes, 
  getCategories, 
  getProgrammeRegistrations, 
  getProgrammeScores, 
  getSiteSettings, 
  updateSiteSettings, 
  updateProgrammeStatus, 
  publishProgrammeResults,
  getActivityLogs,
  Programme, 
  Category, 
  SiteSettings,
  AdminActivityLog
} from '@/lib/cmsService';
import { subscribeToProgrammes, subscribeToResults, subscribeToSiteSettings } from '@/lib/realtimeService';
import { ConnectionStatusBadge } from '@/components/ConnectionStatusBadge';
import { AdminPermissionGuard } from '@/components/admin/AdminPermissionGuard';
import { ShareModal } from '@/components/ShareModal';
import { useAuth } from '@/context/AuthContext';
import { 
  Play, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Megaphone, 
  Radio, 
  Award, 
  FileEdit, 
  ShieldCheck, 
  Sparkles,
  Users,
  MapPin,
  Calendar,
  ExternalLink,
  ChevronRight,
  Activity,
  RefreshCw,
  Share2,
  CheckSquare,
  ListTodo,
  Layers,
  ArrowRight,
  TrendingUp,
  FileCheck
} from 'lucide-react';

interface ProgrammeLiveStats {
  registeredCount: number;
  presentCount: number;
  absentCount: number;
  scoresEnteredCount: number;
  scoresVerifiedCount: number;
}

interface SmartWarning {
  id: string;
  programmeId: string;
  programmeTitle: string;
  type: 'scores_incomplete' | 'scores_unverified' | 'attendance_incomplete' | 'registration_closing' | 'result_pending';
  severity: 'high' | 'medium';
  message: string;
  actionLabel: string;
  actionUrl: string;
}

function AdminLiveControlContent() {
  const { hasPermission, canManageProgramme } = useAuth();

  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
  const [programmeStats, setProgrammeStats] = useState<Record<string, ProgrammeLiveStats>>({});
  const [activityLogs, setActivityLogs] = useState<AdminActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdatedTime, setLastUpdatedTime] = useState<string>('');

  // Live Clock
  const [currentTime, setCurrentTime] = useState<string>('');

  // Live Announcement Modal Controls
  const [isAnnouncementModalOpen, setIsAnnouncementModalOpen] = useState(false);
  const [bannerEnabled, setBannerEnabled] = useState(true);
  const [bannerMessage, setBannerMessage] = useState('');
  const [bannerPriority, setBannerPriority] = useState<'Normal' | 'Important' | 'Urgent'>('Important');
  const [eventStatus, setEventStatus] = useState<'Upcoming' | 'Live' | 'Completed'>('Live');
  const [isUpdatingBanner, setIsUpdatingBanner] = useState(false);

  // Completion & Action Modals
  const [confirmingCompleteId, setConfirmingCompleteId] = useState<string | null>(null);
  const [unverifiedWarningMsg, setUnverifiedWarningMsg] = useState<string | null>(null);
  const [isActionProcessing, setIsActionProcessing] = useState(false);

  // Share Modal
  const [shareModalData, setShareModalData] = useState<{ open: boolean; title: string; prgSlug: string } | null>(null);

  // Event Day Checklist State (Saved to localStorage)
  const [checklist, setChecklist] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // Clock Interval
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateClock();
    const clockTimer = setInterval(updateClock, 1000);

    // Saved Checklist Load
    try {
      const savedChecklist = localStorage.getItem('milad_event_checklist');
      if (savedChecklist) {
        setChecklist(JSON.parse(savedChecklist));
      }
    } catch (e) {
      console.warn('Checklist storage error:', e);
    }

    loadData();

    // Realtime Subscriptions
    const unsubProg = subscribeToProgrammes(() => loadData(true));
    const unsubResults = subscribeToResults(() => loadData(true));
    const unsubSettings = subscribeToSiteSettings(() => loadData(true));

    return () => {
      clearInterval(clockTimer);
      unsubProg();
      unsubResults();
      unsubSettings();
    };
  }, []);

  const toggleChecklistItem = (key: string) => {
    const next = { ...checklist, [key]: !checklist[key] };
    setChecklist(next);
    localStorage.setItem('milad_event_checklist', JSON.stringify(next));
  };

  const loadData = async (silent = false) => {
    if (!silent) setLoading(true);
    setIsRefreshing(true);

    try {
      const [prgData, catData, settingsData, logsData] = await Promise.all([
        getProgrammes(false, true),
        getCategories(true),
        getSiteSettings(),
        getActivityLogs(),
      ]);

      setProgrammes(prgData);
      setCategories(catData);
      setSiteSettings(settingsData);
      setActivityLogs(logsData.slice(0, 10));
      setBannerEnabled(settingsData.live_announcement_enabled ?? true);
      setBannerMessage(settingsData.live_announcement_message || '');
      setBannerPriority(settingsData.live_announcement_priority || 'Important');
      setEventStatus(settingsData.event_status as any || 'Live');

      // Compute Stats per Programme
      const statsMap: Record<string, ProgrammeLiveStats> = {};
      for (const p of prgData) {
        const [regs, scores] = await Promise.all([
          getProgrammeRegistrations(p.id),
          getProgrammeScores(p.id),
        ]);

        const present = regs.filter(r => r.attendance === 'Present').length;
        const absent = regs.filter(r => r.attendance === 'Absent').length;
        const verified = scores.filter(s => s.is_verified).length;

        statsMap[p.id] = {
          registeredCount: regs.length,
          presentCount: present,
          absentCount: absent,
          scoresEnteredCount: scores.length,
          scoresVerifiedCount: verified,
        };
      }
      setProgrammeStats(statsMap);
      setLastUpdatedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    } catch (err) {
      console.error('Error loading live operations center:', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  // Group Programmes by Lifecycle Status
  const ongoingProgrammes = useMemo(() => programmes.filter(p => p.lifecycle_status === 'Ongoing'), [programmes]);
  const upcomingProgrammes = useMemo(() => programmes.filter(p => p.lifecycle_status === 'Upcoming' || p.lifecycle_status === 'Registration Open' || p.lifecycle_status === 'Registration Closed' || !p.lifecycle_status), [programmes]);
  const completedProgrammes = useMemo(() => programmes.filter(p => p.lifecycle_status === 'Completed' || p.lifecycle_status === 'Scores Pending' || p.lifecycle_status === 'Result Ready' || p.lifecycle_status === 'Published'), [programmes]);

  // Next Programme Spotlight
  const nextProgramme = upcomingProgrammes[0] || null;

  // Aggregate Metrics
  const totalProgrammes = programmes.length;
  const completedCount = programmes.filter(p => p.lifecycle_status === 'Completed' || p.lifecycle_status === 'Published').length;
  const publishedCount = programmes.filter(p => p.lifecycle_status === 'Published').length;
  
  const totalRegistrations = useMemo(() => Object.values(programmeStats).reduce((acc, curr) => acc + curr.registeredCount, 0), [programmeStats]);
  const totalPresent = useMemo(() => Object.values(programmeStats).reduce((acc, curr) => acc + curr.presentCount, 0), [programmeStats]);
  const totalVerifiedScores = useMemo(() => Object.values(programmeStats).reduce((acc, curr) => acc + curr.scoresVerifiedCount, 0), [programmeStats]);

  // Ready to Publish Queue (All scores verified, result generated but not published)
  const readyToPublishQueue = useMemo(() => {
    return programmes.filter(p => {
      const stats = programmeStats[p.id];
      if (!stats) return false;
      const isScoresReady = stats.scoresEnteredCount > 0 && stats.scoresVerifiedCount >= stats.scoresEnteredCount;
      const isNotPublished = p.lifecycle_status !== 'Published';
      return isScoresReady && isNotPublished;
    });
  }, [programmes, programmeStats]);

  // Smart Warnings Engine
  const smartWarnings = useMemo(() => {
    const warnings: SmartWarning[] = [];

    for (const p of programmes) {
      const stats = programmeStats[p.id];
      if (!stats) continue;

      if (p.lifecycle_status === 'Ongoing' && stats.presentCount === 0 && stats.registeredCount > 0) {
        warnings.push({
          id: `warn-att-${p.id}`,
          programmeId: p.id,
          programmeTitle: p.title_en,
          type: 'attendance_incomplete',
          severity: 'high',
          message: 'Attendance not completed yet for active programme.',
          actionLabel: 'Mark Attendance',
          actionUrl: `/admin/registrations?programme_id=${p.id}`,
        });
      }

      if ((p.lifecycle_status === 'Ongoing' || p.lifecycle_status === 'Completed') && stats.presentCount > 0 && stats.scoresEnteredCount < stats.presentCount) {
        warnings.push({
          id: `warn-score-inc-${p.id}`,
          programmeId: p.id,
          programmeTitle: p.title_en,
          type: 'scores_incomplete',
          severity: 'medium',
          message: `${stats.presentCount - stats.scoresEnteredCount} participant scores missing.`,
          actionLabel: 'Enter Scores',
          actionUrl: `/admin/scores?programme_id=${p.id}`,
        });
      }

      if (stats.scoresEnteredCount > 0 && stats.scoresVerifiedCount < stats.scoresEnteredCount) {
        warnings.push({
          id: `warn-score-ver-${p.id}`,
          programmeId: p.id,
          programmeTitle: p.title_en,
          type: 'scores_unverified',
          severity: 'medium',
          message: `${stats.scoresEnteredCount - stats.scoresVerifiedCount} scores pending verification.`,
          actionLabel: 'Verify Scores',
          actionUrl: `/admin/scores/judge?programme_id=${p.id}`,
        });
      }
    }

    return warnings;
  }, [programmes, programmeStats]);

  // Venue Status Mapping
  const venueMap = useMemo(() => {
    const map: Record<string, { current: Programme | null; next: Programme | null }> = {};
    for (const p of programmes) {
      const venue = p.venue || 'Main Auditorium Stage A';
      if (!map[venue]) {
        map[venue] = { current: null, next: null };
      }
      if (p.lifecycle_status === 'Ongoing' && !map[venue].current) {
        map[venue].current = p;
      } else if ((p.lifecycle_status === 'Upcoming' || !p.lifecycle_status) && !map[venue].next) {
        map[venue].next = p;
      }
    }
    return map;
  }, [programmes]);

  // Handlers
  const handleUpdateLiveAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingBanner(true);
    try {
      await updateSiteSettings({
        live_announcement_enabled: bannerEnabled,
        live_announcement_message: bannerMessage,
        live_announcement_priority: bannerPriority,
        event_status: eventStatus,
      });
      setIsAnnouncementModalOpen(false);
      await loadData(true);
    } catch (err: any) {
      alert(err.message || 'Error broadcasting announcement banner');
    } finally {
      setIsUpdatingBanner(false);
    }
  };

  const handleStartProgramme = async (prgId: string) => {
    setIsActionProcessing(true);
    try {
      await updateProgrammeStatus(prgId, 'Ongoing');
      await loadData(true);
    } catch (err: any) {
      alert(err.message || 'Error starting programme');
    } finally {
      setIsActionProcessing(false);
    }
  };

  const handleRequestCompleteProgramme = (prg: Programme) => {
    const stats = programmeStats[prg.id];
    if (stats && (stats.scoresEnteredCount < stats.registeredCount || stats.scoresVerifiedCount < stats.scoresEnteredCount)) {
      setUnverifiedWarningMsg(
        `Warning: Some participant scores (${stats.registeredCount - stats.scoresEnteredCount} missing, ${stats.scoresEnteredCount - stats.scoresVerifiedCount} unverified) are incomplete.`
      );
    } else {
      setUnverifiedWarningMsg(null);
    }
    setConfirmingCompleteId(prg.id);
  };

  const handleConfirmCompleteProgramme = async () => {
    if (!confirmingCompleteId) return;
    setIsActionProcessing(true);
    try {
      await updateProgrammeStatus(confirmingCompleteId, 'Completed');
      setConfirmingCompleteId(null);
      setUnverifiedWarningMsg(null);
      await loadData(true);
    } catch (err: any) {
      alert(err.message || 'Error completing programme');
    } finally {
      setIsActionProcessing(false);
    }
  };

  const handlePublishResultDirect = async (prgId: string) => {
    if (!confirm('Publish result poster and update leaderboard for this programme?')) return;
    setIsActionProcessing(true);
    try {
      await publishProgrammeResults(prgId);
      await loadData(true);
    } catch (err: any) {
      alert(err.message || 'Error publishing results');
    } finally {
      setIsActionProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center space-y-4 max-w-lg mx-auto">
        <Activity className="w-10 h-10 text-amber-400 animate-spin mx-auto" />
        <h3 className="text-base font-extrabold text-emerald-100">Connecting to Live Operations Center...</h3>
        <p className="text-xs text-emerald-300/80">Synchronizing realtime database feeds, programme stages, and scoring queues.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      
      {/* 1. OPERATIONS HEADER & LIVE CLOCK */}
      <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-950 border border-emerald-800 p-6 rounded-3xl shadow-2xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-emerald-800/60 pb-4">
          
          <div className="space-y-1">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 font-black text-xs flex items-center gap-1.5 uppercase tracking-wider animate-pulse">
                <Radio className="w-3.5 h-3.5" />
                <span>Event Operations Desk</span>
              </span>
              <ConnectionStatusBadge />
              <span className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 font-extrabold text-xs font-mono">
                🕒 {currentTime || '10:00 AM'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-emerald-100 tracking-tight font-serif pt-1">
              {siteSettings?.event_name_en || 'Milad Fest 2K26'} Operations Center
            </h1>
            <p className="text-xs text-emerald-300/80">
              Live Stage Controls • Programme Scheduling • Real-Time Scoring Desk • Result Publishing Queue
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => loadData()}
              disabled={isRefreshing}
              className="px-4 py-2.5 rounded-2xl bg-emerald-900/80 hover:bg-emerald-800 border border-emerald-700 text-emerald-200 font-bold text-xs flex items-center gap-2 shadow-lg transition-all"
            >
              <RefreshCw className={`w-4 h-4 text-amber-400 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>Refresh ({lastUpdatedTime})</span>
            </button>

            <button
              onClick={() => setIsAnnouncementModalOpen(true)}
              className="px-5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-emerald-950 font-black text-xs flex items-center gap-2 shadow-xl transition-all"
            >
              <Megaphone className="w-4 h-4" />
              <span>Live Announcement</span>
            </button>
          </div>
        </div>

        {/* 2. EVENT PROGRESS METRICS DASHBOARD BAR */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-1 text-center">
          <div className="p-3 rounded-2xl bg-emerald-950/80 border border-emerald-800">
            <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">Completed</span>
            <span className="text-xl font-black text-gold-gradient">{completedCount} / {totalProgrammes}</span>
          </div>

          <div className="p-3 rounded-2xl bg-emerald-950/80 border border-emerald-800">
            <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">Published Results</span>
            <span className="text-xl font-black text-amber-400">{publishedCount} / {totalProgrammes}</span>
          </div>

          <div className="p-3 rounded-2xl bg-emerald-950/80 border border-emerald-800">
            <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">Registrations</span>
            <span className="text-xl font-black text-emerald-100">{totalRegistrations}</span>
          </div>

          <div className="p-3 rounded-2xl bg-emerald-950/80 border border-emerald-800">
            <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">Attendance Present</span>
            <span className="text-xl font-black text-emerald-300">
              {totalPresent} ({totalRegistrations > 0 ? Math.round((totalPresent / totalRegistrations) * 100) : 0}%)
            </span>
          </div>

          <div className="col-span-2 sm:col-span-1 p-3 rounded-2xl bg-emerald-950/80 border border-emerald-800">
            <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">Scores Verified</span>
            <span className="text-xl font-black text-amber-300">{totalVerifiedScores} / {totalPresent}</span>
          </div>
        </div>
      </div>

      {/* 3. PROMINENT "NEXT PROGRAMME" SPOTLIGHT & VENUE STATUS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Next Programme Spotlight Card */}
        <div className="lg:col-span-1 bg-gradient-to-br from-amber-500/10 via-emerald-950 to-emerald-950 border-2 border-amber-500/50 p-6 rounded-3xl shadow-2xl space-y-4 relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-amber-500/30 pb-3">
            <span className="text-xs font-black text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Next Programme Spotlight</span>
            </span>
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
              Up Next
            </span>
          </div>

          {nextProgramme ? (
            <div className="space-y-4">
              <div>
                <span className="text-xs font-bold text-amber-300 font-mono block mb-1">
                  📅 {nextProgramme.event_date} • 🕒 {nextProgramme.start_time}
                </span>
                <h3 className="text-xl font-black text-emerald-100 font-serif">{nextProgramme.title_en}</h3>
                <p className="text-xs text-emerald-300/80 mt-1 font-semibold">
                  Category: {categories.find(c => c.id === nextProgramme.category_id)?.name_en || 'General'} • Venue: {nextProgramme.venue}
                </p>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={() => handleStartProgramme(nextProgramme.id)}
                  disabled={isActionProcessing}
                  className="flex-1 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-emerald-950 font-black text-xs shadow-xl transition-all flex items-center justify-center gap-2"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Start Programme Now</span>
                </button>

                <Link
                  href={`/admin/programmes`}
                  className="px-4 py-3 rounded-2xl bg-emerald-900/80 border border-emerald-700 text-emerald-200 font-bold text-xs hover:bg-emerald-800 transition-all"
                >
                  Edit
                </Link>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-emerald-400/60 font-semibold text-xs space-y-1">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
              <p>No upcoming programmes scheduled.</p>
            </div>
          )}
        </div>

        {/* Current Venue Status Grid */}
        <div className="lg:col-span-2 bg-emerald-950/80 border border-emerald-800/80 p-6 rounded-3xl shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-emerald-800/60 pb-3">
            <h3 className="text-base font-extrabold text-emerald-100 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-amber-400" />
              <span>Current Venue Stage Grid</span>
            </h3>
            <span className="text-xs font-bold text-amber-300">{Object.keys(venueMap).length} Active Venues</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[300px] overflow-y-auto pr-1">
            {Object.entries(venueMap).map(([venueName, vInfo]) => (
              <div key={venueName} className="p-4 rounded-2xl bg-emerald-900/30 border border-emerald-800 space-y-2">
                <span className="text-xs font-black text-amber-300 uppercase tracking-wider block">{venueName}</span>
                
                <div className="space-y-1.5 text-xs">
                  <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-200">
                    <span className="text-[10px] font-mono font-bold text-rose-400 block uppercase">🔴 Current Stage:</span>
                    <span className="font-bold block truncate">{vInfo.current?.title_en || 'No active programme'}</span>
                  </div>

                  <div className="p-2 rounded-xl bg-emerald-950/60 border border-emerald-800/60 text-emerald-300">
                    <span className="text-[10px] font-mono font-bold text-amber-400 block uppercase">⏳ Scheduled Next:</span>
                    <span className="font-bold block truncate">{vInfo.next?.title_en || 'None'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* 4. RESULT PUBLISHING QUEUE ("READY TO PUBLISH") */}
      {readyToPublishQueue.length > 0 && (
        <div className="bg-gradient-to-r from-amber-500/20 via-emerald-950 to-emerald-950 border-2 border-amber-500/60 p-6 rounded-3xl shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-amber-500/40 pb-3">
            <h3 className="text-lg font-black text-amber-300 flex items-center gap-2">
              <FileCheck className="w-6 h-6 text-amber-400" />
              <span>Result Publishing Queue ({readyToPublishQueue.length} Ready)</span>
            </h3>
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Scores Fully Verified</span>
          </div>

          <div className="space-y-3">
            {readyToPublishQueue.map(p => (
              <div key={p.id} className="p-4 rounded-2xl bg-emerald-900/40 border border-amber-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                      {categories.find(c => c.id === p.category_id)?.name_en || 'General'}
                    </span>
                    <span className="text-xs text-amber-400 font-semibold font-mono">Scores Verified 🟢</span>
                  </div>
                  <h4 className="text-base font-extrabold text-emerald-100 mt-1">{p.title_en}</h4>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <Link
                    href={`/admin/results/poster-studio?programme_id=${p.id}`}
                    className="px-4 py-2 rounded-xl bg-emerald-800 text-emerald-200 text-xs font-bold hover:bg-emerald-700 transition-all"
                  >
                    Preview Poster
                  </Link>

                  <button
                    onClick={() => handlePublishResultDirect(p.id)}
                    disabled={isActionProcessing}
                    className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-emerald-950 font-black text-xs shadow-lg transition-all flex items-center gap-1.5"
                  >
                    <Award className="w-4 h-4" />
                    <span>Publish Official Result</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. SMART WARNINGS SYSTEM */}
      {smartWarnings.length > 0 && (
        <div className="bg-emerald-950/80 border border-amber-500/40 p-6 rounded-3xl shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-amber-500/30 pb-3">
            <h3 className="text-base font-black text-amber-300 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              <span>Smart Event Operational Warnings ({smartWarnings.length})</span>
            </h3>
            <span className="text-xs font-bold text-amber-400/80">Requires Attention</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {smartWarnings.map(w => (
              <div key={w.id} className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start justify-between gap-3 text-xs">
                <div className="space-y-1">
                  <span className="font-bold text-emerald-100 block">{w.programmeTitle}</span>
                  <p className="text-amber-200/90 font-medium">{w.message}</p>
                </div>

                <Link
                  href={w.actionUrl}
                  className="px-3 py-1.5 rounded-xl bg-amber-500 text-emerald-950 font-black shrink-0 hover:bg-amber-400 transition-all"
                >
                  {w.actionLabel}
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. LIVE PROGRAMMES DESK (3 COLUMNS: LIVE, UPCOMING, COMPLETED) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* COLUMN 1: LIVE NOW (ONGOING) */}
        <div className="bg-emerald-950/80 border border-rose-500/40 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-rose-500/30 pb-3">
            <h3 className="text-base font-black text-rose-300 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping" />
              <span>Live Now ({ongoingProgrammes.length})</span>
            </h3>
            <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider">Ongoing Stage</span>
          </div>

          {ongoingProgrammes.length === 0 ? (
            <div className="text-center py-10 text-emerald-400/50 text-xs font-semibold bg-emerald-900/20 rounded-2xl border border-dashed border-emerald-800">
              No programme is currently marked as Ongoing.
            </div>
          ) : (
            <div className="space-y-4">
              {ongoingProgrammes.map(prg => {
                const stats = programmeStats[prg.id] || { registeredCount: 0, presentCount: 0, absentCount: 0, scoresEnteredCount: 0, scoresVerifiedCount: 0 };
                const cat = categories.find(c => c.id === prg.category_id);

                return (
                  <div key={prg.id} className="p-4 rounded-2xl bg-gradient-to-b from-rose-950/40 to-emerald-900/40 border border-rose-500/40 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 text-[10px] font-black uppercase tracking-wider">
                          🔴 LIVE STAGE
                        </span>
                        <h4 className="font-extrabold text-emerald-100 text-sm mt-1">{prg.title_en}</h4>
                        <p className="text-[11px] text-amber-300 font-semibold">{cat?.name_en || 'General'} • {prg.venue}</p>
                      </div>
                      <span className="text-[10px] text-emerald-300/70 font-mono shrink-0">{prg.start_time} - {prg.end_time}</span>
                    </div>

                    <div className="grid grid-cols-4 gap-2 py-2 text-center bg-emerald-950/60 rounded-xl border border-emerald-800/40 text-[10px]">
                      <div>
                        <span className="text-emerald-400/60 block font-medium">Reg</span>
                        <span className="font-extrabold text-emerald-100">{stats.registeredCount}</span>
                      </div>
                      <div>
                        <span className="text-emerald-400/60 block font-medium">Present</span>
                        <span className="font-extrabold text-emerald-300">{stats.presentCount}</span>
                      </div>
                      <div>
                        <span className="text-emerald-400/60 block font-medium">Scores</span>
                        <span className="font-extrabold text-amber-300">{stats.scoresEnteredCount}</span>
                      </div>
                      <div>
                        <span className="text-emerald-400/60 block font-medium">Verified</span>
                        <span className="font-extrabold text-emerald-400">{stats.scoresVerifiedCount}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <Link
                        href={`/admin/scores?programme_id=${prg.id}`}
                        className="flex-1 py-2 rounded-xl bg-emerald-800/60 hover:bg-emerald-800 text-emerald-100 font-extrabold text-xs text-center transition-all flex items-center justify-center gap-1"
                      >
                        <FileEdit className="w-3.5 h-3.5 text-amber-400" />
                        <span>Scores</span>
                      </Link>

                      <button
                        onClick={() => handleRequestCompleteProgramme(prg)}
                        disabled={isActionProcessing}
                        className="py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs transition-all shadow flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Complete</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* COLUMN 2: STARTING SOON / UPCOMING */}
        <div className="bg-emerald-950/80 border border-emerald-800/60 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-emerald-800/40 pb-3">
            <h3 className="text-base font-black text-emerald-100 flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-400" />
              <span>Starting Soon ({upcomingProgrammes.length})</span>
            </h3>
            <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">Scheduled</span>
          </div>

          {upcomingProgrammes.length === 0 ? (
            <div className="text-center py-10 text-emerald-400/50 text-xs font-semibold bg-emerald-900/20 rounded-2xl border border-dashed border-emerald-800">
              No upcoming programmes scheduled.
            </div>
          ) : (
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
              {upcomingProgrammes.map(prg => {
                const stats = programmeStats[prg.id] || { registeredCount: 0, presentCount: 0, absentCount: 0, scoresEnteredCount: 0, scoresVerifiedCount: 0 };
                const cat = categories.find(c => c.id === prg.category_id);

                return (
                  <div key={prg.id} className="p-4 rounded-2xl bg-emerald-900/30 border border-emerald-800 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="px-2 py-0.5 rounded bg-emerald-800 text-emerald-200 text-[10px] font-bold">
                          {prg.event_date} • {prg.start_time}
                        </span>
                        <h4 className="font-extrabold text-emerald-100 text-sm mt-1">{prg.title_en}</h4>
                        <p className="text-[11px] text-emerald-300 font-semibold">{cat?.name_en || 'General'} • {prg.venue}</p>
                      </div>
                      <span className="text-[10px] text-amber-300 font-bold px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                        {stats.registeredCount} Reg
                      </span>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => handleStartProgramme(prg.id)}
                        disabled={isActionProcessing}
                        className="w-full py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-extrabold text-xs transition-all shadow flex items-center justify-center gap-1.5"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Start Programme</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* COLUMN 3: COMPLETED / EVALUATION */}
        <div className="bg-emerald-950/80 border border-emerald-800/60 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-emerald-800/40 pb-3">
            <h3 className="text-base font-black text-emerald-100 flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              <span>Completed & Evaluation ({completedProgrammes.length})</span>
            </h3>
            <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">Evaluation</span>
          </div>

          {completedProgrammes.length === 0 ? (
            <div className="text-center py-10 text-emerald-400/50 text-xs font-semibold bg-emerald-900/20 rounded-2xl border border-dashed border-emerald-800">
              No completed programmes currently pending evaluation.
            </div>
          ) : (
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
              {completedProgrammes.map(prg => {
                const stats = programmeStats[prg.id] || { registeredCount: 0, presentCount: 0, absentCount: 0, scoresEnteredCount: 0, scoresVerifiedCount: 0 };
                const cat = categories.find(c => c.id === prg.category_id);

                return (
                  <div key={prg.id} className="p-4 rounded-2xl bg-emerald-900/30 border border-emerald-800 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          prg.lifecycle_status === 'Published' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                        }`}>
                          {prg.lifecycle_status === 'Published' ? 'Published 🟢' : 'Completed'}
                        </span>
                        <h4 className="font-extrabold text-emerald-100 text-sm mt-1">{prg.title_en}</h4>
                        <p className="text-[11px] text-emerald-300 font-semibold">{cat?.name_en || 'General'}</p>
                      </div>
                      <div className="text-right text-[10px]">
                        <span className="text-amber-300 font-bold block">{stats.scoresEnteredCount} Scores</span>
                        <span className="text-emerald-400 font-bold block">{stats.scoresVerifiedCount} Verified</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <Link
                        href={`/admin/scores?programme_id=${prg.id}`}
                        className="py-2 rounded-xl bg-emerald-800/60 hover:bg-emerald-800 text-emerald-100 font-bold text-xs text-center transition-all flex items-center justify-center gap-1"
                      >
                        <FileEdit className="w-3 h-3 text-amber-400" />
                        <span>Scores</span>
                      </Link>

                      <Link
                        href={`/admin/results/poster-studio?programme_id=${prg.id}`}
                        className="py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-emerald-950 font-black text-xs text-center transition-all shadow flex items-center justify-center gap-1"
                      >
                        <Award className="w-3 h-3" />
                        <span>Poster Studio</span>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* 7. EVENT-DAY CHECKLIST & RECENT ACTIVITY STREAM */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Interactive Event-Day Checklist */}
        <div className="bg-emerald-950/80 border border-emerald-800/80 p-6 rounded-3xl shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-emerald-800/60 pb-3">
            <h3 className="text-base font-extrabold text-emerald-100 flex items-center gap-2">
              <ListTodo className="w-5 h-5 text-amber-400" />
              <span>Event-Day Operations Checklist</span>
            </h3>
            <span className="text-xs text-emerald-400/80 font-mono">Saved Locally</span>
          </div>

          <div className="space-y-4 text-xs">
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase text-amber-400 tracking-wider">Before Event</span>
              {[
                { id: 'chk_1', label: 'Event settings and identity confirmed' },
                { id: 'chk_2', label: 'Programmes schedule and stages verified' },
                { id: 'chk_3', label: 'Student and team rosters imported' },
              ].map(item => (
                <label key={item.id} className="flex items-center gap-2 text-emerald-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!checklist[item.id]}
                    onChange={() => toggleChecklistItem(item.id)}
                    className="rounded border-emerald-700 text-amber-500 focus:ring-amber-400"
                  />
                  <span className={checklist[item.id] ? 'line-through text-emerald-400/60' : ''}>{item.label}</span>
                </label>
              ))}
            </div>

            <div className="space-y-2 pt-2 border-t border-emerald-800/60">
              <span className="text-[10px] font-bold uppercase text-amber-400 tracking-wider">During Event</span>
              {[
                { id: 'chk_4', label: 'Mark attendance for active live stages' },
                { id: 'chk_5', label: 'Score Managers entering marks accurately' },
                { id: 'chk_6', label: 'Score verification and audit check' },
              ].map(item => (
                <label key={item.id} className="flex items-center gap-2 text-emerald-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!checklist[item.id]}
                    onChange={() => toggleChecklistItem(item.id)}
                    className="rounded border-emerald-700 text-amber-500 focus:ring-amber-400"
                  />
                  <span className={checklist[item.id] ? 'line-through text-emerald-400/60' : ''}>{item.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity Log Feed */}
        <div className="bg-emerald-950/80 border border-emerald-800/80 p-6 rounded-3xl shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-emerald-800/60 pb-3">
            <h3 className="text-base font-extrabold text-emerald-100 flex items-center gap-2">
              <Activity className="w-5 h-5 text-amber-400" />
              <span>Recent Operational Activity</span>
            </h3>
            <Link href="/admin/logs" className="text-xs text-amber-400 hover:underline font-bold">
              View All Logs →
            </Link>
          </div>

          <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
            {activityLogs.length === 0 ? (
              <p className="text-xs text-emerald-400/60 text-center py-6">No recent operational logs recorded.</p>
            ) : (
              activityLogs.map(log => (
                <div key={log.id} className="p-3 rounded-2xl bg-emerald-900/30 border border-emerald-800/60 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-300 uppercase tracking-wider text-[10px]">{log.action}</span>
                    <span className="text-[10px] text-emerald-400/60 font-mono">{new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p className="text-emerald-100 font-semibold">{log.details || log.entity_type}</p>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* LIVE ANNOUNCEMENT BROADCAST MODAL */}
      {isAnnouncementModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-emerald-950 border-2 border-emerald-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-emerald-800 pb-3">
              <h3 className="text-lg font-black text-emerald-100 flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-amber-400" />
                <span>Broadcast Urgent Live Announcement</span>
              </h3>
              <button
                onClick={() => setIsAnnouncementModalOpen(false)}
                className="text-emerald-400 hover:text-white font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateLiveAnnouncement} className="space-y-4 text-xs">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="modalBannerToggle"
                  checked={bannerEnabled}
                  onChange={e => setBannerEnabled(e.target.checked)}
                  className="w-4 h-4 accent-amber-400 rounded cursor-pointer"
                />
                <label htmlFor="modalBannerToggle" className="font-bold text-amber-300 cursor-pointer">
                  Enable Public Ticker Banner
                </label>
              </div>

              <div>
                <label className="font-bold text-emerald-300 block mb-1">Announcement Message *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="e.g. Junior Quran Recitation results are now published!"
                  value={bannerMessage}
                  onChange={e => setBannerMessage(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-emerald-900/60 border border-emerald-700 text-emerald-100 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="font-bold text-emerald-300 block mb-1">Priority</label>
                <select
                  value={bannerPriority}
                  onChange={e => setBannerPriority(e.target.value as any)}
                  className="w-full px-4 py-2.5 rounded-xl bg-emerald-900 border border-emerald-700 text-emerald-100 font-bold"
                >
                  <option value="Normal">Normal Information</option>
                  <option value="Important">Important Alert</option>
                  <option value="Urgent">Urgent Highlight</option>
                </select>
              </div>

              <div className="pt-4 border-t border-emerald-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAnnouncementModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-emerald-900 text-emerald-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingBanner}
                  className="px-5 py-2 rounded-xl bg-amber-500 text-emerald-950 font-black shadow-lg"
                >
                  Broadcast Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* COMPLETE PROGRAMME CONFIRMATION MODAL */}
      {confirmingCompleteId && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-emerald-950 border border-emerald-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-amber-400">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="text-base font-extrabold text-emerald-100">Complete Programme Confirmation</h3>
            </div>

            {unverifiedWarningMsg && (
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs space-y-1">
                <p className="font-bold">{unverifiedWarningMsg}</p>
              </div>
            )}

            <p className="text-xs text-emerald-300">
              Are you sure you want to change the programme status to <strong>Completed</strong>?
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setConfirmingCompleteId(null)}
                className="px-4 py-2 rounded-xl bg-emerald-900 text-emerald-200 font-bold text-xs"
              >
                Cancel
              </button>

              <button
                onClick={handleConfirmCompleteProgramme}
                disabled={isActionProcessing}
                className="px-5 py-2 rounded-xl bg-amber-400 text-emerald-950 font-black text-xs shadow"
              >
                Continue & Complete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default function AdminLiveControlGuardPage() {
  return (
    <AdminPermissionGuard featureKey="live" featureLabel="Event-Day Operations Center">
      <AdminLiveControlContent />
    </AdminPermissionGuard>
  );
}
