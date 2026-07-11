import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Linkedin, Youtube } from 'lucide-react';
import { useSettings } from '../../hooks/useSettings';
import { supabase } from '../../lib/supabase';
import AdSlot from '../ui/AdSlot';

export default function Footer() {
  const { settings } = useSettings();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const siteName = settings.site_name || 'Blogify';
  const footerAbout = settings.footer_about || `${siteName} is a modern blog template for sharing knowledge and ideas.`;

  const [footerCategories, setFooterCategories] = useState<{ label: string; href: string }[]>([]);

  useEffect(() => {
    // Fetch categories for footer
    supabase
      .from('categories')
      .select('*')
      .then(({ data, error }) => {
        if (!error && data) {
          const filtered = data
            .filter((c: any) => c.show_in_footer !== false && c.enabled !== false)
            .sort((a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
            .map((c: any) => ({
              label: c.name,
              href: `/category/${c.slug}`
            }));
          setFooterCategories(filtered);
        }
      });
  }, []);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus('loading');
    const { error } = await supabase.from('newsletter_subscribers').insert({ email: email.trim() });
    setStatus(error && error.code !== '23505' ? 'error' : 'success');
    if (!error || error.code === '23505') setEmail('');
  };

  const fixedPages = [
    { label: 'About Us', href: '/about' },
    { label: 'Blogs', href: '/blogs' },
    { label: 'Contact Us', href: '/contact' },
    { label: 'Privacy Policy', href: '/privacy-policy' },
    { label: 'Disclaimer', href: '/disclaimer' },
    { label: 'Terms & Conditions', href: '/terms-and-conditions' },
  ];

  const defaultCategories = [
    { label: 'Technology', href: '/category/technology' },
    { label: 'Business', href: '/category/business' },
    { label: 'Lifestyle', href: '/category/lifestyle' },
    { label: 'Travel', href: '/category/travel' },
    { label: 'Health', href: '/category/health' },
  ];

  const displayedCategories = footerCategories.length > 0 ? footerCategories : defaultCategories;

  return (
    <>
      <AdSlot slotName="footer_ad" className="py-4" />
      <footer className="bg-gray-900 text-gray-300 font-sans">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Brand */}
            <div>
              <Link to="/" className="flex items-center gap-2 mb-4">
                {settings?.logo_url ? (
                  <img
                    src={settings.logo_url}
                    alt={siteName}
                    className="object-contain w-auto h-auto max-w-[150px] max-h-[40px] sm:max-w-[180px] sm:max-h-[45px] lg:max-w-[200px] lg:max-h-[50px] select-none"
                  />
                ) : (
                  <>
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                      <span className="text-white font-black text-sm">B</span>
                    </div>
                    <span className="text-white font-black text-lg">{siteName}</span>
                  </>
                )}
              </Link>
              <p className="text-sm text-gray-400 leading-relaxed mb-4">{footerAbout}</p>
              <div className="flex items-center gap-3">
                {settings.social_facebook && (
                  <a href={settings.social_facebook} target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 transition-colors"><Facebook size={16} /></a>
                )}
                {settings.social_twitter && (
                  <a href={settings.social_twitter} target="_blank" rel="noopener noreferrer" className="hover:text-sky-400 transition-colors"><Twitter size={16} /></a>
                )}
                {settings.social_instagram && (
                  <a href={settings.social_instagram} target="_blank" rel="noopener noreferrer" className="hover:text-pink-400 transition-colors"><Instagram size={16} /></a>
                )}
                {settings.social_linkedin && (
                  <a href={settings.social_linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-blue-500 transition-colors"><Linkedin size={16} /></a>
                )}
                {settings.social_youtube && (
                  <a href={settings.social_youtube} target="_blank" rel="noopener noreferrer" className="hover:text-red-500 transition-colors"><Youtube size={16} /></a>
                )}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-white font-bold text-sm mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                {fixedPages.map(link => (
                  <li key={link.href}>
                    <Link to={link.href} className="hover:text-white hover:translate-x-1 transition-all inline-block">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Categories */}
            <div>
              <h4 className="text-white font-bold text-sm mb-4">Categories</h4>
              <ul className="space-y-2 text-sm">
                {displayedCategories.map(link => (
                  <li key={link.href}>
                    <Link to={link.href} className="hover:text-white hover:translate-x-1 transition-all inline-block">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Newsletter */}
            <div>
              <h4 className="text-white font-bold text-sm mb-4">Newsletter</h4>
              <p className="text-sm text-gray-400 mb-4">
                Subscribe to get the latest posts straight to your inbox.
              </p>
              {status === 'success' ? (
                <p className="text-green-400 text-sm font-medium">Thanks for subscribing!</p>
              ) : (
                <form onSubmit={handleSubscribe} className="flex gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    className="flex-1 px-3 py-2 text-sm bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-500"
                  />
                  <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors whitespace-nowrap disabled:opacity-60"
                  >
                    {status === 'loading' ? '...' : 'Subscribe'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-800">
          <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-500">
            <p>&copy; {new Date().getFullYear()} {siteName}. All Rights Reserved.</p>
            <div className="flex items-center gap-4">
              <Link to="/privacy-policy" className="hover:text-gray-300 transition-colors">Privacy</Link>
              <Link to="/terms-and-conditions" className="hover:text-gray-300 transition-colors">Terms</Link>
              <Link to="/disclaimer" className="hover:text-gray-300 transition-colors">Disclaimer</Link>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
