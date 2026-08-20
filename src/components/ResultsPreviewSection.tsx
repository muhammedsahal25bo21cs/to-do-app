'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { getProgrammeResults, ProgrammeResult } from '@/lib/cmsService';
import { ResultPosterRenderer } from '@/components/posters/ResultPosterRenderer';
import { ShareModal } from '@/components/ShareModal';
import { Trophy, Award, Eye, Share2, ArrowRight, CheckCircle2 } from 'lucide-react';

export const ResultsPreviewSection: React.FC = () => {
  const [results, setResults] = useState<ProgrammeResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPosterResult, setSelectedPosterResult] = useState<ProgrammeResult | null>(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareData, setShareData] = useState<{ title: string; url: string; text: string } | null>(null);

  useEffect(() => {
    getProgrammeResults(undefined, true).then((res) => {
      setResults(res);
      setLoading(false);
    });
  }, []);

  // Group results by programme_id
  const programmeGroups = new Map<string, ProgrammeResult[]>();
  for (const r of results) {
    const list = programmeGroups.get(r.programme_id) || [];
    programmeGroups.set(r.programme_id, [...list, r]);
  }

  const groupedArray = Array.from(programmeGroups.entries()).map(([prgId, items]) => ({
    programmeId: prgId,
    programmeTitle: items[0]?.programme_title_en || 'Programme Result',
    categoryName: items[0]?.category_name_en || 'General',
    categorySlug: items[0]?.category_slug || 'general',
    programmeSlug: items[0]?.programme_slug || 'programme',
    items: items.sort((a, b) => a.rank - b.rank),
  }));

  const openShare = (item: ProgrammeResult) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://miladfest.com';
    const url = `${origin}/results/${item.programme_slug || 'programme'}/${item.category_slug || 'general'}`;
    setShareData({
      title: `${item.programme_title_en} Results`,
      url,
      text: `Official Competition Results for ${item.programme_title_en} (${item.category_name_en}) - Milad Fest 2K26`,
    });
    setShareModalOpen(true);
  };

  return (
    <section id="results" className="py-16 bg-emerald-950/90 relative border-t border-b border-emerald-800/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase tracking-widest mb-2">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>Official Competition Rankings</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-amber-400 font-serif">
              Published Event Results
            </h2>
            <p className="text-xs sm:text-sm text-emerald-300/80 mt-1">
              Explore verified winners and official rankings across completed programmes.
            </p>
          </div>

          <Link
            href="/results"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-emerald-900 hover:bg-emerald-800 text-amber-300 border border-emerald-700 font-extrabold text-xs transition-all shrink-0 self-start sm:self-auto"
          >
            <span>View All Results</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Results Roster Grid */}
        {loading ? (
          <div className="text-center py-12 text-emerald-400/60 text-xs font-bold animate-pulse">
            Loading official published results...
          </div>
        ) : groupedArray.length === 0 ? (
          <div className="text-center py-12 bg-emerald-950 border border-emerald-800/60 rounded-3xl p-8 space-y-2">
            <Trophy className="w-10 h-10 text-emerald-600 mx-auto" />
            <h3 className="text-base font-extrabold text-emerald-200">No Published Results Yet</h3>
            <p className="text-xs text-emerald-400/70 max-w-md mx-auto">
              Competition results will appear here as soon as they are verified and published by festival officials.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groupedArray.slice(0, 6).map((grp) => {
              const top1 = grp.items.find(i => i.rank === 1);
              const top2 = grp.items.find(i => i.rank === 2);
              const top3 = grp.items.find(i => i.rank === 3);

              return (
                <div
                  key={grp.programmeId}
                  className="bg-emerald-900/40 border border-emerald-800/80 rounded-3xl p-6 shadow-xl space-y-4 hover:border-amber-500/40 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        {grp.categoryName}
                      </span>
                      <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Verified</span>
                      </span>
                    </div>

                    <h3 className="text-lg font-extrabold text-emerald-100 line-clamp-1">
                      {grp.programmeTitle}
                    </h3>

                    {/* Winners Roster Preview */}
                    <div className="space-y-1.5 pt-2 border-t border-emerald-800/50 text-xs">
                      {top1 && (
                        <div className="flex items-center justify-between p-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
                          <span className="font-black text-amber-300 text-[11px]">1st Place</span>
                          <span className="font-extrabold text-emerald-100 truncate ml-2">
                            {top1.student_name_en || top1.team_name_en}
                          </span>
                        </div>
                      )}

                      {top2 && (
                        <div className="flex items-center justify-between p-2 rounded-xl bg-emerald-950/60 border border-emerald-800">
                          <span className="font-bold text-slate-300 text-[11px]">2nd Place</span>
                          <span className="font-bold text-emerald-200 truncate ml-2">
                            {top2.student_name_en || top2.team_name_en}
                          </span>
                        </div>
                      )}

                      {top3 && (
                        <div className="flex items-center justify-between p-2 rounded-xl bg-emerald-950/60 border border-emerald-800">
                          <span className="font-bold text-amber-500/80 text-[11px]">3rd Place</span>
                          <span className="font-bold text-emerald-200 truncate ml-2">
                            {top3.student_name_en || top3.team_name_en}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-4 border-t border-emerald-800/50 flex items-center justify-between gap-2">
                    <button
                      onClick={() => setSelectedPosterResult(top1 || grp.items[0])}
                      className="flex-1 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-emerald-950 font-black text-xs transition-all flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20"
                    >
                      <Eye className="w-4 h-4" />
                      <span>View Official Poster</span>
                    </button>

                    <button
                      onClick={() => openShare(top1 || grp.items[0])}
                      className="p-2 rounded-xl bg-emerald-900 hover:bg-emerald-800 text-amber-300 border border-emerald-700 shrink-0"
                      title="Share Result Poster"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Poster Preview Modal */}
      {selectedPosterResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="bg-emerald-950 border-2 border-amber-500/60 rounded-3xl p-6 max-w-2xl w-full shadow-2xl space-y-4 relative my-8">
            <div className="flex items-center justify-between border-b border-emerald-800/60 pb-3">
              <div>
                <h3 className="text-base font-black text-amber-300">Official Result Poster</h3>
                <span className="text-xs text-emerald-400 font-bold">{selectedPosterResult.programme_title_en}</span>
              </div>

              <button
                onClick={() => setSelectedPosterResult(null)}
                className="px-3 py-1 rounded-xl bg-emerald-900 text-emerald-300 text-xs font-bold"
              >
                Close
              </button>
            </div>

            <ResultPosterRenderer
              results={results.filter(r => r.programme_id === selectedPosterResult.programme_id)}
              programmeTitle={selectedPosterResult.programme_title_en || 'Programme Results'}
              categoryName={selectedPosterResult.category_name_en || 'General'}
            />
          </div>
        </div>
      )}

      {/* Share Modal */}
      {selectedPosterResult && (
        <ShareModal
          isOpen={shareModalOpen}
          onClose={() => setShareModalOpen(false)}
          title={selectedPosterResult.programme_title_en || 'Programme Results'}
          subtitle={selectedPosterResult.category_name_en || 'General'}
          urlParams={{
            type: 'result',
            programmeSlug: selectedPosterResult.programme_slug || 'programme',
            categorySlug: selectedPosterResult.category_slug || 'general',
          }}
          filename="milad-fest-result-qr"
        />
      )}
    </section>
  );
};
