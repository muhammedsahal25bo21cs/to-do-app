'use client';

import React, { useEffect, useState } from 'react';
import { 
  getGalleryImages, 
  createGalleryImage, 
  updateGalleryImage, 
  deleteGalleryImage, 
  toggleGalleryPublish, 
  uploadMediaImage,
  GalleryImage 
} from '@/lib/cmsService';
import { ConfirmationModal } from '@/components/admin/ConfirmationModal';
import { 
  Image as ImageIcon, 
  Plus, 
  Upload, 
  Trash2, 
  Edit3, 
  ArrowUp, 
  ArrowDown, 
  X, 
  Eye,
  CheckCircle2,
  XCircle
} from 'lucide-react';

export default function GalleryAdmin() {
  const [gallery, setGallery] = useState<GalleryImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('All');

  // Add / Edit Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<Partial<GalleryImage> | null>(null);

  // Delete modal
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    const data = await getGalleryImages(false);
    setGallery(data);
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAddModal = () => {
    setCurrentItem({
      title_en: '',
      title_ml: '',
      category_en: 'General',
      category_ml: 'പൊതുവായവ',
      image_url: '',
      caption: '',
      is_published: true,
      display_order: gallery.length + 1,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (img: GalleryImage) => {
    setCurrentItem({ ...img });
    setIsModalOpen(true);
  };

  const handleSaveModal = async () => {
    if (!currentItem || !currentItem.image_url) {
      alert('Please upload or enter an image URL.');
      return;
    }

    if (currentItem.id) {
      await updateGalleryImage(currentItem.id, currentItem);
    } else {
      await createGalleryImage(currentItem as Omit<GalleryImage, 'id'>);
    }

    setIsModalOpen(false);
    await loadData();
  };

  const handleTogglePublish = async (id: string) => {
    await toggleGalleryPublish(id);
    await loadData();
  };

  const handleDeleteConfirm = async () => {
    if (deleteId) {
      await deleteGalleryImage(deleteId);
      setDeleteId(null);
      await loadData();
    }
  };

  const handleImageUpload = async (file: File) => {
    try {
      const url = await uploadMediaImage(file);
      setCurrentItem((prev) => prev ? { ...prev, image_url: url } : null);
    } catch {
      alert('Upload failed');
    }
  };

  const categoriesList = ['All', ...Array.from(new Set(gallery.map(g => g.category_en)))];

  const filteredGallery = activeCategory === 'All' ? gallery : gallery.filter(g => g.category_en === activeCategory);

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-emerald-950/80 border border-emerald-800/80 p-6 rounded-3xl backdrop-blur-xl">
        <div>
          <h1 className="text-2xl font-black text-emerald-100 flex items-center gap-2">
            <ImageIcon className="w-6 h-6 text-amber-400" />
            <span>Gallery & Poster Manager</span>
          </h1>
          <p className="text-xs text-emerald-300/80 mt-1">
            Upload images to Supabase storage, add captions, organize albums, and control public gallery visibility.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-emerald-950 font-extrabold text-xs shadow-lg shadow-amber-500/20 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Upload New Image</span>
        </button>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {categoriesList.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border shrink-0 ${
              activeCategory === cat
                ? 'bg-amber-500 text-emerald-950 border-amber-500 shadow-md'
                : 'bg-emerald-950/80 text-emerald-300 border-emerald-800 hover:bg-emerald-900'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
        {filteredGallery.map((img) => (
          <div
            key={img.id}
            className="bg-emerald-950/80 border border-emerald-800/60 rounded-3xl overflow-hidden shadow-xl flex flex-col justify-between group"
          >
            <div className="relative aspect-video bg-emerald-900/60 overflow-hidden">
              <img src={img.image_url} alt={img.title_en} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              <span className={`absolute top-3 right-3 px-2.5 py-0.5 rounded-full text-[10px] font-bold border backdrop-blur-md ${
                img.is_published ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40' : 'bg-amber-950/80 text-amber-300 border-amber-500/40'
              }`}>
                {img.is_published ? 'Published' : 'Draft'}
              </span>
            </div>

            <div className="p-4 space-y-2">
              <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">{img.category_en}</span>
              <h3 className="text-sm font-bold text-emerald-100">{img.title_en || 'Untitled Photo'}</h3>
              {img.caption && <p className="text-xs text-emerald-300/70">{img.caption}</p>}
            </div>

            <div className="p-4 pt-0 flex items-center justify-between border-t border-emerald-800/40 mt-2">
              <button
                onClick={() => handleTogglePublish(img.id)}
                className="text-xs font-bold text-emerald-300 hover:text-amber-300"
              >
                {img.is_published ? 'Unpublish' : 'Publish'}
              </button>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleOpenEditModal(img)}
                  className="p-2 rounded-xl bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200 border border-emerald-800"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeleteId(img.id)}
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
          <div className="bg-emerald-950 border border-emerald-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-emerald-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-base font-bold text-emerald-100">
              {currentItem.id ? 'Edit Image Caption' : 'Upload Image'}
            </h2>

            <div className="space-y-3 text-xs">
              <div className="space-y-2">
                <label className="block font-bold text-emerald-300">Image Source *</label>
                {currentItem.image_url && (
                  <img src={currentItem.image_url} alt="Preview" className="w-full h-36 object-cover rounded-2xl border border-emerald-800" />
                )}
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Image URL"
                    value={currentItem.image_url || ''}
                    onChange={(e) => setCurrentItem({ ...currentItem, image_url: e.target.value })}
                    className="flex-1 px-3.5 py-2 rounded-xl bg-emerald-900/40 border border-emerald-800 text-emerald-100"
                  />
                  <label className="flex items-center gap-1 px-3 py-2 rounded-xl bg-emerald-900 hover:bg-emerald-800 text-emerald-200 text-xs font-semibold cursor-pointer border border-emerald-700 shrink-0">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload</span>
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])} />
                  </label>
                </div>
              </div>

              <div>
                <label className="block font-bold text-emerald-300 mb-1">Title (English)</label>
                <input
                  type="text"
                  value={currentItem.title_en || ''}
                  onChange={(e) => setCurrentItem({ ...currentItem, title_en: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-emerald-900/40 border border-emerald-800 text-emerald-100"
                />
              </div>

              <div>
                <label className="block font-bold text-emerald-300 mb-1">Title (Malayalam - മലയാളം)</label>
                <input
                  type="text"
                  value={currentItem.title_ml || ''}
                  onChange={(e) => setCurrentItem({ ...currentItem, title_ml: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-emerald-900/40 border border-emerald-800 text-emerald-100"
                />
              </div>

              <div>
                <label className="block font-bold text-emerald-300 mb-1">Category / Album</label>
                <input
                  type="text"
                  value={currentItem.category_en || ''}
                  onChange={(e) => setCurrentItem({ ...currentItem, category_en: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-emerald-900/40 border border-emerald-800 text-emerald-100"
                />
              </div>

              <div>
                <label className="block font-bold text-emerald-300 mb-1">Caption / Details</label>
                <textarea
                  rows={2}
                  value={currentItem.caption || ''}
                  onChange={(e) => setCurrentItem({ ...currentItem, caption: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-emerald-900/40 border border-emerald-800 text-emerald-100"
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
                className="px-5 py-2 rounded-xl bg-amber-500 text-emerald-950 font-bold text-xs shadow-lg shadow-amber-500/20"
              >
                Save Gallery Image
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
        title="Delete Image?"
        message="Are you sure you want to remove this image from the gallery?"
        confirmText="Delete Image"
      />
    </div>
  );
}
