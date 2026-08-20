'use client';

import React, { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { getCertificateById, GeneratedCertificate } from '@/lib/cmsService';
import { HeaderNav } from '@/components/HeaderNav';
import { FooterSection } from '@/components/FooterSection';
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Award, 
  Search, 
  ShieldCheck, 
  Calendar, 
  User, 
  ArrowLeft,
  QrCode
} from 'lucide-react';

export default function PublicCertificateVerificationPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const certId = resolvedParams.id;

  const [certificate, setCertificate] = useState<GeneratedCertificate | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (certId) {
      verifyCertificate(certId);
    }
  }, [certId]);

  const verifyCertificate = async (code: string) => {
    setIsLoading(true);
    const cert = await getCertificateById(code);
    setCertificate(cert);
    setSearched(true);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-950 via-emerald-900 to-emerald-950 text-emerald-100 flex flex-col justify-between">
      <HeaderNav />

      <main className="flex-1 max-w-4xl mx-auto px-4 py-12 w-full space-y-8">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase tracking-widest">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>Official Credential Verification</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-amber-400 font-serif drop-shadow-md">
            Certificate Verification Portal
          </h1>
          <p className="text-xs sm:text-sm text-emerald-300/80 max-w-xl mx-auto">
            Verify official achievements and authenticity for Milad Fest certificates.
          </p>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="text-center py-16 space-y-3 bg-emerald-950/80 border border-emerald-800/80 rounded-3xl p-8 backdrop-blur-xl">
            <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-amber-300 font-bold">Verifying Certificate Security Hash...</p>
          </div>
        ) : certificate && (certificate.status === 'Issued' || certificate.status === 'Generated' || certificate.status === 'Draft') ? (
          /* VALID CERTIFICATE CARD */
          <div className="bg-emerald-950/90 border-2 border-emerald-500/60 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-8 backdrop-blur-2xl relative overflow-hidden">
            {/* Background Decorative Accent */}
            <div className="absolute top-0 right-0 transform translate-x-8 -translate-y-8 w-40 h-40 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-emerald-800/60 pb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase text-emerald-400 tracking-widest block">Status</span>
                  <h2 className="text-xl font-black text-emerald-300">Valid & Verified Certificate</h2>
                </div>
              </div>

              <div className="bg-emerald-900/60 border border-emerald-700/60 px-4 py-2 rounded-2xl text-right shrink-0">
                <span className="text-[10px] text-amber-300 font-extrabold block uppercase tracking-wider">Certificate ID</span>
                <span className="font-mono text-sm font-black text-amber-400">{certificate.id}</span>
              </div>
            </div>

            {/* Certificate Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
              <div className="space-y-1 bg-emerald-900/40 p-4 rounded-2xl border border-emerald-800">
                <span className="text-[10px] uppercase font-bold text-amber-300 block">Certificate Holder</span>
                <p className="text-base font-black text-emerald-100">{certificate.recipient_name}</p>
                {certificate.recipient_code && (
                  <span className="text-[10px] font-mono text-emerald-400 block font-semibold">ID: {certificate.recipient_code}</span>
                )}
              </div>

              <div className="space-y-1 bg-emerald-900/40 p-4 rounded-2xl border border-emerald-800">
                <span className="text-[10px] uppercase font-bold text-amber-300 block">Certificate Type & Position</span>
                <p className="text-base font-black text-amber-400">
                  {certificate.certificate_type} {certificate.position ? `(${certificate.position})` : ''}
                </p>
                <span className="text-[10px] text-emerald-300 block font-semibold">{certificate.category_name}</span>
              </div>

              <div className="space-y-1 bg-emerald-900/40 p-4 rounded-2xl border border-emerald-800">
                <span className="text-[10px] uppercase font-bold text-amber-300 block">Programme Event</span>
                <p className="text-sm font-extrabold text-emerald-100">{certificate.programme_title}</p>
                <span className="text-[10px] text-emerald-400 block">{certificate.event_name}</span>
              </div>

              <div className="space-y-1 bg-emerald-900/40 p-4 rounded-2xl border border-emerald-800">
                <span className="text-[10px] uppercase font-bold text-amber-300 block">Date of Issue</span>
                <p className="text-sm font-extrabold text-emerald-100">{certificate.issue_date}</p>
                <span className="text-[10px] text-emerald-400 block">{certificate.organizer_name}</span>
              </div>
            </div>

            {/* Achievement Wording Banner */}
            <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-center space-y-1">
              <span className="text-[10px] uppercase font-black text-amber-300 tracking-wider block">Official Achievement Wording</span>
              <p className="text-xs sm:text-sm font-serif italic text-emerald-100">
                "{certificate.achievement_text}"
              </p>
            </div>

            <div className="flex items-center justify-between pt-2">
              <Link
                href="/verify"
                className="text-xs text-amber-400 hover:text-amber-300 font-extrabold flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Verify Another Certificate</span>
              </Link>
            </div>
          </div>
        ) : certificate && certificate.status === 'Revoked' ? (
          /* REVOKED CERTIFICATE CARD */
          <div className="bg-emerald-950/90 border-2 border-red-500/60 rounded-3xl p-8 shadow-2xl space-y-6 text-center backdrop-blur-xl">
            <div className="w-16 h-16 rounded-full bg-red-500/20 border border-red-500/40 flex items-center justify-center mx-auto text-red-400">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div>
              <span className="text-xs font-mono font-bold text-red-400 uppercase tracking-widest block">ID: {certificate.id}</span>
              <h2 className="text-2xl font-black text-red-300 mt-1">Certificate Revoked</h2>
              <p className="text-xs text-emerald-300/80 max-w-md mx-auto mt-2">
                This certificate was administratively revoked by festival organizers and is no longer valid.
              </p>
            </div>

            {certificate.revoked_reason && (
              <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 max-w-md mx-auto text-xs text-red-300 font-bold">
                Reason: {certificate.revoked_reason}
              </div>
            )}

            <div className="pt-4">
              <Link
                href="/verify"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-emerald-900 hover:bg-emerald-800 text-amber-300 text-xs font-bold border border-emerald-700"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Verification Search</span>
              </Link>
            </div>
          </div>
        ) : (
          /* NOT FOUND CERTIFICATE CARD */
          <div className="bg-emerald-950/90 border-2 border-amber-500/40 rounded-3xl p-8 shadow-2xl space-y-6 text-center backdrop-blur-xl">
            <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
              <XCircle className="w-8 h-8" />
            </div>

            <div>
              <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest block">ID: {certId}</span>
              <h2 className="text-2xl font-black text-amber-300 mt-1">Certificate Not Found</h2>
              <p className="text-xs text-emerald-300/80 max-w-md mx-auto mt-2">
                The entered Certificate ID does not match any official issued credential in our records.
              </p>
            </div>

            <div className="pt-4">
              <Link
                href="/verify"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-emerald-950 text-xs font-black shadow-lg shadow-amber-500/20"
              >
                <Search className="w-4 h-4" />
                <span>Try Another Certificate ID</span>
              </Link>
            </div>
          </div>
        )}
      </main>

      <FooterSection />
    </div>
  );
}
