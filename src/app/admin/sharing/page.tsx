'use client';

import React, { useEffect, useState } from 'react';
import { 
  getProgrammes, 
  getCategories, 
  getProgrammeResults, 
  getSiteSettings, 
  Programme, 
  Category, 
  SiteSettings, 
  ProgrammeResult 
} from '@/lib/cmsService';
import { 
  buildSmartPublicUrl, 
  copyTextToClipboard, 
  downloadQRCodePNG, 
  generateQRCodeDataURL, 
  shareNativeUrl 
} from '@/lib/qrCodeService';
import { ShareModal } from '@/components/ShareModal';
import { 
  QrCode, 
  Share2, 
  Copy, 
  Download, 
  ExternalLink, 
  Search, 
  RefreshCw, 
  Check, 
  Sparkles, 
  Trophy, 
  Calendar, 
  Award,
  Globe
} from 'lucide-react';

interface ShareableResource {
  id: string;
  type: 'Event Homepage' | 'Programme' | 'Category' | 'Published Result' | 'Leaderboard';
  title: string;
  subtitle: string;
  url: string;
  programmeSlug?: string;
  categorySlug?: string;
  filters?: Record<string, string>;
  createdDate: string;
}

export default function AdminSharingManagementPage() {
  const [resources, setResources] = useState<ShareableResource[]>([]);
  const [filterType, setFilterType] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [qrCache, setQrCache] = useState<Record<string, string>>({});

  // Active Share Modal State
  const [activeModalResource, setActiveModalResource] = useState<ShareableResource | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    loadAllResources();
  }, []);

  const loadAllResources = async () => {
    setIsLoading(true);
    const [stg, prgs, cats] = await Promise.all([
      getSiteSettings(),
      getProgrammes(false, false),
      getCategories(),
    ]);

    const resList: ShareableResource[] = [];

    // 1. Event Homepage
    resList.push({
      id: 'res-event-home',
      type: 'Event Homepage',
      title: stg?.event_name_en || 'Milad Fest 2K26 Homepage',
      subtitle: 'Main Public Festival Portal',
      url: buildSmartPublicUrl({ type: 'event' }),
      createdDate: new Date().toLocaleDateString(),
    });

    // 2. Leaderboard
    resList.push({
      id: 'res-leaderboard',
      type: 'Leaderboard',
      title: 'Championship Leaderboard & Standings',
      subtitle: 'Official Total Points & Roster',
      url: buildSmartPublicUrl({ type: 'leaderboard' }),
      createdDate: new Date().toLocaleDateString(),
    });

    // 3. Categories
    cats.forEach(c => {
      resList.push({
        id: `res-cat-${c.id}`,
        type: 'Category',
        title: `${c.name_en} Category`,
        subtitle: 'Filtered Competition Roster',
        url: buildSmartPublicUrl({ type: 'programme', filters: { category: c.slug || c.id } }),
        createdDate: new Date().toLocaleDateString(),
      });
    });

    // 4. Programmes
    for (const p of prgs) {
      const cat = cats.find(c => c.id === p.category_id);
      resList.push({
        id: `res-prg-${p.id}`,
        type: 'Programme',
        title: p.title_en,
        subtitle: `${cat?.name_en || 'General'} • ${p.venue}`,
        url: buildSmartPublicUrl({ type: 'programme', programmeSlug: p.slug }),
        programmeSlug: p.slug,
        createdDate: new Date().toLocaleDateString(),
      });

      // 5. Published Results (if published)
      const res = await getProgrammeResults(p.id, false);
      if (res.length > 0 && res.some(r => r.is_published)) {
        resList.push({
          id: `res-result-${p.id}`,
          type: 'Published Result',
          title: `Result: ${p.title_en}`,
          subtitle: `Official Poster Card (${cat?.name_en || 'General'})`,
          url: buildSmartPublicUrl({ type: 'result', programmeSlug: p.slug, categorySlug: cat?.slug }),
          programmeSlug: p.slug,
          categorySlug: cat?.slug,
          createdDate: new Date().toLocaleDateString(),
        });
      }
    }

    setResources(resList);

    // Pre-generate mini QR cache
    const cache: Record<string, string> = {};
    for (const item of resList.slice(0, 15)) {
      try {
        cache[item.id] = await generateQRCodeDataURL(item.url, 160);
      } catch (e) {
        // Ignore
      }
    }
    setQrCache(cache);
    setIsLoading(false);
  };

  const handleCopyLink = async (res: ShareableResource) => {
    const success = await copyTextToClipboard(res.url);
    if (success) {
      setCopiedId(res.id);
      setTimeout(() => setCopiedId(null), 2500);
    }
  };

  const handleDownloadQR = async (res: ShareableResource) => {
    try {
      await downloadQRCodePNG(res.url, `qr-${res.id}`, res.title, res.subtitle);
    } catch {
      alert('Failed to download QR code image.');
    }
  };

  const filteredResources = resources.filter(r => {
    if (filterType !== 'All' && r.type !== filterType) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return r.title.toLowerCase().includes(q) || r.subtitle.toLowerCase().includes(q) || r.url.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Top Header */}
      <div className="bg-emerald-950/80 border border-emerald-800/80 p-6 rounded-3xl backdrop-blur-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-emerald-100 flex items-center gap-2">
            <QrCode className="w-6 h-6 text-amber-400" />
            <span>Public Sharing & QR Management Desk</span>
          </h1>
          <p className="text-xs text-emerald-300/80 mt-1">
            Centralized hub to generate high-resolution QR codes, copy public URLs, and trigger native mobile sharing.
          </p>
        </div>

        <button
          onClick={loadAllResources}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-900 border border-emerald-700 text-emerald-300 font-extrabold text-xs hover:bg-emerald-800"
        >
          <RefreshCw className="w-4 h-4 text-amber-400" />
          <span>Refresh Links</span>
        </button>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-emerald-950/80 border border-emerald-800/60 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {['All', 'Programme', 'Published Result', 'Leaderboard', 'Category', 'Event Homepage'].map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border shrink-0 ${
                filterType === t
                  ? 'bg-amber-500 text-emerald-950 border-amber-500 shadow-md font-extrabold'
                  : 'bg-emerald-900/60 text-emerald-300 border-emerald-800 hover:bg-emerald-800'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="relative max-w-lg">
          <Search className="w-4 h-4 text-emerald-500 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search resource title or URL..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-emerald-900 border border-emerald-700 text-emerald-100 text-xs focus:border-amber-400 focus:outline-none"
          />
        </div>
      </div>

      {/* Resources Table Roster */}
      <div className="bg-emerald-950/80 border border-emerald-800/60 rounded-3xl p-6 shadow-xl space-y-4">
        <h2 className="text-base font-bold text-emerald-100 border-b border-emerald-800 pb-3">
          Public Resources Roster ({filteredResources.length})
        </h2>

        {isLoading ? (
          <div className="text-center py-12 text-amber-300 font-bold text-xs">
            Compiling public resource QR library...
          </div>
        ) : filteredResources.length === 0 ? (
          <div className="text-center py-12 text-emerald-400/60 text-xs font-bold">
            No public shareable resources matched your criteria.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResources.map((res) => {
              const qrThumb = qrCache[res.id];
              const isCopied = copiedId === res.id;

              return (
                <div
                  key={res.id}
                  className="p-5 rounded-3xl bg-emerald-900/30 border border-emerald-800 flex flex-col justify-between space-y-4 hover:border-amber-500/40 transition-all shadow-lg"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-black uppercase tracking-wider">
                        {res.type}
                      </span>
                      <span className="text-[10px] text-emerald-400/60 font-mono">{res.createdDate}</span>
                    </div>

                    <h3 className="text-base font-black text-emerald-100 leading-snug">{res.title}</h3>
                    <p className="text-xs text-amber-300/80 font-bold">{res.subtitle}</p>
                  </div>

                  {/* QR Preview & URL Bar */}
                  <div className="flex items-center gap-3 bg-emerald-950/80 p-3 rounded-2xl border border-emerald-800">
                    {qrThumb ? (
                      <img src={qrThumb} alt="Mini QR" className="w-14 h-14 object-contain rounded-lg border border-amber-500/40 bg-white" />
                    ) : (
                      <div className="w-14 h-14 rounded-lg bg-emerald-900 flex items-center justify-center text-amber-400">
                        <QrCode className="w-6 h-6" />
                      </div>
                    )}

                    <div className="overflow-hidden flex-1 space-y-1">
                      <span className="text-[10px] text-emerald-400 font-mono block truncate">{res.url}</span>
                      <a
                        href={res.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-400 hover:underline"
                      >
                        <span>Open URL</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-3 gap-2 pt-1">
                    <button
                      onClick={() => handleCopyLink(res)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                        isCopied
                          ? 'bg-emerald-500 text-emerald-950'
                          : 'bg-emerald-900 hover:bg-emerald-800 text-emerald-200 border border-emerald-700'
                      }`}
                    >
                      {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{isCopied ? 'Copied' : 'Copy'}</span>
                    </button>

                    <button
                      onClick={() => setActiveModalResource(res)}
                      className="py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-emerald-950 font-black text-xs flex items-center justify-center gap-1 shadow-md"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>Share</span>
                    </button>

                    <button
                      onClick={() => handleDownloadQR(res)}
                      className="py-2 px-3 rounded-xl bg-emerald-900 hover:bg-emerald-800 border border-emerald-700 text-amber-300 font-bold text-xs flex items-center justify-center gap-1"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>QR</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {activeModalResource && (
        <ShareModal
          isOpen={true}
          onClose={() => setActiveModalResource(null)}
          title={activeModalResource.title}
          subtitle={activeModalResource.subtitle}
          urlParams={{
            type: activeModalResource.type === 'Programme' ? 'programme' : activeModalResource.type === 'Published Result' ? 'result' : activeModalResource.type === 'Leaderboard' ? 'leaderboard' : 'event',
            programmeSlug: activeModalResource.programmeSlug,
            categorySlug: activeModalResource.categorySlug,
            filters: activeModalResource.filters,
          }}
          filename={`qr-${activeModalResource.id}`}
        />
      )}
    </div>
  );
}
