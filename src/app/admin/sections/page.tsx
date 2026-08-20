'use client';

import React, { useEffect, useState } from 'react';
import { getSections, updateSection, reorderSections, EventSection } from '@/lib/cmsService';
import { AdminPreviewModal } from '@/components/admin/AdminPreviewModal';
import { Layers, ArrowUp, ArrowDown, Eye, CheckCircle2, XCircle, ShieldCheck, Edit3, X } from 'lucide-react';

export default function SectionsAdmin() {
  const [sections, setSections] = useState<EventSection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Rename Modal
  const [editItem, setEditItem] = useState<EventSection | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    const data = await getSections(false);
    setSections(data);
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleEnable = async (sec: EventSection) => {
    await updateSection(sec.id, { is_enabled: !sec.is_enabled });
    await loadData();
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= sections.length) return;

    const updated = [...sections];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;

    setSections(updated);
    await reorderSections(updated.map(s => s.id));
  };

  const handleSaveRename = async () => {
    if (editItem) {
      await updateSection(editItem.id, { title_en: editItem.title_en, title_ml: editItem.title_ml });
      setEditItem(null);
      await loadData();
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-emerald-950/80 border border-emerald-800/80 p-6 rounded-3xl backdrop-blur-xl">
        <div>
          <h1 className="text-2xl font-black text-emerald-100 flex items-center gap-2">
            <Layers className="w-6 h-6 text-amber-400" />
            <span>Website Layout & Section Manager</span>
          </h1>
          <p className="text-xs text-emerald-300/80 mt-1">
            Safely enable, disable, rename, and reorder public website sections. Changes apply live to homepage.
          </p>
        </div>

        <button
          onClick={() => setIsPreviewOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-emerald-950 font-extrabold text-xs shadow-lg shadow-amber-500/20 transition-all shrink-0"
        >
          <Eye className="w-4 h-4" />
          <span>Preview Layout</span>
        </button>
      </div>

      {/* Warning Notice */}
      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center gap-2">
        <ShieldCheck className="w-4 h-4 shrink-0 text-amber-400" />
        <span>Layout controls are safely constrained so admins cannot accidentally break website code or structure.</span>
      </div>

      {/* Sections List */}
      <div className="space-y-3">
        {sections.map((sec, idx) => (
          <div
            key={sec.id}
            className="bg-emerald-950/80 border border-emerald-800/60 hover:border-emerald-700 rounded-2xl p-4 shadow-xl flex items-center justify-between gap-4 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="flex items-center bg-emerald-900/40 rounded-xl border border-emerald-800 p-1">
                <button
                  onClick={() => handleMove(idx, 'up')}
                  disabled={idx === 0}
                  className="p-1 text-emerald-300 hover:text-white disabled:opacity-30"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleMove(idx, 'down')}
                  disabled={idx === sections.length - 1}
                  className="p-1 text-emerald-300 hover:text-white disabled:opacity-30"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-amber-400">#{idx + 1}</span>
                  <h3 className="text-sm font-bold text-emerald-100">{sec.title_en}</h3>
                  {sec.title_ml && <span className="text-xs text-emerald-300/80">({sec.title_ml})</span>}
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                    sec.is_enabled ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-red-500/20 text-red-300 border-red-500/30'
                  }`}>
                    {sec.is_enabled ? 'Visible' : 'Hidden'}
                  </span>
                </div>
                <p className="text-[11px] text-emerald-400/60 font-mono mt-0.5">Key: {sec.section_key}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setEditItem({ ...sec })}
                className="p-2 rounded-xl bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200 border border-emerald-800"
                title="Rename Section"
              >
                <Edit3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleToggleEnable(sec)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                  sec.is_enabled
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30'
                }`}
              >
                {sec.is_enabled ? 'Hide Section' : 'Show Section'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Rename Modal */}
      {editItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-emerald-950 border border-emerald-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 relative">
            <button
              onClick={() => setEditItem(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-emerald-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-base font-bold text-emerald-100">Rename Section Title</h2>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-emerald-300 mb-1">Title (English)</label>
                <input
                  type="text"
                  value={editItem.title_en}
                  onChange={(e) => setEditItem({ ...editItem, title_en: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-emerald-900/40 border border-emerald-800 text-emerald-100"
                />
              </div>

              <div>
                <label className="block font-bold text-emerald-300 mb-1">Title (Malayalam)</label>
                <input
                  type="text"
                  value={editItem.title_ml}
                  onChange={(e) => setEditItem({ ...editItem, title_ml: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-emerald-900/40 border border-emerald-800 text-emerald-100"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-emerald-800/60">
              <button
                onClick={() => setEditItem(null)}
                className="px-4 py-2 rounded-xl border border-emerald-800 text-emerald-300 text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveRename}
                className="px-5 py-2 rounded-xl bg-amber-500 text-emerald-950 font-bold text-xs shadow-lg shadow-amber-500/20"
              >
                Save Title
              </button>
            </div>
          </div>
        </div>
      )}

      <AdminPreviewModal isOpen={isPreviewOpen} onClose={() => setIsPreviewOpen(false)} />
    </div>
  );
}
