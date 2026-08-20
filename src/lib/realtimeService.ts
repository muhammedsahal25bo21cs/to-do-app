'use client';

import { useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from './supabaseClient';
import { ScoreEntry, saveScore, logActivity } from './cmsService';

export type ConnectionStatus = 'connected' | 'reconnecting' | 'offline';

export interface PendingOfflineScore {
  id: string;
  programme_id: string;
  registration_id: string;
  student_id?: string;
  team_id?: string;
  score: number;
  max_score: number;
  timestamp: string;
}

const OFFLINE_SCORES_KEY = 'meelad_offline_pending_scores';

// Connection status hook
export function useConnectionStatus() {
  const [status, setStatus] = useState<ConnectionStatus>('connected');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOnline = () => {
      setStatus('connected');
      syncOfflineScores();
    };

    const handleOffline = () => {
      setStatus('offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check
    if (!navigator.onLine) {
      setStatus('offline');
    }

    // Optional Supabase status check if configured
    if (isSupabaseConfigured()) {
      const channel = supabase.channel('system-health');
      channel.subscribe((statusResponse) => {
        if (statusResponse === 'SUBSCRIBED') {
          if (navigator.onLine) setStatus('connected');
        } else if (statusResponse === 'TIMED_OUT' || statusResponse === 'CLOSED') {
          if (navigator.onLine) setStatus('reconnecting');
        }
      });

      return () => {
        supabase.removeChannel(channel);
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return status;
}

// Targeted Realtime Subscriptions
export function subscribeToProgrammes(onUpdate: (payload: any) => void) {
  if (!isSupabaseConfigured()) return () => {};

  const channel = supabase
    .channel('public:programmes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'programmes' }, (payload) => {
      onUpdate(payload);
    })
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

export function subscribeToResults(onUpdate: (payload: any) => void) {
  if (!isSupabaseConfigured()) return () => {};

  const channel = supabase
    .channel('public:results')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'results' }, (payload) => {
      onUpdate(payload);
    })
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

export function subscribeToSiteSettings(onUpdate: (payload: any) => void) {
  if (!isSupabaseConfigured()) return () => {};

  const channel = supabase
    .channel('public:site_settings')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'site_settings' }, (payload) => {
      onUpdate(payload);
    })
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

export function subscribeToAnnouncements(onUpdate: (payload: any) => void) {
  if (!isSupabaseConfigured()) return () => {};

  const channel = supabase
    .channel('public:announcements')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'announcements' }, (payload) => {
      onUpdate(payload);
    })
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

// Offline Protection for Score Entry
export function getOfflinePendingScores(): PendingOfflineScore[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(OFFLINE_SCORES_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function queueOfflineScore(scoreData: Omit<PendingOfflineScore, 'id' | 'timestamp'>): PendingOfflineScore {
  const item: PendingOfflineScore = {
    ...scoreData,
    id: 'off-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
    timestamp: new Date().toISOString(),
  };

  const queue = getOfflinePendingScores();
  // Filter out older duplicate pending score for same registration if present
  const updatedQueue = queue.filter(q => q.registration_id !== scoreData.registration_id);
  updatedQueue.push(item);

  if (typeof window !== 'undefined') {
    localStorage.setItem(OFFLINE_SCORES_KEY, JSON.stringify(updatedQueue));
  }
  return item;
}

export async function syncOfflineScores(): Promise<{ syncedCount: number; failedCount: number }> {
  const queue = getOfflinePendingScores();
  if (queue.length === 0) return { syncedCount: 0, failedCount: 0 };

  let syncedCount = 0;
  let failedCount = 0;
  const remaining: PendingOfflineScore[] = [];

  for (const item of queue) {
    try {
      await saveScore(
        item.programme_id,
        item.registration_id,
        item.student_id,
        item.team_id,
        item.score,
        item.max_score
      );
      syncedCount++;
    } catch (err) {
      console.error('Failed to sync offline score entry:', err);
      failedCount++;
      remaining.push(item);
    }
  }

  if (typeof window !== 'undefined') {
    localStorage.setItem(OFFLINE_SCORES_KEY, JSON.stringify(remaining));
  }

  if (syncedCount > 0) {
    await logActivity('sync_offline_scores', 'scores', 'bulk', `Synced ${syncedCount} offline score entries to database`);
  }

  return { syncedCount, failedCount };
}

export async function saveScoreWithOfflineProtection(
  programmeId: string,
  registrationId: string,
  studentId: string | undefined,
  teamId: string | undefined,
  score: number,
  maxScore: number
): Promise<{ success: boolean; isOfflineSaved: boolean; data?: ScoreEntry; message: string }> {
  // If browser is offline, queue locally right away
  if (typeof window !== 'undefined' && !navigator.onLine) {
    const queued = queueOfflineScore({
      programme_id: programmeId,
      registration_id: registrationId,
      student_id: studentId,
      team_id: teamId,
      score,
      max_score: maxScore,
    });
    return {
      success: true,
      isOfflineSaved: true,
      message: 'Network offline. Score saved locally and queued for automatic sync.',
    };
  }

  try {
    const result = await saveScore(programmeId, registrationId, studentId, teamId, score, maxScore);
    return {
      success: true,
      isOfflineSaved: false,
      data: result,
      message: 'Score saved and verified with server.',
    };
  } catch (err: any) {
    // If network error during save, fallback to offline queue
    const queued = queueOfflineScore({
      programme_id: programmeId,
      registration_id: registrationId,
      student_id: studentId,
      team_id: teamId,
      score,
      max_score: maxScore,
    });
    return {
      success: true,
      isOfflineSaved: true,
      message: `Server connection interrupted (${err.message || 'Error'}). Score saved locally.`,
    };
  }
}
