'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  getSiteSettings, 
  getProgrammes, 
  getCategories, 
  getProgrammeResults, 
  updateResultPosterCustomization,
  publishProgrammeResults,
  SiteSettings, 
  Programme, 
  Category, 
  ProgrammeResult 
} from '@/lib/cmsService';
import { ResultPosterRenderer } from '@/components/posters/ResultPosterRenderer';
import { ShareModal } from '@/components/ShareModal';
import { buildSmartPublicUrl } from '@/lib/qrCodeService';
import { Sparkles, Save, Eye, ArrowLeft, Palette, Sliders, CheckCircle2, Award, QrCode, Share2, LayoutGrid } from 'lucide-react';

export default function ResultPosterStudioPage() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedProgrammeId, setSelectedProgrammeId] = useState<string>('');
  const [results, setResults] = useState<ProgrammeResult[]>([]);

  // Customization Controls State
  const [posterTitle, setPosterTitle] = useState('OFFICIAL COMPETITION RESULT');
  const [template, setTemplate] = useState<'classic-islamic' | 'royal-gold' | 'minimalist-emerald' | 'modern-islamic'>('royal-gold');
  const [aspectRatio, setAspectRatio] = useState<'4:5' | '9:16'>('4:5');
  const [customFooter, setCustomFooter] = useState('');
  const [displayCount, setDisplayCount] = useState(3);
  const [specialAwardTitle, setSpecialAwardTitle] = useState('');
  const [specialAwardWinner, setSpecialAwardWinner] = useState('');
  const [showQRCode, setShowQRCode] = useState(true);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedProgrammeId) {
      loadProgrammeResultsData(selectedProgrammeId);
    }
  }, [selectedProgrammeId]);

  const loadData = async () => {
    const [stg, prgs, cats] = await Promise.all([
      getSiteSettings(),
      getProgrammes(false, false),
      getCategories(),
    ]);
    setSettings(stg);
    setProgrammes(prgs);
    setCategories(cats);

    if (prgs.length > 0) {
      setSelectedProgrammeId(prgs[0].id);
    }
  };

  const loadProgrammeResultsData = async (prgId: string) => {
    const res = await getProgrammeResults(prgId, false);
    setResults(res);

    if (res.length > 0) {
      setPosterTitle(res[0].poster_title || 'OFFICIAL COMPETITION RESULT');
      setTemplate(res[0].poster_template || 'royal-gold');
      setCustomFooter(res[0].custom_footer_text || '');
    }
  };

  const handleSavePosterSettings = async (andPublish = false) => {
    if (!selectedProgrammeId) return;
    setIsSaving(true);

    await updateResultPosterCustomization(selectedProgrammeId, {
      poster_title: posterTitle,
      poster_template: template,
      custom_footer_text: customFooter,
    });

    if (andPublish) {
      await publishProgrammeResults(selectedProgrammeId);
    }

    setIsSaving(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const activeProgramme = programmes.find(p => p.id === selectedProgrammeId);
  const activeCategory = categories.find(c => c.id === activeProgramme?.category_id);

  if (!settings) return <div className="p-8 text-center text-emerald-300">Loading Poster Studio...</div>;

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Top Header */}
      <div className="bg-emerald-950/80 border border-emerald-800/80 p-6 rounded-3xl backdrop-blur-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-emerald-100 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-amber-400" />
            <span>Professional Islamic Result Poster Studio</span>
          </h1>
          <p className="text-xs text-emerald-300/80 mt-1">
            Design and publish official event result posters with 4:5 Feed & 9:16 Story templates and real-time live preview.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsShareModalOpen(true)}
            disabled={!selectedProgrammeId}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-500/40 font-extrabold text-xs"
          >
            <Share2 className="w-4 h-4" />
            <span>Share & QR</span>
          </button>

          <Link
            href="/admin/results"
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-emerald-900 border border-emerald-700 text-emerald-300 font-extrabold text-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Results Desk</span>
          </Link>

          <button
            onClick={() => handleSavePosterSettings(true)}
            disabled={isSaving || !selectedProgrammeId}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-emerald-950 font-extrabold text-xs shadow-lg transition-all"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Publishing...' : 'Save & Publish Poster'}</span>
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Poster customizations saved and published cleanly!</span>
        </div>
      )}

      {/* Side-by-Side Studio Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Studio Controls Configurator (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-emerald-950/80 border border-emerald-800/60 rounded-3xl p-6 shadow-xl space-y-5">
            <h2 className="text-base font-bold text-emerald-100 border-b border-emerald-800/60 pb-3 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-amber-400" />
              <span>Poster Studio Controls</span>
            </h2>

            {/* Select Programme */}
            <div>
              <label className="block text-xs font-bold text-amber-300 mb-1">Select Programme *</label>
              <select
                value={selectedProgrammeId}
                onChange={(e) => setSelectedProgrammeId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-emerald-900 border border-emerald-700 text-emerald-100 text-xs font-bold focus:border-amber-400 focus:outline-none"
              >
                {programmes.map((p) => (
                  <option key={p.id} value={p.id}>{p.title_en} ({p.code || 'PRG'})</option>
                ))}
              </select>
            </div>

            {/* Aspect Ratio Canvas Format */}
            <div>
              <label className="block text-xs font-bold text-amber-300 mb-1">Canvas Aspect Ratio *</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setAspectRatio('4:5')}
                  className={`py-2 px-3 rounded-xl text-xs font-extrabold border transition-all ${
                    aspectRatio === '4:5'
                      ? 'bg-amber-500 text-emerald-950 border-amber-400 shadow'
                      : 'bg-emerald-900/60 text-emerald-200 border-emerald-700 hover:bg-emerald-800'
                  }`}
                >
                  4:5 Feed (1080x1350)
                </button>

                <button
                  type="button"
                  onClick={() => setAspectRatio('9:16')}
                  className={`py-2 px-3 rounded-xl text-xs font-extrabold border transition-all ${
                    aspectRatio === '9:16'
                      ? 'bg-amber-500 text-emerald-950 border-amber-400 shadow'
                      : 'bg-emerald-900/60 text-emerald-200 border-emerald-700 hover:bg-emerald-800'
                  }`}
                >
                  9:16 Story (1080x1920)
                </button>
              </div>
            </div>

            {/* Poster Template Switcher */}
            <div>
              <label className="block text-xs font-bold text-amber-300 mb-1">Islamic Template Style *</label>
              <select
                value={template}
                onChange={(e: any) => setTemplate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-emerald-900 border border-emerald-700 text-amber-300 text-xs font-extrabold focus:border-amber-400 focus:outline-none"
              >
                <option value="royal-gold">Template 1: Royal Gold & Emerald Frame</option>
                <option value="classic-islamic">Template 2: Classic Islamic Arch</option>
                <option value="modern-islamic">Template 3: Modern Islamic Geometric</option>
                <option value="minimalist-emerald">Template 4: Minimal Editorial Result</option>
              </select>
            </div>

            {/* Display Positions Count */}
            <div>
              <label className="block text-xs font-bold text-amber-300 mb-1">Positions to Display</label>
              <select
                value={displayCount}
                onChange={(e) => setDisplayCount(parseInt(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl bg-emerald-900 border border-emerald-700 text-emerald-100 text-xs font-bold"
              >
                <option value={3}>Top 3 Winners Only (🥇 🥈 🥉)</option>
                <option value={5}>Top 5 Winners</option>
                <option value={10}>Top 10 Winners</option>
                <option value={99}>All Ranked Competitors</option>
              </select>
            </div>

            {/* Poster Title Heading */}
            <div>
              <label className="block text-xs font-bold text-amber-300 mb-1">Poster Header Title</label>
              <input
                type="text"
                value={posterTitle}
                onChange={(e) => setPosterTitle(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-emerald-900 border border-emerald-700 text-emerald-100 text-xs font-bold focus:border-amber-400 focus:outline-none"
              />
            </div>

            {/* Custom Footer */}
            <div>
              <label className="block text-xs font-bold text-amber-300 mb-1">Custom Footer Text</label>
              <input
                type="text"
                value={customFooter}
                onChange={(e) => setCustomFooter(e.target.value)}
                placeholder="e.g. Published by Raulathul Madheena Committee"
                className="w-full px-4 py-2.5 rounded-xl bg-emerald-900 border border-emerald-700 text-emerald-100 text-xs focus:border-amber-400 focus:outline-none"
              />
            </div>

            {/* Special Award Form */}
            <div className="p-3.5 rounded-2xl bg-emerald-900/30 border border-emerald-800 space-y-2">
              <span className="text-xs font-extrabold text-amber-300 flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-amber-400" />
                <span>Add Optional Special Award</span>
              </span>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Award Title (e.g. Best Performer)"
                  value={specialAwardTitle}
                  onChange={(e) => setSpecialAwardTitle(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-emerald-900 border border-emerald-700 text-emerald-100 text-[11px]"
                />
                <input
                  type="text"
                  placeholder="Winner Name"
                  value={specialAwardWinner}
                  onChange={(e) => setSpecialAwardWinner(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-emerald-900 border border-emerald-700 text-emerald-100 text-[11px]"
                />
              </div>
            </div>

            {/* QR Code Toggle */}
            <div className="p-3.5 rounded-2xl bg-emerald-900/30 border border-emerald-800 flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-200 flex items-center gap-1.5">
                <QrCode className="w-4 h-4 text-amber-400" />
                <span>Show Result QR Code on Poster</span>
              </span>
              <input
                type="checkbox"
                checked={showQRCode}
                onChange={(e) => setShowQRCode(e.target.checked)}
                className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Live Poster Preview (7 cols) */}
        <div className="lg:col-span-7 flex flex-col items-center space-y-4">
          <div className="flex items-center justify-between w-full max-w-lg px-2">
            <span className="text-xs font-black uppercase text-amber-400 tracking-wider flex items-center gap-1.5">
              <Eye className="w-4 h-4" /> Live Poster Artwork ({aspectRatio})
            </span>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-900 px-2 py-0.5 rounded border border-emerald-800 font-bold">
              {aspectRatio === '4:5' ? '1080×1350 Feed' : '1080×1920 Story'}
            </span>
          </div>

          <ResultPosterRenderer
            settings={settings}
            programmeTitle={activeProgramme?.title_en || 'Programme Title'}
            categoryName={activeCategory?.name_en || 'General Category'}
            gender={activeProgramme?.gender}
            venue={activeProgramme?.venue}
            eventDate={activeProgramme?.event_date}
            results={results}
            template={template}
            aspectRatio={aspectRatio}
            posterTitle={posterTitle}
            customFooterText={customFooter}
            displayPositionsCount={displayCount}
            specialAwards={specialAwardTitle && specialAwardWinner ? [{ title: specialAwardTitle, winnerName: specialAwardWinner }] : []}
            showQRCode={showQRCode}
            qrUrl={activeProgramme && activeCategory ? buildSmartPublicUrl({ type: 'result', programmeSlug: activeProgramme.slug, categorySlug: activeCategory.slug }) : undefined}
          />
        </div>
      </div>

      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        title={`${activeProgramme?.title_en || 'Result'} (${activeCategory?.name_en || 'General'})`}
        subtitle="Official Published Competition Result Poster"
        urlParams={{
          type: 'result',
          programmeSlug: activeProgramme?.slug,
          categorySlug: activeCategory?.slug,
        }}
        filename={`poster-${activeProgramme?.slug}-${activeCategory?.slug}`}
      />
    </div>
  );
}
