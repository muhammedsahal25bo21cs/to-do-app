'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { HeaderNav } from '@/components/HeaderNav';
import { FooterSection } from '@/components/FooterSection';
import { ShieldCheck, Search, Award, QrCode } from 'lucide-react';

export default function CertificateVerificationLookupPage() {
  const [certInput, setCertInput] = useState('');
  const router = useRouter();

  const handleVerifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!certInput.trim()) return;
    router.push(`/verify/${certInput.trim().toUpperCase()}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-950 via-emerald-900 to-emerald-950 text-emerald-100 flex flex-col justify-between">
      <HeaderNav />

      <main className="flex-1 max-w-3xl mx-auto px-4 py-16 w-full space-y-10">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase tracking-widest">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>Official Credential Verification Desk</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-amber-400 font-serif drop-shadow-md">
            Verify Certificate Authenticity
          </h1>
          <p className="text-xs sm:text-sm text-emerald-300/80 max-w-lg mx-auto leading-relaxed">
            Enter an official Certificate ID or scan the embedded QR code on any certificate to verify its validity.
          </p>
        </div>

        {/* Certificate Lookup Box */}
        <div className="bg-emerald-950/90 border-2 border-emerald-800/80 p-8 rounded-3xl shadow-2xl backdrop-blur-2xl space-y-6">
          <form onSubmit={handleVerifySubmit} className="space-y-4">
            <label className="block text-xs font-extrabold uppercase text-amber-300 tracking-wider">
              Enter Certificate ID Code *
            </label>

            <div className="relative">
              <Award className="w-5 h-5 text-amber-400 absolute left-4 top-3.5" />
              <input
                type="text"
                placeholder="e.g. CERT-8F4A2B9X"
                value={certInput}
                onChange={(e) => setCertInput(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-2xl bg-emerald-900 border-2 border-emerald-700 text-emerald-100 font-mono font-black text-sm uppercase tracking-widest placeholder:text-emerald-600 focus:border-amber-400 focus:outline-none shadow-inner"
              />
            </div>

            <button
              type="submit"
              disabled={!certInput.trim()}
              className="w-full py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-emerald-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              <Search className="w-4 h-4" />
              <span>Verify Certificate Authenticity</span>
            </button>
          </form>

          <div className="pt-4 border-t border-emerald-800/60 flex items-center justify-between text-[11px] text-emerald-300/80">
            <span className="flex items-center gap-1.5">
              <QrCode className="w-4 h-4 text-amber-400" />
              <span>QR Code Scanning Supported</span>
            </span>
            <span className="font-semibold text-amber-400">Strictly English & Database Verified</span>
          </div>
        </div>
      </main>

      <FooterSection />
    </div>
  );
}
