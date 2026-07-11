import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import type { Post, Category } from '../../lib/types';
import PublicLayout from '../../components/layout/PublicLayout';
import Sidebar from '../../components/layout/Sidebar';
import AdSlot from '../../components/ui/AdSlot';
import PostCard from '../../components/ui/PostCard';
import CategoryCard from '../../components/ui/CategoryCard';
import SEO from '../../components/common/SEO';

export default function HomePage() {
  const [featuredPost, setFeaturedPost] = useState<Post | null>(null);
  const [recentPosts, setRecentPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);

      // 1. Fetch featured post
      let featPost: Post | null = null;
      const { data: featData } = await supabase
        .from('posts')
        .select('*, category:categories(*)')
        .eq('status', 'published')
        .eq('featured', true)
        .order('published_at', { ascending: false })
        .limit(1);

      if (featData && featData.length > 0) {
        featPost = featData[0] as Post;
      } else {
        // Fallback: get the latest published post
        const { data: latestData } = await supabase
          .from('posts')
          .select('*, category:categories(*)')
          .eq('status', 'published')
          .order('published_at', { ascending: false })
          .limit(1);
        if (latestData && latestData.length > 0) {
          featPost = latestData[0] as Post;
        }
      }
      setFeaturedPost(featPost);

      // 2. Fetch recent posts (exclude featured post if any)
      let recentQuery = supabase
        .from('posts')
        .select('*, category:categories(*)')
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .limit(6);

      if (featPost) {
        recentQuery = recentQuery.neq('id', featPost.id);
      }

      const { data: recentData } = await recentQuery;
      setRecentPosts((recentData as Post[]) || []);

      // 3. Fetch categories and post counts
      const { data: cats } = await supabase.from('categories').select('*').order('name');
      if (cats) {
        const categoriesWithCounts = await Promise.all(
          cats.map(async (cat) => {
            const { count } = await supabase
              .from('posts')
              .select('id', { count: 'exact', head: true })
              .eq('category_id', cat.id)
              .eq('status', 'published');
            return {
              ...cat,
              post_count: count ?? 0,
            };
          })
        );
        setCategories(categoriesWithCounts);
      }

      setLoading(false);
    }

    loadData();
  }, []);

  const siteUrl = import.meta.env.VITE_SITE_URL || 'http://localhost:5174';
  const homepageSchema = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      'name': 'Blogify',
      'url': siteUrl,
      'potentialAction': {
        '@type': 'SearchAction',
        'target': `${siteUrl}/search?q={search_term_string}`,
        'query-input': 'required name=search_term_string'
      }
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      'name': 'Blogify',
      'url': siteUrl,
      'logo': `${siteUrl}/logo.png`,
      'sameAs': [
        'https://facebook.com/blogify',
        'https://twitter.com/blogify',
        'https://instagram.com/blogify'
      ]
    }
  ];

  return (
    <PublicLayout>
      <SEO 
        title="Premium Blog & Article CMS"
        description="Explore the latest stories, tutorials, and insights in technology, business, lifestyle, health, and travel on Blogify."
        schemaJson={homepageSchema}
      />
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-8">
        {/* Ad top */}
        <div className="flex justify-center">
          <AdSlot slotName="top_leaderboard" className="w-full max-w-3xl" />
        </div>

        {/* Featured / Hero Section */}
        {!loading && featuredPost && (
          <div className="h-[300px] sm:h-[400px] lg:h-[450px]">
            <PostCard post={featuredPost} variant="featured" />
          </div>
        )}

        {/* Categories Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">Explore Categories</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
            {loading ? (
              [...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
              ))
            ) : (
              categories.map((cat) => <CategoryCard key={cat.id} category={cat} />)
            )}
          </div>
        </div>

        {/* Main Grid */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Recent Posts Column */}
          <div className="flex-1 min-w-0 space-y-6">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">Recent Articles</h2>

            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : recentPosts.length === 0 ? (
              <p className="text-gray-500 py-12 text-center">No posts found.</p>
            ) : (
              <div className="space-y-4">
                {recentPosts.map((post) => (
                  <PostCard key={post.id} post={post} variant="horizontal" />
                ))}
              </div>
            )}

            {/* In-content Ad */}
            <div className="flex justify-center py-4">
              <AdSlot slotName="in_content_1" className="w-full" />
            </div>
          </div>

          {/* Sidebar Column */}
          <div className="w-full lg:w-80 flex-shrink-0">
            <Sidebar />
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
