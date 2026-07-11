import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import type { Post } from '../../lib/types';
import PublicLayout from '../../components/layout/PublicLayout';
import Sidebar from '../../components/layout/Sidebar';
import AdSlot from '../../components/ui/AdSlot';
import PostCard from '../../components/ui/PostCard';
import Pagination from '../../components/ui/Pagination';
import SEO from '../../components/common/SEO';

const POSTS_PER_PAGE = 8;

export default function BlogPage() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        const from = (page - 1) * POSTS_PER_PAGE;
        supabase
            .from('posts')
            .select('*, category:categories(*)', { count: 'exact' })
            .eq('status', 'published')
            .order('published_at', { ascending: false })
            .range(from, from + POSTS_PER_PAGE - 1)
            .then(({ data, count }) => {
                setPosts((data as Post[]) || []);
                setTotal(count ?? 0);
                setLoading(false);
            });
    }, [page]);

    const totalPages = Math.ceil(total / POSTS_PER_PAGE);
    const siteUrl = import.meta.env.VITE_SITE_URL || 'http://localhost:5174';
    
    const blogBreadcrumbs = {
        '@context': 'https://schema.org',
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
                'name': 'Blog',
                'item': `${siteUrl}/blogs`
            }
        ]
    };

    return (
        <PublicLayout>
            <SEO 
                title={`Articles Feed - Page ${page}`}
                description="Explore all published articles, guides, and tutorials sorted by publication date."
                canonicalUrl={page > 1 ? `${siteUrl}/blogs?page=${page}` : `${siteUrl}/blogs`}
                schemaJson={blogBreadcrumbs}
            />
            <div className="max-w-7xl mx-auto px-4 py-6">
                <div className="flex justify-center mb-6">
                    <AdSlot slotName="top_leaderboard" className="w-full max-w-3xl" />
                </div>

                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">All Posts</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{total} articles published</p>
                </div>

                <div className="flex gap-6">
                    <div className="flex-1 min-w-0 space-y-6">
                        {loading ? (
                            <div className="space-y-4">
                                {[...Array(4)].map((_, i) => (
                                    <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
                                ))}
                            </div>
                        ) : posts.length === 0 ? (
                            <p className="text-gray-500 text-center py-12">No posts found.</p>
                        ) : (
                            <div className="space-y-4">
                                {posts.map(post => (
                                    <PostCard key={post.id} post={post} variant="horizontal" />
                                ))}
                            </div>
                        )}
                        <div className="flex justify-center">
                            <AdSlot slotName="in_content_2" className="w-full" />
                        </div>
                        <Pagination currentPage={page} totalPages={totalPages} onPageChange={p => { setPage(p); window.scrollTo(0, 0); }} />
                    </div>
                    <div className="hidden lg:block w-72 flex-shrink-0">
                        <Sidebar />
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
}
