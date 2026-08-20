'use client';

import React, { useEffect, useState } from 'react';
import { 
  getProgrammes, 
  getCategories, 
  getProgrammeResults, 
  generateProgrammeResults, 
  publishProgrammeResults, 
  unpublishProgrammeResults,
  updateResultPosterCustomization,
  saveScore,
  getProgrammeRegistrations,
  Programme, 
  Category, 
  ProgrammeResult, 
  slugify 
} from '@/lib/cmsService';
import { ConfirmModal } from '@/components/admin/ConfirmModal';
import { Trophy, Sparkles, EyeOff, RefreshCw, AlertCircle, Edit3, Save, ExternalLink, Settings2, Eye, X } from 'lucide-react';

export default function ResultsAdmin() {
  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedProgrammeId, setSelectedProgrammeId] = useState<string>('');
  const [results, setResults] = useState<ProgrammeResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Poster Editor & Preview Modals
  const [isPosterEditorOpen, setIsPosterEditorOpen] = useState(false);
  const [isPreviewPosterOpen, setIsPreviewPosterOpen] = useState(false);
  const [posterTitle, setPosterTitle] = useState('OFFICIAL COMPETITION RESULT');
  const [posterTemplate, setPosterTemplate] = useState<'classic-islamic' | 'royal-gold' | 'minimalist-emerald' | 'modern-islamic'>('royal-gold');

  // Score correction modal
  const [editingResult, setEditingResult] = useState<ProgrammeResult | null>(null);
  const [correctionScore, setCorrectionScore] = useState<number>(0);

  // Publish Confirm Modal
  const [isPublishConfirmOpen, setIsPublishConfirmOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (selectedProgrammeId) {
      loadResults(selectedProgrammeId);
    }
  }, [selectedProgrammeId]);

  const loadInitialData = async () => {
    setIsLoading(true);
    const [prg, cat] = await Promise.all([
      getProgrammes(false),
      getCategories(),
    ]);
    setProgrammes(prg);
    setCategories(cat);
    if (prg.length > 0) {
      setSelectedProgrammeId(prg[0].id);
    }
    setIsLoading(false);
  };

  const loadResults = async (prgId: string) => {
    setErrorMsg(null);
    const res = await getProgrammeResults(prgId, false);
    setResults(res);
    if (res.length > 0) {
      setPosterTitle(res[0].poster_title || 'OFFICIAL COMPETITION RESULT');
      setPosterTemplate(res[0].poster_template || 'royal-gold');
    }
  };

  const handleGenerate = async () => {
    try {
      setErrorMsg(null);
      await generateProgrammeResults(selectedProgrammeId);
      await loadResults(selectedProgrammeId);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to generate results.');
    }
  };

  const handleSavePosterCustomization = async () => {
    await updateResultPosterCustomization(selectedProgrammeId, {
      poster_title: posterTitle,
      poster_template: posterTemplate,
    });
    setIsPosterEditorOpen(false);
    await loadResults(selectedProgrammeId);
  };

  const handlePublishConfirm = async () => {
    await publishProgrammeResults(selectedProgrammeId);
    setIsPublishConfirmOpen(false);
    await loadResults(selectedProgrammeId);
  };

  const handleUnpublish = async () => {
    await unpublishProgrammeResults(selectedProgrammeId);
    await loadResults(selectedProgrammeId);
  };

  const handleOpenScoreCorrection = (res: ProgrammeResult) => {
    setEditingResult(res);
    setCorrectionScore(res.score);
  };

  const handleSaveCorrection = async () => {
    if (!editingResult) return;
    try {
      const regs = await getProgrammeRegistrations(selectedProgrammeId);
      const reg = regs.find(r => r.student_id === editingResult.student_id || r.team_id === editingResult.team_id);
      if (!reg) throw new Error('Registration record not found.');

      await saveScore(
        selectedProgrammeId,
        reg.id,
        editingResult.student_id,
        editingResult.team_id,
        correctionScore,
        editingResult.max_score
      );

      await generateProgrammeResults(selectedProgrammeId);
      if (editingResult.is_published) {
        await publishProgrammeResults(selectedProgrammeId);
      }

      setEditingResult(null);
      await loadResults(selectedProgrammeId);
    } catch (err: any) {
      alert(err.message || 'Error executing score correction.');
    }
  };

  const currentProgramme = programmes.find(p => p.id === selectedProgrammeId);
  const currentCategory = currentProgramme ? categories.find(c => c.id === currentProgramme.category_id) : null;
  const isAnyPublished = results.some(r => r.is_published);

  const prgSlug = currentProgramme ? (currentProgramme.slug || slugify(currentProgramme.title_en)) : 'programme';
  const catSlug = currentCategory ? (currentCategory.slug || slugify(currentCategory.name_en)) : 'general';

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="bg-emerald-950/80 border border-emerald-800/80 p-6 rounded-3xl backdrop-blur-xl">
        <h1 className="text-2xl font-black text-emerald-100 flex items-center gap-2">
          <Trophy className="w-6 h-6 text-amber-400" />
          <span>Result Ranking Generator & Poster Publishing</span>
        </h1>
        <p className="text-xs text-emerald-300/80 mt-1">
          Generate rankings, preview official Islamic Nabidinam posters, correct scores, and publish results live.
        </p>
      </div>

      {/* Control Bar */}
      <div className="bg-emerald-950/80 border border-emerald-800/80 rounded-3xl p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2 flex-1">
          <label className="block text-xs font-extrabold text-amber-300">Select Programme Event *</label>
          <select
            value={selectedProgrammeId}
            onChange={(e) => setSelectedProgrammeId(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-emerald-900 border border-emerald-700 text-emerald-100 text-xs font-bold"
          >
            {programmes.map(p => {
              const cat = categories.find(c => c.id === p.category_id);
              return (
                <option key={p.id} value={p.id}>
                  {p.title_en} [{cat?.name_en || 'General'}]
                </option>
              );
            })}
          </select>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0 pt-2 sm:pt-4">
          <button
            onClick={handleGenerate}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-800 hover:bg-emerald-700 text-amber-300 font-extrabold text-xs border border-emerald-600 transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Generate Rankings</span>
          </button>

          <button
            onClick={() => setIsPreviewPosterOpen(true)}
            disabled={results.length === 0}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-900 hover:bg-emerald-800 text-emerald-200 border border-emerald-700 font-bold text-xs transition-colors disabled:opacity-50"
          >
            <Eye className="w-4 h-4 text-amber-400" />
            <span>Preview Poster</span>
          </button>

          <button
            onClick={() => setIsPosterEditorOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-900 hover:bg-emerald-800 text-emerald-200 border border-emerald-700 font-bold text-xs transition-colors"
          >
            <Settings2 className="w-4 h-4 text-amber-400" />
            <span>Customize Poster</span>
          </button>

          {isAnyPublished ? (
            <div className="flex items-center gap-2">
              <a
                href={`/results/${prgSlug}/${catSlug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-sky-500/20 text-sky-300 border border-sky-500/40 text-xs font-bold hover:bg-sky-500/30"
              >
                <span>View Live Poster</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <button
                onClick={handleUnpublish}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 font-extrabold text-xs transition-all"
              >
                <EyeOff className="w-4 h-4" />
                <span>Unpublish</span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsPublishConfirmOpen(true)}
              disabled={results.length === 0}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-emerald-950 font-extrabold text-xs shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>Publish Live Result</span>
            </button>
          )}
        </div>
      </div>

      {/* Error Alert */}
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/40 text-red-300 text-xs font-bold flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Admin Result Overview Table */}
      <div className="bg-emerald-950/80 border border-emerald-800/60 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-emerald-800/60 pb-3">
          <div>
            <h2 className="text-base font-bold text-emerald-100">
              {currentProgramme?.title_en} ({currentCategory?.name_en || 'General'})
            </h2>
            <p className="text-xs text-emerald-400/80">
              {results.length} Ranked Competitors • Max Score: {currentProgramme?.max_score || 100}
            </p>
          </div>

          <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
            isAnyPublished ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
          }`}>
            {isAnyPublished ? 'Official Live Result' : 'Draft Result Sheet'}
          </span>
        </div>

        {results.length === 0 ? (
          <div className="text-center py-12 text-emerald-400/60 space-y-3">
            <Trophy className="w-10 h-10 text-emerald-700 mx-auto" />
            <p>No results generated yet for this programme category.</p>
            <p className="text-xs text-amber-300 font-semibold">Click "Generate Rankings" to compute ranks and points from entered scores.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {results.map((res) => {
              const isGold = res.rank === 1;
              const isSilver = res.rank === 2;
              const isBronze = res.rank === 3;

              return (
                <div
                  key={res.id}
                  className={`p-4 rounded-2xl border flex items-center justify-between gap-4 ${
                    isGold ? 'bg-amber-500/10 border-amber-500/40' :
                    isSilver ? 'bg-slate-500/10 border-slate-400/30' :
                    isBronze ? 'bg-amber-900/10 border-amber-700/30' :
                    'bg-emerald-900/30 border-emerald-800'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs border ${
                      isGold ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-emerald-950 border-amber-300' :
                      isSilver ? 'bg-gradient-to-br from-slate-300 to-slate-400 text-slate-950 border-slate-200' :
                      isBronze ? 'bg-gradient-to-br from-amber-700 to-amber-900 text-amber-100 border-amber-600' :
                      'bg-emerald-900 text-emerald-200 border-emerald-800'
                    }`}>
                      {isGold ? '🥇 1' : isSilver ? '🥈 2' : isBronze ? '🥉 3' : `#${res.rank}`}
                    </div>

                    <div>
                      <h3 className="text-sm font-extrabold text-emerald-100">{res.student_name_en}</h3>
                      <p className="text-xs text-amber-400 font-semibold">Team: {res.team_name_en}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right">
                      <span className="text-xs text-emerald-400 font-bold">{res.score} / {res.max_score}</span>
                      <span className="text-[10px] text-amber-300 font-black block">+{res.points} pts</span>
                    </div>

                    <button
                      onClick={() => handleOpenScoreCorrection(res)}
                      className="p-2 rounded-xl bg-emerald-900 hover:bg-emerald-800 text-amber-300 border border-emerald-700"
                      title="Correct Score & Recalculate"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Interactive Poster Preview Modal */}
      {isPreviewPosterOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-emerald-950 border-2 border-amber-500/50 rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl space-y-6 text-center relative overflow-hidden my-8">
            <button
              onClick={() => setIsPreviewPosterOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-emerald-400 hover:text-white hover:bg-emerald-900 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[11px] font-black uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Result Poster Preview (No Points Shown)</span>
            </div>

            <div className="bg-gradient-to-b from-emerald-950 via-emerald-900 to-emerald-950 border-2 border-amber-500/60 rounded-2xl p-6 space-y-6 text-center">
              <div className="space-y-1">
                <h3 className="text-2xl font-black text-gold-gradient">{currentProgramme?.title_en}</h3>
                <span className="inline-block px-4 py-1 rounded-full bg-amber-500 text-emerald-950 font-black text-xs uppercase">
                  {currentCategory?.name_en || 'General Category'}
                </span>
              </div>

              <div className="space-y-3 text-left max-w-md mx-auto">
                {results.slice(0, 3).map((res) => (
                  <div key={res.id} className="p-3.5 rounded-2xl bg-emerald-900/60 border border-amber-500/40 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{res.rank === 1 ? '🥇' : res.rank === 2 ? '🥈' : '🥉'}</span>
                      <div>
                        <span className="text-[10px] font-black uppercase text-amber-300 block">{res.rank === 1 ? '1st Place' : res.rank === 2 ? '2nd Place' : '3rd Place'}</span>
                        <h4 className="text-sm font-extrabold text-emerald-100">{res.student_name_en}</h4>
                        <p className="text-xs text-amber-400 font-semibold">Team: {res.team_name_en}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-emerald-800/60">
              <button
                onClick={() => setIsPreviewPosterOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-emerald-800 text-emerald-300 text-xs font-semibold"
              >
                Back to Edit
              </button>
              
              {!isAnyPublished && (
                <button
                  onClick={() => {
                    setIsPreviewPosterOpen(false);
                    setIsPublishConfirmOpen(true);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-emerald-950 font-extrabold text-xs shadow-lg shadow-amber-500/20"
                >
                  Publish Result Poster Now
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Poster Customization Modal */}
      {isPosterEditorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-emerald-950 border border-emerald-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 relative">
            <button
              onClick={() => setIsPosterEditorOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-emerald-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-base font-bold text-emerald-100">Poster Customization Editor</h2>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-amber-300 mb-1">Result Poster Header Title *</label>
                <input
                  type="text"
                  value={posterTitle}
                  onChange={(e) => setPosterTitle(e.target.value)}
                  placeholder="OFFICIAL COMPETITION RESULT"
                  className="w-full px-3.5 py-2 rounded-xl bg-emerald-900/40 border border-emerald-800 text-emerald-100"
                />
              </div>

              <div>
                <label className="block font-bold text-amber-300 mb-1">Poster Visual Theme</label>
                <select
                  value={posterTemplate}
                  onChange={(e: any) => setPosterTemplate(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-emerald-900 border border-emerald-800 text-emerald-100 font-bold"
                >
                  <option value="royal-gold">Royal Gold Fest Edition</option>
                  <option value="classic-islamic">Classic Islamic Emerald</option>
                  <option value="minimalist-emerald">Minimalist Editorial</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-emerald-800/60">
              <button
                onClick={() => setIsPosterEditorOpen(false)}
                className="px-4 py-2 rounded-xl border border-emerald-800 text-emerald-300 text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleSavePosterCustomization}
                className="px-5 py-2 rounded-xl bg-amber-500 text-emerald-950 font-bold text-xs shadow-lg"
              >
                Save Customizations
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Score Correction Modal */}
      {editingResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-emerald-950 border border-emerald-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h2 className="text-base font-bold text-emerald-100">Score Correction Tool</h2>
            <p className="text-xs text-emerald-300/80">
              Updating score for <span className="font-bold text-amber-300">{editingResult.student_name_en}</span> will automatically recalculate rankings and update the live result poster.
            </p>

            <div>
              <label className="block text-xs font-bold text-amber-300 mb-1">New Score (Max: {editingResult.max_score})</label>
              <input
                type="number"
                value={correctionScore}
                onChange={(e) => setCorrectionScore(parseFloat(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-emerald-900 border border-emerald-800 text-amber-300 font-bold text-base"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-emerald-800/60">
              <button
                onClick={() => setEditingResult(null)}
                className="px-4 py-2 rounded-xl border border-emerald-800 text-emerald-300 text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveCorrection}
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-amber-500 text-emerald-950 font-bold text-xs shadow-lg"
              >
                <Save className="w-4 h-4" />
                <span>Save & Recalculate</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={isPublishConfirmOpen}
        onClose={() => setIsPublishConfirmOpen(false)}
        onConfirm={handlePublishConfirm}
        title="Publish Official Poster Result?"
        message={`Are you sure you want to publish the official poster result for "${currentProgramme?.title_en}" (${currentCategory?.name_en})?`}
        warningNotice={isAnyPublished ? "This result is already public. Changes may affect the published result." : undefined}
        confirmText="Publish Poster Result Now"
        isDanger={false}
      />
    </div>
  );
}
