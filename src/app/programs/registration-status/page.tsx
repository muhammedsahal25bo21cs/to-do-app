'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { HeaderNav } from '@/components/HeaderNav';
import { FooterSection } from '@/components/FooterSection';
import { getRegistrationByCode, getProgrammes, ProgrammeRegistration, Programme } from '@/lib/cmsService';
import { Search, CheckCircle2, AlertTriangle, XCircle, Clock, ArrowLeft, Loader2, ShieldCheck, Copy, Share2 } from 'lucide-react';

function RegistrationStatusContent() {
  const searchParams = useSearchParams();
  const initialCode = searchParams?.get('code') || '';

  const [inputCode, setInputCode] = useState<string>(initialCode);
  const [registration, setRegistration] = useState<ProgrammeRegistration | null>(null);
  const [programme, setProgramme] = useState<Programme | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasSearched, setHasSearched] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (initialCode) {
      handleSearchCode(initialCode);
    }
  }, [initialCode]);

  const handleSearchCode = async (codeToSearch: string) => {
    const clean = codeToSearch.trim();
    if (!clean) return;

    setIsLoading(true);
    setHasSearched(true);
    setRegistration(null);
    setProgramme(null);

    const reg = await getRegistrationByCode(clean);
    if (reg) {
      setRegistration(reg);
      const allPrg = await getProgrammes(false, true);
      const prg = allPrg.find(p => p.id === reg.programme_id);
      setProgramme(prg || null);
    }

    setIsLoading(false);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleCopyCode = () => {
    if (registration?.registration_id_code) {
      navigator.clipboard.writeText(registration.registration_id_code);
      showToast('Registration ID copied.');
    }
  };

  return (
    <div className="min-h-screen bg-emerald-950 text-emerald-100 flex flex-col justify-between">
      <div>
        <HeaderNav />

        {toastMessage && (
          <div className="fixed top-20 right-5 z-50 bg-amber-500 text-emerald-950 font-black text-xs px-4 py-2.5 rounded-2xl shadow-2xl animate-fade-in border border-amber-300">
            {toastMessage}
          </div>
        )}

        <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
          
          <Link 
            href="/programs" 
            className="inline-flex items-center gap-2 text-xs font-bold text-emerald-300 hover:text-amber-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Programmes</span>
          </Link>

          {/* Page Title Header */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>Secure Registration Status Portal</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl font-black text-gold-gradient tracking-tight">
              Check Registration Status
            </h1>

            <p className="text-xs sm:text-sm text-emerald-200/80 max-w-lg mx-auto">
              Enter your unique Registration ID (e.g., <span className="font-mono text-amber-300 font-bold">REG-8F4A2B</span>) to verify entry confirmation status.
            </p>
          </div>

          {/* Search Input Box */}
          <div className="bg-emerald-950/80 border border-emerald-800/80 rounded-3xl p-6 shadow-2xl backdrop-blur-xl">
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleSearchCode(inputCode);
              }}
              className="flex flex-col sm:flex-row gap-3"
            >
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-amber-400 absolute left-4 top-3.5" />
                <input
                  type="text"
                  required
                  placeholder="Enter Registration ID (e.g. REG-8F4A2B)..."
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-2xl bg-emerald-900/60 border border-emerald-800 text-emerald-100 text-xs font-mono font-bold focus:border-amber-400 focus:outline-none uppercase placeholder:normal-case"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || !inputCode.trim()}
                className="py-3 px-6 rounded-2xl bg-amber-500 hover:bg-amber-400 text-emerald-950 font-extrabold text-xs transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50 flex items-center justify-center gap-2 shrink-0"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
                <span>Lookup Status</span>
              </button>
            </form>
          </div>

          {/* Search Result Card */}
          {isLoading ? (
            <div className="text-center py-16 text-amber-300 font-bold text-xs flex items-center justify-center gap-2">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span>Locating registration record...</span>
            </div>
          ) : hasSearched && !registration ? (
            <div className="bg-emerald-950/80 border border-emerald-800/80 rounded-3xl p-8 text-center space-y-3 shadow-xl">
              <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto" />
              <h3 className="text-lg font-bold text-emerald-100">No Registration Record Found</h3>
              <p className="text-xs text-emerald-300/80 max-w-sm mx-auto">
                No active registration matching code <span className="font-mono text-amber-300 font-bold">{inputCode}</span> was found in the database. Please verify your Registration ID.
              </p>
            </div>
          ) : registration ? (
            <div className="bg-emerald-950/90 border-2 border-emerald-700 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 backdrop-blur-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-emerald-800/60 pb-4">
                <div>
                  <span className="text-[10px] text-amber-400 font-mono font-bold block mb-0.5">
                    Registration Code: {registration.registration_id_code}
                  </span>
                  <h2 className="text-xl font-black text-emerald-100">
                    {registration.full_name}
                  </h2>
                  <p className="text-xs text-emerald-300 font-semibold mt-0.5">
                    {programme?.title_en || 'Programme Competition'}
                  </p>
                </div>

                <div className="shrink-0">
                  {registration.status === 'Confirmed' ? (
                    <span className="px-4 py-2 rounded-2xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-black flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Confirmed</span>
                    </span>
                  ) : registration.status === 'Pending' ? (
                    <span className="px-4 py-2 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-black flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-amber-400" />
                      <span>Pending Admin Review</span>
                    </span>
                  ) : registration.status === 'Rejected' ? (
                    <span className="px-4 py-2 rounded-2xl bg-red-500/20 text-red-300 border border-red-500/40 text-xs font-black flex items-center gap-1.5">
                      <XCircle className="w-4 h-4 text-red-400" />
                      <span>Rejected</span>
                    </span>
                  ) : (
                    <span className="px-4 py-2 rounded-2xl bg-slate-500/20 text-slate-300 border border-slate-500/40 text-xs font-black">
                      {registration.status}
                    </span>
                  )}
                </div>
              </div>

              {/* Rejection Note (If rejected) */}
              {registration.status === 'Rejected' && registration.rejection_reason && (
                <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/40 text-xs text-red-300 space-y-1">
                  <span className="font-bold block text-red-200 uppercase text-[10px] tracking-wider">Rejection Reason:</span>
                  <p>{registration.rejection_reason}</p>
                </div>
              )}

              {/* Roster Summary */}
              <div className="bg-emerald-900/40 border border-emerald-800 rounded-2xl p-5 space-y-3 text-xs">
                <div className="flex justify-between py-1 border-b border-emerald-800/40">
                  <span className="text-emerald-400 font-semibold">Category:</span>
                  <span className="font-extrabold text-amber-300">{registration.category_name || 'Configured Category'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-emerald-800/40">
                  <span className="text-emerald-400 font-semibold">Gender:</span>
                  <span className="font-extrabold text-emerald-100">{registration.gender || 'Not specified'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-emerald-800/40">
                  <span className="text-emerald-400 font-semibold">Team / House:</span>
                  <span className="font-extrabold text-emerald-100">{registration.team_name || 'Independent'}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-emerald-400 font-semibold">Submission Date:</span>
                  <span className="font-extrabold text-emerald-200">
                    {registration.created_at ? new Date(confirmationDate(registration.created_at)).toLocaleString() : 'Registered'}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={handleCopyCode}
                  className="py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-emerald-950 text-xs font-extrabold transition-all flex items-center gap-2"
                >
                  <Copy className="w-4 h-4" />
                  <span>Copy ID</span>
                </button>
              </div>
            </div>
          ) : null}

        </main>
      </div>

      <FooterSection />
    </div>
  );
}

function confirmationDate(iso: string) {
  try {
    return new Date(iso);
  } catch {
    return new Date();
  }
}

export default function RegistrationStatusPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-emerald-950 flex items-center justify-center text-amber-400 text-xs font-bold">Loading registration status...</div>}>
      <RegistrationStatusContent />
    </Suspense>
  );
}
