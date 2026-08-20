'use client';

import React, { useEffect, useState } from 'react';
import { HeaderNav } from '@/components/HeaderNav';
import { FooterSection } from '@/components/FooterSection';
import { getStudents, getTeams, Student, Team } from '@/lib/cmsService';
import { Users, Search, Loader2 } from 'lucide-react';

export default function ParticipantsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    const [stdList, tmList] = await Promise.all([
      getStudents(false),
      getTeams(false),
    ]);
    setStudents(stdList);
    setTeams(tmList);
    setIsLoading(false);
  };

  const filteredStudents = students.filter(s => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const tm = teams.find(t => t.id === s.team_id);
      return (
        s.name_en.toLowerCase().includes(q) ||
        s.student_id_code.toLowerCase().includes(q) ||
        (tm && tm.name_en.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-emerald-950 text-emerald-100 flex flex-col justify-between">
      <div>
        <HeaderNav />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
          {/* Header */}
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold uppercase tracking-wider">
              <Users className="w-4 h-4 text-amber-400" />
              <span>Registered Competitors</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-gold-gradient tracking-tight">
              Event Participants
            </h1>
            <p className="text-xs sm:text-sm text-emerald-200/80">
              Directory of registered student competitors and teams
            </p>
          </div>

          {/* Search Bar */}
          <div className="bg-emerald-950/80 border border-emerald-800/80 rounded-3xl p-5 shadow-2xl space-y-4 backdrop-blur-xl">
            <div className="relative max-w-md mx-auto">
              <Search className="w-4 h-4 text-amber-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search participant name, code, or team..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-emerald-900/40 border border-emerald-800 text-emerald-100 text-xs focus:border-amber-400 focus:outline-none"
              />
            </div>
          </div>

          {/* Directory Cards (ZERO SCORES OR MARKS DISPLAYED) */}
          {isLoading ? (
            <div className="text-center py-16 text-amber-300 flex items-center justify-center gap-2">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span>Loading participant directory...</span>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="text-center py-16 bg-emerald-950/60 border border-emerald-800/60 rounded-3xl p-8 max-w-xl mx-auto space-y-2">
              <Users className="w-12 h-12 text-emerald-600 mx-auto" />
              <h3 className="text-base font-bold text-emerald-100">No participants registered yet.</h3>
              <p className="text-xs text-emerald-400/80">Student competitors will appear here once registered by event administrators.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredStudents.map((std) => {
                const tm = teams.find(t => t.id === std.team_id);
                return (
                  <div
                    key={std.id}
                    className="bg-emerald-950/80 border border-emerald-800/60 hover:border-amber-500/50 rounded-2xl p-4 shadow-xl space-y-2 flex items-center gap-3 transition-all"
                  >
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center font-mono font-bold text-amber-300 text-xs shrink-0">
                      {std.student_id_code.slice(-3)}
                    </div>

                    <div className="overflow-hidden">
                      <span className="text-[10px] font-mono text-amber-400 font-bold block">{std.student_id_code}</span>
                      <h3 className="text-sm font-extrabold text-emerald-100 truncate">{std.name_en}</h3>
                      <p className="text-[11px] text-emerald-400 font-medium truncate">{tm?.name_en || 'Independent'}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      <FooterSection />
    </div>
  );
}
