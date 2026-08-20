'use client';

import React, { useEffect, useState } from 'react';
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
  Ban
} from 'lucide-react';

export default function ProgrammeRegistrationsAdmin() {
  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedProgrammeId, setSelectedProgrammeId] = useState<string>('');
  const [registrations, setRegistrations] = useState<ProgrammeRegistration[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form & Search
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [selectedTeamId, setSelectedTeamId] = useState<string>('');
  const [studentSearch, setStudentSearch] = useState<string>('');
  const [formMsg, setFormMsg] = useState<{ text: string; isError: boolean; isWarning?: boolean } | null>(null);

  // Filters for Registered List
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

  useEffect(() => {
    if (selectedProgrammeId) {
      loadRegistrations(selectedProgrammeId);
      setFormMsg(null);
    }
  }, [selectedProgrammeId]);

  const loadInitialData = async () => {
    setIsLoading(true);
    const [prg, std, tm, cat] = await Promise.all([
      getProgrammes(false),
      getStudents(false),
      getTeams(false),
      getCategories(),
    ]);
    setProgrammes(prg);
    setStudents(std);
    setTeams(tm);
    setCategories(cat);
    if (prg.length > 0) {
      setSelectedProgrammeId(prg[0].id);
    }
    setIsLoading(false);
  };

  const loadRegistrations = async (prgId: string) => {
    const data = await getProgrammeRegistrations(prgId);
    setRegistrations(data);
  };

  const currentProgramme = programmes.find(p => p.id === selectedProgrammeId);
  const currentCategory = currentProgramme ? categories.find(c => c.id === currentProgramme.category_id) : null;

  // Programme Configuration Updates
  const handleUpdateProgrammeConfig = async (changes: Partial<Programme>) => {
    if (!selectedProgrammeId) return;
    await updateProgramme(selectedProgrammeId, changes);
    const updatedPrgs = await getProgrammes(false);
    setProgrammes(updatedPrgs);
    setFormMsg({ text: 'Programme registration settings updated.', isError: false });
  };

  // Review Actions
  const handleApproveRegistration = async (regId: string) => {
    await reviewRegistration(regId, 'Approve');
    await loadRegistrations(selectedProgrammeId);
    setFormMsg({ text: 'Registration approved and confirmed.', isError: false });
  };

  const handleConfirmRejectRegistration = async () => {
    if (!rejectingId) return;
    await reviewRegistration(rejectingId, 'Reject', rejectionReasonText);
    setRejectingId(null);
    setRejectionReasonText('');
    await loadRegistrations(selectedProgrammeId);
    setFormMsg({ text: 'Registration rejected.', isError: false });
  };

  // Category Mismatch Verification
  const checkCategoryMismatch = (std?: Student): boolean => {
    if (!std || !currentCategory) return false;
    return std.category_class.toLowerCase() !== currentCategory.name_en.toLowerCase();
  };

  const handleRegisterStudent = async () => {
    if (!selectedProgrammeId || !selectedStudentId) {
      setFormMsg({ text: 'Please select a student.', isError: true });
      return;
    }
    setFormMsg(null);

    const std = students.find(s => s.id === selectedStudentId);
    const isMismatch = checkCategoryMismatch(std);

    try {
      await registerParticipant(selectedProgrammeId, 'student', selectedStudentId, std?.team_id, 'Confirmed');
      setSelectedStudentId('');
      await loadRegistrations(selectedProgrammeId);

      if (isMismatch) {
        setFormMsg({
          text: `Category Mismatch Notice: Student belongs to ${std?.category_class} and was registered into ${currentCategory?.name_en} under Admin Override.`,
          isError: false,
          isWarning: true,
        });
      } else {
        setFormMsg({ text: `Successfully registered ${std?.name_en}!`, isError: false });
      }
    } catch (err: any) {
      setFormMsg({ text: err.message || 'Registration failed.', isError: true });
    }
  };

  const handleRegisterTeam = async () => {
    if (!selectedProgrammeId || !selectedTeamId) {
      setFormMsg({ text: 'Please select a team.', isError: true });
      return;
    }
    setFormMsg(null);

    const tm = teams.find(t => t.id === selectedTeamId);

    try {
      await registerParticipant(selectedProgrammeId, 'team', undefined, selectedTeamId, 'Confirmed');
      setSelectedTeamId('');
      await loadRegistrations(selectedProgrammeId);
      setFormMsg({ text: `Successfully registered team "${tm?.name_en}"!`, isError: false });
    } catch (err: any) {
      setFormMsg({ text: err.message || 'Team registration failed.', isError: true });
    }
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
    setIsBulkConfirmOpen(false);
    const summary = await bulkRegisterParticipants(selectedProgrammeId, bulkSelectedStudentIds);
    setBulkSummary(summary);
    setBulkSelectedStudentIds([]);
    await loadRegistrations(selectedProgrammeId);
  };

  // Status & Attendance Updates
  const handleUpdateStatus = async (regId: string, status: any) => {
    await updateRegistrationStatus(regId, status);
    await loadRegistrations(selectedProgrammeId);
  };

  const handleUpdateAttendance = async (regId: string, attendance: any) => {
    await updateRegistrationAttendance(regId, attendance);
    await loadRegistrations(selectedProgrammeId);
  };

  const handleRemoveConfirm = async () => {
    if (removeId) {
      await removeRegistration(removeId);
      setRemoveId(null);
      await loadRegistrations(selectedProgrammeId);
    }
  };

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

  const filteredRegistrationsList = registrations.filter(r => {
    if (statusFilter !== 'all' && (r.status || 'Registered') !== statusFilter) return false;
    if (attendanceFilter !== 'all' && (r.attendance || 'Unmarked') !== attendanceFilter) return false;
    return true;
  });

  // Calculate Registration Statistics
  const pendingCount = registrations.filter(r => r.status === 'Pending').length;
  const confirmedCount = registrations.filter(r => r.status === 'Confirmed' || r.status === 'Registered').length;
  const rejectedCount = registrations.filter(r => r.status === 'Rejected').length;
  const presentCount = registrations.filter(r => r.attendance === 'Present').length;
  const absentCount = registrations.filter(r => r.attendance === 'Absent').length;

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
            Register competitors with category validation, duplicate protection, bulk multi-select, and live attendance tracking.
          </p>
        </div>

        <button
          onClick={() => {
            setIsBulkModalOpen(true);
            setBulkSummary(null);
          }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-emerald-950 font-extrabold text-xs shadow-lg shadow-amber-500/20 transition-all shrink-0 self-start sm:self-center"
        >
          <Sparkles className="w-4 h-4" />
          <span>Bulk Register Students</span>
        </button>
      </div>

      {/* Registration Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
        <div className="bg-emerald-950/80 border border-emerald-800/80 rounded-2xl p-4 text-center space-y-1">
          <span className="text-[10px] text-amber-300 font-bold uppercase tracking-wider block">Total Registered</span>
          <span className="text-xl font-black text-gold-gradient">{registrations.length}</span>
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
      {currentProgramme && (
        <div className="bg-emerald-950/90 border border-emerald-800/80 rounded-3xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-emerald-800/60 pb-3">
            <h3 className="text-xs font-black uppercase text-amber-300 flex items-center gap-2 tracking-wider">
              <Settings className="w-4 h-4 text-amber-400" />
              <span>Programme Public Registration Controls</span>
            </h3>
            <span className="text-[10px] text-emerald-400 font-bold">
              ID: {currentProgramme.id}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
            {/* Registration Mode */}
            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-emerald-300">Registration Mode</label>
              <select
                value={currentProgramme.registration_mode || 'Both'}
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
                value={currentProgramme.approval_mode || 'Automatic'}
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
                value={currentProgramme.registration_open === false ? 'Closed' : 'Open'}
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
                value={currentProgramme.max_participants || ''}
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

      {/* Main Registration Control Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Add Registration Form */}
        <div className="bg-emerald-950/80 border border-emerald-800/60 rounded-3xl p-6 shadow-xl space-y-5 h-fit">
          <h2 className="text-base font-bold text-emerald-100 border-b border-emerald-800/60 pb-3 flex items-center gap-2">
            <Plus className="w-5 h-5 text-amber-400" />
            <span>Add Single Registration</span>
          </h2>

          {/* Student Registration Form with Search */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
              <UserCheck className="w-4 h-4" />
              <span>Register Student</span>
            </h3>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-amber-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Filter student list..."
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-emerald-900/60 border border-emerald-800 text-emerald-100 text-xs focus:outline-none"
              />
            </div>

            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-emerald-900 border border-emerald-800 text-emerald-100 text-xs"
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

            {/* Category Mismatch Warning Banner */}
            {selectedStudentId && checkCategoryMismatch(students.find(s => s.id === selectedStudentId)) && (
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-300 font-semibold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
                <span>Warning: Student belongs to a different category than event ({currentCategory?.name_en}).</span>
              </div>
            )}

            <button
              onClick={handleRegisterStudent}
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-emerald-950 font-extrabold text-xs shadow-lg shadow-amber-500/20 transition-all"
            >
              Register Student Now
            </button>
          </div>

          {/* Team Registration Form (If Team/Individual+Team) */}
          {currentProgramme?.competition_type !== 'Individual' && (
            <div className="pt-4 border-t border-emerald-800/40 space-y-3">
              <h3 className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                <Users className="w-4 h-4" />
                <span>Register Team</span>
              </h3>

              <select
                value={selectedTeamId}
                onChange={(e) => setSelectedTeamId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-emerald-900 border border-emerald-800 text-emerald-100 text-xs"
              >
                <option value="">-- Choose Team --</option>
                {teams.map(t => (
                  <option key={t.id} value={t.id}>{t.code} - {t.name_en}</option>
                ))}
              </select>

              <button
                onClick={handleRegisterTeam}
                className="w-full py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-emerald-100 font-extrabold text-xs transition-all"
              >
                Register Team Now
              </button>
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
              <p className="text-xs text-emerald-400/80">Manage live status & attendance per competitor</p>
            </div>

            {/* List Filters */}
            <div className="flex items-center gap-2">
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
                const std = students.find(s => s.id === reg.student_id);
                const tm = teams.find(t => t.id === reg.team_id || (std && std.team_id === t.id));
                const isMismatch = checkCategoryMismatch(std);

                return (
                  <div
                    key={reg.id}
                    className="p-4 rounded-2xl bg-emerald-900/30 border border-emerald-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          {reg.participant_type}
                        </span>
                        {isMismatch && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500 text-emerald-950">
                            Category Mismatch Override
                          </span>
                        )}
                      </div>

                      <h3 className="text-sm font-extrabold text-emerald-100">
                        {std ? `${std.student_id_code} - ${std.name_en}` : tm?.name_en}
                      </h3>

                      <p className="text-xs text-amber-400 font-semibold mt-0.5">
                        Team: {tm?.name_en || 'Independent'}
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
                Select multiple students to register them into <span className="font-bold text-amber-300">{currentProgramme?.title_en}</span> simultaneously.
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
                const isAlreadyReg = registrations.some(r => r.student_id === s.id);

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
        message={`Register ${bulkSelectedStudentIds.length} students for ${currentProgramme?.title_en || 'Programme'} - ${currentCategory?.name_en || 'Category'}?`}
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
