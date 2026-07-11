import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Post } from '../../lib/types';
import PublicLayout from '../../components/layout/PublicLayout';
import Sidebar from '../../components/layout/Sidebar';
import AdSlot from '../../components/ui/AdSlot';
import PostCard from '../../components/ui/PostCard';
import Pagination from '../../components/ui/Pagination';
import SEO from '../../components/common/SEO';

const POSTS_PER_PAGE = 8;

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setPage(1);
  }, [query]);

  useEffect(() => {
    if (!query) {
      setPosts([]);
      setTotal(0);
      setLoading(false);
      return;
    }

    setLoading(true);
    const from = (page - 1) * POSTS_PER_PAGE;
    const to = from + POSTS_PER_PAGE - 1;

    supabase
      .from('posts')
      .select('*, category:categories(*)', { count: 'exact' })
      .eq('status', 'published')
      .or(`title.ilike.%${query}%,excerpt.ilike.%${query}%,content.ilike.%${query}%`)
      .order('published_at', { ascending: false })
      .range(from, to)
      .then(({ data, count }) => {
        setPosts((data as Post[]) || []);
        setTotal(count ?? 0);
        setLoading(false);
      });
  }, [query, page]);

  const totalPages = Math.ceil(total / POSTS_PER_PAGE);

  return (
    <PublicLayout>
      <SEO 
        title={`Search Results for "${query}" - Page ${page}`}
        description={`Search results matching: ${query}.`}
        robots="noindex, nofollow"
      />
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex justify-center mb-6">
          <AdSlot slotName="top_leaderboard" className="w-full max-w-3xl" />
        </div>

        {/* Breadcrumb */}
        <nav className="flex items-center gap-1 text-xs text-gray-400 mb-4">
          <Link to="/" className="hover:text-blue-600">Home</Link>
          <ChevronRight size={12} />
          <span className="text-gray-600 dark:text-gray-400">Search Results</span>
        </nav>

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            Search Results for "{query}"
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{total} articles found</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 min-w-0 space-y-4">
            {loading ? (
              [...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
              ))
            ) : posts.length === 0 ? (
              <p className="text-gray-500 text-center py-12">No articles match your search.</p>
            ) : (
              posts.map(post => <PostCard key={post.id} post={post} variant="horizontal" />)
            )}

            <div className="flex justify-center">
              <AdSlot slotName="in_content_1" className="w-full" />
            </div>

            <Pagination currentPage={page} totalPages={totalPages} onPageChange={p => { setPage(p); window.scrollTo(0, 0); }} />
          </div>
          <div className="w-full lg:w-80 flex-shrink-0">
            <Sidebar />
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
