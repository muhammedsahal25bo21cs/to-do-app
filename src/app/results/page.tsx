'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { HeaderNav } from '@/components/HeaderNav';
import { FooterSection } from '@/components/FooterSection';
import { 
  getProgrammeResults, 
  getProgrammes, 
  getCategories, 
  ProgrammeResult, 
  Programme, 
  Category 
} from '@/lib/cmsService';
import { subscribeToResults } from '@/lib/realtimeService';
import { Trophy, Search, ChevronRight, Award, Loader2 } from 'lucide-react';

interface ResultGroupCard {
  programme: Programme;
  category: Category | null;
  results: ProgrammeResult[];
}

export default function ResultsDirectoryPage() {
  const [groupCards, setGroupCards] = useState<ResultGroupCard[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    loadData();
    const unsub = subscribeToResults(() => loadData());
    return () => unsub();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    const [pubResults, prgs, cats] = await Promise.all([
      getProgrammeResults(undefined, true),
      getProgrammes(true),
      getCategories(),
    ]);

    setCategories(cats);

    const groupMap = new Map<string, ProgrammeResult[]>();
    pubResults.forEach(r => {
      const list = groupMap.get(r.programme_id) || [];
      list.push(r);
      groupMap.set(r.programme_id, list);
    });

    const cards: ResultGroupCard[] = [];
    groupMap.forEach((resList, prgId) => {
      const prg = prgs.find(p => p.id === prgId);
      if (prg) {
        const cat = cats.find(c => c.id === prg.category_id) || null;
        cards.push({
          programme: prg,
          category: cat,
          results: resList.sort((a, b) => a.rank - b.rank),
        });
      }
    });

    setGroupCards(cards);
    setIsLoading(false);
  };

  const filteredCards = groupCards.filter(card => {
    if (activeCategory !== 'All' && card.category?.id !== activeCategory) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const prgMatch = card.programme.title_en.toLowerCase().includes(q);
      const catMatch = card.category?.name_en.toLowerCase().includes(q);
      return prgMatch || catMatch;
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
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>Official Competition Results</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-gold-gradient tracking-tight">
              Published Results
            </h1>
            <p className="text-xs sm:text-sm text-emerald-200/80">
              Select a programme to view its official poster-style result announcement
            </p>
          </div>

          {/* Filter Bar */}
          <div className="bg-emerald-950/80 border border-emerald-800/80 rounded-3xl p-5 shadow-2xl space-y-4 backdrop-blur-xl">
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              <button
                onClick={() => setActiveCategory('All')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border shrink-0 ${
                  activeCategory === 'All'
                    ? 'bg-amber-500 text-emerald-950 border-amber-500 shadow-md'
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
                      ? 'bg-amber-500 text-emerald-950 border-amber-500 shadow-md'
                      : 'bg-emerald-900/60 text-emerald-300 border-emerald-800 hover:bg-emerald-800'
                  }`}
                >
                  {c.name_en}
                </button>
              ))}
            </div>

            <div className="relative max-w-md mx-auto">
              <Search className="w-4 h-4 text-amber-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search programme or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-emerald-900/40 border border-emerald-800 text-emerald-100 text-xs focus:border-amber-400 focus:outline-none"
              />
            </div>
          </div>

          {/* Clean Directory Cards (STRICTLY NO SCORES, NO POINTS, NO MARKS) */}
          {isLoading ? (
            <div className="text-center py-16 text-amber-300 flex items-center justify-center gap-2">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span>Loading published results...</span>
            </div>
          ) : filteredCards.length === 0 ? (
            <div className="text-center py-16 bg-emerald-950/60 border border-emerald-800/60 rounded-3xl p-8 max-w-xl mx-auto space-y-2">
              <Award className="w-12 h-12 text-emerald-600 mx-auto" />
              <h3 className="text-base font-bold text-emerald-100">No results have been published yet.</h3>
              <p className="text-xs text-emerald-400/80">
                Official result posters will appear here once verified and published by administrators.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCards.map((card) => {
                const prgSlug = card.programme.slug || 'programme';
                const catSlug = card.category?.slug || 'category';
                const posterUrl = `/results/${prgSlug}/${catSlug}`;

                return (
                  <div
                    key={card.programme.id}
                    className="bg-gradient-to-b from-emerald-900/80 to-emerald-950 border border-emerald-800/80 hover:border-amber-500/60 rounded-3xl p-6 shadow-xl space-y-5 transition-all flex flex-col justify-between group"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="px-3.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold">
                          {card.category?.name_en || 'General'}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-800 text-emerald-200">
                          Published
                        </span>
                      </div>

                      <h3 className="text-xl font-extrabold text-emerald-100 group-hover:text-amber-300 transition-colors">
                        {card.programme.title_en}
                      </h3>

                      <p className="text-xs text-emerald-400 font-semibold">
                        Event Date: {card.programme.event_date || 'August 29, 2026'}
                      </p>
                    </div>

                    <Link
                      href={posterUrl}
                      className="w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-emerald-950 font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.02]"
                    >
                      <span>View Result</span>
                      <ChevronRight className="w-4 h-4" />
                    </Link>
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
