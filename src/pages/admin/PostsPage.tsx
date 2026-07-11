import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import type { Post } from '../../lib/types';
import { formatDate } from '../../lib/utils';
import { Plus, Edit2, Trash2, Search, ExternalLink, Eye } from 'lucide-react';

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');

  useEffect(() => {
    fetchPosts();
  }, []);

  async function fetchPosts() {
    setLoading(true);
    const { data, error } = await supabase
      .from('posts')
      .select('*, category:categories(*)')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setPosts(data as Post[]);
    }
    setLoading(false);
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this post? This action cannot be undone.')) return;

    const { error } = await supabase.from('posts').delete().eq('id', id);
    if (!error) {
      setPosts(current => current.filter(post => post.id !== id));
    } else {
      alert('Failed to delete post: ' + error.message);
    }
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || post.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">Manage your published and draft articles</p>
        </div>
        <Link
          to="/admin/posts/new"
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
        >
          <Plus size={16} /> New Post
        </Link>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-4 shadow-sm">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search posts by title..."
            className="w-full pl-10 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Statuses</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
      </div>

      {/* Table Card */}
      <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-16 text-gray-500 dark:text-gray-400">
            No posts match your filters or query.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <th className="px-6 py-4">Title</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Views</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700 text-sm text-gray-700 dark:text-gray-300">
                {filteredPosts.map((post) => (
                  <tr key={post.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {post.featured_image && (
                          <img
                            src={post.featured_image}
                            alt=""
                            className="w-10 h-10 rounded object-cover flex-shrink-0"
                          />
                        )}
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-800 dark:text-gray-100 truncate max-w-xs sm:max-w-sm lg:max-w-md">
                            {post.title}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            {post.featured && (
                              <span className="bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 text-[10px] font-bold px-1.5 py-0.5 rounded">
                                Featured
                              </span>
                            )}
                            {post.popular && (
                              <span className="bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400 text-[10px] font-bold px-1.5 py-0.5 rounded">
                                Popular
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {post.category ? (
                        <span
                          className="px-2 py-0.5 rounded-full text-xs font-semibold"
                          style={{
                            backgroundColor: post.category.color + '1A',
                            color: post.category.color,
                          }}
                        >
                          {post.category.name}
                        </span>
                      ) : (
                        <span className="text-gray-400 dark:text-gray-500">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="flex items-center gap-1">
                        <Eye size={14} className="text-gray-400" /> {post.views || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide ${
                          post.status === 'published'
                            ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                            : 'bg-gray-50 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {post.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500 dark:text-gray-400">
                      {post.published_at ? formatDate(post.published_at) : formatDate(post.created_at)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {post.status === 'published' && (
                          <a
                            href={`/blogs/${post.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 hover:text-gray-700 transition-colors"
                            title="View Public Link"
                          >
                            <ExternalLink size={14} />
                          </a>
                        )}
                        <Link
                          to={`/admin/posts/${post.id}/edit`}
                          className="p-1.5 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 hover:text-blue-700 transition-colors"
                          title="Edit Post"
                        >
                          <Edit2 size={14} />
                        </Link>
                        <button
                          onClick={() => handleDelete(post.id)}
                          className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 hover:text-red-700 transition-colors"
                          title="Delete Post"
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
