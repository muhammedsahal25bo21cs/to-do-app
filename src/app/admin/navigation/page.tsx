'use client';

import React, { useEffect, useState } from 'react';
import { 
  getNavigationItems, 
  createNavigationItem, 
  updateNavigationItem, 
  deleteNavigationItem, 
  NavigationItem 
} from '@/lib/cmsService';
import { ConfirmationModal } from '@/components/admin/ConfirmationModal';
import { 
  Compass, 
  Plus, 
  Edit3, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  X, 
  CheckCircle2, 
  XCircle 
} from 'lucide-react';

export default function NavigationAdmin() {
  const [navItems, setNavItems] = useState<NavigationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Edit / Add modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<Partial<NavigationItem> | null>(null);

  // Delete modal
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    const data = await getNavigationItems(false);
    setNavItems(data);
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAddModal = () => {
    setCurrentItem({
      label_en: '',
      label_ml: '',
      target_section: '#hero',
      display_order: navItems.length + 1,
      is_enabled: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: NavigationItem) => {
    setCurrentItem({ ...item });
    setIsModalOpen(true);
  };

  const handleSaveModal = async () => {
    if (!currentItem || !currentItem.label_en) {
      alert('Please enter navigation label in English.');
      return;
    }

    if (currentItem.id) {
      await updateNavigationItem(currentItem.id, currentItem);
    } else {
      await createNavigationItem(currentItem as Omit<NavigationItem, 'id'>);
    }

    setIsModalOpen(false);
    await loadData();
  };

  const handleToggleEnable = async (item: NavigationItem) => {
    await updateNavigationItem(item.id, { is_enabled: !item.is_enabled });
    await loadData();
  };

  const handleDeleteConfirm = async () => {
    if (deleteId) {
      await deleteNavigationItem(deleteId);
      setDeleteId(null);
      await loadData();
    }
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= navItems.length) return;

    const updated = [...navItems];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;

    for (let i = 0; i < updated.length; i++) {
      await updateNavigationItem(updated[i].id, { display_order: i + 1 });
    }
    await loadData();
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-emerald-950/80 border border-emerald-800/80 p-6 rounded-3xl backdrop-blur-xl">
        <div>
          <h1 className="text-2xl font-black text-emerald-100 flex items-center gap-2">
            <Compass className="w-6 h-6 text-amber-400" />
            <span>Navigation Menu Manager</span>
          </h1>
          <p className="text-xs text-emerald-300/80 mt-1">
            Control the links appearing in the top header navbar and mobile menu.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-emerald-950 font-extrabold text-xs shadow-lg shadow-amber-500/20 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Nav Item</span>
        </button>
      </div>

      {/* Nav Items List */}
      <div className="space-y-3">
        {navItems.map((item, idx) => (
          <div
            key={item.id}
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
                  disabled={idx === navItems.length - 1}
                  className="p-1 text-emerald-300 hover:text-white disabled:opacity-30"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-emerald-100">{item.label_en}</h3>
                  {item.label_ml && <span className="text-xs text-emerald-300/80">({item.label_ml})</span>}
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                    item.is_enabled ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-red-500/20 text-red-300 border-red-500/30'
                  }`}>
                    {item.is_enabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                <p className="text-xs text-amber-400 font-mono mt-0.5">Target: {item.target_section}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleToggleEnable(item)}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200 border border-emerald-800"
              >
                {item.is_enabled ? 'Disable' : 'Enable'}
              </button>
              <button
                onClick={() => handleOpenEditModal(item)}
                className="p-2 rounded-xl bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200 border border-emerald-800"
              >
                <Edit3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setDeleteId(item.id)}
                className="p-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit / Add Modal */}
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
              {currentItem.id ? 'Edit Navigation Item' : 'Add Navigation Link'}
            </h2>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-emerald-300 mb-1">Label (English) *</label>
                <input
                  type="text"
                  value={currentItem.label_en || ''}
                  onChange={(e) => setCurrentItem({ ...currentItem, label_en: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-emerald-900/40 border border-emerald-800 text-emerald-100"
                />
              </div>

              <div>
                <label className="block font-bold text-emerald-300 mb-1">Label (Malayalam - മലയാളം)</label>
                <input
                  type="text"
                  value={currentItem.label_ml || ''}
                  onChange={(e) => setCurrentItem({ ...currentItem, label_ml: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-emerald-900/40 border border-emerald-800 text-emerald-100"
                />
              </div>

              <div>
                <label className="block font-bold text-emerald-300 mb-1">Target Section Destination</label>
                <select
                  value={currentItem.target_section || '#hero'}
                  onChange={(e) => setCurrentItem({ ...currentItem, target_section: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-emerald-900 border border-emerald-800 text-emerald-100 text-xs"
                >
                  <option value="#hero">#hero (Hero Banner)</option>
                  <option value="#about">#about (About Section)</option>
                  <option value="#programmes">#programmes (Programme Schedule)</option>
                  <option value="#speakers">#speakers (Speakers Section)</option>
                  <option value="#gallery">#gallery (Photo Gallery)</option>
                  <option value="#location">#location (Location & Venue)</option>
                </select>
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
                className="px-5 py-2 rounded-xl bg-amber-500 text-emerald-950 font-bold text-xs shadow-lg shadow-amber-500/20"
              >
                Save Nav Link
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmationModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Navigation Link?"
        message="Are you sure you want to remove this item from the website header menu?"
        confirmText="Delete Link"
      />
    </div>
  );
}
