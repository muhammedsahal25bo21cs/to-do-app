'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { 
  getProgrammes, 
  getCategories, 
  getProgrammeRegistrations, 
  getProgrammeScores,
  saveScore,
  submitJudgeScores,
  Programme, 
  Category,
  ProgrammeRegistration,
  ScoreEntry 
} from '@/lib/cmsService';
import { 
  Gavel, 
  Search, 
  CheckCircle2, 
  AlertTriangle, 
  Save, 
  Send, 
  WifiOff, 
  Sliders, 
  Clock, 
  HelpCircle,
  X
} from 'lucide-react';

function JudgeScoreEntryDeskContent() {
  const searchParams = useSearchParams();
  const initialProgrammeId = searchParams.get('programme_id') || '';

  const { canManageProgramme, adminProfile } = useAuth();

  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [selectedProgrammeId, setSelectedProgrammeId] = useState<string>(initialProgrammeId);
  const [activeProgramme, setActiveProgramme] = useState<Programme | null>(null);
  const [registrations, setRegistrations] = useState<ProgrammeRegistration[]>([]);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [scoreEntries, setScoreEntries] = useState<Record<string, ScoreEntry>>({});
  
  const [searchQuery, setSearchQuery] = useState('');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  // Criteria Modal State
  const [selectedRegForCriteria, setSelectedRegForCriteria] = useState<ProgrammeRegistration | null>(null);
  const [criteriaScores, setCriteriaScores] = useState<Record<string, number>>({
    pronunciation: 0,
    presentation: 0,
    accuracy: 0,
  });

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    loadProgrammes();
  }, []);

  useEffect(() => {
    if (selectedProgrammeId) {
      loadProgrammeData(selectedProgrammeId);
    }
  }, [selectedProgrammeId]);

  const loadProgrammes = async () => {
    const prgs = await getProgrammes(false, false);
    const allowed = prgs.filter(p => canManageProgramme(p.id));
    setProgrammes(allowed);
    if (!selectedProgrammeId && allowed.length > 0) {
      setSelectedProgrammeId(allowed[0].id);
    }
  };

  const loadProgrammeData = async (prgId: string) => {
    const target = programmes.find(p => p.id === prgId) || null;
    setActiveProgramme(target);

    const [regs, scrs] = await Promise.all([
      getProgrammeRegistrations(prgId),
      getProgrammeScores(prgId),
    ]);

    setRegistrations(regs);
    const scoreMap: Record<string, number> = {};
    const entryMap: Record<string, ScoreEntry> = {};

    regs.forEach(r => {
      const match = scrs.find(s => s.registration_id === r.id);
      if (match) {
        scoreMap[r.id] = match.score;
        entryMap[r.id] = match;
      }
    });

    setScores(scoreMap);
    setScoreEntries(entryMap);
  };

  const handleScoreChange = async (regId: string, val: string) => {
    const num = parseFloat(val);
    const newScore = isNaN(num) ? 0 : num;
    const maxScore = activeProgramme?.max_score || 100;

    if (newScore > maxScore) return;

    setScores(prev => ({ ...prev, [regId]: newScore }));
    setSaveStatus('saving');

    try {
      const reg = registrations.find(r => r.id === regId);
      if (reg && selectedProgrammeId) {
        const saved = await saveScore(
          selectedProgrammeId,
          reg.id,
          reg.student_id,
          reg.team_id,
          newScore,
          maxScore,
          adminProfile?.email || 'judge@miladfest.com'
        );
        setScoreEntries(prev => ({ ...prev, [regId]: saved }));
        setSaveStatus('saved');
      }
    } catch (e: any) {
      console.error('Autosave score error:', e);
      setSaveStatus('error');
    }
  };

  const handleSubmitAllScores = async () => {
    setIsSubmitting(true);
    try {
      if (selectedProgrammeId) {
        await submitJudgeScores(selectedProgrammeId, adminProfile?.email || 'judge@miladfest.com');
        await loadProgrammeData(selectedProgrammeId);
        setShowSubmitConfirm(false);
      }
    } catch (e: any) {
      alert(e.message || 'Failed to submit scores for verification.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openCriteriaModal = (reg: ProgrammeRegistration) => {
    setSelectedRegForCriteria(reg);
    const existing = scoreEntries[reg.id]?.criteria_breakdown || { pronunciation: 0, presentation: 0, accuracy: 0 };
    setCriteriaScores(existing);
  };

  const handleSaveCriteria = async () => {
    if (!selectedRegForCriteria || !activeProgramme) return;
    const total = (criteriaScores.pronunciation || 0) + (criteriaScores.presentation || 0) + (criteriaScores.accuracy || 0);
    
    await handleScoreChange(selectedRegForCriteria.id, total.toString());
    setSelectedRegForCriteria(null);
  };

  const filteredRegistrations = registrations.filter(r => {
    const name = (r.full_name || '').toLowerCase();
    const code = (r.registration_id_code || '').toLowerCase();
    const q = searchQuery.toLowerCase();
    return name.includes(q) || code.includes(q);
  });

  const enteredCount = Object.keys(scores).length;
  const verifiedCount = Object.values(scoreEntries).filter(s => s.is_verified).length;
  const maxScore = activeProgramme?.max_score || 100;

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Controls & Programme Switcher */}
      <div className="bg-emerald-950/90 border border-emerald-800 p-4 rounded-3xl space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <label className="block text-[11px] font-extrabold text-amber-300 uppercase tracking-wider mb-1">
              Select Assigned Programme
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

          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-black flex items-center gap-1.5 ${
              saveStatus === 'saving' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse' :
              saveStatus === 'saved' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' :
              saveStatus === 'error' ? 'bg-red-500/20 text-red-300 border border-red-500/40' :
              'bg-emerald-900/40 text-emerald-300'
            }`}>
              <Save className="w-3.5 h-3.5" />
              <span>
                {saveStatus === 'saving' ? 'Saving Score...' :
                 saveStatus === 'saved' ? 'Autosaved' :
                 saveStatus === 'error' ? 'Save Error' : 'Autosave Active'}
              </span>
            </span>

            {isOffline && (
              <span className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-extrabold flex items-center gap-1">
                <WifiOff className="w-3.5 h-3.5" />
                <span>Offline Mode</span>
              </span>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="pt-2 border-t border-emerald-800/60 space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-emerald-300">
            <span>Score Input Progress</span>
            <span className="text-amber-400 font-mono">{enteredCount} / {registrations.length} Entered ({verifiedCount} Verified)</span>
          </div>
          <div className="w-full h-2 rounded-full bg-emerald-950 overflow-hidden">
            <div
              className="h-full bg-amber-400 transition-all"
              style={{ width: `${registrations.length > 0 ? (enteredCount / registrations.length) * 100 : 0}%` }}
            />
          </div>
        </div>
      </div>

      {/* Participant Search */}
      <div className="relative">
        <Search className="w-4 h-4 text-emerald-400 absolute left-3.5 top-3" />
        <input
          type="text"
          placeholder="Search by participant name or Registration ID..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full bg-emerald-950/80 border border-emerald-800 rounded-2xl py-2.5 pl-10 pr-4 text-xs text-emerald-100 placeholder-emerald-500 focus:outline-none focus:border-amber-400 shadow-inner"
        />
      </div>

      {/* Participant Score List (Android Mobile Card View) */}
      <div className="space-y-3">
        {filteredRegistrations.map((reg, idx) => {
          const entry = scoreEntries[reg.id];
          const isVerified = entry?.is_verified === true;
          const isSubmitted = entry?.is_submitted === true;
          const needsCorrection = entry?.needs_correction === true;
          const hasScore = scores[reg.id] !== undefined && scores[reg.id] >= 0;

          let statusBadgeText = 'Not Entered';
          let statusBadgeClass = 'bg-emerald-900/40 text-emerald-400 border-emerald-800';

          if (needsCorrection) {
            statusBadgeText = 'Needs Correction';
            statusBadgeClass = 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse';
          } else if (isVerified) {
            statusBadgeText = 'Verified';
            statusBadgeClass = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
          } else if (isSubmitted) {
            statusBadgeText = 'Submitted';
            statusBadgeClass = 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30';
          } else if (hasScore) {
            statusBadgeText = 'Entered';
            statusBadgeClass = 'bg-amber-500/10 text-amber-300 border-amber-500/30';
          }

          return (
            <div
              key={reg.id}
              className="bg-emerald-950/90 border border-emerald-800 p-4 rounded-3xl shadow-lg space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-5 h-5 rounded-full bg-emerald-900 text-amber-400 text-[10px] font-black flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className="text-xs font-mono font-bold text-amber-300">
                      {reg.registration_id_code || 'REG-ID'}
                    </span>
                  </div>
                  <h3 className="text-base font-extrabold text-emerald-100">{reg.full_name}</h3>
                  <p className="text-xs text-emerald-400/80">
                    {reg.category_name || 'General'} • {reg.team_name || 'Independent'}
                  </p>
                </div>

                <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${statusBadgeClass}`}>
                  {statusBadgeText}
                </span>
              </div>

              {/* Correction Reason Alert if flagged */}
              {needsCorrection && entry?.correction_reason && (
                <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 space-y-1">
                  <div className="font-extrabold flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Correction Requested by Score Manager</span>
                  </div>
                  <p className="text-[11px] text-amber-200/90">{entry.correction_reason}</p>
                </div>
              )}

              {/* Score Input Row */}
              <div className="flex items-center justify-between gap-3 pt-2 border-t border-emerald-800/60">
                <button
                  type="button"
                  onClick={() => openCriteriaModal(reg)}
                  className="px-3 py-2 rounded-xl bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200 text-xs font-bold border border-emerald-700 flex items-center gap-1.5"
                >
                  <Sliders className="w-3.5 h-3.5 text-amber-400" />
                  <span>Criteria Breakdown</span>
                </button>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-emerald-400">Score:</span>
                  <input
                    type="number"
                    min={0}
                    max={maxScore}
                    disabled={isVerified}
                    value={scores[reg.id] !== undefined ? scores[reg.id] : ''}
                    onChange={e => handleScoreChange(reg.id, e.target.value)}
                    placeholder={`0-${maxScore}`}
                    className="w-20 bg-emerald-900/80 border border-amber-500/50 rounded-xl py-2 px-3 text-center text-sm font-black text-amber-300 focus:outline-none focus:border-amber-400 disabled:opacity-50"
                  />
                  <span className="text-xs font-extrabold text-emerald-400">/ {maxScore}</span>
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* Bottom Submit CTA */}
      <div className="pt-4">
        <button
          onClick={() => setShowSubmitConfirm(true)}
          className="w-full py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-emerald-950 font-black text-xs shadow-xl transition-all flex items-center justify-center gap-2"
        >
          <Send className="w-4 h-4" />
          <span>Submit Scores for Verification</span>
        </button>
      </div>

      {/* Submission Confirmation Modal */}
      {showSubmitConfirm && (
        <div className="fixed inset-0 z-50 bg-emerald-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-sm w-full bg-emerald-950 border border-emerald-800 p-6 rounded-3xl space-y-4 text-center">
            <Gavel className="w-10 h-10 text-amber-400 mx-auto" />
            <h3 className="text-lg font-black text-emerald-100">Submit Scores for Verification?</h3>
            <p className="text-xs text-emerald-300/80">
              Once submitted, scores will be forwarded to the Score Manager for review and verification.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setShowSubmitConfirm(false)}
                className="px-4 py-2 rounded-xl bg-emerald-900 text-emerald-300 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitAllScores}
                disabled={isSubmitting}
                className="px-5 py-2 rounded-xl bg-amber-500 text-emerald-950 text-xs font-black shadow-lg"
              >
                {isSubmitting ? 'Submitting...' : 'Confirm Submission'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Multi-Criteria Scoring Modal */}
      {selectedRegForCriteria && (
        <div className="fixed inset-0 z-50 bg-emerald-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-emerald-950 border border-emerald-800 p-6 rounded-3xl space-y-4">
            <div className="flex items-center justify-between border-b border-emerald-800/80 pb-3">
              <h3 className="text-sm font-extrabold text-emerald-100 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-amber-400" />
                <span>Multi-Criteria Breakdown — {selectedRegForCriteria.full_name}</span>
              </h3>
              <button onClick={() => setSelectedRegForCriteria(null)} className="text-emerald-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-emerald-300 mb-1">Pronunciation & Diction (Max: 30)</label>
                <input
                  type="number"
                  min={0}
                  max={30}
                  value={criteriaScores.pronunciation || 0}
                  onChange={e => setCriteriaScores(prev => ({ ...prev, pronunciation: parseFloat(e.target.value) || 0 }))}
                  className="w-full bg-emerald-900/60 border border-emerald-800 rounded-xl py-2 px-3 text-xs text-amber-300 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-emerald-300 mb-1">Presentation & Stage Presence (Max: 30)</label>
                <input
                  type="number"
                  min={0}
                  max={30}
                  value={criteriaScores.presentation || 0}
                  onChange={e => setCriteriaScores(prev => ({ ...prev, presentation: parseFloat(e.target.value) || 0 }))}
                  className="w-full bg-emerald-900/60 border border-emerald-800 rounded-xl py-2 px-3 text-xs text-amber-300 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-emerald-300 mb-1">Content Accuracy & Memory (Max: 40)</label>
                <input
                  type="number"
                  min={0}
                  max={40}
                  value={criteriaScores.accuracy || 0}
                  onChange={e => setCriteriaScores(prev => ({ ...prev, accuracy: parseFloat(e.target.value) || 0 }))}
                  className="w-full bg-emerald-900/60 border border-emerald-800 rounded-xl py-2 px-3 text-xs text-amber-300 font-bold"
                />
              </div>

              <div className="p-3 rounded-2xl bg-emerald-900/40 border border-emerald-800 flex items-center justify-between text-xs font-bold">
                <span className="text-emerald-300">Total Score:</span>
                <span className="text-amber-400 font-black text-sm">
                  {(criteriaScores.pronunciation || 0) + (criteriaScores.presentation || 0) + (criteriaScores.accuracy || 0)} / {maxScore}
                </span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button onClick={() => setSelectedRegForCriteria(null)} className="px-4 py-2 rounded-xl bg-emerald-900 text-emerald-300 text-xs font-bold">
                Cancel
              </button>
              <button onClick={handleSaveCriteria} className="px-5 py-2 rounded-xl bg-amber-500 text-emerald-950 text-xs font-black">
                Apply & Save Score
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

export default function JudgeScoreEntryDeskPage() {
  return (
    <React.Suspense fallback={
      <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 text-amber-400 gap-3 font-bold text-xs">
        <Gavel className="w-8 h-8 animate-spin" />
        <span>Loading Judge Score Entry Desk...</span>
      </div>
    }>
      <JudgeScoreEntryDeskContent />
    </React.Suspense>
  );
}
