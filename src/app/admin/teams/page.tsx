'use client';

import React, { useEffect, useState } from 'react';
import { 
  getTeams, 
  createTeam, 
  updateTeam, 
  restoreTeam,
  deleteTeam, 
  getStudents, 
  updateStudent,
  Team, 
  Student 
} from '@/lib/cmsService';
import { ConfirmModal } from '@/components/admin/ConfirmModal';
import { 
  Shield, 
  Plus, 
  Search, 
  Trash2, 
  Edit3, 
  Users, 
  UserPlus, 
  X, 
  CheckCircle2, 
  UserCheck,
  RotateCcw,
  Filter
} from 'lucide-react';

export default function TeamsAdmin() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'active' | 'archived' | 'all'>('active');

  // Add / Edit Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<Partial<Team> | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Roster Builder Modal
  const [rosterTeam, setRosterTeam] = useState<Team | null>(null);
  const [studentSearch, setStudentSearch] = useState('');
  const [selectedStudentToAdd, setSelectedStudentToAdd] = useState('');
  const [rosterMsg, setRosterMsg] = useState<{ text: string; isError: boolean } | null>(null);

  // Delete Confirmation
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    const [tms, stds] = await Promise.all([
      getTeams(true),
      getStudents(false),
    ]);
    setTeams(tms);
    setStudents(stds);
    setIsLoading(false);
  };

  const handleOpenAddModal = () => {
    setFormError(null);
    setCurrentItem({
      code: `TM-${(teams.length + 1).toString().padStart(2, '0')}`,
      name_en: '',
      color_code: 'amber',
      description: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (tm: Team) => {
    setFormError(null);
    setCurrentItem({ ...tm });
    setIsModalOpen(true);
  };

  const handleSaveModal = async () => {
    setFormError(null);
    if (!currentItem || !currentItem.name_en?.trim()) {
      setFormError('Please enter team name.');
      return;
    }

    try {
      if (currentItem.id) {
        await updateTeam(currentItem.id, currentItem);
      } else {
        await createTeam(currentItem as Omit<Team, 'id'>);
      }
      setIsModalOpen(false);
      await loadData();
    } catch (err: any) {
      setFormError(err.message || 'Error saving team.');
    }
  };

  const handleRestoreTeam = async (id: string) => {
    await restoreTeam(id);
    await loadData();
  };

  const handleDeleteConfirm = async () => {
    if (deleteId) {
      await deleteTeam(deleteId);
      setDeleteId(null);
      await loadData();
    }
  };

  // Roster Builder Actions
  const handleOpenRosterBuilder = (tm: Team) => {
    setRosterTeam(tm);
    setSelectedStudentToAdd('');
    setRosterMsg(null);
  };

  const handleAddMemberToTeam = async () => {
    if (!rosterTeam || !selectedStudentToAdd) return;
    setRosterMsg(null);

    const std = students.find(s => s.id === selectedStudentToAdd);
    if (!std) return;

    if (std.team_id === rosterTeam.id) {
      setRosterMsg({ text: `Student "${std.name_en}" is already a member of this team.`, isError: true });
      return;
    }

    try {
      await updateStudent(std.id, { team_id: rosterTeam.id });
      setRosterMsg({ text: `Successfully added "${std.name_en}" to ${rosterTeam.name_en}.`, isError: false });
      setSelectedStudentToAdd('');
      await loadData();
    } catch (err: any) {
      setRosterMsg({ text: err.message || 'Failed to add member.', isError: true });
    }
  };

  const handleRemoveMemberFromTeam = async (stdId: string) => {
    try {
      await updateStudent(stdId, { team_id: undefined });
      setRosterMsg({ text: 'Removed student from team roster.', isError: false });
      await loadData();
    } catch (err: any) {
      setRosterMsg({ text: err.message || 'Failed to remove member.', isError: true });
    }
  };

  const filteredTeams = teams.filter(t => {
    if (statusFilter === 'active' && t.is_archived) return false;
    if (statusFilter === 'archived' && !t.is_archived) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return t.name_en.toLowerCase().includes(q) || t.code.toLowerCase().includes(q);
    }
    return true;
  });

  const teamRosterMembers = rosterTeam ? students.filter(s => s.team_id === rosterTeam.id) : [];
  const availableStudents = students.filter(s => {
    if (studentSearch.trim()) {
      const q = studentSearch.toLowerCase();
      return (
        s.name_en.toLowerCase().includes(q) ||
        s.student_id_code.toLowerCase().includes(q)
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
            <Shield className="w-6 h-6 text-amber-400" />
            <span>Team Roster Builder & House Management</span>
          </h1>
          <p className="text-xs text-emerald-300/80 mt-1">
            Create house teams, manage student roster memberships, and prevent duplicate team enrollments.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-emerald-950 font-extrabold text-xs shadow-lg shadow-amber-500/20 transition-all shrink-0 self-start sm:self-center"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Team</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-emerald-950/80 border border-emerald-800/80 rounded-3xl p-5 shadow-xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl">
          <div className="relative">
            <Search className="w-4 h-4 text-amber-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search team name or code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-emerald-900/40 border border-emerald-800 text-emerald-100 text-xs focus:border-amber-400 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 bg-emerald-900/40 px-3 py-1.5 rounded-2xl border border-emerald-800">
            <Filter className="w-4 h-4 text-amber-400 shrink-0" />
            <select
              value={statusFilter}
              onChange={(e: any) => setStatusFilter(e.target.value)}
              className="w-full bg-transparent text-xs font-bold text-emerald-100 focus:outline-none"
            >
              <option value="active" className="bg-emerald-950">Active Teams</option>
              <option value="archived" className="bg-emerald-950">Archived Teams</option>
              <option value="all" className="bg-emerald-950">All Teams</option>
            </select>
          </div>
        </div>
      </div>

      {/* Teams Grid */}
      {isLoading ? (
        <div className="text-center py-16 text-amber-300 text-xs font-bold">Loading house teams...</div>
      ) : filteredTeams.length === 0 ? (
        <div className="text-center py-16 bg-emerald-950/60 border border-emerald-800/60 rounded-3xl p-8 max-w-xl mx-auto space-y-3">
          <Shield className="w-12 h-12 text-emerald-600 mx-auto" />
          <h3 className="text-base font-bold text-emerald-100">No teams created yet</h3>
          <p className="text-xs text-emerald-400/80">Click "Create New Team" to build house teams.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTeams.map((tm) => {
            const memberCount = students.filter(s => s.team_id === tm.id).length;

            return (
              <div
                key={tm.id}
                className={`border rounded-3xl p-6 shadow-xl space-y-5 flex flex-col justify-between ${
                  tm.is_archived
                    ? 'bg-emerald-950/40 border-emerald-900/60 opacity-60'
                    : 'bg-emerald-950/80 border-emerald-800/60 hover:border-amber-500/50'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono text-xs font-black">
                      {tm.code}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {tm.is_archived && (
                        <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-300 text-[10px] font-bold border border-red-500/30">
                          Archived
                        </span>
                      )}
                      <span className="px-3 py-1 rounded-full bg-emerald-900 text-emerald-300 text-xs font-bold border border-emerald-800 flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-amber-400" />
                        <span>{memberCount} Members</span>
                      </span>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-black text-emerald-100">{tm.name_en}</h3>
                    {tm.description && (
                      <p className="text-xs text-emerald-400/80 mt-1 line-clamp-2">{tm.description}</p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-emerald-800/40">
                  <button
                    onClick={() => handleOpenRosterBuilder(tm)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-amber-500 hover:bg-amber-400 text-emerald-950 font-extrabold text-xs shadow-md transition-all"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Manage Roster</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenEditModal(tm)}
                      className="p-2 rounded-xl bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200 border border-emerald-800"
                      title="Edit"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    {tm.is_archived ? (
                      <button
                        onClick={() => handleRestoreTeam(tm.id)}
                        className="p-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40"
                        title="Restore Team"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        onClick={() => setDeleteId(tm.id)}
                        className="p-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40"
                        title="Archive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Team Modal */}
      {isModalOpen && currentItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-emerald-950 border border-emerald-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-emerald-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-base font-bold text-emerald-100">
              {currentItem.id ? 'Edit House Team' : 'Create House Team'}
            </h2>

            {formError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/40 text-red-300 text-xs font-bold">
                {formError}
              </div>
            )}

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-amber-300 mb-1">Team Code / Tag *</label>
                <input
                  type="text"
                  value={currentItem.code || ''}
                  onChange={(e) => setCurrentItem({ ...currentItem, code: e.target.value })}
                  placeholder="TM-01"
                  className="w-full px-3 py-2 rounded-xl bg-emerald-900/40 border border-emerald-800 text-emerald-100 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-amber-300 mb-1">Team Name *</label>
                <input
                  type="text"
                  value={currentItem.name_en || ''}
                  onChange={(e) => setCurrentItem({ ...currentItem, name_en: e.target.value })}
                  placeholder="Team Alpha"
                  className="w-full px-3 py-2 rounded-xl bg-emerald-900/40 border border-emerald-800 text-emerald-100 font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-amber-300 mb-1">Description / Motto</label>
                <textarea
                  rows={3}
                  value={currentItem.description || ''}
                  onChange={(e) => setCurrentItem({ ...currentItem, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-emerald-900/40 border border-emerald-800 text-emerald-100"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-emerald-800/60">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-emerald-800 text-emerald-300 text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveModal}
                className="px-5 py-2 rounded-xl bg-amber-500 text-emerald-950 font-bold text-xs shadow-lg"
              >
                Save Team
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Team Roster Builder Modal */}
      {rosterTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-emerald-950 border-2 border-emerald-800 rounded-3xl p-6 max-w-2xl w-full shadow-2xl space-y-5 relative my-8">
            <button
              onClick={() => setRosterTeam(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-emerald-400 hover:text-white hover:bg-emerald-900"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-amber-400">{rosterTeam.code}</span>
                <span className="text-xs text-emerald-400 font-bold">Roster Builder</span>
              </div>
              <h2 className="text-xl font-black text-emerald-100">{rosterTeam.name_en} Membership Roster</h2>
            </div>

            {rosterMsg && (
              <div className={`p-3 rounded-xl border text-xs font-bold ${
                rosterMsg.isError ? 'bg-red-500/10 border-red-500/40 text-red-300' : 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
              }`}>
                {rosterMsg.text}
              </div>
            )}

            {/* Add Member Selector */}
            <div className="bg-emerald-900/40 border border-emerald-800 p-4 rounded-2xl space-y-3">
              <h3 className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                <UserPlus className="w-4 h-4" />
                <span>Add Student Competitor to Roster</span>
              </h3>

              <div className="relative">
                <Search className="w-3.5 h-3.5 text-amber-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search students to add..."
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-emerald-900 border border-emerald-800 text-emerald-100 text-xs focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-3">
                <select
                  value={selectedStudentToAdd}
                  onChange={(e) => setSelectedStudentToAdd(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-emerald-900 border border-emerald-800 text-emerald-100 text-xs font-bold"
                >
                  <option value="">-- Choose Student Competitor --</option>
                  {availableStudents.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.student_id_code} - {s.name_en} ({s.category_class}) {s.team_id === rosterTeam.id ? '[Already Member]' : ''}
                    </option>
                  ))}
                </select>

                <button
                  onClick={handleAddMemberToTeam}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-emerald-950 font-extrabold text-xs shrink-0 shadow-md"
                >
                  Add Member
                </button>
              </div>
            </div>

            {/* Current Roster Members List */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-emerald-200 border-b border-emerald-800/60 pb-2">
                Enrolled Team Members ({teamRosterMembers.length})
              </h3>

              {teamRosterMembers.length === 0 ? (
                <p className="text-xs text-emerald-400/60 italic py-4 text-center">
                  No members added to this house team yet. Select a student above to add them.
                </p>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {teamRosterMembers.map((std) => (
                    <div
                      key={std.id}
                      className="p-3 rounded-2xl bg-emerald-900/30 border border-emerald-800 flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs font-bold text-amber-400">{std.student_id_code}</span>
                        <div>
                          <h4 className="text-xs font-extrabold text-emerald-100">{std.name_en}</h4>
                          <span className="text-[10px] text-emerald-400 font-semibold">{std.category_class}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleRemoveMemberFromTeam(std.id)}
                        className="p-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 text-xs font-bold"
                        title="Remove member"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-emerald-800/60">
              <button
                onClick={() => setRosterTeam(null)}
                className="px-5 py-2 rounded-xl bg-amber-500 text-emerald-950 font-bold text-xs"
              >
                Done
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
        title="Archive House Team?"
        message="Are you sure you want to archive this house team? Historical scores and result records will remain intact."
        confirmText="Archive Team"
      />
    </div>
  );
}
