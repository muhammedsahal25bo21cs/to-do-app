'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { AdminPermissionGuard } from '@/components/admin/AdminPermissionGuard';
import { useAuth } from '@/context/AuthContext';
import { 
  getProgrammes, 
  checkInByRegistrationCode, 
  getRecentCheckIns, 
  Programme, 
  ProgrammeRegistration 
} from '@/lib/cmsService';
import { 
  QrCode, 
  Search, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  UserCheck, 
  ArrowLeft,
  Sparkles
} from 'lucide-react';

function MobileCheckInScannerContent() {
  const { adminProfile, canManageProgramme } = useAuth();

  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [selectedProgrammeId, setSelectedProgrammeId] = useState<string>('');
  
  const [inputCode, setInputCode] = useState('');
  const [recentCheckIns, setRecentCheckIns] = useState<ProgrammeRegistration[]>([]);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'warning' | 'error'; message: string; registration?: ProgrammeRegistration } | null>(null);
  
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [prgs, recents] = await Promise.all([
        getProgrammes(false, false),
        getRecentCheckIns(10),
      ]);
      const allowed = prgs.filter(p => canManageProgramme(p.id));
      setProgrammes(allowed);
      if (allowed.length > 0) {
        setSelectedProgrammeId(allowed[0].id);
      }
      setRecentCheckIns(recents);
    } catch (e) {
      console.error('Error loading mobile scanner data:', e);
    }
  };

  const handleScanCheckIn = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputCode.trim()) return;

    setIsProcessing(true);
    setFeedback(null);

    try {
      const res = await checkInByRegistrationCode(
        inputCode,
        selectedProgrammeId || undefined,
        adminProfile?.name_en || 'Check-in Staff'
      );

      if (!res.success) {
        setFeedback({ type: 'error', message: res.message, registration: res.registration });
      } else if (res.isAlreadyCheckedIn) {
        setFeedback({ type: 'warning', message: res.message, registration: res.registration });
      } else {
        setFeedback({ type: 'success', message: res.message, registration: res.registration });
        setInputCode('');
        const updatedRecents = await getRecentCheckIns(10);
        setRecentCheckIns(updatedRecents);
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Error processing check-in.' });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6 max-w-xl mx-auto pb-16">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link
          href="/admin/attendance"
          className="flex items-center gap-1.5 text-xs font-extrabold text-emerald-300 hover:text-amber-400 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Attendance Desk</span>
        </Link>
        <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-black uppercase tracking-wider">
          Mobile Scanner Desk
        </span>
      </div>

      {/* Programme Switcher */}
      <div className="bg-emerald-950/90 border border-emerald-800 p-4 rounded-3xl space-y-2">
        <label className="block text-[11px] font-extrabold text-amber-300 uppercase tracking-wider">
          Active Programme Filter
        </label>
        <select
          value={selectedProgrammeId}
          onChange={e => setSelectedProgrammeId(e.target.value)}
          className="w-full bg-emerald-900/60 border border-emerald-700 rounded-2xl py-2 px-3 text-xs text-emerald-100 font-bold focus:outline-none focus:border-amber-400"
        >
          {programmes.map(p => (
            <option key={p.id} value={p.id} className="bg-emerald-950 text-emerald-100">
              {p.title_en} ({p.venue || 'Main Stage'})
            </option>
          ))}
        </select>
      </div>

      {/* Scanner & Manual Code Input Form */}
      <div className="bg-emerald-950/90 border border-emerald-800 p-6 rounded-3xl shadow-xl space-y-4 text-center">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center mx-auto">
          <QrCode className="w-8 h-8" />
        </div>

        <div>
          <h2 className="text-lg font-black text-emerald-100">Scan QR or Enter Registration Code</h2>
          <p className="text-xs text-emerald-300/80 mt-0.5">
            Enter the 6-character registration ID code (e.g. REG-8F42K) or scan participant QR pass.
          </p>
        </div>

        <form onSubmit={handleScanCheckIn} className="space-y-3">
          <div className="relative">
            <input
              type="text"
              required
              placeholder="REG-XXXXXX"
              value={inputCode}
              onChange={e => setInputCode(e.target.value.toUpperCase())}
              className="w-full bg-emerald-900/80 border-2 border-amber-500/50 rounded-2xl py-3 px-4 text-center font-mono font-black text-lg text-amber-300 placeholder-emerald-600 focus:outline-none focus:border-amber-400 uppercase tracking-widest"
            />
          </div>

          <button
            type="submit"
            disabled={isProcessing || !inputCode.trim()}
            className="w-full py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-emerald-950 font-black text-xs shadow-xl transition-all flex items-center justify-center gap-2"
          >
            <UserCheck className="w-4 h-4" />
            <span>{isProcessing ? 'Verifying Registration...' : 'Check In Participant'}</span>
          </button>
        </form>
      </div>

      {/* Verification Feedback Card */}
      {feedback && (
        <div className={`p-5 rounded-3xl border flex items-start gap-3 space-y-1 ${
          feedback.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-200' :
          feedback.type === 'warning' ? 'bg-amber-500/10 border-amber-500/40 text-amber-200' :
          'bg-red-500/10 border-red-500/40 text-red-200'
        }`}>
          {feedback.type === 'success' ? <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" /> :
           feedback.type === 'warning' ? <AlertTriangle className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" /> :
           <AlertTriangle className="w-6 h-6 text-red-400 shrink-0 mt-0.5" />}

          <div className="space-y-1">
            <h3 className="text-sm font-extrabold">{feedback.message}</h3>
            {feedback.registration && (
              <div className="text-xs space-y-0.5 text-emerald-300/80 font-medium">
                <p><strong className="text-emerald-100">{feedback.registration.full_name}</strong> ({feedback.registration.registration_id_code})</p>
                <p>{feedback.registration.category_name} • {feedback.registration.team_name || 'Independent'}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Recent Check-Ins Live Stream */}
      <div className="bg-emerald-950/80 border border-emerald-800/60 rounded-3xl p-5 shadow-xl space-y-3">
        <div className="flex items-center justify-between border-b border-emerald-800/60 pb-2">
          <h3 className="text-sm font-extrabold text-emerald-100 flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400" />
            <span>Recent Successful Check-Ins ({recentCheckIns.length})</span>
          </h3>
          <span className="text-[10px] font-mono text-emerald-400">Live Feed</span>
        </div>

        {recentCheckIns.length === 0 ? (
          <p className="text-xs text-emerald-400/80 text-center py-4">No recent check-ins recorded yet today.</p>
        ) : (
          <div className="space-y-2">
            {recentCheckIns.map(item => (
              <div key={item.id} className="p-3 rounded-2xl bg-emerald-900/30 border border-emerald-800/80 flex items-center justify-between text-xs">
                <div>
                  <h4 className="font-extrabold text-emerald-100">{item.full_name}</h4>
                  <p className="text-[11px] text-emerald-400 font-mono">{item.registration_id_code} • {item.team_name || 'Independent'}</p>
                </div>
                <div className="text-right font-mono text-[11px] text-amber-300">
                  {item.checked_in_at ? new Date(item.checked_in_at).toLocaleTimeString() : 'Just now'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}

export default function MobileCheckInScannerGuardPage() {
  return (
    <AdminPermissionGuard featureKey="attendance" featureLabel="Mobile Check-in Scanner">
      <MobileCheckInScannerContent />
    </AdminPermissionGuard>
  );
}
