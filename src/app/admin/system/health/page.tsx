'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { AdminPermissionGuard } from '@/components/admin/AdminPermissionGuard';
import { 
  checkSystemHealth, 
  auditDataIntegrity, 
  SystemHealthStatus, 
  DataIntegrityAnomaly 
} from '@/lib/cmsService';
import { 
  Activity, 
  Database, 
  ShieldCheck, 
  HardDrive, 
  Radio, 
  Globe, 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCw, 
  ArrowRight,
  Sparkles,
  Search,
  ExternalLink
} from 'lucide-react';

function SystemHealthContent() {
  const [health, setHealth] = useState<SystemHealthStatus | null>(null);
  const [anomalies, setAnomalies] = useState<DataIntegrityAnomaly[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuditing, setIsAuditing] = useState(false);

  useEffect(() => {
    loadHealthAndAudit();
  }, []);

  const loadHealthAndAudit = async () => {
    setIsLoading(true);
    setIsAuditing(true);
    try {
      const [hData, aData] = await Promise.all([
        checkSystemHealth(),
        auditDataIntegrity(),
      ]);
      setHealth(hData);
      setAnomalies(aData);
    } catch (e) {
      console.error('Error running system health check:', e);
    } finally {
      setIsLoading(false);
      setIsAuditing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 text-amber-400 gap-3 font-bold text-xs">
        <Activity className="w-8 h-8 animate-spin" />
        <span>Running System Health Diagnostic & Data Integrity Audit...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      
      {/* Header Banner */}
      <div className="bg-emerald-950/80 border border-emerald-800/80 p-6 rounded-3xl backdrop-blur-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 font-extrabold text-xs flex items-center gap-1.5 uppercase tracking-wider">
              <Activity className="w-3.5 h-3.5" />
              <span>Production Quality Control</span>
            </span>
          </div>
          <h1 className="text-2xl font-black text-emerald-100 flex items-center gap-2">
            <span>System Health & Data Integrity Audit</span>
          </h1>
          <p className="text-xs text-emerald-300/80 mt-1">
            Real-time infrastructure health checks, schema integrity verification, and anomaly detection across all 16 event database entities.
          </p>
        </div>

        <button
          onClick={loadHealthAndAudit}
          disabled={isAuditing}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-emerald-950 font-extrabold text-xs shadow-lg transition-all shrink-0"
        >
          <RefreshCw className={`w-4 h-4 ${isAuditing ? 'animate-spin' : ''}`} />
          <span>Run Full Integrity Audit</span>
        </button>
      </div>

      {/* Subsystems Health Dashboard Grid */}
      <div className="space-y-4">
        <h2 className="text-base font-extrabold text-emerald-100 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-400" />
          <span>Core Infrastructure Subsystems</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          
          {/* Database Card */}
          <div className="p-5 rounded-3xl bg-emerald-950/80 border border-emerald-800 space-y-3">
            <div className="flex items-center justify-between">
              <Database className="w-5 h-5 text-amber-400" />
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                health?.database.status === 'Connected' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' :
                health?.database.status === 'Warning' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                'bg-red-500/20 text-red-300 border border-red-500/40'
              }`}>
                {health?.database.status}
              </span>
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-emerald-100">Database Engine</h3>
              <p className="text-[11px] text-emerald-400/80 mt-1">{health?.database.message}</p>
            </div>
            <div className="pt-2 border-t border-emerald-800/40 text-[10px] text-amber-300 font-mono">
              Latency: {health?.database.latencyMs} ms
            </div>
          </div>

          {/* Auth Card */}
          <div className="p-5 rounded-3xl bg-emerald-950/80 border border-emerald-800 space-y-3">
            <div className="flex items-center justify-between">
              <ShieldCheck className="w-5 h-5 text-amber-400" />
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                health?.auth.status === 'Connected' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' :
                health?.auth.status === 'Warning' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                'bg-red-500/20 text-red-300 border border-red-500/40'
              }`}>
                {health?.auth.status}
              </span>
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-emerald-100">Supabase Auth</h3>
              <p className="text-[11px] text-emerald-400/80 mt-1">{health?.auth.message}</p>
            </div>
            <div className="pt-2 border-t border-emerald-800/40 text-[10px] text-emerald-300 font-mono">
              Session Persist Active
            </div>
          </div>

          {/* Storage Card */}
          <div className="p-5 rounded-3xl bg-emerald-950/80 border border-emerald-800 space-y-3">
            <div className="flex items-center justify-between">
              <HardDrive className="w-5 h-5 text-amber-400" />
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                health?.storage.status === 'Connected' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' :
                health?.storage.status === 'Warning' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                'bg-red-500/20 text-red-300 border border-red-500/40'
              }`}>
                {health?.storage.status}
              </span>
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-emerald-100">Media Storage</h3>
              <p className="text-[11px] text-emerald-400/80 mt-1">{health?.storage.message}</p>
            </div>
            <div className="pt-2 border-t border-emerald-800/40 text-[10px] text-emerald-300 font-mono">
              Posters & Gallery Buckets
            </div>
          </div>

          {/* Realtime Card */}
          <div className="p-5 rounded-3xl bg-emerald-950/80 border border-emerald-800 space-y-3">
            <div className="flex items-center justify-between">
              <Radio className="w-5 h-5 text-amber-400" />
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                health?.realtime.status === 'Connected' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' :
                health?.realtime.status === 'Warning' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                'bg-red-500/20 text-red-300 border border-red-500/40'
              }`}>
                {health?.realtime.status}
              </span>
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-emerald-100">Supabase Realtime</h3>
              <p className="text-[11px] text-emerald-400/80 mt-1">{health?.realtime.message}</p>
            </div>
            <div className="pt-2 border-t border-emerald-800/40 text-[10px] text-emerald-300 font-mono">
              WebSocket Channel Sync
            </div>
          </div>

          {/* Public Website Card */}
          <div className="p-5 rounded-3xl bg-emerald-950/80 border border-emerald-800 space-y-3">
            <div className="flex items-center justify-between">
              <Globe className="w-5 h-5 text-amber-400" />
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                health?.publicWebsite.status === 'Connected' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' :
                health?.publicWebsite.status === 'Warning' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                'bg-red-500/20 text-red-300 border border-red-500/40'
              }`}>
                {health?.publicWebsite.status}
              </span>
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-emerald-100">Public Portal</h3>
              <p className="text-[11px] text-emerald-400/80 mt-1">{health?.publicWebsite.message}</p>
            </div>
            <div className="pt-2 border-t border-emerald-800/40 text-[10px] text-emerald-300 font-mono">
              Live Visitor Pages
            </div>
          </div>

        </div>
      </div>

      {/* Data Integrity Anomaly Detector */}
      <div className="bg-emerald-950/80 border border-emerald-800/60 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-emerald-800/60 pb-3">
          <div>
            <h2 className="text-base font-extrabold text-emerald-100 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              <span>Data Integrity Anomaly Inspector</span>
            </h2>
            <p className="text-xs text-emerald-400/80">
              Scans for duplicate registrations, unverified scores in generated results, or invalid certificates.
            </p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
            anomalies.length === 0 ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
          }`}>
            {anomalies.length} Anomalies Found
          </span>
        </div>

        {anomalies.length === 0 ? (
          <div className="p-8 text-center bg-emerald-900/20 border border-emerald-800/60 rounded-2xl space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
            <h3 className="text-sm font-extrabold text-emerald-100">All Database Records Clean & Verified!</h3>
            <p className="text-xs text-emerald-400/80">Zero duplicate registrations, unverified scores, or broken result references detected.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {anomalies.map(anom => (
              <div key={anom.id} className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-black uppercase">
                      {anom.category}
                    </span>
                    <span className="text-xs font-bold text-amber-400">{anom.severity} Priority</span>
                  </div>
                  <h4 className="text-sm font-extrabold text-emerald-100">{anom.title}</h4>
                  <p className="text-xs text-emerald-300/80">{anom.details}</p>
                </div>

                <Link
                  href={anom.actionUrl}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-emerald-950 font-black text-xs shrink-0 transition-all flex items-center justify-center gap-1.5"
                >
                  <span>{anom.actionLabel}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}

export default function SystemHealthGuardPage() {
  return (
    <AdminPermissionGuard featureKey="users" featureLabel="System Health & Quality Control">
      <SystemHealthContent />
    </AdminPermissionGuard>
  );
}
