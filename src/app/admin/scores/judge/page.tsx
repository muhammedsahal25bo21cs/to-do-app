'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  getProgrammes, 
  getCategories, 
  getProgrammeRegistrations, 
  getProgrammeScores, 
  saveScore, 
  getStudents, 
  getTeams,
  Programme, 
  Category, 
  ProgrammeRegistration, 
  Student, 
  Team 
} from '@/lib/cmsService';
import { saveScoreWithOfflineProtection } from '@/lib/realtimeService';
import { ConnectionStatusBadge } from '@/components/ConnectionStatusBadge';
import { AdminPermissionGuard } from '@/components/admin/AdminPermissionGuard';
import { useAuth } from '@/context/AuthContext';
import { Gavel, Save, CheckCircle2, ArrowLeft, Sparkles, Award } from 'lucide-react';

function JudgeModePage() {
  const { canManageProgramme } = useAuth();
  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);

  const [selectedProgrammeId, setSelectedProgrammeId] = useState<string>('');
  const [activeProgramme, setActiveProgramme] = useState<Programme | null>(null);
  const [registrations, setRegistrations] = useState<ProgrammeRegistration[]>([]);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedProgrammeId) {
      loadProgrammeData(selectedProgrammeId);
    }
  }, [selectedProgrammeId]);

  const loadData = async () => {
    const [prgs, cats, stds, tms] = await Promise.all([
      getProgrammes(false, false),
      getCategories(),
      getStudents(true),
      getTeams(true),
    ]);
    const allowedPrgs = prgs.filter(p => canManageProgramme(p.id));
    setProgrammes(allowedPrgs);
    setCategories(cats);
    setStudents(stds);
    setTeams(tms);

    if (prgs.length > 0) {
      setSelectedProgrammeId(prgs[0].id);
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
    regs.forEach(r => {
      const match = scrs.find(s => s.registration_id === r.id);
      if (match) {
        scoreMap[r.id] = match.score;
      }
    });
    setScores(scoreMap);
  };

  const handleScoreChange = (regId: string, val: string) => {
    const num = parseFloat(val);
    setScores(prev => ({ ...prev, [regId]: isNaN(num) ? 0 : num }));
  };

  const handleSubmitScores = async () => {
    setIsSubmitting(true);
    setStatusMsg(null);

    const maxScore = activeProgramme?.max_score || 100;
    try {
      for (const reg of registrations) {
        if (scores[reg.id] !== undefined) {
          if (scores[reg.id] > maxScore) {
            throw new Error(`Score for participant exceeds maximum score of ${maxScore}`);
          }
          await saveScore(
            selectedProgrammeId,
            reg.id,
            reg.student_id,
            reg.team_id,
            scores[reg.id],
            maxScore
          );
        }
      }
      setStatusMsg('Scores submitted for verification successfully!');
    } catch (err: any) {
      alert(err.message || 'Error submitting scores.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-emerald-950 text-emerald-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-emerald-800/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-300">
              <Gavel className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <ConnectionStatusBadge />
              </div>
              <h1 className="text-2xl font-black text-gold-gradient">Judge Mode — Score Entry Desk</h1>
              <p className="text-xs text-emerald-300/80">Simplified, distraction-free score entry panel for event judges with offline protection.</p>
            </div>
          </div>

          <Link
            href="/admin/scores"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-900 border border-emerald-700 text-emerald-300 font-extrabold text-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Admin</span>
          </Link>
        </div>

        {/* Programme Selection */}
        <div className="bg-emerald-950/90 border border-emerald-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div>
            <label className="block text-xs font-bold text-amber-300 mb-1">Assigned Programme *</label>
            <select
              value={selectedProgrammeId}
              onChange={(e) => setSelectedProgrammeId(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-emerald-900 border border-emerald-700 text-emerald-100 text-sm font-bold focus:border-amber-400 focus:outline-none"
            >
              {programmes.map((p) => (
                <option key={p.id} value={p.id}>{p.title_en} ({p.code || 'PRG'})</option>
              ))}
            </select>
          </div>

          {activeProgramme && (
            <div className="p-3 rounded-2xl bg-emerald-900/40 border border-emerald-800 flex items-center justify-between text-xs">
              <span>Format: <strong className="text-amber-400">{activeProgramme.competition_type}</strong></span>
              <span>Venue: <strong className="text-emerald-100">{activeProgramme.venue}</strong></span>
              <span>Max Score: <strong className="text-amber-300">{activeProgramme.max_score}</strong></span>
            </div>
          )}
        </div>

        {statusMsg && (
          <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{statusMsg}</span>
          </div>
        )}

        {/* Participant Score List */}
        <div className="bg-emerald-950/90 border border-emerald-800 rounded-3xl p-6 shadow-xl space-y-4">
          <h2 className="text-base font-bold text-emerald-100">Participant Roster ({registrations.length})</h2>

          {registrations.length === 0 ? (
            <div className="text-center py-10 text-emerald-400/60 text-xs font-bold">
              No registered participants for this programme.
            </div>
          ) : (
            <div className="space-y-3">
              {registrations.map((reg) => {
                const std = students.find(s => s.id === reg.student_id);
                const tm = teams.find(t => t.id === reg.team_id || (std && std.team_id === t.id));
                const name = std?.name_en || tm?.name_en || 'Participant';
                const code = std?.student_id_code || tm?.code || 'ID-00';

                return (
                  <div
                    key={reg.id}
                    className="p-4 rounded-2xl bg-emerald-900/30 border border-emerald-800 flex items-center justify-between gap-4"
                  >
                    <div>
                      <h3 className="text-sm font-black text-emerald-100">{name}</h3>
                      <p className="text-xs text-emerald-400 font-mono">{code} • {tm?.name_en || 'Independent'}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        step="0.5"
                        min="0"
                        max={activeProgramme?.max_score || 100}
                        value={scores[reg.id] !== undefined ? scores[reg.id] : ''}
                        onChange={(e) => handleScoreChange(reg.id, e.target.value)}
                        placeholder="Score"
                        className="w-28 px-3 py-2.5 rounded-xl bg-emerald-900 border border-emerald-700 text-amber-300 font-mono font-black text-base text-center focus:border-amber-400 focus:outline-none"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {registrations.length > 0 && (
            <div className="pt-4 border-t border-emerald-800 flex justify-end">
              <button
                onClick={handleSubmitScores}
                disabled={isSubmitting}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-emerald-950 font-black text-xs shadow-xl"
              >
                <Save className="w-4 h-4" />
                <span>{isSubmitting ? 'Submitting...' : 'Submit Scores for Verification'}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function JudgeModeGuardPage() {
  return (
    <AdminPermissionGuard featureKey="scores" featureLabel="Judge Score Entry Desk">
      <JudgeModePage />
    </AdminPermissionGuard>
  );
}
