'use client';

import React, { useState } from 'react';
import { Eye, X, Monitor, Smartphone, Tablet, ExternalLink } from 'lucide-react';

interface AdminPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
}

export const AdminPreviewModal: React.FC<AdminPreviewModalProps> = ({
  isOpen,
  onClose,
  title = 'Website Live Preview',
}) => {
  const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  if (!isOpen) return null;

  const deviceWidths = {
    desktop: 'w-full max-w-6xl',
    tablet: 'w-[768px]',
    mobile: 'w-[375px]',
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-emerald-950/95 backdrop-blur-xl animate-fade-in">
      {/* Top Controls Bar */}
      <div className="bg-emerald-950 border-b border-emerald-800/80 px-4 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <Eye className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-emerald-100">{title}</h2>
            <p className="text-[11px] text-amber-300 font-medium">Draft & Live Content Preview Mode</p>
          </div>
        </div>

        {/* Device Switcher */}
        <div className="hidden sm:flex items-center bg-emerald-900/60 p-1 rounded-xl border border-emerald-800">
          <button
            onClick={() => setDevice('desktop')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              device === 'desktop' ? 'bg-amber-500 text-emerald-950 shadow-md' : 'text-emerald-300 hover:text-white'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Desktop</span>
          </button>
          <button
            onClick={() => setDevice('tablet')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              device === 'tablet' ? 'bg-amber-500 text-emerald-950 shadow-md' : 'text-emerald-300 hover:text-white'
            }`}
          >
            <Tablet className="w-3.5 h-3.5" />
            <span>Tablet</span>
          </button>
          <button
            onClick={() => setDevice('mobile')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              device === 'mobile' ? 'bg-amber-500 text-emerald-950 shadow-md' : 'text-emerald-300 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Mobile</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-900/80 text-emerald-300 hover:text-white text-xs font-semibold border border-emerald-800 transition-colors"
          >
            <span>Open Public Tab</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-emerald-400 hover:text-white hover:bg-emerald-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Frame Container */}
      <div className="flex-1 bg-emerald-950/60 overflow-auto p-4 flex justify-center items-start">
        <div className={`h-full bg-emerald-950 border border-emerald-800/80 rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 ${deviceWidths[device]}`}>
          <iframe
            src="/"
            title="Public Website Preview"
            className="w-full h-full min-h-[80vh] border-0"
          />
        </div>
      </div>
    </div>
  );
};
