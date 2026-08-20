'use client';

import React, { useEffect, useState } from 'react';
import { 
  getSpeakers, 
  createSpeaker, 
  updateSpeaker, 
  deleteSpeaker, 
  toggleSpeakerPublish, 
  uploadMediaImage,
  getProgrammes,
  Speaker, 
  Programme 
} from '@/lib/cmsService';
import { ConfirmationModal } from '@/components/admin/ConfirmationModal';
import { 
  Users, 
  Plus, 
  Edit3, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  Upload, 
  X, 
  CheckCircle2, 
  XCircle 
} from 'lucide-react';

export default function SpeakersAdmin() {
  const [speakers, setSpeakers] = useState<Speaker[]>([]);
  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Edit / Add Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<Partial<Speaker> | null>(null);

  // Delete Modal
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    const [s, p] = await Promise.all([
      getSpeakers(false),
      getProgrammes(false),
    ]);
    setSpeakers(s);
    setProgrammes(p);
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAddModal = () => {
    setCurrentItem({
      name_en: '',
      name_ml: '',
      name_ar: '',
      role_en: 'Guest Speaker',
      role_ml: 'അതിഥി പ്രഭാഷകൻ',
      description_en: '',
      description_ml: '',
      photo_url: '',
      category: 'Scholar',
      social_facebook: '',
      social_instagram: '',
      social_youtube: '',
      is_published: true,
      display_order: speakers.length + 1,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (spk: Speaker) => {
    setCurrentItem({ ...spk });
    setIsModalOpen(true);
  };

  const handleSaveModal = async () => {
    if (!currentItem || !currentItem.name_en) {
      alert('Please enter speaker name in English.');
      return;
    }

    if (currentItem.id) {
      await updateSpeaker(currentItem.id, currentItem);
    } else {
      await createSpeaker(currentItem as Omit<Speaker, 'id'>);
    }

    setIsModalOpen(false);
    await loadData();
  };

  const handleTogglePublish = async (id: string) => {
    await toggleSpeakerPublish(id);
    await loadData();
  };

  const handleDeleteConfirm = async () => {
    if (deleteId) {
      await deleteSpeaker(deleteId);
      setDeleteId(null);
      await loadData();
    }
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= speakers.length) return;

    const updated = [...speakers];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;

    for (let i = 0; i < updated.length; i++) {
      await updateSpeaker(updated[i].id, { display_order: i + 1 });
    }
    await loadData();
  };

  const handleImageUpload = async (file: File) => {
    try {
      const url = await uploadMediaImage(file);
      setCurrentItem((prev) => prev ? { ...prev, photo_url: url } : null);
    } catch {
      alert('Upload failed');
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-emerald-950/80 border border-emerald-800/80 p-6 rounded-3xl backdrop-blur-xl">
        <div>
          <h1 className="text-2xl font-black text-emerald-100 flex items-center gap-2">
            <Users className="w-6 h-6 text-amber-400" />
            <span>Speakers & Guests Management</span>
          </h1>
          <p className="text-xs text-emerald-300/80 mt-1">
            Manage profiles, photos, roles, and links for invited Islamic scholars and guests.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-emerald-950 font-extrabold text-xs shadow-lg shadow-amber-500/20 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Speaker / Guest</span>
        </button>
      </div>

      {/* Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {speakers.map((spk, idx) => (
          <div
            key={spk.id}
            className="bg-emerald-950/80 border border-emerald-800/60 rounded-3xl p-5 shadow-xl space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                  spk.is_published ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                }`}>
                  {spk.is_published ? 'Published' : 'Draft'}
                </span>

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
                    disabled={idx === speakers.length - 1}
                    className="p-1 text-emerald-300 hover:text-white disabled:opacity-30"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {spk.photo_url ? (
                  <img src={spk.photo_url} alt={spk.name_en} className="w-14 h-14 rounded-2xl object-cover border border-emerald-700 shrink-0" />
                ) : (
                  <div className="w-14 h-14 rounded-2xl bg-emerald-900 border border-emerald-800 flex items-center justify-center text-amber-400 font-bold text-base shrink-0">
                    {spk.name_en.charAt(0)}
                  </div>
                )}

                <div>
                  <h3 className="text-sm font-bold text-emerald-100">{spk.name_en}</h3>
                  {spk.name_ml && <p className="text-xs text-emerald-300/80">{spk.name_ml}</p>}
                  <p className="text-[11px] text-amber-400 font-semibold mt-0.5">{spk.role_en}</p>
                </div>
              </div>

              {spk.description_en && (
                <p className="text-xs text-emerald-400/80 line-clamp-2 leading-relaxed bg-emerald-900/30 p-2.5 rounded-xl border border-emerald-800/40">
                  {spk.description_en}
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-emerald-800/40">
              <button
                onClick={() => handleTogglePublish(spk.id)}
                className="text-xs font-bold text-emerald-300 hover:text-amber-300"
              >
                {spk.is_published ? 'Unpublish' : 'Publish'}
              </button>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleOpenEditModal(spk)}
                  className="p-2 rounded-xl bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200 border border-emerald-800"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeleteId(spk.id)}
                  className="p-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit / Add Modal */}
      {isModalOpen && currentItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-emerald-950 border border-emerald-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-emerald-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-base font-bold text-emerald-100">
              {currentItem.id ? 'Edit Speaker Profile' : 'Add New Speaker'}
            </h2>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-emerald-300 mb-1">Speaker Name (English) *</label>
                <input
                  type="text"
                  value={currentItem.name_en || ''}
                  onChange={(e) => setCurrentItem({ ...currentItem, name_en: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-emerald-900/40 border border-emerald-800 text-emerald-100"
                />
              </div>

              <div>
                <label className="block font-bold text-emerald-300 mb-1">Speaker Name (Malayalam - മലയാളം)</label>
                <input
                  type="text"
                  value={currentItem.name_ml || ''}
                  onChange={(e) => setCurrentItem({ ...currentItem, name_ml: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-emerald-900/40 border border-emerald-800 text-emerald-100"
                />
              </div>

              <div>
                <label className="block font-bold text-emerald-300 mb-1">Role / Designation (English)</label>
                <input
                  type="text"
                  value={currentItem.role_en || ''}
                  onChange={(e) => setCurrentItem({ ...currentItem, role_en: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-emerald-900/40 border border-emerald-800 text-emerald-100"
                />
              </div>

              <div>
                <label className="block font-bold text-emerald-300 mb-1">Role / Designation (Malayalam)</label>
                <input
                  type="text"
                  value={currentItem.role_ml || ''}
                  onChange={(e) => setCurrentItem({ ...currentItem, role_ml: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-emerald-900/40 border border-emerald-800 text-emerald-100"
                />
              </div>

              <div>
                <label className="block font-bold text-emerald-300 mb-1">Bio / Description (English)</label>
                <textarea
                  rows={2}
                  value={currentItem.description_en || ''}
                  onChange={(e) => setCurrentItem({ ...currentItem, description_en: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-emerald-900/40 border border-emerald-800 text-emerald-100"
                />
              </div>

              <div className="space-y-2">
                <label className="block font-bold text-emerald-300">Photo</label>
                {currentItem.photo_url && (
                  <img src={currentItem.photo_url} alt="Preview" className="w-20 h-20 rounded-2xl object-cover border border-emerald-800" />
                )}
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Photo URL"
                    value={currentItem.photo_url || ''}
                    onChange={(e) => setCurrentItem({ ...currentItem, photo_url: e.target.value })}
                    className="flex-1 px-3 py-2 rounded-xl bg-emerald-900/40 border border-emerald-800 text-emerald-100"
                  />
                  <label className="flex items-center gap-1 px-3 py-2 rounded-xl bg-emerald-900 hover:bg-emerald-800 text-emerald-200 text-xs font-semibold cursor-pointer border border-emerald-700 shrink-0">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload</span>
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])} />
                  </label>
                </div>
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
                Save Speaker
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Delete */}
      <ConfirmationModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Speaker Profile?"
        message="Are you sure you want to delete this speaker profile?"
        confirmText="Delete Speaker"
      />
    </div>
  );
}
