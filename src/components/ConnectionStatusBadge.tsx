'use client';

import React, { useEffect, useState } from 'react';
import { useConnectionStatus, getOfflinePendingScores, syncOfflineScores } from '@/lib/realtimeService';
import { Wifi, WifiOff, RefreshCw, CheckCircle2 } from 'lucide-react';

export function ConnectionStatusBadge({ className = '' }: { className?: string }) {
  const status = useConnectionStatus();
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState<string | null>(null);

  useEffect(() => {
    const updateCount = () => {
      setPendingCount(getOfflinePendingScores().length);
    };
    updateCount();
    const interval = setInterval(updateCount, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleManualSync = async () => {
    setIsSyncing(true);
    setSyncMsg(null);
    const { syncedCount, failedCount } = await syncOfflineScores();
    setIsSyncing(false);
    setPendingCount(getOfflinePendingScores().length);
    if (syncedCount > 0) {
      setSyncMsg(`Synced ${syncedCount} offline item(s) cleanly.`);
      setTimeout(() => setSyncMsg(null), 4000);
    } else if (failedCount > 0) {
      setSyncMsg(`Sync failed for ${failedCount} item(s). Network may still be unstable.`);
      setTimeout(() => setSyncMsg(null), 4000);
    }
  };

  return (
    <div className={`inline-flex items-center gap-2 text-xs font-semibold ${className}`}>
      {status === 'connected' && (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-emerald-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <Wifi className="w-3.5 h-3.5" />
          <span>Connected</span>
        </span>
      )}

      {status === 'reconnecting' && (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-950/80 border border-amber-500/30 text-amber-300">
          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          <span>Reconnecting...</span>
        </span>
      )}

      {status === 'offline' && (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-950/80 border border-rose-500/30 text-rose-300">
          <WifiOff className="w-3.5 h-3.5" />
          <span>Offline</span>
        </span>
      )}

      {pendingCount > 0 && (
        <button
          onClick={handleManualSync}
          disabled={isSyncing}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-200 hover:bg-amber-500/30 transition-all text-xs"
        >
          <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
          <span>{pendingCount} Pending Sync</span>
        </button>
      )}

      {syncMsg && (
        <span className="text-[11px] text-emerald-300 flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
          {syncMsg}
        </span>
      )}
    </div>
  );
}
