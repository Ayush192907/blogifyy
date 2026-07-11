import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import type { Post, Category } from '../../lib/types';
import AdSlot from '../ui/AdSlot';
import NewsletterBox from '../ui/NewsletterBox';
import PostCard from '../ui/PostCard';

export default function Sidebar() {
    const [popularPosts, setPopularPosts] = useState<Post[]>([]);
    const [categories, setCategories] = useState<(Category & { post_count: number })[]>([]);

    useEffect(() => {
        supabase
            .from('posts')
            .select('*, category:categories(*)')
            .eq('status', 'published')
            .eq('popular', true)
            .order('published_at', { ascending: false })
            .limit(4)
            .then(({ data }) => setPopularPosts((data as Post[]) || []));

        supabase
            .from('categories')
            .select('*')
            .then(async ({ data: cats }) => {
                if (!cats) return;
                const counts = await Promise.all(
                    cats.map(cat =>
                        supabase
                            .from('posts')
                            .select('id', { count: 'exact', head: true })
                            .eq('category_id', cat.id)
                            .eq('status', 'published')
                            .then(({ count }) => ({ ...cat, post_count: count ?? 0 }))
                    )
                );
                setCategories(counts);
            });
    }, []);

    return (
        <aside className="w-full space-y-5">
            <AdSlot slotName="sidebar_1" />
            <NewsletterBox />

            {/* Popular Posts */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-5">
                <h3 className="font-bold text-gray-800 dark:text-gray-100 text-sm mb-3 pb-2 border-b border-gray-100 dark:border-gray-700">
                    Popular Posts
                </h3>
                <div>
                    {popularPosts.map(post => (
                        <PostCard key={post.id} post={post} variant="sidebar" />
                    ))}
                </div>
            </div>

            <AdSlot slotName="sidebar_2" />

            {/* Categories */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-5">
                <h3 className="font-bold text-gray-800 dark:text-gray-100 text-sm mb-3 pb-2 border-b border-gray-100 dark:border-gray-700">
                    Categories
                </h3>
                <ul className="space-y-1">
                    {categories.map(cat => (
                        <li key={cat.id}>
                            <Link
                                to={`/category/${cat.slug}`}
                                className="flex items-center justify-between py-1.5 text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors group"
                            >
                                <span className="group-hover:translate-x-0.5 transition-transform">{cat.name}</span>
                                <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded-full">
                                    {cat.post_count}
                                </span>
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
        </aside>
    );
}
