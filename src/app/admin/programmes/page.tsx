'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  getProgrammes,
  createProgramme,
  updateProgramme,
  duplicateProgramme,
  deleteProgramme,
  getCategories,
  Programme,
  Category,
} from '@/lib/cmsService';
import { ConfirmModal } from '@/components/admin/ConfirmModal';
import {
  Calendar, Plus, Search, Trash2, Edit3, Copy, Eye, EyeOff,
  CheckCircle2, Clock, Tag, Trophy, Award, Users, X, Settings,
  Sparkles, AlertTriangle, ExternalLink, ArrowRight, ArrowLeft,
  Check, UserCheck, Filter, MoreHorizontal, ChevronDown, MapPin,
  BarChart2, Star, RefreshCw, List, Grid3X3, Layers, Globe,
  FileText, BadgeCheck, Hash, PlusCircle, Minus,
} from 'lucide-react';

// ─── Types ─────────────────────────────────────────────────────────────────────

type ScoringMethod = 'none' | 'single' | 'multi_criteria' | 'manual_ranking';
type GenderOption = 'Male' | 'Female' | 'Open' | 'Mixed';

interface ScoreCriterion {
  id: string;
  name: string;
  max_score: number;
  weight?: number;
}

interface ProgrammeFormState extends Partial<Programme> {
  gender?: GenderOption;
  scoring_method?: ScoringMethod;
  score_criteria?: ScoreCriterion[];
  attendance_required?: boolean;
  certificate_enabled?: boolean;
  result_enabled?: boolean;
  result_public?: boolean;
  poster_enabled?: boolean;
  min_team_members?: number;
  max_team_members?: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const LIFECYCLE_LABELS: Record<string, { label: string; color: string }> = {
  'Draft':               { label: 'Draft',            color: 'bg-emerald-900/60 text-emerald-400 border-emerald-700' },
  'Registration Open':   { label: 'Reg. Open',         color: 'bg-blue-500/20 text-blue-300 border-blue-500/40' },
  'Registration Closed': { label: 'Reg. Closed',       color: 'bg-orange-500/20 text-orange-300 border-orange-500/40' },
  'Upcoming':            { label: 'Upcoming',           color: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
  'Ongoing':             { label: '🔴 Ongoing',         color: 'bg-red-500/20 text-red-300 border-red-500/40' },
  'Completed':           { label: 'Completed',          color: 'bg-slate-500/20 text-slate-300 border-slate-500/40' },
  'Scores Pending':      { label: 'Scores Pending',     color: 'bg-purple-500/20 text-purple-300 border-purple-500/40' },
  'Result Ready':        { label: 'Result Ready',       color: 'bg-teal-500/20 text-teal-300 border-teal-500/40' },
  'Published':           { label: 'Published',          color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' },
};

function StatusBadge({ p }: { p: Programme }) {
  const ls = p.lifecycle_status || (p.is_published ? 'Published' : 'Draft');
  const cfg = LIFECYCLE_LABELS[ls] || LIFECYCLE_LABELS['Draft'];
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${cfg.color}`}>
      {cfg.label}
    </span>
  );
}

function uid() { return Math.random().toString(36).slice(2, 9); }

const STEPS = [
  'Basic Info',
  'Category & Gender',
  'Competition Type',
  'Registration',
  'Scoring',
  'Leaderboard',
  'Result & Certificate',
  'Review & Publish',
];

// ─── Main Component ──────────────────────────────────────────────────────────

export default function ProgrammesAdmin() {
  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterGender, setFilterGender] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterRegistration, setFilterRegistration] = useState('all');
  const [filterResult, setFilterResult] = useState('all');
  const [filterDate, setFilterDate] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  // Bulk selection
  const [selected, setSelected] = useState<Set<string>>(new Set());

  // Wizard
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [form, setForm] = useState<ProgrammeFormState>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Multi-criteria builder
  const [criteria, setCriteria] = useState<ScoreCriterion[]>([]);

  // Delete
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Bulk action feedback
  const [bulkMsg, setBulkMsg] = useState<string | null>(null);

  // ── Data ────────────────────────────────────────────────────────────────────

  const loadData = useCallback(async () => {
    setIsLoading(true);
    const [prgs, cats] = await Promise.all([getProgrammes(false, false), getCategories()]);
    setProgrammes(prgs);
    setCategories(cats);
    setIsLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // ── Open Wizard ─────────────────────────────────────────────────────────────

  const openWizard = (prgToEdit?: Programme) => {
    setFormError(null);
    setWizardStep(1);
    if (prgToEdit) {
      const p = prgToEdit as any;
      setForm({
        ...prgToEdit,
        scoring_method: p.scoring_method || 'single',
        score_criteria: p.score_criteria || [],
        gender: p.gender || 'Open',
        attendance_required: p.attendance_required ?? true,
        certificate_enabled: p.certificate_enabled ?? true,
        result_enabled: p.result_enabled ?? true,
        result_public: p.result_public ?? true,
        poster_enabled: p.poster_enabled ?? true,
        min_team_members: p.min_team_members || 2,
        max_team_members: p.max_team_members || 10,
        custom_points_map: prgToEdit.custom_points_map || { rank1: 0, rank2: 0, rank3: 0, rank4: 0 },
      });
      setCriteria(p.score_criteria || []);
    } else {
      const n = programmes.length + 1;
      setForm({
        code: `PRG-${n.toString().padStart(2, '0')}`,
        title_en: '',
        description_en: '',
        event_date: '2026-08-29',
        start_time: '09:00',
        end_time: '11:00',
        venue: '',
        category_id: '',
        gender: 'Open',
        competition_type: 'Individual',
        registration_open: false,
        registration_mode: 'Admin Only',
        approval_mode: 'Manual',
        allowed_participant_types: 'Students',
        scoring_method: 'single',
        score_criteria: [],
        max_score: 100,
        min_score: 0,
        scoring_direction: 'higher_wins',
        publish_position_count: 'top_3',
        include_in_student_leaderboard: true,
        include_in_team_leaderboard: false,
        custom_points_map: { rank1: 0, rank2: 0, rank3: 0, rank4: 0 },
        attendance_required: true,
        result_enabled: true,
        result_public: true,
        poster_enabled: true,
        certificate_enabled: true,
        min_team_members: 2,
        max_team_members: 10,
        lifecycle_status: 'Draft',
        status: 'draft',
        is_published: false,
        display_order: n,
      });
      setCriteria([]);
    }
    setIsWizardOpen(true);
  };

  // ── Save ────────────────────────────────────────────────────────────────────

  const saveWizard = async (publish = false) => {
    setFormError(null);
    if (!form.title_en?.trim()) { setFormError('Programme title is required.'); return; }
    if (!form.category_id) { setFormError('Please select a category.'); return; }
    if (!form.event_date) { setFormError('Event date is required.'); return; }
    if (!form.venue?.trim()) { setFormError('Venue is required.'); return; }
    setIsSaving(true);
    try {
      const payload: any = {
        ...form,
        score_criteria: criteria,
        is_published: publish,
        status: publish ? 'published' : 'draft',
        lifecycle_status: publish ? 'Published' : (form.lifecycle_status || 'Draft'),
      };
      if (form.id) {
        await updateProgramme(form.id, payload);
      } else {
        await createProgramme(payload as Omit<Programme, 'id'>);
      }
      setIsWizardOpen(false);
      await loadData();
    } catch (err: any) {
      setFormError(err.message || 'Error saving programme.');
    } finally {
      setIsSaving(false);
    }
  };

  // ── Bulk actions ─────────────────────────────────────────────────────────────

  const bulkAction = async (action: string) => {
    const ids = Array.from(selected);
    if (!ids.length) return;
    for (const id of ids) {
      if (action === 'publish')   await updateProgramme(id, { is_published: true, status: 'published', lifecycle_status: 'Published' });
      if (action === 'archive')   await deleteProgramme(id);
      if (action === 'open_reg')  await updateProgramme(id, { registration_open: true, lifecycle_status: 'Registration Open' });
      if (action === 'close_reg') await updateProgramme(id, { registration_open: false, lifecycle_status: 'Registration Closed' });
    }
    setBulkMsg(`✓ ${action.replace('_', ' ')} applied to ${ids.length} programme(s).`);
    setSelected(new Set());
    await loadData();
    setTimeout(() => setBulkMsg(null), 4000);
  };

  const confirmDelete = async () => {
    if (deleteId) { await deleteProgramme(deleteId); setDeleteId(null); await loadData(); }
  };

  // ── Filters ──────────────────────────────────────────────────────────────────

  const uniqueDates = Array.from(new Set(programmes.map(p => p.event_date))).filter(Boolean).sort();

  const filtered = programmes.filter(p => {
    const pAny = p as any;
    if (filterCategory !== 'all' && p.category_id !== filterCategory) return false;
    if (filterGender !== 'all' && pAny.gender !== filterGender) return false;
    if (filterType !== 'all' && p.competition_type !== filterType) return false;
    if (filterDate !== 'all' && p.event_date !== filterDate) return false;
    if (filterStatus !== 'all') {
      const ls = p.lifecycle_status || (p.is_published ? 'Published' : 'Draft');
      if (ls !== filterStatus) return false;
    }
    if (filterRegistration === 'open' && !p.registration_open) return false;
    if (filterRegistration === 'closed' && p.registration_open) return false;
    if (filterResult === 'published' && !p.is_published) return false;
    if (filterResult === 'pending' && p.is_published) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return p.title_en.toLowerCase().includes(q) || (p.code || '').toLowerCase().includes(q) || (p.venue || '').toLowerCase().includes(q);
    }
    return true;
  });

  const allSelected = filtered.length > 0 && filtered.every(p => selected.has(p.id));
  const toggleAll = () => allSelected ? setSelected(new Set()) : setSelected(new Set(filtered.map(p => p.id)));
  const toggleOne = (id: string) => { const s = new Set(selected); s.has(id) ? s.delete(id) : s.add(id); setSelected(s); };

  // ── Toggle helpers ───────────────────────────────────────────────────────────

  const toggleField = (key: string) => setForm(f => ({ ...f, [key]: !(f as any)[key] }));

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-emerald-950/80 border border-emerald-800/80 p-6 rounded-3xl backdrop-blur-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 font-extrabold text-xs flex items-center gap-1.5 uppercase tracking-wider border border-amber-500/30">
              <Calendar className="w-3.5 h-3.5" />
              Competition Engine
            </span>
          </div>
          <h1 className="text-2xl font-black text-emerald-100">Programme Management</h1>
          <p className="text-xs text-emerald-300/70 mt-1">
            Add, edit, and configure competition programmes. They flow automatically to Registration, Attendance, Scoring, Results, Leaderboard, and the Public Website.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={() => setViewMode(v => v === 'table' ? 'grid' : 'table')}
            className="p-2.5 rounded-2xl bg-emerald-900 hover:bg-emerald-800 text-amber-300 border border-emerald-700" title="Toggle view">
            {viewMode === 'table' ? <Grid3X3 className="w-4 h-4" /> : <List className="w-4 h-4" />}
          </button>
          <button onClick={() => openWizard()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-emerald-950 font-extrabold text-xs shadow-lg shadow-amber-500/20 transition-all">
            <Plus className="w-4 h-4" />
            Add Programme
          </button>
        </div>
      </div>

      {/* Bulk feedback */}
      {bulkMsg && (
        <div className="p-3 rounded-2xl bg-emerald-800/60 border border-emerald-600 text-emerald-200 text-xs font-bold text-center">{bulkMsg}</div>
      )}

      {/* Search + Filters */}
      <div className="bg-emerald-950/80 border border-emerald-800/80 rounded-3xl p-5 shadow-xl space-y-4">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-48">
            <Search className="w-4 h-4 text-amber-400 absolute left-3.5 top-2.5" />
            <input type="text" placeholder="Search by name, code, or venue…" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-2xl bg-emerald-900/40 border border-emerald-800 text-emerald-100 text-xs focus:border-amber-400 focus:outline-none" />
          </div>
          <button onClick={() => setShowFilters(v => !v)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-2xl border text-xs font-bold transition-all ${showFilters ? 'bg-amber-500 text-emerald-950 border-amber-400' : 'bg-emerald-900/40 text-amber-300 border-emerald-800 hover:border-amber-500'}`}>
            <Filter className="w-3.5 h-3.5" />
            Filters
          </button>
          <span className="text-xs text-emerald-400 font-bold shrink-0">{filtered.length} programme{filtered.length !== 1 ? 's' : ''}</span>
        </div>

        {showFilters && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 pt-3 border-t border-emerald-800/40">
            {[
              { label: 'Category', value: filterCategory, onChange: setFilterCategory, options: [['all','All Categories'] as [string,string], ...categories.map(c => [c.id, c.name_en] as [string,string])] },
              { label: 'Gender', value: filterGender, onChange: setFilterGender, options: [['all','All Genders'],['Male','Male'],['Female','Female'],['Open','Open'],['Mixed','Mixed']] as [string,string][] },
              { label: 'Type', value: filterType, onChange: setFilterType, options: [['all','All Types'],['Individual','Individual'],['Team','Team'],['Individual+Team','Individual + Team']] as [string,string][] },
              { label: 'Status', value: filterStatus, onChange: setFilterStatus, options: [['all','All Statuses'],['Draft','Draft'],['Registration Open','Reg. Open'],['Registration Closed','Reg. Closed'],['Upcoming','Upcoming'],['Ongoing','Ongoing'],['Completed','Completed'],['Scores Pending','Scores Pending'],['Result Ready','Result Ready'],['Published','Published']] as [string,string][] },
              { label: 'Date', value: filterDate, onChange: setFilterDate, options: [['all','All Dates'] as [string,string], ...uniqueDates.map(d => [d,d] as [string,string])] },
              { label: 'Registration', value: filterRegistration, onChange: setFilterRegistration, options: [['all','All'],['open','Open'],['closed','Closed']] as [string,string][] },
              { label: 'Result', value: filterResult, onChange: setFilterResult, options: [['all','All'],['published','Result Published'],['pending','Result Pending']] as [string,string][] },
            ].map(({ label, value, onChange, options }) => (
              <div key={label}>
                <label className="block text-[10px] font-black text-amber-400 uppercase tracking-wider mb-1">{label}</label>
                <select value={value} onChange={e => onChange(e.target.value)}
                  className="w-full bg-emerald-900/60 border border-emerald-700 rounded-xl py-1.5 px-2.5 text-xs text-emerald-100 font-bold focus:outline-none focus:border-amber-400">
                  {options.map(([v, l]) => <option key={v} value={v} className="bg-emerald-950">{l}</option>)}
                </select>
              </div>
            ))}
            <div className="flex items-end">
              <button onClick={() => { setFilterCategory('all'); setFilterGender('all'); setFilterType('all'); setFilterStatus('all'); setFilterDate('all'); setFilterRegistration('all'); setFilterResult('all'); }}
                className="w-full py-1.5 px-3 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 text-xs font-bold">
                Clear All
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bulk operations toolbar */}
      {selected.size > 0 && (
        <div className="flex items-center gap-3 flex-wrap p-4 rounded-2xl bg-amber-900/20 border border-amber-500/40">
          <span className="text-amber-300 font-black text-xs">{selected.size} selected</span>
          {[
            { action: 'publish', label: 'Publish', icon: Eye },
            { action: 'open_reg', label: 'Open Registration', icon: CheckCircle2 },
            { action: 'close_reg', label: 'Close Registration', icon: X },
            { action: 'archive', label: 'Archive', icon: Trash2 },
          ].map(({ action, label, icon: Icon }) => (
            <button key={action} onClick={() => bulkAction(action)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${action === 'archive' ? 'bg-red-500/20 text-red-300 border-red-500/40 hover:bg-red-500/30' : 'bg-emerald-900 text-emerald-300 border-emerald-700 hover:bg-emerald-800'}`}>
              <Icon className="w-3.5 h-3.5" />{label}
            </button>
          ))}
          <button onClick={() => setSelected(new Set())} className="ml-auto text-xs text-emerald-400 hover:text-white font-bold">Deselect All</button>
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="text-center py-16 text-amber-300 text-xs font-bold flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin" /> Loading programmes…
        </div>
      )}

      {/* Empty state */}
      {!isLoading && filtered.length === 0 && (
        <div className="text-center py-20 bg-emerald-950/60 border border-emerald-800/60 rounded-3xl space-y-4">
          <Calendar className="w-14 h-14 text-emerald-700 mx-auto" />
          <h3 className="text-base font-black text-emerald-200">
            {programmes.length === 0 ? 'No programmes have been added yet.' : 'No programmes match your current filters.'}
          </h3>
          <p className="text-xs text-emerald-400/80">
            {programmes.length === 0 ? 'Click "Add Programme" to configure your first competition programme.' : 'Try adjusting or clearing the filters.'}
          </p>
          {programmes.length === 0 && (
            <button onClick={() => openWizard()}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-emerald-950 font-extrabold text-xs shadow-lg">
              <Plus className="w-4 h-4" /> Add Programme
            </button>
          )}
        </div>
      )}

      {/* TABLE VIEW */}
      {!isLoading && filtered.length > 0 && viewMode === 'table' && (
        <div className="bg-emerald-950/80 border border-emerald-800/60 rounded-3xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-emerald-800 text-[10px] font-extrabold text-amber-300 uppercase tracking-wider bg-emerald-950/60">
                  <th className="py-3 px-4"><input type="checkbox" checked={allSelected} onChange={toggleAll} className="accent-amber-500 w-3.5 h-3.5 cursor-pointer" /></th>
                  <th className="py-3 px-4">Programme</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Gender</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Venue</th>
                  <th className="py-3 px-4">Registration</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Result</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-900/60 text-xs">
                {filtered.map(p => {
                  const cat = categories.find(c => c.id === p.category_id);
                  const resultPublished = p.lifecycle_status === 'Published' && p.is_published;
                  return (
                    <tr key={p.id} className={`hover:bg-emerald-900/20 transition-all ${selected.has(p.id) ? 'bg-amber-900/10' : ''}`}>
                      <td className="py-3 px-4"><input type="checkbox" checked={selected.has(p.id)} onChange={() => toggleOne(p.id)} className="accent-amber-500 w-3.5 h-3.5 cursor-pointer" /></td>
                      <td className="py-3 px-4">
                        <div className="font-extrabold text-emerald-100">{p.title_en}</div>
                        <div className="text-[10px] text-amber-400/80 font-mono">{p.code}</div>
                      </td>
                      <td className="py-3 px-4 text-emerald-300">{cat?.name_en || '—'}</td>
                      <td className="py-3 px-4 text-emerald-300">{(p as any).gender || 'Open'}</td>
                      <td className="py-3 px-4 text-emerald-300">{p.competition_type}</td>
                      <td className="py-3 px-4">
                        <div className="text-emerald-200 font-bold">{p.event_date}</div>
                        <div className="text-[11px] text-emerald-400">{p.start_time} – {p.end_time}</div>
                      </td>
                      <td className="py-3 px-4 text-emerald-300">{p.venue || '—'}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${p.registration_open ? 'bg-blue-500/20 text-blue-300 border-blue-500/40' : 'bg-slate-800/60 text-slate-400 border-slate-700'}`}>
                          {p.registration_open ? 'Open' : 'Closed'}
                        </span>
                      </td>
                      <td className="py-3 px-4"><StatusBadge p={p} /></td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${resultPublished ? 'bg-teal-500/20 text-teal-300 border-teal-500/40' : 'bg-slate-800/60 text-slate-400 border-slate-700'}`}>
                          {resultPublished ? 'Published' : 'Pending'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-1.5">
                          {p.slug && (
                            <Link href={`/programs/${p.slug}`} target="_blank" className="p-1.5 rounded-lg bg-emerald-900/60 hover:bg-emerald-800 text-emerald-300 border border-emerald-800" title="Preview Public Page">
                              <ExternalLink className="w-3.5 h-3.5" />
                            </Link>
                          )}
                          <button onClick={() => duplicateProgramme(p.id).then(() => loadData())} className="p-1.5 rounded-lg bg-emerald-900/60 hover:bg-emerald-800 text-emerald-300 border border-emerald-800" title="Duplicate"><Copy className="w-3.5 h-3.5" /></button>
                          <button onClick={() => openWizard(p)} className="p-1.5 rounded-lg bg-emerald-900/60 hover:bg-emerald-800 text-amber-300 border border-emerald-800" title="Edit"><Edit3 className="w-3.5 h-3.5" /></button>
                          <button onClick={() => setDeleteId(p.id)} className="p-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40" title="Archive"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* GRID VIEW */}
      {!isLoading && filtered.length > 0 && viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(p => {
            const cat = categories.find(c => c.id === p.category_id);
            return (
              <div key={p.id} className={`bg-emerald-950/80 border rounded-3xl p-5 shadow-xl flex flex-col justify-between space-y-4 transition-all ${selected.has(p.id) ? 'border-amber-500/60' : 'border-emerald-800/60 hover:border-amber-500/40'}`}>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono text-[10px] font-black">{p.code}</span>
                    <StatusBadge p={p} />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap mb-1">
                      {cat && <span className="text-[10px] font-bold bg-amber-500/10 text-amber-300 px-2 py-0.5 rounded border border-amber-500/20">{cat.name_en}</span>}
                      <span className="text-[10px] font-bold bg-emerald-900 text-emerald-300 px-2 py-0.5 rounded border border-emerald-800">{(p as any).gender || 'Open'}</span>
                      <span className="text-[10px] font-bold bg-emerald-900 text-emerald-300 px-2 py-0.5 rounded border border-emerald-800">{p.competition_type}</span>
                    </div>
                    <h3 className="text-base font-black text-emerald-100">{p.title_en}</h3>
                    {p.description_en && <p className="text-[11px] text-emerald-400/70 mt-1 line-clamp-2">{p.description_en}</p>}
                  </div>
                  <div className="text-[11px] text-emerald-300/80 space-y-1 border-t border-emerald-800/40 pt-3">
                    <div className="flex items-center gap-1.5"><Calendar className="w-3 h-3 text-amber-400" />{p.event_date}</div>
                    <div className="flex items-center gap-1.5"><Clock className="w-3 h-3 text-amber-400" />{p.start_time} – {p.end_time}</div>
                    <div className="flex items-center gap-1.5"><MapPin className="w-3 h-3 text-amber-400" />{p.venue || '—'}</div>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-emerald-800/40">
                  <div className="flex items-center gap-1.5">
                    <input type="checkbox" checked={selected.has(p.id)} onChange={() => toggleOne(p.id)} className="accent-amber-500 w-3.5 h-3.5 cursor-pointer" />
                    {p.slug && <Link href={`/programs/${p.slug}`} target="_blank" className="p-1.5 rounded-lg bg-emerald-900/60 hover:bg-emerald-800 text-emerald-300 border border-emerald-800" title="Preview"><ExternalLink className="w-3.5 h-3.5" /></Link>}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => duplicateProgramme(p.id).then(() => loadData())} className="p-1.5 rounded-lg bg-emerald-900/60 hover:bg-emerald-800 text-emerald-300 border border-emerald-800" title="Duplicate"><Copy className="w-3.5 h-3.5" /></button>
                    <button onClick={() => openWizard(p)} className="p-1.5 rounded-lg bg-emerald-900/60 hover:bg-emerald-800 text-amber-300 border border-emerald-800" title="Edit"><Edit3 className="w-3.5 h-3.5" /></button>
                    <button onClick={() => setDeleteId(p.id)} className="p-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40" title="Archive"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          8-STEP PROGRAMME WIZARD MODAL
          ═══════════════════════════════════════════════════════════════ */}
      {isWizardOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="bg-emerald-950 border-2 border-emerald-800 rounded-3xl p-6 max-w-3xl w-full shadow-2xl space-y-5 relative my-8">
            <button onClick={() => setIsWizardOpen(false)} className="absolute top-4 right-4 p-1.5 rounded-full text-emerald-400 hover:text-white hover:bg-emerald-900">
              <X className="w-5 h-5" />
            </button>

            {/* Progress bar */}
            <div className="space-y-2 pr-8">
              <div className="flex items-center justify-between text-[10px] font-black text-amber-400 uppercase tracking-wider">
                <span>Step {wizardStep} of {STEPS.length}</span>
                <span>{STEPS[wizardStep - 1]}</span>
              </div>
              <div className="flex gap-1">
                {STEPS.map((_, i) => (
                  <button key={i} onClick={() => setWizardStep(i + 1)}
                    className={`h-1.5 flex-1 rounded-full transition-all ${i < wizardStep ? 'bg-amber-500' : 'bg-emerald-900'}`} />
                ))}
              </div>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/40 text-red-300 text-xs font-bold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />{formError}
              </div>
            )}

            {/* Step content */}
            <div className="max-h-[60vh] overflow-y-auto pr-1 space-y-4 text-xs">

              {/* ── STEP 1: Basic Info ─────────────────────────────────── */}
              {wizardStep === 1 && (
                <div className="space-y-4">
                  <h3 className="text-sm font-black text-emerald-100 border-b border-emerald-800/60 pb-2">Step 1 — Basic Information</h3>
                  <div>
                    <label className="block font-black text-amber-300 mb-1.5">Programme Title *</label>
                    <input type="text" value={form.title_en || ''} onChange={e => setForm({ ...form, title_en: e.target.value })}
                      placeholder="e.g. Qira'at Competition, Islamic Quiz…"
                      className="w-full px-4 py-2.5 rounded-xl bg-emerald-900 border border-emerald-700 text-emerald-100 font-bold focus:border-amber-400 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block font-black text-amber-300 mb-1.5">Programme Code</label>
                    <input type="text" value={form.code || ''} onChange={e => setForm({ ...form, code: e.target.value })}
                      placeholder="e.g. PRG-01"
                      className="w-full px-4 py-2.5 rounded-xl bg-emerald-900 border border-emerald-700 text-emerald-100 font-mono font-bold focus:border-amber-400 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block font-black text-amber-300 mb-1.5">Description</label>
                    <textarea value={form.description_en || ''} onChange={e => setForm({ ...form, description_en: e.target.value })}
                      rows={3} placeholder="Describe the programme rules, format, and what participants should expect."
                      className="w-full px-4 py-2.5 rounded-xl bg-emerald-900 border border-emerald-700 text-emerald-100 focus:border-amber-400 focus:outline-none resize-none" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block font-black text-amber-300 mb-1.5">Date *</label>
                      <input type="date" value={form.event_date || ''} onChange={e => setForm({ ...form, event_date: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl bg-emerald-900 border border-emerald-700 text-emerald-100 font-bold focus:border-amber-400 focus:outline-none" />
                    </div>
                    <div>
                      <label className="block font-black text-amber-300 mb-1.5">Start Time *</label>
                      <input type="time" value={form.start_time || ''} onChange={e => setForm({ ...form, start_time: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl bg-emerald-900 border border-emerald-700 text-emerald-100 font-bold focus:border-amber-400 focus:outline-none" />
                    </div>
                    <div>
                      <label className="block font-black text-amber-300 mb-1.5">End Time</label>
                      <input type="time" value={form.end_time || ''} onChange={e => setForm({ ...form, end_time: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl bg-emerald-900 border border-emerald-700 text-emerald-100 font-bold focus:border-amber-400 focus:outline-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block font-black text-amber-300 mb-1.5">Venue / Hall *</label>
                    <input type="text" value={form.venue || ''} onChange={e => setForm({ ...form, venue: e.target.value })}
                      placeholder="e.g. Main Auditorium, Hall B…"
                      className="w-full px-4 py-2.5 rounded-xl bg-emerald-900 border border-emerald-700 text-emerald-100 font-bold focus:border-amber-400 focus:outline-none" />
                  </div>
                </div>
              )}

              {/* ── STEP 2: Category & Gender ──────────────────────────── */}
              {wizardStep === 2 && (
                <div className="space-y-4">
                  <h3 className="text-sm font-black text-emerald-100 border-b border-emerald-800/60 pb-2">Step 2 — Category & Gender</h3>
                  <div>
                    <label className="block font-black text-amber-300 mb-1.5">Level / Category *</label>
                    <p className="text-[10px] text-emerald-400/80 mb-2">Comes from your configured category system. Manage in <Link href="/admin/categories" className="text-amber-400 underline font-bold">Admin → Categories</Link>.</p>
                    {categories.length === 0 ? (
                      <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs">
                        No categories configured. <Link href="/admin/categories" className="underline font-bold">Create categories first →</Link>
                      </div>
                    ) : (
                      <select value={form.category_id || ''} onChange={e => setForm({ ...form, category_id: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl bg-emerald-900 border border-emerald-700 text-emerald-100 font-bold focus:border-amber-400 focus:outline-none">
                        <option value="">— Select Level / Category —</option>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name_en}</option>)}
                      </select>
                    )}
                  </div>
                  <div>
                    <label className="block font-black text-amber-300 mb-1.5">Gender *</label>
                    <p className="text-[10px] text-emerald-400/80 mb-2">Who is eligible to participate in this programme?</p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {(['Male', 'Female', 'Open', 'Mixed'] as GenderOption[]).map(g => (
                        <button key={g} type="button" onClick={() => setForm({ ...form, gender: g })}
                          className={`py-3 rounded-xl border text-xs font-black transition-all ${form.gender === g ? 'bg-amber-500 text-emerald-950 border-amber-400' : 'bg-emerald-900/60 text-emerald-300 border-emerald-700 hover:border-amber-500'}`}>
                          {g}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block font-black text-amber-300 mb-1.5">Attendance Required</label>
                    <div className="flex gap-2">
                      {[true, false].map(v => (
                        <button key={String(v)} type="button" onClick={() => setForm({ ...form, attendance_required: v })}
                          className={`flex-1 py-2.5 rounded-xl border text-xs font-black transition-all ${form.attendance_required === v ? 'bg-amber-500 text-emerald-950 border-amber-400' : 'bg-emerald-900/60 text-emerald-300 border-emerald-700'}`}>
                          {v ? '✓ Attendance Tracked' : '✗ Attendance Optional'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ── STEP 3: Competition Type ───────────────────────────── */}
              {wizardStep === 3 && (
                <div className="space-y-4">
                  <h3 className="text-sm font-black text-emerald-100 border-b border-emerald-800/60 pb-2">Step 3 — Competition Format</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { val: 'Individual', icon: UserCheck, desc: 'Single participant competes' },
                      { val: 'Team', icon: Users, desc: 'Group competes as a team' },
                      { val: 'Individual+Team', icon: Layers, desc: 'Both formats allowed' },
                    ].map(({ val, icon: Icon, desc }) => (
                      <button key={val} type="button" onClick={() => setForm({ ...form, competition_type: val as Programme['competition_type'] })}
                        className={`p-4 rounded-2xl border text-left transition-all ${form.competition_type === val ? 'bg-amber-500/20 border-amber-500 text-amber-300' : 'bg-emerald-900/40 border-emerald-700 text-emerald-300 hover:border-amber-500/60'}`}>
                        <Icon className="w-5 h-5 mb-2" />
                        <div className="font-black text-xs">{val}</div>
                        <div className="text-[10px] opacity-70 mt-0.5">{desc}</div>
                      </button>
                    ))}
                  </div>

                  {(form.competition_type === 'Team' || form.competition_type === 'Individual+Team') && (
                    <div className="p-4 rounded-2xl bg-emerald-900/40 border border-emerald-700 space-y-3">
                      <h4 className="font-black text-amber-300 text-xs">Team Size Configuration</h4>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-emerald-300 mb-1">Minimum Members</label>
                          <input type="number" min={1} value={form.min_team_members || 2} onChange={e => setForm({ ...form, min_team_members: parseInt(e.target.value) || 2 })}
                            className="w-full px-3 py-2 rounded-xl bg-emerald-950 border border-emerald-700 text-emerald-100 font-bold text-center focus:border-amber-400 focus:outline-none" />
                        </div>
                        <div>
                          <label className="block text-emerald-300 mb-1">Maximum Members</label>
                          <input type="number" min={1} value={form.max_team_members || 10} onChange={e => setForm({ ...form, max_team_members: parseInt(e.target.value) || 10 })}
                            className="w-full px-3 py-2 rounded-xl bg-emerald-950 border border-emerald-700 text-emerald-100 font-bold text-center focus:border-amber-400 focus:outline-none" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ── STEP 4: Registration ───────────────────────────────── */}
              {wizardStep === 4 && (
                <div className="space-y-4">
                  <h3 className="text-sm font-black text-emerald-100 border-b border-emerald-800/60 pb-2">Step 4 — Registration Configuration</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-black text-amber-300 mb-1.5">Registration Mode</label>
                      <select value={form.registration_mode || 'Admin Only'} onChange={e => setForm({ ...form, registration_mode: e.target.value as any })}
                        className="w-full px-4 py-2.5 rounded-xl bg-emerald-900 border border-emerald-700 text-emerald-100 font-bold focus:border-amber-400 focus:outline-none">
                        <option value="Admin Only">Admin Only — Staff registers</option>
                        <option value="Public">Public — Anyone can register</option>
                        <option value="Both">Both — Admin + Public</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-black text-amber-300 mb-1.5">Approval Mode</label>
                      <select value={form.approval_mode || 'Manual'} onChange={e => setForm({ ...form, approval_mode: e.target.value as any })}
                        className="w-full px-4 py-2.5 rounded-xl bg-emerald-900 border border-emerald-700 text-emerald-100 font-bold focus:border-amber-400 focus:outline-none">
                        <option value="Automatic">Automatic — Instantly confirmed</option>
                        <option value="Manual">Manual — Admin reviews each</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-black text-amber-300 mb-1.5">Registration Open?</label>
                      <div className="flex gap-2">
                        {[true, false].map(v => (
                          <button key={String(v)} type="button" onClick={() => setForm({ ...form, registration_open: v })}
                            className={`flex-1 py-2.5 rounded-xl border text-xs font-black transition-all ${form.registration_open === v ? 'bg-amber-500 text-emerald-950 border-amber-400' : 'bg-emerald-900/60 text-emerald-300 border-emerald-700'}`}>
                            {v ? '✓ Open' : '✗ Closed'}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block font-black text-amber-300 mb-1.5">Registration Deadline</label>
                      <input type="date" value={form.registration_deadline || ''} onChange={e => setForm({ ...form, registration_deadline: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl bg-emerald-900 border border-emerald-700 text-emerald-100 font-bold focus:border-amber-400 focus:outline-none" />
                    </div>
                    <div>
                      <label className="block font-black text-amber-300 mb-1.5">Capacity (Max Participants)</label>
                      <input type="number" min={0} value={form.max_participants || ''} onChange={e => setForm({ ...form, max_participants: parseInt(e.target.value) || undefined })}
                        placeholder="Unlimited"
                        className="w-full px-4 py-2.5 rounded-xl bg-emerald-900 border border-emerald-700 text-emerald-100 font-bold focus:border-amber-400 focus:outline-none" />
                    </div>
                    <div>
                      <label className="block font-black text-amber-300 mb-1.5">Participant Types Allowed</label>
                      <select value={form.allowed_participant_types || 'Students'} onChange={e => setForm({ ...form, allowed_participant_types: e.target.value as any })}
                        className="w-full px-4 py-2.5 rounded-xl bg-emerald-900 border border-emerald-700 text-emerald-100 font-bold focus:border-amber-400 focus:outline-none">
                        <option value="Students">Students only</option>
                        <option value="Teams">Teams only</option>
                        <option value="Both">Students and Teams</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* ── STEP 5: Scoring ────────────────────────────────────── */}
              {wizardStep === 5 && (
                <div className="space-y-4">
                  <h3 className="text-sm font-black text-emerald-100 border-b border-emerald-800/60 pb-2">Step 5 — Scoring Configuration</h3>
                  <div>
                    <label className="block font-black text-amber-300 mb-1.5">Scoring Method *</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        { val: 'none' as ScoringMethod, label: 'No Scoring', icon: X, desc: 'Participation only' },
                        { val: 'single' as ScoringMethod, label: 'Single Score', icon: Hash, desc: 'One total score' },
                        { val: 'multi_criteria' as ScoringMethod, label: 'Multi-Criteria', icon: Layers, desc: 'Break into criteria' },
                        { val: 'manual_ranking' as ScoringMethod, label: 'Manual Rank', icon: List, desc: 'Judge assigns rank' },
                      ].map(({ val, label, icon: Icon, desc }) => (
                        <button key={val} type="button" onClick={() => setForm({ ...form, scoring_method: val })}
                          className={`p-3 rounded-xl border text-left transition-all ${form.scoring_method === val ? 'bg-amber-500/20 border-amber-500 text-amber-300' : 'bg-emerald-900/40 border-emerald-700 text-emerald-300 hover:border-amber-500/60'}`}>
                          <Icon className="w-4 h-4 mb-1.5" />
                          <div className="font-black text-[11px]">{label}</div>
                          <div className="text-[9px] opacity-70 mt-0.5 leading-tight">{desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {form.scoring_method !== 'none' && form.scoring_method !== 'manual_ranking' && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block font-black text-amber-300 mb-1.5">Maximum Score *</label>
                        <input type="number" min={0} value={form.max_score ?? 100} onChange={e => setForm({ ...form, max_score: parseFloat(e.target.value) })}
                          className="w-full px-4 py-2.5 rounded-xl bg-emerald-900 border border-emerald-700 text-amber-300 font-black text-center focus:border-amber-400 focus:outline-none" />
                      </div>
                      <div>
                        <label className="block font-black text-amber-300 mb-1.5">Minimum Score</label>
                        <input type="number" min={0} value={form.min_score ?? 0} onChange={e => setForm({ ...form, min_score: parseFloat(e.target.value) })}
                          className="w-full px-4 py-2.5 rounded-xl bg-emerald-900 border border-emerald-700 text-emerald-100 font-bold text-center focus:border-amber-400 focus:outline-none" />
                      </div>
                      <div>
                        <label className="block font-black text-amber-300 mb-1.5">Winner Rule</label>
                        <select value={form.scoring_direction || 'higher_wins'} onChange={e => setForm({ ...form, scoring_direction: e.target.value as any })}
                          className="w-full px-4 py-2.5 rounded-xl bg-emerald-900 border border-emerald-700 text-emerald-100 font-bold focus:border-amber-400 focus:outline-none">
                          <option value="higher_wins">Higher Score Wins</option>
                          <option value="lower_wins">Lower Score Wins (fastest time etc.)</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {/* Multi-criteria builder */}
                  {form.scoring_method === 'multi_criteria' && (
                    <div className="space-y-3 p-4 rounded-2xl bg-emerald-900/40 border border-emerald-700">
                      <div className="flex items-center justify-between">
                        <h4 className="font-black text-amber-300 text-xs">Scoring Criteria</h4>
                        <button type="button" onClick={() => setCriteria([...criteria, { id: uid(), name: '', max_score: 10 }])}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[11px] font-black">
                          <PlusCircle className="w-3.5 h-3.5" />
                          Add Criterion
                        </button>
                      </div>
                      {criteria.length === 0 && (
                        <p className="text-[11px] text-emerald-400/70">No criteria yet. Click "Add Criterion" to build the scoring rubric.</p>
                      )}
                      {criteria.map((c, i) => (
                        <div key={c.id} className="flex items-center gap-2">
                          <span className="text-[10px] font-black text-emerald-500 w-5 shrink-0">{i + 1}.</span>
                          <input type="text" value={c.name} onChange={e => setCriteria(criteria.map((cr, j) => j === i ? { ...cr, name: e.target.value } : cr))}
                            placeholder="Criterion name (e.g. Tajweed, Presentation…)"
                            className="flex-1 px-3 py-2 rounded-xl bg-emerald-950 border border-emerald-700 text-emerald-100 text-[11px] font-bold focus:border-amber-400 focus:outline-none" />
                          <span className="text-[10px] text-emerald-400 font-bold shrink-0">Max:</span>
                          <input type="number" min={0} value={c.max_score} onChange={e => setCriteria(criteria.map((cr, j) => j === i ? { ...cr, max_score: parseFloat(e.target.value) || 0 } : cr))}
                            className="w-14 px-2 py-2 rounded-xl bg-emerald-950 border border-emerald-700 text-amber-300 font-black text-center text-[11px] focus:border-amber-400 focus:outline-none" />
                          <button type="button" onClick={() => setCriteria(criteria.filter((_, j) => j !== i))}
                            className="p-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 shrink-0">
                            <Minus className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                      {criteria.length > 0 && (
                        <div className="text-right text-[10px] font-black text-amber-300">
                          Total Max Score: {criteria.reduce((s, c) => s + (c.max_score || 0), 0)}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* ── STEP 6: Leaderboard ────────────────────────────────── */}
              {wizardStep === 6 && (
                <div className="space-y-4">
                  <h3 className="text-sm font-black text-emerald-100 border-b border-emerald-800/60 pb-2">Step 6 — Leaderboard Configuration</h3>
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] font-bold">
                    ⚠ Enter 0 to exclude a position from points allocation.
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: '1st Place', key: 'rank1', color: 'text-amber-300' },
                      { label: '2nd Place', key: 'rank2', color: 'text-slate-300' },
                      { label: '3rd Place', key: 'rank3', color: 'text-amber-600' },
                      { label: '4th Place', key: 'rank4', color: 'text-emerald-400' },
                    ].map(({ label, key, color }) => (
                      <div key={key}>
                        <label className={`block font-black mb-1.5 ${color}`}>{label} — Points</label>
                        <input type="number" min={0}
                          value={form.custom_points_map?.[key as keyof typeof form.custom_points_map] ?? 0}
                          onChange={e => setForm({ ...form, custom_points_map: { ...form.custom_points_map!, [key]: parseFloat(e.target.value) || 0 } })}
                          className={`w-full px-4 py-3 rounded-xl bg-emerald-900 border border-emerald-700 font-black text-center text-lg focus:border-amber-400 focus:outline-none ${color}`} />
                      </div>
                    ))}
                  </div>
                  <div className="space-y-2">
                    {[
                      { key: 'include_in_student_leaderboard', label: 'Include in Student Leaderboard' },
                      { key: 'include_in_team_leaderboard', label: 'Include in Team Leaderboard' },
                    ].map(({ key, label }) => (
                      <div key={key} className="flex items-center justify-between p-3 rounded-xl bg-emerald-900/40 border border-emerald-700">
                        <span className="font-bold text-emerald-200 text-xs">{label}</span>
                        <button type="button" onClick={() => toggleField(key)}
                          className={`w-12 h-6 rounded-full border transition-all relative ${(form as any)[key] ? 'bg-amber-500 border-amber-400' : 'bg-emerald-800 border-emerald-700'}`}>
                          <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${(form as any)[key] ? 'left-6' : 'left-0.5'}`} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div>
                    <label className="block font-black text-amber-300 mb-1.5">Positions to Display in Results</label>
                    <select value={form.publish_position_count || 'top_3'} onChange={e => setForm({ ...form, publish_position_count: e.target.value as any })}
                      className="w-full px-4 py-2.5 rounded-xl bg-emerald-900 border border-emerald-700 text-emerald-100 font-bold focus:border-amber-400 focus:outline-none">
                      <option value="top_3">Top 3 Winners Only (🥇 🥈 🥉)</option>
                      <option value="top_5">Top 5 Winners</option>
                      <option value="top_10">Top 10</option>
                      <option value="all">All Participants</option>
                    </select>
                  </div>
                </div>
              )}

              {/* ── STEP 7: Result & Certificate ──────────────────────── */}
              {wizardStep === 7 && (
                <div className="space-y-4">
                  <h3 className="text-sm font-black text-emerald-100 border-b border-emerald-800/60 pb-2">Step 7 — Result & Certificate Settings</h3>
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-[11px] font-bold">
                    🔒 Public results will NEVER display raw competition scores or marks. Only position (1st, 2nd, 3rd) and participant name are shown publicly.
                  </div>
                  {[
                    { key: 'result_enabled', label: 'Result Generation Enabled', desc: 'Generate ranked results from submitted scores' },
                    { key: 'result_public', label: 'Publish Results Publicly', desc: 'Show on public results page after admin publishes' },
                    { key: 'poster_enabled', label: 'Result Poster Enabled', desc: 'Generate a visual result poster for this programme' },
                    { key: 'certificate_enabled', label: 'Certificates Enabled', desc: 'Issue certificates to winners of this programme' },
                  ].map(({ key, label, desc }) => (
                    <div key={key} className="flex items-start justify-between p-4 rounded-2xl bg-emerald-900/40 border border-emerald-700 gap-3">
                      <div>
                        <div className="font-black text-emerald-100 text-xs">{label}</div>
                        <div className="text-[10px] text-emerald-400/80 mt-0.5">{desc}</div>
                      </div>
                      <button type="button" onClick={() => toggleField(key)}
                        className={`w-12 h-6 rounded-full border transition-all relative shrink-0 ${(form as any)[key] ? 'bg-amber-500 border-amber-400' : 'bg-emerald-800 border-emerald-700'}`}>
                        <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${(form as any)[key] ? 'left-6' : 'left-0.5'}`} />
                      </button>
                    </div>
                  ))}
                  <div>
                    <label className="block font-black text-amber-300 mb-1.5">Initial Programme Status</label>
                    <select value={form.lifecycle_status || 'Draft'} onChange={e => setForm({ ...form, lifecycle_status: e.target.value as any })}
                      className="w-full px-4 py-2.5 rounded-xl bg-emerald-900 border border-emerald-700 text-emerald-100 font-bold focus:border-amber-400 focus:outline-none">
                      {['Draft', 'Registration Open', 'Registration Closed', 'Upcoming', 'Ongoing', 'Completed', 'Scores Pending', 'Result Ready', 'Published'].map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* ── STEP 8: Review & Publish ───────────────────────────── */}
              {wizardStep === 8 && (
                <div className="space-y-4">
                  <h3 className="text-sm font-black text-emerald-100 border-b border-emerald-800/60 pb-2">Step 8 — Review & Publish</h3>
                  <div className="p-4 rounded-2xl bg-emerald-900/40 border border-emerald-800 space-y-2 text-xs">
                    {([
                      ['Programme Title', form.title_en],
                      ['Code', form.code],
                      ['Category', categories.find(c => c.id === form.category_id)?.name_en || '—'],
                      ['Gender', form.gender],
                      ['Competition Format', form.competition_type],
                      ['Date', form.event_date],
                      ['Time', `${form.start_time || '—'} – ${form.end_time || '—'}`],
                      ['Venue', form.venue],
                      ['Scoring Method', form.scoring_method],
                      ['Max Score', form.scoring_method === 'none' ? 'N/A' : form.scoring_method === 'multi_criteria' ? `${criteria.reduce((s, c) => s + c.max_score, 0)} (${criteria.length} criteria)` : String(form.max_score ?? '—')],
                      ['Registration', form.registration_open ? 'Open' : 'Closed'],
                      ['Student Leaderboard', form.include_in_student_leaderboard ? '✓ Included' : '✗ Excluded'],
                      ['Team Leaderboard', form.include_in_team_leaderboard ? '✓ Included' : '✗ Excluded'],
                      ['Points', `1st: ${form.custom_points_map?.rank1 || 0}  2nd: ${form.custom_points_map?.rank2 || 0}  3rd: ${form.custom_points_map?.rank3 || 0}`],
                      ['Certificate', form.certificate_enabled ? '✓ Enabled' : '✗ Disabled'],
                      ['Status', form.lifecycle_status],
                    ] as [string, string | undefined][]).map(([k, v]) => (
                      <div key={k} className="flex items-start gap-2">
                        <span className="font-black text-amber-400 w-36 shrink-0">{k}:</span>
                        <span className="text-emerald-100">{v || '—'}</span>
                      </div>
                    ))}
                  </div>
                  <div className="p-3 rounded-xl bg-emerald-900/40 border border-emerald-700 text-[11px] text-emerald-300">
                    <Globe className="w-3.5 h-3.5 inline mr-1.5 text-amber-400" />
                    When published, this programme will be available at{' '}
                    <code className="text-amber-300 font-mono">/programs/{(form.title_en || 'programme').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}</code>
                  </div>
                </div>
              )}
            </div>

            {/* Wizard navigation */}
            <div className="pt-4 border-t border-emerald-800/60 flex items-center justify-between gap-3">
              {wizardStep > 1 ? (
                <button type="button" onClick={() => setWizardStep(wizardStep - 1)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-900 text-emerald-300 font-bold text-xs border border-emerald-700 hover:bg-emerald-800">
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
              ) : <div />}

              <div className="flex items-center gap-2">
                {wizardStep > 1 && (
                  <button type="button" onClick={() => saveWizard(false)} disabled={isSaving}
                    className="px-4 py-2 rounded-xl bg-emerald-900 text-emerald-300 font-bold text-xs border border-emerald-700 hover:bg-emerald-800 disabled:opacity-50">
                    {isSaving ? 'Saving…' : 'Save Draft'}
                  </button>
                )}
                {wizardStep < STEPS.length ? (
                  <button type="button" onClick={() => setWizardStep(wizardStep + 1)}
                    className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-amber-500 text-emerald-950 font-black text-xs hover:bg-amber-400 shadow-lg shadow-amber-500/20">
                    Next <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button type="button" onClick={() => saveWizard(true)} disabled={isSaving}
                    className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-amber-500 text-emerald-950 font-black text-xs hover:bg-amber-400 shadow-lg shadow-amber-500/20 disabled:opacity-50">
                    <Sparkles className="w-4 h-4" />
                    {isSaving ? 'Publishing…' : 'Publish Programme'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Archive confirm */}
      <ConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        title="Archive Programme?"
        message="Archiving this programme will hide it from active lists. All registrations, scores, and published results will remain safely preserved."
        confirmText="Archive Programme"
      />
    </div>
  );
}
