'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { getProgrammes, getCategories, Programme, Category } from '@/lib/cmsService';
import { Calendar, Clock, MapPin, ChevronRight, UserCheck, Filter, ArrowRight } from 'lucide-react';

export const ProgrammeSection: React.FC = () => {
  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [genderFilter, setGenderFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

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

  const filteredProgrammes = programmes.filter(p => {
    if (selectedCategoryId !== 'all' && p.category_id !== selectedCategoryId) return false;
    if (genderFilter !== 'all') {
      const cat = categories.find(c => c.id === p.category_id);
      const isFemaleCat = cat?.name_en.toLowerCase().includes('female');
      const isMaleCat = cat?.name_en.toLowerCase().includes('male');
      if (genderFilter === 'Female' && !isFemaleCat && isMaleCat) return false;
      if (genderFilter === 'Male' && !isMaleCat && isFemaleCat) return false;
    }
    return true;
  });

  return (
    <section id="programmes" className="py-16 sm:py-24 bg-emerald-950 text-emerald-100 border-b border-emerald-800/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold uppercase tracking-wider mb-2">
              <Calendar className="w-4 h-4 text-amber-400" />
              <span>Event Schedule</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-amber-400 font-serif">
              Programme Schedule
            </h2>
            <p className="text-xs sm:text-sm text-emerald-200/80 mt-1">
              Explore published competition schedules, details, and online registration.
            </p>
          </div>

          <Link
            href="/programs"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-emerald-900 hover:bg-emerald-800 text-amber-300 border border-emerald-700 font-extrabold text-xs transition-all shrink-0 self-start sm:self-auto"
          >
            <span>Browse All Programmes</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Filter Controls Bar */}
        {categories.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 bg-emerald-900/40 p-4 rounded-2xl border border-emerald-800">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-amber-400 flex items-center gap-1 mr-1">
                <Filter className="w-3.5 h-3.5" /> Category:
              </span>

              <button
                onClick={() => setSelectedCategoryId('all')}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                  selectedCategoryId === 'all' ? 'bg-amber-500 text-emerald-950 shadow-md' : 'bg-emerald-950 text-emerald-300 hover:bg-emerald-800'
                }`}
              >
                All
              </button>

              {categories.map(c => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCategoryId(c.id)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                    selectedCategoryId === c.id ? 'bg-amber-500 text-emerald-950 shadow-md' : 'bg-emerald-950 text-emerald-300 hover:bg-emerald-800'
                  }`}
                >
                  {c.name_en}
                </button>
              ))}
            </div>

            {/* Gender Filter */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-amber-400">Gender:</span>
              <select
                value={genderFilter}
                onChange={(e) => setGenderFilter(e.target.value)}
                className="px-3 py-1 rounded-xl bg-emerald-950 border border-emerald-700 text-emerald-200 text-xs font-bold"
              >
                <option value="all">All</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
          </div>
        )}

        {/* Programme List or Clean Empty State */}
        {isLoading ? (
          <div className="text-center py-12 text-amber-300 text-xs animate-pulse">Loading programmes...</div>
        ) : filteredProgrammes.length === 0 ? (
          <div className="text-center py-16 bg-emerald-950/60 border border-emerald-800/60 rounded-3xl p-8 max-w-xl mx-auto space-y-2">
            <Calendar className="w-12 h-12 text-emerald-600 mx-auto" />
            <h3 className="text-base font-bold text-emerald-100">No programmes matching filter criteria.</h3>
            <p className="text-xs text-emerald-400/80">Try selecting a different category or gender filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProgrammes.slice(0, 6).map((prg) => {
              const cat = categories.find(c => c.id === prg.category_id);
              const isPublicReg = prg.registration_mode === 'Public' || prg.registration_mode === 'Both';
              const isOpen = prg.registration_open !== false;

              return (
                <div
                  key={prg.id}
                  className="bg-emerald-950/80 border border-emerald-800/60 hover:border-amber-500/50 rounded-3xl p-6 shadow-xl transition-all space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold">
                        {cat?.name_en || 'General'}
                      </span>
                      {prg.code && (
                        <span className="text-[11px] font-mono text-emerald-400 font-bold">{prg.code}</span>
                      )}
                    </div>

                    <h3 className="text-xl font-extrabold text-emerald-100">{prg.title_en}</h3>
                    {prg.description_en && (
                      <p className="text-xs text-emerald-300/80 leading-relaxed line-clamp-2">{prg.description_en}</p>
                    )}
                  </div>

                  <div className="space-y-3 pt-4 border-t border-emerald-800/40">
                    <div className="space-y-1.5 text-xs text-emerald-300/80">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-amber-400" />
                        <span>{prg.start_time} - {prg.end_time}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-amber-400" />
                        <span>{prg.venue}</span>
                      </div>
                    </div>

                    {isPublicReg && isOpen ? (
                      <Link
                        href={`/programs/${prg.slug || prg.id}/register`}
                        className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-emerald-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20 transition-all"
                      >
                        <UserCheck className="w-4 h-4" />
                        <span>Register Online Now</span>
                      </Link>
                    ) : (
                      <div className="w-full py-2 rounded-xl bg-emerald-900/60 border border-emerald-800 text-center text-xs font-semibold text-emerald-400">
                        {isOpen ? 'Registration via Desk' : 'Registration Closed'}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </section>
  );
};
