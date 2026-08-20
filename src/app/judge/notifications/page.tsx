'use client';

import React, { useEffect, useState } from 'react';
import { getJudgeNotifications, JudgeNotification } from '@/lib/cmsService';
import { Bell, AlertTriangle, CheckCircle2, Clock, Calendar } from 'lucide-react';

export default function JudgeNotificationsPage() {
  const [notifications, setNotifications] = useState<JudgeNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    setIsLoading(true);
    try {
      const list = await getJudgeNotifications();
      setNotifications(list);
    } catch (e) {
      console.error('Error loading judge notifications:', e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-emerald-950/80 border border-emerald-800 p-5 rounded-3xl backdrop-blur-xl flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-emerald-100 flex items-center gap-2">
            <Bell className="w-5 h-5 text-amber-400" />
            <span>Judge Notifications Feed</span>
          </h1>
          <p className="text-xs text-emerald-300/80 mt-1">
            Real-time alerts for programme assignments, starting times, and score correction requests.
          </p>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {notifications.map(item => (
          <div
            key={item.id}
            className="p-4 rounded-3xl bg-emerald-950/90 border border-emerald-800 space-y-2"
          >
            <div className="flex items-center justify-between gap-2">
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                item.type === 'correction' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                item.type === 'starting_soon' ? 'bg-red-500/20 text-red-300 border border-red-500/40' :
                'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              }`}>
                {item.type.replace('_', ' ')}
              </span>

              <span className="text-[10px] text-emerald-400 font-mono">
                {new Date(item.timestamp).toLocaleTimeString()}
              </span>
            </div>

            <h3 className="text-sm font-extrabold text-emerald-100">{item.title}</h3>
            <p className="text-xs text-emerald-300/80 leading-relaxed">{item.message}</p>
          </div>
        ))}
      </div>

    </div>
  );
}
