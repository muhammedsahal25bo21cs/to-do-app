'use client';

import React, { useEffect, useState } from 'react';
import { 
  getProgrammes, 
  getStudents, 
  getTeams, 
  getCategories, 
  getCertificates,
  createCertificate,
  bulkGenerateWinnerCertificates,
  bulkGenerateParticipationCertificates,
  updateCertificateStatus,
  revokeCertificate,
  deleteCertificate,
  getCertificateTemplateConfig,
  updateCertificateTemplateConfig,
  Programme, 
  Student, 
  Team, 
  Category, 
  GeneratedCertificate,
  CertificateTemplateConfig,
  CertificateTemplateStyle,
  CertificateType,
  CertificateStatus
} from '@/lib/cmsService';
import { CertificateRenderer } from '@/components/CertificateRenderer';
import { ConfirmModal } from '@/components/admin/ConfirmModal';
import { 
  Award, 
  Sparkles, 
  Printer, 
  Download, 
  Search, 
  Ban, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  FileText, 
  Settings, 
  Users, 
  UserCheck, 
  Eye, 
  Plus, 
  Trash2, 
  X,
  Sliders,
  ShieldAlert
} from 'lucide-react';

export default function CertificateStudioAdminPage() {
  const [activeTab, setActiveTab] = useState<'winners' | 'participation' | 'special' | 'roster' | 'settings'>('winners');
  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [certificates, setCertificates] = useState<GeneratedCertificate[]>([]);
  const [templateConfig, setTemplateConfig] = useState<CertificateTemplateConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Winner Gen State
  const [selectedWinnerProgrammeId, setSelectedWinnerProgrammeId] = useState<string>('');
  const [winnerTeamMode, setWinnerTeamMode] = useState<'one_per_team' | 'one_per_member'>('one_per_member');
  const [winnerStyle, setWinnerStyle] = useState<CertificateTemplateStyle>('royal-gold');
  const [winnerGenMsg, setWinnerGenMsg] = useState<{ text: string; isError: boolean } | null>(null);

  // Participation Gen State
  const [selectedPartProgrammeId, setSelectedPartProgrammeId] = useState<string>('');
  const [partStyle, setPartStyle] = useState<CertificateTemplateStyle>('classic-islamic');
  const [partGenMsg, setPartGenMsg] = useState<{ text: string; isError: boolean } | null>(null);

  // Special Award State
  const [specialRecipientName, setSpecialRecipientName] = useState('');
  const [specialProgrammeId, setSpecialProgrammeId] = useState('');
  const [specialTitle, setSpecialTitle] = useState('SPECIAL RECOGNITION AWARD');
  const [specialText, setSpecialText] = useState('for outstanding contribution and exemplary leadership');
  const [specialStyle, setSpecialStyle] = useState<CertificateTemplateStyle>('royal-gold');
  const [specialMsg, setSpecialMsg] = useState<{ text: string; isError: boolean } | null>(null);

  // Roster Filters & Preview Modal
  const [rosterSearch, setRosterSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [previewCert, setPreviewCert] = useState<GeneratedCertificate | null>(null);

  // Revocation Modal
  const [revokingCertId, setRevokingCertId] = useState<string | null>(null);
  const [revokeReason, setRevokeReason] = useState('Administrative Revocation');

  // Delete Modal
  const [deleteCertId, setDeleteCertId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    const [prgs, stds, tms, cats, certs, cfg] = await Promise.all([
      getProgrammes(false, true),
      getStudents(true),
      getTeams(true),
      getCategories(true),
      getCertificates(),
      getCertificateTemplateConfig(),
    ]);

    setProgrammes(prgs);
    setStudents(stds);
    setTeams(tms);
    setCategories(cats);
    setCertificates(certs);
    setTemplateConfig(cfg);

    if (prgs.length > 0) {
      setSelectedWinnerProgrammeId(prgs[0].id);
      setSelectedPartProgrammeId(prgs[0].id);
    }
    setIsLoading(false);
  };

  // Bulk Winner Certificates Generator
  const handleGenerateWinnerCertificates = async () => {
    if (!selectedWinnerProgrammeId) return;
    setWinnerGenMsg(null);
    try {
      const res = await bulkGenerateWinnerCertificates(selectedWinnerProgrammeId, winnerTeamMode, winnerStyle);
      await loadData();
      setWinnerGenMsg({ text: `Successfully generated ${res.successCount} Winner Certificate(s)!`, isError: false });
    } catch (err: any) {
      setWinnerGenMsg({ text: err.message || 'Failed to generate winner certificates.', isError: true });
    }
  };

  // Bulk Participation Certificates Generator
  const handleGenerateParticipationCertificates = async () => {
    if (!selectedPartProgrammeId) return;
    setPartGenMsg(null);
    try {
      const res = await bulkGenerateParticipationCertificates(selectedPartProgrammeId, partStyle);
      await loadData();
      setPartGenMsg({ text: `Successfully generated ${res.successCount} Participation Certificate(s)!`, isError: false });
    } catch (err: any) {
      setPartGenMsg({ text: err.message || 'Failed to generate participation certificates.', isError: true });
    }
  };

  // Generate Special Award Certificate
  const handleCreateSpecialCertificate = async () => {
    if (!specialRecipientName.trim()) {
      setSpecialMsg({ text: 'Please enter recipient name.', isError: true });
      return;
    }

    const prg = programmes.find(p => p.id === specialProgrammeId);
    const cat = categories.find(c => c.id === prg?.category_id);

    try {
      await createCertificate({
        certificate_type: 'Special Award',
        template_style: specialStyle,
        status: 'Issued',
        recipient_type: 'student',
        recipient_name: specialRecipientName.trim(),
        programme_id: specialProgrammeId || undefined,
        programme_title: prg?.title_en || 'Special Award',
        category_name: cat?.name_en || 'General',
        event_name: 'Milad Fest 2K26',
        position: 'Special Award',
        achievement_text: specialText,
        issue_date: new Date().toISOString().split('T')[0],
      });

      setSpecialRecipientName('');
      await loadData();
      setSpecialMsg({ text: 'Special Award Certificate generated successfully!', isError: false });
    } catch (err: any) {
      setSpecialMsg({ text: err.message || 'Failed to create certificate.', isError: true });
    }
  };

  // Status & Revocation Handlers
  const handleStatusChange = async (certId: string, status: CertificateStatus) => {
    await updateCertificateStatus(certId, status);
    await loadData();
  };

  const handleConfirmRevoke = async () => {
    if (!revokingCertId) return;
    await revokeCertificate(revokingCertId, revokeReason);
    setRevokingCertId(null);
    setRevokeReason('Administrative Revocation');
    await loadData();
  };

  const handleConfirmDelete = async () => {
    if (!deleteCertId) return;
    await deleteCertificate(deleteCertId);
    setDeleteCertId(null);
    await loadData();
  };

  // Template Settings Save
  const handleSaveSettings = async () => {
    if (!templateConfig) return;
    await updateCertificateTemplateConfig(templateConfig);
    alert('Certificate branding & template configuration saved.');
  };

  // Print PDF Helper
  const handlePrintCertificate = (cert: GeneratedCertificate) => {
    setPreviewCert(cert);
    setTimeout(() => {
      window.print();
    }, 400);
  };

  const filteredCertificates = certificates.filter(c => {
    if (typeFilter !== 'all' && c.certificate_type !== typeFilter) return false;
    if (statusFilter !== 'all' && c.status !== statusFilter) return false;
    if (rosterSearch.trim()) {
      const q = rosterSearch.toLowerCase();
      return (
        c.id.toLowerCase().includes(q) ||
        c.recipient_name.toLowerCase().includes(q) ||
        c.programme_title.toLowerCase().includes(q) ||
        c.category_name.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-emerald-950/80 border border-emerald-800/80 p-6 rounded-3xl backdrop-blur-xl">
        <div>
          <h1 className="text-2xl font-black text-emerald-100 flex items-center gap-2">
            <Award className="w-7 h-7 text-amber-400" />
            <span>Professional Certificate Studio</span>
          </h1>
          <p className="text-xs text-emerald-300/80 mt-1">
            Generate, customize, and verify official Islamic Nabidinam/Milad certificates for Winners, Participants, and Special Awards.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => window.open('/verify', '_blank')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-900 hover:bg-emerald-800 border border-emerald-700 text-amber-300 text-xs font-bold transition-all shrink-0"
          >
            <UserCheck className="w-4 h-4" />
            <span>Public Verification Desk</span>
          </button>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex border-b border-emerald-800/60 overflow-x-auto gap-2">
        <button
          onClick={() => setActiveTab('winners')}
          className={`px-5 py-3 text-xs font-extrabold rounded-t-2xl transition-all shrink-0 flex items-center gap-2 ${
            activeTab === 'winners'
              ? 'bg-amber-500 text-emerald-950 shadow-lg shadow-amber-500/20'
              : 'text-emerald-300 hover:bg-emerald-900/60'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>1. Winner Certificates</span>
        </button>

        <button
          onClick={() => setActiveTab('participation')}
          className={`px-5 py-3 text-xs font-extrabold rounded-t-2xl transition-all shrink-0 flex items-center gap-2 ${
            activeTab === 'participation'
              ? 'bg-amber-500 text-emerald-950 shadow-lg shadow-amber-500/20'
              : 'text-emerald-300 hover:bg-emerald-900/60'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>2. Participation Certificates</span>
        </button>

        <button
          onClick={() => setActiveTab('special')}
          className={`px-5 py-3 text-xs font-extrabold rounded-t-2xl transition-all shrink-0 flex items-center gap-2 ${
            activeTab === 'special'
              ? 'bg-amber-500 text-emerald-950 shadow-lg shadow-amber-500/20'
              : 'text-emerald-300 hover:bg-emerald-900/60'
          }`}
        >
          <Plus className="w-4 h-4" />
          <span>3. Special Award</span>
        </button>

        <button
          onClick={() => setActiveTab('roster')}
          className={`px-5 py-3 text-xs font-extrabold rounded-t-2xl transition-all shrink-0 flex items-center gap-2 ${
            activeTab === 'roster'
              ? 'bg-amber-500 text-emerald-950 shadow-lg shadow-amber-500/20'
              : 'text-emerald-300 hover:bg-emerald-900/60'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>4. Certificates Roster ({certificates.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`px-5 py-3 text-xs font-extrabold rounded-t-2xl transition-all shrink-0 flex items-center gap-2 ${
            activeTab === 'settings'
              ? 'bg-amber-500 text-emerald-950 shadow-lg shadow-amber-500/20'
              : 'text-emerald-300 hover:bg-emerald-900/60'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>5. Branding & Templates</span>
        </button>
      </div>

      {/* TAB 1: WINNER CERTIFICATES */}
      {activeTab === 'winners' && (
        <div className="bg-emerald-950/80 border border-emerald-800/60 rounded-3xl p-6 shadow-xl space-y-6">
          <div>
            <h2 className="text-lg font-black text-amber-300 flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              <span>Bulk Generate Winner Certificates</span>
            </h2>
            <p className="text-xs text-emerald-300/80 mt-1">
              Automatically generates 1st, 2nd, and 3rd place certificates for published competition results.
            </p>
          </div>

          {winnerGenMsg && (
            <div className={`p-4 rounded-2xl border text-xs font-bold flex items-center gap-2 ${
              winnerGenMsg.isError ? 'bg-red-500/10 border-red-500/40 text-red-300' : 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
            }`}>
              {winnerGenMsg.isError ? <ShieldAlert className="w-5 h-5 shrink-0" /> : <CheckCircle2 className="w-5 h-5 shrink-0" />}
              <span>{winnerGenMsg.text}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Programme Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-amber-300">Select Programme *</label>
              <select
                value={selectedWinnerProgrammeId}
                onChange={(e) => setSelectedWinnerProgrammeId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-emerald-900 border border-emerald-700 text-emerald-100 text-xs font-bold"
              >
                {programmes.map(p => {
                  const cat = categories.find(c => c.id === p.category_id);
                  return (
                    <option key={p.id} value={p.id}>
                      {p.title_en} ({p.competition_type}) [{cat?.name_en || 'General'}]
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Team Mode */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-amber-300">Team Competition Mode</label>
              <select
                value={winnerTeamMode}
                onChange={(e) => setWinnerTeamMode(e.target.value as any)}
                className="w-full px-4 py-2.5 rounded-xl bg-emerald-900 border border-emerald-700 text-emerald-100 text-xs font-bold"
              >
                <option value="one_per_member">One Certificate Per Member (Individual Names)</option>
                <option value="one_per_team">One Certificate Per Team (Team Name Only)</option>
              </select>
            </div>

            {/* Visual Style */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-amber-300">Visual Theme</label>
              <select
                value={winnerStyle}
                onChange={(e) => setWinnerStyle(e.target.value as any)}
                className="w-full px-4 py-2.5 rounded-xl bg-emerald-900 border border-emerald-700 text-emerald-100 text-xs font-bold"
              >
                <option value="royal-gold">Royal Gold / Premium Nabidinam</option>
                <option value="classic-islamic">Classic Islamic Geometric</option>
                <option value="minimal-emerald">Minimal Emerald Modern</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleGenerateWinnerCertificates}
            className="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-emerald-950 font-black text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Generate Winner Certificates Now</span>
          </button>
        </div>
      )}

      {/* TAB 2: PARTICIPATION CERTIFICATES */}
      {activeTab === 'participation' && (
        <div className="bg-emerald-950/80 border border-emerald-800/60 rounded-3xl p-6 shadow-xl space-y-6">
          <div>
            <h2 className="text-lg font-black text-amber-300 flex items-center gap-2">
              <Users className="w-5 h-5" />
              <span>Bulk Generate Participation Certificates</span>
            </h2>
            <p className="text-xs text-emerald-300/80 mt-1">
              Generates official certificates of participation for all confirmed or present competitors in a programme.
            </p>
          </div>

          {partGenMsg && (
            <div className={`p-4 rounded-2xl border text-xs font-bold flex items-center gap-2 ${
              partGenMsg.isError ? 'bg-red-500/10 border-red-500/40 text-red-300' : 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
            }`}>
              {partGenMsg.isError ? <ShieldAlert className="w-5 h-5 shrink-0" /> : <CheckCircle2 className="w-5 h-5 shrink-0" />}
              <span>{partGenMsg.text}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Programme Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-amber-300">Select Programme *</label>
              <select
                value={selectedPartProgrammeId}
                onChange={(e) => setSelectedPartProgrammeId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-emerald-900 border border-emerald-700 text-emerald-100 text-xs font-bold"
              >
                {programmes.map(p => {
                  const cat = categories.find(c => c.id === p.category_id);
                  return (
                    <option key={p.id} value={p.id}>
                      {p.title_en} ({p.competition_type}) [{cat?.name_en || 'General'}]
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Visual Style */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-amber-300">Visual Theme</label>
              <select
                value={partStyle}
                onChange={(e) => setPartStyle(e.target.value as any)}
                className="w-full px-4 py-2.5 rounded-xl bg-emerald-900 border border-emerald-700 text-emerald-100 text-xs font-bold"
              >
                <option value="classic-islamic">Classic Islamic Geometric</option>
                <option value="royal-gold">Royal Gold / Premium Nabidinam</option>
                <option value="minimal-emerald">Minimal Emerald Modern</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleGenerateParticipationCertificates}
            className="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-emerald-950 font-black text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2"
          >
            <Users className="w-4 h-4" />
            <span>Generate Participation Certificates Now</span>
          </button>
        </div>
      )}

      {/* TAB 3: SPECIAL AWARD */}
      {activeTab === 'special' && (
        <div className="bg-emerald-950/80 border border-emerald-800/60 rounded-3xl p-6 shadow-xl space-y-6 max-w-2xl">
          <div>
            <h2 className="text-lg font-black text-amber-300 flex items-center gap-2">
              <Plus className="w-5 h-5" />
              <span>Create Special Award Certificate</span>
            </h2>
            <p className="text-xs text-emerald-300/80 mt-1">
              Generate a custom recognition certificate for guest speakers, volunteers, or special award winners.
            </p>
          </div>

          {specialMsg && (
            <div className={`p-4 rounded-2xl border text-xs font-bold flex items-center gap-2 ${
              specialMsg.isError ? 'bg-red-500/10 border-red-500/40 text-red-300' : 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
            }`}>
              {specialMsg.isError ? <ShieldAlert className="w-5 h-5 shrink-0" /> : <CheckCircle2 className="w-5 h-5 shrink-0" />}
              <span>{specialMsg.text}</span>
            </div>
          )}

          <div className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="block font-bold text-amber-300">Recipient Full Name *</label>
              <input
                type="text"
                placeholder="e.g. Brother Mohammed Al-Amoudi"
                value={specialRecipientName}
                onChange={(e) => setSpecialRecipientName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-emerald-900 border border-emerald-700 text-emerald-100 font-bold focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="block font-bold text-amber-300">Programme Context (Optional)</label>
              <select
                value={specialProgrammeId}
                onChange={(e) => setSpecialProgrammeId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-emerald-900 border border-emerald-700 text-emerald-100 font-bold"
              >
                <option value="">-- General Event Special Recognition --</option>
                {programmes.map(p => (
                  <option key={p.id} value={p.id}>{p.title_en}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="block font-bold text-amber-300">Achievement Text Wording</label>
              <textarea
                placeholder="e.g. for exemplary leadership, volunteering, and contribution to Milad Fest 2K26"
                value={specialText}
                onChange={(e) => setSpecialText(e.target.value)}
                className="w-full p-3 rounded-xl bg-emerald-900 border border-emerald-700 text-emerald-100 font-bold focus:outline-none min-h-[80px]"
              />
            </div>

            <div className="space-y-1">
              <label className="block font-bold text-amber-300">Visual Theme</label>
              <select
                value={specialStyle}
                onChange={(e) => setSpecialStyle(e.target.value as any)}
                className="w-full px-4 py-2.5 rounded-xl bg-emerald-900 border border-emerald-700 text-emerald-100 font-bold"
              >
                <option value="royal-gold">Royal Gold / Premium Nabidinam</option>
                <option value="classic-islamic">Classic Islamic Geometric</option>
                <option value="minimal-emerald">Minimal Emerald Modern</option>
              </select>
            </div>

            <button
              onClick={handleCreateSpecialCertificate}
              className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-emerald-950 font-extrabold text-xs shadow-lg shadow-amber-500/20 transition-all"
            >
              Generate Special Certificate
            </button>
          </div>
        </div>
      )}

      {/* TAB 4: ROSTER & REVOCATION */}
      {activeTab === 'roster' && (
        <div className="bg-emerald-950/80 border border-emerald-800/60 rounded-3xl p-6 shadow-xl space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-emerald-800/60 pb-4">
            <div>
              <h2 className="text-lg font-black text-emerald-100">
                Generated Certificates ({filteredCertificates.length})
              </h2>
              <p className="text-xs text-emerald-400/80">Manage, preview, print, or revoke official issued certificates</p>
            </div>

            {/* Filter controls */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-amber-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search recipient or ID..."
                  value={rosterSearch}
                  onChange={(e) => setRosterSearch(e.target.value)}
                  className="pl-9 pr-3 py-1.5 rounded-xl bg-emerald-900 border border-emerald-800 text-emerald-100 text-xs focus:outline-none"
                />
              </div>

              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-emerald-900 border border-emerald-800 text-emerald-200 text-xs font-bold"
              >
                <option value="all">All Types</option>
                <option value="Winner">Winner</option>
                <option value="Participation">Participation</option>
                <option value="Special Award">Special Award</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-emerald-900 border border-emerald-800 text-emerald-200 text-xs font-bold"
              >
                <option value="all">All Statuses</option>
                <option value="Issued">Issued</option>
                <option value="Draft">Draft</option>
                <option value="Revoked">Revoked</option>
              </select>
            </div>
          </div>

          {filteredCertificates.length === 0 ? (
            <div className="text-center py-12 text-emerald-400/60 text-xs font-medium">
              No certificates found matching criteria.
            </div>
          ) : (
            <div className="space-y-3 max-h-[65vh] overflow-y-auto pr-1">
              {filteredCertificates.map((cert) => (
                <div
                  key={cert.id}
                  className="p-4 rounded-2xl bg-emerald-900/30 border border-emerald-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs font-black text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                        {cert.id}
                      </span>
                      <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded ${
                        cert.certificate_type === 'Winner' ? 'bg-amber-500 text-emerald-950' :
                        cert.certificate_type === 'Participation' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                        'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                      }`}>
                        {cert.certificate_type} {cert.position ? `(${cert.position})` : ''}
                      </span>

                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                        cert.status === 'Issued' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' :
                        cert.status === 'Revoked' ? 'bg-red-500/20 text-red-300 border border-red-500/40' :
                        'bg-amber-500/20 text-amber-300'
                      }`}>
                        {cert.status}
                      </span>
                    </div>

                    <h3 className="text-sm font-black text-emerald-100">
                      {cert.recipient_name}
                    </h3>
                    <p className="text-xs text-amber-300/90 font-semibold mt-0.5">
                      {cert.programme_title} • {cert.category_name}
                    </p>
                    {cert.revoked_reason && (
                      <p className="text-[10px] text-red-400 mt-1 font-semibold">
                        Revocation Reason: {cert.revoked_reason}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => setPreviewCert(cert)}
                      className="p-2 rounded-xl bg-emerald-900 hover:bg-emerald-800 text-amber-300 border border-emerald-700"
                      title="Preview Certificate"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handlePrintCertificate(cert)}
                      className="p-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-emerald-950 font-bold"
                      title="Print / Save PDF"
                    >
                      <Printer className="w-4 h-4" />
                    </button>

                    {cert.status !== 'Revoked' && (
                      <button
                        onClick={() => {
                          setRevokingCertId(cert.id);
                          setRevokeReason('Administrative Revocation');
                        }}
                        className="px-3 py-1.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 text-xs font-bold flex items-center gap-1"
                        title="Revoke Certificate"
                      >
                        <Ban className="w-3.5 h-3.5 text-red-400" />
                        <span>Revoke</span>
                      </button>
                    )}

                    <button
                      onClick={() => setDeleteCertId(cert.id)}
                      className="p-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40"
                      title="Delete Record"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 5: BRANDING & TEMPLATES */}
      {activeTab === 'settings' && templateConfig && (
        <div className="bg-emerald-950/80 border border-emerald-800/60 rounded-3xl p-6 shadow-xl space-y-6 max-w-3xl">
          <div>
            <h2 className="text-lg font-black text-amber-300 flex items-center gap-2">
              <Settings className="w-5 h-5" />
              <span>Certificate Branding & Custom Wording</span>
            </h2>
            <p className="text-xs text-emerald-300/80 mt-1">
              Customize default certificate titles, wording templates, signature images, and official organizer name.
            </p>
          </div>

          <div className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="block font-bold text-amber-300">Organizer Name *</label>
              <input
                type="text"
                value={templateConfig.organizer_name}
                onChange={(e) => setTemplateConfig({ ...templateConfig, organizer_name: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-emerald-900 border border-emerald-700 text-emerald-100 font-bold"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block font-bold text-amber-300">Winner Certificate Header Title</label>
                <input
                  type="text"
                  value={templateConfig.title_winner}
                  onChange={(e) => setTemplateConfig({ ...templateConfig, title_winner: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-emerald-900 border border-emerald-700 text-emerald-100 font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-amber-300">Participation Header Title</label>
                <input
                  type="text"
                  value={templateConfig.title_participation}
                  onChange={(e) => setTemplateConfig({ ...templateConfig, title_participation: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-emerald-900 border border-emerald-700 text-emerald-100 font-bold"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block font-bold text-amber-300">Official Signature Image URL</label>
              <input
                type="text"
                placeholder="https://..."
                value={templateConfig.signature_url || ''}
                onChange={(e) => setTemplateConfig({ ...templateConfig, signature_url: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-emerald-900 border border-emerald-700 text-emerald-100 font-bold"
              />
            </div>

            <button
              onClick={handleSaveSettings}
              className="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-emerald-950 font-black text-xs shadow-lg shadow-amber-500/20 transition-all"
            >
              Save Certificate Branding Configuration
            </button>
          </div>
        </div>
      )}

      {/* Preview Certificate Modal */}
      {previewCert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="bg-emerald-950 border-2 border-amber-500/60 rounded-3xl p-6 max-w-4xl w-full shadow-2xl space-y-4 relative my-8">
            <button
              onClick={() => setPreviewCert(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-emerald-400 hover:text-white hover:bg-emerald-900"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-amber-300">Certificate Live Preview</h3>
                <span className="text-xs text-emerald-400 font-mono font-bold">ID: {previewCert.id}</span>
              </div>

              <button
                onClick={() => handlePrintCertificate(previewCert)}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-emerald-950 font-extrabold text-xs shadow-md flex items-center gap-2 mr-10"
              >
                <Printer className="w-4 h-4" />
                <span>Print / Save PDF</span>
              </button>
            </div>

            <div className="p-2 border border-emerald-800 rounded-2xl bg-black/40">
              <CertificateRenderer certificate={previewCert} previewMode />
            </div>
          </div>
        </div>
      )}

      {/* Revocation Reason Modal */}
      {revokingCertId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="bg-emerald-950 border-2 border-red-500/50 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-lg font-black text-red-300 flex items-center gap-2">
              <Ban className="w-5 h-5 text-red-400" />
              <span>Revoke Official Certificate</span>
            </h3>
            <p className="text-xs text-emerald-300">
              Revoking this certificate will immediately invalidate its verification status across the public lookup page and QR code scanner.
            </p>

            <textarea
              placeholder="Provide reason for revocation..."
              value={revokeReason}
              onChange={(e) => setRevokeReason(e.target.value)}
              className="w-full p-3 rounded-2xl bg-emerald-900 border border-emerald-700 text-emerald-100 text-xs focus:border-red-400 focus:outline-none min-h-[90px]"
            />

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setRevokingCertId(null)}
                className="px-4 py-2 rounded-xl border border-emerald-800 text-emerald-300 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRevoke}
                className="px-5 py-2 rounded-xl bg-red-500 hover:bg-red-400 text-white font-extrabold text-xs shadow-lg"
              >
                Confirm Revocation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      <ConfirmModal
        isOpen={!!deleteCertId}
        onClose={() => setDeleteCertId(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Certificate Record?"
        message="Are you sure you want to permanently remove this certificate record from the database?"
        confirmText="Delete Certificate"
      />
    </div>
  );
}
