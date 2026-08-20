'use client';

import React, { useEffect, useState } from 'react';
import { getSpeakers, Speaker } from '@/lib/cmsService';
import { Users } from 'lucide-react';

export const SpeakersSection: React.FC = () => {
  const [speakers, setSpeakers] = useState<Speaker[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getSpeakers(true).then((data) => {
      setSpeakers(data);
      setIsLoading(false);
    });
  }, []);

  if (isLoading || speakers.length === 0) {
    return null; // Automatically hide speakers section if no speakers exist
  }

  return (
    <section id="speakers" className="py-16 sm:py-24 bg-emerald-950 text-emerald-100 border-b border-emerald-800/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold uppercase tracking-wider">
            <Users className="w-4 h-4 text-amber-400" />
            <span>Honored Dignitaries</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-gold-gradient tracking-tight">
            Speakers & Guests
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {speakers.map((spk) => (
            <div key={spk.id} className="bg-emerald-900/40 border border-emerald-800 rounded-3xl p-6 shadow-xl text-center space-y-3">
              {spk.photo_url && (
                <img src={spk.photo_url} alt={spk.name_en} className="w-24 h-24 rounded-full object-cover border-2 border-amber-500/40 mx-auto" />
              )}
              <h3 className="text-lg font-bold text-emerald-100">{spk.name_en}</h3>
              <p className="text-xs font-semibold text-amber-400">{spk.role_en}</p>
              {spk.description_en && <p className="text-xs text-emerald-300/80 leading-relaxed">{spk.description_en}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
