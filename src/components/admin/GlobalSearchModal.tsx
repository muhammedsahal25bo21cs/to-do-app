'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  getStudents, 
  getTeams, 
  getProgrammes, 
  getCategories, 
  getProgrammeRegistrations, 
  getProgrammeResults,
  Student,
  Team,
  Programme,
  Category,
  ProgrammeRegistration,
  ProgrammeResult
} from '@/lib/cmsService';
import { Search, X, Users, Shield, Calendar, Tag, Trophy, CheckSquare, ArrowRight } from 'lucide-react';

interface GlobalSearchResult {
  id: string;
  type: 'Student' | 'Team' | 'Programme' | 'Category' | 'Registration' | 'Result';
  title: string;
  subtitle: string;
  link: string;
  icon: any;
}

export function GlobalSearchModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GlobalSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // toggle search modal
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(() => {
      executeSearch(query.trim().toLowerCase());
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  const executeSearch = async (q: string) => {
    setIsLoading(true);

    const [stds, tms, prgs, cats, regs, res] = await Promise.all([
      getStudents(true),
      getTeams(true),
      getProgrammes(false, true),
      getCategories(true),
      getProgrammeRegistrations(),
      getProgrammeResults(undefined, false),
    ]);

    const hits: GlobalSearchResult[] = [];

    // 1. Students
    stds.filter(s => s.name_en.toLowerCase().includes(q) || s.student_id_code.toLowerCase().includes(q)).slice(0, 5).forEach(s => {
      hits.push({
        id: `std-${s.id}`,
        type: 'Student',
        title: s.name_en,
        subtitle: `ID: ${s.student_id_code} | Category: ${s.category_class}`,
        link: '/admin/students',
        icon: Users,
      });
    });

    // 2. Teams
    tms.filter(t => t.name_en.toLowerCase().includes(q) || t.code.toLowerCase().includes(q)).slice(0, 5).forEach(t => {
      hits.push({
        id: `tm-${t.id}`,
        type: 'Team',
        title: t.name_en,
        subtitle: `Code: ${t.code} | House Team`,
        link: '/admin/teams',
        icon: Shield,
      });
    });

    // 3. Programmes
    prgs.filter(p => p.title_en.toLowerCase().includes(q) || (p.code && p.code.toLowerCase().includes(q))).slice(0, 5).forEach(p => {
      hits.push({
        id: `prg-${p.id}`,
        type: 'Programme',
        title: p.title_en,
        subtitle: `Type: ${p.competition_type} | Code: ${p.code || 'N/A'}`,
        link: '/admin/programmes',
        icon: Calendar,
      });
    });

    // 4. Categories
    cats.filter(c => c.name_en.toLowerCase().includes(q)).slice(0, 5).forEach(c => {
      hits.push({
        id: `cat-${c.id}`,
        type: 'Category',
        title: c.name_en,
        subtitle: `Group Category`,
        link: '/admin/categories',
        icon: Tag,
      });
    });

    // 5. Results
    res.filter(r => r.student_name_en?.toLowerCase().includes(q) || r.programme_title_en?.toLowerCase().includes(q)).slice(0, 5).forEach(r => {
      hits.push({
        id: `res-${r.id}`,
        type: 'Result',
        title: `${r.programme_title_en} - Rank #${r.rank}`,
        subtitle: `Winner: ${r.student_name_en} (${r.team_name_en})`,
        link: '/admin/results',
        icon: Trophy,
      });
    });

    setResults(hits);
    setIsLoading(false);
  };

  const handleSelectResult = (link: string) => {
    router.push(link);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-emerald-950 border-2 border-emerald-800 rounded-3xl p-6 max-w-2xl w-full shadow-2xl space-y-4 relative my-4">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-emerald-400 hover:text-white hover:bg-emerald-900"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="relative">
          <Search className="w-5 h-5 text-amber-400 absolute left-4 top-3.5" />
          <input
            type="text"
            autoFocus
            placeholder="Search students, teams, programmes, categories, results..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-12 pr-10 py-3 rounded-2xl bg-emerald-900/60 border border-emerald-700 text-emerald-100 font-bold text-sm focus:border-amber-400 focus:outline-none placeholder:text-emerald-500/70"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3.5 top-3.5 text-xs text-emerald-400 hover:text-white"
            >
              Clear
            </button>
          )}
        </div>

        {/* Search Results Display */}
        <div className="max-h-96 overflow-y-auto pr-1 space-y-2">
          {isLoading ? (
            <div className="py-8 text-center text-xs font-bold text-amber-300">Searching database records...</div>
          ) : query.trim() && results.length === 0 ? (
            <div className="py-8 text-center text-xs font-semibold text-emerald-400/70">
              No matching students, teams, programmes or results found for "{query}".
            </div>
          ) : (
            results.map((res) => {
              const Icon = res.icon;
              return (
                <div
                  key={res.id}
                  onClick={() => handleSelectResult(res.link)}
                  className="p-3.5 rounded-2xl bg-emerald-900/30 hover:bg-emerald-900/80 border border-emerald-800/80 hover:border-amber-500/50 flex items-center justify-between cursor-pointer transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-emerald-900 text-emerald-300 border border-emerald-800">
                          {res.type}
                        </span>
                        <h4 className="text-sm font-bold text-emerald-100 group-hover:text-amber-300 transition-colors">
                          {res.title}
                        </h4>
                      </div>
                      <p className="text-xs text-emerald-400/80 mt-0.5 font-medium">{res.subtitle}</p>
                    </div>
                  </div>

                  <ArrowRight className="w-4 h-4 text-emerald-500 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
                </div>
              );
            })
          )}
        </div>

        <div className="pt-3 border-t border-emerald-800/60 flex items-center justify-between text-[11px] text-emerald-400/70">
          <span>Press <kbd className="px-1.5 py-0.5 rounded bg-emerald-900 text-amber-300 font-mono font-bold">Esc</kbd> to close</span>
          <span>Global Event Search Engine</span>
        </div>
      </div>
    </div>
  );
}
