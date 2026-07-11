import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, Moon, Sun, Menu, X, ChevronDown } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useSettings } from '../../hooks/useSettings';
import { supabase } from '../../lib/supabase';
import type { Category } from '../../lib/types';

export default function Header() {
  const { dark, toggle } = useTheme();
  const { settings } = useSettings();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [mobileCategoriesOpen, setMobileCategoriesOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const searchRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchCategories() {
      const { data, error } = await supabase
        .from('categories')
        .select('*');
      if (!error && data) {
        const filtered = data
          .filter((cat: any) => {
            const show = cat.show_in_header !== false; // default true
            const active = cat.enabled !== false;       // default true
            return show && active;
          })
          .sort((a: any, b: any) => {
            const orderA = a.sort_order ?? 0;
            const orderB = b.sort_order ?? 0;
            return orderA - orderB;
          });
        setCategories(filtered);
      }
    }
    fetchCategories();
  }, []);

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  useEffect(() => {
    setMobileOpen(false);
    setCategoriesOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setCategoriesOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      setSearchOpen(false);
      setQuery('');
    }
  };

  const siteName = settings.site_name || 'Blogify';

  const isCategoryActive = location.pathname.startsWith('/category/');

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
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
                <span className="text-xl font-black text-gray-800 dark:text-white tracking-tight">{siteName}</span>
              </>
            )}
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            <Link
              to="/"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                location.pathname === '/'
                  ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20'
                  : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              Home
            </Link>

            {/* Categories Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setCategoriesOpen(!categoriesOpen)}
                className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isCategoryActive
                    ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20'
                    : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                Category
                <ChevronDown size={16} className={`transition-transform ${categoriesOpen ? 'rotate-180' : ''}`} />
              </button>
              {categoriesOpen && (
                <div className="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
                  {categories.map(cat => (
                    <Link
                      key={cat.id}
                      to={`/category/${cat.slug}`}
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link
              to="/blogs"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                location.pathname === '/blogs'
                  ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20'
                  : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              Blogs
            </Link>

            <Link
              to="/about"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                location.pathname === '/about'
                  ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20'
                  : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              About Us
            </Link>

            <Link
              to="/contact"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                location.pathname === '/contact'
                  ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20'
                  : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              Contact Us
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-1">
            {searchOpen ? (
              <form onSubmit={handleSearch} className="flex items-center">
                <input
                  ref={searchRef}
                  type="text"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Search..."
                  className="w-40 sm:w-52 px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400"
                >
                  <X size={16} />
                </button>
              </form>
            ) : (
              <button
                onClick={() => setSearchOpen(true)}
                className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title="Search"
              >
                <Search size={18} />
              </button>
            )}
            <button
              onClick={toggle}
              className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title={dark ? 'Light mode' : 'Dark mode'}
            >
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button
              onClick={() => setMobileOpen(o => !o)}
              className="lg:hidden p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <nav className="lg:hidden border-t border-gray-100 dark:border-gray-700 py-3 space-y-1">
            <Link
              to="/"
              className={`block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                location.pathname === '/'
                  ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20'
                  : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              Home
            </Link>

            {/* Mobile Categories */}
            <div>
              <button
                onClick={() => setMobileCategoriesOpen(!mobileCategoriesOpen)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isCategoryActive
                    ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20'
                    : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                Category
                <ChevronDown size={16} className={`transition-transform ${mobileCategoriesOpen ? 'rotate-180' : ''}`} />
              </button>
              {mobileCategoriesOpen && (
                <div className="ml-4 mt-1 space-y-1">
                  {categories.map(cat => (
                    <Link
                      key={cat.id}
                      to={`/category/${cat.slug}`}
                      className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                        location.pathname === `/category/${cat.slug}`
                          ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20'
                          : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link
              to="/blogs"
              className={`block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                location.pathname === '/blogs'
                  ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20'
                  : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              Blogs
            </Link>

            <Link
              to="/about"
              className={`block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                location.pathname === '/about'
                  ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20'
                  : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              About Us
            </Link>

            <Link
              to="/contact"
              className={`block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                location.pathname === '/contact'
                  ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20'
                  : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              Contact Us
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
