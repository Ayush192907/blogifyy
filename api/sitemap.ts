import { createClient } from '@supabase/supabase-js';
import type { IncomingMessage, ServerResponse } from 'http';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL!;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY!;

// Priority order for resolving the site URL at runtime on Vercel:
// 1. VITE_SITE_URL   – your explicit override set in Vercel dashboard
// 2. VERCEL_PROJECT_PRODUCTION_URL – auto-set by Vercel to the primary production domain
// 3. VERCEL_URL      – auto-set by Vercel to the deployment URL (may be preview URL)
// 4. localhost fallback for local dev
const SITE_URL = (
  process.env.VITE_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : '') ||
  (process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : '') ||
  'http://localhost:5174'
).replace(/\/$/, '');

function escapeXml(str: string): string {
  return str.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<':  return '&lt;';
      case '>':  return '&gt;';
      case '&':  return '&amp;';
      case "'":  return '&apos;';
      case '"':  return '&quot;';
      default:   return c;
    }
  });
}

function formatDate(d?: string | null): string {
  try {
    return new Date(d || Date.now()).toISOString().split('T')[0];
  } catch {
    return new Date().toISOString().split('T')[0];
  }
}

function urlEntry(
  loc: string,
  lastmod: string,
  changefreq: string,
  priority: string,
  image?: { loc: string; title: string } | null,
): string {
  let e = `  <url>
    <loc>${escapeXml(loc)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>`;

  if (image) {
    e += `
    <image:image>
      <image:loc>${escapeXml(image.loc)}</image:loc>
      <image:title>${escapeXml(image.title)}</image:title>
    </image:image>`;
  }

  return e + '\n  </url>';
}

export default async function handler(_req: IncomingMessage, res: ServerResponse) {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Supabase environment variables are not configured.');
    return;
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  const today = new Date().toISOString().split('T')[0];
  const entries: string[] = [];

  // ── Static routes ─────────────────────────────────────────────────────────────
  entries.push(
    urlEntry(`${SITE_URL}/`,        today, 'daily',   '1.0'),
    urlEntry(`${SITE_URL}/blogs`,   today, 'daily',   '0.9'),
    urlEntry(`${SITE_URL}/contact`, today, 'monthly', '0.5'),
    urlEntry(`${SITE_URL}/search`,  today, 'monthly', '0.3'),
  );

  // ── Published posts ───────────────────────────────────────────────────────────
  try {
    const { data: posts } = await supabase
      .from('posts')
      .select('slug, title, featured_image, updated_at, created_at')
      .eq('status', 'published');

    for (const p of posts ?? []) {
      entries.push(
        urlEntry(
          `${SITE_URL}/blogs/${p.slug}`,
          formatDate(p.updated_at || p.created_at),
          'weekly',
          '0.8',
          p.featured_image ? { loc: p.featured_image, title: p.title } : null,
        ),
      );
    }
  } catch (err) {
    console.error('sitemap: posts fetch failed', err);
  }

  // ── Categories ────────────────────────────────────────────────────────────────
  try {
    const { data: cats } = await supabase
      .from('categories')
      .select('slug, updated_at, created_at')
      .neq('enabled', false);

    for (const c of cats ?? []) {
      entries.push(
        urlEntry(
          `${SITE_URL}/category/${c.slug}`,
          formatDate(c.updated_at || c.created_at),
          'weekly',
          '0.7',
        ),
      );
    }
  } catch (err) {
    console.error('sitemap: categories fetch failed', err);
  }

  // ── Published pages ───────────────────────────────────────────────────────────
  try {
    const { data: pages } = await supabase
      .from('pages')
      .select('slug, updated_at, created_at')
      .eq('status', 'published')
      .neq('enabled', false);

    for (const p of pages ?? []) {
      entries.push(
        urlEntry(
          `${SITE_URL}/${p.slug}`,
          formatDate(p.updated_at || p.created_at),
          'monthly',
          '0.6',
        ),
      );
    }
  } catch (err) {
    console.error('sitemap: pages fetch failed', err);
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${entries.join('\n')}
</urlset>`;

  res.writeHead(200, {
    'Content-Type': 'application/xml; charset=utf-8',
    // Cache 1 h on CDN, serve stale up to 24 h while regenerating
    'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
  });
  res.end(xml);
}
