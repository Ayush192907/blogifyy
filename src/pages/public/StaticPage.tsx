import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Page } from '../../lib/types';
import PublicLayout from '../../components/layout/PublicLayout';
import Sidebar from '../../components/layout/Sidebar';
import AdSlot from '../../components/ui/AdSlot';
import SEO from '../../components/common/SEO';

interface StaticPageProps {
  slug?: string;
}

export default function StaticPage({ slug }: StaticPageProps) {
  const { slug: paramSlug } = useParams<{ slug: string }>();
  const pageSlug = slug || paramSlug || '';
  const [pageData, setPageData] = useState<Page | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!pageSlug) return;
    setLoading(true);

    supabase
      .from('pages')
      .select('*')
      .eq('slug', pageSlug)
      .eq('status', 'published')
      .single()
      .then(({ data }) => {
        setPageData(data as Page | null);
        setLoading(false);
      });
  }, [pageSlug]);

  const siteUrl = import.meta.env.VITE_SITE_URL || 'http://localhost:5174';
  const pageSchema = pageData ? {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    'name': pageData.title,
    'description': pageData.meta_description || pageData.title,
    'url': `${siteUrl}/${pageData.slug}`,
    'breadcrumb': {
      '@type': 'BreadcrumbList',
      'itemListElement': [
        {
          '@type': 'ListItem',
          'position': 1,
          'name': 'Home',
          'item': siteUrl
        },
        {
          '@type': 'ListItem',
          'position': 2,
          'name': pageData.title,
          'item': `${siteUrl}/${pageData.slug}`
        }
      ]
    }
  } : undefined;

  return (
    <PublicLayout>
      {pageData && (
        <SEO 
          title={pageData.meta_title || pageData.title}
          description={pageData.meta_description || undefined}
          schemaJson={pageSchema}
        />
      )}
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        <div className="flex justify-center">
          <AdSlot slotName="top_leaderboard" className="w-full max-w-3xl" />
        </div>

        {loading ? (
          <div className="flex gap-8">
            <div className="flex-1 space-y-4">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4 animate-pulse" />
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-2/3 animate-pulse" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full animate-pulse" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full animate-pulse" />
            </div>
            <div className="hidden lg:block w-80 h-96 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
          </div>
        ) : !pageData ? (
          <div className="text-center py-16">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Page Not Found</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-2">The page you requested could not be found.</p>
            <Link to="/" className="inline-block mt-4 text-blue-600 font-semibold hover:underline">Go back home</Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Main Content */}
            <article className="flex-1 min-w-0 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-5 sm:p-8 space-y-6 shadow-sm">
              {/* Breadcrumb */}
              <nav className="flex items-center gap-1 text-xs text-gray-400">
                <Link to="/" className="hover:text-blue-600">Home</Link>
                <ChevronRight size={12} />
                <span className="text-gray-600 dark:text-gray-400">{pageData.title}</span>
              </nav>

              <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white leading-tight">
                {pageData.title}
              </h1>

              <div
                className="prose dark:prose-invert max-w-none prose-sm sm:prose-base dark:text-gray-300 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: pageData.content || '' }}
              />
            </article>

            {/* Sidebar */}
            <div className="w-full lg:w-80 flex-shrink-0">
              <Sidebar />
            </div>
          </div>
        )}
      </div>
    </PublicLayout>
  );
}
