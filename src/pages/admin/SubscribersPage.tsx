import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import type { NewsletterSubscriber } from '../../lib/types';
import { formatDate } from '../../lib/utils';
import { Trash2, Search, Users } from 'lucide-react';

export default function SubscribersPage() {
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchSubscribers();
  }, []);

  async function fetchSubscribers() {
    setLoading(true);
    const { data } = await supabase
      .from('newsletter_subscribers')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setSubscribers(data as NewsletterSubscriber[]);
    setLoading(false);
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to remove this subscriber?')) return;

    const { error } = await supabase.from('newsletter_subscribers').delete().eq('id', id);
    if (!error) {
      setSubscribers(subs => subs.filter(s => s.id !== id));
    } else {
      alert('Error deleting subscriber: ' + error.message);
    }
  };

  const filteredSubs = subscribers.filter(sub =>
    sub.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Search Input */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-4 shadow-sm items-center">
        <div className="relative flex-1 w-full">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search subscribers by email..."
            className="w-full pl-10 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 flex items-center gap-1">
          <Users size={16} /> Total: {filteredSubs.length}
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredSubs.length === 0 ? (
          <div className="text-center py-16 text-gray-500 dark:text-gray-400">
            No subscribers match your search.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <th className="px-6 py-4">Subscriber Email</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Joined Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700 text-sm text-gray-700 dark:text-gray-300">
                {filteredSubs.map((sub) => (
                  <tr key={sub.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/20 transition-colors">
                    <td className="px-6 py-4 font-semibold text-gray-800 dark:text-gray-100">
                      {sub.email}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide ${
                          sub.active ?? true
                            ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                            : 'bg-gray-50 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
                        }`}
                      >
                        {(sub.active ?? true) ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500 dark:text-gray-400">
                      {formatDate(sub.created_at)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDelete(sub.id)}
                        className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 hover:text-red-700 transition-colors"
                        title="Remove Subscriber"
                      >
                        <Trash2 size={14} />
                      </button>
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
