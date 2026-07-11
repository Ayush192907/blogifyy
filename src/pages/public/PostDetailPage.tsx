import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, Clock, User, ChevronRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Post } from '../../lib/types';
import { formatDate } from '../../lib/utils';
import PublicLayout from '../../components/layout/PublicLayout';
import Sidebar from '../../components/layout/Sidebar';
import AdSlot from '../../components/ui/AdSlot';
import PostCard from '../../components/ui/PostCard';
import SocialShare from '../../components/ui/SocialShare';
import SEO from '../../components/common/SEO';

export default function PostDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const incrementedView = useRef(false);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    incrementedView.current = false;

    // Fetch the post
    supabase
      .from('posts')
      .select('*, category:categories(*)')
      .eq('slug', slug)
      .eq('status', 'published')
      .single()
      .then(({ data }) => {
        const foundPost = data as Post | null;
        setPost(foundPost);
        setLoading(false);

        if (foundPost) {
          // Increment views
          if (!incrementedView.current) {
            supabase
              .from('posts')
              .update({ views: (foundPost.views || 0) + 1 })
              .eq('id', foundPost.id)
              .then(() => {
                incrementedView.current = true;
              });
          }

          // Fetch related posts (same category, different id)
          if (foundPost.category_id) {
            supabase
              .from('posts')
              .select('*, category:categories(*)')
              .eq('status', 'published')
              .eq('category_id', foundPost.category_id)
              .neq('id', foundPost.id)
              .order('published_at', { ascending: false })
              .limit(3)
              .then(({ data }) => {
                setRelatedPosts((data as Post[]) || []);
              });
          }
        }
      });
  }, [slug]);

  const siteUrl = import.meta.env.VITE_SITE_URL || 'http://localhost:5174';
  const postSchema = post ? [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      'headline': post.title,
      'description': post.meta_description || post.excerpt || post.title,
      'image': post.featured_image ? [post.featured_image] : [],
      'datePublished': post.published_at || post.created_at,
      'dateModified': post.updated_at || post.published_at || post.created_at,
      'author': {
        '@type': 'Person',
        'name': post.author || 'Admin'
      },
      'publisher': {
        '@type': 'Organization',
        'name': 'Blogify',
        'logo': {
          '@type': 'ImageObject',
          'url': `${siteUrl}/logo.png`
        }
      }
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      'itemListElement': [
        {
          '@type': 'ListItem',
          'position': 1,
          'name': 'Home',
          'item': siteUrl
        },
        ...(post.category ? [{
          '@type': 'ListItem',
          'position': 2,
          'name': post.category.name,
          'item': `${siteUrl}/category/${post.category.slug}`
        }] : []),
        {
          '@type': 'ListItem',
          'position': post.category ? 3 : 2,
          'name': post.title,
          'item': `${siteUrl}/blogs/${post.slug}`
        }
      ]
    }
  ] : undefined;

  return (
    <PublicLayout>
      {post && (
        <SEO 
          title={post.title}
          description={post.meta_description || post.excerpt || undefined}
          ogImage={post.featured_image || undefined}
          ogType="article"
          schemaJson={postSchema}
        />
      )}
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Ad slot */}
        <div className="flex justify-center">
          <AdSlot slotName="top_leaderboard" className="w-full max-w-3xl" />
        </div>

        {loading ? (
          <div className="flex gap-8">
            <div className="flex-1 space-y-4">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 animate-pulse" />
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-2/3 animate-pulse" />
              <div className="h-[300px] bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full animate-pulse" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6 animate-pulse" />
            </div>
            <div className="hidden lg:block w-80 h-96 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
          </div>
        ) : !post ? (
          <div className="text-center py-16">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Article Not Found</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-2">The post you are looking for does not exist or has been removed.</p>
            <Link to="/" className="inline-block mt-4 text-blue-600 font-semibold hover:underline">Go back home</Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Main Content Column */}
            <article className="flex-1 min-w-0 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-5 sm:p-8 space-y-6 shadow-sm">
              {/* Breadcrumb */}
              <nav className="flex items-center gap-1 text-xs text-gray-400">
                <Link to="/" className="hover:text-blue-600">Home</Link>
                <ChevronRight size={12} />
                {post.category && (
                  <>
                    <Link to={`/category/${post.category.slug}`} className="hover:text-blue-600">
                      {post.category.name}
                    </Link>
                    <ChevronRight size={12} />
                  </>
                )}
                <span className="text-gray-600 dark:text-gray-400 line-clamp-1">{post.title}</span>
              </nav>

              {/* Title & Metadata */}
              <div className="space-y-3">
                {post.category && (
                  <Link
                    to={`/category/${post.category.slug}`}
                    className="inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full"
                    style={{ backgroundColor: post.category.color + '1A', color: post.category.color }}
                  >
                    {post.category.name}
                  </Link>
                )}
                <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white leading-tight">
                  {post.title}
                </h1>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-gray-500 dark:text-gray-400">
                  <span className="flex items-center gap-1"><User size={12} />{post.author}</span>
                  <span className="flex items-center gap-1">
                    <Calendar size={12} />
                    {post.published_at ? formatDate(post.published_at) : formatDate(post.created_at)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={12} />
                    {post.reading_time || 1} min read
                  </span>
                  <span>•</span>
                  <span>{post.views || 0} views</span>
                </div>
              </div>

              {/* Featured Image */}
              {post.featured_image && (
                <div className="w-full h-80 sm:h-96 rounded-xl overflow-hidden shadow-sm">
                  <img src={post.featured_image} alt={post.title} className="w-full h-full object-cover" />
                </div>
              )}

              {/* HTML Content */}
              <div
                className="prose dark:prose-invert max-w-none prose-sm sm:prose-base dark:text-gray-300 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: post.content || '' }}
              />

              {/* Social Share */}
              <div className="border-t border-b border-gray-100 dark:border-gray-700 py-4 flex flex-wrap items-center justify-between gap-4">
                <SocialShare title={post.title} />
              </div>

              {/* Related Posts */}
              {relatedPosts.length > 0 && (
                <div className="space-y-4 pt-4">
                  <h3 className="font-bold text-gray-800 dark:text-white text-lg">Related Articles</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {relatedPosts.map((related) => (
                      <PostCard key={related.id} post={related} variant="compact" />
                    ))}
                  </div>
                </div>
              )}
            </article>

            {/* Sidebar Column */}
            <div className="w-full lg:w-80 flex-shrink-0">
              <Sidebar />
            </div>
          </div>
        )}
      </div>
    </PublicLayout>
  );
}
