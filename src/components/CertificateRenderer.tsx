'use client';

import React from 'react';
import { GeneratedCertificate } from '@/lib/cmsService';
import { IslamicCrescentLogo } from '@/components/IslamicCrescentLogo';
import { Award, ShieldCheck, MapPin, Calendar } from 'lucide-react';

interface CertificateRendererProps {
  certificate: GeneratedCertificate;
  previewMode?: boolean;
}

export function CertificateRenderer({ certificate, previewMode = false }: CertificateRendererProps) {
  const style = certificate.template_style || 'royal-gold';
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://miladfest.com';
  const verificationUrl = `${origin}/verify/${certificate.id}`;

  // QR Code URL using public API
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(verificationUrl)}`;

  return (
    <div
      id={`cert-container-${certificate.id}`}
      className="relative w-full aspect-[1/1.414] max-w-2xl mx-auto rounded-3xl overflow-hidden shadow-2xl p-8 sm:p-12 flex flex-col justify-between select-none print:shadow-none print:w-full print:max-w-none print:h-screen print:rounded-none bg-gradient-to-br from-[#022c22] via-[#064e3b] to-[#022c22] text-emerald-100 border-[12px] border-amber-500/80 shadow-amber-500/10"
    >
      {/* Background Decorative Pattern & Watermark Overlay */}
      <div 
        className="absolute inset-0 opacity-10 pointer-events-none bg-repeat" 
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23f59e0b' fill-opacity='0.4' fill-rule='evenodd'%3E%3Cpath d='M30 30L0 0h60L30 30zM30 30L0 60h60L30 30z'/%3E%3C/g%3E%3C/svg%3E")`
        }} 
      />

      {/* Outer Ornamental Corner Flourishes */}
      <div className="absolute top-4 left-4 w-12 h-12 border-t-2 border-l-2 border-amber-400/80 rounded-tl-xl pointer-events-none" />
      <div className="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 border-amber-400/80 rounded-tr-xl pointer-events-none" />
      <div className="absolute bottom-4 left-4 w-12 h-12 border-b-2 border-l-2 border-amber-400/80 rounded-bl-xl pointer-events-none" />
      <div className="absolute bottom-4 right-4 w-12 h-12 border-b-2 border-r-2 border-amber-400/80 rounded-br-xl pointer-events-none" />

      {/* Inner Decorative Double Arch Line */}
      <div className="absolute inset-4 border border-amber-400/40 rounded-2xl pointer-events-none flex items-center justify-center">
        <div className="w-full h-full border border-amber-400/25 rounded-xl" />
      </div>

      {/* Header Branding Section */}
      <div className="relative z-10 text-center space-y-2 pt-2">
        {/* Bismillah / Durood Calligraphy Header */}
        <p className="text-xs sm:text-sm font-serif text-amber-300/90 tracking-widest uppercase font-bold">
          بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
        </p>

        <div className="flex items-center justify-center gap-3">
          {certificate.logo_url ? (
            <img src={certificate.logo_url} alt="Logo" className="w-12 h-12 object-contain filter drop-shadow" />
          ) : (
            <IslamicCrescentLogo size="md" />
          )}
        </div>

        <p className="text-xs sm:text-sm font-extrabold uppercase text-emerald-300 tracking-wider">
          {certificate.event_name || 'Milad Fest 2K26'}
        </p>

        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200 font-serif drop-shadow-md uppercase">
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
        <div className="inline-block border-b-2 border-amber-400/60 pb-2 px-6 max-w-full">
          <h2 className="text-2xl sm:text-4xl font-black text-amber-300 font-serif tracking-wide drop-shadow-md leading-tight">
            {certificate.recipient_name}
          </h2>
          {certificate.recipient_code && (
            <span className="text-[10px] sm:text-xs text-amber-400/90 font-mono block tracking-widest uppercase mt-1 font-bold">
              ID: {certificate.recipient_code} {certificate.team_name ? `• Team: ${certificate.team_name}` : ''}
            </span>
          )}
        </div>

        {/* Achievement Wording */}
        <p className="text-xs sm:text-base text-emerald-100 max-w-lg mx-auto leading-relaxed font-medium">
          {certificate.achievement_text || (
            certificate.position
              ? `for securing ${certificate.position} in ${certificate.programme_title} (${certificate.category_name})`
              : `for active participation in ${certificate.programme_title} (${certificate.category_name})`
          )}
        </p>
      </div>

      {/* Footer Signatures, Date, Seal & Embedded QR Verification Code */}
      <div className="relative z-10 flex items-end justify-between pt-4 border-t border-amber-500/30 text-xs">
        {/* Left: Issue Date & Organizer */}
        <div className="space-y-1 text-left">
          <span className="text-[10px] uppercase font-bold text-amber-400 block tracking-wider">Date of Issuance</span>
          <span className="text-xs font-mono font-bold text-emerald-200">{certificate.issue_date}</span>
          <span className="text-[10px] text-emerald-400 block font-semibold">{certificate.organizer_name}</span>
        </div>

        {/* Center: Scannable Verification QR Code */}
        <div className="flex flex-col items-center gap-1 bg-emerald-950/90 p-2 rounded-2xl border border-amber-400/50 shadow-xl">
          <img src={qrImageUrl} alt="QR Code Verification" className="w-14 h-14 rounded-lg bg-white p-1" />
          <span className="text-[8px] font-mono text-amber-300 font-black tracking-widest uppercase">{certificate.id}</span>
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
