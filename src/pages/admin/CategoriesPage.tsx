import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import type { Category } from '../../lib/types';
import { slugify } from '../../lib/utils';
import { Plus, Edit2, Trash2, Tag, Cpu, Briefcase, Coffee, Plane, Heart, BookOpen, Layers, CheckCircle2, XCircle } from 'lucide-react';

const ICONS: Record<string, React.ElementType> = {
  Cpu, Briefcase, Coffee, Plane, Heart, BookOpen, Layers, Tag,
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Selected for edit
  const [editingCat, setEditingCat] = useState<Category | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [icon, setIcon] = useState('Tag');
  const [color, setColor] = useState('#2563eb');
  const [description, setDescription] = useState('');

  // Visibility states
  const [showInHeader, setShowInHeader] = useState(true);
  const [showInFooter, setShowInFooter] = useState(true);
  const [sortOrder, setSortOrder] = useState(0);
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    setLoading(true);
    const { data } = await supabase.from('categories').select('*').order('sort_order', { ascending: true });
    if (data) setCategories(data as Category[]);
    setLoading(false);
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    if (!editingCat) {
      setSlug(slugify(val));
    }
  };

  const handleEditSelect = (cat: Category) => {
    setEditingCat(cat);
    setName(cat.name);
    setSlug(cat.slug);
    setIcon(cat.icon);
    setColor(cat.color);
    setDescription(cat.description || '');
    setShowInHeader(cat.show_in_header !== false);
    setShowInFooter(cat.show_in_footer !== false);
    setSortOrder(cat.sort_order || 0);
    setEnabled(cat.enabled !== false);
  };

  const handleCancelEdit = () => {
    setEditingCat(null);
    setName('');
    setSlug('');
    setIcon('Tag');
    setColor('#2563eb');
    setDescription('');
    setShowInHeader(true);
    setShowInFooter(true);
    setSortOrder(0);
    setEnabled(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !slug.trim()) return;
    setSaving(true);

    const payload = {
      name: name.trim(),
      slug: slug.trim(),
      icon,
      color,
      description: description.trim() || null,
      show_in_header: showInHeader,
      show_in_footer: showInFooter,
      sort_order: sortOrder,
      enabled,
    };

    if (editingCat) {
      const { error } = await supabase
        .from('categories')
        .update(payload)
        .eq('id', editingCat.id);

      if (error) {
        alert('Error updating category: ' + error.message);
      } else {
        fetchCategories();
        handleCancelEdit();
      }
    } else {
      const { error } = await supabase.from('categories').insert(payload);

      if (error) {
        alert('Error creating category: ' + error.message);
      } else {
        fetchCategories();
        setName('');
        setSlug('');
        setIcon('Tag');
        setColor('#2563eb');
        setDescription('');
        setShowInHeader(true);
        setShowInFooter(true);
        setSortOrder(0);
        setEnabled(true);
      }
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this category? All posts in this category will lose their category relation.')) return;

    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (!error) {
      setCategories(cats => cats.filter(c => c.id !== id));
      if (editingCat?.id === id) {
        handleCancelEdit();
      }
    } else {
      alert('Error deleting category: ' + error.message);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Category List Column */}
      <div className="lg:col-span-2 space-y-4">
        <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100 dark:border-gray-700">
            <h2 className="font-bold text-gray-800 dark:text-white text-base">All Categories</h2>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : categories.length === 0 ? (
            <p className="text-gray-500 text-center py-12">No categories found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">Slug</th>
                    <th className="px-6 py-4">Header</th>
                    <th className="px-6 py-4">Footer</th>
                    <th className="px-6 py-4">Enabled</th>
                    <th className="px-6 py-4">Sort</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700 text-sm text-gray-700 dark:text-gray-300">
                  {categories.map((cat) => {
                    const IconComp = ICONS[cat.icon] ?? Layers;
                    return (
                      <tr key={cat.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/20 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <span
                              className="w-4 h-4 rounded-full flex-shrink-0"
                              style={{ backgroundColor: cat.color }}
                            />
                            <div className="flex items-center gap-2">
                              <div
                                className="w-7 h-7 rounded-lg flex items-center justify-center"
                                style={{ backgroundColor: cat.color + '1A', color: cat.color }}
                              >
                                <IconComp size={14} />
                              </div>
                              <span className="font-semibold text-gray-800 dark:text-gray-100">{cat.name}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-xs font-mono text-gray-500 dark:text-gray-400">
                          {cat.slug}
                        </td>
                        <td className="px-6 py-4">
                          {cat.show_in_header !== false ? (
                            <CheckCircle2 size={16} className="text-green-500" />
                          ) : (
                            <XCircle size={16} className="text-gray-300 dark:text-gray-600" />
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {cat.show_in_footer !== false ? (
                            <CheckCircle2 size={16} className="text-green-500" />
                          ) : (
                            <XCircle size={16} className="text-gray-300 dark:text-gray-600" />
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {cat.enabled !== false ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                              Disabled
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400">
                          {cat.sort_order || 0}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleEditSelect(cat)}
                              className="p-1.5 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 hover:text-blue-700 transition-colors"
                              title="Edit Category"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              onClick={() => handleDelete(cat.id)}
                              className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 hover:text-red-700 transition-colors"
                              title="Delete Category"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Editor Form Column */}
      <div className="lg:col-span-1">
        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-5 shadow-sm space-y-4 sticky top-24"
        >
          <h3 className="font-bold text-gray-800 dark:text-white text-base border-b border-gray-100 dark:border-gray-700 pb-2">
            {editingCat ? 'Edit Category' : 'Create Category'}
          </h3>

          <div className="space-y-1">
            <label htmlFor="name" className="text-xs font-semibold text-gray-600 dark:text-gray-400">
              Name
            </label>
            <input
              type="text"
              id="name"
              required
              value={name}
              onChange={handleNameChange}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
              placeholder="e.g. Technology"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="slug" className="text-xs font-semibold text-gray-600 dark:text-gray-400">
              Slug
            </label>
            <input
              type="text"
              id="slug"
              required
              value={slug}
              onChange={(e) => setSlug(slugify(e.target.value))}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="technology"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="icon" className="text-xs font-semibold text-gray-600 dark:text-gray-400">
              Icon
            </label>
            <select
              id="icon"
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm focus:outline-none"
            >
              {Object.keys(ICONS).map(iconName => (
                <option key={iconName} value={iconName}>
                  {iconName}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label htmlFor="color" className="text-xs font-semibold text-gray-600 dark:text-gray-400">
              Color
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-8 h-8 p-0 rounded-lg cursor-pointer border-0"
              />
              <input
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="flex-1 px-3 py-1.5 bg-gray-50 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-xs font-mono focus:outline-none"
                placeholder="#000000"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label htmlFor="desc" className="text-xs font-semibold text-gray-600 dark:text-gray-400">
              Description
            </label>
            <textarea
              id="desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm focus:outline-none resize-none"
              placeholder="Short description..."
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="sortOrder" className="text-xs font-semibold text-gray-600 dark:text-gray-400">
              Sort Order
            </label>
            <input
              type="number"
              id="sortOrder"
              value={sortOrder}
              onChange={(e) => setSortOrder(parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm focus:outline-none"
            />
          </div>

          <div className="border-t border-gray-100 dark:border-gray-750 pt-3 space-y-2">
            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Visibility settings</p>

            <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 font-semibold cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showInHeader}
                onChange={(e) => setShowInHeader(e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              Show in Header Dropdown
            </label>

            <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 font-semibold cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showInFooter}
                onChange={(e) => setShowInFooter(e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              Show in Website Footer
            </label>

            <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 font-semibold cursor-pointer select-none">
              <input
                type="checkbox"
                checked={enabled}
                onChange={(e) => setEnabled(e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              Enabled / Active
            </label>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-lg transition-colors flex items-center justify-center gap-1 shadow-sm disabled:opacity-60"
            >
              <Plus size={16} /> {saving ? 'Saving...' : editingCat ? 'Update' : 'Add Category'}
            </button>
            {editingCat && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="px-4 py-2 border border-gray-200 dark:border-gray-600 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 font-semibold text-sm rounded-lg transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
