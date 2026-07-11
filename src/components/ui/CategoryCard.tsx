import { Link } from 'react-router-dom';
import { Cpu, Briefcase, Coffee, Plane, Heart, BookOpen, Layers, Tag } from 'lucide-react';
import type { Category } from '../../lib/types';

const ICONS: Record<string, React.ElementType> = {
  Cpu, Briefcase, Coffee, Plane, Heart, BookOpen, Layers, Tag,
};

interface CategoryCardProps {
  category: Category;
}

export default function CategoryCard({ category }: CategoryCardProps) {
  const Icon = ICONS[category.icon] ?? Layers;

  return (
    <Link
      to={`/category/${category.slug}`}
      className="group flex flex-col items-center gap-2 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md hover:border-blue-200 dark:hover:border-blue-700 transition-all"
    >
      <div
        className="w-12 h-12 rounded-full flex items-center justify-center"
        style={{ backgroundColor: category.color + '1A' }}
      >
        <Icon size={22} style={{ color: category.color }} />
      </div>
      <span className="text-sm font-semibold text-gray-700 dark:text-gray-200 group-hover:text-blue-600 transition-colors">
        {category.name}
      </span>
      <span className="text-xs text-gray-400 dark:text-gray-500">
        {category.post_count ?? 0} Posts
      </span>
    </Link>
  );
}
