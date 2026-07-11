import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import type { Page } from '../../lib/types';
import { slugify } from '../../lib/utils';
import RichTextEditor from '../../components/admin/RichTextEditor';
import { Save, ArrowLeft, Settings as SettingsIcon } from 'lucide-react';

export default function CreateEditPagePage() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [content, setContent] = useState('');
  const [status, setStatus] = useState<'draft' | 'published'>('draft');
  const [showInMenu, setShowInMenu] = useState(false);
  const [menuLabel, setMenuLabel] = useState('');
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');

  // New Header & Footer Visibility Settings
  const [showInHeader, setShowInHeader] = useState(false);
  const [showInFooter, setShowInFooter] = useState(false);
  const [headerLabel, setHeaderLabel] = useState('');
  const [footerLabel, setFooterLabel] = useState('');
  const [sortOrder, setSortOrder] = useState(0);
  const [enabled, setEnabled] = useState(true);

  // Auto-slug generation control
  const [autoSlug, setAutoSlug] = useState(!isEdit);

  useEffect(() => {
    if (isEdit) {
      fetchPage();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function fetchPage() {
    if (!id) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('pages')
      .select('*')
      .eq('id', id)
      .single();

    if (!error && data) {
      const p = data as Page;
      setTitle(p.title);
      slugify(p.slug);
      setSlug(p.slug);
      setContent(p.content || '');
      setStatus(p.status);
      setShowInMenu(p.show_in_menu || false);
      setMenuLabel(p.menu_label || '');
      setMetaTitle(p.meta_title || '');
      setMetaDescription(p.meta_description || '');

      setShowInHeader(p.show_in_header || false);
      setShowInFooter(p.show_in_footer || false);
      setHeaderLabel(p.header_label || '');
      setFooterLabel(p.footer_label || '');
      setSortOrder(p.sort_order || 0);
      setEnabled(p.enabled !== false);
      setAutoSlug(false);
    } else {
      alert('Error fetching page: ' + (error?.message || 'unknown error'));
      navigate('/admin/pages');
    }
    setLoading(false);
  }

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    if (autoSlug) {
      setSlug(slugify(val));
    }
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSlug(slugify(e.target.value));
    setAutoSlug(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !slug.trim()) {
      alert('Title and Slug are required.');
      return;
    }

    setSaving(true);

    const payload: Partial<Page> = {
      title: title.trim(),
      slug: slug.trim(),
      content: content.trim() || null,
      status,
      show_in_menu: showInMenu,
      menu_label: showInMenu ? (menuLabel.trim() || title.trim()) : null,
      meta_title: metaTitle.trim() || null,
      meta_description: metaDescription.trim() || null,
      show_in_header: showInHeader,
      show_in_footer: showInFooter,
      header_label: showInHeader ? (headerLabel.trim() || title.trim()) : null,
      footer_label: showInFooter ? (footerLabel.trim() || title.trim()) : null,
      sort_order: sortOrder,
      enabled,
      updated_at: new Date().toISOString(),
    };

    let result;
    if (isEdit && id) {
      result = await supabase
        .from('pages')
        .update(payload)
        .eq('id', id);
    } else {
      result = await supabase
        .from('pages')
        .insert(payload);
    }

    if (result.error) {
      alert('Error saving page: ' + result.error.message);
    } else {
      navigate('/admin/pages');
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between gap-4">
        <Link
          to="/admin/pages"
          className="flex items-center gap-1 text-sm font-semibold text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white"
        >
          <ArrowLeft size={16} /> Back to Pages
        </Link>
        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-lg transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-60"
        >
          <Save size={16} /> {saving ? 'Saving...' : 'Save Page'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Editor Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-6 shadow-sm space-y-4">
            <h2 className="font-bold text-gray-800 dark:text-white text-base">Page Editor</h2>

            <div className="space-y-1">
              <label htmlFor="title" className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                Page Title
              </label>
              <input
                type="text"
                id="title"
                required
                value={title}
                onChange={handleTitleChange}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                placeholder="e.g. About Us"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="slug" className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                URL Slug
              </label>
              <input
                type="text"
                id="slug"
                required
                value={slug}
                onChange={handleSlugChange}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs font-mono"
                placeholder="about-us"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                Page Content
              </label>
              <RichTextEditor value={content} onChange={setContent} />
            </div>
          </div>

          {/* SEO Section */}
          <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-gray-800 dark:text-white text-sm flex items-center gap-1.5 border-b border-gray-100 dark:border-gray-700 pb-2">
              <SettingsIcon size={16} /> SEO Configuration
            </h3>

            <div className="space-y-1">
              <label htmlFor="metaTitle" className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                Meta Title
              </label>
              <input
                type="text"
                id="metaTitle"
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                placeholder="Search engine title tag"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="metaDescription" className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                Meta Description
              </label>
              <textarea
                id="metaDescription"
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
                placeholder="Meta description search snippet..."
              />
            </div>
          </div>
        </div>

        {/* Sidebar settings Column */}
        <div className="space-y-6 lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-gray-800 dark:text-white text-base border-b border-gray-100 dark:border-gray-700 pb-2">
              Page Settings
            </h3>

            <div className="space-y-1">
              <label htmlFor="status" className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                Status
              </label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm focus:outline-none"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>

            {/* Sort Order */}
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

            {/* Enabled toggle */}
            <div className="flex items-center gap-2 pt-1">
              <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 font-semibold cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={enabled}
                  onChange={(e) => setEnabled(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                Enabled (Publicly Accessible)
              </label>
            </div>

            <div className="border-t border-gray-100 dark:border-gray-750 pt-4 space-y-4">
              <p className="text-xs font-bold text-gray-500 dark:text-gray-400">Visibility & Labels</p>

              {/* Show in Header toggle */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 font-semibold cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={showInHeader}
                    onChange={(e) => setShowInHeader(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  Show in Website Header
                </label>
                {showInHeader && (
                  <div className="space-y-1 pl-6">
                    <label htmlFor="headerLabel" className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                      Header Link Label
                    </label>
                    <input
                      type="text"
                      id="headerLabel"
                      value={headerLabel}
                      onChange={(e) => setHeaderLabel(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm focus:outline-none"
                      placeholder="Defaults to title"
                    />
                  </div>
                )}
              </div>

              {/* Show in Footer toggle */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 font-semibold cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={showInFooter}
                    onChange={(e) => setShowInFooter(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  Show in Website Footer
                </label>
                {showInFooter && (
                  <div className="space-y-1 pl-6">
                    <label htmlFor="footerLabel" className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                      Footer Link Label
                    </label>
                    <input
                      type="text"
                      id="footerLabel"
                      value={footerLabel}
                      onChange={(e) => setFooterLabel(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm focus:outline-none"
                      placeholder="Defaults to title"
                    />
                  </div>
                )}
              </div>

              {/* Deprecated menu toggle (kept internally to prevent db sync crash but hidden) */}
              <div className="hidden">
                <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showInMenu}
                    onChange={(e) => setShowInMenu(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  Show in menu
                </label>
                <input
                  type="text"
                  value={menuLabel}
                  onChange={(e) => setMenuLabel(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
