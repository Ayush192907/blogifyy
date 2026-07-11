import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import type { Page } from '../../lib/types';
import { Plus, Edit2, Trash2, BookOpen, ExternalLink, CheckCircle2, XCircle } from 'lucide-react';

export default function PagesPage() {
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPages();
  }, []);

  async function fetchPages() {
    setLoading(true);
    const { data } = await supabase
      .from('pages')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false });
    if (data) setPages(data as Page[]);
    setLoading(false);
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this static page?')) return;

    const { error } = await supabase.from('pages').delete().eq('id', id);
    if (!error) {
      setPages(current => current.filter(p => p.id !== id));
    } else {
      alert('Error deleting page: ' + error.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <p className="text-xs text-gray-500 dark:text-gray-400">Manage static text and information pages</p>
        <Link
          to="/admin/pages/new"
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
        >
          <Plus size={16} /> New Page
        </Link>
      </div>

      {/* Pages Card */}
      <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : pages.length === 0 ? (
          <div className="text-center py-16 text-gray-500 dark:text-gray-400">No static pages found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <th className="px-6 py-4">Title</th>
                  <th className="px-6 py-4">Slug</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Header</th>
                  <th className="px-6 py-4">Footer</th>
                  <th className="px-6 py-4">Enabled</th>
                  <th className="px-6 py-4">Sort</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700 text-sm text-gray-700 dark:text-gray-300">
                {pages.map((page) => (
                  <tr key={page.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2.5">
                        <BookOpen size={16} className="text-gray-400" />
                        <span className="font-semibold text-gray-800 dark:text-gray-100">{page.title}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-mono text-gray-500 dark:text-gray-400">
                      /{page.slug}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide ${
                          page.status === 'published'
                            ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                            : 'bg-gray-50 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {page.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {page.show_in_header ? (
                        <div className="flex flex-col gap-0.5">
                          <CheckCircle2 size={16} className="text-green-500" />
                          {page.header_label && <span className="text-[10px] text-gray-400 font-semibold">{page.header_label}</span>}
                        </div>
                      ) : (
                        <XCircle size={16} className="text-gray-300 dark:text-gray-600" />
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {page.show_in_footer ? (
                        <div className="flex flex-col gap-0.5">
                          <CheckCircle2 size={16} className="text-green-500" />
                          {page.footer_label && <span className="text-[10px] text-gray-400 font-semibold">{page.footer_label}</span>}
                        </div>
                      ) : (
                        <XCircle size={16} className="text-gray-300 dark:text-gray-600" />
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {page.enabled !== false ? (
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
                      {page.sort_order || 0}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {page.status === 'published' && page.enabled !== false && (
                          <a
                            href={`/${page.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 hover:text-gray-700 transition-colors"
                            title="View Public Link"
                          >
                            <ExternalLink size={14} />
                          </a>
                        )}
                        <Link
                          to={`/admin/pages/${page.id}/edit`}
                          className="p-1.5 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 hover:text-blue-700 transition-colors"
                          title="Edit Page"
                        >
                          <Edit2 size={14} />
                        </Link>
                        <button
                          onClick={() => handleDelete(page.id)}
                          className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 hover:text-red-700 transition-colors"
                          title="Delete Page"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
