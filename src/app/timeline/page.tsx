'use client';

import React, { useEffect, useState } from 'react';
import { getLiveEventTimeline } from '@/lib/cmsService';
import { HeaderNav } from '@/components/HeaderNav';
import { FooterSection } from '@/components/FooterSection';
import { Activity, Play, CheckCircle2, Award, Clock } from 'lucide-react';

interface MilestoneItem {
  id: string;
  title: string;
  details?: string;
  timestamp: string;
  type: 'started' | 'completed' | 'published';
}

export default function PublicLiveTimelinePage() {
  const [milestones, setMilestones] = useState<MilestoneItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLiveEventTimeline().then(data => {
      setMilestones(data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="min-h-screen bg-emerald-950 text-emerald-100 flex flex-col font-sans selection:bg-amber-400 selection:text-emerald-950">
      <HeaderNav />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-12 space-y-8">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-900/60 border border-emerald-700/60 text-amber-300 font-extrabold text-xs uppercase tracking-wider">
            <Activity className="w-4 h-4 text-amber-400" />
            <span>Live Activity Stream</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-amber-300 tracking-tight">
            Event Milestone Timeline
          </h1>
          <p className="text-xs text-emerald-300/80 max-w-md mx-auto">
            Real-time feed of programme starts, score submissions, and official result announcements.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12 text-xs text-emerald-400 font-bold">Loading timeline data...</div>
        ) : milestones.length === 0 ? (
          <div className="text-center py-12 text-xs text-emerald-400 font-bold">No milestone activity recorded yet today.</div>
        ) : (
          <div className="relative border-l-2 border-emerald-800 ml-4 sm:ml-8 space-y-6 py-2">
            {milestones.map((item, idx) => {
              const dateObj = new Date(item.timestamp);
              const formattedTime = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

              return (
                <div key={item.id || idx} className="relative pl-6 sm:pl-8 group">
                  <div className={`absolute -left-[17px] top-1.5 w-8 h-8 rounded-full border-2 flex items-center justify-center shadow-lg ${
                    item.type === 'started'
                      ? 'bg-rose-950 border-rose-500 text-rose-400'
                      : item.type === 'completed'
                      ? 'bg-emerald-950 border-emerald-400 text-emerald-300'
                      : 'bg-amber-950 border-amber-400 text-amber-300'
                  }`}>
                    {item.type === 'started' && <Play className="w-3.5 h-3.5 fill-current" />}
                    {item.type === 'completed' && <CheckCircle2 className="w-4 h-4" />}
                    {item.type === 'published' && <Award className="w-4 h-4" />}
                  </div>

                  <div className="bg-emerald-900/30 border border-emerald-800 hover:border-emerald-700 p-4 rounded-2xl shadow-xl space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                        item.type === 'started'
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                          : item.type === 'completed'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      }`}>
                        {item.type === 'started' ? 'Programme Started' : item.type === 'completed' ? 'Stage Completed' : 'Result Published'}
                      </span>

                      <div className="flex items-center gap-1.5 text-xs text-amber-300/80 font-mono">
                        <Clock className="w-3.5 h-3.5 text-amber-400" />
                        <span>{formattedTime}</span>
                      </div>
                    </div>

                    <h3 className="text-base font-extrabold text-emerald-100">{item.title}</h3>
                    {item.details && <p className="text-xs text-emerald-300/80">{item.details}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <FooterSection />
    </div>
  );
}
