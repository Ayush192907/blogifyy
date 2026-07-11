import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Lock, Mail, AlertCircle } from 'lucide-react';
import { useSettings } from '../../hooks/useSettings';
import SEO from '../../components/common/SEO';

export default function LoginPage() {
  const { user, signIn } = useAuth();
  const { settings } = useSettings();
  const navigate = useNavigate();
  const siteName = settings?.site_name || 'Blogify';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      navigate('/admin', { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;
    setLoading(true);
    setError(null);

    const { error: signInError } = await signIn(email.trim(), password);

    if (signInError) {
      setError(signInError);
      setLoading(false);
    } else {
      navigate('/admin', { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <SEO title="Admin Login" robots="noindex, nofollow" />
      <div className="w-full max-w-md bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-lg p-8 space-y-6">
        <div className="text-center space-y-2 flex flex-col items-center">
          {settings?.logo_url ? (
            <img
              src={settings.logo_url}
              alt={siteName}
              className="object-contain w-auto h-auto max-w-[200px] max-h-[60px] select-none mb-2"
            />
          ) : (
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-md mb-2">
              <span className="text-white font-black text-xl">B</span>
            </div>
          )}
          <h1 className="text-2xl font-black text-gray-800 dark:text-white tracking-tight">Admin Portal</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Sign in to manage your {siteName}</p>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/30 text-red-600 dark:text-red-400 p-3 rounded-lg flex items-start gap-2.5 text-sm">
            <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label htmlFor="email" className="text-xs font-semibold text-gray-600 dark:text-gray-400">
              Email Address
            </label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                id="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 text-sm bg-gray-50 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="admin@blogify.com"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label htmlFor="password" className="text-xs font-semibold text-gray-600 dark:text-gray-400">
              Password
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                id="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 text-sm bg-gray-50 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-lg transition-colors shadow-sm disabled:opacity-60 flex items-center justify-center"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
