'use client';

import React, { useEffect, useState } from 'react';
import { 
  getStudents, 
  createStudent, 
  updateStudent, 
  restoreStudent,
  deleteStudent, 
  importStudentsCSV,
  getTeams, 
  getCategories, 
  getProgrammeRegistrations, 
  getProgrammeResults,
  getProgrammes,
  generateNextStudentCode,
  Student, 
  Team, 
  Category,
  ProgrammeRegistration,
  ProgrammeResult,
  Programme
} from '@/lib/cmsService';
import { ConfirmModal } from '@/components/admin/ConfirmModal';
import { AdminPermissionGuard } from '@/components/admin/AdminPermissionGuard';
import { 
  Users, 
  Plus, 
  Search, 
  Trash2, 
  Edit3, 
  Eye, 
  UserCheck, 
  Filter, 
  X, 
  Building2, 
  Tag, 
  Trophy, 
  Award, 
  Sparkles,
  Phone,
  Mail,
  MapPin,
  FileText,
  FileSpreadsheet,
  RotateCcw
} from 'lucide-react';

function StudentsAdminContent() {
  const [students, setStudents] = useState<Student[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');
  const [selectedTeamFilter, setSelectedTeamFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'active' | 'archived' | 'all'>('active');

  // Add / Edit Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<Partial<Student> | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // CSV Import Modal
  const [isCSVModalOpen, setIsCSVModalOpen] = useState(false);
  const [csvText, setCsvText] = useState('');
  const [csvSummary, setCsvSummary] = useState<{ successCount: number; duplicateCount: number; errors: string[] } | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  // Student Profile Drawer Modal
  const [profileStudent, setProfileStudent] = useState<Student | null>(null);
  const [studentRegs, setStudentRegs] = useState<ProgrammeRegistration[]>([]);
  const [studentResults, setStudentResults] = useState<ProgrammeResult[]>([]);
  const [allProgrammes, setAllProgrammes] = useState<Programme[]>([]);

  // Delete Confirmation
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    const [stds, tms, cats, prgs] = await Promise.all([
      getStudents(true),
      getTeams(false),
      getCategories(),
      getProgrammes(false),
    ]);
    setStudents(stds);
    setTeams(tms);
    setCategories(cats);
    setAllProgrammes(prgs);
    setIsLoading(false);
  };

  const handleOpenAddModal = async () => {
    const autoCode = await generateNextStudentCode();
    setFormError(null);
    setCurrentItem({
      student_id_code: autoCode,
      name_en: '',
      category_class: categories[0]?.name_en || 'Sub-Junior',
      team_id: teams[0]?.id || '',
      institution: '',
      contact_phone: '',
      contact_email: '',
      address: '',
      notes: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (std: Student) => {
    setFormError(null);
    setCurrentItem({ ...std });
    setIsModalOpen(true);
  };

  const handleOpenProfileModal = async (std: Student) => {
    setProfileStudent(std);
    const [regs, res] = await Promise.all([
      getProgrammeRegistrations(),
      getProgrammeResults(undefined, false),
    ]);
    const myRegs = regs.filter(r => r.student_id === std.id);
    const myRes = res.filter(r => r.student_id === std.id);
    setStudentRegs(myRegs);
    setStudentResults(myRes);
  };

  const handleSaveModal = async () => {
    setFormError(null);
    if (!currentItem || !currentItem.name_en?.trim()) {
      setFormError('Please provide at least a student full name.');
      return;
    }

    try {
      if (currentItem.id) {
        await updateStudent(currentItem.id, currentItem);
      } else {
        await createStudent(currentItem as Omit<Student, 'id'>);
      }
      setIsModalOpen(false);
      await loadData();
    } catch (err: any) {
      setFormError(err.message || 'Error saving student profile.');
    }
  };

  const handleRestoreStudent = async (id: string) => {
    await restoreStudent(id);
    await loadData();
  };

  const handleDeleteConfirm = async () => {
    if (deleteId) {
      await deleteStudent(deleteId);
      setDeleteId(null);
      await loadData();
    }
  };

  const handleExecuteCSVImport = async () => {
    if (!csvText.trim()) return;
    setIsImporting(true);
    setCsvSummary(null);

    // Parse lines: Format per line: "Student ID Code, Full Name, Category, Team Code/Name, Institution"
    const lines = csvText.split('\n').map(l => l.trim()).filter(Boolean);
    const rows = lines.map(line => {
      const parts = line.split(',').map(p => p.trim());
      if (parts.length === 1) {
        return { name_en: parts[0] };
      }
      return {
        student_id_code: parts[0] || undefined,
        name_en: parts[1] || parts[0],
        category_class: parts[2] || undefined,
        team_code_or_name: parts[3] || undefined,
        institution: parts[4] || undefined,
      };
    });

    const summary = await importStudentsCSV(rows);
    setCsvSummary(summary);
    setIsImporting(false);
    await loadData();
  };

  const filteredStudents = students.filter(s => {
    if (statusFilter === 'active' && s.is_archived) return false;
    if (statusFilter === 'archived' && !s.is_archived) return false;
    if (selectedCategoryFilter !== 'all' && s.category_class !== selectedCategoryFilter) return false;
    if (selectedTeamFilter !== 'all' && s.team_id !== selectedTeamFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const tm = teams.find(t => t.id === s.team_id);
      return (
        s.name_en.toLowerCase().includes(q) ||
        s.student_id_code.toLowerCase().includes(q) ||
        (s.institution && s.institution.toLowerCase().includes(q)) ||
        (tm && tm.name_en.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-emerald-950/80 border border-emerald-800/80 p-6 rounded-3xl backdrop-blur-xl">
        <div>
          <h1 className="text-2xl font-black text-emerald-100 flex items-center gap-2">
            <Users className="w-6 h-6 text-amber-400" />
            <span>Student Competitor Roster</span>
          </h1>
          <p className="text-xs text-emerald-300/80 mt-1">
            Register students, enforce unique Student IDs, assign teams, and manage student competitors.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
          <button
            onClick={() => {
              setIsCSVModalOpen(true);
              setCsvSummary(null);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-900 hover:bg-emerald-800 text-amber-300 border border-emerald-700 font-bold text-xs shadow-md transition-all"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>CSV Import</span>
          </button>

          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-emerald-950 font-extrabold text-xs shadow-lg shadow-amber-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Register New Student</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Controls */}
      <div className="bg-emerald-950/80 border border-emerald-800/80 rounded-3xl p-5 shadow-xl space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="relative sm:col-span-1">
            <Search className="w-4 h-4 text-amber-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by name, ID code, team..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-emerald-900/40 border border-emerald-800 text-emerald-100 text-xs focus:border-amber-400 focus:outline-none"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2 bg-emerald-900/40 px-3 py-1.5 rounded-2xl border border-emerald-800">
            <Filter className="w-4 h-4 text-amber-400 shrink-0" />
            <select
              value={statusFilter}
              onChange={(e: any) => setStatusFilter(e.target.value)}
              className="w-full bg-transparent text-xs font-bold text-emerald-100 focus:outline-none"
            >
              <option value="active" className="bg-emerald-950">Active Students</option>
              <option value="archived" className="bg-emerald-950">Archived Students</option>
              <option value="all" className="bg-emerald-950">All Records</option>
            </select>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2 bg-emerald-900/40 px-3 py-1.5 rounded-2xl border border-emerald-800">
            <Tag className="w-4 h-4 text-amber-400 shrink-0" />
            <select
              value={selectedCategoryFilter}
              onChange={(e) => setSelectedCategoryFilter(e.target.value)}
              className="w-full bg-transparent text-xs font-bold text-emerald-100 focus:outline-none"
            >
              <option value="all" className="bg-emerald-950">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.name_en} className="bg-emerald-950">{c.name_en}</option>
              ))}
            </select>
          </div>

          {/* Team Filter */}
          <div className="flex items-center gap-2 bg-emerald-900/40 px-3 py-1.5 rounded-2xl border border-emerald-800">
            <Users className="w-4 h-4 text-amber-400 shrink-0" />
            <select
              value={selectedTeamFilter}
              onChange={(e) => setSelectedTeamFilter(e.target.value)}
              className="w-full bg-transparent text-xs font-bold text-emerald-100 focus:outline-none"
            >
              <option value="all" className="bg-emerald-950">All Teams</option>
              {teams.map((t) => (
                <option key={t.id} value={t.id} className="bg-emerald-950">{t.name_en}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Student Cards / Grid */}
      {isLoading ? (
        <div className="text-center py-16 text-amber-300 text-xs font-bold">Loading student roster...</div>
      ) : filteredStudents.length === 0 ? (
        <div className="text-center py-16 bg-emerald-950/60 border border-emerald-800/60 rounded-3xl p-8 max-w-xl mx-auto space-y-3">
          <Users className="w-12 h-12 text-emerald-600 mx-auto" />
          <h3 className="text-base font-bold text-emerald-100">No students found matching your query</h3>
          <p className="text-xs text-emerald-400/80">Click "Register New Student" to add student competitors.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStudents.map((std) => {
            const tm = teams.find(t => t.id === std.team_id);
            return (
              <div
                key={std.id}
                className={`border rounded-3xl p-5 shadow-xl transition-all space-y-4 flex flex-col justify-between ${
                  std.is_archived
                    ? 'bg-emerald-950/40 border-emerald-900/60 opacity-60'
                    : 'bg-emerald-950/80 border-emerald-800/60 hover:border-amber-500/50'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono text-xs font-extrabold">
                      {std.student_id_code}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {std.is_archived && (
                        <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-300 text-[10px] font-bold border border-red-500/30">
                          Archived
                        </span>
                      )}
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-900 text-emerald-300 text-[10px] font-bold border border-emerald-800">
                        {std.category_class}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-black text-emerald-100">{std.name_en}</h3>
                    <p className="text-xs font-bold text-amber-400 mt-0.5">
                      Team: {tm?.name_en || 'Independent'}
                    </p>
                    {std.institution && (
                      <p className="text-[11px] text-emerald-400/70 mt-1 flex items-center gap-1">
                        <Building2 className="w-3 h-3 text-emerald-500" />
                        <span>{std.institution}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-2 pt-3 border-t border-emerald-800/40">
                  <button
                    onClick={() => handleOpenProfileModal(std)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-900 hover:bg-emerald-800 text-amber-300 border border-emerald-700 text-xs font-bold"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Profile</span>
                  </button>

                  <button
                    onClick={() => handleOpenEditModal(std)}
                    className="p-2 rounded-xl bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200 border border-emerald-800"
                    title="Edit"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  {std.is_archived ? (
                    <button
                      onClick={() => handleRestoreStudent(std.id)}
                      className="p-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40"
                      title="Restore Student"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={() => setDeleteId(std.id)}
                      className="p-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40"
                      title="Archive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CSV Import Modal */}
      {isCSVModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-emerald-950 border-2 border-emerald-800 rounded-3xl p-6 max-w-xl w-full shadow-2xl space-y-4 relative my-8">
            <button
              onClick={() => setIsCSVModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-emerald-400 hover:text-white hover:bg-emerald-900"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-bold text-emerald-100 flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-amber-400" />
              <span>CSV & Batch Student Import</span>
            </h2>

            <p className="text-xs text-emerald-300/80">
              Paste CSV or plain lines format: <code className="text-amber-300 font-mono">Student ID Code, Full Name, Category, Team Code/Name, Institution</code>
            </p>

            {csvSummary && (
              <div className="p-3 rounded-2xl bg-emerald-900/60 border border-emerald-700 text-xs space-y-1">
                <p className="text-emerald-100 font-bold">✅ {csvSummary.successCount} students imported cleanly.</p>
                {csvSummary.duplicateCount > 0 && (
                  <p className="text-amber-300 font-semibold">⚠️ {csvSummary.duplicateCount} duplicate Student IDs skipped.</p>
                )}
                {csvSummary.errors.length > 0 && (
                  <div className="text-red-300 font-semibold mt-1">
                    {csvSummary.errors.map((e, idx) => <p key={idx}>❌ {e}</p>)}
                  </div>
                )}
              </div>
            )}

            <div>
              <textarea
                rows={6}
                value={csvText}
                onChange={(e) => setCsvText(e.target.value)}
                placeholder={`STU-0001, Muhammed Sahal, Senior, Team Alpha, Markaz Madrasa\nSTU-0002, Ameen Ahmad, Junior, TM-02, Al Huda Academy`}
                className="w-full p-3 rounded-2xl bg-emerald-900/40 border border-emerald-800 text-emerald-100 font-mono text-xs focus:border-amber-400 focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-emerald-800/60">
              <button
                onClick={() => setIsCSVModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-emerald-800 text-emerald-300 text-xs"
              >
                Close
              </button>
              <button
                onClick={handleExecuteCSVImport}
                disabled={isImporting || !csvText.trim()}
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-emerald-950 font-extrabold text-xs shadow-lg shadow-amber-500/20 disabled:opacity-50"
              >
                {isImporting ? 'Importing...' : 'Execute Import'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Student Modal */}
      {isModalOpen && currentItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-emerald-950 border border-emerald-800 rounded-3xl p-6 max-w-xl w-full shadow-2xl space-y-4 my-8 relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-emerald-400 hover:text-white hover:bg-emerald-900"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-bold text-emerald-100">
              {currentItem.id ? 'Edit Student Profile' : 'Register New Student'}
            </h2>

            {formError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/40 text-red-300 text-xs font-bold">
                {formError}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[65vh] overflow-y-auto pr-2">
              <div>
                <label className="block text-xs font-bold text-amber-300 mb-1">Unique Student ID *</label>
                <input
                  type="text"
                  value={currentItem.student_id_code || ''}
                  onChange={(e) => setCurrentItem({ ...currentItem, student_id_code: e.target.value })}
                  placeholder="STU-0001"
                  className="w-full px-3.5 py-2 rounded-xl bg-emerald-900/40 border border-emerald-800 text-amber-300 font-mono font-bold text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-amber-300 mb-1">Category / Group *</label>
                <select
                  value={currentItem.category_class || ''}
                  onChange={(e) => setCurrentItem({ ...currentItem, category_class: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-emerald-900 border border-emerald-800 text-emerald-100 text-xs font-bold"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.name_en}>{c.name_en}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-amber-300 mb-1">Student Full Name *</label>
                <input
                  type="text"
                  required
                  value={currentItem.name_en || ''}
                  onChange={(e) => setCurrentItem({ ...currentItem, name_en: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-emerald-900/40 border border-emerald-800 text-emerald-100 text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-amber-300 mb-1">Assigned Team</label>
                <select
                  value={currentItem.team_id || ''}
                  onChange={(e) => setCurrentItem({ ...currentItem, team_id: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-emerald-900 border border-emerald-800 text-emerald-100 text-xs"
                >
                  <option value="">Independent / No Team</option>
                  {teams.map((t) => (
                    <option key={t.id} value={t.id}>{t.name_en}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-amber-300 mb-1">Institution / Madrasa</label>
                <input
                  type="text"
                  value={currentItem.institution || ''}
                  onChange={(e) => setCurrentItem({ ...currentItem, institution: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-emerald-900/40 border border-emerald-800 text-emerald-100 text-xs"
                />
              </div>

              {/* Private Contact Fields (Strictly Private to Admin) */}
              <div>
                <label className="block text-xs font-bold text-emerald-400 mb-1">Contact Phone (Private)</label>
                <input
                  type="text"
                  value={currentItem.contact_phone || ''}
                  onChange={(e) => setCurrentItem({ ...currentItem, contact_phone: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-emerald-900/40 border border-emerald-800 text-emerald-100 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-emerald-400 mb-1">Contact Email (Private)</label>
                <input
                  type="email"
                  value={currentItem.contact_email || ''}
                  onChange={(e) => setCurrentItem({ ...currentItem, contact_email: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-emerald-900/40 border border-emerald-800 text-emerald-100 text-xs"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-emerald-800/60">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-emerald-800 text-emerald-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveModal}
                className="px-5 py-2.5 rounded-xl bg-amber-500 text-emerald-950 font-extrabold text-xs shadow-lg shadow-amber-500/20 hover:bg-amber-400"
              >
                Save Student Roster
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Student Profile Drawer Modal (Admin View with Private Scores) */}
      {profileStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-emerald-950 border-2 border-emerald-800 rounded-3xl p-6 max-w-2xl w-full shadow-2xl space-y-6 relative my-8">
            <button
              onClick={() => setProfileStudent(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-emerald-400 hover:text-white hover:bg-emerald-900"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-4 border-b border-emerald-800/60 pb-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center font-mono font-black text-amber-300 text-base shrink-0">
                {profileStudent.student_id_code.slice(-4)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-amber-400">{profileStudent.student_id_code}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-900 text-emerald-300 border border-emerald-800">
                    {profileStudent.category_class}
                  </span>
                </div>
                <h2 className="text-xl font-black text-emerald-100">{profileStudent.name_en}</h2>
                <p className="text-xs font-semibold text-amber-400">
                  Team: {teams.find(t => t.id === profileStudent.team_id)?.name_en || 'Independent'}
                </p>
              </div>
            </div>

            {/* Performance Overview Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="bg-emerald-900/40 border border-emerald-800 p-3 rounded-2xl text-center">
                <span className="text-[10px] text-emerald-400 uppercase font-bold block">Registered Events</span>
                <span className="text-xl font-black text-emerald-100">{studentRegs.length}</span>
              </div>
              <div className="bg-emerald-900/40 border border-emerald-800 p-3 rounded-2xl text-center">
                <span className="text-[10px] text-emerald-400 uppercase font-bold block">Results Published</span>
                <span className="text-xl font-black text-amber-400">{studentResults.length}</span>
              </div>
              <div className="bg-emerald-900/40 border border-emerald-800 p-3 rounded-2xl text-center col-span-2 sm:col-span-1">
                <span className="text-[10px] text-emerald-400 uppercase font-bold block">Top Wins</span>
                <span className="text-xl font-black text-gold-gradient">
                  {studentResults.filter(r => r.rank === 1).length} 🥇
                </span>
              </div>
            </div>

            {/* Admin Private Score Breakdown */}
            <div className="space-y-3">
              <h3 className="text-xs font-black uppercase text-amber-400 tracking-wider flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-amber-400" />
                <span>Internal Admin Performance & Scores Breakdown</span>
              </h3>

              {studentResults.length === 0 ? (
                <p className="text-xs text-emerald-400/60 italic">No published scores or results recorded yet.</p>
              ) : (
                <div className="space-y-2">
                  {studentResults.map((r) => (
                    <div key={r.id} className="p-3 rounded-2xl bg-emerald-900/30 border border-emerald-800 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-extrabold text-emerald-100 block">{r.programme_title_en}</span>
                        <span className="text-[10px] text-amber-400 font-bold">Position Rank: {r.rank === 1 ? '🥇 1st Place' : r.rank === 2 ? '🥈 2nd Place' : r.rank === 3 ? '🥉 3rd Place' : `#${r.rank}`}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold text-emerald-300 block">Score: {r.score} / {r.max_score}</span>
                        <span className="text-[10px] text-gold-gradient font-black">+{r.points} Leaderboard Pts</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-emerald-800/60">
              <button
                onClick={() => setProfileStudent(null)}
                className="px-5 py-2 rounded-xl bg-amber-500 text-emerald-950 font-bold text-xs"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDeleteConfirm}
        title="Archive Student Profile?"
        message="Are you sure you want to archive this student profile? Historical result and score records will be preserved safely."
        confirmText="Archive Student"
      />
    </div>
  );
}

export default function StudentsAdminPage() {
  return (
    <AdminPermissionGuard featureKey="students" featureLabel="Student Roster Manager">
      <StudentsAdminContent />
    </AdminPermissionGuard>
  );
}
