'use client';

import React, { useEffect, useState } from 'react';
import { 
  getCategories, 
  createCategory, 
  updateCategory, 
  archiveCategory, 
  restoreCategory, 
  deleteCategory, 
  Category 
} from '@/lib/cmsService';
import { FolderTree, Plus, Edit2, Archive, RotateCcw, Trash2, CheckCircle2, AlertCircle, Tag, Users, User } from 'lucide-react';

export default function CategoryAdminPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [showArchived, setShowArchived] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Form Fields
  const [nameEn, setNameEn] = useState('');
  const [shortName, setShortName] = useState('');
  const [description, setDescription] = useState('');
  const [ageRange, setAgeRange] = useState('');
  const [classRange, setClassRange] = useState('');
  const [allowIndividual, setAllowIndividual] = useState(true);
  const [allowTeam, setAllowTeam] = useState(true);
  const [maxTeamSize, setMaxTeamSize] = useState(5);
  const [colorCode, setColorCode] = useState('#f59e0b');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    loadCategories();
  }, [showArchived]);

  const loadCategories = async () => {
    const data = await getCategories(true);
    setCategories(showArchived ? data.filter(c => c.is_archived) : data.filter(c => !c.is_archived));
  };

  const handleOpenAddModal = () => {
    setEditingCategory(null);
    setNameEn('');
    setShortName('');
    setDescription('');
    setAgeRange('');
    setClassRange('');
    setAllowIndividual(true);
    setAllowTeam(true);
    setMaxTeamSize(5);
    setColorCode('#f59e0b');
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setNameEn(cat.name_en);
    setShortName(cat.short_name || '');
    setDescription(cat.description || '');
    setAgeRange(cat.age_range || '');
    setClassRange(cat.class_range || '');
    setAllowIndividual(cat.allow_individual !== false);
    setAllowTeam(cat.allow_team !== false);
    setMaxTeamSize(cat.max_team_size || 5);
    setColorCode(cat.color_code || '#f59e0b');
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!nameEn.trim()) {
      setErrorMsg('Category name is required.');
      return;
    }

    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, {
          name_en: nameEn,
          short_name: shortName,
          description,
          age_range: ageRange,
          class_range: classRange,
          allow_individual: allowIndividual,
          allow_team: allowTeam,
          max_team_size: maxTeamSize,
          color_code: colorCode,
        });
      } else {
        await createCategory({
          name_en: nameEn,
          short_name: shortName,
          description,
          age_range: ageRange,
          class_range: classRange,
          allow_individual: allowIndividual,
          allow_team: allowTeam,
          max_team_size: maxTeamSize,
          color_code: colorCode,
          display_order: categories.length + 1,
          is_enabled: true,
        });
      }
      setIsModalOpen(false);
      await loadCategories();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save category.');
    }
  };

  const handleArchive = async (id: string) => {
    await archiveCategory(id);
    await loadCategories();
  };

  const handleRestore = async (id: string) => {
    await restoreCategory(id);
    await loadCategories();
  };

  const handleDeletePermanent = async (id: string) => {
    if (confirm('Permanently delete this category? Any associated programmes will be reassigned.')) {
      await deleteCategory(id);
      await loadCategories();
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="bg-emerald-950/80 border border-emerald-800/80 p-6 rounded-3xl backdrop-blur-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-emerald-100 flex items-center gap-2">
            <FolderTree className="w-6 h-6 text-amber-400" />
            <span>Category Manager</span>
          </h1>
          <p className="text-xs text-emerald-300/80 mt-1">
            Create, configure, archive, and restore competition categories (e.g. Sub-Junior, Junior, Senior) with age and class rules.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setShowArchived(!showArchived)}
            className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold border transition-all ${
              showArchived ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' : 'bg-emerald-900/80 text-emerald-200 border-emerald-700'
            }`}
          >
            {showArchived ? 'View Active Categories' : 'View Archived Categories'}
          </button>

          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-emerald-950 font-extrabold text-xs shadow-lg transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Create Category</span>
          </button>
        </div>
      </div>

      {/* Category List */}
      <div className="bg-emerald-950/80 border border-emerald-800/60 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-emerald-800/60 pb-3">
          <h2 className="text-base font-bold text-emerald-100">
            {showArchived ? 'Archived Categories' : 'Active Competition Categories'} ({categories.length})
          </h2>
          <span className="text-xs text-amber-300 font-extrabold bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-full">
            Dynamic Database Records
          </span>
        </div>

        {categories.length === 0 ? (
          <div className="text-center py-12 text-emerald-400/60 text-xs font-semibold space-y-2">
            <FolderTree className="w-10 h-10 text-emerald-700 mx-auto" />
            <p>No categories have been created yet.</p>
            <p className="text-[10px] text-emerald-500">Click "Create Category" above to add your first competition category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="p-5 rounded-2xl bg-emerald-900/30 border border-emerald-800 flex flex-col justify-between space-y-4 shadow-lg hover:border-amber-500/50 transition-all"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                      {cat.short_name || 'CAT'}
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400">Order #{cat.display_order}</span>
                  </div>

                  <h3 className="text-lg font-black text-emerald-100">{cat.name_en}</h3>
                  {cat.description && <p className="text-xs text-emerald-300/80">{cat.description}</p>}

                  <div className="flex flex-wrap gap-2 pt-1 text-[11px] font-bold">
                    {cat.age_range && (
                      <span className="px-2.5 py-1 rounded-xl bg-emerald-900/80 border border-emerald-700 text-amber-300">
                        Age: {cat.age_range}
                      </span>
                    )}
                    {cat.class_range && (
                      <span className="px-2.5 py-1 rounded-xl bg-emerald-900/80 border border-emerald-700 text-emerald-300">
                        Class: {cat.class_range}
                      </span>
                    )}
                    <span className="px-2.5 py-1 rounded-xl bg-emerald-900/80 border border-emerald-700 text-emerald-200 flex items-center gap-1">
                      {cat.allow_individual && <User className="w-3 h-3 text-amber-400" />}
                      {cat.allow_team && <Users className="w-3 h-3 text-amber-400" />}
                      <span>{cat.allow_individual && cat.allow_team ? 'Indiv + Team' : cat.allow_team ? `Team (${cat.max_team_size})` : 'Individual'}</span>
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-emerald-800/60">
                  {!showArchived ? (
                    <>
                      <button
                        onClick={() => handleOpenEditModal(cat)}
                        className="p-2 rounded-xl bg-emerald-900 border border-emerald-700 text-emerald-300 hover:text-white transition-all"
                        title="Edit Category"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleArchive(cat.id)}
                        className="p-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 hover:bg-amber-500/30 transition-all"
                        title="Archive Category"
                      >
                        <Archive className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleRestore(cat.id)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-700 text-emerald-100 font-extrabold text-xs"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Restore</span>
                      </button>

                      <button
                        onClick={() => handleDeletePermanent(cat.id)}
                        className="p-2 rounded-xl bg-red-900/40 border border-red-800/80 text-red-300 hover:text-red-100 transition-all"
                        title="Delete Permanently"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Category Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-emerald-950 border-2 border-emerald-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-emerald-800 pb-3">
              <h3 className="text-lg font-black text-emerald-100">
                {editingCategory ? 'Edit Category Configuration' : 'Create Competition Category'}
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
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-amber-300 mb-1">Category Name *</label>
                  <input
                    type="text"
                    value={nameEn}
                    onChange={(e) => setNameEn(e.target.value)}
                    placeholder="e.g. Junior"
                    className="w-full px-4 py-2.5 rounded-xl bg-emerald-900 border border-emerald-700 text-emerald-100 text-xs font-bold focus:border-amber-400 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-amber-300 mb-1">Short Code</label>
                  <input
                    type="text"
                    value={shortName}
                    onChange={(e) => setShortName(e.target.value)}
                    placeholder="e.g. JUN"
                    className="w-full px-4 py-2.5 rounded-xl bg-emerald-900 border border-emerald-700 text-emerald-100 text-xs font-bold focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-amber-300 mb-1">Age Range (Optional)</label>
                  <input
                    type="text"
                    value={ageRange}
                    onChange={(e) => setAgeRange(e.target.value)}
                    placeholder="e.g. 10–14"
                    className="w-full px-4 py-2.5 rounded-xl bg-emerald-900 border border-emerald-700 text-emerald-100 text-xs font-bold focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-amber-300 mb-1">Class Range (Optional)</label>
                  <input
                    type="text"
                    value={classRange}
                    onChange={(e) => setClassRange(e.target.value)}
                    placeholder="e.g. Class 5–7"
                    className="w-full px-4 py-2.5 rounded-xl bg-emerald-900 border border-emerald-700 text-emerald-100 text-xs font-bold focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-amber-300 mb-1">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Category eligibility rules..."
                  rows={2}
                  className="w-full px-4 py-2.5 rounded-xl bg-emerald-900 border border-emerald-700 text-emerald-100 text-xs focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div className="p-3 rounded-2xl bg-emerald-900/40 border border-emerald-800 space-y-2">
                <span className="text-xs font-bold text-emerald-200 block">Category Participation Rules</span>
                
                <div className="flex items-center justify-between text-xs">
                  <label className="flex items-center gap-2 text-emerald-300">
                    <input
                      type="checkbox"
                      checked={allowIndividual}
                      onChange={(e) => setAllowIndividual(e.target.checked)}
                      className="rounded accent-amber-400"
                    />
                    <span>Allow Individual Competitors</span>
                  </label>

                  <label className="flex items-center gap-2 text-emerald-300">
                    <input
                      type="checkbox"
                      checked={allowTeam}
                      onChange={(e) => setAllowTeam(e.target.checked)}
                      className="rounded accent-amber-400"
                    />
                    <span>Allow Team Competitors</span>
                  </label>
                </div>

                {allowTeam && (
                  <div className="pt-2">
                    <label className="block text-[11px] font-bold text-amber-400 mb-1">Max Team Size</label>
                    <input
                      type="number"
                      min={1}
                      value={maxTeamSize}
                      onChange={(e) => setMaxTeamSize(parseInt(e.target.value))}
                      className="w-full px-3 py-1.5 rounded-xl bg-emerald-900 border border-emerald-700 text-emerald-100 text-xs font-bold"
                    />
                  </div>
                )}
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-emerald-800">
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
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
