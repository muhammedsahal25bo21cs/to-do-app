'use client';

import React, { useEffect, useState } from 'react';
import { 
  buildSmartPublicUrl, 
  generateQRCodeDataURL, 
  downloadQRCodePNG, 
  shareNativeUrl, 
  copyTextToClipboard, 
  SmartUrlParams 
} from '@/lib/qrCodeService';
import { 
  Share2, 
  Copy, 
  Download, 
  QrCode, 
  Check, 
  X, 
  ExternalLink, 
  Sparkles,
  Smartphone,
  MessageSquare
} from 'lucide-react';

export interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  urlParams: SmartUrlParams;
  filename?: string;
}

export function ShareModal({
  isOpen,
  onClose,
  title,
  subtitle = 'Official Competition Publication',
  urlParams,
  filename = 'milad-fest-qr',
}: ShareModalProps) {
  const [publicUrl, setPublicUrl] = useState('');
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(true);

  useEffect(() => {
    if (!isOpen) return;

    const url = buildSmartPublicUrl(urlParams);
    setPublicUrl(url);

    generateQRCodeDataURL(url, 400)
      .then(data => {
        setQrDataUrl(data);
        setIsGenerating(false);
      })
      .catch(err => {
        console.error('Failed to generate QR Data URL:', err);
        setIsGenerating(false);
      });
  }, [isOpen, urlParams]);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleCopyLink = async () => {
    const success = await copyTextToClipboard(publicUrl);
    if (success) {
      setCopied(true);
      showToast('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleWhatsAppShare = () => {
    const message = encodeURIComponent(`🏆 *Milad Fest 2K26 — ${title}*\n${subtitle}\n\nView official publication & results:\n${publicUrl}`);
    window.open(`https://api.whatsapp.com/send?text=${message}`, '_blank');
  };

  const handleNativeShare = async () => {
    const success = await shareNativeUrl({
      title: `Milad Fest 2K26 - ${title}`,
      text: `${title} (${subtitle}) on Milad Fest 2K26 Portal`,
      url: publicUrl,
    });
    if (success) {
      showToast('Shared successfully!');
    }
  };

  const handleDownloadQR = async () => {
    try {
      await downloadQRCodePNG(publicUrl, filename, title, subtitle);
      showToast('QR Code image downloaded!');
    } catch (err) {
      alert('Failed to download QR code image.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-emerald-950 border-2 border-emerald-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 relative overflow-hidden">
        
        {/* Toast Notification Header Overlay */}
        {toastMsg && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-amber-400 text-emerald-950 px-4 py-1.5 rounded-full text-xs font-black shadow-lg flex items-center gap-1.5 z-20">
            <Check className="w-3.5 h-3.5" />
            <span>{toastMsg}</span>
          </div>
        )}

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-emerald-800/80 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-emerald-100">Public Share & Verification</h3>
              <p className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">Milad Fest 2K26</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-emerald-900/60 hover:bg-emerald-800 text-emerald-300 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Resource Details */}
        <div className="text-center space-y-1 bg-emerald-900/40 p-3 rounded-2xl border border-emerald-800/60">
          <h4 className="text-sm font-extrabold text-emerald-100">{title}</h4>
          <p className="text-xs text-amber-300 font-semibold">{subtitle}</p>
        </div>

        {/* QR Code Preview Card */}
        <div className="bg-white p-4 rounded-2xl border-4 border-amber-500/40 shadow-inner flex flex-col items-center justify-center space-y-2">
          {isGenerating || !qrDataUrl ? (
            <div className="h-44 flex items-center justify-center text-xs text-emerald-900 font-bold gap-2">
              <QrCode className="w-6 h-6 animate-pulse text-amber-600" />
              <span>Generating Scannable QR...</span>
            </div>
          ) : (
            <>
              <img
                src={qrDataUrl}
                alt={`QR Code for ${title}`}
                className="w-44 h-44 object-contain rounded-lg"
              />
              <span className="text-[10px] text-gray-500 font-mono text-center max-w-[260px] truncate">
                {publicUrl}
              </span>
            </>
          )}
        </div>

        {/* Public URL Input & Copy Button */}
        <div className="space-y-1">
          <label className="text-[11px] font-extrabold text-amber-400 uppercase tracking-wider block">Public Link</label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={publicUrl}
              className="flex-1 px-3.5 py-2 rounded-xl bg-emerald-900/60 border border-emerald-800 text-emerald-200 text-xs font-mono focus:outline-none select-all truncate"
            />
            <button
              onClick={handleCopyLink}
              className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 shrink-0 ${
                copied
                  ? 'bg-emerald-500 text-emerald-950 shadow'
                  : 'bg-amber-500 hover:bg-amber-400 text-emerald-950 shadow-md'
              }`}
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* Quick Action Share Buttons Grid */}
        <div className="grid grid-cols-3 gap-2 pt-1">
          {/* WhatsApp Share Button */}
          <button
            onClick={handleWhatsAppShare}
            className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md transition-all"
          >
            <MessageSquare className="w-4 h-4" />
            <span>WhatsApp</span>
          </button>

          {/* System Share */}
          <button
            onClick={handleNativeShare}
            className="py-2.5 px-3 rounded-xl bg-emerald-900 hover:bg-emerald-800 border border-emerald-700 text-emerald-100 font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
          >
            <Smartphone className="w-4 h-4 text-amber-400" />
            <span>Share</span>
          </button>

          {/* Download QR Code */}
          <button
            onClick={handleDownloadQR}
            className="py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-emerald-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-md transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Save QR</span>
          </button>
        </div>

      </div>
    </div>
  );
}
