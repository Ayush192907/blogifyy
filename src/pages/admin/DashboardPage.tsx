import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import type { Post, ContactMessage } from '../../lib/types';
import { formatDate } from '../../lib/utils';
import { FileText, Eye, Tags, Users, MessageSquare, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    posts: 0,
    views: 0,
    categories: 0,
    subscribers: 0,
    messages: 0,
  });
  const [recentPosts, setRecentPosts] = useState<Post[]>([]);
  const [recentMessages, setRecentMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      setLoading(true);

      // Fetch count of posts and views sum
      const { data: postsData } = await supabase.from('posts').select('views');
      const postsCount = postsData?.length ?? 0;
      const viewsCount = postsData?.reduce((sum, p) => sum + (p.views || 0), 0) ?? 0;

      // Fetch count of categories
      const { count: catCount } = await supabase
        .from('categories')
        .select('id', { count: 'exact', head: true });

      // Fetch count of subscribers
      const { count: subCount } = await supabase
        .from('newsletter_subscribers')
        .select('id', { count: 'exact', head: true });

      // Fetch count of messages
      const { count: msgCount } = await supabase
        .from('contact_messages')
        .select('id', { count: 'exact', head: true });

      setStats({
        posts: postsCount,
        views: viewsCount,
        categories: catCount ?? 0,
        subscribers: subCount ?? 0,
        messages: msgCount ?? 0,
      });

      // Fetch latest 5 posts
      const { data: latestPosts } = await supabase
        .from('posts')
        .select('*, category:categories(*)')
        .order('created_at', { ascending: false })
        .limit(5);
      setRecentPosts((latestPosts as Post[]) || []);

      // Fetch latest 5 messages
      const { data: latestMsgs } = await supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);
      setRecentMessages((latestMsgs as ContactMessage[]) || []);

      setLoading(false);
    }

    loadDashboardData();
  }, []);

  const handleMarkAsRead = async (id: string) => {
    const { error } = await supabase
      .from('contact_messages')
      .update({ read: true })
      .eq('id', id);

    if (!error) {
      setRecentMessages(msgs =>
        msgs.map(m => (m.id === id ? { ...m, read: true } : m))
      );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const statCards = [
    { label: 'Total Posts', value: stats.posts, icon: FileText, color: 'bg-blue-500' },
    { label: 'Total Views', value: stats.views, icon: Eye, color: 'bg-emerald-500' },
    { label: 'Categories', value: stats.categories, icon: Tags, color: 'bg-amber-500' },
    { label: 'Subscribers', value: stats.subscribers, icon: Users, color: 'bg-violet-500' },
    { label: 'Messages', value: stats.messages, icon: MessageSquare, color: 'bg-rose-500' },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-5 flex items-center gap-4 shadow-sm"
            >
              <div className={`w-10 h-10 ${card.color} text-white rounded-lg flex items-center justify-center`}>
                <Icon size={20} />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{card.label}</p>
                <p className="text-xl font-bold text-gray-800 dark:text-white mt-0.5">{card.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Posts */}
        <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-gray-800 dark:text-white text-base">Recent Posts</h2>
            <Link
              to="/admin/posts"
              className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
            >
              View All <ArrowRight size={12} />
            </Link>
          </div>

          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {recentPosts.map((post) => (
              <div key={post.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 line-clamp-1">
                    {post.title}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {post.published_at ? formatDate(post.published_at) : formatDate(post.created_at)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide ${
                      post.status === 'published'
                        ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                        : 'bg-gray-50 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {post.status.toUpperCase()}
                  </span>
                  <span className="text-xs font-semibold text-gray-500 flex items-center gap-1">
                    <Eye size={12} /> {post.views || 0}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Messages */}
        <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-gray-800 dark:text-white text-base">Recent Messages</h2>
            <Link
              to="/admin/messages"
              className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
            >
              View All <ArrowRight size={12} />
            </Link>
          </div>

          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {recentMessages.length === 0 ? (
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center py-6">No messages found.</p>
            ) : (
              recentMessages.map((msg) => (
                <div key={msg.id} className="py-3 first:pt-0 last:pb-0 flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                      {msg.name}
                      {!msg.read && (
                        <span className="w-1.5 h-1.5 bg-blue-600 rounded-full" title="Unread" />
                      )}
                    </h3>
                    <p className="text-xs text-gray-600 dark:text-gray-300 font-medium line-clamp-1 mt-0.5">
                      {msg.subject || '(No Subject)'}
                    </p>
                    <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1">{formatDate(msg.created_at)}</p>
                  </div>
                  {!msg.read && (
                    <button
                      onClick={() => handleMarkAsRead(msg.id)}
                      className="px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-[10px] font-semibold rounded hover:bg-blue-100 transition-colors flex-shrink-0"
                    >
                      Mark Read
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
