'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { getStudentLeaderboard, getTeamLeaderboard, StudentLeaderboardEntry, TeamLeaderboardEntry } from '@/lib/cmsService';
import { BarChart2, Trophy, Shield, ArrowRight, Star } from 'lucide-react';

export const LeaderboardPreviewSection: React.FC = () => {
  const [students, setStudents] = useState<StudentLeaderboardEntry[]>([]);
  const [teams, setTeams] = useState<TeamLeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'students' | 'teams'>('students');

  useEffect(() => {
    Promise.all([
      getStudentLeaderboard(),
      getTeamLeaderboard(),
    ]).then(([std, tm]) => {
      setStudents(std.slice(0, 5));
      setTeams(tm.slice(0, 5));
      setLoading(false);
    });
  }, []);

  return (
    <section id="leaderboard-preview" className="py-16 bg-emerald-950/80 relative border-b border-emerald-800/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header & Tab controls */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase tracking-widest mb-2">
              <BarChart2 className="w-4 h-4 text-amber-400" />
              <span>Championship Standings</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-amber-400 font-serif">
              Leaderboard Preview
            </h2>
            <p className="text-xs sm:text-sm text-emerald-300/80 mt-1">
              Top performing individual students and house teams overall.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex bg-emerald-900/80 p-1 rounded-2xl border border-emerald-700">
              <button
                onClick={() => setActiveTab('students')}
                className={`px-4 py-1.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 ${
                  activeTab === 'students' ? 'bg-amber-500 text-emerald-950 shadow-md' : 'text-emerald-300 hover:text-white'
                }`}
              >
                <Trophy className="w-3.5 h-3.5" />
                <span>Top Students</span>
              </button>

              <button
                onClick={() => setActiveTab('teams')}
                className={`px-4 py-1.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 ${
                  activeTab === 'teams' ? 'bg-amber-500 text-emerald-950 shadow-md' : 'text-emerald-300 hover:text-white'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Top House Teams</span>
              </button>
            </div>

            <Link
              href="/leaderboard"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-amber-500 hover:bg-amber-400 text-emerald-950 font-black text-xs shadow-lg shadow-amber-500/20 shrink-0"
            >
              <span>Full Leaderboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Content list */}
        {loading ? (
          <div className="text-center py-12 text-emerald-400/60 text-xs font-bold animate-pulse">
            Calculating championship points...
          </div>
        ) : activeTab === 'students' ? (
          students.length === 0 ? (
            <div className="text-center py-10 bg-emerald-900/20 border border-emerald-800 rounded-3xl p-6 text-xs text-emerald-400/70">
              No student leaderboard points recorded yet. Points will populate as results are published.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {students.map((std, idx) => (
                <div
                  key={std.student_id}
                  className={`p-5 rounded-3xl border flex flex-col justify-between space-y-3 relative overflow-hidden transition-all ${
                    idx === 0 ? 'bg-gradient-to-b from-amber-500/20 to-emerald-950 border-amber-500/60 shadow-xl shadow-amber-500/10' :
                    idx === 1 ? 'bg-emerald-900/40 border-slate-400/40' :
                    idx === 2 ? 'bg-emerald-900/40 border-amber-700/40' : 'bg-emerald-900/20 border-emerald-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs ${
                      idx === 0 ? 'bg-amber-500 text-emerald-950 shadow-md' :
                      idx === 1 ? 'bg-slate-300 text-emerald-950' :
                      idx === 2 ? 'bg-amber-700 text-white' : 'bg-emerald-900 text-emerald-300'
                    }`}>
                      #{idx + 1}
                    </span>

                    <span className="font-mono text-[10px] text-amber-400 font-bold uppercase">{std.student_code}</span>
                  </div>

                  <div>
                    <h3 className="text-sm font-black text-emerald-100 line-clamp-1">{std.student_name_en}</h3>
                    <p className="text-xs text-amber-300/90 font-semibold">{std.team_name_en}</p>
                  </div>

                  <div className="pt-2 border-t border-emerald-800/60 flex items-center justify-between">
                    <span className="text-[10px] text-emerald-400 uppercase font-bold">Total Points</span>
                    <span className="text-lg font-black text-gold-gradient">{std.total_points} PTS</span>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          teams.length === 0 ? (
            <div className="text-center py-10 bg-emerald-900/20 border border-emerald-800 rounded-3xl p-6 text-xs text-emerald-400/70">
              No team leaderboard points recorded yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {teams.map((tm, idx) => (
                <div
                  key={tm.team_id}
                  className={`p-5 rounded-3xl border flex flex-col justify-between space-y-3 relative overflow-hidden transition-all ${
                    idx === 0 ? 'bg-gradient-to-b from-amber-500/20 to-emerald-950 border-amber-500/60 shadow-xl shadow-amber-500/10' :
                    'bg-emerald-900/30 border-emerald-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs ${
                      idx === 0 ? 'bg-amber-500 text-emerald-950 shadow-md' : 'bg-emerald-900 text-emerald-300'
                    }`}>
                      #{idx + 1}
                    </span>

                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-emerald-900 text-emerald-300 border border-emerald-700">
                      {tm.members_count} Members
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-black text-emerald-100 line-clamp-1">{tm.team_name_en}</h3>
                    <p className="text-xs text-emerald-400 font-semibold">{tm.wins_1st_count} First Places</p>
                  </div>

                  <div className="pt-2 border-t border-emerald-800/60 flex items-center justify-between">
                    <span className="text-[10px] text-emerald-400 uppercase font-bold">Points</span>
                    <span className="text-lg font-black text-gold-gradient">{tm.total_points} PTS</span>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </section>
  );
};
