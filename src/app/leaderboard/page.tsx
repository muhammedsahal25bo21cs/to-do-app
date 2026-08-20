'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { HeaderNav } from '@/components/HeaderNav';
import { FooterSection } from '@/components/FooterSection';
import { ShareModal } from '@/components/ShareModal';
import { PageUnavailableCard } from '@/components/PageUnavailableCard';
import { 
  getStudentLeaderboard, 
  getTeamLeaderboard, 
  getCategories, 
  getSiteSettings,
  StudentLeaderboardEntry, 
  TeamLeaderboardEntry, 
  Category,
  SiteSettings
} from '@/lib/cmsService';
import { subscribeToResults } from '@/lib/realtimeService';
import { Award, Trophy, Users, Search, Loader2, Sparkles, Medal, Share2 } from 'lucide-react';

function LeaderboardContent() {
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<'students' | 'teams' | 'overall'>('students');
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  const [studentEntries, setStudentEntries] = useState<StudentLeaderboardEntry[]>([]);
  const [teamEntries, setTeamEntries] = useState<TeamLeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);

  useEffect(() => {
    getSiteSettings().then(setSettings);
    loadCategories();
    const unsub = subscribeToResults(() => loadLeaderboardData());
    return () => unsub();
  }, []);

  if (settings?.public_pages_visibility?.leaderboard === false) {
    return <PageUnavailableCard pageTitle="Leaderboard" />;
  }

  useEffect(() => {
    if (searchParams) {
      const tabParam = searchParams.get('tab');
      if (tabParam === 'teams' || tabParam === 'overall') {
        setTab(tabParam);
      }
    }
  }, [searchParams]);

  useEffect(() => {
    if (categories.length > 0 && searchParams) {
      const catParam = searchParams.get('category');
      if (catParam) {
        const match = categories.find(c => c.slug === catParam || c.id === catParam);
        if (match) {
          setActiveCategory(match.id);
        }
      }
    }
  }, [categories, searchParams]);

  useEffect(() => {
    loadLeaderboardData();
  }, [tab, activeCategory, searchQuery]);

  const loadCategories = async () => {
    const cat = await getCategories();
    setCategories(cat);
  };

  const loadLeaderboardData = async () => {
    setIsLoading(true);
    const catId = activeCategory === 'All' ? undefined : activeCategory;
    if (tab === 'students') {
      const data = await getStudentLeaderboard(catId, searchQuery);
      setStudentEntries(data);
    } else {
      const data = await getTeamLeaderboard(catId, searchQuery);
      setTeamEntries(data);
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-emerald-950 text-emerald-100 flex flex-col justify-between">
      <div>
        <HeaderNav />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
          {/* Header */}
          <div className="text-center space-y-3 max-w-3xl mx-auto relative">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold uppercase tracking-wider">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>Official Championship Points & Leaderboard</span>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <h1 className="text-3xl sm:text-5xl font-black text-gold-gradient tracking-tight">
                Championship Leaderboard
              </h1>

              <button
                onClick={() => setIsShareModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-amber-500 hover:bg-amber-400 text-emerald-950 text-xs font-black transition-all shadow-lg shrink-0"
              >
                <Share2 className="w-4 h-4" />
                <span>Share Standings & QR</span>
              </button>
            </div>

            <p className="text-xs sm:text-sm text-emerald-200/80">
              Aggregated total points, tie-breaking rules, and championship standings from published results.
            </p>
          </div>

          {/* Controls & Filter Bar */}
          <div className="bg-emerald-950/80 border border-emerald-800/80 rounded-3xl p-6 shadow-2xl space-y-4 backdrop-blur-xl">
            {/* Main Tab Switcher: Students vs Teams vs Overall */}
            <div className="flex items-center justify-center p-1.5 bg-emerald-900/60 rounded-2xl border border-emerald-800 max-w-lg mx-auto">
              <button
                onClick={() => setTab('students')}
                className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 ${
                  tab === 'students' ? 'bg-amber-500 text-emerald-950 shadow-lg' : 'text-emerald-300 hover:text-white'
                }`}
              >
                <Award className="w-4 h-4" />
                <span>Student Roster</span>
              </button>

              <button
                onClick={() => setTab('teams')}
                className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 ${
                  tab === 'teams' ? 'bg-amber-500 text-emerald-950 shadow-lg' : 'text-emerald-300 hover:text-white'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Team Standings</span>
              </button>

              <button
                onClick={() => setTab('overall')}
                className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 ${
                  tab === 'overall' ? 'bg-amber-500 text-emerald-950 shadow-lg' : 'text-emerald-300 hover:text-white'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>Overall Championship</span>
              </button>
            </div>

            {/* Category Filter Tabs */}
            {categories.length > 0 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                <button
                  onClick={() => setActiveCategory('All')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border shrink-0 ${
                    activeCategory === 'All'
                      ? 'bg-amber-500 text-emerald-950 border-amber-500 shadow-md font-extrabold'
                      : 'bg-emerald-900/60 text-emerald-300 border-emerald-800 hover:bg-emerald-800'
                  }`}
                >
                  All Categories
                </button>
                {categories.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setActiveCategory(c.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border shrink-0 ${
                      activeCategory === c.id
                        ? 'bg-amber-500 text-emerald-950 border-amber-500 shadow-md font-extrabold'
                        : 'bg-emerald-900/60 text-emerald-300 border-emerald-800 hover:bg-emerald-800'
                    }`}
                  >
                    {c.name_en}
                  </button>
                ))}
              </div>
            )}

            {/* Search Input */}
            <div className="relative max-w-md mx-auto">
              <Search className="w-4 h-4 text-amber-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder={tab === 'students' ? 'Search student name or code...' : 'Search team name...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-emerald-900/40 border border-emerald-800 text-emerald-100 text-xs focus:border-amber-400 focus:outline-none"
              />
            </div>
          </div>

          {/* Leaderboard Table / Cards (POINTS ALLOWED ONLY HERE) */}
          {isLoading ? (
            <div className="text-center py-16 text-amber-300 flex items-center justify-center gap-2 font-bold text-xs">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span>Calculating championship standings...</span>
            </div>
          ) : tab === 'students' ? (
            studentEntries.length === 0 ? (
              <div className="text-center py-16 bg-emerald-950/60 border border-emerald-800/60 rounded-3xl p-8 max-w-xl mx-auto space-y-2">
                <Trophy className="w-12 h-12 text-emerald-600 mx-auto" />
                <h3 className="text-base font-bold text-emerald-100">Leaderboard will be available after results are published.</h3>
                <p className="text-xs text-emerald-400/80">Student standings update automatically when programme results are published.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {studentEntries.map((entry) => {
                  const isGold = entry.rank === 1;
                  const isSilver = entry.rank === 2;
                  const isBronze = entry.rank === 3;

                  return (
                    <div
                      key={entry.student_id}
                      className={`p-4 sm:p-5 rounded-3xl border flex items-center justify-between gap-4 shadow-xl transition-all ${
                        isGold ? 'bg-amber-500/10 border-amber-500/50 shadow-amber-500/10' :
                        isSilver ? 'bg-slate-500/10 border-slate-400/40' :
                        isBronze ? 'bg-amber-900/10 border-amber-700/40' :
                        'bg-emerald-950/80 border-emerald-800/60'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-base shrink-0 border ${
                            isGold ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-emerald-950 border-amber-300' :
                            isSilver ? 'bg-gradient-to-br from-slate-300 to-slate-400 text-slate-950 border-slate-200' :
                            isBronze ? 'bg-gradient-to-br from-amber-700 to-amber-900 text-amber-100 border-amber-600' :
                            'bg-emerald-900 text-emerald-200 border-emerald-800'
                          }`}
                        >
                          {isGold ? '🥇' : isSilver ? '🥈' : isBronze ? '🥉' : `#${entry.rank}`}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono font-bold text-amber-400">{entry.student_code}</span>
                            <span className="text-xs text-emerald-400 font-semibold">{entry.team_name_en}</span>
                          </div>
                          <h3 className="text-base font-extrabold text-emerald-100">
                            {entry.student_name_en}
                          </h3>
                          <p className="text-[10px] text-amber-300/80 font-bold mt-0.5">
                            Wins: {entry.wins_1st_count}x 🥇 • {entry.wins_2nd_count}x 🥈 • {entry.wins_3rd_count}x 🥉
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0 bg-emerald-900/40 px-4 py-2 rounded-2xl border border-emerald-800/60">
                        <span className="text-base font-black text-gold-gradient block">{entry.total_points} PTS</span>
                        <span className="text-[10px] text-emerald-400/80">{entry.programmes_count} Events</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          ) : (
            teamEntries.length === 0 ? (
              <div className="text-center py-16 bg-emerald-950/60 border border-emerald-800/60 rounded-3xl p-8 max-w-xl mx-auto space-y-2">
                <Users className="w-12 h-12 text-emerald-600 mx-auto" />
                <h3 className="text-base font-bold text-emerald-100">Leaderboard will be available after results are published.</h3>
                <p className="text-xs text-emerald-400/80">Team standings auto-aggregate points from published event rankings.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {teamEntries.map((team) => {
                  const isGold = team.rank === 1;
                  const isSilver = team.rank === 2;
                  const isBronze = team.rank === 3;

                  return (
                    <div
                      key={team.team_id}
                      className={`p-6 rounded-3xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl transition-all ${
                        isGold ? 'bg-amber-500/10 border-amber-500/50 shadow-amber-500/10' :
                        isSilver ? 'bg-slate-500/10 border-slate-400/40' :
                        isBronze ? 'bg-amber-900/10 border-amber-700/40' :
                        'bg-emerald-950/80 border-emerald-800/60'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-lg shrink-0 border ${
                            isGold ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-emerald-950 border-amber-300' :
                            isSilver ? 'bg-gradient-to-br from-slate-300 to-slate-400 text-slate-950 border-slate-200' :
                            isBronze ? 'bg-gradient-to-br from-amber-700 to-amber-900 text-amber-100 border-amber-600' :
                            'bg-emerald-900 text-emerald-200 border-emerald-800'
                          }`}
                        >
                          {isGold ? '🥇' : isSilver ? '🥈' : isBronze ? '🥉' : `#${team.rank}`}
                        </div>

                        <div>
                          <h3 className="text-xl font-black text-emerald-100">
                            {team.team_name_en}
                          </h3>
                          <p className="text-xs text-emerald-400/80 mt-0.5 font-medium">
                            {team.members_count} Members • Wins: {team.wins_1st_count}x 🥇 • {team.wins_2nd_count}x 🥈
                          </p>
                        </div>
                      </div>

                      <div className="text-right sm:text-right bg-emerald-900/50 px-5 py-3 rounded-2xl border border-emerald-800/80 shrink-0">
                        <span className="text-[10px] text-amber-400 uppercase font-black tracking-widest block">Championship Standings Score</span>
                        <span className="text-2xl font-black text-gold-gradient">{team.total_points} PTS</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          )}
        </main>
      </div>

      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        title={`Championship Leaderboard (${tab.toUpperCase()})`}
        subtitle="Official Event Standings & Points Roster"
        urlParams={{
          type: 'leaderboard',
          filters: {
            tab,
            ...(activeCategory !== 'All' ? { category: categories.find(c => c.id === activeCategory)?.slug || activeCategory } : {}),
          }
        }}
        filename={`leaderboard-${tab}`}
      />

      <FooterSection />
    </div>
  );
}

export default function LeaderboardPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-emerald-950 flex items-center justify-center text-amber-400 text-xs font-bold">Loading leaderboard...</div>}>
      <LeaderboardContent />
    </Suspense>
  );
}
