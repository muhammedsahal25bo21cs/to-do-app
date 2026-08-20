'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { IslamicCrescentLogo } from '@/components/IslamicCrescentLogo';
import { Gavel, Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react';

export default function JudgeLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await login(email, password);
      if (!res.success) {
        setErrorMsg(res.error || 'Authentication failed.');
      } else {
        router.push('/judge/dashboard');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to authenticate judge session.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoJudgeLogin = async () => {
    await login('judge@miladfest.com', 'demo1234');
    router.push('/judge/dashboard');
  };

  return (
    <div className="min-h-screen bg-emerald-950 text-emerald-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-emerald-950/90 border border-emerald-800 p-8 rounded-3xl shadow-2xl space-y-6 backdrop-blur-xl">
        
        {/* Header Branding */}
        <div className="text-center space-y-3">
          <div className="inline-flex p-3 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400">
            <Gavel className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-emerald-100 flex items-center justify-center gap-2">
              <span>Official Judge Portal</span>
            </h1>
            <p className="text-xs text-emerald-300/80 mt-1">
              Milad Fest 2K26 — Operational Score Entry Panel
            </p>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-2xl bg-red-500/20 border border-red-500/40 text-red-200 text-xs font-bold text-center">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-extrabold text-emerald-300 mb-1">
              Judge Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-emerald-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                placeholder="judge@miladfest.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-emerald-900/40 border border-emerald-800 rounded-2xl py-2.5 pl-9 pr-3 text-xs text-emerald-100 placeholder-emerald-500 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-extrabold text-emerald-300 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-emerald-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-emerald-900/40 border border-emerald-800 rounded-2xl py-2.5 pl-9 pr-3 text-xs text-emerald-100 placeholder-emerald-500 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-emerald-950 font-black text-xs shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <span>{isLoading ? 'Authenticating...' : 'Sign In to Judge Desk'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-4 border-t border-emerald-800/60 text-center">
          <button
            onClick={handleDemoJudgeLogin}
            className="text-xs font-bold text-amber-400 hover:underline flex items-center justify-center gap-1.5 mx-auto"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Simulate Judge Login (Demo Access)</span>
          </button>
        </div>

      </div>
    </div>
  );
}
