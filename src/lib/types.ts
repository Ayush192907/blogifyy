export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string | null;
  color: string;
  created_at: string;
  post_count?: number;
  show_in_header?: boolean;
  show_in_footer?: boolean;
  sort_order?: number;
  enabled?: boolean;
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  featured_image: string | null;
  category_id: string | null;
  category?: Category;
  author: string;
  status: 'draft' | 'published';
  featured: boolean;
  popular: boolean;
  reading_time: number;
  meta_title: string | null;
  meta_description: string | null;
  meta_keywords: string | null;
  views: number;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Page {
  id: string;
  title: string;
  slug: string;
  content: string | null;
  meta_title: string | null;
  meta_description: string | null;
  status: 'draft' | 'published';
  show_in_menu: boolean;
  menu_label: string | null;
  created_at: string;
  updated_at: string;
  show_in_header?: boolean;
  show_in_footer?: boolean;
  header_label?: string | null;
  footer_label?: string | null;
  sort_order?: number;
  enabled?: boolean;
}

export interface Ad {
  id: string;
  slot_name: string;
  label: string;
  code: string;
  enabled: boolean;
  width: number | null;
  height: number | null;
  created_at: string;
  updated_at: string;
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  active: boolean;
  created_at: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  read: boolean;
  created_at: string;
}

export interface SiteSetting {
  id: string;
  key: string;
  value: string | null;
  updated_at: string;
}

export interface NavMenuItem {
  id: string;
  label: string;
  url: string;
  sort_order: number;
  enabled: boolean;
  created_at: string;
}
