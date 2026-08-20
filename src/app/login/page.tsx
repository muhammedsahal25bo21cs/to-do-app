'use client';

import React, { useState } from 'react';
import { IslamicCrescentLogo } from '@/components/IslamicCrescentLogo';
import { TEAMS } from '@/data/mockData';
import { ShieldCheck, UserCheck, KeyRound, Lock, Sparkles, AlertCircle, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const [loginRole, setLoginRole] = useState<'admin' | 'user'>('user');
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [selectedTeam, setSelectedTeam] = useState<string>('farqan');
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  const fillDemoAdmin = () => {
    setLoginRole('admin');
    setUsername('admin@nabidinamfest.org');
    setPassword('admin12345');
  };

  const fillDemoUser = () => {
    setLoginRole('user');
    setUsername('captain_farqan');
    setPassword('team12345');
    setSelectedTeam('farqan');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    setTimeout(() => setIsSubmitted(false), 4000);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12 space-y-8">
      
      {/* Brand & Title */}
      <div className="text-center space-y-3">
        <div className="flex justify-center">
          <IslamicCrescentLogo size="lg" showSubtitle={false} />
        </div>
        <h1 className="text-3xl font-extrabold text-gold-gradient tracking-tight">
          പ്രവേശന കവാടം (Portal Login)
        </h1>
        <p className="text-xs text-emerald-200/80">
          അഡ്മിൻ ഓഫീഷ്യലുകൾക്കും ടീം പ്രതിനിധികൾക്കും ലോഗിൻ ചെയ്യാം.
        </p>
      </div>

      {/* Role Switcher Tabs */}
      <div className="flex rounded-2xl bg-emerald-950/90 border border-emerald-800/60 p-1 shadow-lg">
        <button
          onClick={() => setLoginRole('user')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-2 ${
            loginRole === 'user'
              ? 'bg-amber-500 text-emerald-950 shadow-md'
              : 'text-emerald-300/80 hover:text-amber-300'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>യൂസർ / ടീം ലോഗിൻ</span>
        </button>

        <button
          onClick={() => setLoginRole('admin')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-2 ${
            loginRole === 'admin'
              ? 'bg-amber-500 text-emerald-950 shadow-md'
              : 'text-emerald-300/80 hover:text-amber-300'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>അഡ്മിൻ ലോഗിൻ</span>
        </button>
      </div>

      {/* Form Card */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-amber-500/30 shadow-2xl space-y-6">
        
        {/* Header Icon */}
        <div className="flex items-center gap-3 pb-4 border-b border-emerald-800/40">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300">
            {loginRole === 'admin' ? <ShieldCheck className="w-5 h-5" /> : <UserCheck className="w-5 h-5" />}
          </div>
          <div>
            <h2 className="text-lg font-bold text-emerald-100">
              {loginRole === 'admin' ? 'അഡ്മിൻ പോർട്ടൽ' : 'ടീം റെപ്രസെന്ററ്റീവ് പോർട്ടൽ'}
            </h2>
            <p className="text-[11px] text-emerald-400/80">
              {loginRole === 'admin' ? 'സ്കോറിങ്, റിസൾട്ട് പബ്ലിഷിങ് പോർട്ടൽ' : 'ചെസ്റ്റ് നമ്പർ, പോയിന്റുകൾ വിവരണം'}
            </p>
          </div>
        </div>

        {/* Success Alert Banner */}
        {isSubmitted && (
          <div className="p-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 text-xs font-semibold flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>ഡെമോ ലോഗിൻ വിജയകരം! ഫ്രണ്ട് എൻഡ് പ്രിവ്യൂ മോഡിലാണ് പ്രവർത്തിക്കുന്നത്.</span>
          </div>
        )}

        {/* Form Input Elements */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          {/* User Role Specific: Team Selector */}
          {loginRole === 'user' && (
            <div className="space-y-1.5">
              <label className="font-bold text-amber-300 block">സെക്ടർ / ടീം തിരഞ്ഞെടുക്കുക:</label>
              <select
                value={selectedTeam}
                onChange={(e) => setSelectedTeam(e.target.value)}
                className="w-full bg-emerald-950 border border-emerald-700/60 rounded-2xl px-4 py-3 text-emerald-100 font-semibold focus:outline-none focus:border-amber-400"
              >
                {TEAMS.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.nameMl} ({t.nameEn})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Username / Email Field */}
          <div className="space-y-1.5">
            <label className="font-bold text-amber-300 block">
              {loginRole === 'admin' ? 'അഡ്മിൻ യൂസർനയിം / ഇമെയിൽ:' : 'ക്യാപ്റ്റൻ ഐഡി / ഇമെയിൽ:'}
            </label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder={loginRole === 'admin' ? 'admin@nabidinamfest.org' : 'captain_farqan'}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-emerald-950/90 border border-emerald-700/60 rounded-2xl px-4 py-3 text-emerald-100 focus:outline-none focus:border-amber-400 placeholder:text-emerald-600 font-mono"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-1.5">
            <label className="font-bold text-amber-300 block">പാസ്‌വേഡ് (Password):</label>
            <div className="relative">
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-emerald-950/90 border border-emerald-700/60 rounded-2xl px-4 py-3 text-emerald-100 focus:outline-none focus:border-amber-400 font-mono"
              />
            </div>
          </div>

          {/* Remember Me */}
          <div className="flex items-center justify-between text-[11px] text-emerald-300/80 pt-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded accent-amber-500"
              />
              <span>ലോഗിൻ വിവരങ്ങൾ ഓർക്കുക</span>
            </label>
            <span className="text-amber-400/80 hover:underline cursor-pointer">
              പാസ്‌വേഡ് മറന്നോ?
            </span>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-emerald-950 font-bold text-sm shadow-xl shadow-amber-500/20 hover:shadow-amber-500/40 transition-all duration-300 flex items-center justify-center gap-2 mt-4"
          >
            <span>ലോഗിൻ ചെയ്യുക</span>
            <ArrowRight className="w-4 h-4" />
          </button>

        </form>

        {/* Demo Credentials Helper */}
        <div className="pt-4 border-t border-emerald-800/40 space-y-2 text-center">
          <p className="text-[11px] font-semibold text-emerald-400/80">ഡെമോ അക്കൗണ്ട് പ്രിവ്യൂ ചെയ്യാം:</p>
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={fillDemoAdmin}
              className="px-3 py-1.5 rounded-xl bg-emerald-900/60 border border-emerald-700/50 text-amber-300 text-[11px] font-semibold hover:bg-emerald-800/80"
            >
              🔑 ഡെമോ അഡ്മിൻ
            </button>
            <button
              onClick={fillDemoUser}
              className="px-3 py-1.5 rounded-xl bg-emerald-900/60 border border-emerald-700/50 text-amber-300 text-[11px] font-semibold hover:bg-emerald-800/80"
            >
              👤 ഡെമോ യൂസർ
            </button>
          </div>
        </div>

      </div>

      {/* Info Notice Card */}
      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2.5">
        <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold">പ്രത്യേക സൂചന:</p>
          <p className="text-emerald-200/80 text-[11px] font-light leading-relaxed">
            നിലവിൽ ഫ്രണ്ട് എൻഡ് പ്രിവ്യൂ മാത്രമാണ് സജ്ജമാക്കിയിരിക്കുന്നത്. ഓട്ടോമാറ്റിക് സ്‌കോറിങ് & ഡാറ്റാബേസ് കണക്ഷനുകൾ പിന്നീട് ഉൾപ്പെടുത്തുന്നതാണ്.
          </p>
        </div>
      </div>

    </div>
  );
}
