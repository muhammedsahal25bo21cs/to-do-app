'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { AdminPermissionGuard } from '@/components/admin/AdminPermissionGuard';
import { checkPublicLinks, PublicLinkAudit } from '@/lib/cmsService';
import { Compass, ExternalLink, CheckCircle2, AlertTriangle, RefreshCw, QrCode } from 'lucide-react';

function PublicLinkCheckerContent() {
  const [links, setLinks] = useState<PublicLinkAudit[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadLinks();
  }, []);

  const loadLinks = async () => {
    setIsLoading(true);
    try {
      const data = await checkPublicLinks();
      setLinks(data);
    } catch (e) {
      console.error('Error scanning public links:', e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
      {/* Header */}
      <div className="bg-emerald-950/80 border border-emerald-800/80 p-6 rounded-3xl backdrop-blur-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-emerald-100 flex items-center gap-2">
            <Compass className="w-6 h-6 text-amber-400" />
            <span>Public Link & QR Code Verification Desk</span>
          </h1>
          <p className="text-xs text-emerald-300/80 mt-1">
            Validates public URLs, destination slugs, and QR code verification endpoints before public distribution.
          </p>
        </div>

        <button
          onClick={loadLinks}
          disabled={isLoading}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-emerald-950 font-extrabold text-xs shadow-lg transition-all shrink-0"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Rescan All Public Links</span>
        </button>
      </div>

      {/* Public Links Audit Table */}
      <div className="bg-emerald-950/80 border border-emerald-800/60 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-emerald-800/60 pb-3">
          <h2 className="text-base font-bold text-emerald-100">
            Public Website Navigation & Feature Endpoints ({links.length})
          </h2>
          <span className="text-xs text-amber-300 font-extrabold bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-full">
            HTTP Status Check
          </span>
        </div>

        <div className="space-y-3">
          {links.map(item => (
            <div
              key={item.id}
              className="p-4 rounded-2xl bg-emerald-900/30 border border-emerald-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-extrabold text-emerald-100">{item.title}</h3>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    item.status === 'Valid' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' :
                    item.status === 'Disabled' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                    'bg-red-500/20 text-red-300 border border-red-500/40'
                  }`}>
                    {item.status} ({item.statusCode})
                  </span>
                </div>
                <p className="text-xs font-mono text-amber-300">{item.url}</p>
              </div>

              <div className="flex items-center gap-3">
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-emerald-950 font-black text-xs transition-all flex items-center gap-1.5"
                >
                  <span>Test Public URL</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function PublicLinkCheckerGuardPage() {
  return (
    <AdminPermissionGuard featureKey="users" featureLabel="Public Link & QR Verification">
      <PublicLinkCheckerContent />
    </AdminPermissionGuard>
  );
}
