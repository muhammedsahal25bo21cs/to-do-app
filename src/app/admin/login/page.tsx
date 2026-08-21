'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { IslamicCrescentLogo } from '@/components/IslamicCrescentLogo';
import { ShieldCheck, KeyRound, Mail, ArrowRight, AlertCircle, Loader2, Sparkles, HelpCircle, CheckCircle2 } from 'lucide-react';
import { AdminRole } from '@/lib/cmsService';

export default function AdminLoginPage() {
  const { login, resetPassword } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsSubmitting(true);

    const res = await login(email, password);
    if (res.success) {
      router.push('/admin');
    } else {
      setErrorMsg(res.error || 'Authentication failed. Please verify your email and password.');
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) return;
    setIsSubmitting(true);
    const res = await resetPassword(resetEmail);
    setIsSubmitting(false);
    if (res.success) {
      setSuccessMsg('Password reset instructions sent to your email.');
      setIsResetModalOpen(false);
    } else {
      setErrorMsg(res.error || 'Failed to send password reset email.');
    }
  };

  return (
    <div className="min-h-screen bg-emerald-950 text-emerald-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <IslamicCrescentLogo size="lg" showSubtitle={false} />
          </div>
          <h1 className="text-3xl font-extrabold text-gold-gradient tracking-tight">
            Administrator Portal
          </h1>
          <p className="text-xs text-emerald-200/80">
            Milad Fest 2K26 — Secure Supabase Authentication & Role Control
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-emerald-950/90 rounded-3xl p-6 sm:p-8 border border-amber-500/40 shadow-2xl space-y-6 backdrop-blur-xl">
          
          <div className="flex items-center gap-3 pb-4 border-b border-emerald-800/40">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-emerald-100">Supabase Admin Auth</h2>
              <p className="text-[11px] text-emerald-400/80">Sign in to manage programmes and event settings</p>
            </div>
          </div>

          {/* Success Notice */}
          {successMsg && (
            <div className="p-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Error Notice */}
          {errorMsg && (
            <div className="p-3 rounded-2xl bg-red-500/20 border border-red-500/50 text-red-300 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            
            <div className="space-y-1.5">
              <label className="font-bold text-amber-300 block">Admin Email:</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-amber-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="admin@miladfest.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-emerald-900/60 border border-emerald-700/60 rounded-2xl pl-10 pr-4 py-3 text-emerald-100 focus:outline-none focus:border-amber-400 font-mono"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="font-bold text-amber-300 block">Password:</label>
                <button
                  type="button"
                  onClick={() => setIsResetModalOpen(true)}
                  className="text-[11px] text-amber-400 hover:underline font-medium"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-amber-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-emerald-900/60 border border-emerald-700/60 rounded-2xl pl-10 pr-4 py-3 text-emerald-100 focus:outline-none focus:border-amber-400 font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-emerald-950 font-extrabold text-sm shadow-xl shadow-amber-500/20 hover:shadow-amber-500/40 transition-all duration-300 flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Admin Panel</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

          </form>

          {/* Security Notice */}
          <div className="pt-4 border-t border-emerald-800/40 text-center text-emerald-400/80 text-[11px]">
            <p>Protected Administrator Portal.</p>
            <p className="mt-0.5 text-emerald-500 font-medium">No account? Contact an existing Super Admin for access.</p>
          </div>

        </div>

        <div className="text-center text-xs text-emerald-400/70">
          <a href="/" className="hover:text-amber-300 transition-colors">
            ← Back to Public Website
          </a>
        </div>

      </div>

      {/* Forgot Password Recovery Modal */}
      {isResetModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-emerald-950 border-2 border-emerald-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-extrabold text-emerald-100">Password Recovery</h3>
            <p className="text-xs text-emerald-300/80">
              Enter your registered administrator email address below to receive a secure Supabase password reset link.
            </p>

            <form onSubmit={handleForgotPassword} className="space-y-4">
              <input
                type="email"
                required
                placeholder="admin@miladfest.com"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-emerald-900 border border-emerald-700 text-emerald-100 text-xs focus:border-amber-400 focus:outline-none"
              />

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsResetModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-emerald-900 text-emerald-300 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-amber-500 text-emerald-950 text-xs font-black shadow-lg"
                >
                  Send Reset Link
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
