import { Link } from 'react-router-dom';
import { Calendar, Clock, User } from 'lucide-react';
import type { Post } from '../../lib/types';
import { formatDate } from '../../lib/utils';

interface PostCardProps {
  post: Post;
  variant?: 'featured' | 'horizontal' | 'compact' | 'sidebar';
}

export default function PostCard({ post, variant = 'horizontal' }: PostCardProps) {
  const categoryName = post.category?.name;
  const categorySlug = post.category?.slug;

  if (variant === 'featured') {
    return (
      <Link to={`/blogs/${post.slug}`} className="group block relative h-full rounded-xl overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={post.featured_image || 'https://images.pexels.com/photos/1591373/pexels-photo-1591373.jpeg?auto=compress&cs=tinysrgb&w=800'}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        </div>
        <div className="relative h-full flex flex-col justify-end p-6">
          <span className="inline-block bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full mb-3 w-fit">
            FEATURED
          </span>
          <h2 className="text-white text-2xl font-bold leading-tight mb-2 group-hover:text-blue-200 transition-colors">
            {post.title}
          </h2>
          {post.excerpt && (
            <p className="text-gray-200 text-sm mb-3 line-clamp-2">{post.excerpt}</p>
          )}
          <div className="flex items-center gap-2 text-gray-300 text-xs">
            <User size={12} />
            <span>{post.author}</span>
            <span>•</span>
            <Calendar size={12} />
            <span>{post.published_at ? formatDate(post.published_at) : formatDate(post.created_at)}</span>
          </div>
        </div>
      </Link>
    );
  }

  if (variant === 'compact') {
    return (
      <Link to={`/blogs/${post.slug}`} className="group flex gap-3 items-start py-3 border-b border-gray-100 dark:border-gray-700 last:border-0">
        <div className="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden">
          <img
            src={post.featured_image || 'https://images.pexels.com/photos/1591373/pexels-photo-1591373.jpeg?auto=compress&cs=tinysrgb&w=800'}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {post.title}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {post.published_at ? formatDate(post.published_at) : formatDate(post.created_at)}
          </p>
        </div>
      </Link>
    );
  }

  if (variant === 'sidebar') {
    return (
      <Link to={`/blogs/${post.slug}`} className="group flex gap-3 items-start py-3 border-b border-gray-100 dark:border-gray-700 last:border-0">
        <div className="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden">
          <img
            src={post.featured_image || 'https://images.pexels.com/photos/1591373/pexels-photo-1591373.jpeg?auto=compress&cs=tinysrgb&w=800'}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 line-clamp-2 group-hover:text-blue-600 transition-colors leading-snug">
            {post.title}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {post.published_at ? formatDate(post.published_at) : formatDate(post.created_at)}
          </p>
        </div>
      </Link>
    );
  }

  // horizontal (default)
  return (
    <div className="group flex flex-col sm:flex-row gap-4 bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <Link to={`/blogs/${post.slug}`} className="w-full sm:w-44 flex-shrink-0">
        <img
          src={post.featured_image || 'https://images.pexels.com/photos/1591373/pexels-photo-1591373.jpeg?auto=compress&cs=tinysrgb&w=800'}
          alt={post.title}
          className="w-full h-48 sm:h-32 object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </Link>
      <div className="flex-1 p-4 sm:py-3 sm:pr-4 sm:pl-0 min-w-0">
        {categoryName && categorySlug && (
          <Link
            to={`/category/${categorySlug}`}
            className="inline-block text-xs font-semibold text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400 px-2 py-0.5 rounded-full mb-2 hover:bg-blue-100 transition-colors"
          >
            {categoryName}
          </Link>
        )}
        <Link to={`/blogs/${post.slug}`}>
          <h3 className="font-bold text-gray-800 dark:text-gray-100 text-base line-clamp-2 group-hover:text-blue-600 transition-colors leading-snug">
            {post.title}
          </h3>
        </Link>
        {post.excerpt && (
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 line-clamp-2">{post.excerpt}</p>
        )}
        <div className="flex items-center gap-3 text-xs text-gray-400 mt-2">
          <span className="flex items-center gap-1"><User size={11} />{post.author}</span>
          <span>•</span>
          <span>{post.published_at ? formatDate(post.published_at) : formatDate(post.created_at)}</span>
          <span>•</span>
          <span className="flex items-center gap-1"><Clock size={11} />{post.reading_time} min read</span>
        </div>
      </div>
    </div>
  );
}
