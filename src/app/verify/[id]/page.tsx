'use client';

import React, { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { getCertificateById, GeneratedCertificate } from '@/lib/cmsService';
import { CertificateRenderer } from '@/components/CertificateRenderer';
import { HeaderNav } from '@/components/HeaderNav';
import { FooterSection } from '@/components/FooterSection';
import { downloadElementAsPNG, copyTextToClipboard } from '@/lib/qrCodeService';
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
  QrCode,
  Download,
  Printer,
  MessageSquare,
  Copy,
  Check
} from 'lucide-react';

export default function PublicCertificateVerificationPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const certId = resolvedParams.id;

  const [certificate, setCertificate] = useState<GeneratedCertificate | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (certId) {
      verifyCertificate(certId);
    }
  }, [certId]);

  const verifyCertificate = async (code: string) => {
    setIsLoading(true);
    const cert = await getCertificateById(code);
    setCertificate(cert);
    setIsLoading(false);
  };

  const handleDownloadPNG = async () => {
    if (certificate) {
      await downloadElementAsPNG(`cert-container-${certificate.id}`, `certificate-${certificate.id}`);
    }
  };

  const handleWhatsAppShare = () => {
    if (!certificate) return;
    const url = typeof window !== 'undefined' ? window.location.href : '';
    const message = encodeURIComponent(`📜 *Milad Fest 2K26 Certificate Verification*\nRecipient: *${certificate.recipient_name}*\nAward: *${certificate.certificate_type} — ${certificate.programme_title}*\nCertificate ID: \`${certificate.id}\`\n\nVerify online:\n${url}`);
    window.open(`https://api.whatsapp.com/send?text=${message}`, '_blank');
  };

  const handleCopyLink = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    const success = await copyTextToClipboard(url);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-950 via-emerald-900 to-emerald-950 text-emerald-100 flex flex-col justify-between print:bg-white print:p-0">
      <div className="print:hidden">
        <HeaderNav />
      </div>

      <main className="flex-1 max-w-4xl mx-auto px-4 py-8 sm:py-12 w-full space-y-8">
        <div className="text-center space-y-3 print:hidden">
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
          <div className="text-center py-16 space-y-3 bg-emerald-950/80 border border-emerald-800/80 rounded-3xl p-8 backdrop-blur-xl print:hidden">
            <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-amber-300 font-bold">Verifying Certificate Hash Security...</p>
          </div>
        ) : certificate && (certificate.status === 'Issued' || certificate.status === 'Generated' || certificate.status === 'Draft') ? (
          /* VALID CERTIFICATE CARD & RENDERER */
          <div className="space-y-6">
            {/* Top Toolbar Actions for Certificate */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-emerald-950/90 border border-emerald-800/80 p-4 rounded-3xl shadow-xl print:hidden">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span className="text-xs font-black text-emerald-300">Verified Authentic</span>
                <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/30 font-bold">
                  {certificate.id}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleWhatsAppShare}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold shadow-md transition-all"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </button>

                <button
                  onClick={handleCopyLink}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-900 hover:bg-emerald-800 text-emerald-200 border border-emerald-700 text-xs font-bold transition-all"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-amber-400" />}
                  <span>{copied ? 'Copied!' : 'Copy Link'}</span>
                </button>

                <button
                  onClick={handleDownloadPNG}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-emerald-950 text-xs font-black shadow-md transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Image</span>
                </button>

                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-900 hover:bg-emerald-800 text-emerald-200 border border-emerald-700 text-xs font-bold transition-all"
                >
                  <Printer className="w-3.5 h-3.5 text-amber-400" />
                  <span>Print PDF</span>
                </button>
              </div>
            </div>

            {/* Official Upgraded Certificate Renderer */}
            <div className="w-full flex justify-center">
              <CertificateRenderer certificate={certificate} />
            </div>

            <div className="flex items-center justify-between pt-4 print:hidden">
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
          <div className="bg-emerald-950/90 border-2 border-red-500/60 rounded-3xl p-8 shadow-2xl space-y-6 text-center backdrop-blur-xl print:hidden">
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
          <div className="bg-emerald-950/90 border-2 border-amber-500/40 rounded-3xl p-8 shadow-2xl space-y-6 text-center backdrop-blur-xl print:hidden">
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

      <div className="print:hidden">
        <FooterSection />
      </div>
    </div>
  );
}
