'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { HeaderNav } from '@/components/HeaderNav';
import { FooterSection } from '@/components/FooterSection';
import { ResultPosterRenderer } from '@/components/posters/ResultPosterRenderer';
import { ShareModal } from '@/components/ShareModal';
import { 
  getProgrammeResultBySlugs, 
  getSiteSettings, 
  Programme, 
  Category, 
  ProgrammeResult, 
  SiteSettings 
} from '@/lib/cmsService';
import { ArrowLeft, Download, Share2, Check, Loader2, Lock, AlertTriangle } from 'lucide-react';

export default function PosterStyleResultPage() {
  const params = useParams();
  const programmeSlug = params?.programme as string;
  const categorySlug = params?.category as string;

  const [programme, setProgramme] = useState<Programme | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [results, setResults] = useState<ProgrammeResult[]>([]);
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  useEffect(() => {
    if (programmeSlug && categorySlug) {
      loadData();
    }
  }, [programmeSlug, categorySlug]);

  const loadData = async () => {
    setIsLoading(true);
    const [data, stg] = await Promise.all([
      getProgrammeResultBySlugs(programmeSlug, categorySlug),
      getSiteSettings(),
    ]);
    setProgramme(data.programme);
    setCategory(data.category);
    setResults(data.results);
    setSiteSettings(stg);
    setIsLoading(false);
  };

  const handleDownload = () => {
    window.print();
  };

  const isPublished = results.length > 0 && results.some(r => r.is_published);
  const isArchived = programme?.is_archived || category?.is_archived;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-emerald-950 text-emerald-100 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
      </div>
    );
  }

  // Safety Check: Result not published
  if (!isPublished) {
    return (
      <div className="min-h-screen bg-emerald-950 text-emerald-100 flex flex-col justify-between">
        <HeaderNav />
        <main className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto">
            <Lock className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-emerald-100">Result Not Available</h1>
          <p className="text-xs text-emerald-300/80 leading-relaxed">
            This competition result has not been published by event administrators yet.
          </p>
          <div className="pt-4">
            <Link
              href="/results"
              className="px-5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-emerald-950 font-black text-xs inline-flex items-center gap-2 shadow-lg"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Browse Published Results</span>
            </Link>
          </div>
        </main>
        <FooterSection />
      </div>
    );
  }

  // Safety Check: Archived Content
  if (isArchived) {
    return (
      <div className="min-h-screen bg-emerald-950 text-emerald-100 flex flex-col justify-between">
        <HeaderNav />
        <main className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-emerald-100">Result Archived</h1>
          <p className="text-xs text-emerald-300/80 leading-relaxed">
            This result is no longer publicly available.
          </p>
          <div className="pt-4">
            <Link
              href="/results"
              className="px-5 py-2.5 rounded-2xl bg-emerald-900 hover:bg-emerald-800 text-emerald-200 font-extrabold text-xs inline-flex items-center gap-2 border border-emerald-700"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Active Results</span>
            </Link>
          </div>
        </main>
        <FooterSection />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-emerald-950 text-emerald-100 flex flex-col justify-between print:bg-white print:text-black">
      <div className="print:hidden">
        <HeaderNav />
      </div>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-6 w-full">
        {/* Navigation & Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 print:hidden">
          <Link
            href="/results"
            className="inline-flex items-center gap-2 text-xs font-bold text-amber-400 hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Results</span>
          </Link>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsShareModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-emerald-900/80 hover:bg-emerald-800 text-emerald-200 border border-emerald-700 text-xs font-bold transition-all shadow-md"
            >
              <Share2 className="w-4 h-4 text-amber-400" />
              <span>Share Result & QR</span>
            </button>

            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-amber-500 hover:bg-amber-400 text-emerald-950 text-xs font-extrabold transition-all shadow-lg shadow-amber-500/20"
            >
              <Download className="w-4 h-4" />
              <span>Download Poster</span>
            </button>
          </div>
        </div>

        {/* Public Result Poster Renderer (STRICTLY NO SCORES EXPOSED) */}
        {siteSettings && (
          <ResultPosterRenderer
            settings={siteSettings}
            programmeTitle={programme?.title_en || 'Programme'}
            categoryName={category?.name_en || 'General Category'}
            results={results}
            template={results[0]?.poster_template || 'royal-gold'}
            posterTitle={results[0]?.poster_title || 'OFFICIAL COMPETITION RESULT'}
            customFooterText={results[0]?.custom_footer_text}
            displayPositionsCount={3}
          />
        )}

        <ShareModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          title={`${programme?.title_en || 'Result'} (${category?.name_en || 'General'})`}
          subtitle="Official Published Competition Result"
          urlParams={{
            type: 'result',
            programmeSlug,
            categorySlug,
          }}
          filename={`result-${programmeSlug}-${categorySlug}`}
        />
      </main>

      <div className="print:hidden">
        <FooterSection />
      </div>
    </div>
  );
}
