import { useState } from 'react';
import { Link, useLocation, Navigate } from 'react-router-dom';
import {
  LayoutDashboard, FileText, Plus, Tags, BookOpen, Megaphone,
  Settings, Users, MessageSquare, LogOut, Menu, X, Globe,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useSettings } from '../../hooks/useSettings';
import SEO from '../common/SEO';

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'All Posts', href: '/admin/posts', icon: FileText },
  { label: 'New Post', href: '/admin/posts/new', icon: Plus },
  { label: 'Categories', href: '/admin/categories', icon: Tags },
  { label: 'Pages', href: '/admin/pages', icon: BookOpen },
  { label: 'Ads Manager', href: '/admin/ads', icon: Megaphone },
  { label: 'Subscribers', href: '/admin/subscribers', icon: Users },
  { label: 'Messages', href: '/admin/messages', icon: MessageSquare },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
];

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export default function AdminLayout({ children, title }: AdminLayoutProps) {
  const { user, signOut, loading } = useAuth();
  const { settings } = useSettings();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return <Navigate to="/admin/login" replace />;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      <SEO title={title ? `${title} - Admin Dashboard` : 'Admin Dashboard'} robots="noindex, nofollow" />
      {/* Sidebar overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full w-60 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700
        z-40 flex flex-col transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Brand */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-700">
          <Link to="/admin" className="flex items-center gap-2">
            {settings?.logo_url ? (
              <img
                src={settings.logo_url}
                alt={settings.site_name || 'Blogify'}
                className="object-contain w-auto h-auto max-w-[120px] max-h-[36px] select-none"
              />
            ) : (
              <>
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-black text-sm">B</span>
                </div>
                <span className="font-black text-gray-800 dark:text-white text-lg">{settings.site_name || 'Blogify'}</span>
              </>
            )}
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-400 hover:text-gray-600"
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
          {NAV_ITEMS.map(item => {
            const Icon = item.icon;
            let active = false;
            const path = location.pathname;

            if (item.href === '/admin') {
              active = path === '/admin';
            } else if (item.href === '/admin/posts') {
              active = path === '/admin/posts' || (path.startsWith('/admin/posts/') && path.endsWith('/edit'));
            } else if (item.href === '/admin/posts/new') {
              active = path === '/admin/posts/new';
            } else if (item.href === '/admin/pages') {
              active = path === '/admin/pages' || path.startsWith('/admin/pages/') || path === '/admin/pages/new';
            } else {
              active = path === item.href;
            }

            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group
                  ${active
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-800 dark:hover:text-gray-200'
                  }
                `}
              >
                <Icon size={16} />
                {item.label}
                {active && <ChevronRight size={14} className="ml-auto" />}
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="p-3 border-t border-gray-100 dark:border-gray-700 space-y-1">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <Globe size={16} /> View Site
          </a>
          <button
            onClick={() => signOut()}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 lg:ml-60 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-1.5 text-gray-500 hover:text-gray-700"
            >
              <Menu size={20} />
            </button>
            {title && (
              <h1 className="text-base font-bold text-gray-800 dark:text-white">{title}</h1>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <div className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">A</span>
            </div>
            <span className="hidden sm:block">{user.email}</span>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
