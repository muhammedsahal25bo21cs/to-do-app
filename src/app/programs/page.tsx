'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { HeaderNav } from '@/components/HeaderNav';
import { FooterSection } from '@/components/FooterSection';
import { ShareModal } from '@/components/ShareModal';
import { getProgrammes, getCategories, Programme, Category } from '@/lib/cmsService';
import { subscribeToProgrammes } from '@/lib/realtimeService';
import { Calendar, Clock, MapPin, Search, Loader2, Tag, CheckCircle2, Radio, Share2 } from 'lucide-react';

function ProgrammesContent() {
  const searchParams = useSearchParams();
  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDateFilter, setSelectedDateFilter] = useState<string>('All');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Share Modal state
  const [shareTarget, setShareTarget] = useState<{ title: string; subtitle: string; programmeSlug?: string } | null>(null);

  useEffect(() => {
    loadData();
    const unsub = subscribeToProgrammes(() => loadData());
    return () => unsub();
  }, []);

  useEffect(() => {
    if (categories.length > 0 && searchParams) {
      const catParam = searchParams.get('category') || searchParams.get('programme');
      if (catParam) {
        const foundCat = categories.find(c => c.slug === catParam || c.id === catParam);
        if (foundCat) {
          setActiveCategory(foundCat.id);
        }
      }
    }
  }, [categories, searchParams]);

  const loadData = async () => {
    setIsLoading(true);
    const [prg, cat] = await Promise.all([
      getProgrammes(true),
      getCategories(),
    ]);
    setProgrammes(prg);
    setCategories(cat);
    setIsLoading(false);
  };

  const getCountdownString = (eventDate: string, startTime: string) => {
    if (!eventDate) return null;
    try {
      const dateTimeStr = `${eventDate}T${startTime.length === 5 ? startTime : '09:00'}:00`;
      const target = new Date(dateTimeStr).getTime();
      const now = Date.now();
      const diff = target - now;
      if (isNaN(target) || diff <= 0) return null;

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      if (hours > 48) return `In ${Math.floor(hours / 24)} days`;
      return `Starts in ${hours}h ${mins}m`;
    } catch {
      return null;
    }
  };

  const datesList = Array.from(new Set(programmes.map(p => p.event_date))).filter(Boolean);

  const filteredProgrammes = programmes.filter(p => {
    if (activeCategory !== 'All') {
      const hasCat = p.category_id === activeCategory || (p.category_ids && p.category_ids.includes(activeCategory));
      if (!hasCat) return false;
    }

    if (selectedDateFilter !== 'All' && p.event_date !== selectedDateFilter) {
      return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return p.title_en.toLowerCase().includes(q) || (p.code && p.code.toLowerCase().includes(q));
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
              <Calendar className="w-4 h-4 text-amber-400" />
              <span>Official Competition Schedule</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-gold-gradient tracking-tight">
              Event Programmes & Contests
            </h1>
            <p className="text-xs sm:text-sm text-emerald-200/80">
              Browse official published competition schedules, category groups, venues, and registration statuses.
            </p>
          </div>

          {/* Filter Bar */}
          <div className="bg-emerald-950/80 border border-emerald-800/80 rounded-3xl p-6 shadow-2xl space-y-4 backdrop-blur-xl">
            {/* Category Buttons */}
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

            {/* Search & Date Filter */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto">
              <div className="relative">
                <Search className="w-4 h-4 text-amber-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Search programme title or code..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-emerald-900/40 border border-emerald-800 text-emerald-100 text-xs focus:border-amber-400 focus:outline-none"
                />
              </div>

              {datesList.length > 0 && (
                <div className="flex items-center gap-2 bg-emerald-900/40 px-3 py-1.5 rounded-2xl border border-emerald-800">
                  <Calendar className="w-4 h-4 text-amber-400 shrink-0" />
                  <select
                    value={selectedDateFilter}
                    onChange={(e) => setSelectedDateFilter(e.target.value)}
                    className="w-full bg-transparent text-xs font-bold text-emerald-100 focus:outline-none"
                  >
                    <option value="All" className="bg-emerald-950">All Event Dates</option>
                    {datesList.map(d => (
                      <option key={d} value={d} className="bg-emerald-950">{d}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* List or Empty State */}
          {isLoading ? (
            <div className="text-center py-16 text-amber-300 flex items-center justify-center gap-2 font-bold text-xs">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span>Loading event schedule...</span>
            </div>
          ) : filteredProgrammes.length === 0 ? (
            <div className="text-center py-16 bg-emerald-950/60 border border-emerald-800/60 rounded-3xl p-8 max-w-xl mx-auto space-y-2">
              <Calendar className="w-12 h-12 text-emerald-600 mx-auto" />
              <h3 className="text-base font-bold text-emerald-100">No programmes available yet.</h3>
              <p className="text-xs text-emerald-400/80">Event programmes will appear here once published by administrators.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProgrammes.map((prg) => {
                const cat = categories.find(c => c.id === prg.category_id);
                const isLive = prg.lifecycle_status === 'Ongoing';
                const countdown = getCountdownString(prg.event_date, prg.start_time);

                return (
                  <div
                    key={prg.id}
                    className={`bg-emerald-950/80 border rounded-3xl p-6 shadow-xl transition-all space-y-4 flex flex-col justify-between ${
                      isLive 
                        ? 'border-rose-500/60 shadow-rose-950/40 ring-1 ring-rose-500/30' 
                        : 'border-emerald-800/60 hover:border-amber-500/50'
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold truncate">
                          {cat?.name_en || 'General'}
                        </span>
                        
                        <div className="flex items-center gap-1.5 shrink-0">
                          {isLive ? (
                            <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 text-[10px] font-black uppercase tracking-wider flex items-center gap-1 animate-pulse">
                              <Radio className="w-3 h-3" />
                              <span>LIVE</span>
                            </span>
                          ) : countdown ? (
                            <span className="px-2 py-0.5 rounded bg-emerald-900 text-amber-300 border border-emerald-800 text-[10px] font-bold">
                              {countdown}
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-900 text-emerald-300 border border-emerald-800 uppercase">
                              {prg.competition_type}
                            </span>
                          )}
                        </div>
                      </div>

                      <h3 className="text-xl font-extrabold text-emerald-100">{prg.title_en}</h3>
                      {prg.description_en && (
                        <p className="text-xs text-emerald-300/80 leading-relaxed line-clamp-2">{prg.description_en}</p>
                      )}
                    </div>

                    <div className="pt-4 border-t border-emerald-800/40 space-y-3">
                      <div className="flex items-center justify-between gap-2 text-xs text-emerald-300/80">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5 text-amber-400" />
                            <span>{prg.start_time || '09:00 AM'} - {prg.end_time || '11:00 AM'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-3.5 h-3.5 text-amber-400" />
                            <span>{prg.venue}</span>
                          </div>
                        </div>

                        <button
                          onClick={() => setShareTarget({
                            title: prg.title_en,
                            subtitle: `${cat?.name_en || 'General'} • ${prg.competition_type}`,
                            programmeSlug: prg.slug
                          })}
                          className="p-2 rounded-xl bg-emerald-900/60 hover:bg-emerald-800 text-amber-300 border border-emerald-700 transition-colors shrink-0"
                          title="Share Programme & QR"
                        >
                          <Share2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Online Registration & Status Action Buttons */}
                      <div className="flex items-center gap-2 pt-1">
                        {prg.registration_mode !== 'Admin Only' && prg.registration_open !== false ? (
                          <Link
                            href={`/programs/${prg.slug || prg.id}/register`}
                            className="flex-1 py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-emerald-950 font-black text-xs text-center transition-all shadow-md"
                          >
                            Register Online
                          </Link>
                        ) : (
                          <span className="flex-1 py-2 px-3 rounded-xl bg-emerald-900/40 border border-emerald-800 text-emerald-400 text-[11px] font-bold text-center">
                            Admin Registration
                          </span>
                        )}

                        <Link
                          href="/programs/registration-status"
                          className="py-2 px-3 rounded-xl bg-emerald-900 hover:bg-emerald-800 text-emerald-200 border border-emerald-700 text-xs font-bold text-center"
                        >
                          Status
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      {shareTarget && (
        <ShareModal
          isOpen={true}
          onClose={() => setShareTarget(null)}
          title={shareTarget.title}
          subtitle={shareTarget.subtitle}
          urlParams={{
            type: 'programme',
            programmeSlug: shareTarget.programmeSlug
          }}
          filename={`programme-${shareTarget.programmeSlug || 'info'}`}
        />
      )}

      <FooterSection />
    </div>
  );
}

export default function ProgrammesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-emerald-950 flex items-center justify-center text-amber-400 text-xs font-bold">Loading schedule...</div>}>
      <ProgrammesContent />
    </Suspense>
  );
}
