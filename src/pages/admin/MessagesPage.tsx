import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import type { ContactMessage } from '../../lib/types';
import { formatDate } from '../../lib/utils';
import { Trash2, Eye, Search, X, MailOpen } from 'lucide-react';

export default function MessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [activeMessage, setActiveMessage] = useState<ContactMessage | null>(null);

  useEffect(() => {
    fetchMessages();
  }, []);

  async function fetchMessages() {
    setLoading(true);
    const { data } = await supabase
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setMessages(data as ContactMessage[]);
    setLoading(false);
  }

  const handleOpenMessage = async (msg: ContactMessage) => {
    setActiveMessage(msg);

    if (!msg.read) {
      const { error } = await supabase
        .from('contact_messages')
        .update({ read: true })
        .eq('id', msg.id);

      if (!error) {
        setMessages(current =>
          current.map(m => (m.id === msg.id ? { ...m, read: true } : m))
        );
      }
    }
  };

  const handleCloseMessage = () => {
    setActiveMessage(null);
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // prevent modal opening
    if (!window.confirm('Are you sure you want to delete this message?')) return;

    const { error } = await supabase.from('contact_messages').delete().eq('id', id);
    if (!error) {
      setMessages(current => current.filter(m => m.id !== id));
      if (activeMessage?.id === id) {
        setActiveMessage(null);
      }
    } else {
      alert('Error deleting message: ' + error.message);
    }
  };

  const filteredMessages = messages.filter(m => {
    const term = searchQuery.toLowerCase();
    return (
      m.name.toLowerCase().includes(term) ||
      m.email.toLowerCase().includes(term) ||
      (m.subject && m.subject.toLowerCase().includes(term))
    );
  });

  return (
    <div className="space-y-6">
      {/* Search Input */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-4 shadow-sm">
        <div className="relative flex-1 w-full">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search messages by sender, email or subject..."
            className="w-full pl-10 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Messages Table Card */}
      <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredMessages.length === 0 ? (
          <div className="text-center py-16 text-gray-500 dark:text-gray-400">
            No contact messages found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <th className="px-6 py-4">Sender</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Subject</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700 text-sm text-gray-700 dark:text-gray-300">
                {filteredMessages.map((msg) => (
                  <tr
                    key={msg.id}
                    onClick={() => handleOpenMessage(msg)}
                    className="hover:bg-gray-50/50 dark:hover:bg-gray-700/20 transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {!msg.read && (
                          <span className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0" title="Unread" />
                        )}
                        <span className={`font-semibold ${!msg.read ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                          {msg.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-mono text-gray-500 dark:text-gray-400">
                      {msg.email}
                    </td>
                    <td className={`px-6 py-4 max-w-xs truncate ${!msg.read ? 'font-bold text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>
                      {msg.subject || '(No Subject)'}
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500 dark:text-gray-400">
                      {formatDate(msg.created_at)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleOpenMessage(msg); }}
                          className="p-1.5 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 hover:text-blue-700 transition-colors"
                          title="Read Message"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={(e) => handleDelete(msg.id, e)}
                          className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 hover:text-red-700 transition-colors"
                          title="Delete Message"
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

      {/* Message Modal */}
      {activeMessage && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl w-full max-w-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-700/30">
              <div className="flex items-center gap-2 text-blue-600">
                <MailOpen size={20} />
                <h3 className="font-bold text-gray-800 dark:text-white text-base">Contact Message Details</h3>
              </div>
              <button
                onClick={handleCloseMessage}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm bg-gray-50 dark:bg-gray-900/20 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                <div>
                  <p className="text-xs text-gray-400 font-semibold uppercase">From</p>
                  <p className="font-bold text-gray-700 dark:text-gray-200 mt-1">{activeMessage.name}</p>
                  <p className="text-xs font-mono text-gray-500 mt-0.5">{activeMessage.email}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-semibold uppercase">Date Received</p>
                  <p className="text-gray-700 dark:text-gray-200 mt-1">{formatDate(activeMessage.created_at)}</p>
                </div>
              </div>

              <div>
                <p className="text-xs text-gray-400 font-semibold uppercase mb-1">Subject</p>
                <p className="font-bold text-gray-800 dark:text-white text-base">
                  {activeMessage.subject || '(No Subject)'}
                </p>
              </div>

              <div className="border-t border-gray-100 dark:border-gray-700 pt-4">
                <p className="text-xs text-gray-400 font-semibold uppercase mb-2">Message</p>
                <div className="bg-gray-50 dark:bg-gray-900/30 p-4 rounded-xl border border-gray-100 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                  {activeMessage.message}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30 flex justify-end gap-2">
              <button
                onClick={(e) => { const id = activeMessage.id; handleCloseMessage(); handleDelete(id, e as any); }}
                className="px-4 py-2 border border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900/40 dark:hover:bg-red-900/10 font-semibold text-sm rounded-lg transition-colors flex items-center gap-1.5"
              >
                <Trash2 size={14} /> Delete
              </button>
              <button
                onClick={handleCloseMessage}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
