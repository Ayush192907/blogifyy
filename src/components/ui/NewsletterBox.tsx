import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Mail } from 'lucide-react';

export default function NewsletterBox() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus('loading');

    const { error } = await supabase
      .from('newsletter_subscribers')
      .insert({ email: email.trim() });

    // Handle unique constraint violation (already subscribed) as success
    if (error && error.code !== '23505') {
      setStatus('error');
    } else {
      setStatus('success');
      setEmail('');
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-5">
      <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg flex items-center justify-center mb-3">
        <Mail size={20} />
      </div>
      <h3 className="font-bold text-gray-800 dark:text-gray-100 text-sm mb-1">
        Subscribe to Newsletter
      </h3>
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 leading-relaxed">
        Get the latest articles, guides and insights sent straight to your inbox.
      </p>

      {status === 'success' ? (
        <div className="bg-green-50 dark:bg-green-900/10 text-green-600 dark:text-green-400 text-xs font-semibold p-3 rounded-lg text-center">
          Thanks for subscribing! Check your inbox soon.
        </div>
      ) : (
        <form onSubmit={handleSubscribe} className="space-y-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your email address"
            required
            className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-60"
          >
            {status === 'loading' ? 'Subscribing...' : 'Subscribe Now'}
          </button>
          {status === 'error' && (
            <p className="text-[10px] text-red-500 text-center">
              An error occurred. Please try again.
            </p>
          )}
        </form>
      )}
    </div>
  );
}
