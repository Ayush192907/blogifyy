-- 1. Categories Table
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  icon TEXT NOT NULL DEFAULT 'Tag',
  description TEXT,
  color TEXT NOT NULL DEFAULT '#2563eb',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Posts Table
CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT,
  content TEXT,
  featured_image TEXT,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  author TEXT NOT NULL DEFAULT 'Admin',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  featured BOOLEAN NOT NULL DEFAULT false,
  popular BOOLEAN NOT NULL DEFAULT false,
  reading_time INTEGER NOT NULL DEFAULT 1,
  meta_title TEXT,
  meta_description TEXT,
  meta_keywords TEXT,
  views INTEGER NOT NULL DEFAULT 0,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Pages Table
CREATE TABLE IF NOT EXISTS pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT,
  meta_title TEXT,
  meta_description TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  show_in_menu BOOLEAN NOT NULL DEFAULT false,
  menu_label TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Ads Table
CREATE TABLE IF NOT EXISTS ads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slot_name TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  code TEXT,
  enabled BOOLEAN NOT NULL DEFAULT true,
  width INTEGER,
  height INTEGER,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Newsletter Subscribers Table
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Contact Messages Table
CREATE TABLE IF NOT EXISTS contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. Site Settings Table
CREATE TABLE IF NOT EXISTS site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  value TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 8. Navigation Menu Items Table
CREATE TABLE IF NOT EXISTS nav_menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label TEXT NOT NULL,
  url TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- CLEAN UP EXISTING DATA TO PREVENT DUPLICATES ON RE-RUN
TRUNCATE TABLE posts, categories, pages, ads, site_settings, nav_menu_items, contact_messages, newsletter_subscribers RESTART IDENTITY CASCADE;

-- SEED DATA

-- Seed Categories with Fixed UUIDs
INSERT INTO categories (id, name, slug, icon, color, description) VALUES
('1a1a1a1a-1a1a-1a1a-1a1a-1a1a1a1a1a1a', 'Technology', 'technology', 'Cpu', '#2563eb', 'Latest in tech, software development, AI, and hardware gadgets.'),
('2b2b2b2b-2b2b-2b2b-2b2b-2b2b2b2b2b2b', 'Business', 'business', 'Briefcase', '#10b981', 'Finance, business scaling strategies, startups and market trends.'),
('3c3c3c3c-3c3c-3c3c-3c3c-3c3c3c3c3c3c', 'Lifestyle', 'lifestyle', 'Coffee', '#f59e0b', 'Daily routines, health, inspiration, self-improvement, and productivity.'),
('4d4d4d4d-4d4d-4d4d-4d4d-4d4d4d4d4d4d', 'Travel', 'travel', 'Plane', '#3b82f6', 'Travel stories, budget guides, destination highlights, and vacation tips.'),
('5e5e5e5e-5e5e-5e5e-5e5e-5e5e5e5e5e5e', 'Health', 'health', 'Heart', '#ef4444', 'Medical tips, diet reviews, gym routines, and mental wellness details.');

-- Seed Default Site Settings
INSERT INTO site_settings (key, value) VALUES
('site_name', 'Blogify'),
('site_description', 'A premium modern Blog CMS built with React, Vite, Tailwind and Supabase.'),
('logo_url', ''),
('favicon_url', ''),
('footer_about', 'Blogify is a state-of-the-art blog platform for sharing insights, tutorials and modern ideas with readers globally.'),
('social_facebook', 'https://facebook.com'),
('social_twitter', 'https://twitter.com'),
('social_instagram', 'https://instagram.com'),
('social_linkedin', 'https://linkedin.com'),
('social_youtube', 'https://youtube.com');

-- Seed Default Ads
INSERT INTO ads (slot_name, label, enabled, width, height) VALUES
('top_leaderboard', 'Top Leaderboard Ad', true, 728, 90),
('sidebar_1', 'Sidebar Rectangle Ad', true, 300, 250),
('sidebar_2', 'Sidebar Half-Page Ad', true, 300, 600),
('in_content_1', 'Mid-article Ad 1', true, 728, 90),
('in_content_2', 'Mid-article Ad 2', true, 728, 90),
('footer_ad', 'Footer Leaderboard Ad', true, 728, 90);

-- Seed Default Nav Items
INSERT INTO nav_menu_items (label, url, sort_order, enabled) VALUES
('Home', '/', 1, true),
('Blogs', '/blog', 2, true),
('About Us', '/about', 3, true),
('Contact', '/contact', 4, true);

-- Seed Demo Static Pages
INSERT INTO pages (title, slug, content, status, show_in_menu, menu_label) VALUES
('About Us', 'about', '<p>Welcome to our Blog CMS! We are dedicated to providing the best content on technology, lifestyle, and business. Start browsing now.</p>', 'published', true, 'About'),
('Privacy Policy', 'privacy-policy', '<p>We take your privacy seriously. Your data is never sold or shared with any third-party services.</p>', 'published', false, NULL),
('Disclaimer', 'disclaimer', '<p>The content presented on this website is for informational purposes only.</p>', 'published', false, NULL),
('Terms & Conditions', 'terms-and-conditions', '<p>By using this website, you agree to comply with and be bound by our terms and conditions.</p>', 'published', false, NULL);

