'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { ShieldAlert, RefreshCw, Home } from 'lucide-react';

export default function GlobalErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Unhandled App Error Caught:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-emerald-950 text-emerald-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-emerald-950/90 border-2 border-amber-500/50 p-8 rounded-3xl shadow-2xl text-center space-y-6 backdrop-blur-xl">
        <div className="w-16 h-16 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center mx-auto text-amber-400">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber-400">
            System Fault Recovery
          </span>

          <h1 className="text-2xl font-black text-emerald-100 font-serif">
            Something Went Wrong
          </h1>

          <p className="text-xs text-emerald-300/80 leading-relaxed">
            An unexpected error occurred while processing your request. Sensitive details have been masked for event security.
          </p>
        </div>

        <div className="pt-2 flex items-center justify-center gap-3">
          <button
            onClick={() => reset()}
            className="px-5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-emerald-950 text-xs font-black shadow-lg flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Try Again</span>
          </button>

          <Link
            href="/"
            className="px-5 py-2.5 rounded-2xl bg-emerald-900 hover:bg-emerald-800 text-emerald-200 text-xs font-bold border border-emerald-700 flex items-center gap-2"
          >
            <Home className="w-4 h-4" />
            <span>Return Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
