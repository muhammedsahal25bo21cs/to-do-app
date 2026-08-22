'use client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

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
import { 
  downloadElementAsPNG, 
  copyTextToClipboard 
} from '@/lib/qrCodeService';
import { 
  ArrowLeft, 
  Download, 
  Share2, 
  Check, 
  Loader2, 
  Lock, 
  AlertTriangle,
  MessageSquare,
  Copy,
  Printer,
  Smartphone,
  LayoutGrid
} from 'lucide-react';

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
  const [copiedLink, setCopiedLink] = useState(false);
  const [isDownloadingPNG, setIsDownloadingPNG] = useState(false);
  const [posterAspectRatio, setPosterAspectRatio] = useState<'4:5' | '9:16'>('4:5');

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

  const handleDownloadPNG = async () => {
    setIsDownloadingPNG(true);
    try {
      await downloadElementAsPNG('result-poster-element', `poster-${programmeSlug}-${categorySlug}`);
    } finally {
      setIsDownloadingPNG(false);
    }
  };

  const handleWhatsAppShare = () => {
    const title = `${programme?.title_en || 'Result'} (${category?.name_en || 'General'})`;
    const url = typeof window !== 'undefined' ? window.location.href : '';
    const message = encodeURIComponent(`🏆 *Milad Fest 2K26 Official Result Poster*\n*${title}*\n\nView official result poster:\n${url}`);
    window.open(`https://api.whatsapp.com/send?text=${message}`, '_blank');
  };

  const handleCopyLink = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    const success = await copyTextToClipboard(url);
    if (success) {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
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
        {/* Aspect Ratio Switcher & Action Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 print:hidden bg-emerald-900/40 p-4 rounded-3xl border border-emerald-800/60 shadow-xl">
          <Link
            href="/results"
            className="inline-flex items-center gap-2 text-xs font-bold text-amber-400 hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>All Results</span>
          </Link>

          {/* Format Switcher */}
          <div className="flex items-center gap-1 bg-emerald-950 p-1 rounded-2xl border border-emerald-800">
            <button
              onClick={() => setPosterAspectRatio('4:5')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                posterAspectRatio === '4:5'
                  ? 'bg-amber-500 text-emerald-950 shadow-md'
                  : 'text-emerald-300 hover:text-emerald-100'
              }`}
            >
              4:5 Feed Poster
            </button>
            <button
              onClick={() => setPosterAspectRatio('9:16')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                posterAspectRatio === '9:16'
                  ? 'bg-amber-500 text-emerald-950 shadow-md'
                  : 'text-emerald-300 hover:text-emerald-100'
              }`}
            >
              9:16 Story / Status
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Direct WhatsApp Share */}
            <button
              onClick={handleWhatsAppShare}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold transition-all shadow-md"
              title="Share directly to WhatsApp"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </button>

            {/* Copy Link */}
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-emerald-900 hover:bg-emerald-800 text-emerald-200 border border-emerald-700 text-xs font-bold transition-all"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-amber-400" />}
              <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
            </button>

            {/* Modal Share & QR */}
            <button
              onClick={() => setIsShareModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-emerald-900/80 hover:bg-emerald-800 text-emerald-200 border border-emerald-700 text-xs font-bold transition-all"
            >
              <Share2 className="w-3.5 h-3.5 text-amber-400" />
              <span>Share QR</span>
            </button>

            {/* Download PNG */}
            <button
              onClick={handleDownloadPNG}
              disabled={isDownloadingPNG}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-emerald-950 text-xs font-black transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50"
            >
              {isDownloadingPNG ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
              <span>Download PNG</span>
            </button>
          </div>
        </div>

        {/* Public Result Poster Renderer (STRICTLY NO SCORES EXPOSED) */}
        {siteSettings && (
          <ResultPosterRenderer
            settings={siteSettings}
            programmeTitle={programme?.title_en || 'Programme'}
            categoryName={category?.name_en || 'General Category'}
            gender={programme?.gender}
            venue={programme?.venue}
            eventDate={programme?.event_date}
            results={results}
            template={results[0]?.poster_template || 'royal-gold'}
            aspectRatio={posterAspectRatio}
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
