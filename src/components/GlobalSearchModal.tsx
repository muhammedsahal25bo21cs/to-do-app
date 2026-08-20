'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  getProgrammes, 
  getProgrammeResults, 
  getAnnouncements, 
  getStudentLeaderboard,
  Programme, 
  ProgrammeResult, 
  Announcement,
  StudentLeaderboardEntry 
} from '@/lib/cmsService';
import { Search, X, Calendar, Trophy, Megaphone, User, ArrowRight } from 'lucide-react';

export function GlobalSearchModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [query, setQuery] = useState('');
  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [results, setResults] = useState<ProgrammeResult[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [leaderboard, setLeaderboard] = useState<StudentLeaderboardEntry[]>([]);

  useEffect(() => {
    if (isOpen) {
      loadSearchableData();
    }
  }, [isOpen]);

  const loadSearchableData = async () => {
    const [prg, res, ann, ldb] = await Promise.all([
      getProgrammes(true),
      getProgrammeResults(undefined, true),
      getAnnouncements(true),
      getStudentLeaderboard(),
    ]);
    setProgrammes(prg);
    setResults(res);
    setAnnouncements(ann);
    setLeaderboard(ldb);
  };

  if (!isOpen) return null;

  const q = query.toLowerCase().trim();

  const filteredProgrammes = q ? programmes.filter(p => p.title_en.toLowerCase().includes(q) || p.venue.toLowerCase().includes(q)) : [];
  const filteredResults = q ? results.filter(r => (r.programme_title_en && r.programme_title_en.toLowerCase().includes(q)) || (r.student_name_en && r.student_name_en.toLowerCase().includes(q)) || (r.team_name_en && r.team_name_en.toLowerCase().includes(q))) : [];
  const filteredAnnouncements = q ? announcements.filter(a => a.title_en.toLowerCase().includes(q) || a.content_en.toLowerCase().includes(q)) : [];
  const filteredStudents = q ? leaderboard.filter(s => s.student_name_en.toLowerCase().includes(q) || s.student_code.toLowerCase().includes(q) || s.team_name_en.toLowerCase().includes(q)) : [];

  const hasResults = filteredProgrammes.length > 0 || filteredResults.length > 0 || filteredAnnouncements.length > 0 || filteredStudents.length > 0;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-start justify-center p-4 pt-16 sm:pt-24">
      <div className="bg-emerald-950 border-2 border-emerald-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-6 relative overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-emerald-800 pb-4">
          <div className="flex items-center gap-2 text-amber-400 font-extrabold text-sm">
            <Search className="w-5 h-5" />
            <span>Search Fest Database</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-xl bg-emerald-900 border border-emerald-700 text-emerald-300 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Input Box */}
        <div className="relative">
          <Search className="w-5 h-5 text-amber-400 absolute left-4 top-3.5" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type programme name, winner student, team, or announcement..."
            className="w-full pl-12 pr-4 py-3 rounded-2xl bg-emerald-900/60 border border-emerald-700 text-emerald-100 text-sm font-bold focus:border-amber-400 focus:outline-none"
            autoFocus
          />
        </div>

        {/* Search Results List */}
        <div className="max-h-96 overflow-y-auto space-y-4 pr-2 scrollbar-none">
          {!q ? (
            <div className="text-center py-8 text-emerald-400/60 text-xs font-medium">
              Start typing above to search across programmes, results, announcements, and leaderboards.
            </div>
          ) : !hasResults ? (
            <div className="text-center py-8 text-amber-400/80 text-xs font-semibold">
              No matching records found for "{query}".
            </div>
          ) : (
            <>
              {/* Programmes Match */}
              {filteredProgrammes.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[10px] uppercase font-black tracking-widest text-amber-400 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Programmes ({filteredProgrammes.length})</span>
                  </span>
                  {filteredProgrammes.map((p) => (
                    <Link
                      key={p.id}
                      href="/programs"
                      onClick={onClose}
                      className="p-3 rounded-2xl bg-emerald-900/40 border border-emerald-800 hover:border-amber-500/60 flex items-center justify-between gap-3 text-xs block transition-all"
                    >
                      <div>
                        <h4 className="font-extrabold text-emerald-100">{p.title_en}</h4>
                        <p className="text-[10px] text-emerald-400">{p.event_date} • {p.venue}</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-amber-400 shrink-0" />
                    </Link>
                  ))}
                </div>
              )}

              {/* Published Results Match */}
              {filteredResults.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[10px] uppercase font-black tracking-widest text-amber-400 flex items-center gap-1.5">
                    <Trophy className="w-3.5 h-3.5" />
                    <span>Published Winner Results ({filteredResults.length})</span>
                  </span>
                  {filteredResults.map((r) => (
                    <Link
                      key={r.id}
                      href={`/results/${r.programme_slug}/${r.category_slug}`}
                      onClick={onClose}
                      className="p-3 rounded-2xl bg-emerald-900/40 border border-emerald-800 hover:border-amber-500/60 flex items-center justify-between gap-3 text-xs block transition-all"
                    >
                      <div>
                        <span className="text-[10px] font-bold text-amber-300 uppercase">Rank #{r.rank} Winner</span>
                        <h4 className="font-extrabold text-emerald-100">{r.student_name_en} ({r.team_name_en})</h4>
                        <p className="text-[10px] text-emerald-400">{r.programme_title_en} - {r.category_name_en}</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-amber-400 shrink-0" />
                    </Link>
                  ))}
                </div>
              )}

              {/* Leaderboard Competitors Match */}
              {filteredStudents.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[10px] uppercase font-black tracking-widest text-amber-400 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" />
                    <span>Leaderboard Competitors ({filteredStudents.length})</span>
                  </span>
                  {filteredStudents.map((s) => (
                    <Link
                      key={s.student_id}
                      href="/leaderboard"
                      onClick={onClose}
                      className="p-3 rounded-2xl bg-emerald-900/40 border border-emerald-800 hover:border-amber-500/60 flex items-center justify-between gap-3 text-xs block transition-all"
                    >
                      <div>
                        <h4 className="font-extrabold text-emerald-100">{s.student_code} - {s.student_name_en}</h4>
                        <p className="text-[10px] text-emerald-400">{s.team_name_en} • Rank #{s.rank} ({s.total_points} PTS)</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-amber-400 shrink-0" />
                    </Link>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
