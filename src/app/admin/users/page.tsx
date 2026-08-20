'use client';

import React, { useEffect, useState } from 'react';
import { AdminPermissionGuard } from '@/components/admin/AdminPermissionGuard';
import { 
  getAdminProfiles, 
  createAdminProfile, 
  updateAdminProfile, 
  deleteAdminProfile, 
  getProgrammes,
  AdminProfile, 
  AdminRole,
  Programme
} from '@/lib/cmsService';
import { UserCheck, ShieldAlert, Plus, Edit2, Trash2, CheckCircle2, XCircle, Clock, KeyRound, Calendar } from 'lucide-react';

function AdminUserManagementContent() {
  const [users, setUsers] = useState<AdminProfile[]>([]);
  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminProfile | null>(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<AdminRole>('Event Manager');
  const [status, setStatus] = useState<'Active' | 'Disabled'>('Active');
  const [assignedProgrammeIds, setAssignedProgrammeIds] = useState<string[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
    getProgrammes().then(setProgrammes);
  }, []);

  const loadUsers = async () => {
    const data = await getAdminProfiles();
    setUsers(data);
  };

  const handleOpenAddModal = () => {
    setEditingUser(null);
    setName('');
    setEmail('');
    setRole('Event Manager');
    setStatus('Active');
    setAssignedProgrammeIds([]);
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (u: AdminProfile) => {
    setEditingUser(u);
    setName(u.name_en);
    setEmail(u.email);
    setRole(u.role);
    setStatus(u.status);
    setAssignedProgrammeIds(u.assigned_programme_ids || []);
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const toggleProgrammeSelection = (prgId: string) => {
    if (assignedProgrammeIds.includes(prgId)) {
      setAssignedProgrammeIds(assignedProgrammeIds.filter(id => id !== prgId));
    } else {
      setAssignedProgrammeIds([...assignedProgrammeIds, prgId]);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!name.trim() || !email.trim()) {
      setErrorMsg('Name and Email are required.');
      return;
    }

    try {
      if (editingUser) {
        await updateAdminProfile(editingUser.id, {
          name_en: name,
          email,
          role,
          status,
          assigned_programme_ids: assignedProgrammeIds,
        });
      } else {
        await createAdminProfile({
          name_en: name,
          email,
          role,
          status,
          assigned_programme_ids: assignedProgrammeIds,
        });
      }
      setIsModalOpen(false);
      await loadUsers();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error saving admin user profile.');
    }
  };

  const handleToggleStatus = async (u: AdminProfile) => {
    const nextStatus = u.status === 'Active' ? 'Disabled' : 'Active';
    await updateAdminProfile(u.id, { status: nextStatus });
    await loadUsers();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to remove access for this administrator?')) {
      await deleteAdminProfile(id);
      await loadUsers();
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="bg-emerald-950/80 border border-emerald-800/80 p-6 rounded-3xl backdrop-blur-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-emerald-100 flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-amber-400" />
            <span>Admin Access & Role Control</span>
          </h1>
          <p className="text-xs text-emerald-300/80 mt-1">
            Super Admin control desk to manage administrator accounts, role permissions, and access privileges. Passwords are passwordlessly managed via Supabase Auth.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-emerald-950 font-extrabold text-xs shadow-lg transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Invite / Add Admin</span>
        </button>
      </div>

      {/* Admin User Accounts List */}
      <div className="bg-emerald-950/80 border border-emerald-800/60 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-emerald-800/60 pb-3">
          <h2 className="text-base font-bold text-emerald-100">
            Registered Administrators ({users.length})
          </h2>
          <span className="text-xs text-amber-300 font-extrabold bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-full">
            RBAC Enabled
          </span>
        </div>

        <div className="space-y-3">
          {users.map((u) => (
            <div
              key={u.id}
              className="p-5 rounded-2xl bg-emerald-900/30 border border-emerald-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-extrabold text-emerald-100">{u.name_en}</h3>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    u.role === 'Super Admin' ? 'bg-amber-500 text-emerald-950' :
                    u.role === 'Event Manager' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                    u.role === 'Score Manager' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                    'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                  }`}>
                    {u.role}
                  </span>
                </div>
                <p className="text-xs font-mono text-amber-300">{u.email}</p>
                <div className="flex items-center gap-3 text-[11px] text-emerald-400/80 pt-1">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    Last Active: {u.last_active || 'Never'}
                  </span>
                  {u.role === 'Score Manager' && (
                    <span className="text-amber-400 font-bold">
                      • {u.assigned_programme_ids?.length || 0} Assigned Programmes
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleToggleStatus(u)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
                    u.status === 'Active'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                      : 'bg-red-500/20 text-red-300 border-red-500/40 hover:bg-red-500/30'
                  }`}
                >
                  {u.status === 'Active' ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <XCircle className="w-3.5 h-3.5 text-red-400" />}
                  <span>{u.status}</span>
                </button>

                <button
                  onClick={() => handleOpenEditModal(u)}
                  className="p-2 rounded-xl bg-emerald-900 border border-emerald-700 text-emerald-300 hover:text-white transition-all"
                  title="Edit Role & Permissions"
                >
                  <Edit2 className="w-4 h-4" />
                </button>

                <button
                  onClick={() => handleDelete(u.id)}
                  className="p-2 rounded-xl bg-red-900/40 border border-red-800/80 text-red-300 hover:text-red-100 transition-all"
                  title="Remove Access"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add / Edit Admin User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-emerald-950 border-2 border-emerald-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-emerald-800 pb-3">
              <h3 className="text-lg font-black text-emerald-100">
                {editingUser ? 'Edit Admin Profile & Role' : 'Invite / Add Administrator'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-emerald-400 hover:text-white text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/40 text-red-300 text-xs font-bold">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-amber-300 mb-1">Administrator Full Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Muhammed Sahal"
                  className="w-full px-4 py-2.5 rounded-xl bg-emerald-900 border border-emerald-700 text-emerald-100 text-xs focus:border-amber-400 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-amber-300 mb-1">Email Address *</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@miladfest.com"
                  className="w-full px-4 py-2.5 rounded-xl bg-emerald-900 border border-emerald-700 text-emerald-100 text-xs focus:border-amber-400 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-amber-300 mb-1">Assign Role Privilege *</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as AdminRole)}
                  className="w-full px-4 py-2.5 rounded-xl bg-emerald-900 border border-emerald-700 text-emerald-100 text-xs focus:border-amber-400 focus:outline-none font-bold"
                >
                  <option value="Super Admin">Super Admin (Full Access to Everything)</option>
                  <option value="Event Manager">Event Manager (Programmes, Registrations & Roster)</option>
                  <option value="Score Manager">Score Manager (Enter & Verify Scores)</option>
                  <option value="Result Manager">Result Manager (Generate Posters & Publish Results)</option>
                </select>
              </div>

              {role === 'Score Manager' && programmes.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-emerald-800">
                  <label className="block text-xs font-bold text-amber-300">
                    Assign Allowed Programmes (Scope Restriction)
                  </label>
                  <p className="text-[11px] text-emerald-400/80">
                    If no programmes are selected, the Score Manager will have access to all programmes. Select specific programmes to restrict access.
                  </p>
                  <div className="max-h-36 overflow-y-auto space-y-1 bg-emerald-900/40 p-3 rounded-2xl border border-emerald-800">
                    {programmes.map((p) => {
                      const isSelected = assignedProgrammeIds.includes(p.id);
                      return (
                        <label key={p.id} className="flex items-center gap-2 text-xs text-emerald-100 font-semibold cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleProgrammeSelection(p.id)}
                            className="rounded border-emerald-700 text-amber-500 focus:ring-amber-400"
                          />
                          <span>{p.title_en}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-amber-300 mb-1">Account Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as 'Active' | 'Disabled')}
                  className="w-full px-4 py-2.5 rounded-xl bg-emerald-900 border border-emerald-700 text-emerald-100 text-xs focus:border-amber-400 focus:outline-none font-bold"
                >
                  <option value="Active">Active</option>
                  <option value="Disabled">Disabled (Revoke Access Immediately)</option>
                </select>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-emerald-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-emerald-900 hover:bg-emerald-800 text-emerald-300 font-bold text-xs"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-emerald-950 font-extrabold text-xs shadow-lg"
                >
                  Save Admin Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminUserManagementPage() {
  return (
    <AdminPermissionGuard featureKey="users" featureLabel="Admin User Management & Role Security">
      <AdminUserManagementContent />
    </AdminPermissionGuard>
  );
}
