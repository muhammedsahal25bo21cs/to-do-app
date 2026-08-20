'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { 
  getProgrammes, 
  getCategories, 
  getProgrammeRegistrations, 
  getProgrammeScores, 
  saveScore, 
  verifyScores, 
  generateProgrammeResults, 
  getStudents, 
  getTeams,
  getScoreAuditHistory,
  bulkImportScoresCSV,
  Programme, 
  Category, 
  ProgrammeRegistration, 
  ScoreEntry, 
  Student, 
  Team,
  ScoreAuditHistoryEntry 
} from '@/lib/cmsService';
import { saveScoreWithOfflineProtection } from '@/lib/realtimeService';
import { ConnectionStatusBadge } from '@/components/ConnectionStatusBadge';
import { ConfirmModal } from '@/components/admin/ConfirmModal';
import { 
  Award, 
  Save, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  FileSpreadsheet, 
  History, 
  UserCheck, 
  Sparkles, 
  Search, 
  Lock, 
  Unlock,
  ChevronRight,
  Upload,
  Gavel
} from 'lucide-react';

export default function ScoreEntryAdminPage() {
  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);

  // Selected Context
  const [selectedProgrammeId, setSelectedProgrammeId] = useState<string>('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Data State
  const [registrations, setRegistrations] = useState<ProgrammeRegistration[]>([]);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [scoreStatus, setScoreStatus] = useState<Record<string, 'saved' | 'unsaved' | 'saving' | 'error'>>({});
  const [verificationStatus, setVerificationStatus] = useState<Record<string, boolean>>({});

  // Audit & CSV Modals
  const [auditLogs, setAuditLogs] = useState<ScoreAuditHistoryEntry[]>([]);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [isCSVModalOpen, setIsCSVModalOpen] = useState(false);
  const [csvText, setCsvText] = useState('');
  const [csvResultMsg, setCsvResultMsg] = useState<string | null>(null);

  // Status & Warnings
  const [activeProgramme, setActiveProgramme] = useState<Programme | null>(null);
  const [isSavingAll, setIsSavingAll] = useState(false);
  const [isVerifyingAll, setIsVerifyingAll] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [warningMsg, setWarningMsg] = useState<string | null>(null);
  const [confirmModalData, setConfirmModalData] = useState<{ title: string; message: string; action: () => void } | null>(null);

  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (selectedProgrammeId) {
      loadProgrammeScoresData(selectedProgrammeId);
    }
  }, [selectedProgrammeId]);

  const loadInitialData = async () => {
    const [prgs, cats, stds, tms] = await Promise.all([
      getProgrammes(false, false),
      getCategories(),
      getStudents(true),
      getTeams(true),
    ]);
    setProgrammes(prgs);
    setCategories(cats);
    setStudents(stds);
    setTeams(tms);

    if (prgs.length > 0) {
      setSelectedProgrammeId(prgs[0].id);
    }
  };

  const loadProgrammeScoresData = async (prgId: string) => {
    const targetPrg = programmes.find(p => p.id === prgId) || null;
    setActiveProgramme(targetPrg);

    const [regs, scrs, audit] = await Promise.all([
      getProgrammeRegistrations(prgId),
      getProgrammeScores(prgId),
      getScoreAuditHistory(prgId),
    ]);

    setRegistrations(regs);
    setAuditLogs(audit);

    const scoreMap: Record<string, number> = {};
    const verMap: Record<string, boolean> = {};
    const statMap: Record<string, 'saved' | 'unsaved' | 'saving' | 'error'> = {};

    regs.forEach(r => {
      const match = scrs.find(s => s.registration_id === r.id);
      if (match) {
        scoreMap[r.id] = match.score;
        verMap[r.id] = match.is_verified;
        statMap[r.id] = 'saved';
      }
    });

    setScores(scoreMap);
    setVerificationStatus(verMap);
    setScoreStatus(statMap);
  };

  const handleScoreChange = (regId: string, valStr: string) => {
    const num = parseFloat(valStr);
    const maxScore = activeProgramme?.max_score || 100;

    if (!isNaN(num) && num > maxScore) {
      setWarningMsg(`Score (${num}) cannot exceed maximum allowed score (${maxScore}).`);
    } else {
      setWarningMsg(null);
    }

    setScores(prev => ({ ...prev, [regId]: isNaN(num) ? 0 : num }));
    setScoreStatus(prev => ({ ...prev, [regId]: 'unsaved' }));
  };

  const handleSaveSingleScore = async (reg: ProgrammeRegistration, index: number) => {
    const scoreVal = scores[reg.id];
    if (scoreVal === undefined) return;

    const maxScore = activeProgramme?.max_score || 100;
    if (scoreVal > maxScore) {
      alert(`Score cannot exceed maximum score of ${maxScore}`);
      return;
    }

    // Check if editing verified score
    if (verificationStatus[reg.id]) {
      setConfirmModalData({
        title: 'Modify Verified Score?',
        message: 'This score has already been verified. Changing it may update calculated ranks and published leaderboards. Proceed?',
        action: async () => {
          await executeSaveSingleScore(reg, index);
        }
      });
      return;
    }

    await executeSaveSingleScore(reg, index);
  };

  const executeSaveSingleScore = async (reg: ProgrammeRegistration, index: number) => {
    setScoreStatus(prev => ({ ...prev, [reg.id]: 'saving' }));
    try {
      const res = await saveScoreWithOfflineProtection(
        selectedProgrammeId,
        reg.id,
        reg.student_id,
        reg.team_id,
        scores[reg.id] || 0,
        activeProgramme?.max_score || 100
      );
      setScoreStatus(prev => ({ ...prev, [reg.id]: 'saved' }));

      // Focus next input row if available
      const nextReg = filteredRegistrations[index + 1];
      if (nextReg && inputRefs.current[nextReg.id]) {
        inputRefs.current[nextReg.id]?.focus();
      }
    } catch (err: any) {
      setScoreStatus(prev => ({ ...prev, [reg.id]: 'error' }));
      alert(err.message || 'Failed to save score.');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, reg: ProgrammeRegistration, index: number) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSaveSingleScore(reg, index);
    }
  };

  const handleSaveAll = async () => {
    setIsSavingAll(true);
    for (let i = 0; i < registrations.length; i++) {
      const reg = registrations[i];
      if (scores[reg.id] !== undefined) {
        await saveScoreWithOfflineProtection(
          selectedProgrammeId,
          reg.id,
          reg.student_id,
          reg.team_id,
          scores[reg.id],
          activeProgramme?.max_score || 100
        );
      }
    }
    await loadProgrammeScoresData(selectedProgrammeId);
    setIsSavingAll(false);
  };

  const handleVerifyAll = async () => {
    setIsVerifyingAll(true);
    await verifyScores(selectedProgrammeId);
    await loadProgrammeScoresData(selectedProgrammeId);
    setIsVerifyingAll(false);
  };

  const handleGenerateResults = async () => {
    setIsGenerating(true);
    try {
      await generateProgrammeResults(selectedProgrammeId);
      alert('Programme results and rankings generated successfully!');
    } catch (err: any) {
      alert(err.message || 'Error generating results.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCSVImport = async () => {
    if (!csvText.trim()) return;
    setCsvResultMsg('Processing CSV Data...');

    const lines = csvText.split('\n');
    const parsedRows: { participantCode: string; score: number }[] = [];

    lines.forEach(line => {
      const parts = line.split(',');
      if (parts.length >= 2) {
        const code = parts[0].trim();
        const sc = parseFloat(parts[1].trim());
        if (code && !isNaN(sc)) {
          parsedRows.push({ participantCode: code, score: sc });
        }
      }
    });

    const res = await bulkImportScoresCSV(selectedProgrammeId, parsedRows, activeProgramme?.max_score || 100);
    setCsvResultMsg(`Imported ${res.successCount} scores successfully. ${res.errorCount} errors.`);
    if (res.errors.length > 0) {
      alert(`CSV Errors:\n${res.errors.join('\n')}`);
    }
    await loadProgrammeScoresData(selectedProgrammeId);
  };

  const filteredRegistrations = registrations.filter(r => {
    const std = students.find(s => s.id === r.student_id);
    const tm = teams.find(t => t.id === r.team_id);
    const name = std?.name_en || tm?.name_en || '';
    const code = std?.student_id_code || tm?.code || '';

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return name.toLowerCase().includes(q) || code.toLowerCase().includes(q);
    }
    return true;
  });

  const totalEntered = Object.keys(scores).length;
  const totalVerified = Object.values(verificationStatus).filter(Boolean).length;
  const isReadyToGenerate = registrations.length > 0 && totalVerified === registrations.length;

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="bg-emerald-950/80 border border-emerald-800/80 p-6 rounded-3xl backdrop-blur-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ConnectionStatusBadge />
          </div>
          <h1 className="text-2xl font-black text-emerald-100 flex items-center gap-2">
            <Award className="w-6 h-6 text-amber-400" />
            <span>Fast Score Entry & Verification Desk</span>
          </h1>
          <p className="text-xs text-emerald-300/80 mt-1">
            Keyboard-optimized score entry table with score verification locks, offline input protection, CSV import, and Judge Mode.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/admin/scores/judge"
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-500/40 font-extrabold text-xs transition-all"
          >
            <Gavel className="w-4 h-4" />
            <span>Judge Mode</span>
          </Link>

          <button
            onClick={() => setIsCSVModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-900 border border-emerald-700 text-emerald-200 font-extrabold text-xs transition-all"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>CSV Import</span>
          </button>
        </div>
      </div>

      {/* Programme & Category Selector Bar */}
      <div className="bg-emerald-950/80 border border-emerald-800/60 rounded-3xl p-5 shadow-xl space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-amber-400 mb-1">Select Programme *</label>
            <select
              value={selectedProgrammeId}
              onChange={(e) => setSelectedProgrammeId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl bg-emerald-900 border border-emerald-700 text-emerald-100 font-bold text-xs focus:border-amber-400 focus:outline-none"
            >
              {programmes.map((p) => (
                <option key={p.id} value={p.id}>{p.title_en} ({p.code || 'PRG'})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-amber-400 mb-1">Filter Category</label>
            <select
              value={selectedCategoryId}
              onChange={(e) => setSelectedCategoryId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl bg-emerald-900 border border-emerald-700 text-emerald-100 font-bold text-xs focus:border-amber-400 focus:outline-none"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name_en}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-amber-400 mb-1">Search Participant</label>
            <div className="relative">
              <Search className="w-4 h-4 text-emerald-500 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search name or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-emerald-900 border border-emerald-700 text-emerald-100 text-xs focus:border-amber-400 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Live Progress Banner */}
        {activeProgramme && (
          <div className="p-4 rounded-2xl bg-emerald-900/40 border border-emerald-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-4">
              <div>
                <span className="text-emerald-400 font-bold block">Entered Progress</span>
                <strong className="text-emerald-100 text-sm font-black">{totalEntered} / {registrations.length}</strong>
              </div>

              <div className="h-8 w-px bg-emerald-800" />

              <div>
                <span className="text-amber-400 font-bold block">Verified Scores</span>
                <strong className="text-amber-300 text-sm font-black">{totalVerified} / {registrations.length}</strong>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleVerifyAll}
                disabled={isVerifyingAll || registrations.length === 0}
                className="px-4 py-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 font-extrabold text-xs hover:bg-amber-500/30"
              >
                {isVerifyingAll ? 'Verifying...' : 'Verify All Scores'}
              </button>

              <button
                onClick={handleGenerateResults}
                disabled={isGenerating || !isReadyToGenerate}
                className={`px-5 py-2 rounded-xl font-black text-xs shadow-lg transition-all ${
                  isReadyToGenerate
                    ? 'bg-amber-500 text-emerald-950 hover:bg-amber-400'
                    : 'bg-emerald-900 text-emerald-500 border border-emerald-800 cursor-not-allowed'
                }`}
              >
                {isGenerating ? 'Calculating...' : 'Generate Ranking'}
              </button>
            </div>
          </div>
        )}
      </div>

      {warningMsg && (
        <div className="p-4 rounded-2xl bg-red-500/20 border border-red-500/40 text-red-200 text-xs font-bold flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{warningMsg}</span>
        </div>
      )}

      {/* Fast Score Entry Table */}
      <div className="bg-emerald-950/80 border border-emerald-800/60 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-emerald-800/60 pb-3">
          <h2 className="text-base font-bold text-emerald-100">
            Participant Score Roster ({filteredRegistrations.length})
          </h2>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAuditModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-900 text-emerald-300 font-bold text-xs border border-emerald-700"
            >
              <History className="w-3.5 h-3.5" />
              <span>Audit Trail ({auditLogs.length})</span>
            </button>

            <button
              onClick={handleSaveAll}
              disabled={isSavingAll || registrations.length === 0}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-emerald-950 font-black text-xs shadow-md"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSavingAll ? 'Saving All...' : 'Save All Scores'}</span>
            </button>
          </div>
        </div>

        {filteredRegistrations.length === 0 ? (
          <div className="text-center py-12 text-emerald-400/60 text-xs font-semibold">
            No registered participants found for this programme.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-emerald-800 text-amber-400 font-bold uppercase tracking-wider">
                  <th className="py-3 px-3">Participant</th>
                  <th className="py-3 px-3">Team / Madrasa</th>
                  <th className="py-3 px-3 text-center">Score Input (Max {activeProgramme?.max_score || 100})</th>
                  <th className="py-3 px-3 text-center">Status</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-900/60">
                {filteredRegistrations.map((reg, idx) => {
                  const std = students.find(s => s.id === reg.student_id);
                  const tm = teams.find(t => t.id === reg.team_id || (std && std.team_id === t.id));
                  const name = std?.name_en || tm?.name_en || 'Participant';
                  const code = std?.student_id_code || tm?.code || 'ID-00';
                  const stat = scoreStatus[reg.id] || 'unsaved';
                  const isVer = verificationStatus[reg.id];

                  return (
                    <tr key={reg.id} className="hover:bg-emerald-900/20">
                      <td className="py-3 px-3">
                        <div className="font-extrabold text-emerald-100">{name}</div>
                        <div className="text-[10px] font-mono text-emerald-400">{code}</div>
                      </td>

                      <td className="py-3 px-3 text-emerald-300">
                        {tm?.name_en || 'Independent'}
                      </td>

                      <td className="py-3 px-3 text-center">
                        <input
                          ref={(el) => { inputRefs.current[reg.id] = el; }}
                          type="number"
                          step="0.5"
                          min="0"
                          max={activeProgramme?.max_score || 100}
                          value={scores[reg.id] !== undefined ? scores[reg.id] : ''}
                          onChange={(e) => handleScoreChange(reg.id, e.target.value)}
                          onKeyDown={(e) => handleKeyDown(e, reg, idx)}
                          placeholder="00"
                          className="w-24 px-3 py-2 rounded-xl bg-emerald-900 border border-emerald-700 text-amber-300 font-mono font-extrabold text-center text-sm focus:border-amber-400 focus:outline-none"
                        />
                      </td>

                      <td className="py-3 px-3 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black border ${
                          isVer
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : stat === 'saved'
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            : 'bg-emerald-900 text-emerald-400 border-emerald-800'
                        }`}>
                          {isVer ? 'Verified' : stat === 'saved' ? 'Entered' : stat === 'saving' ? 'Saving...' : 'Unsaved'}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => handleSaveSingleScore(reg, idx)}
                          className="px-3 py-1.5 rounded-xl bg-emerald-900 hover:bg-emerald-800 text-emerald-100 font-extrabold text-[11px] border border-emerald-700"
                        >
                          Save
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CSV Import Modal */}
      {isCSVModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-emerald-950 border-2 border-emerald-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-emerald-800 pb-3">
              <h3 className="text-lg font-black text-emerald-100 flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-amber-400" />
                <span>Bulk CSV Score Import</span>
              </h3>
              <button onClick={() => setIsCSVModalOpen(false)} className="text-emerald-400 hover:text-white font-bold">✕</button>
            </div>

            <p className="text-xs text-emerald-300">
              Paste comma-separated rows in format: <code className="text-amber-300 font-bold">ParticipantID, Score</code>
            </p>

            <textarea
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              placeholder="STU-0001, 87&#10;STU-0002, 92"
              rows={6}
              className="w-full p-3 rounded-2xl bg-emerald-900 border border-emerald-700 text-emerald-100 font-mono text-xs focus:border-amber-400 focus:outline-none"
            />

            {csvResultMsg && (
              <div className="p-3 rounded-xl bg-emerald-900/60 text-amber-300 font-bold text-xs">
                {csvResultMsg}
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setIsCSVModalOpen(false)} className="px-4 py-2 rounded-xl bg-emerald-900 text-emerald-300 font-bold text-xs">Close</button>
              <button onClick={handleCSVImport} className="px-5 py-2 rounded-xl bg-amber-500 text-emerald-950 font-black text-xs shadow-lg">Run CSV Import</button>
            </div>
          </div>
        </div>
      )}

      {/* Audit History Drawer */}
      {isAuditModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-emerald-950 border-2 border-emerald-800 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-emerald-800 pb-3">
              <h3 className="text-lg font-black text-emerald-100 flex items-center gap-2">
                <History className="w-5 h-5 text-amber-400" />
                <span>Score Audit History Trail</span>
              </h3>
              <button onClick={() => setIsAuditModalOpen(false)} className="text-emerald-400 hover:text-white font-bold">✕</button>
            </div>

            <div className="max-h-[50vh] overflow-y-auto space-y-2 pr-1 text-xs">
              {auditLogs.length === 0 ? (
                <div className="text-center py-8 text-emerald-500 font-bold">No score edits recorded yet.</div>
              ) : (
                auditLogs.map((a) => (
                  <div key={a.id} className="p-3 rounded-2xl bg-emerald-900/40 border border-emerald-800 flex items-center justify-between">
                    <div>
                      <span className="font-extrabold text-emerald-100">{a.participant_name}</span>
                      <div className="text-[10px] text-emerald-400">By: {a.changed_by} • {new Date(a.timestamp).toLocaleString()}</div>
                    </div>

                    <div className="font-mono font-black text-amber-300 text-sm">
                      {a.old_score} → {a.new_score}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-emerald-800">
              <button onClick={() => setIsAuditModalOpen(false)} className="px-4 py-2 rounded-xl bg-amber-500 text-emerald-950 font-bold text-xs">Close Trail</button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmModalData && (
        <ConfirmModal
          isOpen={true}
          onClose={() => setConfirmModalData(null)}
          onConfirm={() => {
            confirmModalData.action();
            setConfirmModalData(null);
          }}
          title={confirmModalData.title}
          message={confirmModalData.message}
          confirmText="Proceed & Update Score"
        />
      )}
    </div>
  );
}
