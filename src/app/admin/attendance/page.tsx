'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { AdminPermissionGuard } from '@/components/admin/AdminPermissionGuard';
import { useAuth } from '@/context/AuthContext';
import { 
  getProgrammes, 
  getCategories, 
  getProgrammeRegistrations, 
  updateRegistrationAttendance,
  getAttendanceSummary,
  exportAttendanceCSV,
  Programme, 
  Category, 
  ProgrammeRegistration 
} from '@/lib/cmsService';
import { 
  CheckSquare, 
  Search, 
  Download, 
  QrCode, 
  RefreshCw, 
  UserCheck, 
  UserX, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Filter 
} from 'lucide-react';

function AttendanceControlCenterContent() {
  const { canManageProgramme, adminProfile } = useAuth();

  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedProgrammeId, setSelectedProgrammeId] = useState<string>('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  
  const [registrations, setRegistrations] = useState<ProgrammeRegistration[]>([]);
  const [summary, setSummary] = useState({ registered: 0, confirmed: 0, present: 0, absent: 0, excused: 0, cancelled: 0 });
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (selectedProgrammeId) {
      loadProgrammeAttendance(selectedProgrammeId);
    }
  }, [selectedProgrammeId, selectedCategoryId]);

  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      const [prgs, cats] = await Promise.all([
        getProgrammes(false, false),
        getCategories(true),
      ]);
      const allowed = prgs.filter(p => canManageProgramme(p.id));
      setProgrammes(allowed);
      setCategories(cats);
      if (allowed.length > 0) {
        setSelectedProgrammeId(allowed[0].id);
      }
    } catch (e) {
      console.error('Error loading attendance initial data:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const loadProgrammeAttendance = async (prgId: string) => {
    setIsUpdating(true);
    try {
      const [regs, sum] = await Promise.all([
        getProgrammeRegistrations(prgId),
        getAttendanceSummary(prgId),
      ]);

      const filtered = selectedCategoryId === 'all' 
        ? regs 
        : regs.filter(r => r.category_id === selectedCategoryId);

      setRegistrations(filtered);
      setSummary(sum);
    } catch (e) {
      console.error('Error loading attendance data:', e);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleStatusChange = async (
    regId: string, 
    status: 'Present' | 'Absent' | 'Excused' | 'Cancelled' | 'Unmarked'
  ) => {
    try {
      await updateRegistrationAttendance(
        regId, 
        status, 
        adminProfile?.name_en || 'Check-in Staff',
        undefined,
        'Manual'
      );
      if (selectedProgrammeId) {
        await loadProgrammeAttendance(selectedProgrammeId);
      }
    } catch (e: any) {
      alert(e.message || 'Error updating attendance status.');
    }
  };

  const handleExportCSV = async () => {
    const csvData = await exportAttendanceCSV(selectedProgrammeId);
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `attendance-${selectedProgrammeId || 'all'}-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredRegistrations = registrations.filter(r => {
    const name = (r.full_name || '').toLowerCase();
    const code = (r.registration_id_code || '').toLowerCase();
    const studentCode = (r.student_id || '').toLowerCase();
    const teamName = (r.team_name || '').toLowerCase();
    const q = searchQuery.toLowerCase();

    return name.includes(q) || code.includes(q) || studentCode.includes(q) || teamName.includes(q);
  });

  const activeProgramme = programmes.find(p => p.id === selectedProgrammeId);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      
      {/* Header Banner */}
      <div className="bg-emerald-950/80 border border-emerald-800/80 p-6 rounded-3xl backdrop-blur-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 font-extrabold text-xs flex items-center gap-1.5 uppercase tracking-wider">
              <CheckSquare className="w-3.5 h-3.5" />
              <span>Participant Verification Desk</span>
            </span>
          </div>
          <h1 className="text-2xl font-black text-emerald-100 flex items-center gap-2">
            <span>Attendance & Check-in Control Center</span>
          </h1>
          <p className="text-xs text-emerald-300/80 mt-1">
            Real-time participant verification, live QR scanning, and attendance tracking connected directly to Supabase.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/admin/attendance/scan"
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-emerald-950 font-extrabold text-xs shadow-lg transition-all"
          >
            <QrCode className="w-4 h-4" />
            <span>Open Mobile QR Scanner</span>
          </Link>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-900 hover:bg-emerald-800 text-emerald-100 font-extrabold text-xs border border-emerald-700 transition-all"
          >
            <Download className="w-4 h-4 text-amber-400" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Selector & Filters */}
      <div className="bg-emerald-950/90 border border-emerald-800 p-4 rounded-3xl grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-[11px] font-extrabold text-amber-300 uppercase tracking-wider mb-1">
            Programme
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

        <div>
          <label className="block text-[11px] font-extrabold text-amber-300 uppercase tracking-wider mb-1">
            Category Filter
          </label>
          <select
            value={selectedCategoryId}
            onChange={e => setSelectedCategoryId(e.target.value)}
            className="w-full bg-emerald-900/60 border border-emerald-700 rounded-2xl py-2 px-3 text-xs text-emerald-100 font-bold focus:outline-none focus:border-amber-400"
          >
            <option value="all" className="bg-emerald-950 text-emerald-100">All Categories</option>
            {categories.map(c => (
              <option key={c.id} value={c.id} className="bg-emerald-950 text-emerald-100">
                {c.name_en}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-end">
          <button
            onClick={() => loadProgrammeAttendance(selectedProgrammeId)}
            disabled={isUpdating}
            className="w-full py-2 px-4 rounded-2xl bg-emerald-900 hover:bg-emerald-800 text-amber-400 font-bold text-xs border border-emerald-700 transition-all flex items-center justify-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isUpdating ? 'animate-spin' : ''}`} />
            <span>Refresh Live Attendance</span>
          </button>
        </div>
      </div>

      {/* Summary Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
        <div className="p-4 rounded-3xl bg-emerald-950/80 border border-emerald-800 space-y-1">
          <span className="text-[10px] font-extrabold text-emerald-400 uppercase">Registered</span>
          <p className="text-xl font-black text-emerald-100">{summary.registered}</p>
        </div>

        <div className="p-4 rounded-3xl bg-emerald-950/80 border border-emerald-800 space-y-1">
          <span className="text-[10px] font-extrabold text-emerald-400 uppercase">Confirmed</span>
          <p className="text-xl font-black text-emerald-100">{summary.confirmed}</p>
        </div>

        <div className="p-4 rounded-3xl bg-emerald-950/80 border border-emerald-500/40 bg-emerald-500/10 space-y-1">
          <span className="text-[10px] font-black text-emerald-300 uppercase">Present 🟢</span>
          <p className="text-xl font-black text-emerald-300">{summary.present}</p>
        </div>

        <div className="p-4 rounded-3xl bg-emerald-950/80 border border-red-500/40 bg-red-500/10 space-y-1">
          <span className="text-[10px] font-black text-red-300 uppercase">Absent 🔴</span>
          <p className="text-xl font-black text-red-300">{summary.absent}</p>
        </div>

        <div className="p-4 rounded-3xl bg-emerald-950/80 border border-amber-500/40 bg-amber-500/10 space-y-1">
          <span className="text-[10px] font-black text-amber-300 uppercase">Excused 🟡</span>
          <p className="text-xl font-black text-amber-300">{summary.excused}</p>
        </div>

        <div className="p-4 rounded-3xl bg-emerald-950/80 border border-emerald-800 space-y-1">
          <span className="text-[10px] font-extrabold text-emerald-400 uppercase">Cancelled</span>
          <p className="text-xl font-black text-emerald-400">{summary.cancelled}</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-emerald-950/90 border border-emerald-800 p-4 rounded-3xl space-y-2">
        <div className="flex items-center justify-between text-xs font-extrabold text-emerald-200">
          <span>Check-in Progress</span>
          <span className="text-amber-400 font-mono">
            {summary.present} / {summary.registered} Checked In ({summary.registered > 0 ? Math.round((summary.present / summary.registered) * 100) : 0}%)
          </span>
        </div>
        <div className="w-full h-3 rounded-full bg-emerald-950 overflow-hidden">
          <div
            className="h-full bg-emerald-400 transition-all duration-500"
            style={{ width: `${summary.registered > 0 ? (summary.present / summary.registered) * 100 : 0}%` }}
          />
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-emerald-400 absolute left-3.5 top-3" />
        <input
          type="text"
          placeholder="Search by participant name, Registration ID, Student ID, or Team name..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full bg-emerald-950/80 border border-emerald-800 rounded-2xl py-2.5 pl-10 pr-4 text-xs text-emerald-100 placeholder-emerald-500 focus:outline-none focus:border-amber-400"
        />
      </div>

      {/* Registrations & Attendance Table */}
      <div className="bg-emerald-950/80 border border-emerald-800/60 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-emerald-800/60 pb-3">
          <h2 className="text-base font-extrabold text-emerald-100">
            Participant Roster & Attendance Status ({filteredRegistrations.length})
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-emerald-800 text-[11px] font-extrabold text-amber-300 uppercase tracking-wider">
                <th className="py-3 px-4">Participant / Team</th>
                <th className="py-3 px-4">Registration ID</th>
                <th className="py-3 px-4">Category & Gender</th>
                <th className="py-3 px-4">Attendance Status</th>
                <th className="py-3 px-4">Check-in Time</th>
                <th className="py-3 px-4 text-right">Quick Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-900/60 text-xs">
              {filteredRegistrations.map(reg => (
                <tr key={reg.id} className="hover:bg-emerald-900/30 transition-all">
                  <td className="py-3 px-4">
                    <div className="font-extrabold text-emerald-100">{reg.full_name || 'Participant'}</div>
                    <div className="text-[11px] text-emerald-400/80">{reg.team_name || 'Independent'}</div>
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-amber-300">
                    {reg.registration_id_code || reg.id}
                  </td>
                  <td className="py-3 px-4 text-emerald-300 font-medium">
                    {reg.category_name || 'General'} ({reg.gender || 'General'})
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                      reg.attendance === 'Present' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' :
                      reg.attendance === 'Absent' ? 'bg-red-500/20 text-red-300 border-red-500/40' :
                      reg.attendance === 'Excused' ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' :
                      'bg-emerald-900/40 text-emerald-400 border-emerald-800'
                    }`}>
                      {reg.attendance || 'Unmarked'}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-emerald-300 text-[11px]">
                    {reg.checked_in_at ? new Date(reg.checked_in_at).toLocaleTimeString() : '—'}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleStatusChange(reg.id, 'Present')}
                        className={`px-2.5 py-1 rounded-xl text-[10px] font-black transition-all ${
                          reg.attendance === 'Present' 
                            ? 'bg-emerald-500 text-emerald-950' 
                            : 'bg-emerald-900/60 hover:bg-emerald-800 text-emerald-300 border border-emerald-700'
                        }`}
                      >
                        Present
                      </button>
                      <button
                        onClick={() => handleStatusChange(reg.id, 'Absent')}
                        className={`px-2.5 py-1 rounded-xl text-[10px] font-black transition-all ${
                          reg.attendance === 'Absent' 
                            ? 'bg-red-500 text-white' 
                            : 'bg-emerald-900/60 hover:bg-emerald-800 text-red-300 border border-emerald-700'
                        }`}
                      >
                        Absent
                      </button>
                      <button
                        onClick={() => handleStatusChange(reg.id, 'Excused')}
                        className={`px-2.5 py-1 rounded-xl text-[10px] font-black transition-all ${
                          reg.attendance === 'Excused' 
                            ? 'bg-amber-500 text-emerald-950' 
                            : 'bg-emerald-900/60 hover:bg-emerald-800 text-amber-300 border border-emerald-700'
                        }`}
                      >
                        Excused
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

export default function AttendanceControlCenterGuardPage() {
  return (
    <AdminPermissionGuard featureKey="attendance" featureLabel="Attendance Desk">
      <AttendanceControlCenterContent />
    </AdminPermissionGuard>
  );
}
