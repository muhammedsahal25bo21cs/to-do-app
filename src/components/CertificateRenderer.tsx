'use client';

import React from 'react';
import { GeneratedCertificate } from '@/lib/cmsService';
import { IslamicCrescentLogo } from '@/components/IslamicCrescentLogo';

interface CertificateRendererProps {
  certificate: GeneratedCertificate;
  previewMode?: boolean;
}

export function CertificateRenderer({ certificate, previewMode = false }: CertificateRendererProps) {
  const style = certificate.template_style || 'royal-gold';
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://miladfest.com';
  const verificationUrl = `${origin}/verify/${certificate.id}`;

  // QR Code URL using public Google API or SVG encoder
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(verificationUrl)}`;

  // Visual Theme Variations
  const isClassic = style === 'classic-islamic';
  const isRoyal = style === 'royal-gold';
  const isMinimal = style === 'minimal-emerald';

  return (
    <div
      id={`cert-container-${certificate.id}`}
      className={`relative w-full aspect-[1.414/1] max-w-4xl mx-auto rounded-3xl overflow-hidden shadow-2xl p-8 sm:p-12 flex flex-col justify-between select-none print:shadow-none print:w-full print:max-w-none print:h-screen ${
        isRoyal
          ? 'bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-950 text-emerald-100 border-[12px] border-amber-500/80 shadow-amber-500/10'
          : isClassic
          ? 'bg-emerald-950 text-amber-100 border-[14px] border-amber-600/90'
          : 'bg-slate-950 text-emerald-100 border-8 border-emerald-500/60'
      }`}
    >
      {/* Outer Ornamental Corner Flourishes */}
      <div className="absolute top-3 left-3 w-12 h-12 border-t-2 border-l-2 border-amber-400/80 rounded-tl-xl pointer-events-none" />
      <div className="absolute top-3 right-3 w-12 h-12 border-t-2 border-r-2 border-amber-400/80 rounded-tr-xl pointer-events-none" />
      <div className="absolute bottom-3 left-3 w-12 h-12 border-b-2 border-l-2 border-amber-400/80 rounded-bl-xl pointer-events-none" />
      <div className="absolute bottom-3 right-3 w-12 h-12 border-b-2 border-r-2 border-amber-400/80 rounded-br-xl pointer-events-none" />

      {/* Inner Decorative Arch Line */}
      <div className="absolute inset-4 border border-amber-500/30 rounded-2xl pointer-events-none flex items-center justify-center">
        <div className="w-full h-full border border-amber-500/20 rounded-xl" />
      </div>

      {/* Header Branding Section */}
      <div className="relative z-10 text-center space-y-2">
        <div className="flex items-center justify-center gap-3">
          {certificate.logo_url ? (
            <img src={certificate.logo_url} alt="Logo" className="w-12 h-12 object-contain filter drop-shadow" />
          ) : (
            <IslamicCrescentLogo size="md" />
          )}
        </div>

        {/* Bismillah / Durood Calligraphy Header */}
        <p className="text-sm font-serif text-amber-300/90 tracking-widest uppercase font-bold">
          بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
        </p>

        <p className="text-xs sm:text-sm font-extrabold uppercase text-emerald-300 tracking-wider">
          {certificate.event_name || 'Milad Fest 2K26'}
        </p>

        <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-amber-400 font-serif drop-shadow-md pt-1 uppercase">
          {certificate.certificate_type === 'Winner'
            ? 'Certificate of Achievement'
            : certificate.certificate_type === 'Participation'
            ? 'Certificate of Participation'
            : 'Special Award Certificate'}
        </h1>
      </div>

      {/* Body Recipient & Achievement Section */}
      <div className="relative z-10 text-center my-auto py-4 space-y-4">
        <p className="text-xs sm:text-sm text-emerald-200/80 italic font-serif">
          This certificate is proudly presented to
        </p>

        {/* Recipient Name */}
        <div className="inline-block border-b-2 border-amber-400/60 pb-1 px-8">
          <h2 className="text-2xl sm:text-4xl font-black text-amber-300 font-serif tracking-wide drop-shadow">
            {certificate.recipient_name}
          </h2>
          {certificate.recipient_code && (
            <span className="text-[10px] sm:text-xs text-amber-400/80 font-mono block tracking-widest uppercase mt-0.5">
              ID: {certificate.recipient_code} {certificate.team_name ? `• Team: ${certificate.team_name}` : ''}
            </span>
          )}
        </div>

        {/* Achievement Wording */}
        <p className="text-xs sm:text-base text-emerald-100 max-w-xl mx-auto leading-relaxed font-medium">
          {certificate.achievement_text || (
            certificate.position
              ? `for securing ${certificate.position} in ${certificate.programme_title} (${certificate.category_name})`
              : `for active participation in ${certificate.programme_title} (${certificate.category_name})`
          )}
        </p>
      </div>

      {/* Footer Signatures, Seal & Embedded QR Verification Code */}
      <div className="relative z-10 flex items-end justify-between pt-4 border-t border-amber-500/30 text-xs">
        {/* Left: Issue Date & Seal */}
        <div className="space-y-1 text-left">
          <span className="text-[10px] uppercase font-bold text-amber-400 block tracking-wider">Date of Issuance</span>
          <span className="text-xs font-mono font-bold text-emerald-200">{certificate.issue_date}</span>
          <span className="text-[10px] text-emerald-400 block font-semibold">{certificate.organizer_name}</span>
        </div>

        {/* Center: Scannable Verification QR Code */}
        <div className="flex flex-col items-center gap-1 bg-emerald-950/80 p-2 rounded-xl border border-amber-500/40 shadow-lg">
          <img src={qrImageUrl} alt="QR Code Verification" className="w-14 h-14 rounded-lg bg-white p-1" />
          <span className="text-[9px] font-mono text-amber-300 font-bold tracking-widest">{certificate.id}</span>
        </div>

        {/* Right: Signature */}
        <div className="text-right space-y-1">
          {certificate.signature_url ? (
            <img src={certificate.signature_url} alt="Signature" className="h-10 object-contain ml-auto" />
          ) : (
            <div className="h-8 border-b border-amber-400/60 w-32 ml-auto flex items-end justify-center pb-1">
              <span className="text-[11px] font-serif italic text-amber-300">Authorized Signature</span>
            </div>
          )}
          <span className="text-[10px] uppercase font-bold text-amber-400 block tracking-wider">Organizer Signature</span>
          <span className="text-[9px] text-emerald-300 block font-bold">Official Seal Verified</span>
        </div>
      </div>
    </div>
  );
}
