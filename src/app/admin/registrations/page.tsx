'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  getProgrammes, 
  getStudents, 
  getTeams, 
  getCategories,
  getProgrammeRegistrations, 
  registerParticipant, 
  bulkRegisterParticipants,
  updateRegistrationStatus,
  updateRegistrationAttendance,
  removeRegistration,
  updateProgramme,
  reviewRegistration,
  Programme, 
  Student, 
  Team, 
  Category,
  ProgrammeRegistration 
} from '@/lib/cmsService';
import { ConfirmModal } from '@/components/admin/ConfirmModal';
import { 
  CheckSquare, 
  Plus, 
  Trash2, 
  Users, 
  UserCheck, 
  Search, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  UserPlus, 
  X,
  Sparkles,
  Filter,
  Settings,
  Clock,
  ShieldCheck,
  Check,
  Ban,
  Loader2,
  RefreshCw,
  ExternalLink,
  Layers,
  FileText,
  AlertCircle
} from 'lucide-react';

export default function ProgrammeRegistrationsAdmin() {
  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [allRegistrations, setAllRegistrations] = useState<ProgrammeRegistration[]>([]);

  // Loading & Error States
  const [isLoadingProgrammes, setIsLoadingProgrammes] = useState(true);
  const [programmeError, setProgrammeError] = useState<string | null>(null);

  // Form State
  const [selectedFormProgrammeId, setSelectedFormProgrammeId] = useState<string>('');
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [selectedTeamId, setSelectedTeamId] = useState<string>('');
  const [studentSearch, setStudentSearch] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formMsg, setFormMsg] = useState<{ text: string; isError: boolean; isWarning?: boolean } | null>(null);

  // Filters for Registered List
  const [filterProgrammeId, setFilterProgrammeId] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [attendanceFilter, setAttendanceFilter] = useState<string>('all');

  // Bulk Register Modal State
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [bulkSelectedStudentIds, setBulkSelectedStudentIds] = useState<string[]>([]);
  const [bulkSearch, setBulkSearch] = useState('');
  const [bulkSummary, setBulkSummary] = useState<{ successCount: number; duplicateCount: number; errors: string[] } | null>(null);
  const [isBulkConfirmOpen, setIsBulkConfirmOpen] = useState(false);

  // Rejection Reason Modal
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectionReasonText, setRejectionReasonText] = useState<string>('');

  // Remove Modal
  const [removeId, setRemoveId] = useState<string | null>(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setIsLoadingProgrammes(true);
    setProgrammeError(null);
    try {
      const [prg, std, tm, cat, regs] = await Promise.all([
        getProgrammes(false),
        getStudents(false),
        getTeams(false),
        getCategories(),
        getProgrammeRegistrations(),
      ]);
      setProgrammes(prg);
      setStudents(std);
      setTeams(tm);
      setCategories(cat);
      setAllRegistrations(regs);

      // Default select first non-archived programme for registration
      const validPrgs = prg.filter(p => !p.is_archived);
      if (validPrgs.length > 0 && !selectedFormProgrammeId) {
        setSelectedFormProgrammeId(validPrgs[0].id);
      }
    } catch (err: any) {
      console.error('Error loading initial registration data:', err);
      setProgrammeError('Unable to load programmes.');
    } finally {
      setIsLoadingProgrammes(false);
    }
  };

  const loadAllRegistrations = async () => {
    const data = await getProgrammeRegistrations();
    setAllRegistrations(data);
  };

  // Filter programmes valid for admin registration
  const validFormProgrammes = programmes.filter(p => !p.is_archived);

  // Currently selected programme for the form
  const selectedFormProgramme = programmes.find(p => p.id === selectedFormProgrammeId);
  const selectedFormCategory = selectedFormProgramme
    ? categories.find(c => c.id === selectedFormProgramme.category_id || selectedFormProgramme.category_ids?.includes(c.id))
    : null;

  const isTeamProgramme = selectedFormProgramme?.competition_type === 'Team';

  // Format Programme Option label
  const formatProgrammeOption = (p: Programme) => {
    const cat = categories.find(c => c.id === p.category_id || p.category_ids?.includes(c.id));
    const catName = cat?.name_en || 'General';
    const type = p.competition_type === 'Team' ? 'Team' : 'Single';
    const closedNotice = p.registration_open === false ? ' 🔒 [Public Closed]' : '';
    return `${p.code ? p.code + ' - ' : ''}${p.title_en} • ${catName} • ${type}${closedNotice}`;
  };

  // Category Mismatch Verification
  const checkCategoryMismatch = (std?: Student): boolean => {
    if (!std || !selectedFormCategory) return false;
    return std.category_class.toLowerCase() !== selectedFormCategory.name_en.toLowerCase();
  };

  // Live Duplicate Check
  const isStudentDuplicate = !!(selectedFormProgrammeId && selectedStudentId && allRegistrations.some(r => r.programme_id === selectedFormProgrammeId && r.student_id === selectedStudentId));
  const isTeamDuplicate = !!(selectedFormProgrammeId && selectedTeamId && allRegistrations.some(r => r.programme_id === selectedFormProgrammeId && r.team_id === selectedTeamId));
  const isDuplicate = isTeamProgramme ? isTeamDuplicate : isStudentDuplicate;

  // Selected Student & Team objects for summary card
  const selectedStudentObj = students.find(s => s.id === selectedStudentId);
  const selectedTeamObj = teams.find(t => t.id === selectedTeamId);

  // Form Submit Handler
  const handleConfirmRegistration = async () => {
    if (!selectedFormProgrammeId) {
      setFormMsg({ text: 'Please select a programme.', isError: true });
      return;
    }

    if (isTeamProgramme && !selectedTeamId) {
      setFormMsg({ text: 'Please select a team for this group programme.', isError: true });
      return;
    }

    if (!isTeamProgramme && !selectedStudentId) {
      setFormMsg({ text: 'Please select a student for this single programme.', isError: true });
      return;
    }

    if (isDuplicate) {
      setFormMsg({ text: isTeamProgramme ? 'Team is already registered for this programme.' : 'Student is already registered for this programme.', isError: true });
      return;
    }

    setFormMsg(null);
    setIsSubmitting(true);

    try {
      if (isTeamProgramme) {
        await registerParticipant(selectedFormProgrammeId, 'team', undefined, selectedTeamId, 'Confirmed', 'Unmarked', true);
        setSelectedTeamId('');
        setFormMsg({ text: `Successfully registered team "${selectedTeamObj?.name_en}" for ${selectedFormProgramme?.title_en}!`, isError: false });
      } else {
        const isMismatch = checkCategoryMismatch(selectedStudentObj);
        await registerParticipant(selectedFormProgrammeId, 'student', selectedStudentId, selectedStudentObj?.team_id, 'Confirmed', 'Unmarked', true);
        setSelectedStudentId('');
        if (isMismatch) {
          setFormMsg({
            text: `Registered ${selectedStudentObj?.name_en}! Category Mismatch Notice: Student is in ${selectedStudentObj?.category_class} and registered into ${selectedFormCategory?.name_en} under Admin Override.`,
            isError: false,
            isWarning: true,
          });
        } else {
          setFormMsg({ text: `Successfully registered ${selectedStudentObj?.name_en} for ${selectedFormProgramme?.title_en}!`, isError: false });
        }
      }
      await loadAllRegistrations();
    } catch (err: any) {
      setFormMsg({ text: err.message || 'Registration failed.', isError: true });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Programme Configuration Updates
  const handleUpdateProgrammeConfig = async (changes: Partial<Programme>) => {
    if (!selectedFormProgrammeId) return;
    await updateProgramme(selectedFormProgrammeId, changes);
    const updatedPrgs = await getProgrammes(false);
    setProgrammes(updatedPrgs);
    setFormMsg({ text: 'Programme registration settings updated.', isError: false });
  };

  // Review Actions
  const handleApproveRegistration = async (regId: string) => {
    await reviewRegistration(regId, 'Approve');
    await loadAllRegistrations();
    setFormMsg({ text: 'Registration approved and confirmed.', isError: false });
  };

  const handleConfirmRejectRegistration = async () => {
    if (!rejectingId) return;
    await reviewRegistration(rejectingId, 'Reject', rejectionReasonText);
    setRejectingId(null);
    setRejectionReasonText('');
    await loadAllRegistrations();
    setFormMsg({ text: 'Registration rejected.', isError: false });
  };

  // Bulk Register Actions
  const handleToggleBulkStudent = (stdId: string) => {
    setBulkSelectedStudentIds(prev => 
      prev.includes(stdId) ? prev.filter(id => id !== stdId) : [...prev, stdId]
    );
  };

  const handleSelectAllFilteredStudents = () => {
    const ids = filteredBulkStudents.map(s => s.id);
    setBulkSelectedStudentIds(ids);
  };

  const handleOpenBulkConfirm = () => {
    if (bulkSelectedStudentIds.length === 0) {
      alert('Please select at least one student.');
      return;
    }
    setIsBulkConfirmOpen(true);
  };

  const confirmExecuteBulkRegistration = async () => {
    if (!selectedFormProgrammeId) return;
    setIsBulkConfirmOpen(false);
    const summary = await bulkRegisterParticipants(selectedFormProgrammeId, bulkSelectedStudentIds);
    setBulkSummary(summary);
    setBulkSelectedStudentIds([]);
    await loadAllRegistrations();
  };

  // Status & Attendance Updates
  const handleUpdateStatus = async (regId: string, status: any) => {
    await updateRegistrationStatus(regId, status);
    await loadAllRegistrations();
  };

  const handleUpdateAttendance = async (regId: string, attendance: any) => {
    await updateRegistrationAttendance(regId, attendance);
    await loadAllRegistrations();
  };

  const handleRemoveConfirm = async () => {
    if (removeId) {
      await removeRegistration(removeId);
      setRemoveId(null);
      await loadAllRegistrations();
    }
  };

  // Filtered lists
  const filteredStudents = students.filter(s => {
    if (studentSearch.trim()) {
      const q = studentSearch.toLowerCase();
      const tm = teams.find(t => t.id === s.team_id);
      return (
        s.name_en.toLowerCase().includes(q) ||
        s.student_id_code.toLowerCase().includes(q) ||
        (tm && tm.name_en.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const filteredBulkStudents = students.filter(s => {
    if (bulkSearch.trim()) {
      const q = bulkSearch.toLowerCase();
      return (
        s.name_en.toLowerCase().includes(q) ||
        s.student_id_code.toLowerCase().includes(q) ||
        s.category_class.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const filteredRegistrationsList = allRegistrations.filter(r => {
    if (filterProgrammeId !== 'all' && r.programme_id !== filterProgrammeId) return false;
    if (statusFilter !== 'all' && (r.status || 'Registered') !== statusFilter) return false;
    if (attendanceFilter !== 'all' && (r.attendance || 'Unmarked') !== attendanceFilter) return false;
    return true;
  });

  // Calculate Statistics
  const pendingCount = allRegistrations.filter(r => r.status === 'Pending').length;
  const confirmedCount = allRegistrations.filter(r => r.status === 'Confirmed' || r.status === 'Registered').length;
  const rejectedCount = allRegistrations.filter(r => r.status === 'Rejected').length;
  const presentCount = allRegistrations.filter(r => r.attendance === 'Present').length;
  const absentCount = allRegistrations.filter(r => r.attendance === 'Absent').length;

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-emerald-950/80 border border-emerald-800/80 p-6 rounded-3xl backdrop-blur-xl">
        <div>
          <h1 className="text-2xl font-black text-emerald-100 flex items-center gap-2">
            <CheckSquare className="w-6 h-6 text-amber-400" />
            <span>Fast Programme Registration & Attendance Desk</span>
          </h1>
          <p className="text-xs text-emerald-300/80 mt-1">
            Register competitors dynamically with mandatory programme selection, category auto-fill, duplicate protection, and live attendance tracking.
          </p>
        </div>

        <button
          onClick={() => {
            setIsBulkModalOpen(true);
            setBulkSummary(null);
          }}
          disabled={!selectedFormProgrammeId}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-emerald-950 font-extrabold text-xs shadow-lg shadow-amber-500/20 transition-all shrink-0 self-start sm:self-center disabled:opacity-50"
        >
          <Sparkles className="w-4 h-4" />
          <span>Bulk Register Students</span>
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
        <div className="bg-emerald-950/80 border border-emerald-800/80 rounded-2xl p-4 text-center space-y-1">
          <span className="text-[10px] text-amber-300 font-bold uppercase tracking-wider block">Total Registered</span>
          <span className="text-xl font-black text-gold-gradient">{allRegistrations.length}</span>
        </div>

        <div className="bg-emerald-950/80 border border-amber-500/40 rounded-2xl p-4 text-center space-y-1">
          <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block">Pending Review</span>
          <span className="text-xl font-black text-amber-300">{pendingCount}</span>
        </div>

        <div className="bg-emerald-950/80 border border-emerald-500/40 rounded-2xl p-4 text-center space-y-1">
          <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">Confirmed</span>
          <span className="text-xl font-black text-emerald-300">{confirmedCount}</span>
        </div>

        <div className="bg-emerald-950/80 border border-red-500/40 rounded-2xl p-4 text-center space-y-1">
          <span className="text-[10px] text-red-400 font-bold uppercase tracking-wider block">Rejected</span>
          <span className="text-xl font-black text-red-300">{rejectedCount}</span>
        </div>

        <div className="bg-emerald-950/80 border border-emerald-800/80 rounded-2xl p-4 text-center space-y-1">
          <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">Present</span>
          <span className="text-xl font-black text-emerald-100">{presentCount}</span>
        </div>

        <div className="bg-emerald-950/80 border border-emerald-800/80 rounded-2xl p-4 text-center space-y-1">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Absent</span>
          <span className="text-xl font-black text-slate-300">{absentCount}</span>
        </div>
      </div>

      {/* Programme Registration Settings Controls Bar */}
      {selectedFormProgramme && (
        <div className="bg-emerald-950/90 border border-emerald-800/80 rounded-3xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-emerald-800/60 pb-3">
            <h3 className="text-xs font-black uppercase text-amber-300 flex items-center gap-2 tracking-wider">
              <Settings className="w-4 h-4 text-amber-400" />
              <span>Programme Public Registration Controls ({selectedFormProgramme.title_en})</span>
            </h3>
            <span className="text-[10px] text-emerald-400 font-bold">
              ID: {selectedFormProgramme.id}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 text-xs">
            {/* Select Programme Option */}
            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-amber-300">Select Programme *</label>
              <select
                value={selectedFormProgrammeId}
                onChange={(e) => {
                  setSelectedFormProgrammeId(e.target.value);
                  setSelectedStudentId('');
                  setSelectedTeamId('');
                  setFormMsg(null);
                }}
                className="w-full px-3 py-2 rounded-xl bg-emerald-900 border-2 border-amber-500/60 text-amber-300 font-extrabold text-xs focus:outline-none focus:border-amber-400"
              >
                {validFormProgrammes.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.code ? `${p.code} - ` : ''}{p.title_en}
                  </option>
                ))}
              </select>
            </div>

            {/* Registration Mode */}
            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-emerald-300">Registration Mode</label>
              <select
                value={selectedFormProgramme.registration_mode || 'Both'}
                onChange={(e) => handleUpdateProgrammeConfig({ registration_mode: e.target.value as any })}
                className="w-full px-3 py-2 rounded-xl bg-emerald-900 border border-emerald-700 text-emerald-100 font-extrabold"
              >
                <option value="Admin Only">Admin Only</option>
                <option value="Public">Public Only</option>
                <option value="Both">Both (Admin & Public)</option>
              </select>
            </div>

            {/* Approval Mode */}
            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-emerald-300">Approval Mode</label>
              <select
                value={selectedFormProgramme.approval_mode || 'Automatic'}
                onChange={(e) => handleUpdateProgrammeConfig({ approval_mode: e.target.value as any })}
                className="w-full px-3 py-2 rounded-xl bg-emerald-900 border border-emerald-700 text-emerald-100 font-extrabold"
              >
                <option value="Automatic">Automatic Approval (Confirmed)</option>
                <option value="Manual">Manual Admin Review (Pending)</option>
              </select>
            </div>

            {/* Open / Closed Status */}
            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-emerald-300">Registration Open</label>
              <select
                value={selectedFormProgramme.registration_open === false ? 'Closed' : 'Open'}
                onChange={(e) => handleUpdateProgrammeConfig({ registration_open: e.target.value === 'Open' })}
                className="w-full px-3 py-2 rounded-xl bg-emerald-900 border border-emerald-700 text-emerald-100 font-extrabold"
              >
                <option value="Open">Registration Open</option>
                <option value="Closed">Registration Closed</option>
              </select>
            </div>

            {/* Capacity Limit */}
            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-emerald-300">Seat Capacity Limit</label>
              <input
                type="number"
                placeholder="Unlimited"
                value={selectedFormProgramme.max_participants || ''}
                onChange={(e) => handleUpdateProgrammeConfig({ max_participants: e.target.value ? parseInt(e.target.value) : undefined })}
                className="w-full px-3 py-2 rounded-xl bg-emerald-900 border border-emerald-700 text-emerald-100 font-extrabold placeholder:text-emerald-600"
              />
            </div>
          </div>
        </div>
      )}

      {/* Feedback Alert Banner */}
      {formMsg && (
        <div className={`p-4 rounded-2xl border text-xs font-bold flex items-center gap-2 ${
          formMsg.isError ? 'bg-red-500/10 border-red-500/40 text-red-300' :
          formMsg.isWarning ? 'bg-amber-500/10 border-amber-500/40 text-amber-300' :
          'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
        }`}>
          {formMsg.isError ? <XCircle className="w-5 h-5 shrink-0" /> : <AlertTriangle className="w-5 h-5 shrink-0" />}
          <span>{formMsg.text}</span>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Add Single Registration Form */}
        <div className="bg-emerald-950/80 border border-emerald-800/60 rounded-3xl p-6 shadow-xl space-y-5 h-fit">
          <h2 className="text-base font-bold text-emerald-100 border-b border-emerald-800/60 pb-3 flex items-center gap-2">
            <Plus className="w-5 h-5 text-amber-400" />
            <span>Add Single Registration</span>
          </h2>

          {/* LOADING STATE */}
          {isLoadingProgrammes && (
            <div className="p-8 text-center space-y-3 bg-emerald-900/30 rounded-2xl border border-emerald-800">
              <Loader2 className="w-8 h-8 text-amber-400 animate-spin mx-auto" />
              <p className="text-xs font-bold text-emerald-200">Loading programmes...</p>
            </div>
          )}

          {/* ERROR STATE */}
          {!isLoadingProgrammes && programmeError && (
            <div className="p-6 text-center space-y-3 bg-red-500/10 border border-red-500/30 rounded-2xl">
              <AlertCircle className="w-8 h-8 text-red-400 mx-auto" />
              <p className="text-xs font-bold text-red-300">{programmeError}</p>
              <button
                onClick={loadInitialData}
                className="px-4 py-2 rounded-xl bg-red-500 hover:bg-red-400 text-white font-extrabold text-xs inline-flex items-center gap-2"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry</span>
              </button>
            </div>
          )}

          {/* EMPTY PROGRAMMES STATE */}
          {!isLoadingProgrammes && !programmeError && validFormProgrammes.length === 0 && (
            <div className="p-6 text-center space-y-4 bg-emerald-900/30 border border-emerald-800 rounded-2xl">
              <Layers className="w-8 h-8 text-amber-400 mx-auto" />
              <div>
                <h3 className="text-sm font-bold text-emerald-100">No programmes available for registration</h3>
                <p className="text-xs text-emerald-400/80 mt-1">Please create a programme first to start registering participants.</p>
              </div>
              <Link
                href="/admin/programmes"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-emerald-950 font-extrabold text-xs shadow-lg"
              >
                <Plus className="w-4 h-4" />
                <span>Create Programme</span>
              </Link>
            </div>
          )}

          {/* FORM BODY */}
          {!isLoadingProgrammes && !programmeError && validFormProgrammes.length > 0 && (
            <div className="space-y-4">

              {/* 1. REQUIRED PROGRAMME SELECTOR AT THE TOP */}
              <div className="space-y-1.5">
                <label className="block text-xs font-black text-amber-300 uppercase tracking-wider">
                  Programme <span className="text-red-400">*</span>
                </label>
                <select
                  value={selectedFormProgrammeId}
                  onChange={(e) => {
                    setSelectedFormProgrammeId(e.target.value);
                    setSelectedStudentId('');
                    setSelectedTeamId('');
                    setFormMsg(null);
                  }}
                  className="w-full px-3.5 py-3 rounded-2xl bg-emerald-900 border-2 border-amber-500/60 text-emerald-100 font-extrabold text-xs focus:outline-none focus:border-amber-400 shadow-inner"
                >
                  <option value="">-- Select Programme --</option>
                  {validFormProgrammes.map(p => (
                    <option key={p.id} value={p.id}>
                      {formatProgrammeOption(p)}
                    </option>
                  ))}
                </select>
              </div>

              {/* 2. AUTO-FILLED PROGRAMME DETAILS CARD */}
              {selectedFormProgramme && (
                <div className="p-3.5 rounded-2xl bg-emerald-900/50 border border-emerald-800 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-[11px] font-extrabold text-amber-300 border-b border-emerald-800/60 pb-1.5">
                    <span>Programme Auto-Details</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-800 text-emerald-200">{selectedFormProgramme.code || 'PRG'}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <span className="text-emerald-400 block font-bold">Category / Level</span>
                      <span className="font-black text-emerald-100">{selectedFormCategory?.name_en || 'General'}</span>
                    </div>
                    <div>
                      <span className="text-emerald-400 block font-bold">Programme Type</span>
                      <span className="font-black text-amber-300">{isTeamProgramme ? 'Team / Group' : 'Single / Individual'}</span>
                    </div>
                    <div>
                      <span className="text-emerald-400 block font-bold">Venue</span>
                      <span className="font-black text-emerald-100">{selectedFormProgramme.venue || 'Main Stage'}</span>
                    </div>
                    <div>
                      <span className="text-emerald-400 block font-bold">Max Score</span>
                      <span className="font-black text-emerald-100">{selectedFormProgramme.max_score || 100}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* 3. DYNAMIC PARTICIPANT SELECTION */}
              {selectedFormProgrammeId && (
                <>
                  {isTeamProgramme ? (
                    /* TEAM SELECTION FLOW */
                    <div className="space-y-3 pt-2 border-t border-emerald-800/60">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                          <Users className="w-4 h-4" />
                          <span>Select Team <span className="text-red-400">*</span></span>
                        </label>
                        <Link href="/admin/teams" className="text-[10px] text-amber-400 hover:underline flex items-center gap-1">
                          <Plus className="w-3 h-3" />
                          <span>Create Team</span>
                        </Link>
                      </div>

                      <select
                        value={selectedTeamId}
                        onChange={(e) => setSelectedTeamId(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl bg-emerald-900 border border-emerald-800 text-emerald-100 text-xs font-bold"
                      >
                        <option value="">-- Choose Team --</option>
                        {teams.map(t => (
                          <option key={t.id} value={t.id}>{t.code || 'TEAM'} - {t.name_en}</option>
                        ))}
                      </select>

                      {selectedTeamObj && (
                        <div className="p-3 rounded-xl bg-emerald-900/30 border border-emerald-800 text-xs space-y-1">
                          <p className="font-bold text-emerald-100">Team: {selectedTeamObj.name_en}</p>
                          <p className="text-[11px] text-emerald-400">Total Roster: {students.filter(s => s.team_id === selectedTeamObj.id).length} members</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* INDIVIDUAL STUDENT SELECTION FLOW */
                    <div className="space-y-3 pt-2 border-t border-emerald-800/60">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                          <UserCheck className="w-4 h-4" />
                          <span>Select Student <span className="text-red-400">*</span></span>
                        </label>
                        <Link href="/admin/students" className="text-[10px] text-amber-400 hover:underline flex items-center gap-1">
                          <UserPlus className="w-3 h-3" />
                          <span>Add Student</span>
                        </Link>
                      </div>

                      {/* Search Student Filter */}
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 text-amber-400 absolute left-3 top-2.5" />
                        <input
                          type="text"
                          placeholder="Filter student list by name or ID..."
                          value={studentSearch}
                          onChange={(e) => setStudentSearch(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 rounded-xl bg-emerald-900/60 border border-emerald-800 text-emerald-100 text-xs focus:outline-none"
                        />
                      </div>

                      {/* Student Selector */}
                      <select
                        value={selectedStudentId}
                        onChange={(e) => setSelectedStudentId(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl bg-emerald-900 border border-emerald-800 text-emerald-100 text-xs font-bold"
                      >
                        <option value="">-- Choose Student --</option>
                        {filteredStudents.map(s => {
                          const isMismatch = checkCategoryMismatch(s);
                          return (
                            <option key={s.id} value={s.id}>
                              {s.student_id_code} - {s.name_en} ({s.category_class}) {isMismatch ? '⚠️ [Mismatch]' : ''}
                            </option>
                          );
                        })}
                      </select>

                      {/* Category Mismatch Warning */}
                      {selectedStudentId && checkCategoryMismatch(selectedStudentObj) && (
                        <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-300 font-semibold flex items-center gap-1.5">
                          <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
                          <span>Category Warning: Student is in {selectedStudentObj?.category_class} (Programme is {selectedFormCategory?.name_en}).</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* 4. DUPLICATE CHECK WARNING BANNER */}
                  {isDuplicate && (
                    <div className="p-3 rounded-2xl bg-red-500/20 border border-red-500/40 text-xs text-red-300 font-bold flex items-center gap-2">
                      <XCircle className="w-5 h-5 text-red-400 shrink-0" />
                      <span>{isTeamProgramme ? 'Team is already registered for this programme.' : 'Student is already registered for this programme.'}</span>
                    </div>
                  )}

                  {/* 5. PRE-REGISTRATION SUMMARY CARD */}
                  {(selectedStudentId || selectedTeamId) && !isDuplicate && (
                    <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs space-y-2">
                      <div className="flex items-center gap-1.5 text-amber-300 font-extrabold">
                        <FileText className="w-4 h-4 text-amber-400" />
                        <span>Registration Summary</span>
                      </div>
                      <div className="text-[11px] space-y-1 text-emerald-200">
                        <p><strong className="text-emerald-100">Programme:</strong> {selectedFormProgramme?.title_en}</p>
                        <p><strong className="text-emerald-100">Category:</strong> {selectedFormCategory?.name_en || 'General'}</p>
                        <p><strong className="text-emerald-100">Participant:</strong> {isTeamProgramme ? selectedTeamObj?.name_en : `${selectedStudentObj?.student_id_code} - ${selectedStudentObj?.name_en}`}</p>
                        <p><strong className="text-emerald-100">Type:</strong> {isTeamProgramme ? 'Team' : 'Single'}</p>
                      </div>
                    </div>
                  )}

                  {/* 6. CONFIRM REGISTRATION BUTTON */}
                  <button
                    onClick={handleConfirmRegistration}
                    disabled={isSubmitting || isDuplicate || (!selectedStudentId && !selectedTeamId)}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-emerald-950 font-black text-xs shadow-xl shadow-amber-500/20 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Registering...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Confirm Registration</span>
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Current Registrations List */}
        <div className="lg:col-span-2 bg-emerald-950/80 border border-emerald-800/60 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-800/60 pb-3">
            <div>
              <h2 className="text-base font-bold text-emerald-100">
                Registered Competitors ({filteredRegistrationsList.length})
              </h2>
              <p className="text-xs text-emerald-400/80">Manage status & attendance per competitor</p>
            </div>

            {/* List Filters */}
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={filterProgrammeId}
                onChange={(e) => setFilterProgrammeId(e.target.value)}
                className="px-2.5 py-1 rounded-xl bg-emerald-900 border border-emerald-800 text-emerald-200 text-[11px] font-bold"
              >
                <option value="all">All Programmes ({allRegistrations.length})</option>
                {programmes.map(p => (
                  <option key={p.id} value={p.id}>{p.code || 'PRG'} - {p.title_en}</option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-2.5 py-1 rounded-xl bg-emerald-900 border border-emerald-800 text-emerald-200 text-[11px] font-bold"
              >
                <option value="all">All Statuses</option>
                <option value="Registered">Registered</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Withdrawn">Withdrawn</option>
                <option value="Disqualified">Disqualified</option>
              </select>

              <select
                value={attendanceFilter}
                onChange={(e) => setAttendanceFilter(e.target.value)}
                className="px-2.5 py-1 rounded-xl bg-emerald-900 border border-emerald-800 text-emerald-200 text-[11px] font-bold"
              >
                <option value="all">All Attendance</option>
                <option value="Present">Present</option>
                <option value="Absent">Absent</option>
                <option value="Unmarked">Unmarked</option>
              </select>
            </div>
          </div>

          {filteredRegistrationsList.length === 0 ? (
            <div className="text-center py-12 text-emerald-400/60 text-xs font-medium">
              No competitors registered matching filters.
            </div>
          ) : (
            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
              {filteredRegistrationsList.map((reg) => {
                const prg = programmes.find(p => p.id === reg.programme_id);
                const cat = prg ? categories.find(c => c.id === prg.category_id || prg.category_ids?.includes(c.id)) : null;
                const std = students.find(s => s.id === reg.student_id);
                const tm = teams.find(t => t.id === reg.team_id || (std && std.team_id === t.id));
                const isMismatch = checkCategoryMismatch(std);

                return (
                  <div
                    key={reg.id}
                    className="p-4 rounded-2xl bg-emerald-900/30 border border-emerald-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          {prg ? `${prg.code || 'PRG'} • ${prg.title_en}` : reg.programme_id}
                        </span>
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-800 text-emerald-200">
                          {cat?.name_en || 'General'}
                        </span>
                        {isMismatch && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500 text-emerald-950">
                            Category Mismatch Override
                          </span>
                        )}
                      </div>

                      <h3 className="text-sm font-extrabold text-emerald-100">
                        {std ? `${std.student_id_code} - ${std.name_en}` : tm?.name_en || 'Team Participant'}
                      </h3>

                      <p className="text-xs text-amber-400 font-semibold mt-0.5">
                        Team: {tm?.name_en || 'Independent'} | Reg ID: <span className="font-mono text-emerald-300">{reg.id}</span>
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 shrink-0">
                      {/* Pending Review Quick Actions */}
                      {reg.status === 'Pending' && (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleApproveRegistration(reg.id)}
                            className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-black text-xs flex items-center gap-1 shadow-md"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Approve</span>
                          </button>

                          <button
                            onClick={() => {
                              setRejectingId(reg.id);
                              setRejectionReasonText('');
                            }}
                            className="px-3 py-1.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 font-bold text-xs flex items-center gap-1"
                          >
                            <Ban className="w-3.5 h-3.5 text-red-400" />
                            <span>Reject</span>
                          </button>
                        </div>
                      )}

                      {/* Attendance Toggle */}
                      <div className="flex items-center gap-1 bg-emerald-950 p-1 rounded-xl border border-emerald-800">
                        <button
                          onClick={() => handleUpdateAttendance(reg.id, 'Present')}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold transition-all ${
                            (reg.attendance === 'Present') ? 'bg-emerald-500 text-emerald-950' : 'text-emerald-400 hover:text-white'
                          }`}
                        >
                          Present
                        </button>
                        <button
                          onClick={() => handleUpdateAttendance(reg.id, 'Absent')}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold transition-all ${
                            (reg.attendance === 'Absent') ? 'bg-red-500 text-white' : 'text-emerald-400 hover:text-white'
                          }`}
                        >
                          Absent
                        </button>
                      </div>

                      {/* Status Selector */}
                      <select
                        value={reg.status || 'Registered'}
                        onChange={(e) => handleUpdateStatus(reg.id, e.target.value)}
                        className="px-2.5 py-1.5 rounded-xl bg-emerald-900 border border-emerald-700 text-emerald-100 text-xs font-bold"
                      >
                        <option value="Registered">Registered</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Pending">Pending Review</option>
                        <option value="Rejected">Rejected</option>
                        <option value="Withdrawn">Withdrawn</option>
                        <option value="Disqualified">Disqualified</option>
                      </select>

                      <button
                        onClick={() => setRemoveId(reg.id)}
                        className="p-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40"
                        title="Remove Registration"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* Bulk Registration Modal */}
      {isBulkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-emerald-950 border-2 border-amber-500/50 rounded-3xl p-6 max-w-2xl w-full shadow-2xl space-y-5 relative my-8">
            <button
              onClick={() => setIsBulkModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-emerald-400 hover:text-white hover:bg-emerald-900"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span className="text-xs text-amber-300 font-extrabold uppercase tracking-widest">Rapid Multi-Student Registration</span>
              </div>
              <h2 className="text-xl font-black text-emerald-100">Bulk Register Competitors</h2>
              <p className="text-xs text-emerald-400/80 mt-0.5">
                Select multiple students to register them into <span className="font-bold text-amber-300">{selectedFormProgramme?.title_en}</span> simultaneously.
              </p>
            </div>

            {/* Bulk Summary Report */}
            {bulkSummary && (
              <div className="p-4 rounded-2xl bg-emerald-900/60 border border-emerald-700 space-y-1 text-xs">
                <h4 className="font-black text-amber-300">Registration Summary Report</h4>
                <p className="text-emerald-100 font-bold">✅ {bulkSummary.successCount} students registered successfully.</p>
                {bulkSummary.duplicateCount > 0 && (
                  <p className="text-amber-400 font-semibold">⚠️ {bulkSummary.duplicateCount} students were already registered (skipped).</p>
                )}
              </div>
            )}

            {/* Bulk Search & Selection Bar */}
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-amber-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Filter student roster..."
                  value={bulkSearch}
                  onChange={(e) => setBulkSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-emerald-900 border border-emerald-800 text-emerald-100 text-xs focus:outline-none"
                />
              </div>

              <button
                onClick={handleSelectAllFilteredStudents}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-900 hover:bg-emerald-800 text-amber-300 border border-emerald-700 text-xs font-bold shrink-0"
              >
                Select All ({filteredBulkStudents.length})
              </button>
            </div>

            {/* Student Multi-Select Checkbox List */}
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {filteredBulkStudents.map((s) => {
                const isSelected = bulkSelectedStudentIds.includes(s.id);
                const isAlreadyReg = allRegistrations.some(r => r.programme_id === selectedFormProgrammeId && r.student_id === s.id);

                return (
                  <label
                    key={s.id}
                    className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                      isAlreadyReg ? 'opacity-50 bg-emerald-950 border-emerald-900' :
                      isSelected ? 'bg-amber-500/10 border-amber-500/50' : 'bg-emerald-900/30 border-emerald-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        disabled={isAlreadyReg}
                        checked={isSelected}
                        onChange={() => handleToggleBulkStudent(s.id)}
                        className="w-4 h-4 accent-amber-500 rounded"
                      />
                      <div>
                        <span className="font-mono text-xs font-bold text-amber-400 mr-2">{s.student_id_code}</span>
                        <span className="text-xs font-extrabold text-emerald-100">{s.name_en}</span>
                        <span className="text-[10px] text-emerald-400 block">{s.category_class}</span>
                      </div>
                    </div>

                    {isAlreadyReg && (
                      <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                        Already Registered
                      </span>
                    )}
                  </label>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-emerald-800/60">
              <span className="text-xs text-amber-300 font-bold">
                {bulkSelectedStudentIds.length} students selected
              </span>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsBulkModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-emerald-800 text-emerald-300 text-xs"
                >
                  Close
                </button>
                <button
                  onClick={handleOpenBulkConfirm}
                  disabled={bulkSelectedStudentIds.length === 0}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-emerald-950 font-extrabold text-xs shadow-lg shadow-amber-500/20 disabled:opacity-50"
                >
                  Register Selected ({bulkSelectedStudentIds.length})
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Registration Confirmation Modal */}
      <ConfirmModal
        isOpen={isBulkConfirmOpen}
        onClose={() => setIsBulkConfirmOpen(false)}
        onConfirm={confirmExecuteBulkRegistration}
        title="Confirm Bulk Registration"
        message={`Register ${bulkSelectedStudentIds.length} students for ${selectedFormProgramme?.title_en || 'Programme'} - ${selectedFormCategory?.name_en || 'Category'}?`}
        confirmText="Confirm"
      />

      {/* Rejection Reason Modal */}
      {rejectingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-emerald-950 border-2 border-red-500/50 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-lg font-black text-red-300 flex items-center gap-2">
              <Ban className="w-5 h-5 text-red-400" />
              <span>Reject Registration Entry</span>
            </h3>
            <p className="text-xs text-emerald-300">
              Provide an optional rejection reason. This reason will be displayed to the participant when they check their status using their Registration ID.
            </p>

            <textarea
              placeholder="e.g. Ineligible category or incomplete documentation..."
              value={rejectionReasonText}
              onChange={(e) => setRejectionReasonText(e.target.value)}
              className="w-full p-3 rounded-2xl bg-emerald-900 border border-emerald-700 text-emerald-100 text-xs focus:border-red-400 focus:outline-none min-h-[100px]"
            />

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setRejectingId(null)}
                className="px-4 py-2 rounded-xl border border-emerald-800 text-emerald-300 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRejectRegistration}
                className="px-5 py-2 rounded-xl bg-red-500 hover:bg-red-400 text-white font-extrabold text-xs shadow-lg"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Removal */}
      <ConfirmModal
        isOpen={!!removeId}
        onClose={() => setRemoveId(null)}
        onConfirm={handleRemoveConfirm}
        title="Remove Registration?"
        message="Are you sure you want to remove this competitor from the programme registration list?"
        confirmText="Remove Registration"
      />
    </div>
  );
}
