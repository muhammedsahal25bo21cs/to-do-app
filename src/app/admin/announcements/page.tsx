'use client';

import React, { useEffect, useState } from 'react';
import { 
  getAnnouncements, 
  createAnnouncement, 
  updateAnnouncement, 
  deleteAnnouncement, 
  toggleAnnouncementPublish, 
  Announcement 
} from '@/lib/cmsService';
import { ConfirmationModal } from '@/components/admin/ConfirmationModal';
import { 
  Megaphone, 
  Plus, 
  Edit3, 
  Trash2, 
  AlertCircle, 
  X, 
  Sparkles,
  Flame,
  CheckCircle2
} from 'lucide-react';

export default function AnnouncementsAdmin() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Edit / Add Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<Partial<Announcement> | null>(null);

  // Delete modal
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    const data = await getAnnouncements(false);
    setAnnouncements(data);
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAddModal = () => {
    setCurrentItem({
      title_en: '',
      short_description_en: '',
      content_en: '',
      image_url: '',
      priority: 'Normal',
      is_important: false,
      is_featured: false,
      is_published: true,
      status: 'Published',
      start_date: new Date().toISOString().split('T')[0],
      display_order: announcements.length + 1,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (ann: Announcement) => {
    setCurrentItem({ ...ann });
    setIsModalOpen(true);
  };

  const handleSaveModal = async () => {
    if (!currentItem || !currentItem.title_en) {
      alert('Please enter announcement title in English.');
      return;
    }

    if (currentItem.id) {
      await updateAnnouncement(currentItem.id, currentItem);
    } else {
      await createAnnouncement(currentItem as Omit<Announcement, 'id'>);
    }

    setIsModalOpen(false);
    await loadData();
  };

  const handleTogglePublish = async (id: string) => {
    await toggleAnnouncementPublish(id);
    await loadData();
  };

  const handleDeleteConfirm = async () => {
    if (deleteId) {
      await deleteAnnouncement(deleteId);
      setDeleteId(null);
      await loadData();
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-emerald-950/80 border border-emerald-800/80 p-6 rounded-3xl backdrop-blur-xl">
        <div>
          <h1 className="text-2xl font-black text-emerald-100 flex items-center gap-2">
            <Megaphone className="w-6 h-6 text-amber-400" />
            <span>Announcement & Live Event Updates Manager</span>
          </h1>
          <p className="text-xs text-emerald-300/80 mt-1">
            Create public notices, broadcast urgent venue/schedule updates, and set priorities.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-emerald-950 font-extrabold text-xs shadow-lg shadow-amber-500/20 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Announcement</span>
        </button>
      </div>

      {/* Announcements List */}
      <div className="space-y-4">
        {announcements.length === 0 ? (
          <div className="bg-emerald-950/80 border border-emerald-800/60 rounded-3xl p-12 text-center text-emerald-400/60 space-y-3">
            <Megaphone className="w-12 h-12 text-emerald-700 mx-auto" />
            <p className="text-sm font-semibold">No announcements have been created yet.</p>
            <p className="text-xs text-amber-300">Click "New Announcement" to publish notices or urgent updates.</p>
          </div>
        ) : (
          announcements.map((ann) => {
            const isUrgent = ann.priority === 'Urgent';
            const isImportant = ann.priority === 'Important' || ann.is_important;

            return (
              <div
                key={ann.id}
                className={`bg-emerald-950/80 border rounded-3xl p-5 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${
                  isUrgent ? 'border-red-500/80 bg-red-950/20' : isImportant ? 'border-amber-500/80 bg-amber-950/10' : 'border-emerald-800/60'
                }`}
              >
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                      ann.is_published ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                    }`}>
                      {ann.is_published ? 'Published' : 'Draft'}
                    </span>

                    {isUrgent && (
                      <span className="px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-300 text-[10px] font-black border border-red-500/40 flex items-center gap-1">
                        <Flame className="w-3 h-3 text-red-400" />
                        <span>Urgent Update</span>
                      </span>
                    )}

                    {isImportant && !isUrgent && (
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/40 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 text-amber-400" />
                        <span>Important Notice</span>
                      </span>
                    )}

                    {ann.is_featured && (
                      <span className="px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 text-[10px] font-bold border border-sky-500/40 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-sky-400" />
                        <span>Featured Banner</span>
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-emerald-100">{ann.title_en}</h3>
                  {ann.short_description_en && (
                    <p className="text-xs text-amber-300/90 font-medium">{ann.short_description_en}</p>
                  )}
                  {ann.content_en && (
                    <p className="text-xs text-emerald-300/80 leading-relaxed line-clamp-2">{ann.content_en}</p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0 border-t md:border-t-0 border-emerald-800/40 pt-3 md:pt-0">
                  <button
                    onClick={() => handleTogglePublish(ann.id)}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200 border border-emerald-800"
                  >
                    {ann.is_published ? 'Unpublish' : 'Publish'}
                  </button>
                  <button
                    onClick={() => handleOpenEditModal(ann)}
                    className="p-2 rounded-xl bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200 border border-emerald-800"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteId(ann.id)}
                    className="p-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Edit / Add Modal */}
      {isModalOpen && currentItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-emerald-950 border border-emerald-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-emerald-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-base font-bold text-emerald-100">
              {currentItem.id ? 'Edit Announcement' : 'New Announcement / Live Update'}
            </h2>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-amber-300 mb-1">Title *</label>
                <input
                  type="text"
                  value={currentItem.title_en || ''}
                  onChange={(e) => setCurrentItem({ ...currentItem, title_en: e.target.value })}
                  placeholder="e.g. Venue Change Notice or Quiz Result Published"
                  className="w-full px-3.5 py-2 rounded-xl bg-emerald-900/40 border border-emerald-800 text-emerald-100 focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-amber-300 mb-1">Short Summary</label>
                <input
                  type="text"
                  value={currentItem.short_description_en || ''}
                  onChange={(e) => setCurrentItem({ ...currentItem, short_description_en: e.target.value })}
                  placeholder="Brief one-line summary for cards & live ticker"
                  className="w-full px-3.5 py-2 rounded-xl bg-emerald-900/40 border border-emerald-800 text-emerald-100 focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-amber-300 mb-1">Full Description Content</label>
                <textarea
                  rows={4}
                  value={currentItem.content_en || ''}
                  onChange={(e) => setCurrentItem({ ...currentItem, content_en: e.target.value })}
                  placeholder="Detailed announcement content..."
                  className="w-full px-3.5 py-2 rounded-xl bg-emerald-900/40 border border-emerald-800 text-emerald-100 focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-amber-300 mb-1">Priority Level</label>
                  <select
                    value={currentItem.priority || 'Normal'}
                    onChange={(e: any) => setCurrentItem({ ...currentItem, priority: e.target.value, is_important: e.target.value !== 'Normal' })}
                    className="w-full px-3.5 py-2 rounded-xl bg-emerald-900 border border-emerald-800 text-emerald-100 font-bold"
                  >
                    <option value="Normal">Normal Notice</option>
                    <option value="Important">Important Announcement</option>
                    <option value="Urgent">Urgent Alert Banner</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-amber-300 mb-1">Publication Status</label>
                  <select
                    value={currentItem.is_published ? 'Published' : 'Draft'}
                    onChange={(e) => setCurrentItem({ ...currentItem, is_published: e.target.value === 'Published' })}
                    className="w-full px-3.5 py-2 rounded-xl bg-emerald-900 border border-emerald-800 text-emerald-100 font-bold"
                  >
                    <option value="Published">Published Live</option>
                    <option value="Draft">Draft Only</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-4 pt-2">
                <label className="flex items-center gap-2 font-bold text-emerald-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={currentItem.is_featured || false}
                    onChange={(e) => setCurrentItem({ ...currentItem, is_featured: e.target.checked })}
                    className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500 bg-emerald-900 border-emerald-800"
                  />
                  <span>Feature on Homepage Banner</span>
                </label>
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
                Save Announcement
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Announcement?"
        message="Are you sure you want to remove this announcement?"
        confirmText="Delete Announcement"
      />
    </div>
  );
}