-- Seed Demo Posts
INSERT INTO posts (title, slug, excerpt, content, featured_image, category_id, author, status, featured, popular, reading_time, views, published_at) VALUES
(
  'The Future of Generative AI in Software Development',
  'future-of-generative-ai-software-development',
  'How AI agents and LLMs are transforming writing code, testing applications, and designing system architectures.',
  '<h2>The Paradigm Shift in Coding</h2><p>Artificial Intelligence is no longer just a autocomplete tool. Modern LLMs and agentic workflows are taking over complex programming tasks, from full codebase migrations to automated test suite generation.</p><h3>Why Agentic Coding is the Future</h3><p>Unlike simple chat interfaces, agentic systems run in structured loops: analyzing requirements, writing code, executing builds, and self-correcting based on compiler errors.</p><p>As these tools evolve, the role of human developers is shifting from code authors to code architects and system reviewers.</p>',
  'https://images.unsplash.com/photo-1677442136019-21780efad99a?q=80&w=1200&auto=format&fit=crop',
  '1a1a1a1a-1a1a-1a1a-1a1a-1a1a1a1a1a1a',
  'Admin',
  'published',
  true,
  false,
  4,
  148,
  now() - interval '2 days'
),
(
  '10 Essential Strategies for Startup Scaling in 2026',
  '10-strategies-startup-scaling-2026',
  'Key insights on venture capital funding, organic growth hacks, and finding product-market fit in a competitive landscape.',
  '<h2>Smart Scaling Over Rapid Scaling</h2><p>The era of growth-at-all-costs is over. Startups today succeed by achieving high margins, customer retention, and organic distribution loops.</p><h3>Key Growth Strategies</h3><ul><li>Prioritize unit economics from day one.</li><li>Build product-led growth (PLG) distribution loops.</li><li>Leverage AI tools to keep overhead lean.</li></ul>',
  'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1200&auto=format&fit=crop',
  '2b2b2b2b-2b2b-2b2b-2b2b-2b2b2b2b2b2b',
  'Admin',
  'published',
  false,
  true,
  3,
  95,
  now() - interval '5 days'
),
(
  'Hidden Gems to Visit in Kyoto, Japan',
  'hidden-gems-visit-kyoto-japan',
  'Discover quiet temples, local tea houses, and scenic bamboo paths away from the crowds.',
  '<h2>Kyoto Beyond the Crowds</h2><p>While Kinkaku-ji and Fushimi Inari are spectacular, Kyoto is full of lesser-known temples and moss gardens that offer absolute tranquility.</p><h3>Top Recommendations</h3><p>Visit Giou-ji, a tiny forest temple in Arashiyama, or stroll along the Philosopher''s Path early in the morning before tourists arrive.</p>',
  'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=1200&auto=format&fit=crop',
  '4d4d4d4d-4d4d-4d4d-4d4d-4d4d4d4d4d4d',
  'Admin',
  'published',
  false,
  false,
  5,
  42,
  now() - interval '7 days'
),
(
  'Building a Perfect Morning Routine for Peak Productivity',
  'perfect-morning-routine-peak-productivity',
  'How small daily habits like journaling, hydration, and exercise set up your day for success.',
  '<h2>Win the Morning, Win the Day</h2><p>Your morning routine sets the tone for your entire cognitive performance. Successful people design their first 60 minutes with intention.</p><h3>Core Habits</h3><p>Hydrate immediately, avoid checking your phone for the first 30 minutes, practice mindfulness, and plan your top three priorities for the day.</p>',
  'https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=1200&auto=format&fit=crop',
  '3c3c3c3c-3c3c-3c3c-3c3c-3c3c3c3c3c3c',
  'Admin',
  'published',
  false,
  true,
  2,
  210,
  now() - interval '1 day'
),
(
  'The Science-Backed Benefits of Intermittent Fasting',
  'science-backed-benefits-intermittent-fasting',
  'Understanding the cellular mechanisms, weight loss impact, and longevity benefits of fasting.',
  '<h2>What Happens During Fasting?</h2><p>When you fast, your insulin levels drop, human growth hormone (HGH) levels increase, and your cells initiate cellular repair processes (autophagy).</p><p>These mechanisms help reduce inflammation, improve heart health, and promote brain health and longevity.</p>',
  'https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=1200&auto=format&fit=crop',
  '5e5e5e5e-5e5e-5e5e-5e5e-5e5e5e5e5e5e',
  'Admin',
  'published',
  false,
  false,
  4,
  76,
  now() - interval '10 days'
);

-- ==========================================
-- MIGRATION: HEADER & FOOTER VISIBILITY MANAGEMENT
-- Run these statements in your Supabase SQL Editor to update your tables
-- ==========================================

-- 1. Update pages table
ALTER TABLE pages ADD COLUMN IF NOT EXISTS show_in_header BOOLEAN DEFAULT false;
ALTER TABLE pages ADD COLUMN IF NOT EXISTS show_in_footer BOOLEAN DEFAULT false;
ALTER TABLE pages ADD COLUMN IF NOT EXISTS header_label TEXT;
ALTER TABLE pages ADD COLUMN IF NOT EXISTS footer_label TEXT;
ALTER TABLE pages ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;
ALTER TABLE pages ADD COLUMN IF NOT EXISTS enabled BOOLEAN DEFAULT true;

-- 2. Update categories table
ALTER TABLE categories ADD COLUMN IF NOT EXISTS show_in_header BOOLEAN DEFAULT true;
ALTER TABLE categories ADD COLUMN IF NOT EXISTS show_in_footer BOOLEAN DEFAULT true;
ALTER TABLE categories ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;
ALTER TABLE categories ADD COLUMN IF NOT EXISTS enabled BOOLEAN DEFAULT true;

